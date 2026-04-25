import { useEffect, useMemo, useState } from 'react';
import {
  addIncidentComment,
  deleteMyIncidentTicket,
  deleteIncidentComment,
  listMyIncidentTickets,
  updateMyIncidentTicket,
  updateIncidentComment,
} from '../api';
import { INCIDENT_PRIORITIES, INCIDENT_STATUSES } from './incidentConfig';
import { canEditOwnComment, formatDateTime } from './incidentHelpers';
import { openNotifications } from '../notification/notificationBus';
import { requestConfirmation, showToast } from '../notification/notificationBus';

export default function MyIncidentTicketsPage({ user, navigate, onLogout }) {
  const displayName = user?.name || 'Campus User';
  const avatarUrl = user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=111111&color=fff`;
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [commentTextByTicket, setCommentTextByTicket] = useState({});
  const [editingComment, setEditingComment] = useState({ ticketId: '', commentId: '', text: '' });
  const [editingTicketId, setEditingTicketId] = useState('');
  const [ticketEditForm, setTicketEditForm] = useState({
    category: '',
    description: '',
    priority: 'MEDIUM',
    preferredContact: '',
    attachments: [],
  });
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortMode, setSortMode] = useState('DATE');
  const [searchTerm, setSearchTerm] = useState('');

  const load = async () => {
    if (!user?.email) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await listMyIncidentTickets(user.email);
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.email]);

  const visibleTickets = useMemo(() => {
    const filtered = tickets.filter((ticket) => {
      const search = searchTerm.trim().toLowerCase();
      const searchMatch = !search
        || ticket.resourceName.toLowerCase().includes(search)
        || (ticket.category || '').toLowerCase().includes(search)
        || (ticket.description || '').toLowerCase().includes(search)
        || (ticket.resourceLocation || '').toLowerCase().includes(search);
      const statusMatch = statusFilter === 'ALL' || ticket.status === statusFilter;
      const priorityMatch = priorityFilter === 'ALL' || ticket.priority === priorityFilter;
      return searchMatch && statusMatch && priorityMatch;
    });

    if (sortMode === 'PRIORITY') {
      const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return filtered.sort((left, right) => {
        const priorityA = priorityOrder[left.priority] ?? 999;
        const priorityB = priorityOrder[right.priority] ?? 999;
        if (priorityA !== priorityB) return priorityA - priorityB;
        return new Date(right.createdAt) - new Date(left.createdAt);
      });
    }

    if (sortMode === 'STATUS') {
      return filtered.sort((left, right) => {
        const statusA = left.status || '';
        const statusB = right.status || '';
        if (statusA !== statusB) return statusA.localeCompare(statusB);
        return new Date(right.createdAt) - new Date(left.createdAt);
      });
    }

    if (sortMode === 'RESOURCE') {
      return filtered.sort((left, right) => {
        const nameCompare = left.resourceName.localeCompare(right.resourceName);
        if (nameCompare !== 0) return nameCompare;
        return new Date(right.createdAt) - new Date(left.createdAt);
      });
    }

    // Default: sort by date (most recent first)
    return filtered.sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
  }, [tickets, searchTerm, statusFilter, priorityFilter, sortMode]);

  const addComment = async (ticketId) => {
    const text = (commentTextByTicket[ticketId] || '').trim();
    if (!text || !user?.email || !user?.name) {
      return;
    }

    try {
      await addIncidentComment(ticketId, {
        authorEmail: user.email,
        authorName: user.name,
        authorRole: 'USER',
        text,
      });
      setCommentTextByTicket((current) => ({ ...current, [ticketId]: '' }));
      showToast('Comment added successfully', 'success', 'Comment added');
      await load();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Comment failed';
      setError(errorMessage);
      showToast(errorMessage, 'error', 'Comment failed');
    }
  };

  const saveCommentEdit = async () => {
    if (!editingComment.ticketId || !editingComment.commentId || !user?.email) {
      return;
    }

    try {
      await updateIncidentComment(editingComment.ticketId, editingComment.commentId, user.email, { text: editingComment.text });
      setEditingComment({ ticketId: '', commentId: '', text: '' });
      showToast('Comment updated successfully', 'success', 'Comment updated');
      await load();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unable to update comment';
      setError(errorMessage);
      showToast(errorMessage, 'error', 'Comment update failed');
    }
  };

  const removeComment = async (ticketId, commentId) => {
    if (!user?.email) {
      return;
    }
    try {
      await deleteIncidentComment(ticketId, commentId, user.email);
      showToast('Comment deleted successfully', 'success', 'Comment deleted');
      await load();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unable to delete comment';
      setError(errorMessage);
      showToast(errorMessage, 'error', 'Comment delete failed');
    }
  };

  const startTicketEdit = (ticket) => {
    setEditingTicketId(ticket.id);
    setTicketEditForm({
      category: ticket.category || '',
      description: ticket.description || '',
      priority: ticket.priority || 'MEDIUM',
      preferredContact: ticket.preferredContact || '',
      attachments: ticket.attachments || [],
    });
    setError('');
    setMessage('');
  };

  const cancelTicketEdit = () => {
    setEditingTicketId('');
    setTicketEditForm({
      category: '',
      description: '',
      priority: 'MEDIUM',
      preferredContact: '',
      attachments: [],
    });
  };

  const saveTicketEdit = async (ticketId) => {
    if (!user?.email) {
      return;
    }

    try {
      await updateMyIncidentTicket(ticketId, user.email, ticketEditForm);
      setMessage('Ticket updated successfully');
      showToast('Ticket updated successfully', 'success', 'Ticket updated');
      cancelTicketEdit();
      await load();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unable to update ticket';
      setError(errorMessage);
      showToast(errorMessage, 'error', 'Ticket update failed');
    }
  };

  const removeTicket = async (ticketId) => {
    if (!user?.email) {
      return;
    }
    requestConfirmation({
      title: 'Delete ticket?',
      message: 'This action cannot be undone.',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        try {
          await deleteMyIncidentTicket(ticketId, user.email);
          setMessage('Ticket deleted successfully');
          showToast('Ticket deleted successfully', 'success', 'Ticket deleted');
          await load();
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unable to delete ticket';
          setError(errorMessage);
          showToast(errorMessage, 'error', 'Delete failed');
        }
      },
    });
  };

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
    <main className="scene scene--user">
      <section className="panel panel--content user-resource-detail user-incident-page">
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
          <p className="user-hero__kicker">INCIDENT TRACKER</p>
          <h1 className="panel__title">My Incident Tickets</h1>
          <p className="subtitle">Monitor ticket progress, update details, and communicate through comments.</p>
        </section>
        {loading ? <p className="muted">Loading tickets...</p> : null}
        {message ? <p className="msg msg--success">{message}</p> : null}
        {error ? <p className="msg msg--error">{error}</p> : null}

        {!loading && !tickets.length ? <p className="muted">No tickets yet.</p> : null}

        {!loading && tickets.length > 0 ? (
          <div className="user-resource-filter-bar">
            <select
              className="input user-filter-control"
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value)}
            >
              <option value="DATE">Sort: Date</option>
              <option value="PRIORITY">Sort: Priority</option>
              <option value="STATUS">Sort: Status</option>
              <option value="RESOURCE">Sort: Resource</option>
            </select>
            <select
              className="input user-filter-control"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="ALL">All Statuses</option>
              {INCIDENT_STATUSES.map((status) => (
                <option key={status} value={status}>{status.replace('_', ' ')}</option>
              ))}
            </select>
            <select
              className="input user-filter-control"
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
            >
              <option value="ALL">All Priorities</option>
              {INCIDENT_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
            <input
              className="input user-filter-control user-filter-control--search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search resource or category"
            />
          </div>
        ) : null}

        {visibleTickets.map((ticket) => (
          <article key={ticket.id} className={`admin-booking-group ticket-card ${(() => {
            const statusClass = getTicketStatusBadgeClass(ticket.status);
            return statusClass ? `admin-booking-group--${statusClass.replace('ticket-status--', '')}` : '';
          })()}`}>
            <div className="ticket-card__header">
              <h3>{ticket.resourceName} - {ticket.category}</h3>
              <span className={`incident-badge ticket-status-badge ${getTicketStatusBadgeClass(ticket.status)}`}>
                {ticket.status}
              </span>
            </div>
            <p><strong>Priority:</strong> {ticket.priority}</p>
            <p><strong>Location:</strong> {ticket.resourceLocation} / {ticket.resourceSublocation}</p>
            <p><strong>Preferred Contact:</strong> {ticket.preferredContact}</p>
            <p><strong>Description:</strong> {ticket.description}</p>
            <p><strong>Assigned Staff:</strong> {ticket.assignedStaffName || '-'} ({ticket.assignedStaffEmail || '-'})</p>
            <p><strong>Resolution Notes:</strong> {ticket.resolutionNotes || '-'}</p>
            <p><strong>Rejection Reason:</strong> {ticket.rejectionReason || '-'}</p>
            <p><strong>Created:</strong> {formatDateTime(ticket.createdAt)}</p>

            <div className="actions-row">
              <button
                type="button"
                className="btn btn--ghost btn--compact btn--edit"
                onClick={() => startTicketEdit(ticket)}
                disabled={ticket.status !== 'OPEN'}
                title={ticket.status !== 'OPEN' ? 'Only OPEN tickets can be edited' : ''}
              >
                Edit Ticket
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--compact btn--delete"
                onClick={() => removeTicket(ticket.id)}
                disabled={ticket.status !== 'OPEN'}
                title={ticket.status !== 'OPEN' ? 'Only OPEN tickets can be deleted' : ''}
              >
                Delete Ticket
              </button>
            </div>

            {editingTicketId === ticket.id ? (
              <div className="resource-grid" style={{ marginTop: 10 }}>
                <label className="resource-field">
                  <span>Category</span>
                  <input
                    className="input"
                    value={ticketEditForm.category}
                    onChange={(event) => setTicketEditForm((current) => ({ ...current, category: event.target.value }))}
                  />
                </label>
                <label className="resource-field">
                  <span>Priority</span>
                  <select
                    className="input"
                    value={ticketEditForm.priority}
                    onChange={(event) => setTicketEditForm((current) => ({ ...current, priority: event.target.value }))}
                  >
                    {INCIDENT_PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                  </select>
                </label>
                <label className="resource-field">
                  <span>Preferred Contact</span>
                  <input
                    className="input"
                    value={ticketEditForm.preferredContact}
                    onChange={(event) => setTicketEditForm((current) => ({ ...current, preferredContact: event.target.value }))}
                  />
                </label>
                <label className="resource-field">
                  <span>Description</span>
                  <textarea
                    className="input"
                    rows={3}
                    value={ticketEditForm.description}
                    onChange={(event) => setTicketEditForm((current) => ({ ...current, description: event.target.value }))}
                  />
                </label>
                <div className="actions-row">
                  <button type="button" className="btn btn--primary btn--compact" onClick={() => saveTicketEdit(ticket.id)}>
                    Save Ticket
                  </button>
                  <button type="button" className="btn btn--ghost btn--compact" onClick={cancelTicketEdit}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}

            {ticket.attachments?.length ? (
              <div className="incident-images">
                {ticket.attachments.map((image, index) => <img key={`${ticket.id}-${index}`} src={image} alt="attachment" className="incident-thumb" />)}
              </div>
            ) : null}

            <div className="incident-comments">
              <h4>Comments</h4>
              {ticket.comments?.length ? ticket.comments.map((comment) => (
                <div key={comment.id} className="incident-comment-item">
                  <p><strong>{comment.authorName}</strong> ({comment.authorRole}) - {formatDateTime(comment.updatedAt || comment.createdAt)}</p>
                  {editingComment.ticketId === ticket.id && editingComment.commentId === comment.id ? (
                    <>
                      <textarea className="input" rows={2} value={editingComment.text} onChange={(event) => setEditingComment((current) => ({ ...current, text: event.target.value }))} />
                      <div className="actions-row">
                        <button type="button" className="btn btn--primary btn--compact" onClick={saveCommentEdit}>Save</button>
                        <button type="button" className="btn btn--ghost btn--compact" onClick={() => setEditingComment({ ticketId: '', commentId: '', text: '' })}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <p>{comment.text}</p>
                  )}

                  {canEditOwnComment(comment, user?.email) && editingComment.commentId !== comment.id ? (
                    <div className="table-actions">
                      <button type="button" className="btn btn--ghost btn--compact btn--edit" onClick={() => setEditingComment({ ticketId: ticket.id, commentId: comment.id, text: comment.text })}>Edit</button>
                      <button type="button" className="btn btn--ghost btn--compact btn--delete" onClick={() => removeComment(ticket.id, comment.id)}>Delete</button>
                    </div>
                  ) : null}
                </div>
              )) : <p className="muted">No comments yet.</p>}

              <div className="actions-row">
                <textarea
                  className="input"
                  rows={2}
                  placeholder="Add a comment"
                  value={commentTextByTicket[ticket.id] || ''}
                  onChange={(event) => setCommentTextByTicket((current) => ({ ...current, [ticket.id]: event.target.value }))}
                />
                <button type="button" className="btn btn--primary" onClick={() => addComment(ticket.id)}>Add Comment</button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
