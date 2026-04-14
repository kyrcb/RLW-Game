const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const ip = require('ip'); // Used to get local network IP
const storyData = require('./storyData');

const app = express();
app.use(cors());

// CLAUDE: If we eventually serve the Vite build from Express, you'd add:
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
// CLAUDE: Manage your game state here.
let gameState = {
  status: 'waiting', // waiting | active | consequence | ending
  players: [], // list of player objects: { id, name }
  currentPhaseIndex: 0, 
  votes: {}, // mapping of optionIndex -> voteCount
  votedPlayers: new Set() // keep track of who has voted to prevent double voting
};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Send initial data to newly connected client
  socket.emit('init_data', { gameUrl: `http://${LOCAL_IP}:5173`, gameState });

  /* 
  CLAUDE: Implement the following socket listeners:
  
  1. `join_game`: payload: { playerName }
     - Add player to gameState.players
     - Broadcast updated players list to all via `update_game_state`

  2. `start_game`: 
     - Change status to 'active', currentPhaseIndex to 0
     - Reset votes
     - Broadcast to all

  3. `submit_vote`: payload: { optionIndex }
     - If game is active and player hasn't voted:
       - Increment vote count for that option
       - Mark player as voted
     - If all players have voted:
       - Calculate the winning option.
       - Check if it's the correctOptionIndex from storyData[currentPhaseIndex].
       - If Correct: move to next phase (or 'ending' if it's the last phase).
       - If Incorrect: change status to 'consequence', set a payload with the consequence text.
     - Broadcast updated state.

  4. `proceed`: (Triggered by Host to skip consequence or force next phase)
     - Reset votes
     - Modify state status and indices accordingly
     - Broadcast updated state.
  */

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // CLAUDE: optionally handle player removal if they disconnect
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Game URL: http://${LOCAL_IP}:5173`);
});
