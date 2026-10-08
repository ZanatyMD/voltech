import { motion } from 'framer-motion';
import { Truck, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './DeliveryInfo.css';

function DeliveryInfo() {
  const { t } = useLanguage();
  return (
    <div className="delivery-page">
      <div className="container">
        <motion.div
          className="delivery-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="header-icon-wrapper">
            <Truck size={48} className="header-icon" />
          </div>
          <h1 className="delivery-title">{t.delivery_title}</h1>
          <p className="delivery-subtitle">{t.delivery_subtitle}</p>
        </motion.div>

        <motion.div
          className="delivery-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="delivery-card main-info">
            <h2>{t.delivery_fees_title}</h2>
            <p className="highlight-text">
              {t.delivery_fees_p1}
            </p>
            <p>
              {t.delivery_fees_p2}
            </p>
          </div>

          <div className="delivery-features">
            <div className="feature-item">
              <div className="feature-icon"><MapPin size={24} /></div>
              <h3>{t.delivery_nationwide}</h3>
              <p>{t.delivery_nationwide_desc}</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Clock size={24} /></div>
              <h3>{t.delivery_prompt}</h3>
              <p>{t.delivery_prompt_desc}</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><ShieldCheck size={24} /></div>
              <h3>{t.delivery_safe}</h3>
              <p>{t.delivery_safe_desc}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default DeliveryInfo;
