import React, { useEffect } from 'react';
import ProjectLayout from '../components/ProjectLayout';
import { Layers, MousePointer, Smartphone, Zap, CheckCircle, Code } from 'lucide-react';

const CalculatoReadyPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <ProjectLayout
      title="Calculato Ready"
      subtitle="Your Everyday Web Companion: A foundational step into web development, built with simplicity and core principles."
      tags={['HTML5', 'CSS3', 'JavaScript']}
      githubLink="https://github.com/Yourfiyan/calculatoready"
      demoLink="/live/calc/index.html"
    >
      {/* Hero Image Placeholder */}
      <div className="w-full h-64 md:h-96 bg-gradient-to-br from-emerald-900/40 to-cyan-900/40 rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden relative">
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 opacity-30 text-9xl font-bold select-none">
              +/-
          </div>
          <div className="z-10 text-center p-6">
              <p className="text-slate-300">Project Screenshot Placeholder</p>
              <p className="text-slate-500 text-sm">(assets/image/calc.png)</p>
          </div>
      </div>

      {/* Overview */}
      <section className="glass-card p-8 rounded-3xl border-t-4 border-t-secondary">
        <h2 className="text-2xl font-bold text-white mb-4">Project Overview</h2>
        <p className="text-slate-400 leading-relaxed">
            CalculatoReady is my first ever web-based calculator — created not just to do math, 
            but to dive deeper into how JavaScript interacts with the DOM. It helped me understand 
            event handling, state management, and responsive design principles.
        </p>
      </section>

      {/* Core Features */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-8">Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4">
                <MousePointer className="text-secondary shrink-0 mt-1" />
                <div>
                    <h3 className="font-bold text-white mb-1">Interactive Buttons</h3>
                    <p className="text-slate-400 text-sm">Instant response click handlers for a native app feel.</p>
                </div>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4">
                <Smartphone className="text-secondary shrink-0 mt-1" />
                <div>
                    <h3 className="font-bold text-white mb-1">Responsive Design</h3>
                    <p className="text-slate-400 text-sm">Adapts perfectly to mobile and desktop screens.</p>
                </div>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4">
                <Zap className="text-secondary shrink-0 mt-1" />
                <div>
                    <h3 className="font-bold text-white mb-1">Instant Calculations</h3>
                    <p className="text-slate-400 text-sm">Real-time expression evaluation.</p>
                </div>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4">
                <CheckCircle className="text-secondary shrink-0 mt-1" />
                <div>
                    <h3 className="font-bold text-white mb-1">Error Handling</h3>
                    <p className="text-slate-400 text-sm">Gracefully handles division by zero and syntax errors.</p>
                </div>
            </div>
        </div>
      </section>

      {/* How It Works & Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="glass-card p-8 rounded-3xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Layers className="text-primary" /> How It Works
              </h2>
              <ul className="space-y-4">
                  <li className="flex gap-3 text-slate-400">
                      <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-white shrink-0">1</span>
                      <span>Buttons trigger event listeners that update the internal state.</span>
                  </li>
                  <li className="flex gap-3 text-slate-400">
                      <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-white shrink-0">2</span>
                      <span>Expressions are built as strings in the background.</span>
                  </li>
                  <li className="flex gap-3 text-slate-400">
                      <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-white shrink-0">3</span>
                      <span>The display updates in real-time to reflect user input.</span>
                  </li>
                  <li className="flex gap-3 text-slate-400">
                      <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-white shrink-0">4</span>
                      <span>Mathematical evaluation happens safely when Equals is pressed.</span>
                  </li>
              </ul>
          </section>

          <section className="glass-card p-8 rounded-3xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Code className="text-primary" /> Structure
              </h2>
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 font-mono text-sm text-slate-300">
<pre>{`calculatoready/
├── index.html   # Structure
├── style.css    # Styling
└── script.js    # Logic`}</pre>
              </div>
              <p className="text-slate-500 text-sm mt-4">
                  A classic separation of concerns for clarity and maintainability.
              </p>
          </section>
      </div>
    </ProjectLayout>
  );
};

export default CalculatoReadyPage;