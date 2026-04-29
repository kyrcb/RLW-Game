// In production (HTTPS), client and server share the same origin — no port needed.
// In local dev (HTTP), the server runs separately on port 3000.
const serverUrl =
  import.meta.env.VITE_SERVER_URL ||
  (window.location.protocol === 'https:'
    ? window.location.origin
    : `http://${window.location.hostname}:3000`);

export default serverUrl;
