import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import BackgroundBeams from './components/BackgroundBeams';
import Navbar from './components/Navbar';
import PageTransition from './components/PageTransition';
import Home from './pages/Home';
import ContactPage from './pages/ContactPage';
import ProjectsPage from './pages/ProjectsPage';
import CertificatesPage from './pages/CertificatesPage';
import CustomerSupportPage from './pages/CustomerSupportPage';
import CalculatoReadyPage from './pages/CalculatoReadyPage';
import PocketphonePage from './pages/PocketphonePage';
import LabsPage from './pages/LabsPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import NotFoundPage from './pages/NotFoundPage';

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <div key={location.pathname}>
      <Routes location={location}>
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
      </div>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <main className="relative min-h-screen bg-background text-foreground selection:bg-indigo-500/30">
        <BackgroundBeams />
        
        <Navbar />
        
        <AnimatedRoutes />
      </main>
    </BrowserRouter>
  );
};

export default App;