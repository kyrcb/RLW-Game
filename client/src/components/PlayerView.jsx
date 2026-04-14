import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function PlayerView() {
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(-1);
  const socketRef = useRef(null);
  const lastPhaseRef = useRef(-1);

  useEffect(() => {
    // Connect to server on the same hostname (works for LAN)
    const serverUrl = `http://${window.location.hostname}:3000`;
    const socket = io(serverUrl);
    socketRef.current = socket;

    socket.on('init_data', (data) => {
      setGameState({
        status: data.status,
        players: data.players,
        currentPhaseIndex: data.currentPhaseIndex,
        totalPhases: data.totalPhases,
        currentPhase: data.currentPhase,
        votedCount: data.votedCount
      });
    });

    socket.on('update_game_state', (data) => {
      setGameState(data);

      // Reset voting state when a new phase starts
      if (data.status === 'active' && data.currentPhaseIndex !== lastPhaseRef.current) {
        setHasVoted(false);
        setSelectedOption(-1);
        lastPhaseRef.current = data.currentPhaseIndex;
      }
      // Also reset when going back to active after wrong answer (same phase replay)
      if (data.status === 'active' && !data.wasCorrect) {
        setHasVoted(false);
        setSelectedOption(-1);
      }
    });

    return () => socket.disconnect();
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (name.trim()) {
      socketRef.current?.emit('join_game', { playerName: name.trim() });
      setJoined(true);
    }
  };

  const handleVote = (index) => {
    if (hasVoted) return;
    socketRef.current?.emit('submit_vote', { optionIndex: index });
    setHasVoted(true);
    setSelectedOption(index);
  };

  // ===== JOIN SCREEN =====
  if (!joined) {
    return (
      <div className="container animate-fade" style={{ maxWidth: '500px' }}>
        <div className="glass-panel text-center">
          <div className="join-icon">🏛️</div>
          <h2>Join the Session</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Enter your name to participate</p>
          <form onSubmit={handleJoin}>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              id="player-name-input"
            />
            <button type="submit" className="btn btn-primary" id="join-btn">Join Game</button>
          </form>
        </div>
      </div>
    );
  }

  // Loading state
  if (!gameState) {
    return (
      <div className="container animate-fade" style={{ maxWidth: '500px' }}>
        <div className="glass-panel text-center">
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Connecting...</p>
        </div>
      </div>
    );
  }

  const { status, currentPhase, players } = gameState;

  return (
    <div className="container animate-fade" style={{ maxWidth: '500px' }}>

      {/* ===== WAITING ===== */}
      {status === 'waiting' && (
        <div className="glass-panel text-center" id="player-waiting">
          <div className="waiting-icon">⏳</div>
          <h2>Welcome, {name}!</h2>
          <p>You're in! Please wait for the host to start the game.</p>
          <div className="player-count-badge">
            <span className="badge">{players.length} player{players.length !== 1 ? 's' : ''} connected</span>
          </div>
        </div>
      )}

      {/* ===== ACTIVE / VOTING ===== */}
      {status === 'active' && currentPhase && (
        <div className="glass-panel" id="player-voting">
          <h3 className="text-center" style={{ marginBottom: '0.5rem', color: 'var(--accent)' }}>
            Phase {currentPhase.phase}
          </h3>
          <h3 className="text-center" style={{ marginBottom: '1.5rem' }}>
            {hasVoted ? 'Vote Submitted!' : 'Cast Your Vote!'}
          </h3>

          {hasVoted && (
            <div className="vote-submitted-msg animate-fade">
              <p>✅ Your vote has been recorded. Wait for all players to finish voting.</p>
            </div>
          )}

          <div className="vote-options">
            {currentPhase.options.map((opt, i) => (
              <button
                key={i}
                className={`btn vote-btn ${hasVoted ? 'voted-state' : ''} ${selectedOption === i ? 'selected-vote' : ''}`}
                onClick={() => handleVote(i)}
                disabled={hasVoted}
                id={`vote-option-${i}`}
              >
                <span className="vote-letter">{String.fromCharCode(65 + i)}</span>
                <span className="vote-text">{opt}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===== CONSEQUENCE ===== */}
      {status === 'consequence' && (
        <div className="glass-panel text-center" id="player-consequence">
          <div className="look-icon">📺</div>
          <h2>Look at the Host Screen!</h2>
          <p style={{ color: 'var(--text-muted)' }}>The story is unfolding...</p>
        </div>
      )}

      {/* ===== ENDING ===== */}
      {status === 'ending' && (
        <div className="glass-panel text-center" id="player-ending">
          <div className="ending-icon">🎉</div>
          <h2>Journey Complete!</h2>
          <p>Congratulations, {name}! You helped trace Rizal's historic path.</p>
        </div>
      )}
    </div>
  );
}
