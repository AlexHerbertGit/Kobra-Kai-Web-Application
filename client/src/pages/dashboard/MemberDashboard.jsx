import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import EnableNotifications from '../../components/EnableNotifications.jsx';
import { useAuth } from '../../state/AuthContext.jsx';

export default function MemberDashboard() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ title: '', description: '', qtyAvailable: 1, dietaryTags: [] });
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

  async function createMeal(e) {
    e.preventDefault();
     await api.createMeal({
      ...form,
      qtyAvailable: Number(form.qtyAvailable),
      dietaryTags: form.dietaryTags || []
    });
    setMeals(await api.listMeals());
    setForm({ title: '', description: '', qtyAvailable: 1, dietaryTags: [] });
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

  const orderSections = [
    {
      title: 'Pending',
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
    <div className="dashboard-grid">
      <section className="card dashboard-section">
        <h2>Member Dashboard</h2>
        <EnableNotifications />
        <form onSubmit={createMeal} className="grid">
          <label htmlFor="meal-title">Title</label>
          <input
            id="meal-title"
            className="input"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
          />
          <label htmlFor="meal-description">Description</label>
          <textarea
            id="meal-description"
            className="input"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <label htmlFor="meal-qty">Qty Available</label>
          <input
            id="meal-qty"
            className="input"
            type="number"
            min="0"
            value={form.qtyAvailable}
            onChange={e => setForm({ ...form, qtyAvailable: e.target.value })}
          />
          <button className="btn">Create Meal</button>
        </form>
         <p className="dashboard-subtext">You currently have {meals.length} meals listed.</p>
      </section>

       <section className="card dashboard-section">
        <h3>Your Profile</h3>
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
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
          <button className="btn" disabled={saving}>
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
        {status.type && (
          <p
            className={`dashboard-status ${
              status.type === 'error' ? 'dashboard-status--error' : 'dashboard-status--success'
            }`}
          >
            {status.message}
          </p>
        )}
      </section>


      <section className="card dashboard-section">
        <h3>Your Orders</h3>
         {orderSections.map(section => (
          <div key={section.title} className="orders-section">
            <h4 className="orders-section__title">{section.title}</h4>
            {section.orders.length === 0 ? (
              <p className="orders-section__empty">{section.empty}</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {section.orders.map(o => (
                  <li key={o._id} className="orders-list__item">
                    <div>
                      <div className="orders-list__item-title">{o.mealId?.title ?? 'Meal'}</div>
                      <div className="orders-list__item-status">{statusLabels[o.status] ?? o.status}</div>
                    </div>
                    {section.onAction && (
                      <button className="btn" onClick={() => section.onAction(o._id)}>
                        {section.actionLabel}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}