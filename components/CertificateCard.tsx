import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Calendar, Building, Award, FileText, Shield } from 'lucide-react';
import { Certificate } from '../types';

// Accent color based on issuer
function getIssuerAccent(issuer: string): { gradient: string; bg: string; text: string; border: string } {
  const lower = issuer.toLowerCase();
  if (lower.includes('anthropic')) return { gradient: 'from-amber-400 to-orange-500', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' };
  if (lower.includes('walmart')) return { gradient: 'from-blue-400 to-blue-600', bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' };
  if (lower.includes('skyscanner')) return { gradient: 'from-cyan-400 to-teal-500', bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' };
  if (lower.includes('lloyds')) return { gradient: 'from-emerald-400 to-green-500', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' };
  if (lower.includes('msme')) return { gradient: 'from-indigo-400 to-teal-500', bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30' };
  return { gradient: 'from-purple-400 to-pink-500', bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' };
}

interface CertificateCardProps {
  certificate: Certificate;
  index: number;
}

const CertificateCard: React.FC<CertificateCardProps> = ({ certificate, index }) => {
  const accent = getIssuerAccent(certificate.issuer);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="group relative h-full"
    >
      {/* Glow effect on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${accent.gradient} rounded-3xl blur-2xl opacity-0 group-hover:opacity-15 transition-opacity duration-700`} />
      
      <div className={`relative h-full glass-card rounded-3xl overflow-hidden flex flex-col transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl border border-white/[0.06] group-hover:${accent.border}`}>
        
        {/* Top accent bar */}
        <div className={`h-1 w-full bg-gradient-to-r ${accent.gradient}`} />

        <div className="p-8 flex flex-col flex-grow">
          {/* Header: Icon + Badge row */}
          <div className="flex justify-between items-start mb-6">
            <div className={`p-3 rounded-2xl ${accent.bg} ${accent.text} transition-transform duration-300 group-hover:scale-110`}>
              <Award size={24} />
            </div>
            {certificate.certId ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-500 font-mono tracking-wider">
                <Shield size={10} />
                {certificate.certId.slice(0, 10)}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-500 font-mono tracking-wider">
                <Shield size={10} />
                Verified
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-white mb-5 leading-snug group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all duration-300">
            {certificate.title}
          </h3>
          
          {/* Details */}
          <div className="space-y-3 mb-8 flex-grow">
            <div className="flex items-center gap-3 text-sm">
              <div className={`w-6 h-6 rounded-lg ${accent.bg} flex items-center justify-center shrink-0`}>
                <Building size={13} className={accent.text} />
              </div>
              <span className="text-slate-300 font-medium">{certificate.issuer}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                <Calendar size={13} className="text-slate-500" />
              </div>
              <span className="text-slate-400">{certificate.date}</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-auto">
            <a 
              href={certificate.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-xl ${accent.bg} hover:bg-white/10 text-sm font-semibold ${accent.text} hover:text-white transition-all duration-300 w-full justify-center border ${accent.border} hover:border-white/20`}
            >
              <FileText size={16} />
              View Certificate
              <ExternalLink size={13} className="opacity-60 ml-auto" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CertificateCard;