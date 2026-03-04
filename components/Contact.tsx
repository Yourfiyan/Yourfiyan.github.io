import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Github, ArrowRight } from 'lucide-react';
import { CONTACT_INFO } from '../constants';

const Contact: React.FC = () => {
  return (
    <footer id="contact" className="relative pt-24 pb-12 overflow-hidden z-10">
        
        {/* Decorative Top Line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        Let's build something <br />
                        <span className="text-gradient">amazing together.</span>
                    </h2>
                    <p className="text-slate-400 text-lg mb-8 max-w-md">
                        Have a project in mind or just want to chat about tech? I'm always open to new ideas and opportunities.
                    </p>
                    <a 
                        href={`mailto:${CONTACT_INFO.email}`}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-slate-200 transition-colors"
                    >
                        <Mail size={20} />
                        Send Me an Email
                    </a>
                </motion.div>

                {/* Contact Cards */}
                <motion.div
                     initial={{ opacity: 0, x: 30 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     viewport={{ once: true }}
                     className="flex flex-col justify-center gap-6"
                >
                    <div className="glass-card p-6 rounded-2xl flex items-center gap-4 group hover:bg-white/5 transition-colors">
                        <div className="p-3 rounded-full bg-indigo-500/20 text-indigo-400 group-hover:text-indigo-300 group-hover:scale-110 transition-all">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Location</p>
                            <p className="text-white font-medium text-lg">{CONTACT_INFO.location}</p>
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-2xl flex items-center gap-4 group hover:bg-white/5 transition-colors">
                        <div className="p-3 rounded-full bg-purple-500/20 text-purple-400 group-hover:text-purple-300 group-hover:scale-110 transition-all">
                            <Mail size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Email</p>
                            <a href={`mailto:${CONTACT_INFO.email}`} className="text-white font-medium text-lg hover:underline decoration-secondary underline-offset-4">
                                {CONTACT_INFO.email}
                            </a>
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-2xl flex items-center gap-4 group hover:bg-white/5 transition-colors">
                        <div className="p-3 rounded-full bg-slate-500/20 text-slate-400 group-hover:text-slate-300 group-hover:scale-110 transition-all">
                            <Github size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">GitHub</p>
                            <a href={CONTACT_INFO.github} target="_blank" rel="noopener noreferrer" className="text-white font-medium text-lg hover:underline decoration-secondary underline-offset-4">
                                github.com/Yourfiyan
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Footer */}
            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-slate-600 text-sm">
                    © {new Date().getFullYear()} Syed Sufiyan Hamza. All rights reserved.
                </p>
                <div className="flex items-center gap-6">
                    <p className="text-slate-600 text-sm">Designed & Built by Syed</p>
                </div>
            </div>
        </div>
    </footer>
  );
};

export default Contact;