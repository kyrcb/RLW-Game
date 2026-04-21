import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Howl } from 'howler';
import { Pen, Scroll, Eye, ShieldCheck, Hourglass } from 'lucide-react';

const sfxClick = new Howl({
  src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'], // Working alternative click
  volume: 0.8
});

export default function PlayerView() {
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(-1);
  const socketRef = useRef(null);
  const lastPhaseRef = useRef(-1);

  useEffect(() => {
    // Dynamic background
    document.body.className = 'bg-manuscript';

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

      if (data.status === 'active' && data.currentPhaseIndex !== lastPhaseRef.current) {
        setHasVoted(false);
        setSelectedOption(-1);
        lastPhaseRef.current = data.currentPhaseIndex;
      }
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
      sfxClick.play();
      socketRef.current?.emit('join_game', { playerName: name.trim() });
      setJoined(true);
    }
  };

  const handleVote = (index) => {
    if (hasVoted) return;
    sfxClick.play();
    socketRef.current?.emit('submit_vote', { optionIndex: index });
    setHasVoted(true);
    setSelectedOption(index);
  };

  if (!joined) {
    return (
      <div className="container animate-fade" style={{ maxWidth: '500px' }}>
        <div className="glass-panel text-center">
          <div className="icon-container">
            <Pen size={64} />
          </div>
          <h2>Join the Assembly</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontStyle: 'italic' }}>Sign your name into the annals</p>
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
            <button type="submit" className="btn btn-primary" id="join-btn">Inscribe Name</button>
          </form>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="container animate-fade" style={{ maxWidth: '500px' }}>
        <div className="glass-panel text-center">
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Seeking connection...</p>
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
          <div className="icon-container">
            <Hourglass size={64} />
          </div>
          <h2>Greetings, {name}!</h2>
          <p>Your carriage has arrived. Please await the host to begin the historical account.</p>
          <div className="player-count-badge">
            <span className="badge">{players.length} scholar{players.length !== 1 ? 's' : ''} assembled</span>
          </div>
        </div>
      )}

      {/* ===== ACTIVE / VOTING ===== */}
      {status === 'active' && currentPhase && (
        <div className="glass-panel" id="player-voting">
          <h3 className="text-center" style={{ marginBottom: '0.5rem', color: 'var(--accent)' }}>
            Chapter {currentPhase.phase}
          </h3>
          <h3 className="text-center" style={{ marginBottom: '1.5rem' }}>
            {hasVoted ? 'Decree Sealed!' : 'Cast Your Decree!'}
          </h3>

          {hasVoted && (
            <div className="vote-submitted-msg animate-fade">
              <Scroll size={24} />
              <p>Your testament has been recorded. Wait for all decrees.</p>
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
          <div className="icon-container">
            <Eye size={64} />
          </div>
          <h2>Behold the Script</h2>
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '1.2rem' }}>Look to the host screen to read the consequence...</p>
        </div>
      )}

      {/* ===== ENDING ===== */}
      {status === 'ending' && (
        <div className="glass-panel text-center" id="player-ending">
          <div className="icon-container">
            <ShieldCheck size={64} />
          </div>
          <h2>History Written!</h2>
          <p style={{ fontSize: '1.25rem' }}>Master {name}, you have honorably guided the path of enlightenment.</p>
        </div>
      )}
    </div>
  );
}
