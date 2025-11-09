import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';
import { useEffect, useState } from 'react';

export default function NavBar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  // close menu on route change
  useEffect(() => { setOpen(false); }, [loc.pathname]);

  return (
    <nav className="nav">
      <div className="nav__inner container">
        {/* Brand */}
        <Link to="/" className="nav__brand">Kobra Kai</Link>

        {/* Hamburger (mobile only) */}
        <button
          className={`hamburger ${open ? 'is-open' : ''}`}
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="nav-menu"
          onClick={() => setOpen(o => !o)}
        >
          <span />
          <span />
          <span />
        </button>

        {/* Menu */}
        <div id="nav-menu" className={`nav__menu ${open ? 'open' : ''}`}>
              <div className="nav__links">
              <NavLink to="/" end>Home</NavLink>
              <NavLink to="/meals">Meals</NavLink>
              <NavLink to="/about">About</NavLink>
              <NavLink to="/contact">Contact</NavLink>
              {user && <NavLink to="/dashboard">Dashboard</NavLink>}
            </div>
      
              <div className="nav__auth">
              {!user ? (
                <>
                  <NavLink to="/login" className="btn">Login</NavLink>
                  <NavLink to="/register" className="btn">Register</NavLink>
                </>
              ) : (
                <>
                  <span className="nav__hello">Hi, {user.name} ({user.role})</span>
                  <button className="btn" onClick={logout}>Logout</button>
                </>
              )}
            </div>
        </div>
      </div>
    </nav>
  );
}