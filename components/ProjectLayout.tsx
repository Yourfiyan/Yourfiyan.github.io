import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Github, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProjectLayoutProps {
  title: string;
  subtitle: string;
  tags?: string[];
  githubLink?: string;
  demoLink?: string;
  children: React.ReactNode;
}

const ProjectLayout: React.FC<ProjectLayoutProps> = ({
  title,
  subtitle,
  tags,
  githubLink,
  demoLink,
  children,
}) => {
  return (
    <div className="pt-32 pb-20 container mx-auto px-6 relative z-10">
      {/* Back Link */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Projects
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          {title}
        </h1>
        <p className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed mb-8">
          {subtitle}
        </p>

        {/* Tags */}
        {tags && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          {githubLink && (
            <a
              href={githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all"
            >
              <Github size={20} />
              View Code
            </a>
          )}
          {demoLink && (
            <a
              href={demoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-white transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]"
            >
              <ExternalLink size={20} />
              Live Demo
            </a>
          )}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-16"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default ProjectLayout;