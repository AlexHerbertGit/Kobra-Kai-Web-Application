import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';

export default function MemberDashboard() {
  const [form, setForm] = useState({ title:'', description:'', qtyAvailable:1, dietaryTags:[] });
  const [meals, setMeals] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => { api.listMeals().then(setMeals); }, []);
  useEffect(() => { api.listOrders().then(setOrders); }, []);

  async function createMeal(e){
    e.preventDefault();
    await api.createMeal({ ...form, qtyAvailable:Number(form.qtyAvailable), dietaryTags:(form.dietaryTags||[]) });
    setMeals(await api.listMeals());
    setForm({ title:'', description:'', qtyAvailable:1, dietaryTags:[] });
  }

  async function accept(id){
    await api.acceptOrder(id);
    setOrders(await api.listOrders());
  }

  return (
    <div className="grid">
      <div className="card">
        <h2>Member Dashboard</h2>
        <form onSubmit={createMeal} className="grid">
          <label>Title</label>
          <input className="input" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required/>
          <label>Description</label>
          <textarea className="input" value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/>
          <label>Qty Available</label>
          <input className="input" type="number" min="0" value={form.qtyAvailable} onChange={e=>setForm({...form, qtyAvailable:e.target.value})}/>
          <button className="btn">Create Meal</button>
        </form>
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