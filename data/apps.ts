
import { AppItem } from '../types';

export const INITIAL_APPS: AppItem[] = [
  { id: '1', name: 'Browser', icon: 'Globe', category: 'productivity', isPinned: true },
  { id: '2', name: 'Terminal', icon: 'Terminal', category: 'development', isPinned: true, command: 'wt.exe' },
  { id: '3', name: 'File Explorer', icon: 'Folder', category: 'system', isPinned: true },
  { id: '4', name: 'Code Editor', icon: 'Code', category: 'development', isPinned: true, command: 'code .' },
  { id: '5', name: 'Settings', icon: 'Settings', category: 'system', isPinned: true },
  { id: '6', name: 'Music Player', icon: 'Music', category: 'creative', isPinned: true },
  { id: '7', name: 'Calculator', icon: 'Calculator', category: 'productivity', isPinned: false },
  { id: '8', name: 'Calendar', icon: 'Calendar', category: 'productivity', isPinned: false },
  { id: '9', name: 'Camera', icon: 'Camera', category: 'creative', isPinned: false },
  { id: '10', name: 'Clock', icon: 'Clock', category: 'productivity', isPinned: false },
  { id: '11', name: 'Email', icon: 'Mail', category: 'social', isPinned: false },
  { id: '12', name: 'Notes', icon: 'FileText', category: 'productivity', isPinned: false },
  { id: '13', name: 'Paint', icon: 'Palette', category: 'creative', isPinned: false },
  { id: '14', name: 'Photos', icon: 'Image', category: 'creative', isPinned: false },
  { id: '15', name: 'Video Editor', icon: 'Video', category: 'creative', isPinned: false },
  { id: '16', name: 'App Store', icon: 'ShoppingBag', category: 'system', isPinned: false },
  { id: '17', name: 'Task Manager', icon: 'Activity', category: 'system', isPinned: false },
  { id: '18', name: 'System Monitor', icon: 'Cpu', category: 'system', isPinned: false },
  { id: '19', name: 'Discord', icon: 'MessageSquare', category: 'social', isPinned: false },
  { id: '20', name: 'Chrome', icon: 'Chrome', category: 'productivity', isPinned: false },
];
