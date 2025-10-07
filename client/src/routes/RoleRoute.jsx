import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';
export default function RoleRoute({ roles }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace/>;
  return roles.includes(user.role) ? <Outlet/> : <Navigate to="/dashboard" replace/>;
}