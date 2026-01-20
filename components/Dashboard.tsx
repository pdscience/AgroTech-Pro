
import React, { useState, useMemo } from 'react';
import { Beef, Layers, Map, Milk, Activity, Syringe, Calendar } from 'lucide-react';
import StatCard from './StatCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, LabelList } from 'recharts';
import { Animal, Lot, Paddock, MilkProductionRecord, VaccineRecord } from '../types';

interface DashboardProps {
  animals: Animal[];
  lots: Lot[];
  paddocks: Paddock[];
  production: MilkProductionRecord[];
  vaccines: VaccineRecord[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard: React.FC<DashboardProps> = ({ animals, lots, paddocks, production, vaccines }) => {
  const [trendPeriod, setTrendPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [distributionType, setDistributionType] = useState<'lote' | 'piquete'>('lote');

  // --- Calculations ---

  // 1. Production Trend
  const productionData = useMemo(() => {
    // Group production by date
    const grouped = production.reduce((acc, curr) => {
       const date = new Date(curr.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
       acc[date] = (acc[date] || 0) + curr.litros;
       return acc;
    }, {} as Record<string, number>);

    let data = Object.keys(grouped).map(key => ({ name: key, uv: grouped[key] }));
    
    // Sort by date (approximation for dd/mm string)
    data.sort((a, b) => {
        const [da, ma] = a.name.split('/').map(Number);
        const [db, mb] = b.name.split('/').map(Number);
        return ma - mb || da - db;
    });

    if (trendPeriod === 'weekly') return data.slice(-7);
    return data; // simplistic monthly view (all available data sorted)
  }, [production, trendPeriod]);

  // 2. Distribution Data
  const distributionData = useMemo(() => {
    if (distributionType === 'lote') {
       return lots.map(lot => ({
         name: lot.nome,
         value: animals.filter(a => a.lote === lot.nome).length
       }));
    } else {
       return paddocks.map(pad => ({
         name: pad.nome,
         value: animals.filter(a => a.piquete === pad.nome).length
       }));
    }
  }, [animals, lots, paddocks, distributionType]);

  // 3. Vaccine Stats
  const vaccineStats = useMemo(() => {
     // Group vaccines by name/type
     const types = Array.from(new Set(vaccines.map(v => v.nome)));
     return types.map((type, index) => {
       const filtered = vaccines.filter(v => v.nome === type);
       const lastApp = filtered.sort((a, b) => new Date(b.dataAplicacao).getTime() - new Date(a.dataAplicacao).getTime())[0];
       const coverage = animals.length > 0 ? Math.round((filtered.length / animals.length) * 100) : 0; // Simplistic coverage logic
       
       return {
         id: index,
         nome: type,
         aplicadas: filtered.length,
         ultimaAplicacao: lastApp ? new Date(lastApp.dataAplicacao).toLocaleDateString('pt-BR') : '-',
         cobertura: `${Math.min(coverage, 100)}%`
       };
     });
  }, [vaccines, animals]);

  // 4. KPI Values
  const totalLeiteSemana = productionData.slice(-7).reduce((acc, curr) => acc + curr.uv, 0);
  const activePaddocks = paddocks.filter(p => p.status === 'Ativo').length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total de Gado" 
          value={animals.length} 
          subtitle="Animais cadastrados" 
          icon={<Beef size={24} />} 
          color="blue"
        />
        <StatCard 
          title="Quantidade de Lotes" 
          value={lots.length} 
          subtitle={`${lots.filter(l => l.status === 'Ativo').length} ativos`} 
          icon={<Layers size={24} />} 
          color="amber"
        />
        <StatCard 
          title="Piquetes Ativos" 
          value={`${activePaddocks}/${paddocks.length}`} 
          subtitle="Ocupação atual" 
          icon={<Map size={24} />} 
          color="emerald"
        />
        <StatCard 
          title="Produção Leite (L)" 
          value={totalLeiteSemana.toLocaleString('pt-BR')} 
          subtitle="Últimos registros" 
          icon={<Milk size={24} />} 
          color="indigo"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-lg min-w-0">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity size={20} className="text-indigo-400" />
              Tendência de Produção
            </h3>
            <select 
              value={trendPeriod}
              onChange={(e) => setTrendPeriod(e.target.value as 'weekly' | 'monthly')}
              className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg p-2 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="weekly">Recente</option>
              <option value="monthly">Histórico</option>
            </select>
          </div>
          <div className="h-[300px] w-full min-w-0">
             {productionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={productionData}>
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#94a3b8" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                      itemStyle={{ color: '#818cf8' }}
                    />
                    <Area type="monotone" dataKey="uv" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
                  </AreaChart>
                </ResponsiveContainer>
             ) : (
                <div className="h-full flex items-center justify-center text-slate-500">Sem dados de produção</div>
             )}
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-lg min-w-0">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers size={20} className="text-emerald-400" />
              Distribuição
            </h3>
            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
              <button
                onClick={() => setDistributionType('lote')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  distributionType === 'lote' 
                    ? 'bg-emerald-600 text-white shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Lotes
              </button>
              <button
                onClick={() => setDistributionType('piquete')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  distributionType === 'piquete' 
                    ? 'bg-emerald-600 text-white shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Piquetes
              </button>
            </div>
          </div>
          <div className="h-[300px] w-full min-w-0">
             {distributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#94a3b8" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{fill: '#334155', opacity: 0.2}}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                      <LabelList dataKey="value" position="top" fill="white" fontSize={12} fontWeight="bold" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             ) : (
                <div className="h-full flex items-center justify-center text-slate-500">Sem dados de distribuição</div>
             )}
          </div>
        </div>
      </div>

      {/* Vaccine Table Section */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
           <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 border border-amber-500/20">
              <Syringe size={20} />
           </div>
           <h3 className="text-lg font-bold text-white">Relatório de Vacinas Aplicadas</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-slate-700">Tipo de Vacina</th>
                <th className="p-4 font-semibold border-b border-slate-700 text-center">Quantidade Aplicada</th>
                <th className="p-4 font-semibold border-b border-slate-700">Última Aplicação</th>
                <th className="p-4 font-semibold border-b border-slate-700">Cobertura Estimada</th>
                <th className="p-4 font-semibold border-b border-slate-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {vaccineStats.length > 0 ? vaccineStats.map((stat) => (
                <tr key={stat.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="p-4 font-medium text-white">{stat.nome}</td>
                  <td className="p-4 text-center">
                    <span className="bg-slate-700/50 px-3 py-1 rounded-lg text-white font-bold border border-slate-600">
                      {stat.aplicadas}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">
                    <div className="flex items-center gap-2">
                       <Calendar size={14} className="text-slate-500" />
                       {stat.ultimaAplicacao}
                    </div>
                  </td>
                  <td className="p-4 text-slate-300">
                    <div className="w-full max-w-[140px]">
                      <div className="flex justify-between text-xs mb-1">
                        <span>{stat.cobertura}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: stat.cobertura.split('%')[0] + '%' }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-bold px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Ativo
                    </span>
                  </td>
                </tr>
              )) : (
                 <tr>
                   <td colSpan={5} className="p-8 text-center text-slate-500">Nenhum registro de vacina encontrado.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
