import { useEffect, useState } from 'react';
import { createResource, deleteResource, listResources, updateResource } from '../api';
import ResourceForm from './ResourceForm';
import ResourceTable from './ResourceTable';
import { getCategoryMeta } from './resourceConfig';

export default function ResourceCategoryPage({ categorySlug, navigate, onBack }) {
  const meta = getCategoryMeta(categorySlug);
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadResources = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await listResources(meta.enumValue);
      setResources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [categorySlug, meta.enumValue]);

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

  const handleDelete = async (resource) => {
    const confirmed = window.confirm(`Delete ${resource.name}?`);
    if (!confirmed) {
      return;
    }

    setSaving(true);
    setMessage('');
    setError('');

    try {
      await deleteResource(resource.id);
      setMessage(`${resource.name} deleted successfully`);
      await loadResources();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete resource');
    } finally {
      setSaving(false);
    }
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
        <div className="resource-page__header">
          <div>
            <p className="kicker">RESOURCE CATALOGUE</p>
            <h1 className="panel__title">{meta.label}</h1>
            <p className="subtitle">Manage {meta.itemLabel} details, availability, and status.</p>
          </div>
          <div className="actions-row actions-row--tight">
            <button type="button" className="btn btn--ghost" onClick={() => navigate('/admin/resources')}>
              Back to Resources
            </button>
            <button type="button" className="btn btn--primary" onClick={handleNew}>
              Add New {meta.itemLabel}
            </button>
          </div>
        </div>

        {message ? <p className="msg msg--success">{message}</p> : null}
        {error ? <p className="msg msg--error">{error}</p> : null}
        {loading ? <p className="muted">Loading resources...</p> : null}

        <ResourceTable resources={resources} onEdit={handleEdit} onDelete={handleDelete} busy={saving} />

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
      </section>
    </main>
  );
}
