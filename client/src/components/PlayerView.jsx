import React, { useState, useEffect, useRef } from 'react';
import serverUrl from '../utils/serverUrl';
import { io } from 'socket.io-client';
import { Howl } from 'howler';
import { Pen, Scroll, ScrollText, Eye, ShieldCheck, Hourglass, Sword, Ship, Coins, Shield, Crosshair, Bomb, ShieldHalf, Coffee, Gem, ShoppingBasket, User, Cross, Bell, Map, CupSoda, Leaf, Wheat, Mail, BookOpen, FileText, BookMarked, Type, Image } from 'lucide-react';

const sfxClick = new Howl({
  src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'], // Working alternative click
  volume: 0.8
});

const getIcon = (word) => {
  const map = {
    "Sword": <Sword size={32} style={{ marginBottom: '8px' }} />,
    "Ship": <Ship size={32} style={{ marginBottom: '8px' }} />,
    "Scroll": <Scroll size={32} style={{ marginBottom: '8px' }} />,
    "Coin": <Coins size={32} style={{ marginBottom: '8px' }} />,
    "Shield": <Shield size={32} style={{ marginBottom: '8px' }} />,
    "Spear": <Crosshair size={32} style={{ marginBottom: '8px' }} />,
    "Cannon": <Bomb size={32} style={{ marginBottom: '8px' }} />,
    "Armor": <ShieldHalf size={32} style={{ marginBottom: '8px' }} />,
    "Clay Pot": <Coffee size={32} style={{ marginBottom: '8px' }} />,
    "Gold Jewelry": <Gem size={32} style={{ marginBottom: '8px' }} />,
    "Rattan Basket": <ShoppingBasket size={32} style={{ marginBottom: '8px' }} />,
    "Wooden Idol": <User size={32} style={{ marginBottom: '8px' }} />,
    "Cross": <Cross size={32} style={{ marginBottom: '8px' }} />,
    "Bell": <Bell size={32} style={{ marginBottom: '8px' }} />,
    "Map": <Map size={32} style={{ marginBottom: '8px' }} />,
    "Porcelain Vase": <CupSoda size={32} style={{ marginBottom: '8px' }} />,
    "Iron Sword": <Sword size={32} style={{ marginBottom: '8px' }} />,
    "Spices": <Leaf size={32} style={{ marginBottom: '8px' }} />,
    "Rice": <Wheat size={32} style={{ marginBottom: '8px' }} />,
    "Letter": <Mail size={32} style={{ marginBottom: '8px' }} />,
    "Ancient Book": <BookOpen size={32} style={{ marginBottom: '8px' }} />,
    "Decree": <FileText size={32} style={{ marginBottom: '8px' }} />,
    "Painting": <Image size={32} style={{ marginBottom: '8px' }} />,
    "Archive Scroll": <ScrollText size={32} style={{ marginBottom: '8px' }} />,
    "Church Record": <FileText size={32} style={{ marginBottom: '8px' }} />,
    "Dominican Chronicle": <BookMarked size={32} style={{ marginBottom: '8px' }} />,
    "Crucifix": <Cross size={32} style={{ marginBottom: '8px' }} />,
    "Rosary": <Coins size={32} style={{ marginBottom: '8px' }} />,
    "Baybayin Tablet": <Type size={32} style={{ marginBottom: '8px' }} />,
    "Quill": <Pen size={32} style={{ marginBottom: '8px' }} />,
    "Coin": <Coins size={32} style={{ marginBottom: '8px' }} />
  };
  return map[word] || <Eye size={32} style={{ marginBottom: '8px' }} />;
};

