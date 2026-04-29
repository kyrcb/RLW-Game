import { useState, useRef } from 'react';
import { KeyRound } from 'lucide-react';
import serverUrl from '../utils/serverUrl';

export default function HostLogin({ onSuccess }) {
  const [code, setCode]       = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake]     = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${serverUrl}/api/host-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      if (res.ok) {
        const { token } = await res.json();
        onSuccess(token);
      } else {
        setError('Invalid host code. Try again.');
        setCode('');
        triggerShake();
      }
    } catch {
      setError('Cannot reach the server. Is it running?');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => {
      setShake(false);
      inputRef.current?.focus();
    }, 600);
  };

  return (
    <>
      <div className="cinematic-bg" style={{ backgroundImage: 'url(/colonial_library_bg.png)' }} />
      <div className="cinematic-overlay" />

      <div className="container animate-fade" style={{ maxWidth: '480px' }}>
        <div className={`glass-panel text-center${shake ? ' shake' : ''}`}>
          <div className="icon-container">
            <KeyRound size={64} />
          </div>

          <h2 style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>
            Conductor's Seal
          </h2>
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '2rem' }}>
            Enter the host code to conduct the narrative
          </p>

          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              placeholder="XXXXXX"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              autoFocus
              autoCapitalize="characters"
              spellCheck={false}
              style={{
                textAlign: 'center',
                letterSpacing: '0.6rem',
                fontSize: '2rem',
                fontFamily: 'Cinzel, serif',
              }}
            />

            {error && (
              <p className="animate-fade" style={{ color: '#fca5a5', fontSize: '1rem', marginBottom: '1rem' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || code.trim().length === 0}
            >
              {loading ? 'Verifying...' : 'Unlock the Annals'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
