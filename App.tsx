import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import BackgroundBeams from './components/BackgroundBeams';
import Navbar from './components/Navbar';
import PageTransition from './components/PageTransition';
import Home from './pages/Home';

const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const ProjectsPage = React.lazy(() => import('./pages/ProjectsPage'));
const CertificatesPage = React.lazy(() => import('./pages/CertificatesPage'));
const CustomerSupportPage = React.lazy(() => import('./pages/CustomerSupportPage'));
const CalculatoReadyPage = React.lazy(() => import('./pages/CalculatoReadyPage'));
const PocketphonePage = React.lazy(() => import('./pages/PocketphonePage'));
const LabsPage = React.lazy(() => import('./pages/LabsPage'));
const BlogPage = React.lazy(() => import('./pages/BlogPage'));
const BlogPostPage = React.lazy(() => import('./pages/BlogPostPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  // Canonical framer-motion + react-router pattern: <Routes> is the direct,
  // keyed child of AnimatePresence so exit animations actually run before
  // the next page mounts (mode="wait"). A plain wrapper <div> here breaks
  // exit tracking. Suspense stays OUTSIDE so lazy-loading a page doesn't
  // interfere with the presence tree.
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/projects" element={<PageTransition><ProjectsPage /></PageTransition>} />
        <Route path="/projects/customer-support" element={<PageTransition><CustomerSupportPage /></PageTransition>} />
        <Route path="/projects/calculatoready" element={<PageTransition><CalculatoReadyPage /></PageTransition>} />
        <Route path="/projects/pocketphone" element={<PageTransition><PocketphonePage /></PageTransition>} />
        <Route path="/labs" element={<PageTransition><LabsPage /></PageTransition>} />
        <Route path="/blog" element={<PageTransition><BlogPage /></PageTransition>} />
        <Route path="/blog/:slug" element={<PageTransition><BlogPostPage /></PageTransition>} />
        <Route path="/certificates" element={<PageTransition><CertificatesPage /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
    </Suspense>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      {/* reducedMotion="user" makes every framer-motion animation respect
          the OS prefers-reduced-motion setting (transform/layout animations
          are skipped; opacity still animates). CSS keyframes are handled
          separately in index.css. */}
      <MotionConfig reducedMotion="user">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <main id="main-content" className="relative min-h-screen bg-background text-foreground selection:bg-indigo-500/30">
        <BackgroundBeams />
        
        <Navbar />
        
        <AnimatedRoutes />
      </main>
      </MotionConfig>
    </BrowserRouter>
  );
};

export default App;