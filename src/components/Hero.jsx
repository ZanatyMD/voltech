import { Zap, Cpu, HardDrive } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './Hero.css';

function Hero() {
  const { products } = useProducts();
  const [scrollY, setScrollY] = useState(0);
  const canvasRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simplified matrix/cyber canvas effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 50 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 2 + 0.5,
    }));

    const animate = () => {
      ctx.fillStyle = 'rgba(3, 4, 7, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#7EC843';
      particles.forEach(p => {
        p.y += p.speed;
        if (p.y > canvas.height) {
          p.y = 0;
          p.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const scrollToProducts = () => {
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" id="hero">
      <div className="hero-glow-core"></div>
      
      <canvas 
        ref={canvasRef} 
        className="hero-canvas"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      ></canvas>

      <div className="container hero-content" style={{ transform: `translateY(${scrollY * 0.15}px)` }}>
        <div className="hero-text-side">
          <motion.div 
            className="hero-badge-cyber"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Zap size={16} /> SYSTEM ONLINE
          </motion.div>

          <motion.h1 
            className="hero-title-massive"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-stroke">NEXT-GEN</span>
            <span className="hero-brand-logo">
              <span className="hero-vol">VOL</span><span className="hero-tech">TECH</span>
              <Zap size={48} className="hero-bolt" />
            </span>
            <span className="hero-store-subtitle">Electronics Store</span>
          </motion.h1>

          <motion.p 
            className="hero-desc-cyber"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Tired from the same options ...... Yeah us too .
          </motion.p>

          <motion.div 
            className="hero-actions-asym"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <button className="btn-cyber" onClick={scrollToProducts}>
              Initialize Shop
            </button>
            
            <div className="hero-stats-cyber">
              <div className="stat-cyber">
                <span className="num">{products.length}+</span>
                <span className="lab">Modules</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="hero-graphic-side">
          <div className="cyber-circle c1"></div>
          <div className="cyber-circle c2"></div>
          <div className="cyber-circle c3">
            <img src="/neon-earth.png" alt="Neon Earth" className="electric-earth-img" />
          </div>
          
          <motion.div 
            className="floating-icon icon-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.8 }}
          >
            <Cpu size={40} color="var(--volt-yellow)" />
          </motion.div>

          <motion.div 
            className="floating-icon icon-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 1 }}
          >
            <HardDrive size={40} color="var(--volt-green)" />
          </motion.div>
        </div>
      </div>
      
      <div className="hero-fade-bottom"></div>
    </section>
  );
}

export default Hero;
