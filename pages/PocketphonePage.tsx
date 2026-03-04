import React, { useEffect } from 'react';
import ProjectLayout from '../components/ProjectLayout';
import { Shield, Users, Smartphone, Key, Lock, Database } from 'lucide-react';

const PocketphonePage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <ProjectLayout
      title="Pocketphone"
      subtitle="A comprehensive phone inventory management system featuring a secure admin panel, role-based access control, and dynamic product showcasing."
      tags={['PHP', 'MySQL', 'JavaScript', 'Security']}
      demoLink="/live/pocketphone/admin/index.php"
    >
       {/* Hero Image Placeholder */}
       <div className="w-full h-64 md:h-96 bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden relative">
          <div className="z-10 text-center p-6">
              <p className="text-slate-300">Admin Dashboard Screenshot Placeholder</p>
              <p className="text-slate-500 text-sm">(assets/image/pocketphone-admin.png)</p>
          </div>
      </div>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-white/10 hover:border-primary/50 transition-colors">
            <Shield className="text-primary mb-4" size={32} />
            <h3 className="text-xl font-bold text-white mb-2">Secure Auth</h3>
            <p className="text-slate-400 text-sm">Robust login system with password hashing and session management.</p>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-white/10 hover:border-primary/50 transition-colors">
            <Users className="text-primary mb-4" size={32} />
            <h3 className="text-xl font-bold text-white mb-2">Role-Based Access</h3>
            <p className="text-slate-400 text-sm">Differentiated access levels for admin and demo users.</p>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-white/10 hover:border-primary/50 transition-colors">
            <Smartphone className="text-primary mb-4" size={32} />
            <h3 className="text-xl font-bold text-white mb-2">Inventory Mgmt</h3>
            <p className="text-slate-400 text-sm">Complete CRUD operations for managing phone products.</p>
        </div>
      </section>

      {/* Security & Tech */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="glass-card p-8 rounded-3xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Lock className="text-secondary" /> Security Implementation
            </h2>
            <ul className="space-y-4">
                <li className="flex items-start gap-3 text-slate-400">
                    <Key className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span><strong>Password Hashing:</strong> All passwords are hashed before storage.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-400">
                    <Database className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span><strong>Prepared Statements:</strong> Prevents SQL injection attacks.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-400">
                    <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span><strong>XSS Prevention:</strong> Output escaping on all user inputs.</span>
                </li>
            </ul>
          </section>

          <section className="glass-card p-8 rounded-3xl">
             <h2 className="text-2xl font-bold text-white mb-6">Demo Access</h2>
             <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                 <p className="text-slate-300 mb-4">You can explore the admin panel using these demo credentials:</p>
                 <div className="grid grid-cols-2 gap-4 text-sm">
                     <div className="bg-black/30 p-3 rounded-lg">
                         <span className="text-slate-500 block text-xs">Username</span>
                         <span className="text-white font-mono">admin</span>
                     </div>
                     <div className="bg-black/30 p-3 rounded-lg">
                         <span className="text-slate-500 block text-xs">Password</span>
                         <span className="text-white font-mono">admin123</span>
                     </div>
                 </div>
                 <p className="text-xs text-slate-500 mt-4">* Limited permissions for security.</p>
             </div>
          </section>
      </div>

       {/* Project Structure */}
       <section className="glass-card p-8 rounded-3xl">
        <h2 className="text-2xl font-bold text-white mb-6">Project Structure</h2>
        <div className="bg-black/40 p-6 rounded-xl border border-white/5 overflow-x-auto">
<pre className="text-sm font-mono text-slate-300 leading-relaxed">{`pocketphone/
├── index.php          # Front-end
├── hashed.php         # Utilities
├── admin/            
│   ├── index.php      # Dashboard
│   ├── add_product.php
│   ├── auth_check.php # Middleware
│   ├── db_config.php  
│   └── login.php      
└── uploads/           # Images`}</pre>
        </div>
      </section>
    </ProjectLayout>
  );
};

export default PocketphonePage;