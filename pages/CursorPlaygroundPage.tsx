import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Copy, MousePointer2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CURSOR_CATEGORIES } from '../constants';
import { usePageMeta } from '../hooks/usePageMeta';

// Flattened view of the catalog in constants.ts, tagged with its category
// so a single list drives both the search box and the category pills.
const ALL_CURSORS = CURSOR_CATEGORIES.flatMap(category =>
  category.cursors.map(cursor => ({ ...cursor, category: category.name }))
);

const COPY_FEEDBACK_MS = 1600;

const filterPillClass = (active: boolean) =>
  `text-xs font-medium px-4 py-2 rounded-full transition-colors ${
    active
      ? 'bg-primary text-white'
      : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
  }`;

const CursorPlaygroundPage: React.FC = () => {
  usePageMeta(
    'Cursor Playground',
    'An interactive reference for all 36 standard CSS cursors — hover any card to preview the cursor, click to copy its CSS rule.'
  );

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const copyTimeout = useRef<number | undefined>(undefined);

  // Touch screens never show hover cursors, so tell those visitors up front
  // that the preview half of the page won't apply (copying still works).
  const [isCoarsePointer] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches === true
  );

  useEffect(() => () => window.clearTimeout(copyTimeout.current), []);

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = ALL_CURSORS.filter(cursor => {
    if (activeCategory && cursor.category !== activeCategory) return false;
    if (!normalizedQuery) return true;
    return (
      cursor.value.toLowerCase().includes(normalizedQuery) ||
      cursor.hint.toLowerCase().includes(normalizedQuery)
    );
  });

  const copyCursor = async (value: string) => {
    try {
      await navigator.clipboard.writeText(`cursor: ${value};`);
      window.clearTimeout(copyTimeout.current);
      setCopiedValue(value);
      copyTimeout.current = window.setTimeout(() => setCopiedValue(null), COPY_FEEDBACK_MS);
    } catch {
      // Clipboard access denied (e.g. a non-secure context) — the rule is
      // printed on the card anyway, so fail quietly rather than interrupt.
    }
  };

  return (
    <div className="pt-32 pb-20 container mx-auto px-6 relative z-10">
      {/* Back link */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <Link
          to="/labs"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Labs
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Cursor <span className="text-gradient">Playground</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Every standard CSS cursor in one place — all {ALL_CURSORS.length} of them.
          Hover a card to preview the cursor, click it to copy the CSS rule.
        </p>
        <div className="h-1 w-20 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mt-6" />
      </motion.div>

      {/* Touch-device note */}
      {isCoarsePointer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 rounded-2xl max-w-2xl mx-auto mb-8 flex items-start gap-3"
        >
          <MousePointer2 size={18} className="text-secondary shrink-0 mt-0.5" />
          <p className="text-sm text-slate-400 text-left leading-relaxed">
            Cursor previews need a mouse or trackpad — touch screens don't show
            hover cursors. You can still browse every cursor and copy its CSS.
          </p>
        </motion.div>
      )}

      {/* Search + category filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-3xl mx-auto mb-6"
      >
        <div className="relative mb-6">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search cursors"
            placeholder="Search cursors — try “resize” or “zoom”…"
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all placeholder:text-slate-600"
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setActiveCategory(null)}
            aria-pressed={activeCategory === null}
            className={filterPillClass(activeCategory === null)}
          >
            All
          </button>
          {CURSOR_CATEGORIES.map(category => (
            <button
              key={category.name}
              onClick={() => setActiveCategory(category.name)}
              aria-pressed={activeCategory === category.name}
              className={filterPillClass(activeCategory === category.name)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Result count */}
      <p className="text-center text-xs text-slate-500 font-mono mb-8">
        {filtered.length} of {ALL_CURSORS.length} cursors
      </p>

      {/* Announce copies to screen readers (visual feedback is on the card) */}
      <div role="status" aria-live="polite" className="sr-only">
        {copiedValue ? `Copied cursor: ${copiedValue}; to clipboard` : ''}
      </div>

      {/* Cursor grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((cursor, idx) => {
          const isCopied = copiedValue === cursor.value;
          return (
            <motion.div
              key={cursor.value}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(idx * 0.03, 0.4) }}
              className="h-full"
            >
              <button
                type="button"
                onClick={() => copyCursor(cursor.value)}
                style={{ cursor: cursor.value }}
                aria-label={`Copy the CSS rule for the ${cursor.value} cursor`}
                className="group block w-full h-full text-left glass-card p-5 rounded-2xl border border-white/10 hover:border-primary/50 transition-all hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className="font-mono font-bold text-white group-hover:text-secondary transition-colors">
                    {cursor.value}
                  </span>
                  {isCopied ? (
                    <Check size={16} className="text-green-400 shrink-0 mt-1" />
                  ) : (
                    <Copy
                      size={16}
                      className="text-slate-500 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity shrink-0 mt-1"
                    />
                  )}
                </div>

                <p className="text-slate-400 text-sm leading-relaxed mb-3">{cursor.hint}</p>

                <p
                  className={`text-xs font-mono transition-colors ${
                    isCopied ? 'text-green-400' : 'text-slate-500'
                  }`}
                >
                  {isCopied ? 'Copied!' : `cursor: ${cursor.value};`}
                </p>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <p className="text-center text-slate-500 mt-12">
          No cursors match “{query}”. Try a different search or category.
        </p>
      )}

      {/* Footnote */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-xs text-slate-500 mt-16 max-w-xl mx-auto leading-relaxed"
      >
        Exactly how each cursor looks depends on your OS and browser — a few of
        them, like <span className="font-mono">progress</span> and{' '}
        <span className="font-mono">wait</span>, can render identically.
      </motion.p>
    </div>
  );
};

export default CursorPlaygroundPage;
