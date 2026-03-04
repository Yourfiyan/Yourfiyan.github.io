import React, { useEffect } from 'react';
import ProjectLayout from '../components/ProjectLayout';
import { Filter, Search, PenTool, CheckCircle, Zap, PiggyBank, Clock, Database, Server, Code2 } from 'lucide-react';

const CustomerSupportPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <ProjectLayout
      title="Customer Support AI Agent"
      subtitle="A production-ready multi-agent customer support system built with Google Gemini AI, designed to automate inquiry handling with high accuracy and empathy."
      tags={['Python', 'Google Gemini', 'FastAPI', 'Multi-Agent']}
      githubLink="https://github.com/Yourfiyan/customer-support-ai-agent"
    >
      {/* Overview */}
      <section className="glass-card p-8 rounded-3xl border-t-4 border-t-primary">
        <h2 className="text-2xl font-bold text-white mb-4">Project Overview</h2>
        <p className="text-slate-400 leading-relaxed">
          This system leverages 4 specialized AI agents to handle customer inquiries automatically. 
          Unlike simple chatbots, it orchestrates a workflow between a Classifier, Researcher, Writer, and Validator 
          to ensure responses are not only accurate but also maintain a professional and empathetic tone. 
          It is designed to reduce response times and operational costs while maintaining high-quality interactions.
        </p>
      </section>

      {/* System Architecture */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
            <Server className="text-secondary" /> System Architecture
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-2xl hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400"><Filter size={24} /></div>
                    <h3 className="text-xl font-bold text-white">Classifier Agent</h3>
                </div>
                <p className="text-slate-400 text-sm">Categorizes inquiries into specific domains such as Account, Billing, Technical, or General queries to route them effectively.</p>
            </div>

            <div className="glass-card p-6 rounded-2xl hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400"><Search size={24} /></div>
                    <h3 className="text-xl font-bold text-white">Research Agent</h3>
                </div>
                <p className="text-slate-400 text-sm">Searches a custom FAQ database using keyword matching and relevance scoring to find accurate answers.</p>
            </div>

            <div className="glass-card p-6 rounded-2xl hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-pink-500/20 rounded-xl text-pink-400"><PenTool size={24} /></div>
                    <h3 className="text-xl font-bold text-white">Writer Agent</h3>
                </div>
                <p className="text-slate-400 text-sm">Crafts professional, empathetic responses based on the research findings and specific inquiry context.</p>
            </div>

            <div className="glass-card p-6 rounded-2xl hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-green-500/20 rounded-xl text-green-400"><CheckCircle size={24} /></div>
                    <h3 className="text-xl font-bold text-white">Validator Agent</h3>
                </div>
                <p className="text-slate-400 text-sm">An automated Quality Assurance loop that checks responses for accuracy and tone before sending.</p>
            </div>
        </div>
      </section>

      {/* Value Props */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-8">Value Proposition</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                <Zap size={32} className="text-yellow-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Instant Responses</h3>
                <p className="text-slate-400 text-sm">Cuts response time to &lt; 2 seconds, providing immediate assistance.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                <PiggyBank size={32} className="text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Cost Saving</h3>
                <p className="text-slate-400 text-sm">Handles ~70% of common inquiries, saving significant agent hours.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                <Clock size={32} className="text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">24/7 Availability</h3>
                <p className="text-slate-400 text-sm">No downtime for support, ensuring customers are helped anytime.</p>
            </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Code2 className="text-secondary" /> Tech Stack
        </h2>
        <div className="flex flex-wrap gap-4">
            {['Google Gemini 2.5 Flash', 'FastAPI', 'Python 3.12+', 'HTML5/JS Frontend'].map((tech) => (
                <div key={tech} className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300">
                    {tech}
                </div>
            ))}
        </div>
      </section>
    </ProjectLayout>
  );
};

export default CustomerSupportPage;