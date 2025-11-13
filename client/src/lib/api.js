// API Connection Configuration

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';


async function request(path, { method='GET', body, headers } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(headers||{}) },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    let msg = 'Request failed';
    try {
      const d = await res.json();
      msg = d.message || JSON.stringify(d);
    } catch {
      // ignore JSON parsing errors
    }
    throw new Error(msg);
  }
  return res.status === 204 ? null : res.json();
}

// Sets Route connections for the Express API
export const api = {
  // auth
  me: () => request('/users/me'),
  login: (email, password) => request('/auth/login', { method:'POST', body:{ email, password } }),
  register: (payload) => request('/auth/register', { method:'POST', body: payload }),
  logout: () => request('/auth/logout', { method:'POST' }),
  updateMe: (payload) => request('/users/me', { method: 'PATCH', body: payload }),

  // meals
  listMeals: () => request('/meals'),
  createMeal: (payload) => request('/meals', { method:'POST', body: payload }),
  updateMeal: (id, payload) => request(`/meals/${id}`, { method:'PUT', body: payload }),
  deleteMeal: (id) => request(`/meals/${id}`, { method: 'DELETE' }),

  // orders
  listOrders: () => request('/orders'),
  placeOrder: (mealId, quantity = 1) => request('/orders', { method:'POST', body:{ mealId, quantity } }),
  moveOrderToCurrent: (id) => request(`/orders/${id}/current`, { method:'POST' }),
  completeOrder: (id) => request(`/orders/${id}/completed`, { method:'POST' }),

  // notifications
  savePushSubscription: (payload) => request('/push/subscribe', { method: 'POST', body: payload }),
  deletePushSubscription: (payload) => request('/push/subscribe', { method: 'DELETE', body: payload }),
  notifyPushSubscribers: (payload) => request('/push/notify', { method: 'POST', body: payload })
};