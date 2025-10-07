import { useEffect } from 'react';
import { useAuth } from '../state/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!user) return;
    if (user.role === 'beneficiary') nav('/dashboard/beneficiary', { replace:true });
    else nav('/dashboard/member', { replace:true });
  }, [user, nav]);

  return null;
}