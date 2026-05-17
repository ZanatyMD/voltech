import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import VoltechChat from '../components/VoltechChat';
import { useEffect } from 'react';

function Home() {
  useEffect(() => {
    document.title = 'Voltech Electronics Store | Power Your World';
  }, []);

  return (
    <>
      <Hero />
      <ProductGrid />
      <VoltechChat />
    </>
  );
}

export default Home;
