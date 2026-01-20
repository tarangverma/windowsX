
import React from 'react';
import { 
  Globe, Terminal, Folder, Code, Settings, Music, 
  Calculator, Calendar, Camera, Clock, Mail, 
  FileText, Palette, Image, Video, ShoppingBag, 
  Activity, Cpu, MessageSquare, Chrome, Search,
  X, Pin, Power, Lock, RotateCcw, LogOut, ArrowRight,
  ChevronRight, Maximize2, Minimize2
} from 'lucide-react';

const icons = {
  Globe, Terminal, Folder, Code, Settings, Music, 
  Calculator, Calendar, Camera, Clock, Mail, 
  FileText, Palette, Image, Video, ShoppingBag, 
  Activity, Cpu, MessageSquare, Chrome, Search,
  X, Pin, Power, Lock, RotateCcw, LogOut, ArrowRight,
  ChevronRight, Maximize2, Minimize2
};

export type IconName = keyof typeof icons;

interface IconRendererProps {
  name: string;
  size?: number;
  className?: string;
}

const IconRenderer: React.FC<IconRendererProps> = ({ name, size = 20, className }) => {
  const IconComponent = icons[name as IconName] || Globe;
  return <IconComponent size={size} className={className} />;
};

export default IconRenderer;
