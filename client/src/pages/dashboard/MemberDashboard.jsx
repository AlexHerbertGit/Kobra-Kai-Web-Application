import { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api.js';
import EnableNotifications from '../../components/EnableNotifications.jsx';
import { useAuth } from '../../state/AuthContext.jsx';

const DIETARY_TAG_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Halal',
  'Kosher'
];

export default function MemberDashboard() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ title: '', description: '', qtyAvailable: 1, dietaryTags: [], tokenValue: 1 });
  const [meals, setMeals] = useState([]);
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState({ name: '', address: '' });
  const [status, setStatus] = useState({ type: null, message: '' });
  const [saving, setSaving] = useState(false);
  const [editingMealId, setEditingMealId] = useState(null);

  useEffect(() => {
    api.listMeals().then(setMeals);
  }, []);

  useEffect(() => {
    api.listOrders().then(setOrders);
  }, []);

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name ?? '', address: user.address ?? '' });
    }
  }, [user]);

  const memberId = user?.id ?? null;

  const memberMeals = useMemo(() => {
    if (!memberId) return [];
    return meals.filter(meal => meal.memberId === memberId);
  }, [meals, memberId]);

  function resetMealForm() {
    setForm({ title: '', description: '', qtyAvailable: 1, dietaryTags: [], tokenValue: 1 });
    setEditingMealId(null);
  }

  async function createMeal(e) {
    e.preventDefault();
    await api.createMeal({
      ...form,
      qtyAvailable: Number(form.qtyAvailable),
      tokenValue: Number(form.tokenValue),
      dietaryTags: form.dietaryTags || []
    });
    setMeals(await api.listMeals());
    resetMealForm();
  }

  async function handleUpdateMeal(e) {
    e.preventDefault();
    if (!editingMealId) return;
    await api.updateMeal(editingMealId, {
      ...form,
      qtyAvailable: Number(form.qtyAvailable),
      tokenValue: Number(form.tokenValue),
      dietaryTags: form.dietaryTags || []
    });
    setMeals(await api.listMeals());
    resetMealForm();
  }

  async function handleDeleteMeal(id) {
    await api.deleteMeal(id);
    setMeals(await api.listMeals());
    if (editingMealId === id) {
      resetMealForm();
    }
  }

  function handleEditMeal(meal) {
    setEditingMealId(meal._id);
    setForm({
      title: meal.title ?? '',
      description: meal.description ?? '',
      qtyAvailable: meal.qtyAvailable ?? 1,
      dietaryTags: meal.dietaryTags ?? [],
      tokenValue: meal.tokenValue ?? 1
    });
  }

  async function loadOrders() {
    const data = await api.listOrders();
    setOrders(data);
  }


  async function submitProfile(e) {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: null, message: '' });
    try {
      await updateProfile(profile);
      setStatus({ type: 'success', message: 'Profile updated successfully.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  }

  async function accept(id) {
    await api.moveOrderToCurrent(id);
    await loadOrders();
  }

  async function complete(id) {
    await api.completeOrder(id);
    await loadOrders();
  }

  const pendingOrders = useMemo(() => orders.filter(o => o.status === 'pending'), [orders]);
  const currentOrders = useMemo(
    () => orders.filter(o => ['current', 'inProgress', 'accepted'].includes(o.status)),
    [orders]
  );
  const completedOrders = useMemo(() => orders.filter(o => o.status === 'completed'), [orders]);

  const statusLabels = {
    pending: 'Pending',
    current: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    inProgress: 'In Progress',
    accepted: 'Current'
  };

  const orderSections = [
    {
      title: 'Pending Approval',
      orders: pendingOrders,
      empty: 'No pending orders waiting for approval.',
      actionLabel: 'Accept Order',
      onAction: accept
    },
    {
      title: 'Current',
      orders: currentOrders,
      empty: 'No meals are currently being prepared.',
      actionLabel: 'Mark Completed',
      onAction: complete
    },
    {
      title: 'Completed',
      orders: completedOrders,
      empty: 'No completed orders yet.'
    }
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-hero">
        <div className="dashboard-hero__content">
          <h1 className="dashboard-hero__title">Member Dashboard</h1>
          <p className="dashboard-hero__text">
            Coordinate meal donations, keep your profile up to date, and manage orders from beneficiaries in one place.
          </p>
        </div>
      </header>

      <div className="dashboard-columns">
        <section className="dashboard-panel">
          <div className="dashboard-panel__header">
            <h2>Account Details</h2>
            <p className="dashboard-panel__subtitle">
              Let beneficiaries know who their meals are coming from. Update your details and contact information here.
            </p>
          </div>

          <EnableNotifications />

          <p className="dashboard-meta">
            <strong>Email:</strong> {user?.email}
          </p>

        <form className="dashboard-form" onSubmit={submitProfile}>
            <label className="dashboard-form__label" htmlFor="member-profile-name">
              Name
            </label>
            <input
              id="member-profile-name"
              className="input"
              value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
              minLength={2}
              required
            />

            <label className="dashboard-form__label" htmlFor="member-profile-address">
              Address
            </label>
            <textarea
              id="member-profile-address"
              className="input"
              value={profile.address}
              onChange={e => setProfile({ ...profile, address: e.target.value })}
              minLength={10}
              required
            />

            <button className="btn" disabled={saving}>
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </form>

          {status.type && (
            <p
              className={`dashboard-alert ${
                status.type === 'error' ? 'dashboard-alert--error' : 'dashboard-alert--success'
              }`}
            >
              {status.message}
            </p>
          )}
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel__header">
            <h2>Order Management</h2>
            <p className="dashboard-panel__subtitle">
              Monitor beneficiary requests, accept orders to begin preparing meals, and mark them complete when fulfilled.
            </p>
          </div>
      
        <div className="dashboard-orders">
            {orderSections.map(section => (
              <div key={section.title} className="dashboard-orders__group">
                <div className="dashboard-orders__group-header">
                  <h3>{section.title}</h3>
                  <span className="dashboard-orders__count">{section.orders.length}</span>
                </div>
                {section.orders.length === 0 ? (
                  <p className="dashboard-orders__empty">{section.empty}</p>
                ) : (
                  <ul className="dashboard-orders__list">
                    {section.orders.map(orderItem => (
                      <li key={orderItem._id} className="dashboard-orders__item">
                        <div className="dashboard-orders__item-info">
                          <h4>{orderItem.mealId?.title ?? 'Meal'}</h4>
                          <p>{statusLabels[orderItem.status] ?? orderItem.status}</p>
                        </div>
                        {section.onAction && (
                          <button
                            type="button"
                            className="btn"
                            onClick={() => section.onAction(orderItem._id)}
                          >
                            {section.actionLabel}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
      
      <div className="dashboard-columns">
      <section className="dashboard-panel">
        <div className="dashboard-panel__header">
          <h2>Create a Meal Listing</h2>
          <p className="dashboard-panel__subtitle">
            Share what you’re serving so beneficiaries can order meals. Include enticing descriptions and available portions.
          </p>
        </div>

        <form onSubmit={editingMealId ? handleUpdateMeal : createMeal} className="dashboard-form">
          <div className="dashboard-form__group">
            <label className="dashboard-form__label" htmlFor="meal-title">
              Title
            </label>
            <input
              id="meal-title"
              className="input"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="dashboard-form__group">
            <label className="dashboard-form__label" htmlFor="meal-description">
              Description
            </label>
            <textarea
              id="meal-description"
              className="input"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="dashboard-form__group dashboard-form__group--compact">
            <label className="dashboard-form__label" htmlFor="meal-qty">
              Portions Available
            </label>
            <input
              id="meal-qty"
              className="input"
              type="number"
              min="0"
              value={form.qtyAvailable}
              onChange={e => setForm({ ...form, qtyAvailable: e.target.value })}
            />
          </div>

          <div className="dashboard-form__group dashboard-form__group--compact">
            <label className="dashboard-form__label" htmlFor="meal-token-value">
              Token Value Per Portion
            </label>
            <input
              id="meal-token-value"
              className="input"
              type="number"
              min="0"
              value={form.tokenValue}
              required
              onChange={e => setForm({ ...form, tokenValue: e.target.value })}
            />
          </div>


          <fieldset className="dashboard-tag-selector">
            <legend>Dietary Tags</legend>
            <div className="dashboard-tag-selector__options">
              {DIETARY_TAG_OPTIONS.map(tag => {
                const checked = form.dietaryTags.includes(tag);
                return (
                  <label key={tag} className="dashboard-tag-selector__option">
                    <input
                      type="checkbox"
                      value={tag}
                      checked={checked}
                      onChange={() =>
                        setForm(current => {
                          const tags = current.dietaryTags.includes(tag)
                            ? current.dietaryTags.filter(t => t !== tag)
                            : [...current.dietaryTags, tag];
                          return { ...current, dietaryTags: tags };
                        })
                      }
                    />
                    <span>{tag}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {!editingMealId && (
            <button className="btn" type="submit">
              Create Meal
            </button>
          )}
          {editingMealId && (
            <>
              <button className="btn" type="submit">
                Update Meal
              </button>
              <button type="button" className="btn" onClick={resetMealForm}>
                Cancel
              </button>
            </>
          )}
        </form>
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-panel__header">
          <h2>Your Meal Listings</h2>
          <p className="dashboard-panel__subtitle">
            Manage the meals you have shared with the community. Edit details or remove listings that are no longer available.
          </p>

          <p className="dashboard-meta dashboard-meta--accent">
            You currently have {memberMeals.length} meal{memberMeals.length === 1 ? '' : 's'} listed.
          </p>
        </div>
        {memberMeals.length === 0 ? (
          <p className="dashboard-orders__empty">You have not listed any meals yet.</p>
        ) : (
          <ul className="dashboard-orders__list">
            {memberMeals.map(meal => (
              <li key={meal._id} className="dashboard-orders__item">
                <div className="dashboard-orders__item-info">
                  <h4>{meal.title}</h4>
                  <p>{meal.description}</p>
                  <p>
                    <strong>Portions:</strong> {meal.qtyAvailable}
                  </p>
                  <p>
                    <strong>Token Value:</strong> {meal.tokenValue}
                  </p>
                  {meal.dietaryTags?.length > 0 && (
                    <p>
                      <strong>Tags:</strong> {meal.dietaryTags.join(', ')}
                    </p>
                  )}
                </div>
                <button type="button" className="btn" onClick={() => handleEditMeal(meal)}>
                  Edit
                </button>
                <button type="button" className="btn" onClick={() => handleDeleteMeal(meal._id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
    </div>
  );
};
