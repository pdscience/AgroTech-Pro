
import React, { useState, useEffect } from 'react';
import { Home, MapPin, Ruler, FileText, User, Save, Tractor, Calendar } from 'lucide-react';
import { Property } from '../types';

interface PropertyViewProps {
  property: Property;
  onUpdateProperty: (updatedProperty: Property) => void;
}

const PropertyView: React.FC<PropertyViewProps> = ({ property, onUpdateProperty }) => {
  const [formData, setFormData] = useState<Property>(property);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Update form data if property prop changes
  useEffect(() => {
    setFormData(property);
  }, [property]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalArea' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProperty(formData);
    setIsEditing(false);
    setSuccessMessage('Dados da propriedade atualizados com sucesso!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Header Card */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="w-24 h-24 bg-slate-700 rounded-2xl flex items-center justify-center text-emerald-400 border-2 border-emerald-500/30 shadow-xl">
             <Home size={40} />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">{property.name}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-400 text-sm">
               <span className="flex items-center gap-1"><User size={14} /> {property.owner}</span>
               <span className="flex items-center gap-1"><MapPin size={14} /> {property.city} - {property.state}</span>
               <span className="flex items-center gap-1"><Tractor size={14} /> {property.activityType}</span>
            </div>
          </div>
          <div className="md:ml-auto">
             {!isEditing && (
               <button 
                 onClick={() => setIsEditing(true)}
                 className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors border border-slate-600"
               >
                 Editar Dados
               </button>
             )}
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
           <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
           {successMessage}
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Section */}
        <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-700/50">
             <FileText className="text-indigo-400" size={20} />
             <h3 className="text-lg font-bold text-white">Cadastro da Propriedade</h3>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Nome da Fazenda</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Proprietário Responsável</label>
                <input 
                  type="text" 
                  name="owner"
                  value={formData.owner}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Registro CAR</label>
                <input 
                  type="text" 
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Atividade Principal</label>
                <select 
                  name="activityType"
                  value={formData.activityType}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="Leite">Pecuária de Leite</option>
                  <option value="Corte">Pecuária de Corte</option>
                  <option value="Misto">Misto (Leite e Corte)</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-400">Endereço Completo</label>
                <input 
                  type="text" 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Cidade</label>
                <input 
                  type="text" 
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Estado (UF)</label>
                <input 
                  type="text" 
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Área Total (hectares)</label>
                <input 
                  type="number" 
                  name="totalArea"
                  value={formData.totalArea}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Ano de Fundação</label>
                <input 
                  type="text" 
                  name="foundedYear"
                  value={formData.foundedYear}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
                 <button 
                   type="button"
                   onClick={() => {
                     setFormData(property);
                     setIsEditing(false);
                   }}
                   className="px-6 py-2.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl font-medium transition-colors"
                 >
                   Cancelar
                 </button>
                 <button 
                   type="submit"
                   className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-emerald-900/40"
                 >
                   <Save size={18} />
                   Salvar Alterações
                 </button>
              </div>
            )}
          </form>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-lg">
             <h3 className="text-lg font-bold text-white mb-4">Resumo da Área</h3>
             <div className="space-y-4">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                      <Ruler size={24} />
                   </div>
                   <div>
                      <p className="text-xs text-slate-400 uppercase font-bold">Área Total</p>
                      <p className="text-xl font-bold text-white">{property.totalArea} ha</p>
                   </div>
                </div>
                
                <div className="h-px bg-slate-700/50 my-2"></div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <p className="text-xs text-slate-400 mb-1">Pastagens</p>
                      <p className="text-sm font-semibold text-emerald-400">{(property.totalArea * 0.7).toFixed(1)} ha</p>
                      <div className="h-1.5 w-full bg-slate-700 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[70%]"></div>
                      </div>
                   </div>
                   <div>
                      <p className="text-xs text-slate-400 mb-1">Reserva Legal</p>
                      <p className="text-sm font-semibold text-emerald-400">{(property.totalArea * 0.2).toFixed(1)} ha</p>
                       <div className="h-1.5 w-full bg-slate-700 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-emerald-700 w-[20%]"></div>
                      </div>
                   </div>
                   <div>
                      <p className="text-xs text-slate-400 mb-1">Benfeitorias</p>
                      <p className="text-sm font-semibold text-emerald-400">{(property.totalArea * 0.1).toFixed(1)} ha</p>
                       <div className="h-1.5 w-full bg-slate-700 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-slate-500 w-[10%]"></div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/50 to-slate-800 border border-indigo-500/20 rounded-2xl p-6 shadow-lg">
             <div className="flex items-center gap-3 mb-3">
               <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
                 <Calendar size={20} />
               </div>
               <h3 className="font-bold text-white">Histórico</h3>
             </div>
             <p className="text-sm text-slate-300 leading-relaxed">
               Propriedade fundada em <span className="text-white font-bold">{property.foundedYear}</span>. Atualmente com cadastro CAR <span className="font-mono text-xs bg-slate-900 px-1 py-0.5 rounded text-indigo-200">{property.registrationNumber}</span> ativo e regularizado.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyView;
