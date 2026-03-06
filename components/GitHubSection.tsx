import React from 'react';
import { motion } from 'framer-motion';
import {
  Github,
  Star,
  GitFork,
  Users,
  BookOpen,
  ExternalLink,
  GitCommit,
  Plus,
  Trash2,
  Eye,
  GitPullRequest,
  MessageSquare,
  Tag,
  Activity,
} from 'lucide-react';
import { useGitHubData, GitHubEvent } from '../hooks/useGitHubData';
import { GITHUB_USERNAME } from '../constants';
import { getLanguageColor, getRelativeTime, getEventDescription, EventDescription } from '../utils/github';

// --- Skeleton components ---
const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-white/10 rounded ${className}`} />
);

// Icon mapping for events
function EventIcon({ type }: { type: EventDescription['icon'] }) {
  const cls = 'w-4 h-4';
  switch (type) {
    case 'push':    return <GitCommit className={cls} />;
    case 'create':  return <Plus className={cls} />;
    case 'star':    return <Star className={cls} />;
    case 'fork':    return <GitFork className={cls} />;
    case 'issue':   return <MessageSquare className={cls} />;
    case 'pr':      return <GitPullRequest className={cls} />;
    case 'delete':  return <Trash2 className={cls} />;
    default:        return <Activity className={cls} />;
  }
}

// --- Main Component ---
const GitHubSection: React.FC = () => {
  const { profile, repos, events, languages, isLoading, error } = useGitHubData();

  // Non-fork repos sorted by recently updated, take top 6
  const topRepos = repos
    .filter((r) => !r.fork)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6);

  // Deduplicate consecutive events of the same type + repo, then take top 10
  const recentEvents = (() => {
    const deduped: (GitHubEvent & { _count?: number })[] = [];
    for (const evt of events) {
      const prev = deduped[deduped.length - 1];
      if (prev && prev.type === evt.type && prev.repo.name === evt.repo.name) {
        prev._count = (prev._count ?? 1) + 1;
        // For PushEvents, sum up total commits
        if (evt.type === 'PushEvent') {
          const prevCommits = prev.payload?.commits?.length ?? 0;
          const currCommits = evt.payload?.commits?.length ?? 0;
          if (!prev.payload) prev.payload = {};
          if (!prev.payload.commits) prev.payload.commits = [];
          // Extend the commits array so the description shows total
          prev.payload._totalCommits = (prev.payload._totalCommits ?? prevCommits) + currCommits;
        }
        continue;
      }
      deduped.push({ ...evt, _count: 1 });
    }
    return deduped.slice(0, 10);
  })();

  // Stagger animation variants
  const containerVariants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-24 relative z-10">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 flex items-center gap-4">
            <Github className="text-green-400" size={40} />
            GitHub Activity
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full" />
        </motion.div>

        {/* Error state */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-3xl p-8 text-center mb-12"
          >
            <p className="text-slate-400">Couldn't load GitHub data right now.</p>
            <a
              href={`https://github.com/${GITHUB_USERNAME}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-green-400 hover:text-green-300 transition-colors"
            >
              Visit my profile instead <ExternalLink size={16} />
            </a>
          </motion.div>
        )}

        {/* ─────────── Profile Card ─────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card rounded-3xl p-8 md:p-10 mb-8 overflow-hidden relative"
        >
          {/* Subtle green glow behind avatar */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

          {isLoading ? (
            <div className="flex flex-col md:flex-row items-center gap-8">
              <Skeleton className="w-24 h-24 rounded-full shrink-0" />
              <div className="flex-1 space-y-3 w-full">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-72" />
                <div className="flex gap-6 mt-4">
                  <Skeleton className="h-12 w-24" />
                  <Skeleton className="h-12 w-24" />
                  <Skeleton className="h-12 w-24" />
                </div>
              </div>
            </div>
          ) : profile ? (
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              {/* Avatar with animated ring */}
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 animate-spin-slow opacity-60 blur-sm scale-110" />
                <img
                  src={`${profile.avatar_url}&s=224`}
                  alt={profile.name ?? profile.login}
                  width={112}
                  height={112}
                  loading="lazy"
                  className="w-24 h-24 md:w-28 md:h-28 rounded-full relative z-10 ring-4 ring-slate-900"
                />
              </div>

              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-bold text-white">
                  {profile.name ?? profile.login}
                </h3>
                {profile.bio && (
                  <p className="text-slate-400 mt-2 max-w-lg">{profile.bio}</p>
                )}

                {/* Stats row */}
                <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{profile.public_repos}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Repos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{profile.followers}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{profile.following}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Following</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">
                      {new Date(profile.created_at).getFullYear()}
                    </p>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Member Since</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <a
                href={profile.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 text-green-400 font-semibold rounded-full hover:bg-green-500/30 hover:text-green-300 transition-all border border-green-500/30 shrink-0"
              >
                <Github size={18} />
                Follow
              </a>
            </div>
          ) : null}
        </motion.div>

        {/* ─────────── Two-column layout: Repos + (Languages + Activity) ─────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Recent Repositories (takes 2 cols on lg) ── */}
          <div className="lg:col-span-2">
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-xl font-bold text-white mb-6 flex items-center gap-2"
            >
              <BookOpen size={20} className="text-green-400" />
              Recent Repositories
            </motion.h3>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="glass-card rounded-2xl p-6 space-y-3">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex gap-4 pt-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {topRepos.map((repo) => (
                  <motion.a
                    key={repo.id}
                    variants={itemVariants}
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-card rounded-2xl p-6 hover:bg-white/5 transition-all group hover:scale-[1.02] hover:border-green-500/20 border border-transparent"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-white font-semibold group-hover:text-green-400 transition-colors truncate pr-2">
                        {repo.name}
                      </h4>
                      <ExternalLink
                        size={14}
                        className="text-slate-600 group-hover:text-green-400 transition-colors shrink-0 mt-1"
                      />
                    </div>

                    {repo.description && (
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                        {repo.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-auto">
                      {repo.language && (
                        <span className="flex items-center gap-1.5">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getLanguageColor(repo.language) }}
                          />
                          {repo.language}
                        </span>
                      )}
                      {repo.stargazers_count > 0 && (
                        <span className="flex items-center gap-1">
                          <Star size={12} /> {repo.stargazers_count}
                        </span>
                      )}
                      {repo.forks_count > 0 && (
                        <span className="flex items-center gap-1">
                          <GitFork size={12} /> {repo.forks_count}
                        </span>
                      )}
                      <span className="ml-auto">{getRelativeTime(repo.updated_at)}</span>
                    </div>
                  </motion.a>
                ))}
              </motion.div>
            )}
          </div>

          {/* ── Right sidebar: Languages + Activity ── */}
          <div className="space-y-8">
            {/* Top Languages */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-gradient-to-br from-green-400 to-emerald-600" />
                Top Languages
              </h3>

              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-full rounded-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {languages.slice(0, 8).map((lang, idx) => (
                    <div key={lang.name}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm text-slate-300 flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: lang.color }}
                          />
                          {lang.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {lang.count} repo{lang.count !== 1 ? 's' : ''} · {lang.percent}%
                        </span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${lang.percent}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: idx * 0.1, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: lang.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Activity Feed */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <Activity size={18} className="text-green-400" />
                Recent Activity
              </h3>

              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-2 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentEvents.length === 0 ? (
                <p className="text-slate-500 text-sm">No recent activity.</p>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="space-y-1"
                >
                  {recentEvents.map((event, idx) => {
                    const desc = getEventDescription(event);
                    const count = (event as any)._count ?? 1;
                    return (
                      <motion.div
                        key={event.id}
                        variants={itemVariants}
                        className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0"
                      >
                        <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                          <EventIcon type={desc.icon} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-slate-300 leading-snug truncate">
                            {desc.text}
                            {count > 1 && (
                              <span className="ml-2 text-xs text-slate-500 bg-white/5 px-1.5 py-0.5 rounded-full">
                                ×{count}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {getRelativeTime(event.created_at)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Custom spin animation for avatar ring */}
      <style>{`
        @keyframes spin-slow { 
          from { transform: rotate(0deg); } 
          to   { transform: rotate(360deg); } 
        }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}</style>
    </section>
  );
};

export default GitHubSection;
