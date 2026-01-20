
import React from 'react';
import { AppItem } from '../types';
import IconRenderer from './IconRenderer';

interface AppGridProps {
  apps: AppItem[];
  onTogglePin: (id: string) => void;
  onLaunch: (app: AppItem) => void;
}

const AppGrid: React.FC<AppGridProps> = ({ apps, onTogglePin, onLaunch }) => {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-1 overflow-y-auto max-h-[360px]">
      {apps.map((app) => (
        <div
          key={app.id}
          className="group relative flex flex-col items-center justify-center p-2 rounded-lg hover:bg-slate-700/50 transition-all duration-75"
        >
          <button
            onClick={() => onLaunch(app)}
            className="flex flex-col items-center justify-center w-full"
          >
            <div className="w-10 h-10 flex items-center justify-center bg-slate-800 rounded-xl group-hover:scale-110 transition-transform duration-100 shadow-md">
              <IconRenderer name={app.icon} className="text-slate-200 group-hover:text-blue-400" />
            </div>
            <span className="mt-2 text-[11px] font-medium text-slate-300 group-hover:text-white truncate w-full text-center">
              {app.name}
            </span>
          </button>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(app.id);
            }}
            className={`absolute top-1 right-1 p-1 rounded-md transition-all duration-100 ${
              app.isPinned ? 'opacity-100 text-blue-400' : 'opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white bg-slate-800/50'
            }`}
            title={app.isPinned ? "Unpin from Start" : "Pin to Start"}
          >
            <IconRenderer name="Pin" size={10} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AppGrid;
