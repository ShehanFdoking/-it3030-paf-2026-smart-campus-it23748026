import React, { useEffect, useState } from 'react';
import { listAdminIncidentTickets } from '../api';
import { formatDateTime } from '../incident/incidentHelpers';

export default function TechnicianResolvedTicketsPage({ navigate, onLogout, user }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadResolvedTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listAdminIncidentTickets({ status: 'RESOLVED' });
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resolved tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResolvedTickets();
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
            <button type="button" className="site-nav__link" onClick={() => navigate('/tech/dashboard')}>
              In-Progress Tickets
            </button>
            <button type="button" className="site-nav__link is-active" onClick={() => navigate('/tech/resolved')}>
              Resolved Tickets
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
            <p className="subtitle">Review old tickets that were resolved by technicians.</p>
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
            <p className="resource-card__tag">Resolved</p>
            <h2>{tickets.length}</h2>
            <p>Old resolved tickets</p>
          </article>
        </div>

        {loading ? <p className="muted">Loading resolved tickets...</p> : null}
        {error ? <p className="msg msg--error">{error}</p> : null}

        {!loading && !tickets.length ? <p className="muted">No resolved tickets found yet.</p> : null}

        {tickets.map((ticket) => (
          <article key={ticket.id} className="admin-booking-group admin-booking-group--resolved">
            <div className="ticket-card__header">
              <h3>{ticket.resourceName} - {ticket.category}</h3>
              <span className="incident-badge ticket-status-badge ticket-status--resolved">RESOLVED</span>
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
        ))}
      </section>
    </main>
  );
}
