import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../state/useAuth.js';
import { api } from '../../lib/api.js';
import EnableNotifications from '../../components/EnableNotifications.jsx';

export default function BeneficiaryDashboard() {
  const { user, updateProfile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [profile, setProfile] = useState({ name: '', address: '' });
  const [status, setStatus] = useState({ type: null, message: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setOrdersLoading(true);
    api
      .listOrders()
      .then(data => {
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setOrders([]);
      })
      .finally(() => {
        setOrdersLoading(false);
      });
  }, []);

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name ?? '', address: user.address ?? '' });
    }
  }, [user]);

  async function loadOrders() {
    setOrdersLoading(true);
    try {
      const data = await api.listOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      setOrders([]);
      throw error;
    } finally {
      setOrdersLoading(false);
    }
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
      empty: ordersLoading
        ? 'Loading pending orders…'
        : 'No pending orders. Explore meals to place a new order.',
    },
    {
      title: 'In Progress',
      orders: currentOrders,
      empty: ordersLoading
        ? 'Loading current orders…'
        : 'No current orders. Pending orders will appear here once accepted.',
      actionLabel: 'Confirm Pickup',
      onAction: markCompleted
    },
    {
      title: 'Completed',
      orders: completedOrders,
      empty: ordersLoading ? 'Loading completed orders…' : 'No completed orders yet.'
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
                  <span className="dashboard-orders__count">
                    {ordersLoading ? '…' : section.orders.length}
                  </span>
                </div>
                {section.orders.length === 0 ? (
                  <p className="dashboard-orders__empty">{section.empty}</p>
                ) : (
                  <ul className="dashboard-orders__list">
                     {section.orders.map((orderItem, index) => {
                      const meal =
                        orderItem?.mealId && typeof orderItem.mealId === 'object' ? orderItem.mealId : {};
                      const providerSource =
                        (orderItem?.memberId && typeof orderItem.memberId === 'object'
                          ? orderItem.memberId
                          : null) ||
                        (meal?.memberId && typeof meal.memberId === 'object' ? meal.memberId : null);
                      const providerName = providerSource?.name ?? 'Meal provider';
                      const providerAddress = providerSource?.address ?? '';
                      const quantity = Number.isFinite(orderItem?.quantity) ? orderItem.quantity : null;
                      const totalTokens = Number.isFinite(orderItem?.costTokens)
                        ? orderItem.costTokens
                        : meal?.tokenValue && quantity
                        ? meal.tokenValue * quantity
                        : null;
                      const statusText = statusLabels[orderItem?.status] ?? orderItem?.status ?? 'Status unknown';

                      const orderKey = orderItem?._id ?? orderItem?.id ?? meal?._id ?? `order-${index}`;

                      return (
                        <li key={orderKey} className="dashboard-orders__item">
                          <div className="dashboard-orders__item-info">
                            <div className="dashboard-orders__item-header">
                              <h4>{meal?.title ?? 'Meal'}</h4>
                              <span className="dashboard-orders__status">{statusText}</span>
                            </div>
                            {meal?.description && (
                              <p className="dashboard-orders__description">{meal.description}</p>
                            )}
                            <dl className="dashboard-orders__details">
                              <div>
                                <dt>Meal provider</dt>
                                <dd>
                                  {providerName}
                                  {providerAddress ? ` • ${providerAddress}` : ''}
                                </dd>
                              </div>
                              <div>
                                <dt>Quantity</dt>
                                <dd>{quantity ?? '—'}</dd>
                              </div>
                              <div>
                                <dt>Total tokens</dt>
                                <dd>{totalTokens ?? '—'}</dd>
                              </div>
                            </dl>
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
                      );
                    })}
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