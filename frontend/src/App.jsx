import React from 'react';
import { useEffect, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { changeAdminPassword, loginAdmin, loginWithGoogle } from './api';
import ResourceCategoryPage from './catalog/ResourceCategoryPage';
import AdminBookingsPage from './booking/AdminBookingsPage';
import ResourceManagementPage from './catalog/ResourceManagementPage';
import UserBookingRequestPage from './booking/UserBookingRequestPage';
import UserBookingsPage from './booking/UserBookingsPage';
import IncidentTicketCreatePage from './incident/IncidentTicketCreatePage';
import MyIncidentTicketsPage from './incident/MyIncidentTicketsPage';
import AdminIncidentTicketsPage from './incident/AdminIncidentTicketsPage';
import UserResourceLandingPage from './catalog/UserResourceLandingPage';
import UserResourceTypePage from './catalog/UserResourceTypePage';
import './App.css';

export default function App() {
  const [googleUser, setGoogleUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState(getRoute(window.location.pathname));
  const [adminLoginForm, setAdminLoginForm] = useState({
    email: '',
    password: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [adminMessage, setAdminMessage] = useState('');

  function getRoute(pathname) {
    const allowedRoutes = [
      '/',
      '/home',
      '/admin/dashboard',
      '/admin/profile',
      '/admin/resources',
      '/admin/resources/lecture-halls',
      '/admin/resources/meeting-rooms',
      '/admin/resources/equipment',
      '/admin/bookings',
      '/admin/incidents',
      '/resources',
      '/resources/lecture-halls',
      '/resources/meeting-rooms',
      '/resources/equipment',
      '/my-bookings',
      '/my-tickets',
    ];

    if (pathname.startsWith('/resources/lecture-halls/') && pathname.endsWith('/book')) {
      return pathname;
    }
    if (pathname.startsWith('/resources/meeting-rooms/') && pathname.endsWith('/book')) {
      return pathname;
    }
    if (pathname.startsWith('/resources/equipment/') && pathname.endsWith('/book')) {
      return pathname;
    }
    if (pathname.startsWith('/incidents/new/')) {
      return pathname;
    }

    return allowedRoutes.includes(pathname) ? pathname : '/';
  }

  const navigate = (nextRoute) => {
    window.history.pushState({}, '', nextRoute);
    setRoute(nextRoute);
  };

  useEffect(() => {
    const handlePopState = () => {
      setRoute(getRoute(window.location.pathname));
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
      setGoogleUser(data);
      setAdminUser(null);
      navigate('/home');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google login failed');
      setGoogleUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setAdminMessage('');

    try {
      const admin = await loginAdmin(adminLoginForm.email, adminLoginForm.password);
      setAdminUser(admin);
      setGoogleUser(null);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      navigate('/admin/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Admin login failed');
      setAdminUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminPasswordChange = async (event) => {
    event.preventDefault();

    if (!adminUser) {
      setError('Admin session not found. Please log in again.');
      return;
    }

    setLoading(true);
    setError('');
    setAdminMessage('');

    try {
      const result = await changeAdminPassword(adminUser.email, passwordForm.currentPassword, passwordForm.newPassword);
      setAdminMessage(result.message || 'Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Password update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setGoogleUser(null);
    setAdminUser(null);
    setError('');
    setAdminMessage('');
    setPasswordForm({ currentPassword: '', newPassword: '' });
    navigate('/');
  };

  if (route === '/home') {
    return (
      <main className="scene">
        <section className="panel panel--content">
          <nav className="site-nav" aria-label="Main navigation">
            <div className="site-nav__brand">
              <span className="site-nav__dot" aria-hidden="true" />
              <div>
                <p className="site-nav__kicker">Smart Campus</p>
                <strong>Resource Portal</strong>
              </div>
            </div>
            <div className="site-nav__links">
              <button type="button" className="site-nav__link is-active" onClick={() => navigate('/home')}>
                Home
              </button>
              <button type="button" className="site-nav__link" onClick={() => navigate('/resources')}>
                Resources
              </button>
              <button type="button" className="site-nav__link" onClick={() => navigate('/my-bookings')}>
                My Bookings
              </button>
              <button type="button" className="site-nav__link" onClick={() => navigate('/my-tickets')}>
                My Tickets
              </button>
              <button type="button" className="site-nav__link" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </nav>
          <h1 className="panel__title">Home Page</h1>
          {!googleUser ? (
            <p>Login session is not available. Please go back and sign in again.</p>
          ) : (
            <>
              <p>Welcome to the home page.</p>
              <p><strong>Name:</strong> {googleUser.name}</p>
              <p><strong>Email:</strong> {googleUser.email}</p>
              {googleUser.picture ? <img src={googleUser.picture} alt="profile" width="72" height="72" className="avatar" /> : null}
            </>
          )}
        </section>
      </main>
    );
  }

  if (route === '/resources') {
    return <UserResourceLandingPage navigate={navigate} onBack={() => navigate('/home')} onLogout={handleLogout} />;
  }

  if (route === '/resources/lecture-halls') {
    return <UserResourceTypePage categorySlug="lecture-halls" navigate={navigate} onBack={() => navigate('/resources')} onLogout={handleLogout} />;
  }

  if (route === '/resources/meeting-rooms') {
    return <UserResourceTypePage categorySlug="meeting-rooms" navigate={navigate} onBack={() => navigate('/resources')} onLogout={handleLogout} />;
  }

  if (route === '/resources/equipment') {
    return <UserResourceTypePage categorySlug="equipment" navigate={navigate} onBack={() => navigate('/resources')} onLogout={handleLogout} />;
  }

  if (route === '/my-bookings') {
    return <UserBookingsPage user={googleUser} navigate={navigate} onLogout={handleLogout} />;
  }

  if (route === '/my-tickets') {
    return <MyIncidentTicketsPage user={googleUser} navigate={navigate} onLogout={handleLogout} />;
  }

  if (route.startsWith('/resources/') && route.endsWith('/book')) {
    const parts = route.split('/').filter(Boolean);
    const categorySlug = parts[1];
    const resourceId = parts[2];
    return <UserBookingRequestPage categorySlug={categorySlug} resourceId={resourceId} user={googleUser} navigate={navigate} onLogout={handleLogout} />;
  }

  if (route.startsWith('/incidents/new/')) {
    const parts = route.split('/').filter(Boolean);
    const resourceId = parts[2];
    const bookingId = parts[3] || '';
    return <IncidentTicketCreatePage resourceId={resourceId} bookingId={bookingId} user={googleUser} navigate={navigate} onLogout={handleLogout} />;
  }

  if (route === '/admin/profile') {
    return (
      <main className="scene scene--admin">
        <section className="panel panel--content admin-panel">
          <h1 className="panel__title">Admin Profile</h1>
          {!adminUser ? (
            <p>Admin session not found. Please log in again.</p>
          ) : (
            <>
              <p><strong>Role:</strong> Administrator</p>

              <h2 className="panel__subtitle">Change Password</h2>
              <form onSubmit={handleAdminPasswordChange} className="stack-form">
                <label className="field-label" htmlFor="current-admin-password">Current Password<span className="required-mark">*</span></label>
                <input
                  id="current-admin-password"
                  type="password"
                  placeholder="Current password"
                  value={passwordForm.currentPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                  required
                  className="input"
                />
                <label className="field-label" htmlFor="new-admin-password">New Password<span className="required-mark">*</span></label>
                <input
                  id="new-admin-password"
                  type="password"
                  placeholder="New password"
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                  required
                  minLength={6}
                  className="input"
                />
                <button type="submit" disabled={loading} className="btn btn--primary">
                  {loading ? 'Saving...' : 'Update Password'}
                </button>
              </form>
            </>
          )}

          {adminMessage ? <p className="msg msg--success">{adminMessage}</p> : null}
          {error ? <p className="msg msg--error">{error}</p> : null}

          <div className="actions-row">
            <button type="button" onClick={() => navigate('/admin/dashboard')} className="btn btn--ghost">
              Back to Dashboard
            </button>
            <button type="button" onClick={handleLogout} className="btn btn--ghost">
              Logout
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (route === '/admin/dashboard') {
    return (
      <main className="scene scene--admin">
        <section className="panel panel--content admin-panel">
          <h1 className="panel__title">Admin Dashboard</h1>
          {!adminUser ? <p>Admin session not found. Please sign in again.</p> : <p>Welcome to the admin dashboard.</p>}

          <div className="actions-row">
            <button type="button" onClick={() => navigate('/admin/resources')} className="btn btn--primary">
              Resource Management
            </button>
            <button type="button" onClick={() => navigate('/admin/bookings')} className="btn btn--primary">
              Booking Management
            </button>
            <button type="button" onClick={() => navigate('/admin/incidents')} className="btn btn--primary">
              Incident Tickets
            </button>
            <button type="button" onClick={() => navigate('/admin/profile')} className="btn btn--primary">
              Go to Profile
            </button>
            <button type="button" onClick={handleLogout} className="btn btn--ghost">
              Logout
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (route === '/admin/resources') {
    return <ResourceManagementPage navigate={navigate} onBack={() => navigate('/admin/dashboard')} />;
  }

  if (route === '/admin/resources/lecture-halls') {
    return <ResourceCategoryPage categorySlug="lecture-halls" navigate={navigate} onBack={() => navigate('/admin/resources')} />;
  }

  if (route === '/admin/resources/meeting-rooms') {
    return <ResourceCategoryPage categorySlug="meeting-rooms" navigate={navigate} onBack={() => navigate('/admin/resources')} />;
  }

  if (route === '/admin/resources/equipment') {
    return <ResourceCategoryPage categorySlug="equipment" navigate={navigate} onBack={() => navigate('/admin/resources')} />;
  }

  if (route === '/admin/bookings') {
    return <AdminBookingsPage navigate={navigate} />;
  }

  if (route === '/admin/incidents') {
    return <AdminIncidentTicketsPage adminUser={adminUser} navigate={navigate} onLogout={handleLogout} />;
  }

  return (
    <main className="login-scene">
      <section className="login-shell">
        <div className="login-form-side">
          <p className="kicker">SMART CAMPUS PORTAL</p>
          <h1 className="title">LOGIN</h1>
          <p className="subtitle">Access your account using admin credentials or Google.</p>

          <form onSubmit={handleAdminLogin} className="stack-form" autoComplete="off">
            <label className="field-label" htmlFor="admin-email">Username<span className="required-mark">*</span></label>
            <input
              id="admin-email"
              name="admin-username"
              type="email"
              placeholder="Enter admin email"
              value={adminLoginForm.email}
              onChange={(event) => setAdminLoginForm((current) => ({ ...current, email: event.target.value }))}
              required
              autoComplete="off"
              spellCheck={false}
              className="input"
            />
            <label className="field-label" htmlFor="admin-password">Password<span className="required-mark">*</span></label>
            <input
              id="admin-password"
              name="admin-password"
              type="password"
              placeholder="Enter password"
              value={adminLoginForm.password}
              onChange={(event) => setAdminLoginForm((current) => ({ ...current, password: event.target.value }))}
              required
              autoComplete="new-password"
              className="input"
            />
            <button type="submit" disabled={loading} className="btn btn--primary btn--wide">
              {loading ? 'Signing in...' : 'Login now'}
            </button>
          </form>

          <div className="divider"><span>Login with others</span></div>
          <div className="oauth-wrap">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => setError('Google login popup failed')}
              width="380"
            />
          </div>

          {loading ? <p className="muted">Processing login...</p> : null}
          {error ? <p className="msg msg--error">{error}</p> : null}
        </div>

        <aside className="login-visual-side">
          <div className="visual-card">
            <p className="visual-head">Ready to work?</p>
            <h2>Smart campus tools are waiting for your login.</h2>
            <div className="visual-art">
              <div className="orb orb--one" />
              <div className="orb orb--two" />
              <div className="person-silhouette" />
            </div>
          </div>
          <div className="spark">✦</div>
        </aside>
      </section>
    </main>
  );
}
