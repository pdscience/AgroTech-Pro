
export type ViewState = 'dashboard' | 'gado' | 'vacinas' | 'piquetes' | 'lotes' | 'saude' | 'producao' | 'propriedade';

export type UserRole = 'Gerente' | 'Funcionário';

export interface User {
  id?: string;
  name: string;
  role: UserRole;
  email?: string;
  phone?: string;
}

export interface Property {
  name: string;
  owner: string;
  address: string;
  city: string;
  state: string;
  totalArea: number;
  registrationNumber: string; // CAR
  activityType: 'Leite' | 'Corte' | 'Misto';
  foundedYear: string;
}

export interface WeightRecord {
  date: string;
  weight: number;
}

export interface Animal {
  id: string;
  brinco: string;
  raca: string;
  idade: string;
  dataNascimento: string; 
  peso: number;
  historicoPeso: WeightRecord[]; 
  lote: string;
  piquete: string;
  status: 'Saudável' | 'Doente' | 'Observação';
  lastUpdate: string;
}

export interface VaccineRecord {
  id: string;
  nome: string;
  alvo: string;
  lote?: string; 
  piquete?: string; 
  dataAplicacao: string;
  proximaDose: string;
  veterinario: string;
  status: 'Em Dia' | 'Vencendo' | 'Atrasada';
}

export interface Lot {
  id: string;
  nome: string;
  descricao: string;
  piquete: string;
  capacidade: number;
  dataFormacao: string;
  status: 'Ativo' | 'Arquivado';
}

export interface Paddock {
  id: string;
  nome: string;
  area: string;
  animais: number;
  capim: string;
  status: 'Ativo' | 'Descanso' | 'Manutenção';
  dataInicioDescanso?: string;
  dataFimDescanso?: string;
}

export interface ProductionStat {
  date: string;
  liters: number;
}

export interface HealthRecord {
  id: string;
  animalBrinco: string;
  tipo: 'Doença' | 'Lesão' | 'Parto' | 'Exame' | 'Outro';
  diagnostico: string;
  data: string;
  tratamento: string;
  veterinario: string;
  custo: number;
  status: 'Em Tratamento' | 'Recuperado' | 'Observação' | 'Óbito';
}

export interface MilkProductionRecord {
  id: string;
  data: string;
  periodo: 'Manhã' | 'Tarde' | 'Total Dia';
  litros: number;
  gordura?: number;
  proteina?: number;
  cbs?: number; 
  ccs?: number; 
  responsavel: string;
}

export interface BirthRecord {
  id: string;
  data: string;
  maeBrinco: string;
  paiNome?: string;
  bezerroBrinco: string;
  sexo: 'Macho' | 'Fêmea';
  pesoNascimento: number;
  partoTipo: 'Natural' | 'Auxiliado' | 'Cesariana';
  observacoes?: string;
}
