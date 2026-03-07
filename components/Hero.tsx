import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HERO_CONTENT } from '../constants';

const Hero: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % HERO_CONTENT.rotatingText.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Pill Badges */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-secondary"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              Available for new projects
            </motion.div>

            <motion.a
              href="/certificates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-300 hover:bg-indigo-500/15 hover:border-indigo-400/30 transition-colors"
            >
              <ShieldCheck size={14} />
              Govt-Registered Micro-Enterprise (MSME)
            </motion.a>
          </div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6"
          >
            {HERO_CONTENT.headline}{' '}
            <span className="text-gradient block mt-2">{HERO_CONTENT.name}</span>
          </motion.h1>

          {/* Rotating Text */}
          <div className="h-12 md:h-16 overflow-hidden mb-6 flex justify-center items-center">
             <AnimatePresence mode='wait'>
                <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="text-2xl md:text-4xl font-light text-slate-400"
                >
                    {HERO_CONTENT.rotatingText[index]}
                </motion.span>
             </AnimatePresence>
          </div>

          {/* Intro Paragraph */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            {HERO_CONTENT.intro}
          </motion.p>

          {/* Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
                to="/projects"
                className="group relative px-8 py-4 bg-white text-black font-semibold rounded-full overflow-hidden w-full sm:w-auto hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300"
            >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-shimmer" />
                <span className="relative flex items-center justify-center gap-2">
                    View My Work <ArrowRight size={18} />
                </span>
            </Link>
            
            <Link 
                to="/contact"
                className="px-8 py-4 glass-card text-white font-semibold rounded-full hover:bg-white/10 transition-colors w-full sm:w-auto flex items-center justify-center gap-2"
            >
                Get In Touch
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;