import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

export default function Meals() {
  const [meals, setMeals] = useState([]);
  useEffect(() => { api.listMeals().then(setMeals); }, []);
  return (
    <div className="grid">
      <h2>Meals</h2>
      <div className="grid">
        {meals.map(m => (
          <div key={m._id} className="card">
            <h3>{m.title}</h3>
            <p>{m.description}</p>
            <p>Qty: {m.qtyAvailable}</p>
            {m.dietaryTags?.length ? <p>Tags: {m.dietaryTags.join(', ')}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}