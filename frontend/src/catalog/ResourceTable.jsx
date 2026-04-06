import { formatWindow, getLocationLabel } from './resourceConfig';

export default function ResourceTable({ resources, onEdit, onDelete, busy }) {
  if (!resources.length) {
    return <p className="muted">No resources found for this category yet.</p>;
  }

  return (
    <div className="resource-table-wrap">
      <table className="resource-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Capacity</th>
            <th>Location</th>
            <th>Sublocation</th>
            <th>Linked Room</th>
            <th>Status</th>
            <th>Availability</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {resources.map((resource) => (
            <tr key={resource.id}>
              <td>{resource.name}</td>
              <td>{resource.capacity}</td>
              <td>{getLocationLabel(resource.location)}</td>
              <td>{resource.sublocation}</td>
              <td>{resource.relatedResourceName || '-'}</td>
              <td>
                <span className={`status-pill status-pill--${resource.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                  {resource.status}
                </span>
              </td>
              <td>
                <div className="window-list">
                  {(resource.availabilityWindows || []).map((window, index) => (
                    <span key={`${resource.id}-${index}`}>{formatWindow(window)}</span>
                  ))}
                </div>
              </td>
              <td>
                <div className="table-actions">
                  <button type="button" className="btn btn--ghost btn--compact" onClick={() => onEdit(resource)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost btn--compact"
                    onClick={() => onDelete(resource)}
                    disabled={busy}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
