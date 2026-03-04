import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github, ArrowUpRight } from 'lucide-react';
import { PROJECTS } from '../constants';
import { Link } from 'react-router-dom';

const ProjectsPage: React.FC = () => {
    // Ensure scroll to top on mount
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
                    My <span className="text-gradient">Projects</span>
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                    Explore some of my recent work, from web applications to scripting and system optimization tools.
                </p>
            </motion.div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {PROJECTS.map((project, idx) => (
                    <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group relative h-full"
                    >
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        {/* Card Content - We Wrap with Link if internal, or a regular div if not */}
                        <Link to={project.link} className="block h-full">
                            <div className="relative h-full glass-card rounded-3xl p-8 flex flex-col transition-transform duration-300 group-hover:-translate-y-2 border border-white/10 group-hover:border-white/20">
                                {/* Icon Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${project.color} bg-opacity-10`}>
                                        <project.icon className="text-white h-6 w-6" />
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                                            <ArrowUpRight size={20} />
                                        </span>
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-colors">
                                    {project.title}
                                </h3>
                                
                                {/* Description */}
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
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ProjectsPage;