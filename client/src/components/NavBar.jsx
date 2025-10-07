import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';

export default function NavBar() {
  const { user, logout } = useAuth();
  return (
    <nav className="nav">
      <div className="links">
        <Link to="/" style={{ fontWeight:800 }}>Kobra Kai</Link>
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/meals">Meals</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/contact">Contact</NavLink>
        {user && <NavLink to="/dashboard">Dashboard</NavLink>}
      </div>
      <div className="links">
        {!user && <>
          <NavLink to="/login">Login</NavLink>
          <NavLink to="/register">Register</NavLink>
        </>}
        {user && <>
          <span style={{ opacity:.8 }}>Hi, {user.name} ({user.role})</span>
          <button className="btn" onClick={logout}>Logout</button>
        </>}
      </div>
    </nav>
  );
}