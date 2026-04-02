import { useEffect, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { loginWithGoogle } from './api';

export default function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState(window.location.pathname === '/home' ? '/home' : '/');

  useEffect(() => {
    const handlePopState = () => {
      setRoute(window.location.pathname === '/home' ? '/home' : '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) {
      setError('No credential returned from Google');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await loginWithGoogle(credentialResponse.credential);
      setUser(data);
      window.history.pushState({}, '', '/home');
      setRoute('/home');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google login failed');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setError('');
    window.history.pushState({}, '', '/');
    setRoute('/');
  };

  if (route === '/home') {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'Segoe UI, sans-serif' }}>
        <section style={{ width: 'min(620px, 92vw)', border: '1px solid #ddd', borderRadius: 14, padding: 24 }}>
          <h1 style={{ marginTop: 0 }}>Home Page</h1>
          {!user ? (
            <p>Login session is not available. Please go back and sign in again.</p>
          ) : (
            <>
              <p>Welcome to the home page.</p>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              {user.picture ? <img src={user.picture} alt="profile" width="72" height="72" style={{ borderRadius: '50%' }} /> : null}
            </>
          )}
          <div style={{ marginTop: 16 }}>
            <button
              type="button"
              onClick={handleLogout}
              style={{ border: '1px solid #bbb', borderRadius: 8, background: '#fff', padding: '8px 14px', cursor: 'pointer' }}
            >
              Logout
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'Segoe UI, sans-serif' }}>
      <section style={{ width: 'min(520px, 92vw)', border: '1px solid #ddd', borderRadius: 14, padding: 24 }}>
        <h1 style={{ marginTop: 0 }}>Google Sign-In</h1>
        <p>Standard Google UI button with backend token verification.</p>

        <GoogleLogin onSuccess={handleSuccess} onError={() => setError('Google login popup failed')} />

        {loading ? <p>Verifying token...</p> : null}
        {error ? <p style={{ color: '#b00020', fontWeight: 600 }}>{error}</p> : null}
      </section>
    </main>
  );
}
