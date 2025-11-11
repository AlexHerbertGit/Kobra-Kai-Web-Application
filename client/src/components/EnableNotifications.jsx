import { useState } from 'react';
import { subscribeToPush } from '../lib/push.js';
import { api } from '../lib/api.js';

export default function EnableNotifications({ className }) {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const handleEnable = async () => {
    setError(null);
    setStatus('loading');
    try {
      const subscription = await subscribeToPush();
      if (!subscription) {
        setStatus('idle');
        return;
      }
      await api.savePushSubscription(subscription);
      setStatus('success');
    } catch (err) {
      setError(err?.message ?? 'Unable to enable notifications.');
      setStatus('idle');
    }
  };

  const disabled = status === 'loading' || status === 'success';
  const label = status === 'success' ? 'Notifications enabled' : 'Enable notifications';

  return (
    <div className={className}>
      <button className="btn" type="button" onClick={handleEnable} disabled={disabled}>
        {status === 'loading' ? 'Enabling…' : label}
      </button>
      {error && <p style={{ color: 'var(--danger, #b91c1c)', marginTop: '0.5rem' }}>{error}</p>}
    </div>
  );
}