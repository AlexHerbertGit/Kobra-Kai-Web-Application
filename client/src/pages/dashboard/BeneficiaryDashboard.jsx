import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../state/AuthContext.jsx';
import { api } from '../../lib/api.js';
import EnableNotifications from '../../components/EnableNotifications.jsx';

export default function BeneficiaryDashboard() {
  const { user, updateProfile } = useAuth();
  const [meals, setMeals] = useState([]);
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState({ name: '', address: '' });
  const [status, setStatus] = useState({ type: null, message: '' });
  const [saving, setSaving] = useState(false);

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

  async function loadOrders() {
    const data = await api.listOrders();
    setOrders(data);
  }

  async function order(mealId) {
    await api.placeOrder(mealId);
    await loadOrders();
  }

  async function markCompleted(orderId) {
    await api.completeOrder(orderId);
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
    current: 'Current',
    completed: 'Completed',
    cancelled: 'Cancelled',
    inProgress: 'In Progress',
    accepted: 'Current'
  };

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

  const orderSections = [
    {
      title: 'Pending',
      orders: pendingOrders,
      empty: 'No pending orders. Explore meals to place a new order.'
    },
    {
      title: 'In Progress',
      orders: currentOrders,
      empty: 'No current orders. Pending orders will appear here once accepted.',
      actionLabel: 'Confirm Pickup',
      onAction: markCompleted
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
          <h1 className="dashboard-hero__title">Account Dashboard</h1>
          <p className="dashboard-hero__text">
            Update your account details, review your order history, and explore the latest meals available to you.
          </p>
        </div>
      </header>

      <div className="dashboard-columns">
        <section className="dashboard-panel">
          <div className="dashboard-panel__header">
            <h2>Account Details</h2>
            <p className="dashboard-panel__subtitle">
              Update your details by completing the form fields and clicking the Update Account Details button.
            </p>
          </div>

      <div className="dashboard-token">
            <h3 className="dashboard-token__label">Token Balance</h3>
            <p className="dashboard-token__value">{user?.tokenBalance ?? 0}</p>
            <EnableNotifications />
          </div>

          <p className="dashboard-meta">
            <strong>Email:</strong> {user?.email}
          </p>
      
       <form className="dashboard-form" onSubmit={submitProfile}>
            <label className="dashboard-form__label" htmlFor="profile-name">
              Name
            </label>
            <input
              id="profile-name"
              className="input"
              value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
              minLength={2}
              required
            />

            <label className="dashboard-form__label" htmlFor="profile-address">
              Address
            </label>
            <textarea
              id="profile-address"
              className="input"
              value={profile.address}
              onChange={e => setProfile({ ...profile, address: e.target.value })}
              minLength={10}
              required
            />

            <button className="btn btn--primary" disabled={saving}>
              {saving ? 'Saving…' : 'Update Account Details'}
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
            <h2>Order History</h2>
            <p className="dashboard-panel__subtitle">
              Track each stage of your meal requests and confirm pickups when you’ve collected your meals.
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
    </div>
  );
};