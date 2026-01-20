
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Calendar, Syringe, AlertTriangle, CheckCircle, Trash2, Edit2, MapPin, Layers, Clock, Activity } from 'lucide-react';
import { VaccineRecord } from '../types';
import Pagination from './Pagination';

interface VaccineViewProps {
  vaccines: VaccineRecord[];
  onAddClick: () => void;
  onEditClick: (vaccine: VaccineRecord) => void;
  onDeleteClick: (id: string) => void;
}

const ITEMS_PER_PAGE = 12;

const VaccineView: React.FC<VaccineViewProps> = ({ vaccines, onAddClick, onEditClick, onDeleteClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLote, setFilterLote] = useState('Todos');
  const [filterPiquete, setFilterPiquete] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterTipo, setFilterTipo] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterLote, filterPiquete, filterStatus, filterTipo]);

  const isUpcoming = (dateString: string) => {
    try {
      if(!dateString) return false;
      const doseDate = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const diffTime = doseDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Return true if within next 7 days (including today)
      return diffDays >= 0 && diffDays <= 7;
    } catch (e) {
      return false;
    }
  };

  const filteredVaccines = vaccines.filter(vaccine => {
    const matchesSearch = 
      vaccine.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      vaccine.alvo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vaccine.veterinario.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLote = filterLote === 'Todos' || (vaccine.lote || 'N/A') === filterLote;
    const matchesPiquete = filterPiquete === 'Todos' || (vaccine.piquete || 'N/A') === filterPiquete;
    const matchesStatus = filterStatus === 'Todos' || vaccine.status === filterStatus;
    const matchesTipo = filterTipo === 'Todos' || vaccine.nome === filterTipo;

    return matchesSearch && matchesLote && matchesPiquete && matchesStatus && matchesTipo;
  });

  // Pagination Logic
  const totalItems = filteredVaccines.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const currentData = filteredVaccines.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Calculate counts
  const upcomingCount = vaccines.filter(v => isUpcoming(v.proximaDose)).length;
  const delayedCount = vaccines.filter(v => v.status === 'Atrasada').length;
  const okCount = vaccines.filter(v => v.status === 'Em Dia').length;

  // Get unique values for dropdowns
  const uniqueLotes = Array.from(new Set(vaccines.map(v => v.lote || 'N/A').filter(Boolean)));
  const uniquePiquetes = Array.from(new Set(vaccines.map(v => v.piquete || 'N/A').filter(Boolean)));
  const uniqueNomes = Array.from(new Set(vaccines.map(v => v.nome).filter(Boolean)));

  const formatDate = (isoString: string) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/20">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase font-bold">Em Dia</p>
            <h3 className="text-2xl font-bold text-white">{okCount}</h3>
          </div>
        </div>
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase font-bold">Próximas (7 dias)</p>
            <h3 className="text-2xl font-bold text-white">{upcomingCount}</h3>
          </div>
        </div>
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-xl text-red-500 border border-red-500/20">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase font-bold">Atrasadas</p>
            <h3 className="text-2xl font-bold text-white">{delayedCount}</h3>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar vacina, alvo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <div className="relative min-w-[140px]">
              <Syringe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
              <select 
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-2.5 pl-10 pr-8 text-slate-300 appearance-none focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Todos">Todos Tipos</option>
                {uniqueNomes.map(nome => <option key={nome} value={nome}>{nome}</option>)}
              </select>
            </div>

            <div className="relative min-w-[140px]">
              <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-2.5 pl-10 pr-8 text-slate-300 appearance-none focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Todos">Todos Status</option>
                <option value="Em Dia">Em Dia</option>
                <option value="Vencendo">Vencendo</option>
                <option value="Atrasada">Atrasada</option>
              </select>
            </div>

            <div className="relative min-w-[140px]">
              <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
              <select 
                value={filterLote}
                onChange={(e) => setFilterLote(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-2.5 pl-10 pr-8 text-slate-300 appearance-none focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Todos">Todos Lotes</option>
                {uniqueLotes.map(lote => <option key={lote} value={lote}>{lote}</option>)}
              </select>
            </div>

            <div className="relative min-w-[140px]">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
              <select 
                value={filterPiquete}
                onChange={(e) => setFilterPiquete(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-2.5 pl-10 pr-8 text-slate-300 appearance-none focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Todos">Todos Piquetes</option>
                {uniquePiquetes.map(piquete => <option key={piquete} value={piquete}>{piquete}</option>)}
              </select>
            </div>
          </div>
        </div>

        <button 
          onClick={onAddClick}
          className="w-full xl:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/40"
        >
          <Plus size={18} />
          <span className="text-sm font-bold">Nova Vacinação</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl shadow-xl overflow-hidden p-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-slate-700">Vacina</th>
                <th className="p-4 font-semibold border-b border-slate-700">Alvo / Lote</th>
                <th className="p-4 font-semibold border-b border-slate-700">Aplicação</th>
                <th className="p-4 font-semibold border-b border-slate-700">Próxima Dose</th>
                <th className="p-4 font-semibold border-b border-slate-700">Veterinário</th>
                <th className="p-4 font-semibold border-b border-slate-700">Status</th>
                <th className="p-4 font-semibold border-b border-slate-700 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {currentData.length > 0 ? (
                currentData.map((vaccine) => (
                  <tr key={vaccine.id} className="hover:bg-slate-700/30 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-700 rounded-lg text-emerald-400">
                          <Syringe size={18} />
                        </div>
                        <span className="font-medium text-white">{vaccine.nome}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-slate-200 text-sm">{vaccine.alvo}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                           {vaccine.lote && <span className="bg-slate-700 px-1.5 rounded">{vaccine.lote}</span>}
                           {vaccine.piquete && <span className="bg-slate-700 px-1.5 rounded">{vaccine.piquete}</span>}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-500" />
                        {formatDate(vaccine.dataAplicacao)}
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">
                      <div className="flex items-center gap-2">
                         <Calendar size={14} className="text-slate-500" />
                         <span className={isUpcoming(vaccine.proximaDose) ? "text-amber-400 font-bold" : ""}>
                           {formatDate(vaccine.proximaDose)}
                         </span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300 text-sm">{vaccine.veterinario}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          vaccine.status === 'Em Dia' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : vaccine.status === 'Atrasada'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {vaccine.status}
                        </span>
                        {isUpcoming(vaccine.proximaDose) && (
                          <div className="group relative">
                             <AlertTriangle size={18} className="text-amber-500 animate-pulse cursor-help" />
                             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-slate-900 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap border border-slate-700 pointer-events-none z-10">
                               Vence em {formatDate(vaccine.proximaDose)}
                             </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => onEditClick(vaccine)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => onDeleteClick(vaccine.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Nenhuma vacina encontrada com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Control */}
        <div className="px-6 pb-6">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      </div>
    </div>
  );
};

export default VaccineView;
