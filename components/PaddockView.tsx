
import React from 'react';
import { Map, Users, Leaf, AlertCircle, Edit2, Plus, Trash2 } from 'lucide-react';
import { Paddock } from '../types';

interface PaddockViewProps {
  paddocks: Paddock[];
  onAddClick: () => void;
  onEditClick: (paddock: Paddock) => void;
  // Fix: changed id type from number to string to match the Paddock interface
  onDeleteClick: (id: string) => void;
}

const PaddockView: React.FC<PaddockViewProps> = ({ paddocks, onAddClick, onEditClick, onDeleteClick }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Header / Actions */}
      <div className="flex justify-between items-center bg-slate-800/80 p-4 rounded-2xl border border-slate-700 shadow-sm">
         <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Map size={16} />
            <span className="font-semibold">Gerenciar Pastagens</span>
         </div>
         <button 
            onClick={onAddClick}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/40"
          >
            <Plus size={18} />
            <span className="text-sm font-bold">Novo Piquete</span>
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {paddocks.map((paddock) => {
          const isResting = paddock.status === 'Descanso';
          const isMaintenance = paddock.status === 'Manutenção';
          
          return (
            <div 
              key={paddock.id} 
              className={`relative overflow-hidden rounded-2xl border transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl ${
                isResting 
                  ? 'bg-slate-800/50 border-amber-700/30' 
                  : isMaintenance
                  ? 'bg-slate-800/50 border-red-700/30'
                  : 'bg-slate-800 border-emerald-900/50'
              }`}
            >
              {/* Status Strip */}
              <div className={`h-2 w-full ${
                isResting ? 'bg-amber-500' : isMaintenance ? 'bg-red-500' : 'bg-emerald-500'
              }`} />
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${
                      isResting ? 'bg-amber-500/20 text-amber-400' : isMaintenance ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      <Map size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">{paddock.nome}</h3>
                      <p className="text-slate-400 text-sm">{paddock.area}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      isResting 
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                        : isMaintenance
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {paddock.status}
                    </span>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => onEditClick(paddock)}
                        className="p-1.5 text-slate-500 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-lg transition-colors border border-transparent hover:border-slate-600"
                        title="Editar Piquete"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        // Fix: id is now string, matching the updated onDeleteClick signature
                        onClick={() => onDeleteClick(paddock.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 bg-slate-800/50 hover:bg-slate-700 rounded-lg transition-colors border border-transparent hover:border-slate-600"
                        title="Excluir Piquete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                      <Users size={14} />
                      <span>Lotação</span>
                    </div>
                    <div className="text-white font-semibold text-lg">
                      {paddock.animais} <span className="text-xs font-normal text-slate-500">cabeças</span>
                    </div>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                      <Leaf size={14} />
                      <span>Forragem</span>
                    </div>
                    <div className="text-white font-semibold text-lg truncate">
                      {paddock.capim}
                    </div>
                  </div>
                </div>

                {isResting && (
                  <div className="mt-4 flex items-center gap-2 text-amber-400 text-xs bg-amber-500/10 p-3 rounded-lg border border-amber-500/10">
                    <AlertCircle size={14} />
                    <span>
                      {paddock.dataFimDescanso 
                        ? `Descanso até ${paddock.dataFimDescanso.split('-').reverse().join('/')}` 
                        : 'Em período de descanso'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaddockView;
