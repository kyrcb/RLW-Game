require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const ip = require('ip'); // Used to get local network IP
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { EdgeTTS } = require('node-edge-tts');
const { storyData, gameIntroLore } = require('./storyData');
const minigameData = require('./minigameData');

// Initialize the ultra-realistic Azure Neural TTS Engine
const edgeTts = new EdgeTTS({ voice: 'fil-PH-AngeloNeural' });

const app = express();
app.use(cors());

// Premium Edge Neural TTS Proxy Route
app.get('/api/tts', async (req, res) => {
  const { text } = req.query;
  if (!text) return res.status(400).send('No text provided');
  
  try {
    const tempFile = path.join(os.tmpdir(), `tts_${crypto.randomUUID()}.mp3`);
    
    // Generate ultra-realistic speech to Temp
    await edgeTts.ttsPromise(text, tempFile);
    
    // Read buffer and instantly cleanup
    const buffer = fs.readFileSync(tempFile);
    fs.unlinkSync(tempFile);
    
    // Stream back to game
    res.set('Content-Type', 'audio/mpeg');
    res.send(buffer);
  } catch (error) {
    console.error('Edge TTS Error:', error);
    res.status(500).send('TTS Generation Failed');
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins for local dev
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;
const LOCAL_IP = ip.address(); // Get the local Wi-Fi IP address

// === GAME STATE ===
let gameState = {
  status: 'waiting', // waiting | active | consequence | minigame | ending
  players: [],       // list of player objects: { id, name, score }
  currentPhaseIndex: 0,
  votes: {},         // mapping of optionIndex -> voteCount
  votedPlayers: new Set(), // keep track of who has voted to prevent double voting
  consequenceText: '',     // text to show when answer is incorrect
  winningOptionIndex: -1,  // the option that won the vote
  wasCorrect: false,       // whether the winning vote was correct
  consequenceImagePath: '',// path to the specific consequence image
  cutsceneText: '',        // text to show during a cutscene
  minigameResolved: false,
  minigameWinnerName: null
};

/**
 * Build the payload to broadcast to all clients.
 * Includes current phase data from storyData so clients don't need the data themselves.
 */
function buildBroadcastPayload() {
  const phase = storyData[gameState.currentPhaseIndex] || null;
  return {
    status: gameState.status,
    players: gameState.players,
    currentPhaseIndex: gameState.currentPhaseIndex,
    totalPhases: storyData.length,
    votes: gameState.votes,
    votedCount: gameState.votedPlayers.size,
    consequenceText: gameState.consequenceText,
    cutsceneText: gameState.cutsceneText,
    winningOptionIndex: gameState.winningOptionIndex,
    wasCorrect: gameState.wasCorrect,
    consequenceImagePath: gameState.consequenceImagePath,
    minigameResolved: gameState.minigameResolved,
    minigameWinnerName: gameState.minigameWinnerName,
    currentMinigame: minigameData[gameState.currentPhaseIndex] || null,
    currentPhase: phase ? {
      phase: phase.phase,
      scenario: phase.scenario,
      question: phase.question,
      options: phase.options
    } : null
  };
}

/**
 * Reset votes for a new round.
 */
function resetVotes() {
  gameState.votes = {};
  gameState.votedPlayers = new Set();
  gameState.winningOptionIndex = -1;
  gameState.wasCorrect = false;
  gameState.consequenceText = '';
  gameState.consequenceImagePath = '';
}

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Send initial data to newly connected client
  socket.emit('init_data', {
    gameUrl: `http://${LOCAL_IP}:5173`,
    ...buildBroadcastPayload()
  });

  // 1. join_game: payload: { playerName }
  socket.on('join_game', ({ playerName }) => {
    // Prevent duplicate joins
    const existing = gameState.players.find(p => p.id === socket.id);
    if (existing) return;

    gameState.players.push({ id: socket.id, name: playerName, score: 0 });
    console.log(`${playerName} joined the game (${gameState.players.length} players)`);

    // Broadcast updated state to ALL clients
    io.emit('update_game_state', buildBroadcastPayload());
  });

  // 2. start_game: no payload
  socket.on('start_game', () => {
    if (gameState.players.length === 0) return; // Need at least 1 player

    gameState.status = 'cutscene';
    gameState.cutsceneText = gameIntroLore;
    gameState.currentPhaseIndex = 0;
    gameState.minigameResolved = false;
    gameState.minigameWinnerName = null;
    gameState.players.forEach(p => p.score = 0);
    resetVotes();

    console.log('Game started! Showing intro cutscene.');
    io.emit('update_game_state', buildBroadcastPayload());
  });

  // 3. submit_vote: payload: { optionIndex }
  socket.on('submit_vote', ({ optionIndex }) => {
    // Only allow votes during active state
    if (gameState.status !== 'active') return;

    // Prevent double voting
    if (gameState.votedPlayers.has(socket.id)) return;

    // Only allow votes from actual players
    const isPlayer = gameState.players.some(p => p.id === socket.id);
    if (!isPlayer) return;

    // Record the vote
    gameState.votes[optionIndex] = (gameState.votes[optionIndex] || 0) + 1;
    gameState.votedPlayers.add(socket.id);

    console.log(`Vote received from ${socket.id}: option ${optionIndex} (${gameState.votedPlayers.size}/${gameState.players.length})`);

    // Check if all players have voted
    if (gameState.votedPlayers.size >= gameState.players.length) {
      // Calculate winning option (highest vote count)
      let maxVotes = 0;
      let winningOption = 0;
      for (const [optIdx, count] of Object.entries(gameState.votes)) {
        if (count > maxVotes) {
          maxVotes = count;
          winningOption = parseInt(optIdx);
        }
      }

      gameState.winningOptionIndex = winningOption;

      const currentPhase = storyData[gameState.currentPhaseIndex];
      const isCorrect = winningOption === currentPhase.correctOptionIndex;
      gameState.wasCorrect = isCorrect;
      
      const outcome = currentPhase.consequences[winningOption];
      gameState.consequenceText = outcome.text;
      gameState.consequenceImagePath = outcome.imagePath;

      if (isCorrect) {
        // Always show consequence (which leads to minigame) — ending is handled after the last minigame
        gameState.status = 'consequence';
        console.log(`Correct on phase ${gameState.currentPhaseIndex}! Showing explanation.`);
      } else {
        // Incorrect: show consequence
        gameState.status = 'consequence';
        console.log(`Incorrect. Showing consequence for phase ${currentPhase.phase}`);
      }
    }

    // Broadcast updated state (vote counts update in real-time)
    io.emit('update_game_state', buildBroadcastPayload());
  });

  // 4. submit_minigame_answer: Payload: { optionIndex }
  socket.on('submit_minigame_answer', ({ optionIndex }) => {
    if (gameState.status !== 'minigame' || gameState.minigameResolved) return;
    
    const currentMinigame = minigameData[gameState.currentPhaseIndex];
    if (optionIndex === currentMinigame.correctOptionIndex) {
      // Correct!
      gameState.minigameResolved = true;
      const player = gameState.players.find(p => p.id === socket.id);
      if (player) {
         player.score += 100;
         gameState.minigameWinnerName = player.name;
         console.log(`${player.name} won the minigame!`);
      }
      io.emit('update_game_state', buildBroadcastPayload());
    } else {
      socket.emit('minigame_wrong_answer');
    }
  });

  // 5. proceed: Triggered by Host to advance past consequence screen, cutscene, or minigame
  socket.on('proceed', () => {
    if (gameState.status === 'cutscene') {
      // Finished cutscene, go to active voting phase
      gameState.status = 'active';
      console.log(`Proceeding to active phase ${gameState.currentPhaseIndex}`);
      io.emit('update_game_state', buildBroadcastPayload());
    }
    else if (gameState.status === 'consequence') {
      if (gameState.wasCorrect) {
        // Was correct — advance to Minigame instead of next phase
        gameState.status = 'minigame';
        gameState.minigameResolved = false;
        gameState.minigameWinnerName = null;
      } else {
        // Was incorrect — replay the same phase
        gameState.status = 'active';
      }
      resetVotes();
      console.log(`Proceeding to status: ${gameState.status}`);
      io.emit('update_game_state', buildBroadcastPayload());
    }
    else if (gameState.status === 'minigame') {
      // Finished minigame — advance to next phase or ending
      if (gameState.currentPhaseIndex >= storyData.length - 1) {
        gameState.status = 'ending';
      } else {
        gameState.currentPhaseIndex++;
        gameState.status = 'cutscene';
        gameState.cutsceneText = storyData[gameState.currentPhaseIndex].phaseIntroLore;
      }
      console.log(`Proceeding from minigame to: ${gameState.status}`);
      io.emit('update_game_state', buildBroadcastPayload());
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const player = gameState.players.find(p => p.id === socket.id);
    if (player) {
      console.log(`${player.name} disconnected`);
      gameState.players = gameState.players.filter(p => p.id !== socket.id);
      gameState.votedPlayers.delete(socket.id);
      io.emit('update_game_state', buildBroadcastPayload());
    } else {
      console.log('A spectator disconnected:', socket.id);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🏛️  Rizal's Annotation Game — Server`);
  console.log(`   Server listening on port ${PORT}`);
  console.log(`   Game URL: http://${LOCAL_IP}:5173`);
  console.log(`   Players join at: http://${LOCAL_IP}:5173/join\n`);
});
