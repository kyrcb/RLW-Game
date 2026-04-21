import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import { Howl } from 'howler';
import { Landmark, Users, BookOpen, ScrollText, CheckCircle, XCircle } from 'lucide-react';

const bgMusic = new Howl({
  src: ['/bgMusic.ogg'], // User-provided local background music
  loop: true,
  volume: 0.3,
  html5: true, 
});

const sfxPageTurn = new Howl({
  src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'], // dramatic heavy sweep
  volume: 0.8
});

const sfxCorrect = new Howl({
  src: ['https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'], // success chime
  volume: 0.6
});

const sfxIncorrect = new Howl({
  src: ['https://assets.mixkit.co/active_storage/sfx/2997/2997-preview.mp3'], // error beep
  volume: 0.6
});

const CinematicNarrator = ({ sentences, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    setCurrentIndex(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, [sentences]);

  const readSentence = (index) => {
    if (!sentences || index >= sentences.length) {
      if (onComplete) onComplete();
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const textToSpeak = sentences[index].tl;
    const serverUrl = `http://${window.location.hostname}:3000`;
    const audio = new Audio(`${serverUrl}/api/tts?text=${encodeURIComponent(textToSpeak)}&lang=tl`);
    audioRef.current = audio;
    
    audio.onended = () => {
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 400); 
    };

    audio.onerror = () => {
      setCurrentIndex(prev => prev + 1);
    };

    // Browsers block autoplay if no interaction, but since user pressed a button prior to this state, it should be fine.
    audio.play().catch(err => {
      if (err.name === 'AbortError') {
        // Ignored: The play request was intentionally interrupted by a cleanup pause (e.g. React StrictMode or user skip)
        return;
      }
      console.error("Audio playback prevented:", err);
      // Fallback: just advance immediately
      setCurrentIndex(prev => prev + 1);
    });
  };

  useEffect(() => {
    if (!sentences || sentences.length === 0) return;
    readSentence(currentIndex);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [sentences, currentIndex]);

  if (!sentences || sentences.length === 0) return null;

  return (
    <div className="narrator-text-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="narrator-sentence active narrator-tl" style={{ fontSize: '2.4rem', fontWeight: 'bold', marginBottom: '2rem', lineHeight: '1.4' }}>
        {sentences[currentIndex]?.tl}
      </div>
      <div className="narrator-en animate-fade" style={{ fontSize: '1.2rem', color: 'var(--accent)', fontStyle: 'italic', opacity: 0.8, letterSpacing: '1px' }}>
        {sentences[currentIndex]?.en}
      </div>
    </div>
  );
};

export default function HostView() {
  const [gameState, setGameState] = useState(null);
  const [displayState, setDisplayState] = useState(null); // Used to buffer UI so it doesn't leak ahead of transitions
  const [gameUrl, setGameUrl] = useState('');
  const [displayBg, setDisplayBg] = useState('/historical_manuscript_bg.png');
  const [fade, setFade] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Clear body classes so we can use our dedicated cinematic div
    document.body.className = '';
    
    // Attempt to start background music as early as possible
    const attemptPlayMusic = () => {
      if (!bgMusic.playing()) {
        bgMusic.play();
      }
    };
    
    window.addEventListener('click', attemptPlayMusic);
    window.addEventListener('keydown', attemptPlayMusic);
    attemptPlayMusic(); // Autoplay attempt (might be blocked by browser until interacted)

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
      window.removeEventListener('click', attemptPlayMusic);
      window.removeEventListener('keydown', attemptPlayMusic);
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

  // Dynamic Background Logic BEFORE early return
  const getBackgroundImage = (currentState) => {
    if (!currentState) return '/historical_manuscript_bg.png';
    const { status, consequenceImagePath } = currentState;
    if (status === 'consequence' || status === 'ending') {
      return consequenceImagePath || '/historical_manuscript_bg.png';
    }
    return status === 'waiting' ? '/colonial_library_bg.png' : '/historical_manuscript_bg.png';
  };

  const currentBgImage = getBackgroundImage(gameState);

  useEffect(() => {
    if (!gameState) return;
    
    // Immediate render if first load or if status is identical (e.g. vote count just updated)
    if (!displayState || (gameState.status === displayState.status && gameState.currentPhaseIndex === displayState.currentPhaseIndex)) {
      setDisplayState(gameState);
      
      // If backgrounds differ (edge cases), swap them gracefully
      if (currentBgImage !== displayBg) {
        setDisplayBg(currentBgImage);
      }
      return;
    }

    // A massive state change occurred (status change or phase transition)
    setFade(true); // Close doors
    const timer = setTimeout(() => {
      setDisplayState(gameState); // Update the text behind the closed doors
      setDisplayBg(currentBgImage); // Swap image behind the closed doors
      const openTimer = setTimeout(() => {
        setFade(false); // Open doors
      }, 300); // 300ms pause with doors fully closed
    }, 800); // 800ms gives the CSS animation time to cover the screen

    return () => clearTimeout(timer);
  }, [gameState, currentBgImage, displayBg]); // Depend on gameState heavily for buffering

  if (!displayState) {
    return (
      <>
        <div 
          className="cinematic-bg" 
          style={{ backgroundImage: `url(${displayBg})` }} 
        />
        <div className={`cinematic-overlay ${!displayState || displayState.status === 'cutscene' ? 'dark-mode' : ''}`} />
        
        {/* Dramatic Doors Transition */}
        <div className={`theater-door door-left ${fade ? 'closed' : ''}`} />
        <div className={`theater-door door-right ${fade ? 'closed' : ''}`} />
        <div className="container animate-fade">
          <div className="glass-panel text-center">
            <div className="loading-spinner"></div>
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Connecting to server...</p>
          </div>
        </div>
      </>
    );
  }

  const { status, players, currentPhase, votes, votedCount, totalPhases, currentPhaseIndex, consequenceText, consequenceImagePath, winningOptionIndex, wasCorrect } = displayState;
  const joinUrl = gameUrl ? `${gameUrl}/join` : '';
  const totalVotes = Object.values(votes || {}).reduce((a, b) => a + b, 0);

  return (
    <>
      <div 
        className="cinematic-bg" 
        style={{ backgroundImage: `url(${displayBg})` }} 
      />
      <div className={`cinematic-overlay ${status === 'cutscene' ? 'dark-mode' : ''}`} />
      
      {/* Dramatic Doors Transition */}
      <div className={`theater-door door-left ${fade ? 'closed' : ''}`} />
      <div className={`theater-door door-right ${fade ? 'closed' : ''}`} />
      
      {/* Hide the UI panel completely when the door is closed so it doesn't leak the next state early */}
      <div className="container animate-fade" style={{ opacity: fade ? 0 : 1, transition: 'opacity 0.2s', pointerEvents: fade ? 'none' : 'auto' }}>
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

        {/* ========== CUTSCENE / LORE ========== */}
        {status === 'cutscene' && (
          <div className="text-center" id="cutscene-panel" style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '10vh' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '3rem', letterSpacing: '8px', textTransform: 'uppercase', color: 'var(--accent)', opacity: 0.8 }}>
              Historical Context
            </h2>
            <CinematicNarrator 
              sentences={displayState.cutsceneText} 
              onComplete={handleProceed}
            />
            <button className="btn outline mt-4 animate-fade" onClick={handleProceed} style={{ animationDelay: '2s', padding: '0.8rem 2rem', opacity: 0.6, marginTop: '4rem' }}>
              Skip Sequence →
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
