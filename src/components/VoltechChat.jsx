import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, MessageCircle, Truck, ArrowUp, Paperclip, Plus, Cpu, Zap } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './VoltechChat.css';

function useAutoResizeTextarea({ minHeight, maxHeight }) {
  const textareaRef = useRef(null);

  const adjustHeight = useCallback(
    (reset) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }
      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight || Infinity)
      );
      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) textarea.style.height = `${minHeight}px`;
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

const chipVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.4 + i * 0.08,
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  }),
};

const quickActions = [
  { id: 'products', icon: <span>📦</span>, label: 'Products' },
  { id: 'arduino', icon: <Cpu size={15} />, label: 'Arduino & MCUs' },
  { id: 'delivery', icon: <Truck size={15} />, label: 'Delivery Info' },
  { id: 'contact', icon: <MessageCircle size={15} />, label: 'Contact Us' },
  { id: 'arrivals', icon: <Zap size={15} />, label: 'New Arrivals' },
];

function VoltechChat() {
  const { t } = useLanguage();
  const [value, setValue] = useState('');
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        // Open WhatsApp with the message
        const phoneNumber = '201503476600';
        const encodedMsg = encodeURIComponent(value.trim());
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMsg}`, '_blank');
        setValue('');
        adjustHeight(true);
      }
    }
  };

  const handleChipClick = (label) => {
    if (label === 'Products' || label === 'Browse Products') {
      const el = document.getElementById('products-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (label === 'Arduino & MCUs') {
      const el = document.getElementById('products-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      searchParams.set('search', 'arduino');
      setSearchParams(searchParams, { replace: true });
    } else if (label === 'Delivery Info') {
      navigate('/delivery-info');
    } else if (label === 'New Arrivals') {
      const el = document.getElementById('new-arrivals-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (label === 'Contact Us') {
      const phoneNumber = '201503476600';
      const message = encodeURIComponent(`Hi Voltech! I'm interested in: Contacting you.`);
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    }
  };

  const quickActionLabels = {
    products: t.chat_products,
    arduino: t.chat_arduino,
    delivery: t.chat_delivery,
    contact: t.chat_contact,
    arrivals: t.chat_arrivals,
  };

  return (
    <div className="voltech-chat">
      <motion.h2
        className="voltech-chat-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {t.chat_title}
      </motion.h2>

      <motion.p
        className="voltech-chat-subtitle"
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        {t.chat_subtitle}
      </motion.p>

      <motion.div
        className="chat-input-container"
        initial={{ opacity: 0, y: 25, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        <div>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder={t.chat_placeholder}
            className="chat-textarea"
            style={{ overflow: 'hidden' }}
          />
        </div>

        <div className="chat-actions-bar" style={{ justifyContent: 'flex-end' }}>
          <div className="chat-actions-right">
            <button
              type="button"
              className={`chat-send-btn ${value.trim() ? 'active' : ''}`}
              onClick={() => {
                if (value.trim()) {
                  const phoneNumber = '201503476600';
                  const encodedMsg = encodeURIComponent(value.trim());
                  window.open(`https://wa.me/${phoneNumber}?text=${encodedMsg}`, '_blank');
                  setValue('');
                  adjustHeight(true);
                }
              }}
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="chat-quick-actions">
        {quickActions.map((action, i) => (
          <motion.button
            key={action.id || action.label}
            className="chat-chip"
            custom={i}
            variants={chipVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleChipClick(action.label)}
          >
            {action.icon}
            <span>{quickActionLabels[action.id] || action.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default VoltechChat;
