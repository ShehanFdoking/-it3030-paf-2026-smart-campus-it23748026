import { RESOURCE_CATEGORY_LIST } from './resourceConfig';

const CATEGORY_VISUAL = {
  'lecture-halls': { icon: '🏫', color: 'var(--user-visual-1)' },
  'meeting-rooms': { icon: '🧑‍💼', color: 'var(--user-visual-2)' },
  equipment: { icon: '🧰', color: 'var(--user-visual-3)' },
};

export default function UserResourceLandingPage({ navigate, onBack, onLogout }) {
  return (
    <main className="scene scene--user">
      <section className="panel panel--content user-resource-hub">
        <nav className="site-nav" aria-label="Main navigation">
          <div className="site-nav__brand">
            <span className="site-nav__dot" aria-hidden="true" />
            <div>
              <p className="site-nav__kicker">Smart Campus</p>
              <strong>Resource Portal</strong>
            </div>
          </div>
          <div className="site-nav__links">
            <button type="button" className="site-nav__link" onClick={onBack}>Home</button>
            <button type="button" className="site-nav__link is-active" onClick={() => navigate('/resources')}>Resources</button>
            <button type="button" className="site-nav__link" onClick={onLogout}>Logout</button>
          </div>
        </nav>

        <h1 className="panel__title">Resource Catalogue</h1>
        <p className="subtitle">Choose a resource type to view all available resources.</p>

        <div className="user-resource-grid">
          {RESOURCE_CATEGORY_LIST.map((category) => {
            const visual = CATEGORY_VISUAL[category.slug];
            return (
              <button
                key={category.slug}
                type="button"
                className="user-resource-box"
                onClick={() => navigate(`/resources/${category.slug}`)}
              >
                <div className="user-resource-box__icon" style={{ background: visual?.color || 'var(--primary)' }}>
                  <span>{visual?.icon || '📦'}</span>
                </div>
                <h2>{category.label}</h2>
                <p>Open {category.label.toLowerCase()} details</p>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
