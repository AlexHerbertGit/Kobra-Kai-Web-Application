import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from '../state/useAuth.js';

export default function Meals() {
  const [meals, setMeals] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [orderingMealId, setOrderingMealId] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [ordering, setOrdering] = useState(false);
  const [orderStatus, setOrderStatus] = useState({ type: null, message: '' });
  const auth = useAuth();
  const user = auth?.user;
  const setUser = auth?.setUser ?? (() => {});

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

  function handleSelectMeal(meal) {
    if (!user) {
      setOrderStatus({ type: 'error', message: 'Please sign in as a beneficiary to order meals.' });
      return;
    }
    if (user.role !== 'beneficiary') {
      setOrderStatus({ type: 'error', message: 'Only beneficiary accounts can order meals.' });
      return;
    }

    setOrderingMealId(meal._id);
    setOrderQuantity(1);
    setOrderStatus({ type: null, message: '' });
  }

  function handleCancelOrder() {
    setOrderingMealId(null);
    setOrderQuantity(1);
  }

  async function handleSubmitOrder(meal) {
    if (!meal) return;
    setOrdering(true);
    try {
      const result = await api.placeOrder(meal._id, orderQuantity);
      setOrderStatus({ type: 'success', message: 'Your order has been placed successfully.' });
      if (result?.beneficiaryBalance !== undefined) {
        setUser(prev => (prev ? { ...prev, tokenBalance: result.beneficiaryBalance } : prev));
      }
      setMeals(await api.listMeals());
    } catch (err) {
      setOrderStatus({ type: 'error', message: err.message || 'Failed to place order.' });
    } finally {
      setOrdering(false);
      setOrderingMealId(null);
      setOrderQuantity(1);
    }
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

      {orderStatus.type ? (
        <div className={`meals-order-status meals-order-status--${orderStatus.type}`}>
          {orderStatus.message}
        </div>
      ) : null}

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
                        <p className="meals-card__tokens">
                          Token value per portion: <strong>{meal.tokenValue}</strong>
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
                        {orderingMealId === meal._id ? (
                          <form
                            className="meals-card__order-form"
                            onSubmit={e => {
                              e.preventDefault();
                              handleSubmitOrder(meal);
                            }}
                          >
                            <label htmlFor={`order-qty-${meal._id}`}>Quantity</label>
                            <input
                              id={`order-qty-${meal._id}`}
                              type="number"
                              min="1"
                              max={meal.qtyAvailable}
                              value={orderQuantity}
                              onChange={e => {
                                const value = Number(e.target.value);
                                if (Number.isNaN(value)) {
                                  setOrderQuantity(1);
                                  return;
                                }
                                const maxQty = meal.qtyAvailable > 0 ? meal.qtyAvailable : 1;
                                const clamped = Math.min(Math.max(1, value), maxQty);
                                setOrderQuantity(clamped);
                              }}
                            />
                            <p className="meals-card__total">
                              Total cost: <strong>{meal.tokenValue * orderQuantity}</strong> tokens
                            </p>
                            <div className="meals-card__actions">
                              <button type="submit" className="meals-card__order" disabled={ordering}>
                                {ordering ? 'Placing…' : 'Confirm Order'}
                              </button>
                              <button type="button" className="meals-card__cancel" onClick={handleCancelOrder} disabled={ordering}>
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            type="button"
                            className="meals-card__order"
                            onClick={() => handleSelectMeal(meal)}
                            disabled={meal.qtyAvailable === 0}
                          >
                            {meal.qtyAvailable === 0 ? 'Out of Stock' : 'Order'}
                          </button>
                        )}
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
