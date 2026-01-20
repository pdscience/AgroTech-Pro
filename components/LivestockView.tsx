
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreHorizontal, ArrowLeft, Scale, TrendingUp, Calendar, History, ChevronDown, ChevronUp, MapPin, Layers, Clock, FileText, Beef } from 'lucide-react';
import { Animal } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Pagination from './Pagination';

interface LivestockViewProps {
  animals: Animal[];
  onAddClick: () => void;
  onEditClick: (animal: Animal) => void;
  onWeighingClick: (animal: Animal) => void;
}

const ITEMS_PER_PAGE = 12;

const LivestockView: React.FC<LivestockViewProps> = ({ animals, onAddClick, onEditClick, onWeighingClick }) => {
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [expandedAnimalId, setExpandedAnimalId] = useState<string | null>(null);
  
  // Filtering and Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRaca, setFilterRaca] = useState('Todos');
  const [filterLote, setFilterLote] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);

  // Update selected animal if it changes in the parent (e.g., after weighing)
  useEffect(() => {
    if (selectedAnimal) {
      const updated = animals.find(a => a.id === selectedAnimal.id);
      if (updated) {
        setSelectedAnimal(updated);
      }
    }
  }, [animals, selectedAnimal]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRaca, filterLote]);

  const toggleExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (expandedAnimalId === id) {
      setExpandedAnimalId(null);
    } else {
      setExpandedAnimalId(id);
    }
  };

  // Filter Logic
  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = 
      animal.brinco.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.lote.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRaca = filterRaca === 'Todos' || animal.raca === filterRaca;
    const matchesLote = filterLote === 'Todos' || animal.lote === filterLote;

    return matchesSearch && matchesRaca && matchesLote;
  });

  // Get unique values for dropdowns
  const uniqueRacas = Array.from(new Set(animals.map(a => a.raca).filter(Boolean))).sort();
  const uniqueLotes = Array.from(new Set(animals.map(a => a.lote).filter(Boolean))).sort();

  // Pagination Logic
  const totalItems = filteredAnimals.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const currentData = filteredAnimals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (selectedAnimal) {
    const weightHistory = selectedAnimal.historicoPeso || [];
    
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <button 
          onClick={() => setSelectedAnimal(null)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
        >
          <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 group-hover:bg-slate-700">
            <ArrowLeft size={20} />
          </div>
          <span className="font-medium">Voltar para a lista</span>
        </button>

        {/* Animal Header */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-2xl border-2 border-emerald-500/50 text-emerald-400 font-bold">
                {selectedAnimal.raca.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  {selectedAnimal.brinco}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    selectedAnimal.status === 'Saudável' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : selectedAnimal.status === 'Doente'
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {selectedAnimal.status}
                  </span>
                </h2>
                <p className="text-slate-400 mt-1 flex items-center gap-2">
                  <span>{selectedAnimal.raca}</span> • <span>{selectedAnimal.idade}</span> • <span>{selectedAnimal.lote}</span>
                </p>
              </div>
            </div>
            <div className="flex gap-3">
               <button 
                 onClick={() => onEditClick(selectedAnimal)}
                 className="px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors text-sm font-medium border border-slate-600"
               >
                 Editar Dados
               </button>
               <button 
                 onClick={() => onWeighingClick(selectedAnimal)}
                 className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-colors text-sm font-medium shadow-lg shadow-emerald-900/20"
               >
                 Nova Pesagem
               </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-lg min-w-0">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-400" />
              Evolução de Peso
            </h3>
            <div className="h-[350px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightHistory}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" tick={{fontSize: 12}} axisLine={false} tickLine={false} domain={['dataMin - 20', 'auto']} unit=" kg" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                    itemStyle={{ color: '#34d399' }}
                    formatter={(value) => [`${value} kg`, 'Peso']}
                  />
                  <Area type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* History List */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <History size={20} className="text-slate-400" />
              Histórico
            </h3>
            <div className="space-y-0">
              {weightHistory.slice().reverse().map((record, index) => {
                 // Calculate difference from previous record (which is next in the reversed array)
                 const prevRecord = weightHistory.slice().reverse()[index + 1];
                 const diff = prevRecord ? record.weight - prevRecord.weight : 0;
                 const percent = prevRecord ? ((diff / prevRecord.weight) * 100).toFixed(1) : 0;
                 
                 return (
                  <div key={index} className="flex items-center justify-between p-4 border-b border-slate-700/50 last:border-0 hover:bg-slate-700/20 transition-colors rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400">
                        <Calendar size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{record.date}</p>
                        <p className="text-xs text-slate-500">Pesagem Rotina</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Scale size={14} className="text-slate-500" />
                        <span className="text-lg font-bold text-white">{record.weight} kg</span>
                      </div>
                      {prevRecord && (
                        <p className={`text-xs flex items-center justify-end gap-1 ${diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          <TrendingUp size={10} className={diff < 0 ? 'rotate-180' : ''} />
                          {diff > 0 ? '+' : ''}{diff.toFixed(1)} kg ({percent}%)
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por brinco..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
             <div className="relative min-w-[150px]">
              <Beef className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
              <select 
                value={filterRaca}
                onChange={(e) => setFilterRaca(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-2.5 pl-10 pr-8 text-slate-300 appearance-none focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Todos">Todas Raças</option>
                {uniqueRacas.map(raca => <option key={raca} value={raca}>{raca}</option>)}
              </select>
            </div>

            <div className="relative min-w-[150px]">
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
          </div>
        </div>

        <button 
          onClick={onAddClick}
          className="w-full xl:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/40"
        >
          <Plus size={18} />
          <span className="text-sm font-bold">Novo Animal</span>
        </button>
      </div>

      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl shadow-xl overflow-hidden p-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-slate-700"></th>
                <th className="p-4 font-semibold border-b border-slate-700">Brinco</th>
                <th className="p-4 font-semibold border-b border-slate-700">Raça</th>
                <th className="p-4 font-semibold border-b border-slate-700">Idade</th>
                <th className="p-4 font-semibold border-b border-slate-700">Peso</th>
                <th className="p-4 font-semibold border-b border-slate-700">Lote</th>
                <th className="p-4 font-semibold border-b border-slate-700">Status</th>
                <th className="p-4 font-semibold border-b border-slate-700 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {currentData.map((animal) => (
                <React.Fragment key={animal.id}>
                  <tr 
                    onClick={(e) => toggleExpand(e, animal.id)}
                    className={`hover:bg-slate-700/30 transition-colors group cursor-pointer ${
                      expandedAnimalId === animal.id ? 'bg-slate-700/20' : ''
                    }`}
                  >
                    <td className="p-4 text-slate-500">
                      {expandedAnimalId === animal.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </td>
                    <td className="p-4">
                      <span className="font-mono font-medium text-white bg-slate-700 px-2 py-1 rounded text-sm group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-colors">
                        {animal.brinco}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">{animal.raca}</td>
                    <td className="p-4 text-slate-300">{animal.idade}</td>
                    <td className="p-4 text-slate-300 font-medium">{animal.peso} kg</td>
                    <td className="p-4">
                      <span className="text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md text-xs font-medium border border-indigo-500/20">
                        {animal.lote}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        animal.status === 'Saudável' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : animal.status === 'Doente'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {animal.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-slate-500 hover:text-white p-2 hover:bg-slate-700 rounded-lg transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                  
                  {expandedAnimalId === animal.id && (
                    <tr className="bg-slate-900/30 animate-in fade-in slide-in-from-top-2 duration-200">
                      <td colSpan={8} className="p-0">
                        <div className="p-6 border-b border-slate-700/50">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
                                <Layers size={20} />
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Lote Atual</p>
                                <p className="text-white font-medium">{animal.lote}</p>
                                <p className="text-xs text-slate-400 mt-1">Engorda Intensiva</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                                <MapPin size={20} />
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Localização</p>
                                <p className="text-white font-medium">{animal.piquete}</p>
                                <p className="text-xs text-slate-400 mt-1">Capim Mombaça</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
                                <Clock size={20} />
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Última Atualização</p>
                                <p className="text-white font-medium">{animal.lastUpdate}</p>
                                <p className="text-xs text-slate-400 mt-1">Via App Mobile</p>
                              </div>
                            </div>

                            <div className="flex flex-col justify-center items-end">
                               <button 
                                 onClick={() => setSelectedAnimal(animal)}
                                 className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg border border-slate-600 transition-colors w-full md:w-auto justify-center"
                               >
                                 <FileText size={16} />
                                 Ver Ficha Completa
                               </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
            {/* Total Count Row */}
            <tfoot className="bg-slate-900/50 border-t border-slate-700">
              <tr>
                <td colSpan={8} className="p-4 text-right">
                  <span className="text-slate-400 text-sm font-medium mr-2">Total de Animais Filtrados:</span>
                  <span className="text-white text-lg font-bold">{totalItems}</span>
                </td>
              </tr>
            </tfoot>
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

export default LivestockView;
