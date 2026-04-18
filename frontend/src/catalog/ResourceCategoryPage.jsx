import { useEffect, useMemo, useState } from 'react';
import { createResource, deleteResource, listResources, updateResource } from '../api';
import ResourceForm from './ResourceForm';
import ResourceTable from './ResourceTable';
import { getCategoryMeta } from './resourceConfig';
import { openNotifications, requestConfirmation, showToast } from '../notification/notificationBus';

export default function ResourceCategoryPage({ categorySlug, navigate, onLogout }) {
  const meta = getCategoryMeta(categorySlug);
  const [resources, setResources] = useState([]);
  const [sortMode, setSortMode] = useState('NAME');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const visibleResources = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return resources;
    }

    return resources.filter((resource) => {
      const searchableText = [
        resource.name,
        resource.location,
        resource.sublocation,
        resource.status,
        resource.relatedResourceName,
        resource.equipmentType,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [resources, searchTerm]);

  const loadResources = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await listResources(meta.enumValue, sortMode === 'LOCATION');
      setResources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [categorySlug, meta.enumValue, sortMode]);

  const handleCreateOrUpdate = async (payload) => {
    setSaving(true);
    setMessage('');
    setError('');

    try {
      if (selectedResource) {
        await updateResource(selectedResource.id, payload);
        setMessage(`${meta.itemLabel} updated successfully`);
      } else {
        await createResource(payload);
        setMessage(`${meta.itemLabel} created successfully`);
      }
      setSelectedResource(null);
      setShowForm(false);
      await loadResources();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save resource');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (resource) => {
    requestConfirmation({
      title: `Delete ${resource.name}?`,
      message: 'This resource will be permanently deleted.',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        setSaving(true);
        setMessage('');
        setError('');

        try {
          await deleteResource(resource.id);
          setMessage(`${resource.name} deleted successfully`);
          showToast(`${resource.name} deleted successfully`, 'success', 'Resource deleted');
          await loadResources();
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unable to delete resource';
          setError(errorMessage);
          showToast(errorMessage, 'error', 'Delete failed');
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const handleEdit = (resource) => {
    setSelectedResource(resource);
    setShowForm(true);
    setMessage('');
    setError('');
  };

  const handleNew = () => {
    setSelectedResource(null);
    setShowForm(true);
    setMessage('');
    setError('');
  };

  return (
    <main className="scene scene--admin">
      <section className="panel panel--content resource-page admin-panel">
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
            <button type="button" className="site-nav__link is-active" onClick={() => navigate('/admin/resources')}>
              Resources
            </button>
            <button type="button" className="site-nav__link" onClick={() => navigate('/admin/bookings')}>
              Bookings
            </button>
            <button type="button" className="site-nav__link" onClick={() => navigate('/admin/incidents')}>
              Tickets
            </button>
            <button type="button" className="site-nav__link" onClick={() => navigate('/admin/profile')}>
              Profile
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
          <div className="resource-page__meta">
            <p className="kicker">RESOURCE CATALOGUE</p>
            <h1 className="panel__title">{meta.label}</h1>
            <p className="subtitle">Manage {meta.itemLabel} details, availability, and status.</p>
            <div className="resource-controls-row">
              <label className="resource-field resource-field--control">
                <span>Sort resources</span>
                <select className="input" value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
                  <option value="NAME">By Name</option>
                  <option value="LOCATION">By Location</option>
                </select>
              </label>
              <label className="resource-field resource-field--control resource-field--control-search">
                <span>Search resources</span>
                <input
                  className="input"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by name, location, status, linked room, or type"
                />
              </label>
            </div>
          </div>
          <div className="actions-row actions-row--tight">
            <button type="button" className="btn btn--primary btn--add-resource" onClick={handleNew}>
              Add New {meta.itemLabel}
            </button>
          </div>
        </div>

        {message ? <p className="msg msg--success">{message}</p> : null}
        {error ? <p className="msg msg--error">{error}</p> : null}
        {loading ? <p className="muted">Loading resources...</p> : null}

        {showForm ? (
          <div className="resource-form-shell">
            <ResourceForm
              categorySlug={categorySlug}
              resource={selectedResource}
              busy={saving}
              onCancel={() => {
                setShowForm(false);
                setSelectedResource(null);
              }}
              onSubmit={handleCreateOrUpdate}
            />
          </div>
        ) : null}

        {!loading && searchTerm.trim() && visibleResources.length === 0 ? (
          <p className="muted">No matching resources found.</p>
        ) : (
          <ResourceTable
            resources={visibleResources}
            onEdit={handleEdit}
            onDelete={handleDelete}
            busy={saving}
            categorySlug={categorySlug}
          />
        )}
      </section>
    </main>
  );
}
