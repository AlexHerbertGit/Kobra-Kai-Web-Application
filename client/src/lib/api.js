// API Connection Configuration

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';


async function request(path, { method='GET', body, headers } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(headers||{}) },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    let msg = 'Request failed';
    try { const d = await res.json(); msg = d.message || JSON.stringify(d); } catch {}
    throw new Error(msg);
  }
  return res.status === 204 ? null : res.json();
}

// Sets Route connections for the Express API
export const api = {
  // auth
  me: () => request('/auth/me'),
  login: (email, password) => request('/auth/login', { method:'POST', body:{ email, password } }),
  register: (payload) => request('/auth/register', { method:'POST', body: payload }),
  logout: () => request('/auth/logout', { method:'POST' }),

  // meals
  listMeals: () => request('/meals'),
  createMeal: (payload) => request('/meals', { method:'POST', body: payload }),
  updateMeal: (id, payload) => request(`/meals/${id}`, { method:'PUT', body: payload }),

  // orders
  listOrders: () => request('/orders'),
  placeOrder: (mealId) => request('/orders', { method:'POST', body:{ mealId } }),
  acceptOrder: (id) => request(`/orders/${id}/accept`, { method:'POST' })
};