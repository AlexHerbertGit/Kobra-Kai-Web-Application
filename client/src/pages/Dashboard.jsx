import { useEffect } from 'react';
import { useAuth } from '../state/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!user) return;
    const role = typeof user.role === 'string' ? user.role.toLowerCase() : user.role;
    if (role === 'beneficiary') {
      nav('/dashboard/beneficiary', { replace: true });
    } else if (role === 'member' || role === 'admin') {
      nav('/dashboard/member', { replace: true });
    } else {
      nav('/', { replace: true });
    }
  }, [user, nav]);

  return null;
}