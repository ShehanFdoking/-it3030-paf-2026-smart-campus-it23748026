import React, { useEffect, useState } from 'react';
import { listAdminIncidentTickets } from '../api';
import { formatDateTime } from '../incident/incidentHelpers';
import { openNotifications } from '../notification/notificationBus';

export default function TechnicianResolvedTicketsPage({ navigate, onLogout, user }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadResolvedTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const [resolvedTickets, closedTickets] = await Promise.all([
        listAdminIncidentTickets({ status: 'RESOLVED' }),
        listAdminIncidentTickets({ status: 'CLOSED' }),
      ]);

      const technicianEmail = (user?.email || '').toLowerCase();
      const technicianEmailAliases = new Set(
        [technicianEmail, 'tech@gamil.com', 'tech@gmail.com']
          .map((email) => (email || '').trim().toLowerCase())
          .filter(Boolean)
      );
      const combined = [...resolvedTickets, ...closedTickets];
      const uniqueTickets = Array.from(new Map(combined.map((ticket) => [ticket.id, ticket])).values())
        .filter((ticket) => {
          if (!technicianEmailAliases.size) {
            return true;
          }
          const assignedEmail = (ticket.assignedStaffEmail || '').trim().toLowerCase();
          return technicianEmailAliases.has(assignedEmail);
        })
        .sort((left, right) => new Date(right.updatedAt || right.createdAt).getTime() - new Date(left.updatedAt || left.createdAt).getTime());

      setTickets(uniqueTickets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resolved tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResolvedTickets();
  }, []);

  const getTicketStatusBadgeClass = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'RESOLVED':
        return 'ticket-status--resolved';
      case 'CLOSED':
        return 'ticket-status--closed';
      default:
        return '';
    }
  };

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
            <button type="button" className="site-nav__link" onClick={() => navigate('/tech/dashboard')}>
              In-Progress Tickets
            </button>
            <button type="button" className="site-nav__link is-active" onClick={() => navigate('/tech/resolved')}>
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
            <h1 className="panel__title">Resolved Tickets</h1>
            <p className="subtitle">Review old tickets that you resolved or closed after resolution.</p>
          </div>
          <div className="actions-row actions-row--tight">
            <button type="button" className="btn btn--ghost" onClick={loadResolvedTickets}>Refresh</button>
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
            <p className="resource-card__tag">Resolved History</p>
            <h2>{tickets.length}</h2>
            <p>Your resolved ticket history</p>
          </article>
        </div>

        {loading ? <p className="muted">Loading resolved tickets...</p> : null}
        {error ? <p className="msg msg--error">{error}</p> : null}

        {!loading && !tickets.length ? <p className="muted">No resolved tickets found yet.</p> : null}

        {tickets.map((ticket) => {
          const statusClass = getTicketStatusBadgeClass(ticket.status);
          return (
          <article key={ticket.id} className={`admin-booking-group ${statusClass ? `admin-booking-group--${ticket.status.toLowerCase().replace('_', '-')}` : 'admin-booking-group--resolved'}`}>
            <div className="ticket-card__header">
              <h3>{ticket.resourceName} - {ticket.category}</h3>
              <span className={`incident-badge ticket-status-badge ${statusClass || 'ticket-status--resolved'}`}>{ticket.status}</span>
            </div>
            <p><strong>Reporter:</strong> {ticket.reporterName} ({ticket.reporterEmail})</p>
            <p><strong>Location:</strong> {ticket.resourceLocation} / {ticket.resourceSublocation}</p>
            <p><strong>Priority:</strong> {ticket.priority}</p>
            <p><strong>Assigned to:</strong> {ticket.assignedStaffName || 'Unassigned'} ({ticket.assignedStaffEmail || 'N/A'})</p>
            <p><strong>Created:</strong> {formatDateTime(ticket.createdAt)}</p>
            <p><strong>Last Updated:</strong> {formatDateTime(ticket.updatedAt)}</p>
            <p><strong>Description:</strong> {ticket.description}</p>
            <p><strong>Resolution Notes:</strong> {ticket.resolutionNotes || '-'}</p>

            {ticket.attachments?.length ? (
              <div className="incident-images">
                {ticket.attachments.map((image, index) => (
                  <img key={`${ticket.id}-${index}`} src={image} alt="attachment" className="incident-thumb" />
                ))}
              </div>
            ) : null}
          </article>
          );
        })}
      </section>
    </main>
  );
}
