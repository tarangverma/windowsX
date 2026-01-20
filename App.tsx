
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { INITIAL_APPS } from './data/apps';
import { AppItem, MenuState, MenuPosition, WindowState, SystemStatus } from './types';
import IconRenderer from './components/IconRenderer';
//import DebugPanel from './components/DebugPanel';
import AppGrid from './components/AppGrid';
import MockWindow from './components/MockWindow';

const App: React.FC = () => {
  const [apps, setApps] = useState<AppItem[]>(INITIAL_APPS);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('running');
  const [state, setState] = useState<MenuState>({
    isOpen: false,
    searchQuery: '',
    selectedIndex: 0,
    position: 'center',
    showDebug: true,
    view: 'pinned',
    isPowerMenuOpen: false,
  });
  const [openWindows, setOpenWindows] = useState<WindowState[]>([]);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(100);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Derived state
  const pinnedApps = useMemo(() => apps.filter(a => a.isPinned), [apps]);
  
  const allAppsSorted = useMemo(() => {
    return [...apps].sort((a, b) => a.name.localeCompare(b.name));
  }, [apps]);

  const appsByLetter = useMemo(() => {
    const groups: Record<string, AppItem[]> = {};
    allAppsSorted.forEach(app => {
      const char = app.name[0].toUpperCase();
      if (!groups[char]) groups[char] = [];
      groups[char].push(app);
    });
    return groups;
  }, [allAppsSorted]);
  
  const searchResults = useMemo(() => {
    const query = state.searchQuery.toLowerCase().trim();
    if (!query) return [];
    
    return apps.filter(app => 
      app.name.toLowerCase().includes(query) || 
      app.category.toLowerCase().includes(query) ||
      (app.command && app.command.toLowerCase().includes(query))
    ).sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(query);
      const bStarts = b.name.toLowerCase().startsWith(query);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [apps, state.searchQuery]);

  // Handlers
  const toggleMenu = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isOpen: !prev.isOpen,
      searchQuery: !prev.isOpen ? '' : prev.searchQuery,
      selectedIndex: 0,
      view: 'pinned',
      isPowerMenuOpen: false,
    }));
  }, []);

  const handleTogglePin = useCallback((id: string) => {
    setApps(prev => prev.map(app => app.id === id ? { ...app, isPinned: !app.isPinned } : app));
  }, []);

  const handleLaunch = useCallback((app: AppItem) => {
    setLastAction(`Launched ${app.name}`);
    setTimeout(() => setLastAction(null), 2500);
    
    const existing = openWindows.find(w => w.appId === app.id);
    if (existing) {
      focusWindow(existing.id);
      if (existing.isMinimized) {
        setOpenWindows(prev => prev.map(w => w.id === existing.id ? { ...w, isMinimized: false } : w));
      }
    } else {
      const newZ = maxZIndex + 1;
      setMaxZIndex(newZ);
      
      const w = 800;
      const h = 600;
      const centerX = (window.innerWidth - w) / 2 + (openWindows.length * 30);
      const centerY = (window.innerHeight - h) / 2 + (openWindows.length * 30);

      setOpenWindows(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        appId: app.id,
        title: app.name,
        icon: app.icon,
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        x: centerX,
        y: centerY,
        width: w,
        height: h,
        zIndex: newZ
      }]);
    }
    
    setState(prev => ({ ...prev, isOpen: false }));
  }, [openWindows, maxZIndex]);

  const closeWindow = (id: string) => setOpenWindows(prev => prev.filter(w => w.id !== id));
  const toggleMinimize = (id: string) => setOpenWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: !w.isMinimized } : w));
  const toggleMaximize = (id: string) => setOpenWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  const updateWindowPos = (id: string, x: number, y: number) => setOpenWindows(prev => prev.map(w => w.id === id ? { ...w, x, y } : w));
  const updateWindowSize = (id: string, width: number, height: number) => setOpenWindows(prev => prev.map(w => w.id === id ? { ...w, width, height } : w));
  
  const focusWindow = (id: string) => {
    const newZ = maxZIndex + 1;
    setMaxZIndex(newZ);
    setOpenWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: newZ } : w));
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!state.isOpen) return;
    if (e.key === 'Escape') toggleMenu();
    if (state.searchQuery) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setState(prev => ({ ...prev, selectedIndex: Math.min(prev.selectedIndex + 1, searchResults.length - 1) }));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setState(prev => ({ ...prev, selectedIndex: Math.max(prev.selectedIndex - 1, 0) }));
      } else if (e.key === 'Enter' && searchResults[state.selectedIndex]) {
        handleLaunch(searchResults[state.selectedIndex]);
      }
    }
  }, [state.isOpen, state.searchQuery, searchResults, state.selectedIndex, toggleMenu, handleLaunch]);

  useEffect(() => {
    if (state.isOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [state.isOpen]);

  const renderAppContent = (appId: string) => {
    const app = apps.find(a => a.id === appId);
    if (!app) return null;

    switch (app.name) {
      case 'File Explorer':
        return (
          <div className="flex h-full">
            <div className="w-48 border-r border-slate-800 p-4 space-y-2 shrink-0">
               {['Quick access', 'Desktop', 'Downloads', 'Documents', 'Pictures'].map(f => (
                 <div key={f} className="flex items-center gap-2 p-2 hover:bg-white/5 rounded text-xs text-slate-400 cursor-pointer">
                   <IconRenderer name="Folder" size={14} className="text-blue-500" /> {f}
                 </div>
               ))}
            </div>
            <div className="flex-1 p-6 grid grid-cols-2 md:grid-cols-4 gap-6 content-start">
              {['Work', 'Personal', 'Projects', 'Assets', 'Backups', 'Finance', 'Old Photos', 'Notes'].map(f => (
                <div key={f} className="flex flex-col items-center gap-2 p-4 hover:bg-white/5 rounded-lg cursor-pointer group">
                  <IconRenderer name="Folder" size={56} className="text-blue-400 group-hover:scale-110 transition-transform shadow-lg shadow-blue-900/10" />
                  <span className="text-xs text-slate-300 font-medium">{f}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'Browser':
        return (
          <div className="flex flex-col h-full bg-slate-900">
            <div className="flex items-center gap-4 px-4 py-2 bg-slate-800 border-b border-white/5">
              <div className="flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-500/30" />
                 <div className="w-3 h-3 rounded-full bg-yellow-500/30" />
                 <div className="w-3 h-3 rounded-full bg-green-500/30" />
              </div>
              <div className="flex-1 bg-slate-950 px-4 py-1.5 rounded-full text-[11px] text-slate-500 flex items-center gap-3 border border-white/5 shadow-inner">
                 <IconRenderer name="Globe" size={12} />
                 <span>https://zen-os.platform/dashboard</span>
              </div>
            </div>
            <div className="flex-1 p-10 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mb-6 border border-blue-500/20">
                <IconRenderer name="Globe" size={40} className="text-blue-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Private Web Experience</h2>
              <p className="text-slate-500 text-sm max-w-sm">Enjoy a browser that respects your data and stays out of your way.</p>
            </div>
          </div>
        );
      case 'Terminal':
        return (
          <div className="font-mono text-sm text-green-500 space-y-2 h-full bg-black p-6 overflow-auto">
            <p className="opacity-50">ZenOS Core Kernel v1.0.0-release</p>
            <p className="opacity-50">(c) 2025 Zen Labs. Secure Shell ready.</p>
            <p className="mt-4">root@zen:~$ uptime</p>
            <p className="text-white">up 12 days, 4:20, 1 user, load average: 0.04, 0.05, 0.01</p>
            <p className="mt-4">root@zen:~$ ls -F</p>
            <div className="flex flex-wrap gap-x-8 text-blue-400">
              <span>Applications/</span> <span>Library/</span> <span>System/</span> <span>Users/</span> <span>Volumes/</span>
            </div>
            <p className="mt-4">root@zen:~$ <span className="animate-pulse">_</span></p>
          </div>
        );
      case 'Settings':
        return (
          <div className="flex h-full">
            <div className="w-64 border-r border-slate-800 p-4 space-y-1">
               {['System', 'Devices', 'Network', 'Personalization', 'Apps', 'Privacy', 'Update'].map((it, i) => (
                 <button key={it} className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${i === 3 ? 'bg-blue-600 shadow-lg text-white' : 'text-slate-400 hover:bg-white/5'}`}>
                   {it}
                 </button>
               ))}
            </div>
            <div className="flex-1 p-8 overflow-auto">
               <h1 className="text-2xl font-bold text-white mb-8">Personalization</h1>
               <div className="space-y-8">
                  <div className="p-6 bg-slate-900 border border-white/5 rounded-2xl shadow-xl">
                    <h3 className="text-sm font-bold text-slate-300 mb-4">Background Accent</h3>
                    <div className="flex gap-4">
                       {['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981'].map(c => (
                         <div key={c} className="w-10 h-10 rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg" style={{ backgroundColor: c }} />
                       ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-between">
                       <span className="text-sm font-medium text-slate-300">Dark Mode</span>
                       <div className="w-10 h-6 bg-blue-600 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" /></div>
                    </div>
                    <div className="p-6 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-between">
                       <span className="text-sm font-medium text-slate-300">Transparency Effects</span>
                       <div className="w-10 h-6 bg-slate-700 rounded-full relative"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" /></div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        );
      case 'Music Player':
        return (
          <div className="flex flex-col h-full bg-slate-900 items-center justify-center p-12">
            <div className="w-64 h-64 bg-slate-800 rounded-[2rem] shadow-2xl overflow-hidden mb-10 border border-white/5 group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-blue-600 opacity-20 group-hover:scale-110 transition-transform" />
              <div className="h-full w-full flex items-center justify-center">
                <IconRenderer name="Music" size={80} className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
              </div>
            </div>
            <div className="text-center mb-10">
              <h2 className="text-2xl font-black text-white mb-1">Celestial Echoes</h2>
              <p className="text-slate-500 font-medium">Lofi Beats for Deep Work</p>
            </div>
            <div className="w-full max-w-sm space-y-8">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
              </div>
              <div className="flex items-center justify-center gap-12 text-slate-400">
                <button className="hover:text-white transform hover:scale-110 transition-all"><IconRenderer name="ArrowRight" size={28} className="rotate-180" /></button>
                <button className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"><IconRenderer name="Search" size={28} className="rotate-90" /></button>
                <button className="hover:text-white transform hover:scale-110 transition-all"><IconRenderer name="ArrowRight" size={28} /></button>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center text-slate-700">
              <IconRenderer name={app.icon} size={48} className="opacity-20" />
            </div>
            <h3 className="text-xl font-bold text-slate-300">Welcome to {app.name}</h3>
            <p className="text-slate-500 text-sm">This is a application interface for the {app.category} category.</p>
          </div>
        );
    }
  };

  if (systemStatus === 'locked') {
    return (
      <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center text-white relative animate-in fade-in duration-700">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=2564')] bg-cover bg-center opacity-40 blur-sm scale-105" />
        <div className="z-10 flex flex-col items-center">
          <h1 className="text-8xl font-black mb-4 tracking-tighter drop-shadow-2xl">09:41</h1>
          <p className="text-lg font-medium opacity-80 mb-12">Friday, June 13</p>
          <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-6">
            <IconRenderer name="Lock" size={40} className="text-white" />
          </div>
          <button 
            onClick={() => setSystemStatus('running')}
            className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform shadow-2xl"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (systemStatus === 'off') {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center gap-8 animate-in fade-in duration-1000">
        <div className="w-16 h-16 rounded-full border-4 border-slate-900 border-t-blue-500 animate-spin" />
        <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.3em]">System Suspended</p>
        <button onClick={() => setSystemStatus('running')} className="px-6 py-2 border border-slate-800 text-slate-600 rounded-lg hover:text-white hover:border-white transition-all">Power On</button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-slate-950 flex flex-col items-center justify-end pb-12 overflow-hidden select-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#1e293b,transparent)] pointer-events-none" />
      
      {/* Dev Mode UI */}
      {/* <button 
        onClick={() => setState(p => ({ ...p, showDebug: !p.showDebug }))}
        className="absolute top-4 left-4 p-2.5 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-all z-[101] shadow-lg border border-white/5"
      >
        <IconRenderer name="Activity" size={18} />
      </button> */}

      {/* {state.showDebug && <DebugPanel state={state} resultsCount={searchResults.length} pinnedCount={pinnedApps.length} />} */}

      {/* Notifications - Correct Centering */}
      {lastAction && (
        <div className="absolute top-24 left-0 right-0 flex justify-center z-[200] pointer-events-none">
          <div className="px-6 py-2.5 bg-blue-600 text-white rounded-full text-xs font-black animate-in fade-in slide-in-from-top-6 duration-300 shadow-[0_20px_40px_rgba(37,99,235,0.4)] border border-blue-400/30">
            {lastAction}
          </div>
        </div>
      )}

      {/* Mock Windows */}
      {openWindows.map(win => (
        <MockWindow 
          key={win.id} id={win.id} title={win.title} icon={win.icon} isMaximized={win.isMaximized} isMinimized={win.isMinimized}
          x={win.x} y={win.y} width={win.width} height={win.height} zIndex={win.zIndex}
          onClose={() => closeWindow(win.id)} onMinimize={() => toggleMinimize(win.id)} onMaximize={() => toggleMaximize(win.id)}
          onFocus={() => focusWindow(win.id)} onMove={(x, y) => updateWindowPos(win.id, x, y)} onResize={(w, h) => updateWindowSize(win.id, w, h)}
        >
          {renderAppContent(win.appId)}
        </MockWindow>
      ))}

      {/* Alignment Toggles */}
      <div className="absolute top-4 left-16 flex gap-2">
        {(['left', 'center'] as MenuPosition[]).map(pos => (
          <button
            key={pos}
            onClick={() => setState(prev => ({ ...prev, position: pos }))}
            className={`px-4 py-1.5 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all border ${
              state.position === pos 
              ? 'bg-blue-600 text-white shadow-xl border-blue-400/20' 
              : 'bg-slate-800 text-slate-500 hover:bg-slate-700 border-white/5'
            }`}
          >
            {pos}
          </button>
        ))}
      </div>

      {/* Start Menu */}
      <div 
        className={`
          transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) transform
          w-[540px] max-w-[95vw] h-[660px] max-h-[88vh]
          bg-slate-900/90 backdrop-blur-3xl border border-slate-700/50 rounded-2xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden
          flex flex-col z-50 mb-4
          ${state.isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-24 scale-95 pointer-events-none'}
          ${state.position === 'left' ? 'self-start ml-4' : 'self-center'}
        `}
      >
        {/* Instant Search Bar */}
        <div className="p-4 border-b border-slate-700/20 bg-white/5">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <IconRenderer name="Search" size={18} className="text-slate-600 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search apps, commands, or settings..."
              className="w-full bg-slate-950/60 border border-slate-700/50 text-slate-100 pl-12 pr-4 py-3.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder-slate-700 transition-all shadow-inner font-medium"
              value={state.searchQuery}
              onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value, selectedIndex: 0 }))}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {state.searchQuery ? (
             <div className="flex-1 overflow-y-auto p-4 space-y-1">
               <h3 className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2">Best Match</h3>
               {searchResults.length > 0 ? (
                 searchResults.map((res, idx) => (
                   <button
                     key={res.id}
                     onClick={() => handleLaunch(res)}
                     className={`
                       w-full flex items-center justify-between gap-4 p-4 rounded-xl transition-all
                       ${state.selectedIndex === idx ? 'bg-blue-600 shadow-2xl shadow-blue-900/40 translate-x-1' : 'hover:bg-white/5'}
                     `}
                   >
                     <div className="flex items-center gap-4">
                       <div className={`p-2.5 rounded-xl ${state.selectedIndex === idx ? 'bg-white/20' : 'bg-slate-800 border border-white/5'}`}>
                         <IconRenderer name={res.icon} size={20} className={state.selectedIndex === idx ? 'text-white' : 'text-slate-400'} />
                       </div>
                       <div className="flex flex-col text-left min-w-0">
                         <span className={`text-sm font-bold truncate ${state.selectedIndex === idx ? 'text-white' : 'text-slate-100'}`}>{res.name}</span>
                         <span className={`text-[10px] font-medium ${state.selectedIndex === idx ? 'text-blue-100' : 'text-slate-500'}`}>{res.category}</span>
                       </div>
                     </div>
                   </button>
                 ))
               ) : (
                 <div className="flex flex-col items-center justify-center h-full text-slate-700 opacity-50 py-10">
                    <IconRenderer name="Search" size={48} className="mb-4" />
                    <p className="text-sm font-black uppercase tracking-widest">No Matches</p>
                 </div>
               )}
             </div>
          ) : state.view === 'pinned' ? (
            <div className="p-6 space-y-10 animate-in slide-in-from-left-6 duration-500 flex-1 overflow-y-auto">
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">Pinned Tools</h3>
                  <button onClick={() => setState(prev => ({ ...prev, view: 'allApps' }))} className="flex items-center gap-2 text-[11px] font-black uppercase text-slate-500 hover:text-white transition-colors bg-white/5 px-4 py-1.5 rounded-lg border border-white/5">
                    All <IconRenderer name="ChevronRight" size={12} />
                  </button>
                </div>
                <AppGrid apps={pinnedApps} onTogglePin={handleTogglePin} onLaunch={handleLaunch} />
              </section>

              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">Recommended</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {apps.filter(a => !a.isPinned).slice(0, 4).map(app => (
                    <button 
                      key={app.id} onClick={() => handleLaunch(app)}
                      className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-800/20 border border-white/5 hover:border-slate-600 hover:bg-slate-800 transition-all text-left"
                    >
                      <div className="p-2.5 bg-slate-800 rounded-xl group-hover:scale-110 transition-transform">
                        <IconRenderer name={app.icon} size={20} className="text-slate-400 group-hover:text-blue-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-200">{app.name}</span>
                        <span className="text-[10px] text-slate-600">{app.category}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <div className="flex-1 flex flex-col animate-in slide-in-from-right-6 duration-500 overflow-hidden">
               <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/90 backdrop-blur-xl z-10">
                  <button onClick={() => setState(prev => ({ ...prev, view: 'pinned' }))} className="flex items-center gap-2 text-xs font-black uppercase text-slate-500 hover:text-white transition-all">
                    <IconRenderer name="ArrowRight" size={16} className="rotate-180" /> Back
                  </button>
                  <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">All Apps</h3>
                  <div className="w-10" />
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-10">
                  {Object.entries(appsByLetter).map(([letter, letterApps]) => (
                    <div key={letter} className="space-y-2">
                      <div className="px-5 py-1 text-xs font-black text-blue-500 flex items-center gap-4">
                        <span className="shrink-0">{letter}</span>
                        <div className="h-px w-full bg-slate-800/40" />
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {letterApps.map(app => (
                          <button key={app.id} onClick={() => handleLaunch(app)} className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-white/5 rounded-xl transition-all group text-left">
                            <IconRenderer name={app.icon} size={18} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                            <div className="flex-1">
                              <p className="text-xs font-bold text-slate-300 group-hover:text-white">{app.name}</p>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleTogglePin(app.id); }}
                              className={`p-2 rounded-lg transition-all ${app.isPinned ? 'text-blue-500' : 'text-slate-700 hover:text-white opacity-0 group-hover:opacity-100'}`}
                            >
                              <IconRenderer name="Pin" size={12} />
                            </button>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-950/80 border-t border-slate-700/30 flex items-center justify-between relative shrink-0">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-xl ring-2 ring-slate-800 group-hover:ring-blue-500/50 transition-all">
              JD
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-200">John Doe</span>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Zen Administrator</span>
            </div>
          </div>

          <div className="relative">
            {state.isPowerMenuOpen && (
              <div className="absolute bottom-full right-0 mb-4 w-56 bg-slate-900/98 backdrop-blur-3xl border border-slate-700/50 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 z-[100]">
                <div className="p-2 space-y-1">
                  {[
                    { label: 'Lock Device', icon: 'Lock', action: () => setSystemStatus('locked') },
                    { label: 'Sign Out', icon: 'LogOut', action: () => setSystemStatus('locked') },
                    <div className="h-px bg-slate-800/50 mx-3 my-2" key="sep" />,
                    { label: 'Sleep Mode', icon: 'Clock', action: () => setSystemStatus('off') },
                    { label: 'Shut Down', icon: 'Power', action: () => { setLastAction('Shutting down...'); setTimeout(() => setSystemStatus('off'), 1500); } },
                    { label: 'Restart System', icon: 'RotateCcw', action: () => { setLastAction('Rebooting...'); setTimeout(() => setSystemStatus('locked'), 1500); } }
                  ].map((item, idx) => 
                    React.isValidElement(item) ? item : (
                      <button
                        key={idx} onClick={() => { (item as any).action(); setState(p => ({ ...p, isPowerMenuOpen: false })); }}
                        className="w-full flex items-center gap-4 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-blue-600 hover:text-white transition-all rounded-xl text-left group"
                      >
                        <IconRenderer name={(item as any).icon} size={16} className="text-slate-700 group-hover:text-blue-100" />
                        {(item as any).label}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
            <button 
              onClick={() => setState(prev => ({ ...prev, isPowerMenuOpen: !prev.isPowerMenuOpen }))}
              className={`p-3 rounded-xl transition-all shadow-md active:scale-90 ${state.isPowerMenuOpen ? 'bg-blue-600 text-white shadow-blue-900/40' : 'text-slate-500 hover:text-white hover:bg-slate-800 bg-white/5'}`}
            >
              <IconRenderer name="Power" size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Taskbar */}
      <div className={`
        fixed bottom-0 left-0 right-0 h-12 bg-slate-900/90 backdrop-blur-2xl border-t border-white/5 flex items-center gap-1.5 z-[110] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]
        ${state.position === 'left' ? 'justify-start pl-4' : 'justify-center'}
      `}>
        <button 
          onClick={toggleMenu}
          className={`group w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-90 ${state.isOpen ? 'bg-blue-600/20 shadow-inner' : 'hover:bg-white/10'}`}
        >
          <div className={`w-6 h-6 transition-all duration-300 ${state.isOpen ? 'scale-75' : 'group-hover:scale-110'}`}>
             <svg viewBox="0 0 24 24" fill="none" className={`w-full h-full ${state.isOpen ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'text-slate-400 group-hover:text-blue-400'}`}>
               <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" />
               <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" fillOpacity="0.8" />
               <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" fillOpacity="0.8" />
               <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" fillOpacity="0.5" />
             </svg>
          </div>
        </button>
        
        <div className="w-px h-6 bg-slate-800/80 mx-2" />

        <div className="flex items-center gap-1">
          {openWindows.map(win => (
            <div 
              key={win.id} title={win.title}
              className={`group relative w-10 h-10 flex flex-col items-center justify-center rounded-xl cursor-pointer active:scale-90 transition-all ${win.zIndex === maxZIndex && !win.isMinimized ? 'bg-white/10' : 'hover:bg-white/5'}`}
              onClick={() => {
                if (win.isMinimized) { toggleMinimize(win.id); focusWindow(win.id); } 
                else if (win.zIndex < maxZIndex) { focusWindow(win.id); } 
                else { toggleMinimize(win.id); }
              }}
            >
               <IconRenderer name={win.icon} size={20} className={`${win.isMinimized ? 'text-slate-700 scale-90' : 'text-slate-200'} group-hover:text-white transition-all`} />
               <div className={`absolute bottom-1 w-2 h-1 rounded-full transition-all duration-300 ${win.isMinimized ? 'bg-slate-800 w-1 opacity-50' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]'}`} />
            </div>
          ))}
          
          {pinnedApps.filter(p => !openWindows.find(w => w.appId === p.id)).slice(0, 6).map(app => (
            <div key={app.id} title={app.name} onClick={() => handleLaunch(app)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 cursor-pointer group active:scale-90 transition-all">
               <IconRenderer name={app.icon} size={20} className="text-slate-600 group-hover:text-slate-300 transition-all" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Click-away overlay */}
      {(state.isOpen || state.isPowerMenuOpen) && (
        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setState(p => ({ ...p, isOpen: false, isPowerMenuOpen: false }))} />
      )}
    </div>
  );
};

export default App;
