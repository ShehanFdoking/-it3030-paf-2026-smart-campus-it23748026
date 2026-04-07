import { useEffect, useState } from 'react';
import {
  addIncidentComment,
  deleteMyIncidentTicket,
  deleteIncidentComment,
  listMyIncidentTickets,
  updateMyIncidentTicket,
  updateIncidentComment,
} from '../api';
import { INCIDENT_PRIORITIES } from './incidentConfig';
import { canEditOwnComment, formatDateTime } from './incidentHelpers';
import { openNotifications } from '../notification/notificationBus';
import { requestConfirmation, showToast } from '../notification/notificationBus';

export default function MyIncidentTicketsPage({ user, navigate, onLogout }) {
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
      <section className="panel panel--content user-resource-detail">
        <nav className="site-nav" aria-label="Main navigation">
          <div className="site-nav__brand">
            <span className="site-nav__dot" aria-hidden="true" />
            <div>
              <p className="site-nav__kicker">Smart Campus</p>
              <strong>My Tickets</strong>
            </div>
          </div>
          <div className="site-nav__links">
            <button type="button" className="site-nav__link" onClick={() => navigate('/home')}>Home</button>
            <button type="button" className="site-nav__link" onClick={() => navigate('/my-bookings')}>My Bookings</button>
            <button type="button" className="site-nav__link is-active" onClick={() => navigate('/my-tickets')}>My Tickets</button>
            <button type="button" className="site-nav__link site-nav__link--notifications" onClick={openNotifications}>Notifications</button>
            <button type="button" className="site-nav__link" onClick={onLogout}>Logout</button>
          </div>
        </nav>

        <h1 className="panel__title">My Incident Tickets</h1>
        {loading ? <p className="muted">Loading tickets...</p> : null}
        {message ? <p className="msg msg--success">{message}</p> : null}
        {error ? <p className="msg msg--error">{error}</p> : null}

        {!loading && !tickets.length ? <p className="muted">No tickets yet.</p> : null}

        {tickets.map((ticket) => (
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
