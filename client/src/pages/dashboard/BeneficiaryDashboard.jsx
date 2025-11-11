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

  async function order(mealId){
    await api.placeOrder(mealId);
    setOrders(await api.listOrders());
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
        <ul>
          {orders.map(o => (
            <li key={o._id}>{o.mealId?.title ?? 'Meal'} — <b>{o.status}</b></li>
          ))}
        </ul>
      </div>
    </div>
  );
}