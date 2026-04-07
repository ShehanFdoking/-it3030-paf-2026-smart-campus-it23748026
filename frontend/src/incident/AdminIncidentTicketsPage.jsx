import { useEffect, useState } from 'react';
import { addIncidentComment, listAdminIncidentTickets, updateIncidentTicket } from '../api';
import { INCIDENT_STATUSES } from './incidentConfig';
import { formatDateTime } from './incidentHelpers';

function createEditor() {
  return {
    assignedStaffEmail: '',
    assignedStaffName: '',
    resolutionNotes: '',
    rejectionReason: '',
  };
}

export default function AdminIncidentTicketsPage({ adminUser, navigate, onLogout }) {
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editorByTicket, setEditorByTicket] = useState({});
  const [staffCommentByTicket, setStaffCommentByTicket] = useState({});

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listAdminIncidentTickets({ status: statusFilter, search });
      setTickets(data);
      setEditorByTicket((current) => {
        const next = { ...current };
        data.forEach((ticket) => {
          if (!next[ticket.id]) {
            next[ticket.id] = {
              assignedStaffEmail: ticket.assignedStaffEmail || '',
              assignedStaffName: ticket.assignedStaffName || '',
              resolutionNotes: ticket.resolutionNotes || '',
              rejectionReason: ticket.rejectionReason || '',
            };
          }
        });
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load incident tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter, search]);

  const assignTechnician = async (ticketId) => {
    const payload = editorByTicket[ticketId] || createEditor();
    if (!payload.assignedStaffEmail.trim() && !payload.assignedStaffName.trim()) {
      setError('Provide technician email or name before assigning');
      return;
    }
    try {
      await updateIncidentTicket(ticketId, {
        assignedStaffEmail: payload.assignedStaffEmail,
        assignedStaffName: payload.assignedStaffName,
      });
      setMessage('Technician assigned. Status moved to IN_PROGRESS automatically.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to assign technician');
    }
  };

  const saveTechnicianUpdate = async (ticketId) => {
    const payload = editorByTicket[ticketId] || createEditor();
    try {
      await updateIncidentTicket(ticketId, {
        assignedStaffEmail: payload.assignedStaffEmail,
        assignedStaffName: payload.assignedStaffName,
        resolutionNotes: payload.resolutionNotes,
      });
      setMessage('Technician update saved. Status moved to RESOLVED when resolution notes are provided.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save technician update');
    }
  };

  const closeTicket = async (ticketId) => {
    try {
      await updateIncidentTicket(ticketId, { status: 'CLOSED' });
      setMessage('Ticket closed successfully');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to close ticket');
    }
  };

  const rejectTicket = async (ticketId) => {
    const payload = editorByTicket[ticketId] || createEditor();
    if (!payload.rejectionReason.trim()) {
      setError('Rejection reason is required');
      return;
    }
    try {
      await updateIncidentTicket(ticketId, {
        status: 'REJECTED',
        rejectionReason: payload.rejectionReason,
      });
      setMessage('Ticket rejected');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reject ticket');
    }
  };

  const addStaffComment = async (ticketId) => {
    if (!adminUser?.email) {
      return;
    }
    const text = (staffCommentByTicket[ticketId] || '').trim();
    if (!text) {
      return;
    }

    try {
      await addIncidentComment(ticketId, {
        authorEmail: adminUser.email,
        authorName: adminUser.name || 'Staff',
        authorRole: 'STAFF',
        text,
      });
      setStaffCommentByTicket((current) => ({ ...current, [ticketId]: '' }));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add comment');
    }
  };

  const totalCount = tickets.length;
  const openCount = tickets.filter((item) => item.status === 'OPEN').length;
  const inProgressCount = tickets.filter((item) => item.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter((item) => item.status === 'RESOLVED').length;
  const rejectedCount = tickets.filter((item) => item.status === 'REJECTED').length;

  const getTicketStatusBadgeClass = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'OPEN':
        return 'ticket-status--open';
      case 'IN_PROGRESS':
        return 'ticket-status--in-progress';
      case 'RESOLVED':
        return 'ticket-status--resolved';
      case 'CLOSED':
        return 'ticket-status--closed';
      case 'REJECTED':
        return 'ticket-status--rejected';
      default:
        return '';
    }
  };

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
            <button type="button" className="site-nav__link is-active" onClick={() => navigate('/admin/incidents')}>
              Tickets
            </button>
            <button type="button" className="site-nav__link" onClick={() => navigate('/admin/profile')}>
              Profile
            </button>
            <button type="button" className="site-nav__link" onClick={onLogout}>
              Logout
            </button>
          </div>
        </nav>
        <div className="resource-page__header">
          <div>
            <p className="kicker">INCIDENT MANAGEMENT</p>
            <h1 className="panel__title">Incident Tickets</h1>
            <p className="subtitle">Assign staff, track progress, and close tickets with notes.</p>
            <div className="resource-controls-row">
              <label className="resource-field resource-field--control">
                <span>Status</span>
                <select className="input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option value="ALL">ALL</option>
                  {INCIDENT_STATUSES.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>
              <label className="resource-field resource-field--control-search">
                <span>Search</span>
                <input className="input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by resource/user/category" />
              </label>
            </div>
          </div>
          <div className="actions-row actions-row--tight">
            <button type="button" className="btn btn--ghost" onClick={load}>Refresh</button>
          </div>
        </div>

        <div className="resource-cards" style={{ marginTop: 10 }}>
          <article className="resource-card" style={{ cursor: 'default' }}>
            <p className="resource-card__tag">Total</p>
            <h2>{totalCount}</h2>
            <p>All incident tickets</p>
          </article>
          <article className="resource-card" style={{ cursor: 'default' }}>
            <p className="resource-card__tag">Open</p>
            <h2>{openCount}</h2>
            <p>Need assignment</p>
          </article>
          <article className="resource-card" style={{ cursor: 'default' }}>
            <p className="resource-card__tag">In Progress</p>
            <h2>{inProgressCount}</h2>
            <p>Work ongoing</p>
          </article>
        </div>

        <div className="resource-cards" style={{ marginTop: 12 }}>
          <article className="resource-card" style={{ cursor: 'default' }}>
            <p className="resource-card__tag">Resolved</p>
            <h2>{resolvedCount}</h2>
            <p>Awaiting closure/verification</p>
          </article>
          <article className="resource-card" style={{ cursor: 'default' }}>
            <p className="resource-card__tag">Rejected</p>
            <h2>{rejectedCount}</h2>
            <p>Rejected by admin</p>
          </article>
          <article className="resource-card" style={{ cursor: 'default' }}>
            <p className="resource-card__tag">Session</p>
            <h2 style={{ fontSize: '1.2rem', lineHeight: 1.3 }}>{adminUser?.email || 'Admin'}</h2>
            <p>Current operator</p>
          </article>
        </div>

        {loading ? <p className="muted">Loading incident tickets...</p> : null}
        {message ? <p className="msg msg--success">{message}</p> : null}
        {error ? <p className="msg msg--error">{error}</p> : null}

        {!loading && !tickets.length ? <p className="muted">No incident tickets found for the selected filters.</p> : null}

        {tickets.map((ticket) => {
          const editor = editorByTicket[ticket.id] || createEditor();
          const statusClass = getTicketStatusBadgeClass(ticket.status);
          const cardStatusClass = statusClass ? `admin-booking-group--${statusClass.replace('ticket-status--', '')}` : '';
          return (
            <article key={ticket.id} className={`admin-booking-group ${cardStatusClass}`}>
              <div className="ticket-card__header">
                <h3>{ticket.resourceName} - {ticket.category}</h3>
                <span className={`incident-badge ticket-status-badge ${statusClass}`}>
                  {ticket.status}
                </span>
              </div>
              <p><strong>Reporter:</strong> {ticket.reporterName} ({ticket.reporterEmail})</p>
              <p><strong>Location:</strong> {ticket.resourceLocation} / {ticket.resourceSublocation}</p>
              <p><strong>Priority:</strong> {ticket.priority}</p>
              <p><strong>Created:</strong> {formatDateTime(ticket.createdAt)}</p>
              <p><strong>Description:</strong> {ticket.description}</p>

              {ticket.attachments?.length ? (
                <div className="incident-images">
                  {ticket.attachments.map((image, index) => <img key={`${ticket.id}-${index}`} src={image} alt="attachment" className="incident-thumb" />)}
                </div>
              ) : null}

              <div className="resource-grid">
                <label className="resource-field">
                  <span>Assigned staff email</span>
                  <input className="input" value={editor.assignedStaffEmail} onChange={(event) => setEditorByTicket((current) => ({ ...current, [ticket.id]: { ...editor, assignedStaffEmail: event.target.value } }))} />
                </label>
                <label className="resource-field">
                  <span>Assigned staff name</span>
                  <input className="input" value={editor.assignedStaffName} onChange={(event) => setEditorByTicket((current) => ({ ...current, [ticket.id]: { ...editor, assignedStaffName: event.target.value } }))} />
                </label>
                <label className="resource-field">
                  <span>Resolution notes</span>
                  <textarea className="input" rows={2} value={editor.resolutionNotes} onChange={(event) => setEditorByTicket((current) => ({ ...current, [ticket.id]: { ...editor, resolutionNotes: event.target.value } }))} />
                </label>
                <label className="resource-field">
                  <span>Rejection reason</span>
                  <textarea className="input" rows={2} value={editor.rejectionReason} onChange={(event) => setEditorByTicket((current) => ({ ...current, [ticket.id]: { ...editor, rejectionReason: event.target.value } }))} />
                </label>
              </div>

              <div className="actions-row">
                <button type="button" className="btn btn--primary" onClick={() => assignTechnician(ticket.id)}>
                  Assign Technician
                </button>
                <button type="button" className="btn btn--primary" onClick={() => saveTechnicianUpdate(ticket.id)}>
                  Save Technician Update
                </button>
                <button type="button" className="btn btn--ghost" onClick={() => closeTicket(ticket.id)} disabled={ticket.status !== 'RESOLVED'}>
                  Close Ticket
                </button>
                <button type="button" className="btn btn--delete" onClick={() => rejectTicket(ticket.id)} disabled={ticket.status === 'CLOSED'}>
                  Reject Ticket
                </button>
              </div>

              <div className="incident-comments">
                <h4>Comments</h4>
                {ticket.comments?.length ? ticket.comments.map((comment) => (
                  <div key={comment.id} className="incident-comment-item">
                    <p><strong>{comment.authorName}</strong> ({comment.authorRole}) - {formatDateTime(comment.updatedAt || comment.createdAt)}</p>
                    <p>{comment.text}</p>
                  </div>
                )) : <p className="muted">No comments yet.</p>}

                <div className="actions-row">
                  <textarea
                    className="input"
                    rows={2}
                    placeholder="Add staff comment"
                    value={staffCommentByTicket[ticket.id] || ''}
                    onChange={(event) => setStaffCommentByTicket((current) => ({ ...current, [ticket.id]: event.target.value }))}
                  />
                  <button type="button" className="btn btn--primary" onClick={() => addStaffComment(ticket.id)}>Add Staff Comment</button>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
