
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LivestockView from './components/LivestockView';
import PaddockView from './components/PaddockView';
import VaccineView from './components/VaccineView';
import LotView from './components/LotView';
import HealthView from './components/HealthView';
import ProductionView from './components/ProductionView';
import PropertyView from './components/PropertyView';
import LoginView from './components/LoginView';
import Modal from './components/Modal';
import { ViewState, VaccineRecord, Lot, HealthRecord, MilkProductionRecord, BirthRecord, Property, Paddock, Animal, User } from './types';
import { Bell, LogOut, Loader2, RefreshCw, AlertCircle, WifiOff, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const initialProperty: Property = {
  name: 'Fazenda Bela Vista',
  owner: 'Carlos Oliveira',
  address: 'Rodovia BR-153, Km 45',
  city: 'Goiânia',
  state: 'GO',
  totalArea: 450,
  registrationNumber: 'CAR-GO-12345678',
  activityType: 'Misto',
  foundedYear: '2012'
};

const MOCK_ANIMALS: Animal[] = [
  { id: '1', brinco: 'BR-1001', raca: 'Nelore', idade: '3 anos', dataNascimento: '2021-03-15', peso: 450, lote: 'Engorda 01', piquete: 'Piquete A1', status: 'Saudável', lastUpdate: '10/05/2024', historicoPeso: [{date: 'Jan/24', weight: 410}, {date: 'Mar/24', weight: 435}, {date: 'Mai/24', weight: 450}] },
  { id: '2', brinco: 'BR-1002', raca: 'Nelore', idade: '2 anos', dataNascimento: '2022-06-20', peso: 380, lote: 'Engorda 01', piquete: 'Piquete A1', status: 'Saudável', lastUpdate: '12/05/2024', historicoPeso: [{date: 'Jan/24', weight: 340}, {date: 'Abr/24', weight: 380}] },
  { id: '3', brinco: 'BR-2005', raca: 'Holandês', idade: '4 anos', dataNascimento: '2020-01-10', peso: 520, lote: 'Leite 01', piquete: 'Mombaça 02', status: 'Observação', lastUpdate: '14/05/2024', historicoPeso: [{date: 'Jan/24', weight: 510}, {date: 'Mai/24', weight: 520}] },
];

const MOCK_PADDOCKS: Paddock[] = [
  { id: '1', nome: 'Piquete A1', area: '15 ha', animais: 45, capim: 'Brachiaria', status: 'Ativo' },
  { id: '2', nome: 'Mombaça 02', area: '10 ha', animais: 12, capim: 'Mombaça', status: 'Descanso', dataInicioDescanso: '2024-05-01', dataFimDescanso: '2024-06-01' },
  { id: '3', nome: 'Reserva Sul', area: '50 ha', animais: 0, capim: 'Nativo', status: 'Manutenção' },
];

const MOCK_LOTS: Lot[] = [
  { id: '1', nome: 'Engorda 01', descricao: 'Lote de machos para terminação', piquete: 'Piquete A1', capacidade: 60, dataFormacao: '2024-01-15', status: 'Ativo' },
  { id: '2', nome: 'Leite 01', descricao: 'Vacas em lactação', piquete: 'Mombaça 02', capacidade: 30, dataFormacao: '2023-11-20', status: 'Ativo' },
];

const calculateAge = (dob: string | null) => {
  if (!dob) return '';
  try {
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return '';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age < 0 ? '0 anos' : age === 0 ? '< 1 ano' : `${age} anos`;
  } catch (e) {
    return '';
  }
};

const App: React.FC = () => {
  // Use session storage for user to simulate auth
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('agrotech_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [property, setProperty] = useState<Property>(() => {
    const saved = localStorage.getItem('agrotech_property');
    return saved ? JSON.parse(saved) : initialProperty;
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<string>('');
  
  // Data State with Local Storage fallback
  const [paddocks, setPaddocks] = useState<Paddock[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [vaccines, setVaccines] = useState<VaccineRecord[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [milkRecords, setMilkRecords] = useState<MilkProductionRecord[]>([]);
  const [birthRecords, setBirthRecords] = useState<BirthRecord[]>([]);
  
  const [loadingData, setLoadingData] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const [editingItem, setEditingItem] = useState<any>(null);
  const [tempBirthDate, setTempBirthDate] = useState('');
  const [calculatedAge, setCalculatedAge] = useState('');

  // Persistent Storage Helper
  const saveToLocal = (key: string, data: any) => {
    localStorage.setItem(`agrotech_${key}`, JSON.stringify(data));
  };

  const loadFromLocal = useCallback(() => {
    setLoadingData(true);
    try {
      const getStored = (key: string, fallback: any) => {
        const item = localStorage.getItem(`agrotech_${key}`);
        return item ? JSON.parse(item) : fallback;
      };

      setPaddocks(getStored('paddocks', MOCK_PADDOCKS));
      setAnimals(getStored('animals', MOCK_ANIMALS));
      setVaccines(getStored('vaccines', []));
      setLots(getStored('lots', MOCK_LOTS));
      setHealthRecords(getStored('health_records', []));
      setMilkRecords(getStored('milk_records', []));
      setBirthRecords(getStored('birth_records', []));
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) loadFromLocal();
  }, [currentUser, loadFromLocal]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    saveToLocal('user', user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('agrotech_user');
    setActiveView('dashboard');
  };

  const generateAiInsight = async () => {
    if (!process.env.API_KEY) return;
    setIsAiAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Como um consultor veterinário e gestor rural experiente, analise estes dados da fazenda e forneça 3 insights rápidos e acionáveis:
      - Total de animais: ${animals.length}
      - Lotes ativos: ${lots.length}
      - Produção de leite média: ${milkRecords.length > 0 ? milkRecords[0].litros : 0} L
      - Registros de saúde: ${healthRecords.filter(h => h.status === 'Em Tratamento').length} animais em tratamento.
      Foque em produtividade, sanidade e manejo de pastagens. Responda em português de forma concisa e profissional.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      setAiInsight(response.text);
    } catch (err) {
      console.error('AI Insight failed:', err);
      setAiInsight('Não foi possível gerar insights no momento. Tente novamente mais tarde.');
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleOpenModal = (type: string, item: any = null) => {
    setModalType(type);
    setEditingItem(item);
    setTempBirthDate(item?.dataNascimento || '');
    setCalculatedAge(item?.idade || '');
    setIsModalOpen(true);
  };

  // Generic Save Handler for Local State
  const saveItem = (key: string, state: any[], setState: React.Dispatch<React.SetStateAction<any[]>>, newItem: any) => {
    let updated;
    if (newItem.id) {
      updated = state.map(item => item.id === newItem.id ? newItem : item);
    } else {
      const id = Date.now().toString();
      updated = [...state, { ...newItem, id }];
    }
    setState(updated);
    saveToLocal(key, updated);
    setIsModalOpen(false);
  };

  const handleSaveAnimal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const weight = Number(formData.get('peso'));
    const newItem = {
      id: editingItem?.id,
      brinco: formData.get('brinco'),
      raca: formData.get('raca'),
      peso: weight,
      lote: formData.get('lote'),
      piquete: formData.get('piquete'),
      dataNascimento: formData.get('dataNascimento'),
      idade: calculateAge(formData.get('dataNascimento') as string),
      status: 'Saudável',
      lastUpdate: new Date().toLocaleDateString('pt-BR'),
      historicoPeso: editingItem?.historicoPeso || [{ date: new Date().toLocaleDateString('pt-BR', { month: 'short' }), weight }]
    };
    saveItem('animals', animals, setAnimals, newItem);
  };

  const handleSavePaddock = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newItem = {
      id: editingItem?.id,
      nome: formData.get('nome'),
      area: formData.get('area'),
      status: formData.get('status'),
      capim: formData.get('capim'),
      animais: editingItem?.animais || 0
    };
    saveItem('paddocks', paddocks, setPaddocks, newItem);
  };

  const handleSaveLot = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newItem = {
      id: editingItem?.id,
      nome: formData.get('nome'),
      descricao: formData.get('descricao'),
      piquete: formData.get('piquete'),
      capacidade: Number(formData.get('capacidade')),
      dataFormacao: formData.get('dataFormacao'),
      status: formData.get('status')
    };
    saveItem('lots', lots, setLots, newItem);
  };

  const handleSaveMilk = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newItem = {
      id: editingItem?.id,
      data: formData.get('data'),
      periodo: formData.get('periodo'),
      litros: Number(formData.get('litros')),
      gordura: Number(formData.get('gordura')),
      proteina: Number(formData.get('proteina')),
      ccs: Number(formData.get('ccs')),
      responsavel: formData.get('responsavel')
    };
    saveItem('milk_records', milkRecords, setMilkRecords, newItem);
  };

  const handleDelete = (key: string, state: any[], setState: React.Dispatch<React.SetStateAction<any[]>>, id: string) => {
    if (confirm('Deseja realmente excluir este registro?')) {
      const updated = state.filter(item => item.id !== id);
      setState(updated);
      saveToLocal(key, updated);
    }
  };

  const renderModalContent = () => {
    switch (modalType) {
      case 'gado':
        return (
          <form onSubmit={handleSaveAnimal} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Número do Brinco</label>
              <input name="brinco" defaultValue={editingItem?.brinco} type="text" placeholder="BR-XXXX" className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300">Raça</label>
                <select name="raca" defaultValue={editingItem?.raca} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white">
                  <option>Nelore</option><option>Angus</option><option>Holandês</option><option>Girolando</option><option>Brahman</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300">Peso Atual (kg)</label>
                <input name="peso" defaultValue={editingItem?.peso} type="number" step="0.1" className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300">Data de Nascimento</label>
                <input name="dataNascimento" type="date" value={tempBirthDate} onChange={(e) => {
                  setTempBirthDate(e.target.value);
                  setCalculatedAge(calculateAge(e.target.value));
                }} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white" required />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300">Idade Calculada</label>
                <input type="text" value={calculatedAge} readOnly className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300">Lote</label>
                <select name="lote" defaultValue={editingItem?.lote} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white">
                  <option value="">Selecione...</option>{lots.map(l => <option key={l.id} value={l.nome}>{l.nome}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300">Piquete</label>
                <select name="piquete" defaultValue={editingItem?.piquete} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white">
                  <option value="">Selecione...</option>{paddocks.map(p => <option key={p.id} value={p.nome}>{p.nome}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl mt-4">{editingItem ? 'Salvar Alterações' : 'Salvar Registro'}</button>
          </form>
        );
      case 'paddock':
        return (
          <form onSubmit={handleSavePaddock} className="space-y-4">
            <div className="space-y-1"><label className="text-sm font-medium text-slate-300">Nome</label><input name="nome" type="text" className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white" defaultValue={editingItem?.nome} required /></div>
            <div className="space-y-1"><label className="text-sm font-medium text-slate-300">Área (ha)</label><input name="area" type="text" className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white" defaultValue={editingItem?.area} required /></div>
            <div className="space-y-1"><label className="text-sm font-medium text-slate-300">Status</label><select name="status" className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white" defaultValue={editingItem?.status || 'Ativo'}><option>Ativo</option><option>Descanso</option><option>Manutenção</option></select></div>
            <div className="space-y-1"><label className="text-sm font-medium text-slate-300">Capim</label><input name="capim" type="text" className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white" defaultValue={editingItem?.capim} /></div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl mt-4">{editingItem ? 'Atualizar' : 'Criar'}</button>
          </form>
        );
      default: return <p className="text-slate-400 p-4">Formulário em desenvolvimento para o modo local.</p>;
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return (
        <div className="space-y-6">
          <Dashboard animals={animals} lots={lots} paddocks={paddocks} production={milkRecords} vaccines={vaccines} />
          {/* AI Insight Panel */}
          <div className="bg-gradient-to-br from-slate-800 to-indigo-950 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Sparkles size={120} className="text-white" />
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">Agro-AI Insight</h3>
              </div>
              <button 
                onClick={generateAiInsight}
                disabled={isAiAnalyzing}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all shadow-lg"
              >
                {isAiAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                {aiInsight ? 'Atualizar Análise' : 'Gerar Insights com IA'}
              </button>
            </div>
            <div className="relative z-10">
              {aiInsight ? (
                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap animate-in fade-in slide-in-from-top-2">
                  {aiInsight}
                </div>
              ) : (
                <p className="text-slate-400 text-sm italic">Clique em gerar para analisar os dados do seu rebanho usando inteligência artificial.</p>
              )}
            </div>
          </div>
        </div>
      );
      case 'propriedade': return <PropertyView property={property} onUpdateProperty={(updated) => { setProperty(updated); saveToLocal('property', updated); }} />;
      case 'gado': return <LivestockView animals={animals} onAddClick={() => handleOpenModal('gado')} onEditClick={(animal) => handleOpenModal('gado', animal)} onWeighingClick={(animal) => handleOpenModal('gado', animal)} />;
      case 'piquetes': return <PaddockView paddocks={paddocks} onAddClick={() => handleOpenModal('paddock')} onEditClick={(p) => handleOpenModal('paddock', p)} onDeleteClick={(id) => handleDelete('paddocks', paddocks, setPaddocks, id)} />;
      case 'vacinas': return <VaccineView vaccines={vaccines} onAddClick={() => handleOpenModal('vacina')} onEditClick={(v) => handleOpenModal('vacina', v)} onDeleteClick={(id) => handleDelete('vaccines', vaccines, setVaccines, id)} />;
      case 'lotes': return <LotView lots={lots} animals={animals} onAddClick={() => handleOpenModal('lote')} onEditClick={(l) => handleOpenModal('lote', l)} onDeleteClick={(id) => handleDelete('lots', lots, setLots, id)} />;
      case 'saude': return <HealthView records={healthRecords} onAddClick={() => handleOpenModal('saude')} onEditClick={(r) => handleOpenModal('saude', r)} onDeleteClick={(id) => handleDelete('health_records', healthRecords, setHealthRecords, id)} />;
      case 'producao': return <ProductionView milkRecords={milkRecords} birthRecords={birthRecords} onAddMilkClick={() => handleOpenModal('leite')} onAddBirthClick={() => handleOpenModal('nascimento')} onEditMilkClick={(r) => handleOpenModal('leite', r)} onEditBirthClick={(r) => handleOpenModal('nascimento', r)} onDeleteMilkClick={(id) => handleDelete('milk_records', milkRecords, setMilkRecords, id)} onDeleteBirthClick={(id) => handleDelete('birth_records', birthRecords, setBirthRecords, id)} />;
      default: return null;
    }
  };

  if (!currentUser) return <LoginView onLogin={handleLogin} />;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <Sidebar activeView={activeView} setActiveView={setActiveView} propertyName={property.name} />
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-emerald-400 tracking-tight">
                {{ dashboard: 'Visão Geral', propriedade: 'Configuração', gado: 'Rebanho', vacinas: 'Sanitário', piquetes: 'Pastagens', lotes: 'Lotes', saude: 'Saúde', producao: 'Produção' }[activeView]}
              </h2>
              <div className="bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold text-amber-500 flex items-center gap-1">
                <WifiOff size={10} /> MODO LOCAL (OFFLINE)
              </div>
            </div>
            <p className="text-slate-400 mt-1 text-sm">Painel {property.name}.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={loadFromLocal} title="Sincronizar Local" className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition-colors">
              <RefreshCw size={20} className={loadingData ? 'animate-spin' : ''} />
            </button>
            <div className="flex items-center gap-3 bg-slate-800 p-2 pr-4 rounded-xl border border-slate-700">
               <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">{currentUser.name.substring(0, 2).toUpperCase()}</div>
               <div className="hidden md:block"><p className="text-sm font-bold text-white max-w-[150px] truncate">{currentUser.name}</p><p className="text-xs text-emerald-400 font-medium">{currentUser.role}</p></div>
               <button onClick={handleLogout} className="ml-2 p-2 text-slate-500 hover:text-red-400 transition-colors" title="Sair"><LogOut size={16} /></button>
            </div>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {loadingData ? (
             <div className="flex items-center justify-center h-64 text-slate-500 gap-2"><Loader2 className="animate-spin" /> Carregando base local...</div>
          ) : renderContent()}
        </div>
      </main>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalType.toUpperCase()}>
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default App;
