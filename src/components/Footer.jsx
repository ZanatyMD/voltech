import { Zap, Camera, MessageCircle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Footer.css';

const footerContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const footerItemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const socialVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: 0.3 + i * 0.1,
      type: 'spring',
      stiffness: 300,
      damping: 15,
    },
  }),
};

function Footer() {
  const socialLinks = [
    { href: 'mailto:voltechstore26@gmail.com', icon: <Mail size={20} />, label: 'Mail' },
    { href: 'https://wa.me/201031643665', icon: <MessageCircle size={20} />, label: 'WhatsApp' },
    { href: 'https://www.instagram.com/voltech.da/', icon: <Camera size={20} />, label: 'Instagram' },
  ];

  return (
    <footer className="footer">
      <motion.div
        className="container footer-content"
        variants={footerContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div className="footer-brand" variants={footerItemVariants}>
          <div className="footer-logo">
            <motion.div
              className="footer-icon"
              whileHover={{ rotate: 15, scale: 1.15 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <Zap size={20} />
            </motion.div>
            <span className="footer-name">VOLTECH</span>
          </div>
          <p className="footer-description">
            Your ultimate destination for electronic components, Arduino boards, and PCBs. Built for students, by tech enthusiasts.
          </p>
          <div className="social-links">
            {socialLinks.map((social, i) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                custom={i}
                variants={socialVariants}
                whileHover={{ scale: 1.25, y: -3 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="footer-links"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}
          variants={footerItemVariants}
        >
          <div className="footer-column">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Contact & Social</h4>
            <ul>
              <li><a href="https://wa.me/201031643665" target="_blank" rel="noreferrer">WhatsApp Chat</a></li>
              <li><a href="https://www.instagram.com/voltech.da/" target="_blank" rel="noreferrer">Instagram Page</a></li>
              <li><a href="mailto:voltechstore26@gmail.com" target="_blank" rel="noreferrer">Email Support</a></li>
            </ul>
          </div>
        </motion.div>
      </motion.div>
      
      <motion.div
        className="footer-bottom"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Voltech Electronics Store. All rights reserved.</p>
        </div>
      </motion.div>
    </footer>
  );
}

export default Footer;
