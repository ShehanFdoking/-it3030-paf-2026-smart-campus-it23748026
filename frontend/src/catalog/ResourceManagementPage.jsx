import { RESOURCE_CATEGORY_LIST } from './resourceConfig';

export default function ResourceManagementPage({ navigate, onLogout }) {
  return (
    <main className="scene scene--admin">
      <section className="panel panel--content resource-hub admin-panel">
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
            <button type="button" className="site-nav__link" onClick={onLogout}>
              Logout
            </button>
          </div>
        </nav>

        <div className="resource-hub__top">
          <div>
            <p className="kicker">RESOURCE CATALOGUE</p>
            <h1 className="panel__title">Resource Management</h1>
            <p className="subtitle">Open a resource type to manage lecture halls, meeting rooms, and equipment.</p>
          </div>
          <button type="button" className="btn btn--ghost" onClick={() => navigate('/admin/dashboard')}>
            Back to Dashboard
          </button>
        </div>

        <div className="resource-cards">
          {RESOURCE_CATEGORY_LIST.map((category) => (
            <button
              key={category.slug}
              type="button"
              className="resource-card"
              onClick={() => navigate(category.route)}
            >
              <span className="resource-card__tag">{category.label}</span>
              <h2>{category.itemLabel}</h2>
              <p>{category.description}</p>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
