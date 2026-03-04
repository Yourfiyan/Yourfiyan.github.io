import React from 'react';
import { motion } from 'framer-motion';
import { CERTIFICATES } from '../constants';
import CertificateCard from './CertificateCard';

const Certificates: React.FC = () => {
  return (
    <section id="certificates" className="relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
        {CERTIFICATES.map((cert, idx) => (
          <CertificateCard key={cert.id} certificate={cert} index={idx} />
        ))}
      </div>
    </section>
  );
};

export default Certificates;