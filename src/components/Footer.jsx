import { Zap, Camera, MessageCircle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="footer-icon">
              <Zap size={20} />
            </div>
            <span className="footer-name">VOLTECH</span>
          </div>
          <p className="footer-description">
            Your ultimate destination for electronic components, Arduino boards, and PCBs. Built for students, by tech enthusiasts.
          </p>
          <div className="social-links">
            <a href="mailto:voltechstore26@gmail.com" target="_blank" rel="noreferrer" aria-label="Mail"><Mail size={20} /></a>
            <a href="https://wa.me/201503476600" target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={20} /></a>
            <a href="https://www.instagram.com/voltech.da/" target="_blank" rel="noreferrer" aria-label="Instagram"><Camera size={20} /></a>
          </div>
        </div>

        <div className="footer-links" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
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
              <li><a href="https://wa.me/201503476600" target="_blank" rel="noreferrer">WhatsApp Chat</a></li>
              <li><a href="https://www.instagram.com/voltech.da/" target="_blank" rel="noreferrer">Instagram Page</a></li>
              <li><a href="mailto:voltechstore26@gmail.com" target="_blank" rel="noreferrer">Email Support</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Voltech Electronics Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
