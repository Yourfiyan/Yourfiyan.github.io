import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, Tag } from 'lucide-react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { BLOG_POSTS } from '../blogData';

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = BLOG_POSTS.find(p => p.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="pt-32 pb-20 container mx-auto px-6 relative z-10">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {post.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {post.readTime}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                <Tag size={12} />
                {tag}
              </span>
            ))}
          </div>

          <div className="h-px w-full bg-white/10 mb-8" />
        </motion.div>

        {/* Content */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {post.content.map((paragraph, idx) => (
            <p key={idx} className="text-slate-300 leading-relaxed mb-6 text-base">
              {paragraph}
            </p>
          ))}
        </motion.article>

        {/* Footer nav */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 pt-8 border-t border-white/10"
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            All Posts
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default BlogPostPage;
