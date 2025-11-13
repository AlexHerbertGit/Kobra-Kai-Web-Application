import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../state/useAuth.js';
export default function RoleRoute({ roles }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace/>;
  const allowedRoles = roles.map((role) => role.toLowerCase());
  const userRole = typeof user.role === 'string' ? user.role.toLowerCase() : user.role;
  return allowedRoles.includes(userRole) ? <Outlet/> : <Navigate to="/dashboard" replace/>;
}