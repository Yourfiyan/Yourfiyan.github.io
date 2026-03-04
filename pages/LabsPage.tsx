import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Terminal } from 'lucide-react';
import { LABS } from '../constants';

const LabsPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-32 pb-20 container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
        >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Labs & <span className="text-gradient">Experiments</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                A playground for my smaller projects, web experiments, and live demos. 
                Everything here is hosted live on this domain.
            </p>
        </motion.div>

        {/* Labs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LABS.map((lab, idx) => (
                <motion.div
                    key={lab.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group"
                >
                    <a 
                        href={lab.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block h-full glass-card p-6 rounded-2xl border border-white/10 hover:border-primary/50 transition-all hover:-translate-y-1"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-white/5 rounded-xl text-secondary group-hover:text-primary transition-colors">
                                <lab.icon size={24} />
                            </div>
                            <ExternalLink size={18} className="text-slate-500 group-hover:text-white transition-colors" />
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-2">{lab.title}</h3>
                        <p className="text-slate-400 text-sm mb-4 leading-relaxed">{lab.desc}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-auto">
                            {lab.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 rounded bg-black/30 border border-white/5 text-xs text-slate-300 font-mono">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </a>
                </motion.div>
            ))}

            {/* Placeholder for future */}
            <motion.div
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: 0.4 }}
                 className="glass-card p-6 rounded-2xl border border-white/5 border-dashed flex flex-col items-center justify-center text-center opacity-50 hover:opacity-100 transition-opacity"
            >
                <div className="p-3 bg-white/5 rounded-xl text-slate-600 mb-4">
                    <Terminal size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-500 mb-1">More Coming Soon</h3>
                <p className="text-slate-600 text-sm">I'm always cooking something new.</p>
            </motion.div>
        </div>
    </div>
  );
};

export default LabsPage;