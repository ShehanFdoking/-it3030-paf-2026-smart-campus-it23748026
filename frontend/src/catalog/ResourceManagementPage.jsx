import { RESOURCE_CATEGORY_LIST } from './resourceConfig';

export default function ResourceManagementPage({ navigate, onBack }) {
  return (
    <main className="scene scene--admin">
      <section className="panel panel--content resource-hub admin-panel">
        <div className="resource-hub__top">
          <div>
            <p className="kicker">RESOURCE CATALOGUE</p>
            <h1 className="panel__title">Resource Management</h1>
            <p className="subtitle">Open a resource type to manage lecture halls, meeting rooms, and equipment.</p>
          </div>
          <button type="button" className="btn btn--ghost" onClick={onBack}>
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
