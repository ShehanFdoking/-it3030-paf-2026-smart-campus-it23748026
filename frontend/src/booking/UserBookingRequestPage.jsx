import { useEffect, useState } from 'react';
import { getResource, requestBooking } from '../api';
import { createBookingRequestForm } from './bookingConfig';
import { toNullableNumber } from './bookingHelpers';
import { getCategoryMeta, getLocationLabel, formatSublocationLabel } from '../catalog/resourceConfig';

function getTodayDateString() {
  const now = new Date();
  const local = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
  return local.toISOString().slice(0, 10);
}

export default function UserBookingRequestPage({ categorySlug, resourceId, user, navigate, onLogout }) {
  const meta = getCategoryMeta(categorySlug);
  const minDate = getTodayDateString();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [form, setForm] = useState(createBookingRequestForm);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getResource(resourceId);
        setResource(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load resource');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [resourceId]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user?.email || !user?.name) {
      setError('Please login again to continue booking');
      return;
    }

    if (form.bookingDate && form.bookingDate < minDate) {
      setError('Booking date cannot be in the past');
      return;
    }

    const attendees = toNullableNumber(form.expectedAttendees);
    if (meta.enumValue !== 'EQUIPMENT' && attendees != null && resource?.capacity != null && attendees > resource.capacity) {
      setError('Expected attendees cannot exceed resource capacity');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');
    setSuggestions([]);

    try {
      const result = await requestBooking({
        resourceId,
        resourceCategory: meta.enumValue,
        bookingDate: form.bookingDate,
        startTime: form.startTime,
        endTime: form.endTime,
        purpose: form.purpose,
        expectedAttendees: attendees,
        requesterEmail: user.email,
        requesterName: user.name,
        linkedRoomApprovalCode: form.linkedRoomApprovalCode,
      });

      if (result.success) {
        navigate('/my-bookings');
        return;
      } else {
        setError(result.message || 'Unable to create booking');
        setSuggestions(result.suggestions || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking request failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="scene scene--user">
      <section className="panel panel--content user-resource-detail">
        <nav className="site-nav" aria-label="Main navigation">
          <div className="site-nav__brand">
            <span className="site-nav__dot" aria-hidden="true" />
            <div>
              <p className="site-nav__kicker">Smart Campus</p>
              <strong>Booking Portal</strong>
            </div>
          </div>
          <div className="site-nav__links">
            <button type="button" className="site-nav__link" onClick={() => navigate('/home')}>Home</button>
            <button type="button" className="site-nav__link" onClick={() => navigate('/resources')}>Resources</button>
            <button type="button" className="site-nav__link" onClick={() => navigate('/my-bookings')}>My Bookings</button>
            <button type="button" className="site-nav__link" onClick={onLogout}>Logout</button>
          </div>
        </nav>

        <h1 className="panel__title">Book {meta.itemLabel}</h1>

        {loading ? <p className="muted">Loading resource details...</p> : null}

        {resource ? (
          <div className="user-booking-card">
            <p><strong>Resource:</strong> {resource.name}</p>
            <p><strong>Location:</strong> {getLocationLabel(resource.location)} / {formatSublocationLabel(resource.sublocation)}</p>
            <p><strong>Capacity:</strong> {resource.capacity}</p>
            {resource.relatedResourceName ? <p><strong>Linked Room:</strong> {resource.relatedResourceName}</p> : null}
          </div>
        ) : null}

        <form className="resource-form" onSubmit={handleSubmit}>
          <div className="resource-grid">
            <label className="resource-field">
              <span>Date<span className="required-mark">*</span></span>
              <input className="input" type="date" min={minDate} value={form.bookingDate} onChange={(event) => updateField('bookingDate', event.target.value)} required />
            </label>
            <label className="resource-field">
              <span>Purpose<span className="required-mark">*</span></span>
              <input className="input" value={form.purpose} onChange={(event) => updateField('purpose', event.target.value)} required placeholder="Exam, workshop, seminar" />
            </label>
            <label className="resource-field">
              <span>Start time<span className="required-mark">*</span></span>
              <input className="input" type="time" value={form.startTime} onChange={(event) => updateField('startTime', event.target.value)} required />
            </label>
            <label className="resource-field">
              <span>End time<span className="required-mark">*</span></span>
              <input className="input" type="time" value={form.endTime} onChange={(event) => updateField('endTime', event.target.value)} required />
            </label>
            <label className="resource-field">
              <span>
                Expected attendees
                {meta.enumValue === 'LECTURE_HALL' || meta.enumValue === 'MEETING_ROOM' ? <span className="required-mark">*</span> : null}
              </span>
              <input
                className="input"
                type="number"
                min={meta.enumValue === 'MEETING_ROOM' ? '6' : '1'}
                max={meta.enumValue === 'EQUIPMENT' ? undefined : (resource?.capacity ?? undefined)}
                value={form.expectedAttendees}
                onChange={(event) => updateField('expectedAttendees', event.target.value)}
                required={meta.enumValue === 'LECTURE_HALL' || meta.enumValue === 'MEETING_ROOM'}
                placeholder="Required for halls/rooms"
              />
            </label>
            {categorySlug === 'equipment' ? (
              <label className="resource-field">
                <span>Linked room approval code (if linked room already booked)</span>
                <input className="input" value={form.linkedRoomApprovalCode} onChange={(event) => updateField('linkedRoomApprovalCode', event.target.value)} placeholder="Optional proof code" />
              </label>
            ) : null}
          </div>

          <div className="actions-row">
            <button className="btn btn--primary" type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Book'}</button>
            <button className="btn btn--ghost" type="button" onClick={() => navigate(`/resources/${categorySlug}`)}>Back</button>
          </div>
        </form>

        {message ? <p className="msg msg--success">{message}</p> : null}
        {error ? <p className="msg msg--error">{error}</p> : null}

        {suggestions.length ? (
          <section className="user-suggestion-box">
            <h3>Suggested alternatives</h3>
            <div className="user-suggestion-list">
              {suggestions.map((item) => (
                <button
                  key={item.resourceId}
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => navigate(`/resources/${categorySlug}/${item.resourceId}/book`)}
                >
                  {item.resourceName} ({getLocationLabel(item.location)} / {formatSublocationLabel(item.sublocation)}) - Capacity {item.capacity}
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
