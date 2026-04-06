import { formatEquipmentType, formatSublocationLabel, formatWindow, getLocationLabel, RESOURCE_CATEGORIES } from './resourceConfig';

export default function ResourceTable({ resources, onEdit, onDelete, busy, categorySlug }) {
  if (!resources.length) {
    return <p className="muted">No resources found for this category yet.</p>;
  }

  const showEquipmentType = categorySlug === RESOURCE_CATEGORIES.equipment.slug;
  const showLinkedRoom = categorySlug === RESOURCE_CATEGORIES.equipment.slug;

  return (
    <div className="resource-table-wrap">
      <table className="resource-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Capacity</th>
            {showEquipmentType ? <th>Equipment Type</th> : null}
            <th>Location</th>
            <th>Sublocation</th>
            {showLinkedRoom ? <th>Linked Room</th> : null}
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
              {showEquipmentType ? <td>{formatEquipmentType(resource.equipmentType)}</td> : null}
              <td>{getLocationLabel(resource.location)}</td>
              <td>{formatSublocationLabel(resource.sublocation)}</td>
              {showLinkedRoom ? <td>{resource.relatedResourceName || '-'}</td> : null}
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
                  <button type="button" className="btn btn--ghost btn--compact btn--edit" onClick={() => onEdit(resource)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost btn--compact btn--delete"
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
