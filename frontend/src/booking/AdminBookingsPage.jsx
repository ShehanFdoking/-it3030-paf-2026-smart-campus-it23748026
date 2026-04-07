import { useEffect, useMemo, useState } from 'react';
import { listAdminBookings, updateBookingStatus } from '../api';
import { BOOKING_CATEGORY_OPTIONS, BOOKING_STATUS_OPTIONS } from './bookingConfig';
import { mapBookingsByCategory } from './bookingHelpers';
import { getLocationLabel, formatSublocationLabel } from '../catalog/resourceConfig';
import { openNotifications } from '../notification/notificationBus';
import { requestConfirmation, showToast } from '../notification/notificationBus';

export default function AdminBookingsPage({ navigate, onLogout }) {
  const [bookings, setBookings] = useState([]);
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listAdminBookings({ category, status, search });
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [category, status, search]);

  useEffect(() => {
    const timer = setInterval(() => {
      load();
    }, 5000);

    return () => clearInterval(timer);
  }, [category, status, search]);

  const grouped = useMemo(() => {
    return mapBookingsByCategory(bookings);
  }, [bookings]);

  const updateStatus = (id, nextStatus) => {
    const title = nextStatus === 'APPROVED' ? 'Approve booking?' : nextStatus === 'REJECTED' ? 'Reject booking?' : 'Reverse booking?';
    const message = nextStatus === 'APPROVED'
      ? 'This will approve the booking and notify the requester.'
      : nextStatus === 'REJECTED'
        ? 'This will reject the booking and notify the requester.'
        : 'This will revert the booking back to pending.';

    requestConfirmation({
      title,
      message,
      confirmLabel: 'Continue',
      onConfirm: async () => {
        setError('');
        setMessage('');
        try {
          await updateBookingStatus(id, nextStatus);
          setMessage(`Booking changed to ${nextStatus}`);
          showToast(`Booking ${nextStatus.toLowerCase()}`, 'success', 'Booking updated');
          await load();
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Status update failed';
          setError(errorMessage);
          showToast(errorMessage, 'error', 'Booking update failed');
        }
      },
    });
  };

  const renderGroup = (title, items) => (
    <section className="admin-booking-group" key={title}>
      <h3>{title}</h3>
      {!items.length ? <p className="muted">No bookings in this category.</p> : null}
      {items.length ? (
        <div className="resource-table-wrap">
          <table className="resource-table">
            <thead>
              <tr>
                <th>Resource</th>
                <th>User</th>
                <th>Date</th>
                <th>Time</th>
                <th>Attendees</th>
                <th>Location</th>
                <th>Status</th>
                <th>Code</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.resourceName}</td>
                  <td>{booking.requesterName}<br />{booking.requesterEmail}</td>
                  <td>{booking.bookingDate}</td>
                  <td>{booking.startTime} - {booking.endTime}</td>
                  <td>{booking.expectedAttendees || '-'}</td>
                  <td>{getLocationLabel(booking.resourceLocation)} / {formatSublocationLabel(booking.resourceSublocation)}</td>
                  <td>
                    <span className={`status-pill admin-status-pill admin-status-pill--${booking.status.toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>{booking.approvalCode || '-'}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className={`btn btn--ghost btn--compact admin-action-btn ${booking.status === 'APPROVED' ? 'admin-action-btn--approve-active' : ''}`}
                        onClick={() => updateStatus(booking.id, 'APPROVED')}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className={`btn btn--ghost btn--compact admin-action-btn ${booking.status === 'REJECTED' ? 'admin-action-btn--reject-active' : ''}`}
                        onClick={() => updateStatus(booking.id, 'REJECTED')}
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        className={`btn btn--ghost btn--compact admin-action-btn ${booking.status === 'PENDING' ? 'admin-action-btn--pending-active' : ''}`}
                        onClick={() => updateStatus(booking.id, 'PENDING')}
                      >
                        Reverse
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );

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
            <button type="button" className="site-nav__link is-active" onClick={() => navigate('/admin/bookings')}>
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
            <button type="button" className="site-nav__link" onClick={onLogout}>
              Logout
            </button>
          </div>
        </nav>
        <div className="resource-page__header">
          <div>
            <p className="kicker">BOOKING MANAGEMENT</p>
            <h1 className="panel__title">All Bookings</h1>
            <p className="subtitle">Approve, reject, reverse, and search bookings across all resource types.</p>
            <div className="resource-controls-row">
              <label className="resource-field resource-field--control">
                <span>Category</span>
                <select className="input" value={category} onChange={(event) => setCategory(event.target.value)}>
                  {BOOKING_CATEGORY_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>
              <label className="resource-field resource-field--control">
                <span>Status</span>
                <select className="input" value={status} onChange={(event) => setStatus(event.target.value)}>
                  {BOOKING_STATUS_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>
              <label className="resource-field resource-field--control-search">
                <span>Search</span>
                <input className="input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by user, resource, location, code" />
              </label>
            </div>
          </div>
          <div className="actions-row actions-row--tight">
            <button type="button" className="btn btn--ghost" onClick={load}>Refresh</button>
            <button type="button" className="btn btn--ghost" onClick={() => navigate('/admin/dashboard')}>Back to Dashboard</button>
          </div>
        </div>

        {loading ? <p className="muted">Loading bookings...</p> : null}
        {message ? <p className="msg msg--success">{message}</p> : null}
        {error ? <p className="msg msg--error">{error}</p> : null}

        {renderGroup('Lecture Hall Bookings', grouped.LECTURE_HALL)}
        {renderGroup('Meeting Room Bookings', grouped.MEETING_ROOM)}
        {renderGroup('Equipment Bookings', grouped.EQUIPMENT)}
      </section>
    </main>
  );
}
