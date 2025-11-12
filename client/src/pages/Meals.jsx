import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';

export default function Meals() {
  const [meals, setMeals] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    api.listMeals().then(setMeals);
  }, []);

  const availableTags = useMemo(() => {
    const all = new Set();
    meals.forEach(meal => (meal.dietaryTags || []).forEach(tag => all.add(tag)));
    return Array.from(all).sort((a, b) => a.localeCompare(b));
  }, [meals]);

  const groupedMeals = useMemo(() => {
    const filteredMeals = selectedTags.length
      ? meals.filter(meal => {
          const tags = meal.dietaryTags || [];
          return selectedTags.every(tag => tags.includes(tag));
        })
      : meals;

    const groups = new Map();

    filteredMeals.forEach(meal => {
      const providerId = meal.memberId || meal.member?._id || 'unknown-provider';
      const provider = meal.member
        ? {
            id: meal.member.id || meal.member._id || providerId,
            name: meal.member.name || 'Community Member',
            address: meal.member.address || ''
          }
        : {
            id: providerId,
            name: 'Community Member',
            address: ''
          };

      if (!groups.has(providerId)) {
        groups.set(providerId, { provider, meals: [] });
      }

      groups.get(providerId).meals.push(meal);
    });

    return Array.from(groups.values()).sort((a, b) =>
      a.provider.name.localeCompare(b.provider.name)
    );
  }, [meals, selectedTags]);

  function toggleTag(tag) {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }

  function clearFilters() {
    setSelectedTags([]);
  }

  return (
    <div className="meals-page">
      <section className="meals-hero">
        <div className="meals-hero__content">
          <h1 className="meals-hero__title">
            Kobra Kai Meals
          </h1>
          <p className="meals-hero__eyebrow">Pick from our amazing selection of home-cooked meals, delivered with aroha.</p>
          <p className="meals-hero__description">
            Discover local favourites from our charity partners and place an order with the providers that best meet your
            needs.
          </p>
        </div>
      </section>

      <section className="meals-intro">
        <div className="meals-intro__inner">
          <h2>Select meals from any of these local restaurants</h2>
          <p>Browse each provider&apos;s offerings and mix and match meals that suit your whānau.</p>
        </div>
      </section>

      <div className={`meals-layout${availableTags.length === 0 ? ' meals-layout--single' : ''}`}>
        {availableTags.length > 0 ? (
          <aside className="meals-sidebar">
            <h3 className="meals-sidebar__title">Filter meals</h3>
            <p className="meals-sidebar__hint">Choose dietary tags to refine the meals shown below.</p>
            <div className="meals-sidebar__group">
              <h4 className="meals-sidebar__group-title">Dietary tags</h4>
              <div className="meals-filter__options">
                {availableTags.map(tag => {
                  const checked = selectedTags.includes(tag);
                  return (
                    <label key={tag} className={`meals-filter__chip${checked ? ' is-selected' : ''}`}>
                      <input
                        type="checkbox"
                        value={tag}
                        checked={checked}
                        onChange={() => toggleTag(tag)}
                      />
                      <span>{tag}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            {selectedTags.length > 0 ? (
              <button type="button" className="meals-sidebar__clear" onClick={clearFilters}>
                Clear filters
              </button>
            ) : null}
          </aside>
        ) : null}

        <div className="meals-provider-list">
          {groupedMeals.length === 0 ? (
            <div className="meals-page__empty">
              <p>
                {selectedTags.length
                  ? 'No meals match the selected dietary preferences at the moment.'
                  : 'No meals have been listed yet. Please check back soon!'}
              </p>
            </div>
          ) : (
            groupedMeals.map(({ provider, meals: providerMeals }) => (
              <section key={provider.id} className="meals-provider">
                <header className="meals-provider__header">
                  <div>
                    <h3 className="meals-provider__name">{provider.name}</h3>
                    {provider.address ? (
                      <p className="meals-provider__address">{provider.address}</p>
                    ) : null}
                  </div>
                  <span className="meals-provider__count">
                    {providerMeals.length} meal{providerMeals.length === 1 ? '' : 's'} available
                  </span>
                </header>

                <div className="meals-provider__grid">
                  {providerMeals.map(meal => (
                    <article key={meal._id} className="meals-card">
                      <div className="meals-card__body">
                        <h4 className="meals-card__title">{meal.title}</h4>
                        {meal.description ? (
                          <p className="meals-card__description">{meal.description}</p>
                        ) : null}
                        <p className="meals-card__stock">
                          Portions available: <strong>{meal.qtyAvailable}</strong>
                        </p>
                        {meal.dietaryTags?.length ? (
                          <ul className="meals-card__tags">
                            {meal.dietaryTags.map(tag => (
                              <li key={tag}>{tag}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                      <div className="meals-card__footer">
                        <button type="button" className="meals-card__order">
                          Order
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
         </div>
    </div>
  );
};
