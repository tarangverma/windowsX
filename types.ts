
export type AppCategory = 'productivity' | 'development' | 'social' | 'system' | 'creative';

export interface AppItem {
  id: string;
  name: string;
  icon: string;
  category: AppCategory;
  isPinned: boolean;
  command?: string;
  color?: string;
}

export type MenuPosition = 'left' | 'center';
export type StartMenuView = 'pinned' | 'allApps';
export type SystemStatus = 'running' | 'locked' | 'off';

export interface MenuState {
  isOpen: boolean;
  searchQuery: string;
  selectedIndex: number;
  position: MenuPosition;
  showDebug: boolean;
  view: StartMenuView;
  isPowerMenuOpen: boolean;
}

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}
