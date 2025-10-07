import { useEffect, useState } from 'react';
import { useAuth } from '../../state/AuthContext.jsx';
import { api } from '../../lib/api.js';

export default function BeneficiaryDashboard() {
  const { user } = useAuth();
  const [meals, setMeals] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => { api.listMeals().then(setMeals); }, []);
  useEffect(() => { api.listOrders().then(setOrders); }, []);

  async function order(mealId){
    await api.placeOrder(mealId);
    setOrders(await api.listOrders());
  }

  return (
    <div className="grid">
      <div className="card">
        <h2>Beneficiary Dashboard</h2>
        <p>Token Balance: <b>{user?.tokenBalance}</b></p>
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