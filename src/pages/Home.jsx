import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import { useEffect } from 'react';

function Home() {
  useEffect(() => {
    document.title = 'Voltech Electronics Store | Power Your World';
  }, []);

  return (
    <>
      <Hero />
      <ProductGrid />
    </>
  );
}

export default Home;
