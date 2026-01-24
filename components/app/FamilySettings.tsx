import React from 'react';
import { Users, Baby, Plus, X, School } from 'lucide-react';
import { FamilyContext, Child } from '../../types';

interface FamilySettingsProps {
  context: FamilyContext;
  onUpdate: (ctx: FamilyContext) => void;
}

export const FamilySettings: React.FC<FamilySettingsProps> = ({ context, onUpdate }) => {
  
  const addChild = () => {
    const newChild: Child = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Nouveau',
      schoolName: 'École...',
      color: 'bg-green-100 text-green-700'
    };
    onUpdate({
      ...context,
      children: [...context.children, newChild]
    });
  };

  const removeChild = (id: string) => {
    onUpdate({
      ...context,
      children: context.children.filter(c => c.id !== id)
    });
  };

  const updateChild = (id: string, field: keyof Child, value: string) => {
    onUpdate({
      ...context,
      children: context.children.map(c => c.id === id ? { ...c, [field]: value } : c)
    });
  };

  const addParent = () => {
    if (context.parents.length >= 2) return;
    const newParent: Parent = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Conjoint(e)',
      isCurrentUser: false
    };
    onUpdate({
      ...context,
      parents: [...context.parents, newParent]
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-alto-navy text-lg flex items-center gap-2">
          <Users size={20} className="text-alto-terra" />
          Ma Famille
        </h3>
      </div>

      {/* Parents Section */}
      <div className="mb-6">
        <div className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Parents</div>
        <div className="space-y-2">
          {context.parents.map(parent => (
             <div key={parent.id} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 border border-gray-100">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${parent.isCurrentUser ? 'bg-alto-navy text-white' : 'bg-gray-200 text-gray-600'}`}>
                 {parent.name.charAt(0)}
               </div>
               <span className="text-sm font-medium text-gray-700">{parent.name}</span>
               {parent.isCurrentUser && <span className="text-[10px] bg-gray-200 px-1.5 rounded text-gray-500 ml-auto">Moi</span>}
             </div>
          ))}
          {context.parents.length < 2 && (
            <button onClick={addParent} className="w-full py-2 text-xs font-bold text-alto-navy border border-dashed border-alto-navy/30 rounded-xl hover:bg-alto-cream/50 flex items-center justify-center gap-2">
              <Plus size={14} /> Ajouter conjoint(e)
            </button>
          )}
        </div>
      </div>

      {/* Children Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Enfants</div>
          <button onClick={addChild} className="text-alto-navy hover:bg-alto-cream p-1 rounded transition-colors">
            <Plus size={16} />
          </button>
        </div>
        
        <div className="space-y-3">
          {context.children.map(child => (
            <div key={child.id} className="p-3 rounded-xl border border-gray-100 bg-white shadow-sm group relative">
               <button 
                 onClick={() => removeChild(child.id)}
                 className="absolute top-2 right-2 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
               >
                 <X size={14} />
               </button>
               
               <div className="flex items-center gap-2 mb-2">
                 <div className={`w-6 h-6 rounded-full flex items-center justify-center ${child.color}`}>
                   <Baby size={14} />
                 </div>
                 <input 
                   value={child.name}
                   onChange={(e) => updateChild(child.id, 'name', e.target.value)}
                   className="text-sm font-bold text-alto-navy bg-transparent focus:bg-gray-50 outline-none rounded px-1 w-full"
                 />
               </div>
               
               <div className="flex items-center gap-2 text-gray-500">
                 <School size={12} />
                 <input 
                   value={child.schoolName}
                   onChange={(e) => updateChild(child.id, 'schoolName', e.target.value)}
                   className="text-xs text-gray-500 bg-transparent focus:bg-gray-50 outline-none rounded px-1 w-full placeholder-gray-300"
                   placeholder="École..."
                 />
               </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 p-3 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-[10px] text-blue-800 leading-relaxed">
          💡 <strong>Astuce Démo:</strong> Modifiez le nom de l'école ici pour voir l'IA attribuer automatiquement les emails scolaires au bon enfant.
        </p>
      </div>
    </div>
  );
};