import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import EnableNotifications from '../../components/EnableNotifications.jsx';
import { useAuth } from '../../state/AuthContext.jsx';

export default function MemberDashboard() {
  const [form, setForm] = useState({ title:'', description:'', qtyAvailable:1, dietaryTags:[] });
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

  async function createMeal(e){
    e.preventDefault();
    await api.createMeal({ ...form, qtyAvailable:Number(form.qtyAvailable), dietaryTags:(form.dietaryTags||[]) });
    setMeals(await api.listMeals());
    setForm({ title:'', description:'', qtyAvailable:1, dietaryTags:[] });
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

  async function accept(id){
    await api.acceptOrder(id);
    setOrders(await api.listOrders());
  }

  return (
    <div className="grid">
      <div className="card">
        <h2>Member Dashboard</h2>
        <EnableNotifications />
        <form onSubmit={createMeal} className="grid">
          <label>Title</label>
          <input className="input" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required/>
          <label>Description</label>
          <textarea className="input" value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/>
          <label>Qty Available</label>
          <input className="input" type="number" min="0" value={form.qtyAvailable} onChange={e=>setForm({...form, qtyAvailable:e.target.value})}/>
          <button className="btn">Create Meal</button>
        </form>
        <p style={{ marginTop: '0.5rem' }}>You currently have {meals.length} meals listed.</p>
      </div>

      <div className="card">
        <h3>Your Profile</h3>
        <p><strong>Email:</strong> {user?.email}</p>
        <form className="grid" onSubmit={submitProfile}>
          <label htmlFor="member-profile-name">Name</label>
          <input
            id="member-profile-name"
            className="input"
            value={profile.name}
            onChange={e => setProfile({ ...profile, name: e.target.value })}
            minLength={2}
            required
          />
          <label htmlFor="member-profile-address">Address</label>
          <textarea
            id="member-profile-address"
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
        <h3>Your Orders</h3>
        <ul>
          {orders.map(o => (
            <li key={o._id}>
              {o.mealId?.title ?? 'Meal'} — <b>{o.status}</b>
              {o.status === 'pending' && <button className="btn" style={{marginLeft:8}} onClick={()=>accept(o._id)}>Accept</button>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}