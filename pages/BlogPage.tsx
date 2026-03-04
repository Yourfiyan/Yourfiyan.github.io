import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BLOG_POSTS } from '../blogData';

const BlogPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = [...new Set(BLOG_POSTS.flatMap(post => post.tags))];
  const filtered = activeTag
    ? BLOG_POSTS.filter(post => post.tags.includes(activeTag))
    : BLOG_POSTS;

  return (
    <div className="pt-32 pb-20 container mx-auto px-6 relative z-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Blog</h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          Thoughts, tutorials, and stories from my journey as a student developer.
        </p>
        <div className="h-1 w-20 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mt-6" />
      </motion.div>

      {/* Tag filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2 justify-center mb-12"
      >
        <button
          onClick={() => setActiveTag(null)}
          className={`text-xs font-medium px-4 py-2 rounded-full transition-colors ${
            activeTag === null
              ? 'bg-primary text-white'
              : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
          }`}
        >
          All
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`text-xs font-medium px-4 py-2 rounded-full transition-colors ${
              activeTag === tag
                ? 'bg-primary text-white'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            {tag}
          </button>
        ))}
      </motion.div>

      {/* Posts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {filtered.map((post, idx) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link to={`/blog/${post.slug}`} className="group block h-full">
              <div className="relative h-full glass-card rounded-2xl p-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-white/20">
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {post.readTime}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary transition-colors">
                  {post.title}
                </h2>

                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  {post.excerpt}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 rounded-full bg-white/5 text-slate-400 border border-white/5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1 text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Read more <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-slate-500 mt-12">No posts found for this tag.</p>
      )}
    </div>
  );
};

export default BlogPage;
