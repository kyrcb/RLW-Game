import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import { Howl } from 'howler';
import { Landmark, Users, BookOpen, ScrollText, CheckCircle, XCircle } from 'lucide-react';
import serverUrl from '../utils/serverUrl';

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

  if (!sentences || sentences.length === 0 || currentIndex >= sentences.length) return null;

  return (
    <div className="narrator-text-container" style={{ minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div key={currentIndex} className="narrator-sentence active narrator-tl" style={{ fontSize: '2.4rem', fontWeight: 'bold' }}>
        {sentences[currentIndex]?.tl}
      </div>
      <div key={`en-${currentIndex}`} className="narrator-sentence active narrator-en" style={{ fontSize: '1.2rem', fontStyle: 'italic', marginTop: '1rem', color: 'var(--accent)' }}>
        {sentences[currentIndex]?.en}
      </div>
    </div>
  );
};

const MinigameHostView = ({ minigame, onProceed, minigameResolved, winnerName }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (minigameResolved && minigame) {
      sfxCorrect.play();
      const audio = new Audio(`${serverUrl}/api/tts?text=${encodeURIComponent(minigame.correctionText)}`);
      audio.play().catch(e => console.error(e));
      audioRef.current = audio;
    }
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, [minigameResolved, minigame]);

  if (!minigame) return null;

  return (
    <div className="glass-panel text-center animate-fade" style={{ maxWidth: '1000px', backgroundColor: 'rgba(10, 8, 7, 0.95)', margin: '0 auto', marginTop: '2rem' }}>
      <h2 style={{ color: 'var(--accent)', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '2rem' }}>
        Relics of Truth
      </h2>
      <h3 style={{ fontStyle: 'italic', fontSize: '1.6rem', marginBottom: '2rem', color: '#f4e8d3' }}>
        "{minigame.morgaClaim}"
      </h3>
      
      <div style={{ position: 'relative', width: '100%', height: '450px', margin: '0 auto', overflow: 'hidden', borderRadius: '8px', border: '2px solid var(--accent)' }}>
        <img 
          src={minigame.imagePath} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: minigameResolved ? 1 : 0.03, filter: minigameResolved ? 'none' : 'grayscale(100%) blur(15px)', transition: 'all 2.5s cubic-bezier(0.17, 0.67, 0.83, 0.67)' }} 
        />
        {!minigameResolved && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', textAlign: 'center' }}>
            <p style={{ animation: 'pulse 1.5s infinite', fontSize: '1.4rem', letterSpacing: '2px' }}>Awaiting Scholars to Uncover the Truth...</p>
          </div>
        )}
        {minigameResolved && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'rgba(0,0,0,0.85)', padding: '1.5rem', animation: 'fadeInSentence 2s forwards' }}>
            <p style={{ color: '#8ce6af', fontSize: '1.4rem', fontWeight: 'bold' }}>{minigame.correctionText}</p>
          </div>
        )}
      </div>

      {minigameResolved && (
        <div style={{ marginTop: '2rem', animation: 'fadeInSentence 1s forwards' }}>
          <p style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>Discovered by: <strong>{winnerName}</strong> (+100 Wisdom)</p>
          <button className="btn btn-primary mt-4" onClick={onProceed}>
            Continue Narrative →
          </button>
        </div>
      )}
    </div>
  );
};

export default function HostView({ hostToken }) {
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

    const socket = io(serverUrl, { auth: { token: hostToken } });
    socketRef.current = socket;

    socket.on('init_data', (data) => {
      setGameUrl(data.gameUrl);
      setGameState(data);
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
      <div className={`cinematic-overlay ${(status === 'cutscene' || status === 'outro') ? 'dark-mode' : ''}`} />
      
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

        {/* ========== OUTRO / CLOSING NARRATIVE ========== */}
        {status === 'outro' && (
          <div className="text-center" id="outro-panel" style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '10vh' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '3rem', letterSpacing: '8px', textTransform: 'uppercase', color: 'var(--accent)', opacity: 0.8 }}>
              The Legacy of Truth
            </h2>
            <CinematicNarrator
              sentences={displayState.cutsceneText}
              onComplete={handleProceed}
            />
            <button className="btn outline mt-4 animate-fade" onClick={handleProceed} style={{ animationDelay: '2s', padding: '0.8rem 2rem', opacity: 0.6, marginTop: '4rem' }}>
              Behold the Legacy →
            </button>
          </div>
        )}

        {/* ========== MINIGAME / RELIC ========== */}
        {status === 'minigame' && (
          <MinigameHostView 
            minigame={displayState.currentMinigame}
            minigameResolved={displayState.minigameResolved}
            winnerName={displayState.minigameWinnerName}
            onProceed={handleProceed}
          />
        )}

        {/* ========== ENDING ========== */}
        {status === 'ending' && (() => {
          const sorted = [...players].sort((a, b) => b.score - a.score);
          const medals = ['🥇', '🥈', '🥉'];
          return (
            <div className="glass-panel ending-panel animate-fade" id="ending-panel" style={{ maxWidth: '1100px', margin: '0 auto', overflowY: 'auto', maxHeight: '90vh' }}>
              <div className="icon-container">
                <Landmark size={64} />
              </div>
              <h1 style={{ marginBottom: '0.25rem' }}>Legacy Forged</h1>
              <h2 style={{ color: '#8ce6af', marginBottom: '2rem', fontSize: '1.2rem', fontWeight: 'normal' }}>
                The Work of Rizal Endures Through You
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>

                {/* — Leaderboard — */}
                <div>
                  <h3 style={{ color: 'var(--accent)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '1rem', fontSize: '1rem' }}>
                    Scholar Rankings
                  </h3>
                  {sorted.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No scholars recorded.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {sorted.map((p, i) => (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: i === 0 ? 'rgba(220,180,80,0.15)' : 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.65rem 1rem', border: i === 0 ? '1px solid rgba(220,180,80,0.4)' : '1px solid rgba(255,255,255,0.07)' }}>
                          <span style={{ fontSize: '1.5rem', minWidth: '2rem' }}>{medals[i] || `#${i + 1}`}</span>
                          <span style={{ flex: 1, fontWeight: i < 3 ? 'bold' : 'normal', fontSize: '1.1rem' }}>{p.name}</span>
                          <span style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '1.1rem' }}>{p.score} <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>pts</span></span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* — Relic Finders — */}
                <div>
                  <h3 style={{ color: 'var(--accent)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '1rem', fontSize: '1rem' }}>
                    Relics Uncovered
                  </h3>
                  {displayState.relicWinners && displayState.relicWinners.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {displayState.relicWinners.map((rw, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.5rem 0.75rem', border: '1px solid rgba(255,255,255,0.07)' }}>
                          <img src={rw.imagePath} alt={rw.topic} style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(220,180,80,0.3)', flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem', color: '#f4e8d3' }}>{rw.topic}</p>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--accent)' }}>Uncovered by <strong>{rw.winnerName}</strong></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No relics were uncovered.</p>
                  )}
                </div>

              </div>
            </div>
          );
        })()}
      </div>
    </>
  );
}