export default function PlayerView() {
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(-1);
  const [wrongAnswer, setWrongAnswer] = useState(false);
  const socketRef = useRef(null);
  const lastPhaseRef = useRef(-1);
  const lastMinigamePhaseRef = useRef(-1);

  useEffect(() => {
    // Dynamic background
    document.body.className = 'bg-manuscript';

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
      if (data.status === 'minigame' && data.currentPhaseIndex !== lastMinigamePhaseRef.current) {
        setHasVoted(false);
        setSelectedOption(-1);
        setWrongAnswer(false);
        lastMinigamePhaseRef.current = data.currentPhaseIndex;
      }
    });

    socket.on('minigame_wrong_answer', () => {
      setWrongAnswer(true);
      setHasVoted(false);
      setSelectedOption(-1);
      setTimeout(() => setWrongAnswer(false), 1500);
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

      {/* ===== CUTSCENE ===== */}
      {status === 'cutscene' && (
        <div className="glass-panel text-center" id="player-cutscene">
          <div className="icon-container">
            <Eye size={64} />
          </div>
          <h2>Observe the Lore</h2>
          <p style={{ color: 'var(--text-muted)' }}>Look to the host screen for historical context.</p>
        </div>
      )}

      {/* ===== OUTRO ===== */}
      {status === 'outro' && (
        <div className="glass-panel text-center" id="player-outro">
          <div className="icon-container">
            <ScrollText size={64} />
          </div>
          <h2>The Legacy Speaks</h2>
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Witness the closing words on the host screen...</p>
        </div>
      )}

      {/* ===== MINIGAME INTRO ===== */}
      {status === 'minigame_intro' && (
        <div className="glass-panel text-center" id="player-minigame-intro">
          <div className="icon-container">
            <ScrollText size={64} />
          </div>
          <h2 style={{ color: 'var(--accent)' }}>Relics of Truth</h2>
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Listen to the instructions on the host screen...
          </p>
          <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
            Get ready — you will need to identify a historical artifact on your phone.
          </p>
        </div>
      )}

      {/* ===== MINIGAME ===== */}
      {status === 'minigame' && gameState.currentMinigame && (
        <div className="glass-panel text-center" id="player-minigame" style={{ padding: '1.5rem' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '0.5rem', letterSpacing: '2px' }}>RELIC DISCOVERY</h2>
          <p style={{ marginBottom: '1rem', fontStyle: 'italic', color: '#f4e8d3', fontSize: '0.95rem' }}>
            Identify the true relic to correct Morga's claim!
          </p>

          {/* Relic image — blurred until resolved */}
          <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '8px', overflow: 'hidden', border: '2px solid rgba(220,180,110,0.4)', marginBottom: '1rem' }}>
            <img
              src={gameState.currentMinigame.imagePath}
              alt="relic"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: gameState.minigameResolved ? 1 : 0.15,
                filter: gameState.minigameResolved ? 'none' : 'grayscale(100%) blur(8px)',
                transition: 'all 2.5s cubic-bezier(0.17, 0.67, 0.83, 0.67)'
              }}
            />
            {!gameState.minigameResolved && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontSize: '0.85rem', letterSpacing: '1px', opacity: 0.8 }}>Shrouded in history...</p>
              </div>
            )}
          </div>

          {wrongAnswer && (
            <div className="animate-fade" style={{ background: 'rgba(180,40,40,0.7)', padding: '0.6rem 1rem', borderRadius: '6px', marginBottom: '0.75rem' }}>
              <p style={{ color: '#ffcccc', fontWeight: 'bold', margin: 0 }}>Wrong relic — try again!</p>
            </div>
          )}

          {!gameState.minigameResolved ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {gameState.currentMinigame.options.map((opt, i) => (
                <button
                  key={i}
                  className={`btn vote-btn ${selectedOption === i ? 'selected-vote' : ''}`}
                  onClick={() => {
                    if (hasVoted || gameState.minigameResolved) return;
                    sfxClick.play();
                    socketRef.current?.emit('submit_minigame_answer', { optionIndex: i });
                    setHasVoted(true);
                    setSelectedOption(i);
                  }}
                  disabled={hasVoted || gameState.minigameResolved}
                  style={{ height: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', padding: '0.75rem', border: '2px solid rgba(220,180,110,0.3)', borderRadius: '8px', wordBreak: 'break-word' }}
                >
                  {getIcon(opt)}
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="animate-fade" style={{ background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '8px' }}>
              <p style={{ color: '#8ce6af', fontWeight: 'bold', marginBottom: '0.25rem' }}>Relic Identified!</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Check the Host screen for the truth.</p>
            </div>
          )}
        </div>
      )}

      {/* ===== ENDING ===== */}
      {status === 'ending' && (() => {
        const sorted = [...(gameState.players || [])].sort((a, b) => b.score - a.score);
        const rank = sorted.findIndex(p => p.name === name) + 1;
        const myScore = sorted.find(p => p.name === name)?.score ?? 0;
        const medals = ['🥇', '🥈', '🥉'];
        return (
          <div className="glass-panel text-center" id="player-ending">
            <div className="icon-container">
              <ShieldCheck size={64} />
            </div>
            <h2>History Written!</h2>
            <p style={{ fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Scholar {name}, you have illuminated the path.
            </p>

            <div style={{ background: 'rgba(220,180,80,0.1)', border: '1px solid rgba(220,180,80,0.3)', borderRadius: '10px', padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
              <p style={{ margin: 0, fontSize: '2rem' }}>{medals[rank - 1] || `#${rank}`}</p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent)' }}>{myScore} pts</p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Rank {rank} of {sorted.length}</p>
            </div>

            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.5rem' }}>Final Standings</p>
              {sorted.map((p, i) => (
                <div key={p.id ?? i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.5rem', borderRadius: '6px', background: p.name === name ? 'rgba(220,180,80,0.12)' : 'transparent', marginBottom: '0.25rem' }}>
                  <span style={{ minWidth: '1.8rem' }}>{medals[i] || `${i + 1}.`}</span>
                  <span style={{ flex: 1, fontWeight: p.name === name ? 'bold' : 'normal' }}>{p.name}</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{p.score} pts</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
