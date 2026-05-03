require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const ip = require('ip');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { EdgeTTS } = require('node-edge-tts');
const { storyData, gameIntroLore, gameOutroLore } = require('./storyData');
const minigameData = require('./minigameData');

// === ENVIRONMENT ===
const PORT       = process.env.PORT       || 3000;
const CLIENT_URL = process.env.CLIENT_URL || '*';
const GAME_URL   = process.env.GAME_URL   || `http://${ip.address()}:5173`;

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // omit ambiguous 0/O, 1/I
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
const HOST_CODE = (process.env.HOST_CODE || generateCode()).toUpperCase();

// In-memory set of valid host session tokens (UUID strings).
// Cleared on server restart — host simply re-enters the code shown in the console.
const validHostTokens = new Set();

// TTS engines — Filipino for story narration, English for tutorial/mechanics
const edgeTtsFil = new EdgeTTS({ voice: 'fil-PH-AngeloNeural' });
const edgeTtsEn  = new EdgeTTS({ voice: 'en-GB-RyanNeural' });

const app = express();
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

// === HOST AUTH ROUTES ===

// POST /api/host-auth — validate code, return session token
app.post('/api/host-auth', (req, res) => {
  const submitted = (req.body.code || '').toUpperCase().trim();
  if (submitted !== HOST_CODE) {
    return res.status(401).json({ error: 'Invalid host code.' });
  }
  const token = crypto.randomUUID();
  validHostTokens.add(token);
  res.json({ token });
});

// GET /api/validate-token — check if an existing token is still valid
app.get('/api/validate-token', (req, res) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (token && validHostTokens.has(token)) {
    return res.json({ valid: true });
  }
  res.status(401).json({ valid: false });
});

// === TTS ROUTE ===
app.get('/api/tts', async (req, res) => {
  const { text, lang } = req.query;
  if (!text) return res.status(400).send('No text provided');

  try {
    const tts = lang === 'en' ? edgeTtsEn : edgeTtsFil;
    const tempFile = path.join(os.tmpdir(), `tts_${crypto.randomUUID()}.mp3`);
    await tts.ttsPromise(text, tempFile);
    const buffer = fs.readFileSync(tempFile);
    fs.unlinkSync(tempFile);
    res.set('Content-Type', 'audio/mpeg');
    res.send(buffer);
  } catch (error) {
    console.error('Edge TTS Error:', error);
    res.status(500).send('TTS Generation Failed');
  }
});

// === STATIC FRONTEND (production: Express serves the built React app) ===
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // Let React Router handle all non-API routes
  app.get('/{*path}', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST']
  }
});

// === GAME STATE ===
let gameState = {
  status: 'waiting', // waiting | cutscene | active | consequence | minigame_intro | minigame | outro | ending
  players: [],
  currentPhaseIndex: 0,
  votes: {},
  votedPlayers: new Set(),
  consequenceText: '',
  winningOptionIndex: -1,
  wasCorrect: false,
  consequenceImagePath: '',
  cutsceneText: '',
  minigameResolved: false,
  minigameWinnerName: null,
  relicWinners: [],
  minigameIntroSeen: false,
  readyAt: null  // epoch ms when player input becomes valid (null = no lock)
};

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
    relicWinners: gameState.relicWinners,
    readyAt: gameState.readyAt,
    currentMinigame: minigameData[gameState.currentPhaseIndex] || null,
    currentPhase: phase ? {
      phase: phase.phase,
      scenario: phase.scenario,
      question: phase.question,
      options: phase.options
    } : null
  };
}

function startReadyTimer() {
  gameState.readyAt = Date.now() + 5000;
}

function resetVotes() {
  gameState.votes = {};
  gameState.votedPlayers = new Set();
  gameState.winningOptionIndex = -1;
  gameState.wasCorrect = false;
  gameState.consequenceText = '';
  gameState.consequenceImagePath = '';
}

// === SOCKET.IO MIDDLEWARE — mark authenticated host sockets ===
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  socket.isHost = !!(token && validHostTokens.has(token));
  next(); // always allow connection; isHost flag controls game-control capabilities
});

