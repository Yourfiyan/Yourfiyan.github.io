import React from 'react';
import { motion } from 'framer-motion';
import { TIMELINE_EVENTS } from '../constants';

const Timeline: React.FC = () => {
  return (
    <section className="py-24 relative z-10">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">My Journey</h2>
          <div className="h-1 w-20 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto" />
        </motion.div>

        <div className="relative max-w-3xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-secondary/50 to-transparent md:-translate-x-px" />

          {TIMELINE_EVENTS.map((event, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className={`relative flex items-start mb-12 last:mb-0 ${
                idx % 2 === 0
                  ? 'md:flex-row md:text-right'
                  : 'md:flex-row-reverse md:text-left'
              }`}
            >
              {/* Dot */}
              <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background -translate-x-1.5 mt-2 z-10 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />

              {/* Content */}
              <div className={`ml-12 md:ml-0 md:w-1/2 ${idx % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                <div className="glass-card rounded-2xl p-6 hover:border-white/20 transition-colors">
                  <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-3">
                    {event.year}
                  </span>
                  <h3 className="text-lg font-bold text-white mb-2">{event.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{event.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Timeline;
