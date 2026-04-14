const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const ip = require('ip'); // Used to get local network IP
const storyData = require('./storyData');

const app = express();
app.use(cors());

// If we eventually serve the Vite build from Express:
// app.use(express.static('../client/dist'));

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
  status: 'waiting', // waiting | active | consequence | ending
  players: [],       // list of player objects: { id, name }
  currentPhaseIndex: 0,
  votes: {},         // mapping of optionIndex -> voteCount
  votedPlayers: new Set(), // keep track of who has voted to prevent double voting
  consequenceText: '',     // text to show when answer is incorrect
  winningOptionIndex: -1,  // the option that won the vote
  wasCorrect: false,       // whether the winning vote was correct
  consequenceImagePath: '' // path to the specific consequence image
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
    winningOptionIndex: gameState.winningOptionIndex,
    wasCorrect: gameState.wasCorrect,
    consequenceImagePath: gameState.consequenceImagePath,
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

    gameState.players.push({ id: socket.id, name: playerName });
    console.log(`${playerName} joined the game (${gameState.players.length} players)`);

    // Broadcast updated state to ALL clients
    io.emit('update_game_state', buildBroadcastPayload());
  });

  // 2. start_game: no payload
  socket.on('start_game', () => {
    if (gameState.players.length === 0) return; // Need at least 1 player

    gameState.status = 'active';
    gameState.currentPhaseIndex = 0;
    resetVotes();

    console.log('Game started!');
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
        // Correct: move to next phase or ending
        if (gameState.currentPhaseIndex >= storyData.length - 1) {
          gameState.status = 'ending';
          console.log('Game finished! Correct answer on final phase.');
        } else {
          // Show consequence screen even for correct — it contains the "why" explanation
          gameState.status = 'consequence';
          console.log(`Correct! Showing explanation before advancing.`);
        }
      } else {
        // Incorrect: show consequence
        gameState.status = 'consequence';
        console.log(`Incorrect. Showing consequence for phase ${currentPhase.phase}`);
      }
    }

    // Broadcast updated state (vote counts update in real-time)
    io.emit('update_game_state', buildBroadcastPayload());
  });

  // 4. proceed: Triggered by Host to advance past consequence screen
  socket.on('proceed', () => {
    if (gameState.status === 'consequence') {
      if (gameState.wasCorrect) {
        // Was correct — advance to next phase
        if (gameState.currentPhaseIndex >= storyData.length - 1) {
          gameState.status = 'ending';
        } else {
          gameState.currentPhaseIndex++;
          gameState.status = 'active';
        }
      } else {
        // Was incorrect — replay the same phase
        gameState.status = 'active';
      }
      resetVotes();
      console.log(`Proceeding to phase ${gameState.currentPhaseIndex + 1}, status: ${gameState.status}`);
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
