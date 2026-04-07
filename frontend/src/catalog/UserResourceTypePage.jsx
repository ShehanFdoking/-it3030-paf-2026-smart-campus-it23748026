import { useEffect, useMemo, useState } from 'react';
import { listResources } from '../api';
import { formatSublocationLabel, getCategoryMeta, getLocationLabel } from './resourceConfig';
import { openNotifications } from '../notification/notificationBus';

function uniqueSublocations(resources) {
  return ['ALL', ...new Set(resources.map((resource) => resource.sublocation))];
}

export default function UserResourceTypePage({ categorySlug, navigate, onLogout }) {
  const meta = getCategoryMeta(categorySlug);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortMode, setSortMode] = useState('LOCATION');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [locationSublocationFilter, setLocationSublocationFilter] = useState({});

  useEffect(() => {
    const load = async () => {
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

    load();
  }, [meta.enumValue]);

  const visibleResources = useMemo(() => {
    const filtered = resources.filter((resource) => {
      const search = searchTerm.trim().toLowerCase();
      const searchMatch = !search
        || resource.name.toLowerCase().includes(search)
        || (resource.sublocation || '').toLowerCase().includes(search)
        || getLocationLabel(resource.location).toLowerCase().includes(search);
      const statusMatch = statusFilter === 'ALL' || resource.status === statusFilter;
      return searchMatch && statusMatch;
    });

    if (sortMode === 'NAME') {
      return filtered.sort((left, right) => left.name.localeCompare(right.name));
    }

    return filtered.sort((left, right) => {
      const locationDiff = getLocationLabel(left.location).localeCompare(getLocationLabel(right.location));
      if (locationDiff !== 0) {
        return locationDiff;
      }

      const sublocationDiff = formatSublocationLabel(left.sublocation).localeCompare(formatSublocationLabel(right.sublocation));
      if (sublocationDiff !== 0) {
        return sublocationDiff;
      }

      return left.name.localeCompare(right.name);
    });
  }, [resources, searchTerm, sortMode, statusFilter]);

  const groupedByLocation = useMemo(() => {
    return visibleResources.reduce((accumulator, resource) => {
      const key = resource.location || 'UNKNOWN';
      if (!accumulator[key]) {
        accumulator[key] = [];
      }
      accumulator[key].push(resource);
      return accumulator;
    }, {});
  }, [visibleResources]);

  const locationEntries = Object.entries(groupedByLocation).sort((a, b) => {
    const left = getLocationLabel(a[0]);
    const right = getLocationLabel(b[0]);
    return left.localeCompare(right);
  });

  const totalResources = visibleResources.length;
  const activeResources = visibleResources.filter((resource) => resource.status === 'ACTIVE').length;

  const openBookingPage = (resourceId) => {
    navigate(`/resources/${categorySlug}/${resourceId}/book`);
  };

  return (
    <main className="scene scene--user">
      <section className="panel panel--content user-resource-detail">
        <nav className="site-nav" aria-label="Main navigation">
          <div className="site-nav__brand">
            <span className="site-nav__dot" aria-hidden="true" />
            <div>
              <p className="site-nav__kicker">Smart Campus</p>
              <strong>Resource Portal</strong>
            </div>
          </div>
          <div className="site-nav__links">
            <button type="button" className="site-nav__link" onClick={() => navigate('/home')}>Home</button>
            <button type="button" className="site-nav__link is-active" onClick={() => navigate('/resources')}>Resources</button>
            <button type="button" className="site-nav__link site-nav__link--notifications" onClick={openNotifications}>Notifications</button>
            <button type="button" className="site-nav__link" onClick={onLogout}>Logout</button>
          </div>
        </nav>

        <section className="user-hero user-hero--compact">
          <p className="user-hero__kicker">CATEGORY OVERVIEW</p>
          <h1 className="panel__title">{meta.label}</h1>
          <div className="user-hero__chips">
            <span className="user-chip">Total: {totalResources}</span>
            <span className="user-chip user-chip--ok">Active: {activeResources}</span>
            <span className="user-chip">Locations: {locationEntries.length}</span>
          </div>
        </section>

        <div className="user-resource-filter-bar">
          <select
            className="input user-filter-control"
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value)}
          >
            <option value="LOCATION">Sort: Location</option>
            <option value="NAME">Sort: Name</option>
          </select>
          <select
            className="input user-filter-control"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="ALL">ALL</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="OUT_OF_SERVICE">OUT OF SERVICE</option>
          </select>
          <input
            className="input user-filter-control user-filter-control--search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search"
          />
        </div>

        {loading ? <p className="muted">Loading resources...</p> : null}
        {error ? <p className="msg msg--error">{error}</p> : null}

        {!loading && !error && locationEntries.length === 0 ? <p className="muted">No resources found.</p> : null}

        <div className="user-location-stack">
          {locationEntries.map(([locationKey, locationResources]) => {
            const sublocationOptions = uniqueSublocations(locationResources);
            const selected = locationSublocationFilter[locationKey] || 'ALL';
            const resourcesForSection = selected === 'ALL'
              ? locationResources
              : locationResources.filter((resource) => resource.sublocation === selected);

            return (
              <section key={locationKey} className="user-location-section">
                <div className="user-location-header">
                  <h2>{getLocationLabel(locationKey)}</h2>
                  <select
                    className="input user-filter-control"
                    value={selected}
                    onChange={(event) => setLocationSublocationFilter((current) => ({
                      ...current,
                      [locationKey]: event.target.value,
                    }))}
                  >
                    {sublocationOptions.map((value) => (
                        <option key={value} value={value}>{value === 'ALL' ? 'All' : formatSublocationLabel(value)}</option>
                    ))}
                  </select>
                </div>

                <div className="user-resource-card-grid">
                  {resourcesForSection.map((resource) => (
                    <article
                      key={resource.id}
                      className="user-resource-mini-card"
                      role="button"
                      tabIndex={0}
                      onClick={() => openBookingPage(resource.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          openBookingPage(resource.id);
                        }
                      }}
                    >
                      <div className="user-resource-mini-card__code">{resource.name}</div>
                      <div className="user-resource-mini-card__meta">
                        <p>{getLocationLabel(resource.location)}</p>
                        <p>{formatSublocationLabel(resource.sublocation)}</p>
                        <p>Capacity: {resource.capacity}</p>
                        <p>Status: {resource.status === 'ACTIVE' ? 'Active' : 'Out of service'}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>
    </main>
  );
}
