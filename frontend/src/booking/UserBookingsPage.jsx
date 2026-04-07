import { useEffect, useMemo, useState } from 'react';
import { deleteMyBooking, listMyBookings, updateMyBooking, listIncidentsByBookingId } from '../api';
import { createBookingEditForm } from './bookingConfig';
import { toNullableNumber } from './bookingHelpers';
import { getLocationLabel, formatSublocationLabel } from '../catalog/resourceConfig';
import { openNotifications } from '../notification/notificationBus';
import { requestConfirmation, showToast } from '../notification/notificationBus';

function getTodayDateString() {
  const now = new Date();
  const local = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
  return local.toISOString().slice(0, 10);
}

function copy(text) {
  navigator.clipboard?.writeText(text || '');
}

export default function UserBookingsPage({ user, navigate, onLogout }) {
  const minDate = getTodayDateString();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState('');
  const [incidentsByBooking, setIncidentsByBooking] = useState({});
  const [form, setForm] = useState({ bookingDate: '', startTime: '', endTime: '', purpose: '', expectedAttendees: '', linkedRoomApprovalCode: '' });

  const load = async () => {
    if (!user?.email) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await listMyBookings(user.email);
      setBookings(data);

      // Load incidents for each booking
      const incidentsMap = {};
      for (const booking of data) {
        try {
          const incidents = await listIncidentsByBookingId(booking.id);
          incidentsMap[booking.id] = incidents;
        } catch (err) {
          incidentsMap[booking.id] = [];
        }
      }
      setIncidentsByBooking(incidentsMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.email]);

  const editable = useMemo(() => bookings.find((item) => item.id === editingId) || null, [bookings, editingId]);

  const startEdit = (booking) => {
    if (booking.status !== 'PENDING' || booking.systemGenerated) {
      setError('Only pending bookings can be edited');
      return;
    }
    setEditingId(booking.id);
    setForm(createBookingEditForm(booking));
    setMessage('');
    setError('');
  };

  const submitEdit = async (event) => {
    event.preventDefault();
    if (!editable || !user?.email) {
      return;
    }

    if (form.bookingDate && form.bookingDate < minDate) {
      setError('Booking date cannot be in the past');
      return;
    }

    setError('');
    setMessage('');

    try {
      const result = await updateMyBooking(editable.id, user.email, {
        bookingDate: form.bookingDate,
        startTime: form.startTime,
        endTime: form.endTime,
        purpose: form.purpose,
        expectedAttendees: toNullableNumber(form.expectedAttendees),
        linkedRoomApprovalCode: form.linkedRoomApprovalCode,
      });
      if (!result.success) {
        setError(result.message || 'Unable to update booking');
        showToast(result.message || 'Unable to update booking', 'error', 'Booking update failed');
        return;
      }
      setMessage(result.message || 'Booking updated');
      showToast(result.message || 'Booking updated', 'success', 'Booking updated');
      setEditingId('');
      await load();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Update failed';
      setError(errorMessage);
      showToast(errorMessage, 'error', 'Booking update failed');
    }
  };

  const removeBooking = async (bookingId) => {
    if (!user?.email) {
      return;
    }
    requestConfirmation({
      title: 'Cancel booking?',
      message: 'This booking will be permanently cancelled.',
      confirmLabel: 'Cancel booking',
      onConfirm: async () => {
        try {
          await deleteMyBooking(bookingId, user.email);
          setMessage('Booking deleted');
          showToast('Booking deleted successfully', 'success', 'Booking deleted');
          await load();
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Delete failed';
          setError(errorMessage);
          showToast(errorMessage, 'error', 'Delete failed');
        }
      },
    });
  };

  return (
    <main className="scene scene--user">
      <section className="panel panel--content user-resource-detail">
        <nav className="site-nav" aria-label="Main navigation">
          <div className="site-nav__brand">
            <span className="site-nav__dot" aria-hidden="true" />
            <div>
              <p className="site-nav__kicker">Smart Campus</p>
              <strong>My Bookings</strong>
            </div>
          </div>
          <div className="site-nav__links">
            <button type="button" className="site-nav__link" onClick={() => navigate('/home')}>Home</button>
            <button type="button" className="site-nav__link" onClick={() => navigate('/resources')}>Resources</button>
            <button type="button" className="site-nav__link is-active" onClick={() => navigate('/my-bookings')}>My Bookings</button>
            <button type="button" className="site-nav__link" onClick={() => navigate('/my-tickets')}>My Tickets</button>
            <button type="button" className="site-nav__link site-nav__link--notifications" onClick={openNotifications}>Notifications</button>
            <button type="button" className="site-nav__link" onClick={onLogout}>Logout</button>
          </div>
        </nav>

        <h1 className="panel__title">My Bookings</h1>
        {loading ? <p className="muted">Loading bookings...</p> : null}
        {message ? <p className="msg msg--success">{message}</p> : null}
        {error ? <p className="msg msg--error">{error}</p> : null}

        {!loading && !bookings.length ? <p className="muted">No bookings yet.</p> : null}

        <div className="resource-table-wrap">
          <table className="resource-table">
            <thead>
              <tr>
                <th>Resource</th>
                <th>Category</th>
                <th>Date</th>
                <th>Time</th>
                <th>Location</th>
                <th>Status</th>
                <th>Approval Code</th>
                <th>Issues Reported</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    {booking.resourceName}
                    {booking.systemGenerated ? ' (Linked)' : ''}
                  </td>
                  <td>{booking.resourceCategory}</td>
                  <td>{booking.bookingDate}</td>
                  <td>{booking.startTime} - {booking.endTime}</td>
                  <td>{getLocationLabel(booking.resourceLocation)} / {formatSublocationLabel(booking.resourceSublocation)}</td>
                  <td>{booking.status}</td>
                  <td>
                    {booking.approvalCode || '-'}
                    {booking.approvalCode ? (
                      <button type="button" className="btn btn--ghost btn--compact" onClick={() => copy(booking.approvalCode)}>
                        Copy
                      </button>
                    ) : null}
                  </td>
                  <td>
                    {incidentsByBooking[booking.id]?.length > 0 ? (
                      <span className="incident-badge">{incidentsByBooking[booking.id].length} reported</span>
                    ) : (
                      <span className="muted">None</span>
                    )}
                  </td>
                  <td>
                    <div className="table-actions">
                      {!booking.systemGenerated && booking.status === 'PENDING' ? (
                        <button type="button" className="btn btn--ghost btn--compact btn--edit" onClick={() => startEdit(booking)}>Edit</button>
                      ) : null}
                      {!booking.systemGenerated ? (
                        <button type="button" className="btn btn--ghost btn--compact btn--delete" onClick={() => removeBooking(booking.id)}>Delete</button>
                      ) : <span className="muted">Auto-linked</span>}
                      <button
                        type="button"
                        className="btn btn--ghost btn--compact"
                        onClick={() => navigate(`/incidents/new/${booking.resourceId}/${booking.id}`)}
                      >
                        Report Issue
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editable ? (
          <form className="resource-form-shell" onSubmit={submitEdit}>
            <h3>Edit booking</h3>
            <div className="resource-grid">
              <label className="resource-field">
                <span>Date<span className="required-mark">*</span></span>
                <input className="input" type="date" min={minDate} value={form.bookingDate} onChange={(event) => setForm((c) => ({ ...c, bookingDate: event.target.value }))} required />
              </label>
              <label className="resource-field">
                <span>Purpose<span className="required-mark">*</span></span>
                <input className="input" value={form.purpose} onChange={(event) => setForm((c) => ({ ...c, purpose: event.target.value }))} required />
              </label>
              <label className="resource-field">
                <span>Start<span className="required-mark">*</span></span>
                <input className="input" type="time" value={form.startTime} onChange={(event) => setForm((c) => ({ ...c, startTime: event.target.value }))} required />
              </label>
              <label className="resource-field">
                <span>End<span className="required-mark">*</span></span>
                <input className="input" type="time" value={form.endTime} onChange={(event) => setForm((c) => ({ ...c, endTime: event.target.value }))} required />
              </label>
              <label className="resource-field">
                <span>Expected attendees</span>
                <input
                  className="input"
                  type="number"
                  min={editable.resourceCategory === 'MEETING_ROOM' ? '6' : '1'}
                  value={form.expectedAttendees}
                  onChange={(event) => setForm((c) => ({ ...c, expectedAttendees: event.target.value }))}
                />
              </label>
              {editable.resourceCategory === 'EQUIPMENT' ? (
                <label className="resource-field">
                  <span>Linked room approval code (if linked room is already booked)</span>
                  <input className="input" value={form.linkedRoomApprovalCode} onChange={(event) => setForm((c) => ({ ...c, linkedRoomApprovalCode: event.target.value }))} />
                </label>
              ) : null}
            </div>
            <div className="actions-row">
              <button className="btn btn--primary" type="submit">Save</button>
              <button className="btn btn--ghost" type="button" onClick={() => setEditingId('')}>Cancel</button>
            </div>
          </form>
        ) : null}
      </section>
    </main>
  );
}
