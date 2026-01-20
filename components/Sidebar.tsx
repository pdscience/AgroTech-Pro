
import React from 'react';
import { 
  LayoutDashboard, 
  Beef, 
  Syringe, 
  Map, 
  Layers, 
  Activity, 
  Milk, 
  Tractor,
  Home
} from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  activeView: ViewState;
  setActiveView: (view: ViewState) => void;
  propertyName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, propertyName }) => {
  const menuItems: { id: ViewState; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'propriedade', label: 'Propriedade', icon: <Home size={20} /> },
    { id: 'gado', label: 'Gado', icon: <Beef size={20} /> },
    { id: 'vacinas', label: 'Vacinas', icon: <Syringe size={20} /> },
    { id: 'piquetes', label: 'Piquetes', icon: <Map size={20} /> },
    { id: 'lotes', label: 'Lotes', icon: <Layers size={20} /> },
    { id: 'saude', label: 'Saúde', icon: <Activity size={20} /> },
    { id: 'producao', label: 'Produção', icon: <Milk size={20} /> },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-700/50 flex flex-col h-full fixed left-0 top-0 z-10 shadow-xl">
      <div className="p-6 flex flex-col items-center border-b border-slate-700/50 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-3 border border-emerald-500/30 text-emerald-400">
          <Tractor size={28} />
        </div>
        <h1 className="text-xl font-bold text-white tracking-wide">AgroTech</h1>
        <p className="text-xs text-emerald-400 font-medium tracking-widest mt-1">GESTÃO RURAL</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
              activeView === item.id
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-900/50'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className={`${activeView === item.id ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400'}`}>
              {item.icon}
            </span>
            <span className="font-medium text-sm">{item.label}</span>
            {activeView === item.id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
        <div className="bg-slate-800 rounded-lg p-3 flex items-center gap-3 border border-slate-700">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
            {propertyName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-semibold text-white truncate max-w-[120px]">{propertyName}</p>
            <p className="text-[10px] text-emerald-400">Plano Premium</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
