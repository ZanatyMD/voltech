import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import ProductCard from './ProductCard';
import { Filter, Search, Loader, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const gridRef = useRef(null);

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
              PRODUCTS <Package size={32} color="var(--volt-green)" />
            </h2>
            <p className="section-subtitle">Discover our cutting-edge selection</p>
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
              placeholder="Search products..."
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

          <div className="category-filters">
            <motion.button
              className={`filter-btn ${activeCategory === 'All' ? 'active' : ''}`}
              onClick={() => setActiveCategory('All')}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              All
            </motion.button>
            {stats.categories.map((category, i) => (
              <motion.button
                key={category}
                className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <>
            <div className="loading-banner">
              <Loader size={20} className="loading-spinner" />
              <span>Loading products...</span>
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
            <h3>No products found</h3>
            <p>We couldn't find any products matching your current filters.</p>
            <button 
              className="btn btn-secondary mt-4" 
              onClick={() => { 
                setActiveCategory('All'); 
                searchParams.delete('search');
                setSearchParams(searchParams, { replace: true });
              }}
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default ProductGrid;
