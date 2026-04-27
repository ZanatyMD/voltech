import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Zap, Shield, LogOut, ShoppingCart, MapPin, Home, Package, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith('/admin');
  const [activeSection, setActiveSection] = useState('home');

  // Track scroll position to highlight Products link
  useEffect(() => {
    const handleScroll = () => {
      const productsSection = document.getElementById('products-section');
      if (productsSection) {
        const rect = productsSection.getBoundingClientRect();
        if (rect.top <= 200 && rect.bottom > 200) {
          setActiveSection('products');
        } else {
          setActiveSection('home');
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset active section when navigating away from home
  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('');
    } else {
      setActiveSection('home');
    }
  }, [location.pathname]);

  const handleProductsClick = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

        {!isAdmin && (
          <div className="navbar-links">
            <a href="#hero" className={`nav-link ${activeSection === 'home' && location.pathname === '/' ? 'active' : ''}`} onClick={(e) => {
              e.preventDefault();
              if (location.pathname !== '/') {
                navigate('/');
                setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}>
              <Home size={15} />
              <span>Home</span>
            </a>
            <a href="#products-section" className={`nav-link ${activeSection === 'products' ? 'active' : ''}`} onClick={handleProductsClick}>
              <Package size={15} />
              <span>Products</span>
            </a>
            <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>
              <Info size={15} />
              <span>About Us</span>
            </Link>
            <div className="nav-location">
              <MapPin size={13} />
              <span>New Damitta, Egypt</span>
            </div>
          </div>
        )}

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
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
