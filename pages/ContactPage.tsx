import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Github, Send, MessageSquare, Clock, Globe } from 'lucide-react';
import { CONTACT_INFO } from '../constants';

const ContactPage: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch("https://formspree.io/f/xrbkkgbj", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formState.name,
          email: formState.email,
          subject: formState.subject,
          message: formState.message,
          _subject: formState.subject || "New contact from portfolio"
        })
      });

      if (response.ok) {
        setSubmitted(true);
        setFormState({ name: '', email: '', subject: '', message: '' });
      } else {
        alert("Oops! There was a problem sending your message. Please try again or email me directly.");
      }
    } catch (error) {
      alert("Oops! There was a problem sending your message. Please connect with me on LinkedIn or email me directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  return (
    <div className="pt-32 pb-20 container mx-auto px-6 relative z-10">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Get in <span className="text-gradient">Touch</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Whether you have a question about my projects, a potential collaboration, or just want to say hi, I'll try my best to get back to you!
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        
        {/* Contact Form */}
        <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 rounded-3xl"
        >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <MessageSquare className="text-secondary" /> Send a Message
            </h2>
            
            {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4">
                        <Send size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                    <p className="text-slate-400">Thanks for reaching out. I'll get back to you soon.</p>
                    <button 
                        onClick={() => setSubmitted(false)}
                        className="mt-6 text-sm text-secondary hover:underline"
                    >
                        Send another message
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-slate-400">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                value={formState.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all placeholder:text-slate-600"
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-slate-400">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                value={formState.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all placeholder:text-slate-600"
                                placeholder="john@example.com"
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-medium text-slate-400">Subject</label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            required
                            value={formState.subject}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all placeholder:text-slate-600"
                            placeholder="Project Inquiry"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium text-slate-400">Message</label>
                        <textarea
                            id="message"
                            name="message"
                            required
                            rows={5}
                            value={formState.message}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all placeholder:text-slate-600 resize-none"
                            placeholder="Tell me about your project..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-4 rounded-xl font-bold text-black transition-all flex items-center justify-center gap-2 ${
                            isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-white hover:bg-slate-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                        }`}
                    >
                        {isSubmitting ? 'Sending...' : (
                            <>Send Message <Send size={18} /></>
                        )}
                    </button>
                </form>
            )}
        </motion.div>

        {/* Info Side */}
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="grid gap-4"
            >
                <div className="glass-card p-6 rounded-2xl flex items-center gap-4 hover:bg-white/5 transition-colors">
                    <div className="p-4 rounded-full bg-indigo-500/20 text-indigo-400">
                        <Mail size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 mb-1">Email Me At</p>
                        <a href={`mailto:${CONTACT_INFO.email}`} className="text-white font-medium text-lg hover:text-secondary transition-colors">
                            {CONTACT_INFO.email}
                        </a>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl flex items-center gap-4 hover:bg-white/5 transition-colors">
                    <div className="p-4 rounded-full bg-purple-500/20 text-purple-400">
                        <Github size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 mb-1">Check my code</p>
                        <a href={CONTACT_INFO.github} target="_blank" rel="noopener noreferrer" className="text-white font-medium text-lg hover:text-secondary transition-colors">
                            github.com/Yourfiyan
                        </a>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl flex items-center gap-4 hover:bg-white/5 transition-colors">
                    <div className="p-4 rounded-full bg-cyan-500/20 text-cyan-400">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 mb-1">Based In</p>
                        <p className="text-white font-medium text-lg">{CONTACT_INFO.location}</p>
                    </div>
                </div>
            </motion.div>

            {/* FAQ / Extra Info */}
            <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-8 rounded-3xl border-t-4 border-t-primary"
            >
                <h3 className="text-xl font-bold text-white mb-6">Frequently Asked</h3>
                
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <Clock className="text-slate-500 shrink-0 mt-1" size={20} />
                        <div>
                            <h4 className="text-white font-medium mb-1">Response Time</h4>
                            <p className="text-sm text-slate-400">I'm a student, so I usually reply in the evenings or weekends. Expect a response within 24-48 hours.</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <Globe className="text-slate-500 shrink-0 mt-1" size={20} />
                        <div>
                            <h4 className="text-white font-medium mb-1">Freelance Work</h4>
                            <p className="text-sm text-slate-400">I am open to small to medium-sized freelance projects, especially involving Web Development, Python scripts, or UI Design.</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;