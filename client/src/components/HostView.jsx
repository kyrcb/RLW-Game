import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';

export default function HostView() {
  const [gameState, setGameState] = useState(null);
  const [gameUrl, setGameUrl] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to server on the same hostname (works for LAN)
    const serverUrl = `http://${window.location.hostname}:3000`;
    const socket = io(serverUrl);
    socketRef.current = socket;

    socket.on('init_data', (data) => {
      setGameUrl(data.gameUrl);
      setGameState({
        status: data.status,
        players: data.players,
        currentPhaseIndex: data.currentPhaseIndex,
        totalPhases: data.totalPhases,
        votes: data.votes,
        votedCount: data.votedCount,
        consequenceText: data.consequenceText,
        winningOptionIndex: data.winningOptionIndex,
        wasCorrect: data.wasCorrect,
        currentPhase: data.currentPhase
      });
    });

    socket.on('update_game_state', (data) => {
      setGameState(data);
    });

    return () => socket.disconnect();
  }, []);

  const startGame = () => {
    socketRef.current?.emit('start_game');
  };

  const handleProceed = () => {
    socketRef.current?.emit('proceed');
  };

  if (!gameState) {
    return (
      <div className="container animate-fade">
        <div className="glass-panel text-center">
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Connecting to server...</p>
        </div>
      </div>
    );
  }

  const { status, players, currentPhase, votes, votedCount, totalPhases, currentPhaseIndex, consequenceText, winningOptionIndex, wasCorrect } = gameState;
  const joinUrl = gameUrl ? `${gameUrl}/join` : '';

  // Calculate total votes for progress bars
  const totalVotes = Object.values(votes || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="container animate-fade">

      {/* ========== WAITING / LOBBY ========== */}
      {status === 'waiting' && (
        <div className="glass-panel text-center" id="lobby-panel">
          <h1>Sucesos de las Islas Filipinas</h1>
          <p className="subtitle">A historical branching narrative based on Rizal's annotations</p>

          <div className="qr-section">
            {joinUrl ? (
              <>
                <div className="qr-container">
                  <QRCodeSVG
                    value={joinUrl}
                    size={200}
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                    level="M"
                    includeMargin={true}
                  />
                </div>
                <p className="qr-url">{joinUrl}</p>
                <p className="qr-hint">Scan or visit the URL to join!</p>
              </>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Loading game URL...</p>
            )}
          </div>

          <div className="players-section">
            <h3>Joined Players ({players.length})</h3>
            {players.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Waiting for players to join...</p>
            ) : (
              <div className="player-badges">
                {players.map((p, i) => (
                  <span key={p.id} className="badge player-badge animate-fade" style={{ animationDelay: `${i * 0.1}s` }}>
                    {p.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            className="btn btn-primary"
            onClick={startGame}
            disabled={players.length === 0}
            style={{ marginTop: '2rem', opacity: players.length === 0 ? 0.5 : 1 }}
            id="start-game-btn"
          >
            Begin the Story
          </button>
        </div>
      )}

      {/* ========== ACTIVE / VOTING ========== */}
      {status === 'active' && currentPhase && (
        <div className="glass-panel" id="active-panel">
          <div className="phase-header">
            <span className="badge phase-badge">Phase {currentPhase.phase} of {totalPhases}</span>
            <span className="badge vote-count-badge">{votedCount} / {players.length} voted</span>
          </div>

          <h2 className="scenario-title">The Journey Continues</h2>
          <p className="scenario-text">{currentPhase.scenario}</p>

          <hr className="divider" />

          <h3 className="question-text">{currentPhase.question}</h3>

          <div className="options-list">
            {currentPhase.options.map((opt, i) => {
              const voteCount = votes?.[i] || 0;
              const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
              return (
                <div key={i} className="option-bar-container">
                  <div className="option-bar-bg">
                    <div
                      className="option-bar-fill"
                      style={{ width: `${percentage}%` }}
                    ></div>
                    <div className="option-bar-content">
                      <span className="option-label">{opt}</span>
                      {totalVotes > 0 && (
                        <span className="option-votes">{voteCount} vote{voteCount !== 1 ? 's' : ''} ({percentage}%)</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="waiting-text">
            {votedCount < players.length
              ? `Waiting for ${players.length - votedCount} more vote${players.length - votedCount !== 1 ? 's' : ''}...`
              : 'All votes are in! Processing...'}
          </p>
        </div>
      )}

      {/* ========== CONSEQUENCE / EXPLANATION ========== */}
      {status === 'consequence' && (
        <div className={`glass-panel ${wasCorrect ? 'consequence-correct' : 'consequence-incorrect'}`} id="consequence-panel">
          <div className="consequence-icon">
            {wasCorrect ? '✅' : '📜'}
          </div>
          <h2>{wasCorrect ? 'Correct Decision!' : 'History Tells a Different Story...'}</h2>
          
          {currentPhase && winningOptionIndex >= 0 && (
            <div className="chosen-option">
              <span className="badge" style={{ marginBottom: '0.5rem' }}>The group chose:</span>
              <p style={{ fontStyle: 'italic', fontSize: '1.1rem' }}>"{currentPhase.options[winningOptionIndex]}"</p>
            </div>
          )}

          <div className="consequence-text-box">
            <p>{consequenceText}</p>
          </div>

          <button className="btn btn-primary" onClick={handleProceed} id="proceed-btn" style={{ marginTop: '1.5rem' }}>
            {wasCorrect 
              ? (currentPhaseIndex >= totalPhases - 1 ? 'See the Ending' : 'Continue the Journey →') 
              : 'Try Again →'}
          </button>
        </div>
      )}

      {/* ========== ENDING ========== */}
      {status === 'ending' && (
        <div className="glass-panel ending-panel" id="ending-panel">
          <div className="ending-icon">🏛️</div>
          <h1>Journey Complete</h1>
          <h2 style={{ color: 'var(--success)', marginBottom: '1.5rem' }}>Congratulations!</h2>
          <p className="ending-text">
            You have successfully traced Jose Rizal's journey in annotating Antonio de Morga's
            <em> Sucesos de las Islas Filipinas</em>. Through your decisions, you experienced the
            challenges, choices, and determination that shaped this landmark work of Philippine historiography.
          </p>
          <p className="ending-text">
            Rizal believed that to fairly judge the present, one must first understand the past.
            His annotated edition became the first Philippine history written from the perspective of a Filipino —
            a revolutionary act of scholarship that the Spanish authorities feared enough to ban.
          </p>
          <div className="ending-players">
            <h3>Scholars of History</h3>
            <div className="player-badges">
              {players.map((p) => (
                <span key={p.id} className="badge player-badge">{p.name}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
