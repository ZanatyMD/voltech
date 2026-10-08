import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import ProductCard from './ProductCard';
import { Filter, Search, Loader, Package, SlidersHorizontal, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { smartSearch } from '../utils/search';
import './ProductGrid.css';

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-image"></div>
      <div className="skeleton-body">
        <div className="skeleton skeleton-badge" style={{ width: '60px', height: '18px' }}></div>
        <div className="skeleton skeleton-title" style={{ width: '80%', height: '20px' }}></div>
        <div className="skeleton skeleton-text" style={{ width: '50%', height: '14px' }}></div>
        <div className="skeleton-row">
          <div className="skeleton skeleton-price" style={{ width: '90px', height: '24px' }}></div>
          <div className="skeleton skeleton-btn" style={{ width: '36px', height: '36px', borderRadius: '50%' }}></div>
        </div>
      </div>
    </div>
  );
}

function ProductGrid() {
  const { products, stats, loading } = useProducts();
  const { t, isArabic } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('All');

  const getCategoryName = (cat) => {
    if (!cat || cat === 'All') return t.grid_category_all || 'All';
    return (t.categories && t.categories[cat]) || cat;
  };
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const gridRef = useRef(null);
  const categoryMenuRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  // Close dropdown menu on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target)) {
        setIsCategoryMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const matchesSearch = smartSearch(product.name, searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="product-section" id="products-section">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
              {t.grid_title} <Package size={32} color="var(--volt-green)" />
            </h2>
            <p className="section-subtitle">{t.grid_subtitle}</p>
          </div>
        </motion.div>

        <motion.div
          className="product-controls"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder={t.grid_search_placeholder}
              className="form-input search-input"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  searchParams.set('search', val);
                } else {
                  searchParams.delete('search');
                }
                setSearchParams(searchParams, { replace: true });
              }}
            />
          </div>

          <div className="category-dropdown-wrapper" ref={categoryMenuRef}>
            <motion.button
              type="button"
              className={`category-toggle-btn ${activeCategory !== 'All' ? 'active' : ''}`}
              onClick={() => setIsCategoryMenuOpen(prev => !prev)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <SlidersHorizontal size={18} className="category-icon-dash" />
              <span className="category-btn-text">
                {t.grid_category_label} <strong>{getCategoryName(activeCategory)}</strong>
              </span>
              <ChevronDown 
                size={16} 
                className={`category-arrow ${isCategoryMenuOpen ? 'open' : ''}`} 
              />
            </motion.button>

            <AnimatePresence>
              {isCategoryMenuOpen && (
                <motion.div 
                  className="category-dropdown-menu"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="category-menu-header">
                    <span>{t.grid_filter_by_category}</span>
                    {activeCategory !== 'All' && (
                      <button 
                        type="button"
                        className="reset-category-btn"
                        onClick={() => {
                          setActiveCategory('All');
                          setIsCategoryMenuOpen(false);
                        }}
                      >
                        {t.grid_reset_category}
                      </button>
                    )}
                  </div>
                  <div className="category-menu-grid">
                    <button
                      type="button"
                      className={`category-menu-item ${activeCategory === 'All' ? 'active' : ''}`}
                      onClick={() => {
                        setActiveCategory('All');
                        setIsCategoryMenuOpen(false);
                      }}
                    >
                      <span>{t.grid_all_categories}</span>
                      {activeCategory === 'All' && <Check size={16} className="check-icon" />}
                    </button>

                    {(stats?.categories || []).map((category) => (
                      <button
                        key={category}
                        type="button"
                        className={`category-menu-item ${activeCategory === category ? 'active' : ''}`}
                        onClick={() => {
                          setActiveCategory(category);
                          setIsCategoryMenuOpen(false);
                        }}
                      >
                        <span>{getCategoryName(category)}</span>
                        {activeCategory === category && <Check size={16} className="check-icon" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {loading ? (
          <>
            <div className="loading-banner">
              <Loader size={20} className="loading-spinner" />
              <span>{t.grid_loading}</span>
            </div>
            <div className="product-grid">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </>
        ) : filteredProducts.length > 0 ? (
          <motion.div 
            className="product-grid" 
            ref={gridRef}
            layout
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            className="no-products"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Filter size={48} className="no-products-icon" />
            <h3>{t.grid_no_products}</h3>
            <p>{t.grid_no_matching}</p>
            
            <div className="grid-no-results-whatsapp">
              <span>{t.search_no_results} </span>
              <a 
                href={`https://wa.me/201503476600?text=${encodeURIComponent(`مرحباً فولتك! أبحث عن القطعة التالية ولم أجدها في المتجر: ${searchQuery || 'قطع إلكترونية'}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="grid-whatsapp-order-link"
              >
                {t.search_whatsapp_order}
              </a>
            </div>

            <button 
              className="btn btn-secondary mt-4" 
              onClick={() => { 
                setActiveCategory('All'); 
                searchParams.delete('search');
                setSearchParams(searchParams, { replace: true });
              }}
            >
              {t.grid_reset_filters}
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default ProductGrid;
