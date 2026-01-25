import React, { useState } from 'react';
import { Users, Baby, Plus, X, School, Calendar, Tag, UserPlus } from 'lucide-react';
import { FamilyContext, Child, formatAge } from '../../types';
import { InviteParentModal } from './InviteParentModal';

interface FamilySettingsProps {
  context: FamilyContext;
  onUpdate: (ctx: FamilyContext) => void;
  familyId?: string | null;
  userId?: string;
}

export const FamilySettings: React.FC<FamilySettingsProps> = ({ context, onUpdate, familyId, userId }) => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newActivity, setNewActivity] = useState<Record<string, string>>({});

  const addChild = () => {
    const newChild: Child = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Nouveau',
      schoolName: '',
      activities: [],
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

  const updateChild = (id: string, field: keyof Child, value: string | string[]) => {
    onUpdate({
      ...context,
      children: context.children.map(c => c.id === id ? { ...c, [field]: value } : c)
    });
  };

  const addActivity = (childId: string) => {
    const activity = newActivity[childId]?.trim();
    if (!activity) return;

    const child = context.children.find(c => c.id === childId);
    if (child && !child.activities.includes(activity)) {
      updateChild(childId, 'activities', [...child.activities, activity]);
    }
    setNewActivity(prev => ({ ...prev, [childId]: '' }));
  };

  const removeActivity = (childId: string, activity: string) => {
    const child = context.children.find(c => c.id === childId);
    if (child) {
      updateChild(childId, 'activities', child.activities.filter(a => a !== activity));
    }
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
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-700 block truncate">{parent.name}</span>
                {parent.email && (
                  <span className="text-[10px] text-gray-400 block truncate">{parent.email}</span>
                )}
              </div>
              {parent.isCurrentUser && <span className="text-[10px] bg-gray-200 px-1.5 rounded text-gray-500">Moi</span>}
            </div>
          ))}

          {context.parents.length < 2 && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="w-full py-2 text-xs font-bold text-alto-terra border border-dashed border-alto-terra/30 rounded-xl hover:bg-alto-terra/5 flex items-center justify-center gap-2 transition-colors"
            >
              <UserPlus size={14} /> Inviter mon/ma partenaire
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

              {/* Name and Icon */}
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${child.color}`}>
                  <Baby size={14} />
                </div>
                <input
                  value={child.name}
                  onChange={(e) => updateChild(child.id, 'name', e.target.value)}
                  className="text-sm font-bold text-alto-navy bg-transparent focus:bg-gray-50 outline-none rounded px-1 flex-1"
                  placeholder="Prenom"
                />
                {child.birthDate && (
                  <span className="text-[10px] bg-alto-sage/20 text-alto-navy px-2 py-0.5 rounded-full font-medium">
                    {formatAge(child.birthDate)}
                  </span>
                )}
              </div>

              {/* Birth Date */}
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Calendar size={12} />
                <input
                  type="date"
                  value={child.birthDate || ''}
                  onChange={(e) => updateChild(child.id, 'birthDate', e.target.value)}
                  className="text-xs text-gray-500 bg-transparent focus:bg-gray-50 outline-none rounded px-1 flex-1"
                />
              </div>

              {/* School */}
              <div className="flex items-center gap-2 text-gray-500 mb-3">
                <School size={12} />
                <input
                  value={child.schoolName}
                  onChange={(e) => updateChild(child.id, 'schoolName', e.target.value)}
                  className="text-xs text-gray-500 bg-transparent focus:bg-gray-50 outline-none rounded px-1 flex-1 placeholder-gray-300"
                  placeholder="Ecole..."
                />
              </div>

              {/* Activities */}
              <div className="border-t border-gray-100 pt-2">
                <div className="flex items-center gap-1 mb-2">
                  <Tag size={10} className="text-gray-400" />
                  <span className="text-[10px] text-gray-400 font-medium uppercase">Activites</span>
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  {child.activities.map((activity, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-alto-cream text-alto-navy text-[10px] font-medium rounded-full group/tag"
                    >
                      {activity}
                      <button
                        onClick={() => removeActivity(child.id, activity)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover/tag:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newActivity[child.id] || ''}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, [child.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && addActivity(child.id)}
                    placeholder="+ Ajouter"
                    className="flex-1 text-[10px] text-gray-500 bg-gray-50 rounded px-2 py-1 outline-none focus:bg-gray-100 placeholder-gray-300"
                  />
                  <button
                    onClick={() => addActivity(child.id)}
                    className="text-alto-sage hover:text-alto-navy p-1 transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-3 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-[10px] text-blue-800 leading-relaxed">
          <strong>Astuce:</strong> Ajoutez les activites de vos enfants pour qu'Alto detecte automatiquement les emails lies (Football, Piano, etc.).
        </p>
      </div>

      {/* Invite Parent Modal */}
      <InviteParentModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        familyId={familyId}
        userId={userId}
      />
    </div>
  );
};
