import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Terminal, Sun, Moon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../constants';
import { useTheme } from '../hooks/useTheme';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-4' : 'py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div
          className={`glass-card rounded-full px-6 py-3 flex items-center justify-between transition-all duration-300 ${
            isScrolled ? 'bg-black/40 border-white/10 shadow-lg backdrop-blur-md' : 'bg-transparent border-transparent shadow-none'
          }`}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors border border-white/10">
              <Terminal size={20} className="text-secondary" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white group-hover:text-secondary transition-colors">
              Syed<span className="text-slate-500">.dev</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors relative group ${isActive(link.href) ? 'text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {link.label}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-secondary transition-all ${isActive(link.href) ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </Link>
            ))}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={16} className="text-slate-400" /> : <Moon size={16} className="text-slate-400" />}
            </button>

            <Link
               to="/contact"
               className="px-5 py-2 rounded-full bg-white text-black font-semibold text-sm hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]"
            >
              Hire Me
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={16} className="text-slate-400" /> : <Moon size={16} className="text-slate-400" />}
            </button>
            <button
              className="text-white p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 left-4 right-4 p-6 glass-card rounded-2xl md:hidden flex flex-col gap-4 z-50"
          >
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-medium text-slate-300 hover:text-white p-2"
              >
                {link.label}
              </Link>
            ))}
            
            <div className="h-px w-full bg-white/10 my-2" />
             <Link
               to="/contact"
               onClick={() => setIsMobileMenuOpen(false)}
               className="text-center px-5 py-3 rounded-xl bg-white text-black font-bold"
            >
              Get In Touch
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;