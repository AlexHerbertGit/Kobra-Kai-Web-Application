import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../state/useAuth.js';
export default function ProtectedRoute() {
  const { user, ready } = useAuth();
  if (!ready) return null;
  return user ? <Outlet/> : <Navigate to="/login" replace/>;
}