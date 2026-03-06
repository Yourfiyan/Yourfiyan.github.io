import React, { useEffect, Suspense } from 'react';
import Hero from '../components/Hero';

const AboutBento = React.lazy(() => import('../components/AboutBento'));
const Projects = React.lazy(() => import('../components/Projects'));
const Timeline = React.lazy(() => import('../components/Timeline'));
const GitHubSection = React.lazy(() => import('../components/GitHubSection'));
const Contact = React.lazy(() => import('../components/Contact'));

const Home: React.FC = () => {
  // Ensure we scroll to top when mounting Home
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col w-full">
      <Hero />
      <Suspense fallback={<div className="min-h-[50vh]" />}>
        <AboutBento />
        <Projects />
        <Timeline />
        <GitHubSection />
        <Contact />
      </Suspense>
    </div>
  );
};

export default Home;