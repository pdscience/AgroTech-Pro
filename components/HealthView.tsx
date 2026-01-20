
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Activity, HeartPulse, AlertTriangle, Stethoscope, CheckCircle, Trash2, Edit2, Calendar, DollarSign } from 'lucide-react';
import { HealthRecord } from '../types';
import Pagination from './Pagination';

interface HealthViewProps {
  records: HealthRecord[];
  onAddClick: () => void;
  onEditClick: (record: HealthRecord) => void;
  onDeleteClick: (id: string) => void;
}

const ITEMS_PER_PAGE = 12;

const HealthView: React.FC<HealthViewProps> = ({ records, onAddClick, onEditClick, onDeleteClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterTipo, setFilterTipo] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterTipo]);

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      (record.animalBrinco || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (record.diagnostico || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'Todos' || record.status === filterStatus;
    const matchesTipo = filterTipo === 'Todos' || record.tipo === filterTipo;

    return matchesSearch && matchesStatus && matchesTipo;
  });

  // Pagination Logic
  const totalItems = filteredRecords.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const currentData = filteredRecords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Tratamento': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Recuperado': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Observação': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Óbito': return 'bg-slate-700 text-slate-300 border-slate-600';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('pt-BR');
  };
  
  const totalCost = records.reduce((acc, curr) => acc + (curr.custo || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-xl text-red-500 border border-red-500/20">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase font-bold">Em Tratamento</p>
            <h3 className="text-2xl font-bold text-white">{records.filter(r => r.status === 'Em Tratamento').length}</h3>
          </div>
        </div>
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20">
            <HeartPulse size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase font-bold">Em Observação</p>
            <h3 className="text-2xl font-bold text-white">{records.filter(r => r.status === 'Observação').length}</h3>
          </div>
        </div>
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/20">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase font-bold">Total Recuperados</p>
            <h3 className="text-2xl font-bold text-white">{records.filter(r => r.status === 'Recuperado').length}</h3>
          </div>
        </div>
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase font-bold">Custo Sanitário</p>
            <h3 className="text-2xl font-bold text-white">R$ {totalCost.toLocaleString('pt-BR')}</h3>
          </div>
        </div>
      </div>

      {/* Actions & Filters */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por brinco ou diagnóstico..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
            <div className="relative min-w-[140px]">
              <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-2.5 pl-10 pr-8 text-slate-300 appearance-none focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Todos">Todos Status</option>
                <option value="Em Tratamento">Em Tratamento</option>
                <option value="Observação">Observação</option>
                <option value="Recuperado">Recuperado</option>
                <option value="Óbito">Óbito</option>
              </select>
            </div>

            <div className="relative min-w-[140px]">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
              <select 
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-2.5 pl-10 pr-8 text-slate-300 appearance-none focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Todos">Todos Tipos</option>
                <option value="Doença">Doença</option>
                <option value="Lesão">Lesão</option>
                <option value="Parto">Parto</option>
                <option value="Exame">Exame</option>
              </select>
            </div>
          </div>
        </div>

        <button 
          onClick={onAddClick}
          className="w-full xl:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/40"
        >
          <Plus size={18} />
          <span className="text-sm font-bold">Novo Registro</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl shadow-xl overflow-hidden p-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-slate-700">Data</th>
                <th className="p-4 font-semibold border-b border-slate-700">Animal</th>
                <th className="p-4 font-semibold border-b border-slate-700">Tipo / Diagnóstico</th>
                <th className="p-4 font-semibold border-b border-slate-700">Tratamento</th>
                <th className="p-4 font-semibold border-b border-slate-700">Veterinário</th>
                <th className="p-4 font-semibold border-b border-slate-700">Status</th>
                <th className="p-4 font-semibold border-b border-slate-700 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {currentData.length > 0 ? (
                currentData.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 text-slate-300 whitespace-nowrap">
                       <div className="flex items-center gap-2">
                         <Calendar size={14} className="text-slate-500" />
                         {formatDate(record.data)}
                       </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono font-medium text-white bg-slate-700 px-2 py-1 rounded text-sm">
                        {record.animalBrinco}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="flex items-center gap-2">
                           {record.tipo === 'Doença' && <Activity size={14} className="text-red-400" />}
                           {record.tipo === 'Lesão' && <AlertTriangle size={14} className="text-amber-400" />}
                           {record.tipo === 'Parto' && <HeartPulse size={14} className="text-pink-400" />}
                           {record.tipo === 'Exame' && <Stethoscope size={14} className="text-blue-400" />}
                           <span className="text-white font-medium">{record.tipo}</span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{record.diagnostico}</p>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300 text-sm max-w-xs truncate" title={record.tratamento}>
                      {record.tratamento}
                    </td>
                    <td className="p-4 text-slate-300 text-sm">{record.veterinario}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => onEditClick(record)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => onDeleteClick(record.id)}
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
                    Nenhum registro encontrado.
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

export default HealthView;
