import React, { useEffect, useState } from 'react';
import { listAdminIncidentTickets, updateIncidentTicket } from '../api';
import { formatDateTime } from '../incident/incidentHelpers';
import { openNotifications } from '../notification/notificationBus';
import { showToast } from '../notification/notificationBus';

export default function TechnicianDashboardPage({ navigate, onLogout, user }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [resolutionByTicket, setResolutionByTicket] = useState({});

  const loadInProgressTickets = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const data = await listAdminIncidentTickets({ status: 'IN_PROGRESS' });
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load in-progress tickets');
    } finally {
      setLoading(false);
    }
  };

  const getTicketStatusBadgeClass = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'IN_PROGRESS':
        return 'ticket-status--in-progress';
      case 'RESOLVED':
        return 'ticket-status--resolved';
      case 'CLOSED':
        return 'ticket-status--closed';
      case 'OPEN':
        return 'ticket-status--open';
      case 'REJECTED':
        return 'ticket-status--rejected';
      default:
        return '';
    }
  };

  const markAsResolved = async (ticketId) => {
    const notes = (resolutionByTicket[ticketId] || '').trim();
    if (!notes) {
      setError('Please add resolution notes before marking the ticket as resolved.');
      return;
    }

    setError('');
    setMessage('');

    try {
      await updateIncidentTicket(ticketId, {
        resolutionNotes: notes,
      });
      setMessage('Ticket resolved successfully.');
      setResolutionByTicket((current) => ({ ...current, [ticketId]: '' }));
      showToast('Ticket resolved successfully', 'success', 'Ticket updated');
      await loadInProgressTickets();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resolve ticket';
      setError(errorMessage);
      showToast(errorMessage, 'error', 'Resolve failed');
    }
  };

  useEffect(() => {
    loadInProgressTickets();
  }, []);

  return (
    <main className="scene scene--admin">
      <section className="panel panel--content admin-panel">
        <nav className="site-nav" aria-label="Technician navigation">
          <div className="site-nav__brand">
            <span className="site-nav__dot" aria-hidden="true" />
            <div>
              <p className="site-nav__kicker">Smart Campus</p>
              <strong>Technician Portal</strong>
            </div>
          </div>
          <div className="site-nav__links">
            <button type="button" className="site-nav__link is-active" onClick={() => navigate('/tech/dashboard')}>
              In-Progress Tickets
            </button>
            <button type="button" className="site-nav__link" onClick={() => navigate('/tech/resolved')}>
              Resolved Tickets
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
            <p className="kicker">TECHNICIAN DASHBOARD</p>
            <h1 className="panel__title">In-Progress Tickets</h1>
            <p className="subtitle">View and manage all active incident tickets.</p>
          </div>
          <div className="actions-row actions-row--tight">
            <button type="button" className="btn btn--ghost" onClick={loadInProgressTickets}>Refresh</button>
            <button type="button" className="btn btn--ghost" onClick={onLogout}>Logout</button>
          </div>
        </div>

        <div className="resource-cards" style={{ marginTop: 10 }}>
          <article className="resource-card" style={{ cursor: 'default' }}>
            <p className="resource-card__tag">Technician</p>
            <h2 style={{ fontSize: '1rem', lineHeight: 1.3 }}>{user?.name || 'Technician'}</h2>
            <p>{user?.email}</p>
          </article>
          <article className="resource-card" style={{ cursor: 'default' }}>
            <p className="resource-card__tag">In Progress</p>
            <h2>{tickets.length}</h2>
            <p>Active tickets</p>
          </article>
        </div>

        {loading ? <p className="muted">Loading in-progress tickets...</p> : null}
        {message ? <p className="msg msg--success">{message}</p> : null}
        {error ? <p className="msg msg--error">{error}</p> : null}

        {!loading && !tickets.length ? <p className="muted">No in-progress tickets at the moment. Check back soon!</p> : null}

        {tickets.map((ticket) => (
          <article key={ticket.id} className="admin-booking-group admin-booking-group--in-progress ticket-card">
            <div className="ticket-card__header">
              <h3>{ticket.resourceName} - {ticket.category}</h3>
              <span className={`incident-badge ticket-status-badge ${getTicketStatusBadgeClass(ticket.status)}`}>
                {ticket.status}
              </span>
            </div>
            <p><strong>Reporter:</strong> {ticket.reporterName} ({ticket.reporterEmail})</p>
            <p><strong>Location:</strong> {ticket.resourceLocation} / {ticket.resourceSublocation}</p>
            <p><strong>Priority:</strong> {ticket.priority}</p>
            <p><strong>Assigned to:</strong> {ticket.assignedStaffName || 'Unassigned'} ({ticket.assignedStaffEmail || 'N/A'})</p>
            <p><strong>Created:</strong> {formatDateTime(ticket.createdAt)}</p>
            <p><strong>Description:</strong> {ticket.description}</p>

            {ticket.attachments?.length ? (
              <div className="incident-images">
                {ticket.attachments.map((image, index) => (
                  <img key={`${ticket.id}-${index}`} src={image} alt="attachment" className="incident-thumb" />
                ))}
              </div>
            ) : null}

            {ticket.resolutionNotes ? (
              <div>
                <p><strong>Resolution Notes:</strong></p>
                <p>{ticket.resolutionNotes}</p>
              </div>
            ) : null}

            <div className="resource-grid" style={{ marginTop: 10 }}>
              <label className="resource-field">
                <span>Resolution notes</span>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="Describe the fix applied"
                  value={resolutionByTicket[ticket.id] || ''}
                  onChange={(event) => setResolutionByTicket((current) => ({ ...current, [ticket.id]: event.target.value }))}
                />
              </label>
            </div>

            <div className="actions-row">
              <button type="button" className="btn btn--primary" onClick={() => markAsResolved(ticket.id)}>
                Resolve Ticket
              </button>
            </div>

            <div className="incident-comments">
              <h4>Comments</h4>
              {ticket.comments?.length ? (
                ticket.comments.map((comment) => (
                  <div key={comment.id} className="incident-comment-item">
                    <p><strong>{comment.authorName}</strong> ({comment.authorRole}) - {formatDateTime(comment.updatedAt || comment.createdAt)}</p>
                    <p>{comment.text}</p>
                  </div>
                ))
              ) : (
                <p className="muted">No comments yet.</p>
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
