import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Terminal, Cpu, Globe } from 'lucide-react';
import { ABOUT_CONTENT } from '../constants';

const AboutBento: React.FC = () => {
  return (
    <section id="about" className="py-24 relative z-10">
      <div className="container mx-auto px-6">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
        >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">About Me</h2>
            <div className="h-1 w-20 bg-gradient-to-r from-primary to-secondary rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">
          {/* Bio Card - Large */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="col-span-1 md:col-span-2 row-span-2 glass-card rounded-3xl p-8 md:p-10 flex flex-col justify-center relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                <Terminal size={120} />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="p-2 bg-primary/20 rounded-lg text-primary"><Code2 size={24} /></span>
                The Developer
            </h3>
            <p className="text-slate-300 text-lg leading-relaxed mb-6">
                {ABOUT_CONTENT.bio1}
            </p>
            <p className="text-slate-400 leading-relaxed">
                {ABOUT_CONTENT.bio2}
            </p>
          </motion.div>

          {/* Stats/Highlight Card 1 */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-3xl p-8 flex flex-col justify-center items-start border-t-4 border-t-secondary"
          >
             <h4 className="text-slate-400 font-medium mb-2">Experience</h4>
             <p className="text-5xl font-bold text-white mb-2">3+</p>
             <p className="text-slate-500 text-sm uppercase tracking-wide">Years Coding</p>
          </motion.div>

          {/* Location/Info Card */}
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ delay: 0.2 }}
             className="glass-card rounded-3xl p-8 flex flex-col justify-center items-start border-t-4 border-t-primary"
          >
             <h4 className="text-slate-400 font-medium mb-2">Location</h4>
             <p className="text-2xl font-bold text-white mb-2">Assam, India</p>
             <p className="text-slate-500 text-sm">Titabar</p>
          </motion.div>

          {/* Skills Wide Card */}
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ delay: 0.3 }}
             className="col-span-1 md:col-span-3 glass-card rounded-3xl p-8 md:p-10"
          >
             <div className="flex flex-col md:flex-row md:items-center gap-8">
                <div className="shrink-0">
                    <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                         <span className="p-2 bg-secondary/20 rounded-lg text-secondary"><Cpu size={24} /></span>
                         Tech Stack
                    </h3>
                    <p className="text-slate-400 text-sm">My arsenal of tools</p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    {ABOUT_CONTENT.skills.map((skill, idx) => (
                        <span 
                            key={idx}
                            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all cursor-default"
                        >
                            {skill}
                        </span>
                    ))}
                </div>
             </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutBento;