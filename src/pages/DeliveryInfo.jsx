import { motion } from 'framer-motion';
import { Truck, MapPin, Clock, ShieldCheck } from 'lucide-react';
import './DeliveryInfo.css';

function DeliveryInfo() {
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
          <h1 className="delivery-title">Delivery Information</h1>
          <p className="delivery-subtitle">Everything you need to know about getting your Voltech products.</p>
        </motion.div>

        <motion.div
          className="delivery-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="delivery-card main-info">
            <h2>Delivery Fees & Time</h2>
            <p className="highlight-text">
              Delivery fees and timelines may vary depending on the courier service and your specific location. 
              The delivery payment is determined by the distance the delivery personnel needs to travel to reach you.
            </p>
            <p>
              We partner with reliable couriers to ensure your electronics reach you safely and as quickly as possible. Once you place an order, you will be contacted to confirm the exact delivery fee before dispatch.
            </p>
          </div>

          <div className="delivery-features">
            <div className="feature-item">
              <div className="feature-icon"><MapPin size={24} /></div>
              <h3>Nationwide Coverage</h3>
              <p>We deliver across the country to bring technology to your doorstep.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Clock size={24} /></div>
              <h3>Prompt Dispatch</h3>
              <p>Orders are processed and handed over to couriers swiftly.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><ShieldCheck size={24} /></div>
              <h3>Safe Handling</h3>
              <p>Fragile electronic components are packaged with extreme care.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default DeliveryInfo;
