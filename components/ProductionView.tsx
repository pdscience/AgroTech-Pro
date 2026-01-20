
import React, { useState, useMemo } from 'react';
import { Plus, Filter, Milk, Baby, Calendar, TrendingUp, Droplets, ArrowUpRight, CalendarRange, Edit2, Trash2, Weight, Ruler } from 'lucide-react';
import { MilkProductionRecord, BirthRecord } from '../types';
import Pagination from './Pagination';

interface ProductionViewProps {
  milkRecords: MilkProductionRecord[];
  birthRecords: BirthRecord[];
  onAddMilkClick: () => void;
  onAddBirthClick: () => void;
  onEditMilkClick: (record: MilkProductionRecord) => void;
  onEditBirthClick: (record: BirthRecord) => void;
  onDeleteMilkClick: (id: string) => void;
  onDeleteBirthClick: (id: string) => void;
}

const ITEMS_PER_PAGE = 12;

const ProductionView: React.FC<ProductionViewProps> = ({ 
  milkRecords,
  birthRecords,
  onAddMilkClick, 
  onAddBirthClick,
  onEditMilkClick,
  onEditBirthClick,
  onDeleteMilkClick,
  onDeleteBirthClick
}) => {
  const [activeTab, setActiveTab] = useState<'leite' | 'nascimentos'>('leite');
  
  // Date Filters
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(lastDayOfMonth);

  // Pagination States
  const [milkPage, setMilkPage] = useState(1);
  const [birthPage, setBirthPage] = useState(1);

  // Helper to parse ISO strings or DD/MM/YYYY
  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
    }
    return new Date(dateStr);
  };
  
  const formatDate = (dateStr: string) => {
      if(!dateStr) return '-';
      return parseDate(dateStr).toLocaleDateString('pt-BR');
  }

  // KPI Calculations
  const stats = useMemo(() => {
    const now = new Date();
    
    // Monthly Total (Current Month)
    const currentMonthTotal = milkRecords
      .filter(r => {
        const d = parseDate(r.data);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((acc, curr) => acc + curr.litros, 0);

    // Weekly Total (Last 7 days)
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    
    const weeklyTotal = milkRecords
      .filter(r => {
        const d = parseDate(r.data);
        return d >= oneWeekAgo && d <= now;
      })
      .reduce((acc, curr) => acc + curr.litros, 0);
      
    // Averages
    const avgFat = milkRecords.length > 0 
        ? (milkRecords.reduce((acc, curr) => acc + (curr.gordura || 0), 0) / milkRecords.length).toFixed(2)
        : '0.00';

    return { currentMonthTotal, weeklyTotal, avgFat };
  }, [milkRecords]);

  // Filtered List based on Date Range
  const filteredMilkRecords = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Set end date to end of day
    end.setHours(23, 59, 59, 999);

    return milkRecords.filter(r => {
      const d = parseDate(r.data);
      return d >= start && d <= end;
    });
  }, [milkRecords, startDate, endDate]);

  // Pagination Logic Helper
  // Fix: changed arrow function to a named function to ensure proper type inference and avoid TSX generic ambiguity
  function getPaginatedData<T>(data: T[], page: number) {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const paginatedItems = data.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    return { paginatedItems, totalPages, totalItems };
  }

  const milkPagination = getPaginatedData(filteredMilkRecords, milkPage);
  const birthPagination = getPaginatedData(birthRecords, birthPage);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Tabs */}
      <div className="flex p-1 bg-slate-800/80 rounded-xl border border-slate-700 w-fit">
        <button
          onClick={() => setActiveTab('leite')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'leite' 
              ? 'bg-indigo-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <Milk size={18} />
          Produção de Leite
        </button>
        <button
          onClick={() => setActiveTab('nascimentos')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'nascimentos' 
              ? 'bg-emerald-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <Baby size={18} />
          Nascimentos
        </button>
      </div>

      {activeTab === 'leite' ? (
        <>
          {/* Milk Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-xs uppercase font-bold">Média Diária (7d)</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{(stats.weeklyTotal / 7).toFixed(0)} L</h3>
                </div>
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs text-emerald-400">
                <ArrowUpRight size={14} className="mr-1" /> Calculado Auto
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg">
               <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-xs uppercase font-bold">Gordura Média</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{stats.avgFat}%</h3>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                  <Droplets size={20} />
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs text-slate-500">
                Geral
              </div>
            </div>

            {/* KPI Cards */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg">
               <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-xs uppercase font-bold">Total Mensal</p>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    {stats.currentMonthTotal.toLocaleString('pt-BR')} L
                  </h3>
                </div>
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                  <CalendarRange size={20} />
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs text-slate-400">
                Este Mês
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg">
               <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-xs uppercase font-bold">Total Semanal</p>
                  <h3 className="text-2xl font-bold text-white mt-1">
                     {stats.weeklyTotal.toLocaleString('pt-BR')} L
                  </h3>
                </div>
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                  <Calendar size={20} />
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs text-slate-400">
                Últimos 7 dias
              </div>
            </div>
          </div>

          {/* Action and Filter Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
               <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Filter size={16} />
                  <span className="font-semibold">Filtrar Período:</span>
               </div>
               <div className="flex items-center gap-2 w-full sm:w-auto">
                 <input 
                   type="date" 
                   value={startDate}
                   onChange={(e) => setStartDate(e.target.value)}
                   className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                 />
                 <span className="text-slate-500">até</span>
                 <input 
                   type="date" 
                   value={endDate}
                   onChange={(e) => setEndDate(e.target.value)}
                   className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                 />
               </div>
             </div>
             
             <button 
                onClick={onAddMilkClick}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/40"
              >
                <Plus size={18} />
                <span className="text-sm font-bold">Lançar Produção</span>
              </button>
          </div>

          {/* Milk Table */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl shadow-xl overflow-hidden p-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold border-b border-slate-700">Data</th>
                    <th className="p-4 font-semibold border-b border-slate-700">Litros</th>
                    <th className="p-4 font-semibold border-b border-slate-700">Período</th>
                    <th className="p-4 font-semibold border-b border-slate-700">Gordura</th>
                    <th className="p-4 font-semibold border-b border-slate-700">Proteína</th>
                    <th className="p-4 font-semibold border-b border-slate-700">CCS</th>
                    <th className="p-4 font-semibold border-b border-slate-700 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                   {milkPagination.paginatedItems.length > 0 ? (
                     milkPagination.paginatedItems.map((record) => (
                       <tr key={record.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="p-4 text-slate-300 font-medium">{formatDate(record.data)}</td>
                          <td className="p-4 text-white font-bold">{record.litros} L</td>
                          <td className="p-4 text-slate-400 text-sm">{record.periodo}</td>
                          <td className="p-4 text-slate-300">{record.gordura || '-'}%</td>
                          <td className="p-4 text-slate-300">{record.proteina || '-'}%</td>
                          <td className="p-4">
                             <span className={`text-xs font-bold px-2 py-1 rounded ${record.ccs && record.ccs < 300 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                {record.ccs || '-'}
                             </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => onEditMilkClick(record)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"><Edit2 size={16} /></button>
                              <button onClick={() => onDeleteMilkClick(record.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg"><Trash2 size={16} /></button>
                            </div>
                          </td>
                       </tr>
                     ))
                   ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          Nenhum registro encontrado neste período.
                        </td>
                      </tr>
                   )}
                </tbody>
              </table>
            </div>

            {/* Pagination Control */}
            <div className="px-6 pb-6">
              <Pagination 
                currentPage={milkPage}
                totalPages={milkPagination.totalPages}
                onPageChange={setMilkPage}
                totalItems={milkPagination.totalItems}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Birth Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/20">
                <Baby size={24} />
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase font-bold">Nascimentos (Total)</p>
                <h3 className="text-2xl font-bold text-white">{birthRecords.length}</h3>
              </div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg flex items-center gap-4">
              <div className="p-3 bg-pink-500/10 rounded-xl text-pink-500 border border-pink-500/20">
                <Weight size={24} />
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase font-bold">Peso Médio</p>
                <h3 className="text-2xl font-bold text-white">
                    {birthRecords.length > 0 
                        ? (birthRecords.reduce((acc, curr) => acc + curr.pesoNascimento, 0) / birthRecords.length).toFixed(1)
                        : 0
                    } kg
                </h3>
              </div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20">
                <Ruler size={24} />
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase font-bold">Partos Auxiliados</p>
                <h3 className="text-2xl font-bold text-white">
                    {birthRecords.filter(b => b.partoTipo !== 'Natural').length}
                </h3>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex justify-between items-center bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
             <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Calendar size={16} />
                <span>Últimos Nascimentos</span>
             </div>
             <button 
                onClick={onAddBirthClick}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/40"
              >
                <Plus size={18} />
                <span className="text-sm font-bold">Registrar Nascimento</span>
              </button>
          </div>

          {/* Birth Table */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl shadow-xl overflow-hidden p-1">
             <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold border-b border-slate-700">Data</th>
                    <th className="p-4 font-semibold border-b border-slate-700">Bezerro</th>
                    <th className="p-4 font-semibold border-b border-slate-700">Mãe</th>
                    <th className="p-4 font-semibold border-b border-slate-700">Sexo</th>
                    <th className="p-4 font-semibold border-b border-slate-700">Peso</th>
                    <th className="p-4 font-semibold border-b border-slate-700">Tipo Parto</th>
                    <th className="p-4 font-semibold border-b border-slate-700 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                   {birthPagination.paginatedItems.map((record) => (
                     <tr key={record.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="p-4 text-slate-300 font-medium">{formatDate(record.data)}</td>
                        <td className="p-4 text-white font-bold">{record.bezerroBrinco}</td>
                        <td className="p-4 text-slate-300">{record.maeBrinco}</td>
                        <td className="p-4">
                           <span className={`px-2 py-1 rounded text-xs font-bold border ${record.sexo === 'Fêmea' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                             {record.sexo}
                           </span>
                        </td>
                        <td className="p-4 text-slate-300">{record.pesoNascimento} kg</td>
                        <td className="p-4 text-slate-300 text-sm">{record.partoTipo}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => onEditBirthClick(record)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"><Edit2 size={16} /></button>
                            <button onClick={() => onDeleteBirthClick(record.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg"><Trash2 size={16} /></button>
                          </div>
                        </td>
                     </tr>
                   ))}
                   {birthPagination.paginatedItems.length === 0 && (
                       <tr><td colSpan={7} className="p-8 text-center text-slate-500">Nenhum nascimento registrado.</td></tr>
                   )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Control */}
            <div className="px-6 pb-6">
              <Pagination 
                currentPage={birthPage}
                totalPages={birthPagination.totalPages}
                onPageChange={setBirthPage}
                totalItems={birthPagination.totalItems}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default ProductionView;
