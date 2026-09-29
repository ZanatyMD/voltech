import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Zap, Shield, LogOut, ShoppingCart, Home, LogIn, ListOrdered, Package, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SmartSearch from './SmartSearch';
import AuthModal from './AuthModal';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith('/admin');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

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
    <>
      <div className="navbar-wrapper">
        <motion.nav
          className="navbar"
          initial={{ y: -100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, type: 'spring', stiffness: 200, damping: 20 }}
        >
          <Link to="/" className="navbar-brand">
            <span className="nav-brand-logo">
              <span className="nav-vol">VOL</span><span className="nav-tech">TECH</span>
              <Zap size={18} className="nav-bolt" />
            </span>
          </Link>

          {!isAdmin && (
            <div className="navbar-links">
              <a
                href="#hero"
                className={`nav-link ${activeSection === 'home' && location.pathname === '/' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (location.pathname !== '/') {
                    navigate('/');
                    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
              >
                <Home size={15} />
                <span>Home</span>
              </a>
              <a
                href="#products-section"
                className={`nav-link ${activeSection === 'products' ? 'active' : ''}`}
                onClick={handleProductsClick}
              >
                <Package size={15} />
                <span>Products</span>
              </a>
              <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>
                <Info size={15} />
                <span>About Us</span>
              </Link>
            </div>
          )}

          {!isAdmin && location.pathname !== '/my-orders' && <SmartSearch />}

          <div className="navbar-actions">
            {!isAdmin && (
              <motion.button
                className="cart-btn-pill"
                onClick={() => setIsCartOpen(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <motion.span
                    className="cart-badge-pill"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    key={cartCount}
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.button>
            )}

            {!user && !isAdmin && (
              <button className="nav-btn-pill" onClick={() => setIsAuthModalOpen(true)}>
                <LogIn size={16} />
                <span className="nav-btn-text">Login</span>
              </button>
            )}

            {user && user.role === 'user' && !isAdmin && (
              <>
                <Link to="/my-orders" className="nav-btn-pill">
                  <ListOrdered size={16} />
                  <span className="nav-btn-text">Orders</span>
                </Link>
                <button className="nav-btn-pill" onClick={() => {
                  logout();
                  navigate('/');
                }}>
                  <LogOut size={16} />
                  <span className="nav-btn-text">Exit</span>
                </button>
              </>
            )}

            {user && user.role === 'admin' && (
              <>
                {/* Admin console link removed to keep it hidden. Admin should navigate directly to /admin/login */}
                <button className="nav-btn-pill" onClick={logout}>
                  <LogOut size={16} />
                  <span className="nav-btn-text">Exit</span>
                </button>
              </>
            )}

            {!user && isAdmin && (
              <Link to="/" className="nav-btn-pill">
                <Home size={16} />
                <span className="nav-btn-text">Store</span>
              </Link>
            )}
          </div>
        </motion.nav>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}

export default Navbar;
