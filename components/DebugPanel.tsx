
import React from 'react';
import { MenuState, AppItem } from '../types';

interface DebugPanelProps {
  state: MenuState;
  resultsCount: number;
  pinnedCount: number;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ state, resultsCount, pinnedCount }) => {
  return (
    <div className="fixed top-4 right-4 w-64 bg-slate-900/90 border border-slate-700 rounded-lg p-4 text-xs font-mono text-slate-300 shadow-2xl backdrop-blur-md z-[100]">
      <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-2">
        <span className="text-blue-400 font-bold uppercase tracking-wider">Internal State</span>
        <span className="bg-blue-900/40 text-blue-300 px-1 rounded">DevMode</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-slate-500">Menu Open:</span>
          <span className={state.isOpen ? "text-green-400" : "text-red-400"}>{state.isOpen.toString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Position:</span>
          <span className="text-yellow-400">{state.position}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-500">Query:</span>
          <span className="text-blue-300 truncate">"{state.searchQuery || '(empty)'}"</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Active Index:</span>
          <span className="text-purple-400">{state.selectedIndex}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Matches:</span>
          <span className="text-green-400">{resultsCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Pinned:</span>
          <span className="text-indigo-400">{pinnedCount}</span>
        </div>
        
        <div className="mt-4 pt-2 border-t border-slate-700">
          <p className="text-[10px] text-slate-500 italic">No async dependencies active.</p>
          <p className="text-[10px] text-slate-500 italic">DOM nodes: ~{30 + resultsCount}</p>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
