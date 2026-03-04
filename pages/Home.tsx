import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import AboutBento from '../components/AboutBento';
import Timeline from '../components/Timeline';
import GitHubSection from '../components/GitHubSection';
import Contact from '../components/Contact';

const Home: React.FC = () => {
  // Ensure we scroll to top when mounting Home
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col w-full">
      <Hero />
      <AboutBento />
      <Timeline />
      <GitHubSection />
      <Contact />
    </div>
  );
};

export default Home;