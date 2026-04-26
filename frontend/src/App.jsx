import React from 'react';
import { useEffect, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import {
  changeAdminPassword,
  listAdminBookings,
  listAdminIncidentTickets,
  listResources,
  loginAdmin,
  loginWithGoogle,
  updateBookingStatus,
} from './api';
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
import TechnicianDashboardPage from './tech/TechnicianDashboardPage';
import TechnicianResolvedTicketsPage from './tech/TechnicianResolvedTicketsPage';
import { openNotifications } from './notification/notificationBus';
import './App.css';

export default function App() {
  const ADMIN_SESSION_KEY = 'adminUserSession';
  const GOOGLE_SESSION_KEY = 'googleUserSession';
  const [googleUser, setGoogleUser] = useState(() => {
    try {
      const raw = window.localStorage.getItem(GOOGLE_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const raw = window.localStorage.getItem(ADMIN_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
    const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState(getRoute(window.location.pathname));
  const [adminLoginForm, setAdminLoginForm] = useState({
    email: '',
    password: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
    const [adminSummary, setAdminSummary] = useState({
    totalResources: 0,
    totalBookings: 0,
    totalIncidents: 0,
    pendingBookings: 0,
    activeIncidents: 0,
    resolvedIncidents: 0,
  });
  const [adminSummaryLoading, setAdminSummaryLoading] = useState(false);
  const [adminSummaryError, setAdminSummaryError] = useState('');
  const [adminBookingsData, setAdminBookingsData] = useState([]);
  const [adminIncidentsData, setAdminIncidentsData] = useState([]);
  const [adminActionBusy, setAdminActionBusy] = useState('');

  const isTechnicianUser = (user) => {
    const role = (user?.role || '').toUpperCase();
    return role === 'TECHNICIAN';
  };

  function getRoute(pathname) {
    const allowedRoutes = [
      '/',
      '/home',
      '/resources',
      '/resources/lecture-halls',
      '/resources/meeting-rooms',
      '/resources/equipment',
      '/resources/labs',
      '/admin/resources/lecture-halls',
      '/admin/resources/meeting-rooms',
      '/admin/resources/equipment',
      '/admin/resources/labs',
      '/my-bookings',
      '/my-tickets',
      '/admin/dashboard',
      '/admin/profile',
      '/admin/resources',
      '/admin/bookings',
      '/admin/incidents',
      '/tech/dashboard',
      '/tech/resolved',
    ];

    // Check exact match first
    if (allowedRoutes.includes(pathname)) {
      return pathname;
    }

    // Check dynamic routes
    if (pathname.startsWith('/resources/') && pathname.endsWith('/book')) {
      return pathname;
    }
    if (pathname.startsWith('/admin/resources/') && pathname.endsWith('/book')) {
      return pathname;
    }
    if (pathname.startsWith('/incidents/new/')) {
      return pathname;
    }

    return '/';
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

  useEffect(() => {
    const shouldLoadSummary =
      route === '/admin/dashboard' &&
      !!adminUser &&
      String(adminUser?.role || '').toUpperCase() === 'ADMIN';

    if (!shouldLoadSummary) {
      return;
    }

    let isActive = true;

    const loadAdminSummary = async () => {
      setAdminSummaryLoading(true);
      setAdminSummaryError('');

      try {
        const [resources, bookings, incidents] = await Promise.all([
          listResources(),
          listAdminBookings({}),
          listAdminIncidentTickets({}),
        ]);

        if (!isActive) {
          return;
        }

        const pendingBookings = bookings.filter((booking) => booking.status === 'PENDING').length;
        const activeIncidents = incidents.filter((ticket) => ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS').length;
        const resolvedIncidents = incidents.filter((ticket) => ticket.status === 'RESOLVED' || ticket.status === 'CLOSED').length;

        setAdminBookingsData(bookings);
        setAdminIncidentsData(incidents);

        setAdminSummary({
          totalResources: resources.length,
          totalBookings: bookings.length,
          totalIncidents: incidents.length,
          pendingBookings,
          activeIncidents,
          resolvedIncidents,
        });
      } catch (e) {
        if (!isActive) {
          return;
        }

        setAdminSummaryError(e instanceof Error ? e.message : 'Failed to load admin summary');
      } finally {
        if (isActive) {
          setAdminSummaryLoading(false);
        }
      }
    };

    loadAdminSummary();

    return () => {
      isActive = false;
    };
  }, [route, adminUser]);

  const formatShortDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const toDateOnlyValue = (value) => {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    date.setHours(0, 0, 0, 0);
    return date;
  };

  const buildLast7Days = () => {
    const days = [];
    const current = new Date();
    current.setHours(0, 0, 0, 0);

    for (let offset = 6; offset >= 0; offset -= 1) {
      const day = new Date(current);
      day.setDate(current.getDate() - offset);
      const key = day.toISOString().slice(0, 10);
      days.push({ key, label: day.toLocaleDateString('en-US', { weekday: 'short' }) });
    }

    return days;
  };

  const handleDashboardBookingAction = async (bookingId, nextStatus) => {
    setAdminActionBusy(`${bookingId}:${nextStatus}`);

    try {
      await updateBookingStatus(bookingId, adminUser?.email || '', nextStatus);
      const [bookings, incidents] = await Promise.all([
        listAdminBookings({}),
        listAdminIncidentTickets({}),
      ]);

      setAdminBookingsData(bookings);
      setAdminIncidentsData(incidents);
      setAdminSummary((current) => ({
        ...current,
        totalBookings: bookings.length,
        totalIncidents: incidents.length,
        pendingBookings: bookings.filter((booking) => booking.status === 'PENDING').length,
        activeIncidents: incidents.filter((ticket) => ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS').length,
        resolvedIncidents: incidents.filter((ticket) => ticket.status === 'RESOLVED' || ticket.status === 'CLOSED').length,
      }));
    } catch (e) {
      setAdminSummaryError(e instanceof Error ? e.message : 'Failed to update booking status');
    } finally {
      setAdminActionBusy('');
    }
  };

  const handleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) {
            return;
    }

    setLoading(true);
    try {
      const data = await loginWithGoogle(credentialResponse.credential);
      setGoogleUser(data);
      window.localStorage.setItem(GOOGLE_SESSION_KEY, JSON.stringify(data));
      setAdminUser(null);
      window.localStorage.removeItem(ADMIN_SESSION_KEY);
      navigate('/home');
    } catch (e) {
            setGoogleUser(null);
      window.localStorage.removeItem(GOOGLE_SESSION_KEY);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const admin = await loginAdmin(adminLoginForm.email, adminLoginForm.password);
      setAdminUser(admin);
      window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(admin));
      setGoogleUser(null);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      if (isTechnicianUser(admin)) {
        navigate('/tech/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (e) {
            setAdminUser(null);
      window.localStorage.removeItem(ADMIN_SESSION_KEY);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminPasswordChange = async (event) => {
    event.preventDefault();

    if (!adminUser) {
            return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return;
    }

    setLoading(true);
    try {
      const result = await changeAdminPassword(adminUser.email, passwordForm.currentPassword, passwordForm.newPassword);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) {
          } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setGoogleUser(null);
    window.localStorage.removeItem(GOOGLE_SESSION_KEY);
    setAdminUser(null);
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
    setPasswordForm({ currentPassword: '', newPassword: '' });
    navigate('/');
  };

  if (route === '/home') {
    return (
      <main className="home-scene">
        <section className="home-shell">
          <nav className="home-nav" aria-label="Main navigation">
            <div className="home-nav__brand">
              <span className="home-nav__dot" aria-hidden="true" />
              <img src="/sliit-logo.png" alt="SLIIT" className="home-nav__logo" />
              <strong>SLIIT</strong>
            </div>
            <div className="home-nav__links">
              <button type="button" className="home-nav__link is-active" onClick={() => navigate('/home')}>
                Home
              </button>
              <button type="button" className="home-nav__link" onClick={() => navigate('/resources')}>
                Resources
              </button>
              <button type="button" className="home-nav__link" onClick={() => navigate('/my-bookings')}>
                My Bookings
              </button>
              <button type="button" className="home-nav__link" onClick={() => navigate('/my-tickets')}>
                My Tickets
              </button>
              <button type="button" className="home-nav__link" onClick={openNotifications}>
                Notifications
              </button>
              <button type="button" className="home-nav__link" onClick={handleLogout}>
                Logout
              </button>
            </div>

            <div className="home-nav__user" aria-label="Logged in user">
              <span className="home-nav__user-name">{googleUser?.name || 'Campus User'}</span>
              {googleUser?.picture ? (
                <img src={googleUser.picture} alt={googleUser?.name || 'User'} className="home-nav__user-avatar" />
              ) : (
                <span className="home-nav__user-fallback" aria-hidden="true">
                  {(googleUser?.name || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </nav>

          <section className="home-hero">
            <div className="home-hero__content">
              <p className="home-hero__kicker">RESOURCE MANAGEMENT PORTAL</p>
              <h1 className="home-hero__title">
                <span className="home-hero__line">NAVIGATE YOUR</span>
                <span className="home-hero__line home-hero__line--accent">CAMPUS LIFE.</span>
                <span className="home-hero__line home-hero__line--compact">SMART, SIMPLE, SEAMLESS.</span>
              </h1>
              <p className="home-hero__text">
                Manage campus resources in one place. Book lecture halls, meeting rooms, and equipment faster while tracking tickets and notifications in real time.
              </p>

            </div>

            <div className="home-hero__image-panel" aria-label="Graduate hero image" />

          </section>

          <section className="home-facilities">
            <h2 className="home-facilities__title">Our Facilities</h2>
            <p className="home-facilities__subtitle">Explore our state-of-the-art campus facilities designed for your success</p>

            <div className="home-facilities__grid">
              <div className="facility-card">
                <img src="/com lab.jpg" alt="Computer Lab" className="facility-card__image" />
                <h3 className="facility-card__title">Computer Lab</h3>
              </div>

              <div className="facility-card">
                <img src="/lec hall.jpg" alt="Lecture Hall" className="facility-card__image" />
                <h3 className="facility-card__title">Lecture Hall</h3>
              </div>

              <div className="facility-card">
                <img src="/eng lab.jpg" alt="Engineering Lab" className="facility-card__image" />
                <h3 className="facility-card__title">Engineering Lab</h3>
              </div>

              <div className="facility-card">
                <img src="/audi.jpg" alt="Auditorium" className="facility-card__image" />
                <h3 className="facility-card__title">Auditorium</h3>
              </div>

              <div className="facility-card">
                <img src="/bio lab.jpeg" alt="Biology Lab" className="facility-card__image" />
                <h3 className="facility-card__title">Biology Lab</h3>
              </div>

              <div className="facility-card">
                <img src="/lib.jpeg" alt="Library" className="facility-card__image" />
                <h3 className="facility-card__title">Library</h3>
              </div>
            </div>
          </section>
        </section>

        <footer className="home-footer">
          <div className="home-footer__content">
            <div className="home-footer__section">
              <div className="home-footer__brand">
                <img src="/sliit-logo.png" alt="SLIIT" className="home-footer__logo" />
                <strong>SLIIT</strong>
              </div>
              <p className="home-footer__tagline">
                Sri Lanka Institute of Information Technology
              </p>
              <p className="home-footer__description">
                Empowering students with smart resource management and seamless campus experience.
              </p>
            </div>

            <div className="home-footer__section">
              <h4 className="home-footer__heading">Quick Links</h4>
              <ul className="home-footer__links">
                <li><button type="button" onClick={() => navigate('/resources')}>Resources</button></li>
                <li><button type="button" onClick={() => navigate('/my-bookings')}>My Bookings</button></li>
                <li><button type="button" onClick={() => navigate('/my-tickets')}>My Tickets</button></li>
                <li><button type="button" onClick={openNotifications}>Notifications</button></li>
              </ul>
            </div>

            <div className="home-footer__section">
              <h4 className="home-footer__heading">Resources</h4>
              <ul className="home-footer__links">
                <li><button type="button" onClick={() => navigate('/resources/lecture-halls')}>Lecture Halls</button></li>
                <li><button type="button" onClick={() => navigate('/resources/meeting-rooms')}>Meeting Rooms</button></li>
                <li><button type="button" onClick={() => navigate('/resources/equipment')}>Equipment</button></li>
                <li><button type="button" onClick={() => navigate('/resources/labs')}>Labs</button></li>
              </ul>
            </div>

            <div className="home-footer__section">
              <h4 className="home-footer__heading">Contact</h4>
              <ul className="home-footer__contact">
                <li>📧 support@sliit.lk</li>
                <li>📞 +94 11 754 4801</li>
                <li>📍 New Kandy Road, Malabe</li>
                <li>🕒 Mon - Fri: 8:00 AM - 5:00 PM</li>
              </ul>
            </div>
          </div>

          <div className="home-footer__bottom">
            <p>&copy; 2026 SLIIT. All rights reserved.</p>
            <div className="home-footer__social">
              <a href="#" aria-label="Facebook">FB</a>
              <a href="#" aria-label="Twitter">TW</a>
              <a href="#" aria-label="LinkedIn">IN</a>
              <a href="#" aria-label="Instagram">IG</a>
            </div>
          </div>
        </footer>
      </main>
    );
  }

  if (route === '/resources') {
    return <UserResourceLandingPage user={googleUser} navigate={navigate} onBack={() => navigate('/home')} onLogout={handleLogout} />;
  }

  if (route === '/resources/lecture-halls') {
    return <UserResourceTypePage user={googleUser} categorySlug="lecture-halls" navigate={navigate} onBack={() => navigate('/resources')} onLogout={handleLogout} />;
  }

  if (route === '/resources/meeting-rooms') {
    return <UserResourceTypePage user={googleUser} categorySlug="meeting-rooms" navigate={navigate} onBack={() => navigate('/resources')} onLogout={handleLogout} />;
  }

  if (route === '/resources/equipment') {
    return <UserResourceTypePage user={googleUser} categorySlug="equipment" navigate={navigate} onBack={() => navigate('/resources')} onLogout={handleLogout} />;
  }

  if (route === '/resources/labs') {
    return <UserResourceTypePage user={googleUser} categorySlug="labs" navigate={navigate} onBack={() => navigate('/resources')} onLogout={handleLogout} />;
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
          <nav className="site-nav" aria-label="Admin navigation">
            <div className="site-nav__brand">
              <span className="site-nav__dot" aria-hidden="true" />
              <div>
                <p className="site-nav__kicker">Smart Campus</p>
                <strong>Admin Portal</strong>
              </div>
            </div>
            <div className="site-nav__links">
              <button type="button" className="site-nav__link" onClick={() => navigate('/admin/dashboard')}>
                Dashboard
              </button>
              <button type="button" className="site-nav__link" onClick={() => navigate('/admin/resources')}>
                Resources
              </button>
              <button type="button" className="site-nav__link" onClick={() => navigate('/admin/bookings')}>
                Bookings
              </button>
              <button type="button" className="site-nav__link" onClick={() => navigate('/admin/incidents')}>
                Tickets
              </button>
              <button type="button" className="site-nav__link is-active" onClick={() => navigate('/admin/profile')}>
                Profile
              </button>
              <button type="button" className="site-nav__link site-nav__link--notifications" onClick={openNotifications}>
                Notifications
              </button>
              <button type="button" className="site-nav__link" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </nav>

          <div className="admin-profile-container">
            <div className="admin-profile-card">
              <div className="admin-profile-header">
                <h1 className="admin-profile-title">Admin Profile</h1>
                <p className="admin-profile-role"><strong>Role:</strong> Administrator</p>
              </div>

              {!adminUser ? (
                <p className="msg msg--error">Admin session not found. Please log in again.</p>
              ) : (
                <div className="admin-profile-content">
                  <h2 className="admin-profile-section-title">Change Password</h2>                  <form onSubmit={handleAdminPasswordChange} className="admin-profile-form">
                    <div className="form-field">
                      <label className="field-label" htmlFor="current-admin-password">
                        Current Password<span className="required-mark">*</span>
                      </label>
                      <input
                        id="current-admin-password"
                        type="password"
                        placeholder="Enter current password"
                        value={passwordForm.currentPassword}
                        onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                        required
                        className="input"
                      />
                    </div>

                    <div className="form-field">
                      <label className="field-label" htmlFor="new-admin-password">
                        New Password<span className="required-mark">*</span>
                      </label>
                      <input
                        id="new-admin-password"
                        type="password"
                        placeholder="Enter new password (min 6 characters)"
                        value={passwordForm.newPassword}
                        onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                        required
                        minLength={6}
                        className="input"
                      />
                    </div>

                    <div className="form-field">
                      <label className="field-label" htmlFor="confirm-admin-password">
                        Confirm Password<span className="required-mark">*</span>
                      </label>
                      <input
                        id="confirm-admin-password"
                        type="password"
                        placeholder="Re-enter new password"
                        value={passwordForm.confirmPassword}
                        onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                        required
                        minLength={6}
                        className="input"
                      />
                    </div>

                    <button type="submit" disabled={loading} className="btn btn--primary btn--full">
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>

                  <div className="admin-profile-actions">
                    <button type="button" onClick={() => navigate('/admin/dashboard')} className="btn btn--ghost">
                      Back to Dashboard
                    </button>
                    <button type="button" onClick={handleLogout} className="btn btn--ghost">
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (route === '/admin/dashboard') {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const urgentPendingBookings = adminBookingsData
      .filter((booking) => booking.status === 'PENDING')
      .filter((booking) => {
        const bookingDay = toDateOnlyValue(booking.bookingDate);
        if (!bookingDay) {
          return false;
        }
        const diffDays = Math.floor((bookingDay.getTime() - now.getTime()) / 86400000);
        return diffDays <= 1;
      })
      .slice(0, 5);

    const urgentUnassignedIncidents = adminIncidentsData
      .filter((ticket) => ticket.status === 'OPEN' && !ticket.assignedTechnicianEmail)
      .slice(0, 5);

    const approvalItems = adminBookingsData
      .filter((booking) => booking.status === 'PENDING')
      .slice(0, 6);

    const trendDays = buildLast7Days();
    const bookingTrendMap = trendDays.reduce((acc, day) => ({ ...acc, [day.key]: 0 }), {});
    const incidentTrendMap = trendDays.reduce((acc, day) => ({ ...acc, [day.key]: 0 }), {});

    adminBookingsData.forEach((booking) => {
      const date = toDateOnlyValue(booking.bookingDate);
      if (!date) {
        return;
      }
      const key = date.toISOString().slice(0, 10);
      if (Object.prototype.hasOwnProperty.call(bookingTrendMap, key)) {
        bookingTrendMap[key] += 1;
      }
    });

    adminIncidentsData.forEach((ticket) => {
      const date = toDateOnlyValue(ticket.createdAt);
      if (!date) {
        return;
      }
      const key = date.toISOString().slice(0, 10);
      if (Object.prototype.hasOwnProperty.call(incidentTrendMap, key)) {
        incidentTrendMap[key] += 1;
      }
    });

    const trendRows = trendDays.map((day) => ({
      label: day.label,
      key: day.key,
      bookings: bookingTrendMap[day.key],
      incidents: incidentTrendMap[day.key],
    }));

    const maxTrendValue = Math.max(1, ...trendRows.map((row) => Math.max(row.bookings, row.incidents)));

    return (
      <main className="scene scene--admin">
        <section className="panel panel--content admin-panel">
          <nav className="site-nav" aria-label="Admin navigation">
            <div className="site-nav__brand">
              <span className="site-nav__dot" aria-hidden="true" />
              <div>
                <p className="site-nav__kicker">Smart Campus</p>
                <strong>Admin Portal</strong>
              </div>
            </div>
            <div className="site-nav__links">
              <button type="button" className="site-nav__link is-active" onClick={() => navigate('/admin/dashboard')}>
                Dashboard
              </button>
              <button type="button" className="site-nav__link" onClick={() => navigate('/admin/resources')}>
                Resources
              </button>
              <button type="button" className="site-nav__link" onClick={() => navigate('/admin/bookings')}>
                Bookings
              </button>
              <button type="button" className="site-nav__link" onClick={() => navigate('/admin/incidents')}>
                Tickets
              </button>
              <button type="button" className="site-nav__link" onClick={() => navigate('/admin/profile')}>
                Profile
              </button>
              <button type="button" className="site-nav__link site-nav__link--notifications" onClick={openNotifications}>
                Notifications
              </button>
              <button type="button" className="site-nav__link" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </nav>

          <div className="admin-dashboard-hero">
            <p className="admin-dashboard-hero__kicker">ADMIN CONTROL CENTER</p>
            <h1 className="admin-dashboard-hero__title">Admin Dashboard</h1>
            <p className="admin-dashboard-hero__subtitle">
              Monitor system activity, manage approvals, and oversee campus resources in real-time.
            </p>
          </div>

          {!adminUser ? <p className="msg msg--error">Admin session not found. Please sign in again.</p> : null}
          {adminSummaryLoading ? <p className="muted">Loading admin summary...</p> : null}
          {adminSummaryError ? <p className="msg msg--error">{adminSummaryError}</p> : null}

          {!adminSummaryLoading && !adminSummaryError ? (
            <>
              <div className="resource-cards admin-dashboard-summary" aria-label="Admin work summary">
                <article className="resource-card" style={{ cursor: 'default' }}>
                  <p className="resource-card__tag">Resources</p>
                  <h2>{adminSummary.totalResources}</h2>
                  <p>Total managed resources</p>
                </article>
                <article className="resource-card" style={{ cursor: 'default' }}>
                  <p className="resource-card__tag">Bookings</p>
                  <h2>{adminSummary.totalBookings}</h2>
                  <p>All booking records</p>
                </article>
                <article className="resource-card" style={{ cursor: 'default' }}>
                  <p className="resource-card__tag">Pending Bookings</p>
                  <h2>{adminSummary.pendingBookings}</h2>
                  <p>Awaiting admin action</p>
                </article>
                <article className="resource-card" style={{ cursor: 'default' }}>
                  <p className="resource-card__tag">Incident Tickets</p>
                  <h2>{adminSummary.totalIncidents}</h2>
                  <p>All submitted incidents</p>
                </article>
                <article className="resource-card" style={{ cursor: 'default' }}>
                  <p className="resource-card__tag">Active Incidents</p>
                  <h2>{adminSummary.activeIncidents}</h2>
                  <p>Open and in-progress tickets</p>
                </article>
                <article className="resource-card" style={{ cursor: 'default' }}>
                  <p className="resource-card__tag">Resolved</p>
                  <h2>{adminSummary.resolvedIncidents}</h2>
                  <p>Resolved or closed tickets</p>
                </article>
              </div>

              <div className="admin-dashboard-grid">
                <section className="admin-dashboard-panel" aria-label="Urgent queue">
                  <h2>Urgent Queue</h2>
                  <p className="admin-dashboard-panel__hint">Items that need immediate admin attention.</p>

                  <div className="admin-dashboard-list">
                    {urgentPendingBookings.map((booking) => (
                      <article key={booking.id} className="admin-dashboard-list__item">
                        <div>
                          <strong>{booking.resourceName}</strong>
                          <p>{booking.userName} - {formatShortDate(booking.bookingDate)}</p>
                        </div>
                        <span className="status-pill admin-status-pill admin-status-pill--pending">PENDING</span>
                      </article>
                    ))}

                    {urgentUnassignedIncidents.map((ticket) => (
                      <article key={ticket.id} className="admin-dashboard-list__item">
                        <div>
                          <strong>{ticket.resourceName}</strong>
                          <p>{ticket.reporterName} - Unassigned</p>
                        </div>
                        <span className="incident-badge ticket-status-badge ticket-status--open">OPEN</span>
                      </article>
                    ))}

                    {!urgentPendingBookings.length && !urgentUnassignedIncidents.length ? (
                      <p className="muted">No urgent items right now.</p>
                    ) : null}
                  </div>
                </section>

                <section className="admin-dashboard-panel" aria-label="Approval center">
                  <h2>Approval Center</h2>
                  <p className="admin-dashboard-panel__hint">Approve or reject pending bookings quickly.</p>

                  <div className="admin-dashboard-list">
                    {approvalItems.map((booking) => {
                      const approveBusy = adminActionBusy === `${booking.id}:APPROVED`;
                      const rejectBusy = adminActionBusy === `${booking.id}:REJECTED`;
                      const isBusy = approveBusy || rejectBusy;

                      return (
                        <article key={booking.id} className="admin-dashboard-list__item admin-dashboard-list__item--actions">
                          <div>
                            <strong>{booking.resourceName}</strong>
                            <p>{booking.userName} - {formatShortDate(booking.bookingDate)}</p>
                          </div>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="btn btn--ghost btn--compact admin-action-btn"
                              onClick={() => handleDashboardBookingAction(booking.id, 'APPROVED')}
                              disabled={isBusy}
                            >
                              {approveBusy ? 'Approving...' : 'Approve'}
                            </button>
                            <button
                              type="button"
                              className="btn btn--ghost btn--compact admin-action-btn"
                              onClick={() => handleDashboardBookingAction(booking.id, 'REJECTED')}
                              disabled={isBusy}
                            >
                              {rejectBusy ? 'Rejecting...' : 'Reject'}
                            </button>
                          </div>
                        </article>
                      );
                    })}

                    {!approvalItems.length ? <p className="muted">No pending approvals.</p> : null}
                  </div>
                </section>

                <section className="admin-dashboard-panel admin-dashboard-panel--full" aria-label="7 day trend charts">
                  <h2>7-day Trend Charts</h2>
                  <p className="admin-dashboard-panel__hint">Daily booking and incident volumes for the last seven days.</p>

                  <div className="admin-trend-chart" role="img" aria-label="Bookings and incidents trend for the last seven days">
                    {trendRows.map((row) => {
                      const bookingHeight = Math.max(8, Math.round((row.bookings / maxTrendValue) * 90));
                      const incidentHeight = Math.max(8, Math.round((row.incidents / maxTrendValue) * 90));

                      return (
                        <div key={row.key} className="admin-trend-chart__day">
                          <div className="admin-trend-chart__bars">
                            <span className="admin-trend-chart__bar admin-trend-chart__bar--bookings" style={{ height: `${bookingHeight}px` }} title={`Bookings: ${row.bookings}`} />
                            <span className="admin-trend-chart__bar admin-trend-chart__bar--incidents" style={{ height: `${incidentHeight}px` }} title={`Incidents: ${row.incidents}`} />
                          </div>
                          <span className="admin-trend-chart__label">{row.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="admin-trend-chart__legend">
                    <span><i className="admin-trend-chart__dot admin-trend-chart__dot--bookings" /> Bookings</span>
                    <span><i className="admin-trend-chart__dot admin-trend-chart__dot--incidents" /> Incidents</span>
                  </div>
                </section>
              </div>
            </>
          ) : null}
        </section>
      </main>
    );
  }

  if (route === '/admin/resources') {
    return <ResourceManagementPage navigate={navigate} onLogout={handleLogout} />;
  }

  if (route === '/admin/resources/lecture-halls') {
    return <ResourceCategoryPage categorySlug="lecture-halls" adminUser={adminUser} navigate={navigate} onLogout={handleLogout} />;
  }

  if (route === '/admin/resources/meeting-rooms') {
    return <ResourceCategoryPage categorySlug="meeting-rooms" adminUser={adminUser} navigate={navigate} onLogout={handleLogout} />;
  }

  if (route === '/admin/resources/equipment') {
    return <ResourceCategoryPage categorySlug="equipment" adminUser={adminUser} navigate={navigate} onLogout={handleLogout} />;
  }

  if (route === '/admin/resources/labs') {
    return <ResourceCategoryPage categorySlug="labs" adminUser={adminUser} navigate={navigate} onLogout={handleLogout} />;
  }

  if (route === '/admin/bookings') {
    return <AdminBookingsPage adminUser={adminUser} navigate={navigate} onLogout={handleLogout} />;
  }

  if (route === '/admin/incidents') {
    return <AdminIncidentTicketsPage adminUser={adminUser} navigate={navigate} onLogout={handleLogout} />;
  }

  if (route === '/tech/dashboard') {
    if (!adminUser || !isTechnicianUser(adminUser)) {
      return (
        <main className="scene scene--admin">
          <section className="panel panel--content admin-panel">
            <h1 className="panel__title">Access Denied</h1>
            <p>You do not have permission to access the Technician Dashboard. Only technicians can view this page.</p>
            <div className="actions-row">
              <button type="button" onClick={handleLogout} className="btn btn--primary">
                Return to Login
              </button>
            </div>
          </section>
        </main>
      );
    }
    return <TechnicianDashboardPage navigate={navigate} onLogout={handleLogout} user={adminUser} />;
  }

  if (route === '/tech/resolved') {
    if (!adminUser || !isTechnicianUser(adminUser)) {
      return (
        <main className="scene scene--admin">
          <section className="panel panel--content admin-panel">
            <h1 className="panel__title">Access Denied</h1>
            <p>You do not have permission to access the Technician Dashboard. Only technicians can view this page.</p>
            <div className="actions-row">
              <button type="button" onClick={handleLogout} className="btn btn--primary">
                Return to Login
              </button>
            </div>
          </section>
        </main>
      );
    }
    return <TechnicianResolvedTicketsPage navigate={navigate} onLogout={handleLogout} user={adminUser} />;
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

          {loading ? <p className="muted">Processing login...</p> : null}        </div>

      </section>
    </main>
  );
}
