
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Layers, MapPin, Users, Calendar, Trash2, Edit2, BarChart3, AlertCircle } from 'lucide-react';
import { Lot, Animal } from '../types';
import Pagination from './Pagination';

interface LotViewProps {
  lots: Lot[];
  animals: Animal[];
  onAddClick: () => void;
  onEditClick: (lot: Lot) => void;
  onDeleteClick: (id: string) => void;
}

const ITEMS_PER_PAGE = 12;

const LotView: React.FC<LotViewProps> = ({ lots, animals, onAddClick, onEditClick, onDeleteClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPiquete, setFilterPiquete] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterPiquete]);

  const getAnimalCount = (lotName: string) => {
    return animals.filter(a => a.lote === lotName).length;
  };

  const getCapacityColor = (current: number, max: number) => {
    if(max === 0) return 'bg-emerald-500';
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getCapacityText = (current: number, max: number) => {
    if(max === 0) return 'text-slate-400';
    const percentage = (current / max) * 100;
    if (percentage >= 100) return 'text-red-400';
    if (percentage >= 75) return 'text-amber-400';
    return 'text-slate-400';
  };

  const uniquePiquetes = Array.from(new Set(lots.map(l => l.piquete)));

  const filteredLots = lots.filter(lot => {
    const matchesSearch = lot.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPiquete = filterPiquete === 'Todos' || lot.piquete === filterPiquete;
    return matchesSearch && matchesPiquete;
  });

  // Pagination Logic
  const totalItems = filteredLots.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const currentData = filteredLots.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const formatDate = (date: string) => {
      if(!date) return '-';
      return new Date(date).toLocaleDateString('pt-BR');
  }

  const animalsAllocated = animals.filter(a => a.lote && a.lote !== '-').length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500 border border-indigo-500/20">
            <Layers size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase font-bold">Total de Lotes</p>
            <h3 className="text-2xl font-bold text-white">{lots.length}</h3>
          </div>
        </div>
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/20">
            <Users size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase font-bold">Animais Alocados</p>
            <h3 className="text-2xl font-bold text-white">{animalsAllocated}</h3>
          </div>
        </div>
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase font-bold">Média por Lote</p>
            <h3 className="text-2xl font-bold text-white">
              {lots.length > 0 ? Math.round(animalsAllocated / lots.length) : 0}
            </h3>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar lote..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          
          <div className="relative min-w-[160px]">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
            <select 
              value={filterPiquete}
              onChange={(e) => setFilterPiquete(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-2.5 pl-10 pr-8 text-slate-300 appearance-none focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="Todos">Todos Piquetes</option>
              {uniquePiquetes.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <Filter size={14} />
            </div>
          </div>
        </div>

        <button 
          onClick={onAddClick}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/40"
        >
          <Plus size={18} />
          <span className="text-sm font-bold">Novo Lote</span>
        </button>
      </div>

      {/* Grid View for Lots */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {currentData.map((lot) => {
          const animalCount = getAnimalCount(lot.nome);
          const occupancyPercent = lot.capacidade > 0 ? (animalCount / lot.capacidade) * 100 : 0;
          
          return (
            <div key={lot.id} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-slate-600 hover:shadow-xl transition-all duration-300 group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">{lot.nome}</h3>
                    <p className="text-sm text-slate-400">{lot.descricao}</p>
                  </div>
                  <div className="p-2 bg-slate-700 rounded-lg text-slate-300">
                    <Layers size={20} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                    <MapPin size={18} className="text-indigo-400" />
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase">Localização</p>
                      <p className="text-sm text-white font-medium">{lot.piquete}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Users size={14} /> Ocupação
                      </span>
                      <span className={`font-bold ${getCapacityText(animalCount, lot.capacidade)}`}>
                        {animalCount} / {lot.capacidade} animais
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${getCapacityColor(animalCount, lot.capacidade)} transition-all duration-500`}
                        style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                      ></div>
                    </div>
                    {occupancyPercent >= 90 && (
                      <div className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
                        <AlertCircle size={12} />
                        <span>Lote próximo da capacidade máxima</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-700/50">
                    <Calendar size={12} />
                    Formado em: {formatDate(lot.dataFormacao)}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-700/50 flex justify-between items-center">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {lot.status}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onEditClick(lot)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => onDeleteClick(lot.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredLots.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-800/30 rounded-2xl border border-slate-700/50 text-slate-500">
          <Layers size={48} className="mb-4 opacity-50" />
          <p className="text-lg font-medium">Nenhum lote encontrado</p>
          <p className="text-sm">Tente ajustar os filtros ou crie um novo lote.</p>
        </div>
      )}

      {/* Pagination Control */}
      {filteredLots.length > 0 && (
         <Pagination 
           currentPage={currentPage}
           totalPages={totalPages}
           onPageChange={setCurrentPage}
           totalItems={totalItems}
           itemsPerPage={ITEMS_PER_PAGE}
         />
      )}
    </div>
  );
};

export default LotView;
