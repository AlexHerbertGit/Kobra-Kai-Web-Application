import { useEffect, useState } from 'react';
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

  useEffect(() => { api.listMeals().then(setMeals); }, []);
  useEffect(() => { api.listOrders().then(setOrders); }, []);
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

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const currentOrders = orders.filter(o => ['current', 'inProgress', 'accepted'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'completed');
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

  return (
    <div className="grid">
      <div className="card">
        <h2>Beneficiary Dashboard</h2>
        <p>Token Balance: <b>{user?.tokenBalance}</b></p>
        <EnableNotifications />
      </div>

      <div className="card">
        <h3>Your Profile</h3>
        <p><strong>Email:</strong> {user?.email}</p>
        <form className="grid" onSubmit={submitProfile}>
          <label htmlFor="profile-name">Name</label>
          <input
            id="profile-name"
            className="input"
            value={profile.name}
            onChange={e => setProfile({ ...profile, name: e.target.value })}
            minLength={2}
            required
          />
          <label htmlFor="profile-address">Address</label>
          <textarea
            id="profile-address"
            className="input"
            value={profile.address}
            onChange={e => setProfile({ ...profile, address: e.target.value })}
            minLength={10}
            required
          />
          <button className="btn" disabled={saving}>{saving ? 'Saving…' : 'Save Profile'}</button>
        </form>
        {status.type && (
          <p style={{ color: status.type === 'error' ? 'var(--color-error, #b00020)' : 'var(--color-success, #0a7d00)', marginTop: '0.5rem' }}>
            {status.message}
          </p>
        )}
      </div>


      <div className="card">
        <h3>Available Meals</h3>
        <div className="grid">
          {meals.map(m => (
            <div key={m._id} className="card">
              <h4>{m.title}</h4>
              <p>{m.description}</p>
              <p>Qty: {m.qtyAvailable}</p>
              <button className="btn" onClick={() => order(m._id)} disabled={m.qtyAvailable<=0}>Place Order</button>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Your Orders</h3>
        {[{
          title: 'Pending',
          orders: pendingOrders,
          empty: 'No pending orders. Explore meals to place a new order.'
        }, {
          title: 'Current',
          orders: currentOrders,
          empty: 'No current orders. Pending orders will appear here once accepted.',
          actionLabel: 'Confirm Pickup',
          onAction: markCompleted
        }, {
          title: 'Completed',
          orders: completedOrders,
          empty: 'No completed orders yet.'
        }].map(section => (
          <div key={section.title} style={{ marginTop: '1rem' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>{section.title}</h4>
            {section.orders.length === 0 ? (
              <p style={{ margin: 0, color: '#666' }}>{section.empty}</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {section.orders.map(o => (
                  <li key={o._id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid #eee'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{o.mealId?.title ?? 'Meal'}</div>
                      <div style={{ fontSize: '0.85rem', color: '#555' }}>{statusLabels[o.status] ?? o.status}</div>
                    </div>
                    {section.onAction && (
                      <button className="btn" onClick={() => section.onAction(o._id)}>{section.actionLabel}</button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}};