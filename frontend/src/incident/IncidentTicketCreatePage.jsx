import { useEffect, useState } from 'react';
import { createIncidentTicket, getResource } from '../api';
import { INCIDENT_CATEGORIES, INCIDENT_PRIORITIES, getIncidentCategorySuggestions } from './incidentConfig';
import { fileToDataUrl } from './incidentHelpers';
import { formatSublocationLabel, getLocationLabel } from '../catalog/resourceConfig';
import { openNotifications } from '../notification/notificationBus';
import { showToast } from '../notification/notificationBus';

export default function IncidentTicketCreatePage({ resourceId, bookingId, user, navigate, onLogout }) {
  const displayName = user?.name || 'Campus User';
  const avatarUrl = user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=111111&color=fff`;
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
    category: INCIDENT_CATEGORIES[0],
    description: '',
    priority: 'MEDIUM',
    preferredContact: user?.email || '',
    files: [],
  });

  const resourceCategory = resource?.category || '';
  const categorySuggestions = getIncidentCategorySuggestions(resourceCategory);
  const selectedCategory = categorySuggestions.find((item) => item.name === form.category) || categorySuggestions[0];

  useEffect(() => {
    if (!categorySuggestions.length) {
      return;
    }
    if (!categorySuggestions.some((item) => item.name === form.category)) {
      setForm((current) => ({ ...current, category: categorySuggestions[0].name }));
    }
  }, [resourceCategory]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getResource(resourceId);
        setResource(data);
      } catch (err) {
              } finally {
        setLoading(false);
      }
    };

    load();
  }, [resourceId]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    const mergedFiles = [...form.files];

    for (const file of files) {
      const duplicate = mergedFiles.some(
        (existing) => existing.name === file.name && existing.size === file.size && existing.lastModified === file.lastModified,
      );
      if (!duplicate) {
        mergedFiles.push(file);
      }
    }

    if (mergedFiles.length > 3) {
            event.target.value = '';
      return;
    }

    const invalid = mergedFiles.some((file) => !file.type.startsWith('image/'));
    if (invalid) {
            event.target.value = '';
      return;
    }

    setForm((current) => ({ ...current, files: mergedFiles }));
    event.target.value = '';
  };

  const submit = async (event) => {
    event.preventDefault();

    if (!user?.email || !user?.name) {
            return;
    }

    setSubmitting(true);
    try {
      const attachments = await Promise.all(form.files.map(fileToDataUrl));
      await createIncidentTicket({
        bookingId: bookingId || null,
        resourceId,
        reporterEmail: user.email,
        reporterName: user.name,
        category: form.category,
        description: form.description,
        priority: form.priority,
        preferredContact: form.preferredContact,
        attachments,
      });
      showToast('Incident ticket created successfully.', 'success', 'Ticket created');
      navigate('/my-tickets');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create ticket';
            showToast(errorMessage, 'error', 'Ticket creation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const appendDescriptionSuggestion = (text) => {
    setForm((current) => ({
      ...current,
      description: current.description ? `${current.description}\n${text}` : text,
    }));
  };

  return (
    <main className="scene scene--user">
      <section className="panel panel--content user-resource-detail incident-create-page">
        <nav className="home-nav" aria-label="Main navigation">
          <div className="home-nav__brand">
            <span className="home-nav__dot" aria-hidden="true" />
            <img src="/sliit-logo.png" alt="SLIIT" className="home-nav__logo" />
            <strong>SLIIT</strong>
          </div>
          <div className="home-nav__links">
            <button type="button" className="home-nav__link" onClick={() => navigate('/home')}>Home</button>
            <button type="button" className="home-nav__link" onClick={() => navigate('/my-bookings')}>My Bookings</button>
            <button type="button" className="home-nav__link is-active" onClick={() => navigate('/my-tickets')}>My Tickets</button>
            <button type="button" className="home-nav__link" onClick={openNotifications}>Notifications</button>
            <button type="button" className="home-nav__link" onClick={onLogout}>Logout</button>
          </div>
          <div className="home-nav__user" aria-label="Logged in user">
            <span className="home-nav__user-name">{displayName}</span>
            {user?.picture ? (
              <img src={avatarUrl} alt={displayName} className="home-nav__user-avatar" />
            ) : (
              <span className="home-nav__user-fallback" aria-hidden="true">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </nav>

        <section className="user-hero user-hero--compact">
          <p className="user-hero__kicker">INCIDENT REPORT</p>
          <h1 className="panel__title">Create Incident Ticket</h1>
          <p className="subtitle">Report issues quickly so technicians can respond and track resolution.</p>
        </section>
        {loading ? <p className="muted">Loading resource...</p> : null}

        <div className="incident-form-card">
          {resource ? (
            <div className="user-booking-card">
              <p><strong>Resource:</strong> {resource.name}</p>
              <p><strong>Location:</strong> {getLocationLabel(resource.location)} / {formatSublocationLabel(resource.sublocation)}</p>
              {bookingId ? <p><strong>Booking Ref:</strong> {bookingId}</p> : null}
            </div>
          ) : null}

          <form className="resource-form incident-ticket-form" onSubmit={submit}>
          <div className="resource-grid incident-ticket-grid">
            <label className="resource-field">
              <span>Category<span className="required-mark">*</span></span>
              <select className="input" value={form.category} onChange={(event) => setForm((c) => ({ ...c, category: event.target.value }))} required>
                {categorySuggestions.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
              </select>
              {selectedCategory?.examples?.length ? (
                <small className="resource-field__hint">Examples: {selectedCategory.examples.join(', ')}</small>
              ) : null}
            </label>
            <label className="resource-field">
              <span>Priority<span className="required-mark">*</span></span>
              <select className="input" value={form.priority} onChange={(event) => setForm((c) => ({ ...c, priority: event.target.value }))} required>
                {INCIDENT_PRIORITIES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <small className="resource-field__hint resource-field__hint--reserve" aria-hidden="true">hint</small>
            </label>
            <label className="resource-field resource-field--full">
              <span>Description<span className="required-mark">*</span></span>
              <textarea
                className="input"
                rows={4}
                value={form.description}
                placeholder={selectedCategory?.examples?.length ? `Example: ${selectedCategory.examples[0]}` : 'Describe the issue'}
                onChange={(event) => setForm((c) => ({ ...c, description: event.target.value }))}
                required
              />
              {selectedCategory?.examples?.length ? (
                <div className="incident-suggestion-row">
                  {selectedCategory.examples.map((example) => (
                    <button
                      key={example}
                      type="button"
                      className="btn btn--ghost btn--compact"
                      onClick={() => appendDescriptionSuggestion(example)}
                    >
                      Use "{example}"
                    </button>
                  ))}
                </div>
              ) : null}
            </label>
            <label className="resource-field">
              <span>Preferred contact<span className="required-mark">*</span></span>
              <input className="input" value={form.preferredContact} onChange={(event) => setForm((c) => ({ ...c, preferredContact: event.target.value }))} required />
            </label>
            <label className="resource-field">
              <span>Attachments (up to 3 images)</span>
              <input className="input" type="file" accept="image/*" multiple onChange={handleFileChange} />
              {form.files.length ? (
                <small className="resource-field__hint">
                  {form.files.length} selected: {form.files.map((file) => file.name).join(', ')}
                </small>
              ) : (
                <small className="resource-field__hint">You can add 1 to 3 images.</small>
              )}
              {form.files.length ? (
                <button
                  type="button"
                  className="btn btn--ghost btn--compact"
                  onClick={() => setForm((current) => ({ ...current, files: [] }))}
                >
                  Clear images
                </button>
              ) : null}
            </label>
          </div>

          <div className="actions-row">
            <button className="btn btn--primary" type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Create Ticket'}</button>
            <button className="btn btn--ghost" type="button" onClick={() => navigate('/my-bookings')}>Back</button>
          </div>
          </form>
        </div>      </section>
    </main>
  );
}
