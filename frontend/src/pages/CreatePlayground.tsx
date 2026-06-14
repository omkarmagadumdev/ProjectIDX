import React from 'react';
import { 
  Plus, 
  type LucideIcon,
  Terminal, 
  Globe, 
  Code2, 
  Database, 
  Layout, 
  Sparkles,
  Github,
  Monitor,
  Cloud
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: 'Web' | 'Backend' | 'Mobile';
}

const templates: Template[] = [
  { id: 'nextjs', name: 'Next.js', description: 'The React Framework for the Web', icon: Globe, category: 'Web' },
  { id: 'react', name: 'React', description: 'Frontend Library for UI', icon: Layout, category: 'Web' },
  { id: 'node', name: 'Node.js', description: 'JavaScript Runtime', icon: Terminal, category: 'Backend' },
  { id: 'python', name: 'Python', description: 'General Purpose Programming', icon: Code2, category: 'Backend' },
  { id: 'go', name: 'Go', description: 'Scalable Backend Services', icon: Database, category: 'Backend' },
  { id: 'flutter', name: 'Flutter', description: 'Cross-platform Mobile/Web', icon: Sparkles, category: 'Mobile' },
];

const CreatePlayground = () => {
  return (
    <div className="min-h-screen bg-idx-bg text-slate-200 font-sans selection:bg-idx-accent/30">
      {/* Header */}
      <nav className="border-b border-idx-border bg-idx-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-idx-accent rounded-lg flex items-center justify-center shadow-lg shadow-idx-accent/20">
              <Code2 size={18} className="text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight uppercase text-slate-100">Project IDX</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 transition-colors">Documentation</button>
            <div className="h-4 w-px bg-idx-border mx-1" />
            <button className="bg-idx-accent hover:bg-idx-accent/90 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-all active:scale-95 flex items-center gap-1.5">
              <Plus size={14} /> New Workspace
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-5xl font-extrabold mb-6 tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
            Build something amazing.
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Choose a template to launch a full-stack development environment in seconds, 
            directly in your browser.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          <div className="flex items-center gap-4 p-5 bg-idx-surface border border-idx-border rounded-xl hover:border-idx-accent/50 transition-all cursor-pointer group shadow-sm">
             <div className="w-12 h-12 rounded-xl bg-idx-accent/10 flex items-center justify-center text-idx-accent group-hover:bg-idx-accent group-hover:text-white transition-all">
                <Github size={24} />
             </div>
             <div>
                <h4 className="text-sm font-semibold text-slate-100">Import from GitHub</h4>
                <p className="text-xs text-slate-500 mt-0.5">Clone and edit your existing repositories</p>
             </div>
          </div>
          <div className="flex items-center gap-4 p-5 bg-idx-surface border border-idx-border rounded-xl hover:border-idx-accent/50 transition-all cursor-pointer group shadow-sm">
             <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <Monitor size={24} />
             </div>
             <div>
                <h4 className="text-sm font-semibold text-slate-100">Blank Workspace</h4>
                <p className="text-xs text-slate-500 mt-0.5">Start from scratch with a clean dev environment</p>
             </div>
          </div>
        </div>

        {/* Templates Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-idx-border pb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100">
              <Sparkles size={20} className="text-idx-accent" />
              Popular Templates
            </h2>
            <div className="flex bg-idx-surface p-0.5 rounded-lg border border-idx-border shadow-inner">
              {['All', 'Web', 'API'].map((t) => (
                <button key={t} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${t === 'All' ? 'bg-idx-accent text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {templates.map((template) => (
              <div 
                key={template.id}
                className="group bg-idx-surface border border-idx-border rounded-xl p-6 hover:border-idx-accent/40 hover:bg-idx-accent/5 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-idx-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-5">
                    <div className="w-11 h-11 bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-idx-accent/20 group-hover:scale-110 transition-all shadow-sm">
                      <template.icon size={22} className="text-idx-accent" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-800/50 px-2 py-1 rounded-md">
                      {template.category}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold mb-1.5 group-hover:text-idx-accent transition-colors text-slate-100">{template.name}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{template.description}</p>
                  
                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1.5 font-medium">
                      <Cloud size={11} /> Nix Powered
                    </span>
                    <Plus size={16} className="text-slate-400 group-hover:text-idx-accent transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-idx-border mt-20 text-center">
         <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-medium">
            Designed for the future of cloud development
         </p>
      </footer>
    </div>
  );
};

export default CreatePlayground;
