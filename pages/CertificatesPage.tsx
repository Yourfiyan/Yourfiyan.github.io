import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle, BookOpen } from 'lucide-react';
import Certificates from '../components/Certificates';
import { CERTIFICATES } from '../constants';

const CertificatesPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Compute unique issuers
  const issuers = new Set(CERTIFICATES.map((c) => c.issuer)).size;

  return (
    <div className="pt-32 pb-20 container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
        >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Certificate <span className="text-gradient">Vault</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                A growing collection of verified certifications earned through self-learning, workshops, and competitions.
            </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap justify-center gap-6 mb-16"
        >
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl glass-card border border-white/5">
                <Award size={18} className="text-secondary" />
                <span className="text-white font-bold text-lg">{CERTIFICATES.length}</span>
                <span className="text-slate-500 text-sm">Certificates</span>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl glass-card border border-white/5">
                <BookOpen size={18} className="text-primary" />
                <span className="text-white font-bold text-lg">{issuers}</span>
                <span className="text-slate-500 text-sm">Issuers</span>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl glass-card border border-white/5">
                <CheckCircle size={18} className="text-green-400" />
                <span className="text-white font-bold text-lg">{CERTIFICATES.length}</span>
                <span className="text-slate-500 text-sm">Verified</span>
            </div>
        </motion.div>

        {/* Content */}
        <Certificates />
    </div>
  );
};

export default CertificatesPage;