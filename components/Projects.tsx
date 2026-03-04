import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PROJECTS } from '../constants';

const Projects: React.FC = () => {
  return (
    <section id="projects" className="py-24 relative z-10">
      <div className="container mx-auto px-6">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
            <div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Featured Projects</h2>
                <div className="h-1 w-20 bg-gradient-to-r from-primary to-secondary rounded-full" />
            </div>
            <p className="text-slate-400 max-w-md text-right md:text-left">
                A selection of things I've built, ranging from AI agents to productivity tools.
            </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PROJECTS.map((project, idx) => (
                <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="group relative h-full"
                >
                    <Link to={project.link} className="block h-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative h-full glass-card rounded-3xl p-8 flex flex-col transition-transform duration-300 group-hover:-translate-y-2 border border-white/10 group-hover:border-white/20">
                        {/* Icon Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${project.color} bg-opacity-10`}>
                                <project.icon className="text-white h-6 w-6" />
                            </div>
                        </div>

                        {/* Content */}
                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-colors">
                            {project.title}
                        </h3>
                        
                        <p className="text-slate-400 mb-6 flex-grow leading-relaxed">
                            {project.desc}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-auto">
                            {project.tags.map(tag => (
                                <span key={tag} className="text-xs font-medium px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/5">
                                    {tag}
                                </span>
                            ))}
                        </div>

                         {/* Hover visual arrow */}
                         <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                             <ArrowUpRight className="text-white" />
                         </div>
                    </div>
                    </Link>
                </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;