io.on('connection', (socket) => {
  console.log(`${socket.isHost ? '[HOST]' : '[CLIENT]'} connected: ${socket.id}`);

  socket.emit('init_data', {
    gameUrl: GAME_URL,
    ...buildBroadcastPayload()
  });

  // 1. join_game: payload: { playerName }
  socket.on('join_game', ({ playerName }) => {
    const existing = gameState.players.find(p => p.id === socket.id);
    if (existing) return;

    gameState.players.push({ id: socket.id, name: playerName, score: 0 });
    console.log(`${playerName} joined the game (${gameState.players.length} players)`);
    io.emit('update_game_state', buildBroadcastPayload());
  });

  // stop_game: host only — returns to lobby, keeps players
  socket.on('stop_game', () => {
    if (!socket.isHost) return;
    gameState.status = 'waiting';
    gameState.currentPhaseIndex = 0;
    gameState.minigameResolved = false;
    gameState.minigameWinnerName = null;
    gameState.relicWinners = [];
    gameState.cutsceneText = '';
    gameState.players.forEach(p => p.score = 0);
    resetVotes();
    console.log('Host stopped the game. Returning to lobby.');
    io.emit('update_game_state', buildBroadcastPayload());
  });

  // 2. start_game: host only
  socket.on('start_game', () => {
    if (!socket.isHost) return;
    if (gameState.players.length === 0) return;

    gameState.status = 'cutscene';
    gameState.cutsceneText = gameIntroLore;
    gameState.currentPhaseIndex = 0;
    gameState.minigameResolved = false;
    gameState.minigameWinnerName = null;
    gameState.relicWinners = [];
    gameState.minigameIntroSeen = false;
    gameState.readyAt = null;
    gameState.players.forEach(p => p.score = 0);
    resetVotes();

    console.log('Game started! Showing intro cutscene.');
    io.emit('update_game_state', buildBroadcastPayload());
  });

  // 3. submit_vote: payload: { optionIndex }
  socket.on('submit_vote', ({ optionIndex }) => {
    if (gameState.status !== 'active') return;
    if (gameState.readyAt && Date.now() < gameState.readyAt) return; // reading window
    if (gameState.votedPlayers.has(socket.id)) return;
    const isPlayer = gameState.players.some(p => p.id === socket.id);
    if (!isPlayer) return;

    gameState.votes[optionIndex] = (gameState.votes[optionIndex] || 0) + 1;
    gameState.votedPlayers.add(socket.id);
    console.log(`Vote received from ${socket.id}: option ${optionIndex} (${gameState.votedPlayers.size}/${gameState.players.length})`);

    if (gameState.votedPlayers.size >= gameState.players.length) {
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

      // Always show consequence first (leads to minigame on correct; retry on incorrect)
      gameState.status = 'consequence';
      console.log(`${isCorrect ? 'Correct' : 'Incorrect'} on phase ${gameState.currentPhaseIndex}. Showing consequence.`);
    }

    io.emit('update_game_state', buildBroadcastPayload());
  });

  // 4. submit_minigame_answer: payload: { optionIndex }
  socket.on('submit_minigame_answer', ({ optionIndex }) => {
    if (gameState.status !== 'minigame' || gameState.minigameResolved) return;
    if (gameState.readyAt && Date.now() < gameState.readyAt) return; // reading window

    const currentMinigame = minigameData[gameState.currentPhaseIndex];
    if (optionIndex === currentMinigame.correctOptionIndex) {
      gameState.minigameResolved = true;
      const player = gameState.players.find(p => p.id === socket.id);
      if (player) {
        player.score += 100;
        gameState.minigameWinnerName = player.name;
        console.log(`${player.name} won the minigame!`);
      }
      gameState.relicWinners.push({
        topic: currentMinigame.topic,
        imagePath: currentMinigame.imagePath,
        winnerName: player ? player.name : 'Unknown'
      });
      io.emit('update_game_state', buildBroadcastPayload());
    } else {
      socket.emit('minigame_wrong_answer');
    }
  });

  // 5. proceed: host only
  socket.on('proceed', () => {
    if (!socket.isHost) return;

    if (gameState.status === 'cutscene') {
      gameState.status = 'active';
      startReadyTimer();
      console.log(`Proceeding to active phase ${gameState.currentPhaseIndex}`);
    }
    else if (gameState.status === 'consequence') {
      if (gameState.wasCorrect) {
        gameState.status = !gameState.minigameIntroSeen ? 'minigame_intro' : 'minigame';
        gameState.minigameResolved = false;
        gameState.minigameWinnerName = null;
        if (gameState.status === 'minigame') startReadyTimer();
      } else {
        gameState.status = 'active';
        startReadyTimer();
      }
      resetVotes();
      console.log(`Proceeding to status: ${gameState.status}`);
    }
    else if (gameState.status === 'minigame_intro') {
      gameState.status = 'minigame';
      gameState.minigameIntroSeen = true;
      startReadyTimer();
      console.log('Relic tutorial complete. Starting first minigame.');
    }
    else if (gameState.status === 'minigame') {
      if (gameState.currentPhaseIndex >= storyData.length - 1) {
        gameState.status = 'outro';
        gameState.cutsceneText = gameOutroLore;
      } else {
        gameState.currentPhaseIndex++;
        gameState.status = 'cutscene';
        gameState.cutsceneText = storyData[gameState.currentPhaseIndex].phaseIntroLore;
      }
      console.log(`Proceeding from minigame to: ${gameState.status}`);
    }
    else if (gameState.status === 'outro') {
      gameState.status = 'ending';
      console.log('Outro complete — showing final screen.');
    }

    io.emit('update_game_state', buildBroadcastPayload());
  });

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
  console.log('\n============================================');
  console.log("  Rizal's Legacy: Woven — Server");
  console.log('============================================');
  console.log(`  Port     : ${PORT}`);
  console.log(`  Game URL : ${GAME_URL}`);
  console.log(`  Join URL : ${GAME_URL}/join`);
  console.log('--------------------------------------------');
  console.log(`  HOST CODE  :  ${HOST_CODE}`);
  console.log('  (Share with the game conductor only)');
  console.log('============================================\n');
});
