import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import './NewArrivalsCarousel.css';

function NewArrivalsCarousel() {
  const { products, loading } = useProducts();
  const navigate = useNavigate();
  const [newProducts, setNewProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!loading && products.length > 0) {
      const latest = [...products].reverse().slice(0, 5);
      setNewProducts(latest);
    }
  }, [products, loading]);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % newProducts.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + newProducts.length) % newProducts.length);
  };

  if (loading || newProducts.length === 0) return null;

  const getVisibleProducts = () => {
    if (!newProducts || newProducts.length === 0) return [];
    const count = Math.min(2, newProducts.length);
    const visible = [];
    for (let i = 0; i < count; i++) {
      const p = newProducts[(currentIndex + i) % newProducts.length];
      if (p) visible.push(p);
    }
    return visible;
  };

  return (
    <section className="new-arrivals-section" id="new-arrivals-section">
      <div className="new-arrivals-header">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="header-title"
        >
          <Zap size={32} className="header-icon" />
          <h2>New Arrivals</h2>
        </motion.div>
      </div>

      <div className="carousel-wrapper">
        <button onClick={prev} className="control-btn control-btn-left" aria-label="Previous">
          <ChevronLeft size={80} />
        </button>
        <div className="carousel-container-fixed">
          <AnimatePresence mode="popLayout">
            {getVisibleProducts().map((product, index) => (
              <motion.div
                key={`${product.id}-${(currentIndex + index) % newProducts.length}`}
                className="carousel-item-wrapper"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
              >
                <ProductCard product={product} index={index} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <button onClick={next} className="control-btn control-btn-right" aria-label="Next">
          <ChevronRight size={80} />
        </button>
      </div>
    </section>
  );
}

export default NewArrivalsCarousel;
