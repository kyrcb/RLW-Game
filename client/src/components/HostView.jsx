import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// CLAUDE logic notes:
// 1. Connect to the WebSocket at `http://localhost:3000` (or dynamically grabbed domain).
// 2. Listen for 'init_data' to grab the gameUrl and current gameState.
// 3. Render the QR code using a library like `qrcode.react` based on the gameUrl so players can join.
// 4. In `waiting` status, show players joining.
// 5. In `active` status, show the `scenario` and `question`.
// 6. In `consequence` status, show the failure consequence and a button to proceed.

export default function HostView() {
  const [gameState, setGameState] = useState(null);
  const [gameUrl, setGameUrl] = useState('');

  // Stub data for visual layout testing
  const dummyState = {
    status: 'waiting', // try changing to 'active' or 'consequence' to test UI
    players: [{ id: 1, name: 'Jose' }, { id: 2, name: 'Paciano' }],
    currentPhase: {
      scenario: "You are Jose Rizal in 1888. You recently published Noli Me Tangere, which sketched the present state of your native land.",
      question: "What is your next crucial step?",
      options: [
        "Write another novel immediately.",
        "Study and write about the Philippines' past.",
        "Organize an armed rebellion."
      ]
    }
  };

  useEffect(() => {
    // CLAUDE: Initialize socket connection here.
    // const socket = io('http://localhost:3000');
    // socket.on('init_data', (data) => { setGameState(data.gameState); setGameUrl(data.gameUrl); });
    // socket.on('update_game_state', (newState) => { setGameState(newState); });
  }, []);

  const startGame = () => {
    // CLAUDE: Emit 'start_game' here
  };

  const status = gameState?.status || dummyState.status;

  return (
    <div className="container animate-fade">
      {status === 'waiting' && (
        <div className="glass-panel text-center">
          <h1>Sucesos de las Islas Filipinas</h1>
          <p>A historical branching narrative.</p>
          
          <div style={{ margin: '2rem 0' }}>
            {/* CLAUDE: Render the actual QR Code here */}
            <div style={{ width: 200, height: 200, background: 'white', margin: '0 auto', display: 'flex', alignItems:'center', justifyContent:'center', color: 'black' }}>
              [QR CODE PLACEHOLDER]<br/>
              {gameUrl || 'http://<LOCAL_IP>:5173/join'}
            </div>
            <p style={{ marginTop: '1rem', color: 'var(--accent)' }}>Scan to join!</p>
          </div>

          <div style={{ textAlign: 'left', marginTop: '2rem' }}>
            <h3>Joined Players ({dummyState.players.length})</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {dummyState.players.map((p, i) => (
                <span key={i} className="badge">{p.name}</span>
              ))}
            </div>
          </div>

          <button className="btn btn-primary" onClick={startGame} style={{ marginTop: '2rem' }}>Begin the Story</button>
        </div>
      )}

      {status === 'active' && (
        <div className="glass-panel">
          <span className="badge" style={{ marginBottom: '1rem' }}>Phase 1</span>
          <h2>The Journey Begins</h2>
          <p style={{ fontSize: '1.25rem' }}>{dummyState.currentPhase.scenario}</p>
          <hr style={{ borderColor: 'var(--glass-border)', margin: '1.5rem 0' }} />
          <h3 style={{ color: 'var(--accent)' }}>{dummyState.currentPhase.question}</h3>
          
          <div style={{ marginTop: '2rem' }}>
            {/* CLAUDE: Show voting progress here, maybe visual bars for each option if you want to be fancy. */}
            {dummyState.currentPhase.options.map((opt, i) => (
              <div key={i} style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                {opt}
              </div>
            ))}
          </div>
          
          <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>Waiting for players to vote...</p>
        </div>
      )}
    </div>
  );
}
