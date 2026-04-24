import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Sun, Moon, Zap, Shield, LogOut, ShoppingCart } from 'lucide-react';
import './Navbar.css';

function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <nav className="navbar" id="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand" id="navbar-brand">
          <div className="brand-icon">
            <Zap size={24} />
          </div>
          <div className="brand-text">
            <span className="brand-name">
              <span className="brand-vol">VOL</span>
              <span className="brand-tech">TECH</span>
            </span>
            <span className="brand-tagline">Electronics Store</span>
          </div>
        </Link>

        <div className="navbar-actions">
          {!isAdmin && (
            <button className="btn btn-ghost btn-sm cart-btn" onClick={() => setIsCartOpen(true)}>
              <div className="cart-icon-wrapper">
                <ShoppingCart size={20} />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </div>
            </button>
          )}

          {user && isAdmin && (
            <button className="btn btn-ghost btn-sm" onClick={logout} id="logout-btn">
              <LogOut size={16} />
              <span className="nav-btn-text">Logout</span>
            </button>
          )}
          
          {!user && (
            <Link to="/admin/login" className="btn btn-ghost btn-sm" id="admin-link">
              <Shield size={16} />
              <span className="nav-btn-text">Admin</span>
            </Link>
          )}

          {user && !isAdmin && (
            <Link to="/admin/dashboard" className="btn btn-ghost btn-sm" id="dashboard-link">
              <Shield size={16} />
              <span className="nav-btn-text">Dashboard</span>
            </Link>
          )}

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            id="theme-toggle"
            aria-label="Toggle theme"
          >
            <div className={`toggle-track ${theme}`}>
              <div className="toggle-thumb">
                {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
              </div>
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
