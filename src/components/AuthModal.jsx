import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User, Lock, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const { login, register, loading } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!phone.trim() || !password.trim()) {
      setError(t.auth_fill_fields);
      return;
    }

    if (phone.length < 10 || phone.length > 11 || !/^\d+$/.test(phone)) {
      setError(t.auth_phone_digits);
      return;
    }

    if (!isLoginView && password.length < 6) {
      setError(t.auth_password_min);
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

            <h2>{isLoginView ? t.auth_welcome : t.auth_create}</h2>
            <p>
              {isLoginView 
                ? t.auth_login_desc 
                : t.auth_register_desc}
            </p>

            {error && <div className="auth-error">{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-input-group">
                <User size={18} className="auth-input-icon" />
                <input
                  type="tel"
                  placeholder={t.auth_phone_placeholder}
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
                  placeholder={t.auth_password_placeholder}
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
                {loading ? <Loader size={18} className="spin" /> : (isLoginView ? t.auth_login_btn : t.auth_register_btn)}
              </button>
            </form>

            <div className="auth-toggle">
              {isLoginView ? t.auth_no_account : t.auth_have_account}
              <button type="button" className="auth-toggle-btn" onClick={toggleView}>
                {isLoginView ? t.auth_register_btn : t.auth_login_btn}
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
