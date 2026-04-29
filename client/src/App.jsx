import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HostView from './components/HostView';
import HostLogin from './components/HostLogin';
import PlayerView from './components/PlayerView';
import serverUrl from './utils/serverUrl';
import './index.css';

function HostGate() {
  // null = validating stored token, false = show login, true = authenticated
  const [authState, setAuthState] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('hostToken');
    if (!stored) {
      setAuthState(false);
      return;
    }

    fetch(`${serverUrl}/api/validate-token`, {
      headers: { Authorization: `Bearer ${stored}` },
    })
      .then((res) => {
        if (res.ok) {
          setToken(stored);
          setAuthState(true);
        } else {
          sessionStorage.removeItem('hostToken');
          setAuthState(false);
        }
      })
      .catch(() => {
        // Server unreachable — don't silently trust the cached token
        sessionStorage.removeItem('hostToken');
        setAuthState(false);
      });
  }, []);

  const handleSuccess = useCallback((newToken) => {
    sessionStorage.setItem('hostToken', newToken);
    setToken(newToken);
    setAuthState(true);
  }, []);

  if (authState === null) {
    return (
      <>
        <div className="cinematic-bg" style={{ backgroundImage: 'url(/colonial_library_bg.png)' }} />
        <div className="cinematic-overlay" />
        <div className="container animate-fade" style={{ maxWidth: '480px' }}>
          <div className="glass-panel text-center">
            <div className="loading-spinner" />
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
              Verifying conductor credentials...
            </p>
          </div>
        </div>
      </>
    );
  }

  if (!authState) {
    return <HostLogin onSuccess={handleSuccess} />;
  }

  return <HostView hostToken={token} />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HostGate />} />
        <Route path="/join" element={<PlayerView />} />
      </Routes>
    </Router>
  );
}

export default App;
