import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Zap, Shield, LogOut, ShoppingCart, MapPin, Home, Package, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Navbar.css';

const navItemVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  }),
};

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

  const navLinks = [
    { id: 'home', icon: <Home size={15} />, label: 'Home' },
    { id: 'products', icon: <Package size={15} />, label: 'Products' },
    { id: 'about', icon: <Info size={15} />, label: 'About Us' },
  ];

  return (
    <motion.nav
      className="navbar"
      id="navbar"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand" id="navbar-brand">
          <motion.div
            className="brand-icon"
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <Zap size={24} />
          </motion.div>
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
            <motion.a
              href="#hero"
              className={`nav-link ${activeSection === 'home' && location.pathname === '/' ? 'active' : ''}`}
              custom={0}
              variants={navItemVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.05 }}
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
            </motion.a>
            <motion.a
              href="#products-section"
              className={`nav-link ${activeSection === 'products' ? 'active' : ''}`}
              custom={1}
              variants={navItemVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.05 }}
              onClick={handleProductsClick}
            >
              <Package size={15} />
              <span>Products</span>
            </motion.a>
            <motion.div
              custom={2}
              variants={navItemVariants}
              initial="hidden"
              animate="visible"
            >
              <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>
                <Info size={15} />
                <span>About Us</span>
              </Link>
            </motion.div>
            <motion.div
              className="nav-location"
              custom={3}
              variants={navItemVariants}
              initial="hidden"
              animate="visible"
            >
              <MapPin size={13} />
              <span>New Damitta, Egypt</span>
            </motion.div>
          </div>
        )}

        <div className="navbar-actions">
          {!isAdmin && (
            <motion.button
              className="btn btn-ghost btn-sm cart-btn"
              onClick={() => setIsCartOpen(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <div className="cart-icon-wrapper">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <motion.span
                    className="cart-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    key={cartCount}
                  >
                    {cartCount}
                  </motion.span>
                )}
              </div>
            </motion.button>
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
    </motion.nav>
  );
}

export default Navbar;
