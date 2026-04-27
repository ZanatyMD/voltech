import { Zap, ChevronDown } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useState, useEffect, useRef } from 'react';
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

  // Pro Canvas animation — Tech Data Streams & Glowing Orbs
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create high-tech particles
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 40 + 10,
        speed: Math.random() * 3 + 1,
        radius: Math.random() * 2 + 0.5,
        color: Math.random() > 0.5 ? '#F5C842' : '#7EC843',
        opacity: Math.random() * 0.6 + 0.1,
        type: Math.random() > 0.7 ? 'orb' : 'stream'
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // Move particles upwards (warp speed effect)
        p.y -= p.speed;
        if (p.y < -50) {
          p.y = canvas.height + 50;
          p.x = Math.random() * canvas.width;
        }

        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.type === 'stream') {
          // Draw falling data streams
          ctx.fillRect(p.x, p.y, 2, p.length);
        } else {
          // Draw glowing orbs
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.shadowBlur = 15;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        }
      });

      ctx.globalAlpha = 1;
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

  const scrollFactor = Math.min(scrollY / 600, 1);

  return (
    <section className="hero" id="hero">
      {/* 3D Cyber Grid Background */}
      <div className="cyber-grid-wrapper">
        <div className="cyber-grid"></div>
      </div>

      {/* Canvas particle network */}
      <canvas 
        ref={canvasRef} 
        className="hero-canvas"
        style={{ transform: `translateY(${scrollY * 0.2}px)` }}
      ></canvas>

      {/* Scan line effect */}
      <div className="scan-lines"></div>

      {/* Glow orbs */}
      <div className="hero-glow glow-1" style={{ 
        transform: `translate(-50%, calc(-50% + ${scrollY * 0.5}px))` 
      }}></div>
      <div className="hero-glow glow-2" style={{ 
        transform: `translate(-50%, calc(-50% + ${scrollY * 0.3}px))` 
      }}></div>

      {/* Floating particles (CSS) */}
      <div className="particle particle-1"></div>
      <div className="particle particle-2"></div>
      <div className="particle particle-3"></div>
      <div className="particle particle-4"></div>
      <div className="particle particle-5"></div>
      <div className="particle particle-6"></div>
      <div className="particle particle-7"></div>
      <div className="particle particle-8"></div>

      {/* Circuit lines */}
      <div className="circuit-line circuit-1"></div>
      <div className="circuit-line circuit-2"></div>
      <div className="circuit-line circuit-3"></div>
      <div className="circuit-line circuit-4"></div>

      <div className="container hero-content" style={{ 
        transform: `translateY(${scrollY * 0.2}px)`, 
        opacity: 1 - scrollFactor 
      }}>
        <div className="hero-badge animate-fade-in-up">
          <Zap size={14} />
          <span>Premium Components</span>
        </div>

        <h1 className="hero-title animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <span className="hero-title-accent">VOLTECH</span>
          <span className="hero-title-line">Built For Students</span>
        </h1>

        <p className="hero-description animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Tired of the same options ? <br />
          Yeah .... Us too .
        </p>

        <div className="hero-actions animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <button className="btn btn-primary btn-lg glow-btn" onClick={scrollToProducts} id="shop-now-btn">
            <Zap size={18} />
            Shop Now
          </button>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-number">{products.length}+</span>
              <span className="stat-label">Products</span>
            </div>
          </div>
        </div>
      </div>

      <button className="scroll-indicator" onClick={scrollToProducts} aria-label="Scroll to products"
        style={{ opacity: 1 - scrollFactor * 2 }}>
        <ChevronDown size={24} />
      </button>

      {/* Smooth fade at bottom */}
      <div className="hero-fade-bottom"></div>
    </section>
  );
}

export default Hero;
