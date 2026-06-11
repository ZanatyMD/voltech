import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User, Lock, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const { login, register, loading } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!phone.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (phone.length < 10 || phone.length > 11 || !/^\d+$/.test(phone)) {
      setError('Phone number must be 10 or 11 digits');
      return;
    }

    if (!isLoginView && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const cleanPhone = phone.trim();

    const result = isLoginView 
      ? await login(cleanPhone, password)
      : await register(cleanPhone, password);

    if (result.success) {
      setPhone('');
      setPassword('');
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        onClose();
      }
    } else {
      setError(result.error);
    }
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError('');
    setPhone('');
    setPassword('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="auth-modal-overlay" onClick={onClose}>
          <div className="auth-modal" onClick={e => e.stopPropagation()}>
            <button className="auth-modal-close" onClick={onClose}>
              <X size={20} />
            </button>

            <h2>{isLoginView ? 'Welcome Back' : 'Create Account'}</h2>
            <p>
              {isLoginView 
                ? 'Login to view your orders and fast checkout.' 
                : 'Join Voltech for a seamless shopping experience.'}
            </p>

            {error && <div className="auth-error">{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-input-group">
                <User size={18} className="auth-input-icon" />
                <input
                  type="tel"
                  placeholder="Phone Number (10-11 digits)"
                  className="auth-input"
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    if (val.length <= 11) setPhone(val);
                  }}
                />
              </div>

              <div className="auth-input-group">
                <Lock size={18} className="auth-input-icon" />
                <input
                  type="password"
                  placeholder="Password"
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary auth-btn"
                disabled={loading}
              >
                {loading ? <Loader size={18} className="spin" /> : (isLoginView ? 'Login' : 'Register')}
              </button>
            </form>

            <div className="auth-toggle">
              {isLoginView ? "Don't have an account? " : "Already have an account? "}
              <button type="button" className="auth-toggle-btn" onClick={toggleView}>
                {isLoginView ? 'Register' : 'Login'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
