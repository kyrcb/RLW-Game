import React, { useState, useEffect } from 'react';

// CLAUDE logic notes:
// 1. Connect socket to `window.location.hostname:3000` or whatever address the backend is serving.
// 2. Allow user to enter name, emit `join_game`.
// 3. Listen for `update_game_state` from server.
// 4. In `waiting` state, show "Waiting for Host to start...".
// 5. In `active` state, show the corresponding buttons for each choice. When a user clicks, emit `submit_vote` and disable buttons.
// 6. In `consequence` or `voting_result` state, show "Look at the main screen".

export default function PlayerView() {
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const [gameState, setGameState] = useState(null);

  // Stub data
  const dummyState = {
    status: 'active', // try 'waiting' or 'active'
    currentPhase: {
      options: [
        "Write another novel immediately.",
        "Study and write about the Philippines' past.",
        "Organize an armed rebellion."
      ]
    }
  };

  useEffect(() => {
    // CLAUDE: Initialize socket connection here.
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (name.trim()) {
      // CLAUDE: socket.emit('join_game', { playerName: name });
      setJoined(true);
    }
  };

  const handleVote = (index) => {
    // CLAUDE: socket.emit('submit_vote', { optionIndex: index });
    // Disable local voting interaction until next question
  };

  if (!joined) {
    return (
      <div className="container animate-fade" style={{ maxWidth: '500px' }}>
        <div className="glass-panel text-center">
          <h2>Join the Session</h2>
          <form onSubmit={handleJoin}>
            <input 
              type="text" 
              placeholder="Enter your name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required
            />
            <button type="submit" className="btn btn-primary">Join Game</button>
          </form>
        </div>
      </div>
    );
  }

  const status = gameState?.status || dummyState.status;

  return (
    <div className="container animate-fade" style={{ maxWidth: '500px' }}>
      {status === 'waiting' && (
        <div className="glass-panel text-center">
          <h2>Welcome, {name}!</h2>
          <p>Please wait for the host to start the game.</p>
        </div>
      )}

      {status === 'active' && (
        <div className="glass-panel">
          <h3 style={{ textAlign: 'center', marginBottom: '2rem' }}>Cast Your Vote!</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {dummyState.currentPhase.options.map((opt, i) => (
              <button key={i} className="btn" onClick={() => handleVote(i)}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {(status === 'consequence' || status === 'ending') && (
        <div className="glass-panel text-center">
          <h2>Look at the Host Screen!</h2>
          <p>The story is unfolding...</p>
        </div>
      )}
    </div>
  );
}
