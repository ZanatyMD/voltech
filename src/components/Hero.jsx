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

  // Canvas particle system
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

    // Create particles — use Electric Blue + Cyber Lime
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 0.5,
        color: Math.random() > 0.5 ? '#F5C842' : '#7EC843',
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x;
          const dy = p.y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = '#F5C842';
            ctx.globalAlpha = (1 - dist / 120) * 0.12;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
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
      {/* Background Video */}
      <video
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        style={{
          transform: `translateY(${scrollY * 0.4}px) scale(${1 + scrollY * 0.0005})`,
          opacity: 0.3 - scrollFactor * 0.15
        }}
      >
        <source src="https://assets.mixkit.co/videos/preview/mixkit-circuit-board-animation-with-glowing-lines-32810-large.mp4" type="video/mp4" />
      </video>

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
