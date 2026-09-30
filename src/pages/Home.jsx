import Hero from '../components/Hero';
import { useEffect } from 'react';

function Home() {
  useEffect(() => {
    document.title = 'Voltech Electronics Store | Power Your World';
  }, []);

  return (
    <>
      <Hero />
    </>
  );
}

export default Home;
