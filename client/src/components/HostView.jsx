import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import { Howl } from 'howler';
import { Landmark, Users, BookOpen, ScrollText, CheckCircle, XCircle } from 'lucide-react';

// Historic Audio setup
const bgMusic = new Howl({
  src: ['https://upload.wikimedia.org/wikipedia/commons/4/4b/Isaac_Alb%C3%A9niz_-_Asturias_%28Leyenda%29.ogg'], // Classical Spanish Guitar
  loop: true,
  volume: 0.3,
});

const sfxPageTurn = new Howl({
  src: ['https://actions.google.com/sounds/v1/foley/book_drop.ogg'], // placeholder
  volume: 0.8,
});

const sfxCorrect = new Howl({
  src: ['https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg'], // placeholder
  volume: 0.6,
});

const sfxIncorrect = new Howl({
  src: ['https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg'], // placeholder
  volume: 0.6,
});

export default function HostView() {
  const [gameState, setGameState] = useState(null);
  const [gameUrl, setGameUrl] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    // Clear body classes so we can use our dedicated cinematic div
    document.body.className = '';
    
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
        consequenceImagePath: data.consequenceImagePath,
        winningOptionIndex: data.winningOptionIndex,
        wasCorrect: data.wasCorrect,
        currentPhase: data.currentPhase
      });
    });

    socket.on('update_game_state', (data) => {
      setGameState(data);
    });

    return () => {
      socket.disconnect();
      bgMusic.stop();
    };
  }, []);

  useEffect(() => {
    if (gameState?.status === 'active') {
      sfxPageTurn.play();
    }
    if (gameState?.status === 'consequence') {
      if (gameState.wasCorrect) sfxCorrect.play();
      else sfxIncorrect.play();
    }
  }, [gameState?.status, gameState?.wasCorrect]);

  const startGame = () => {
    if (!bgMusic.playing()) {
      bgMusic.play();
    }
    socketRef.current?.emit('start_game');
  };

  const handleProceed = () => {
    sfxPageTurn.play();
    socketRef.current?.emit('proceed');
  };

  if (!gameState) {
    return (
      <>
        <div className="cinematic-bg" style={{ backgroundImage: "url('/historical_manuscript_bg.png')" }} />
        <div className="cinematic-overlay" />
        <div className="container animate-fade">
          <div className="glass-panel text-center">
            <div className="loading-spinner"></div>
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Connecting to server...</p>
          </div>
        </div>
      </>
    );
  }

  const { status, players, currentPhase, votes, votedCount, totalPhases, currentPhaseIndex, consequenceText, consequenceImagePath, winningOptionIndex, wasCorrect } = gameState;
  const joinUrl = gameUrl ? `${gameUrl}/join` : '';
  const totalVotes = Object.values(votes || {}).reduce((a, b) => a + b, 0);

  // Dynamic Background Logic
  const getBackgroundImage = () => {
    if (status === 'consequence' || status === 'ending') {
      return consequenceImagePath || '/historical_manuscript_bg.png';
    }
    return status === 'waiting' ? '/colonial_library_bg.png' : '/historical_manuscript_bg.png';
  };

  const currentBgImage = getBackgroundImage();

  return (
    <>
      <div 
        className="cinematic-bg" 
        key={currentBgImage} // Keys force the animation to restart on image change
        style={{ backgroundImage: `url(${currentBgImage})` }} 
      />
      <div className="cinematic-overlay" />
      
      <div className="container animate-fade">
        {/* ========== WAITING / LOBBY ========== */}
        {status === 'waiting' && (
          <div className="glass-panel text-center" id="lobby-panel">
            <div className="icon-container">
              <BookOpen size={64} />
            </div>
            <h1>Sucesos de las Islas Filipinas</h1>
            <p className="subtitle">A historical branching narrative based on Rizal's annotations</p>

            <div className="qr-section">
              {joinUrl ? (
                <>
                  <div className="qr-container">
                    <QRCodeSVG
                      value={joinUrl}
                      size={200}
                      bgColor="#f4e8d3"
                      fgColor="#1a1614"
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                  <p className="qr-url">{joinUrl}</p>
                  <p className="qr-hint">Scan or visit the URL to join</p>
                </>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>Loading game URL...</p>
              )}
            </div>

            <div className="players-section">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={24} /> Joined Scholars ({players.length})
              </h3>
              {players.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Waiting for scholars to join...</p>
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
              style={{ marginTop: '2.5rem', opacity: players.length === 0 ? 0.5 : 1 }}
              id="start-game-btn"
            >
              Commence the Annotation
            </button>
          </div>
        )}

        {/* ========== ACTIVE / VOTING ========== */}
        {status === 'active' && currentPhase && (
          <div className="glass-panel" id="active-panel">
            <div className="phase-header">
              <span className="badge phase-badge">Chapter {currentPhase.phase} of {totalPhases}</span>
              <span className="badge vote-count-badge">{votedCount} / {players.length} resolved</span>
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
                          <span className="option-votes">{voteCount} decree{voteCount !== 1 ? 's' : ''} ({percentage}%)</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="waiting-text">
              {votedCount < players.length
                ? `Awaiting ${players.length - votedCount} more scholar${players.length - votedCount !== 1 ? 's' : ''}...`
                : 'All decrees are in! Unrolling the manuscript...'}
            </p>
          </div>
        )}

        {/* ========== CONSEQUENCE / EXPLANATION ========== */}
        {status === 'consequence' && (
          <div className={`glass-panel ${wasCorrect ? 'consequence-correct' : 'consequence-incorrect'}`} id="consequence-panel">
            <div className="icon-container">
              {wasCorrect ? <CheckCircle size={64} /> : <XCircle size={64} />}
            </div>
            <h2>{wasCorrect ? 'Historical Accuracy Upheld!' : 'History Tells a Different Story...'}</h2>
            
            {currentPhase && winningOptionIndex >= 0 && (
              <div className="chosen-option">
                <span className="badge" style={{ marginBottom: '0.5rem' }}>The collective decreed:</span>
                <p style={{ fontStyle: 'italic', fontSize: '1.25rem' }}>"{currentPhase.options[winningOptionIndex]}"</p>
              </div>
            )}

            <div className="consequence-text-box">
              <p>{consequenceText}</p>
            </div>

            <button className="btn btn-primary" onClick={handleProceed} id="proceed-btn" style={{ marginTop: '2rem' }}>
              {wasCorrect 
                ? (currentPhaseIndex >= totalPhases - 1 ? 'Behold the Legacy' : 'Turn the Page →') 
                : 'Revise the Annals →'}
            </button>
          </div>
        )}

        {/* ========== ENDING ========== */}
        {status === 'ending' && (
          <div className="glass-panel ending-panel" id="ending-panel">
            <div className="icon-container">
              <Landmark size={80} />
            </div>
            <h1>Legacy Forged</h1>
            <h2 style={{ color: '#8ce6af', marginBottom: '1.5rem' }}>The Work Endures</h2>
            <p className="ending-text">
              You have successfully traced Jose Rizal's historic path in annotating Antonio de Morga's
              <em> Sucesos de las Islas Filipinas</em>. Through your decisions, you experienced the
              complexities of illuminating a suppressed history.
            </p>
            <p className="ending-text">
              Rizal maintained that to fairly judge the present, a nation must first understand its past.
              His annotation proved to be a revolutionary act of scholarship, cementing the first Philippine history 
              written from the standpoint of a Filipino.
            </p>
            <div className="ending-players">
              <h3>Honored Scholars of the Realm</h3>
              <div className="player-badges">
                {players.map((p) => (
                  <span key={p.id} className="badge player-badge">{p.name}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
