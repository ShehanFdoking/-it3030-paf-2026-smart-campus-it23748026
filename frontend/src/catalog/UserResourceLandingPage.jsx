import { RESOURCE_CATEGORY_LIST } from './resourceConfig';

const CATEGORY_VISUAL = {
  'lecture-halls': { token: 'LH', color: 'var(--user-visual-1)' },
  'meeting-rooms': { token: 'MR', color: 'var(--user-visual-2)' },
  equipment: { token: 'EQ', color: 'var(--user-visual-3)' },
  labs: { token: 'LB', color: 'var(--user-visual-4, #2d6a4f)' },
};

function getCategoryToken(category) {
  if (!category?.label) {
    return 'RS';
  }

  return category.label
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function UserResourceLandingPage({ user, navigate, onBack, onLogout }) {
  const displayName = user?.name || 'User';
  const avatarUrl = user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=111111&color=fff`;

  return (
    <main className="scene scene--user">
      <section className="panel panel--content user-resource-hub">
        <header className="home-nav">
          <button type="button" className="home-nav__brand" onClick={onBack}>Uni ResourceHub</button>
          <div className="home-nav__links">
            <button type="button" className="home-nav__link" onClick={onBack}>Home</button>
            <button type="button" className="home-nav__link is-active">Resources</button>
            <button type="button" className="home-nav__link" onClick={() => navigate('/my-bookings')}>My Bookings</button>
            <button type="button" className="home-nav__link" onClick={() => navigate('/my-tickets')}>My Tickets</button>
            <button type="button" className="home-nav__link" onClick={() => navigate('/notifications')}>Notifications</button>
            <button type="button" className="home-nav__link" onClick={onLogout}>Logout</button>
          </div>
          <div className="home-nav__user">
            <span className="home-nav__user-name">{displayName}</span>
            <img src={avatarUrl} alt={displayName} className="home-nav__user-avatar" />
          </div>
        </header>

        <section className="user-hero">
          <p className="user-hero__kicker">RESOURCE DIRECTORY</p>
          <h1 className="panel__title">Find Spaces and Equipment Fast</h1>
          <p className="subtitle">Choose a category to explore available resources by location and floor.</p>
          <div className="user-hero__chips">
            <span className="user-chip">Live availability view</span>
            <span className="user-chip">Location-based browsing</span>
            <span className="user-chip">Quick status filtering</span>
          </div>
        </section>

        <div className="user-resource-grid">
          {RESOURCE_CATEGORY_LIST.map((category) => {
            const visual = CATEGORY_VISUAL[category.slug];
            const token = visual?.token || getCategoryToken(category);
            return (
              <button
                key={category.slug}
                type="button"
                className="user-resource-box"
                onClick={() => navigate(`/resources/${category.slug}`)}
              >
                <span className="user-resource-box__icon" style={{ background: visual?.color }} aria-hidden="true">
                  {token}
                </span>
                <span className="user-resource-box__badge">Explore</span>
                <h2>{category.label}</h2>
                <p>{category.description}</p>
                <span className="user-resource-box__hint">View details</span>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
