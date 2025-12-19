import React, { useState } from 'react';
import { Mail, Calendar, RefreshCw, MessageCircle, Smartphone, ChevronDown, ChevronUp } from 'lucide-react';
import { ServiceIntegration } from '../../types';

interface IntegrationsProps {
  services: ServiceIntegration[];
  onToggle: (id: string) => void;
  onUpdateData?: (id: string, data: Partial<ServiceIntegration>) => void;
}

export const Integrations: React.FC<IntegrationsProps> = ({ services, onToggle, onUpdateData }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getIcon = (type: string, id: string) => {
    if (id === 'whatsapp') return MessageCircle;
    if (type === 'mail') return Mail;
    return Calendar;
  };

  const handlePhoneChange = (id: string, value: string) => {
    if (onUpdateData) {
      onUpdateData(id, { phoneNumber: value });
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-alto-navy text-lg">Connecteurs</h3>
        <RefreshCw size={16} className="text-gray-400" />
      </div>
      <div className="space-y-4">
        {services.map((service) => {
          const Icon = getIcon(service.type, service.id);
          const isExpanded = expandedId === service.id;

          return (
            <div key={service.id} className="flex flex-col">
              <div className="flex items-center justify-between p-1">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${service.connected ? service.color : 'bg-gray-100 text-gray-400'}`}>
                    <Icon size={20} />
                  </div>
                  <span className={`font-medium ${service.connected ? 'text-alto-navy' : 'text-gray-500'}`}>
                    {service.name}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Setup Config Button (Only for WhatsApp currently) */}
                  {service.id === 'whatsapp' && service.connected && (
                    <button 
                      onClick={() => setExpandedId(isExpanded ? null : service.id)}
                      className="text-gray-400 hover:text-alto-navy p-1"
                    >
                      {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16} />}
                    </button>
                  )}

                  {/* Toggle Switch */}
                  <button 
                    onClick={() => onToggle(service.id)}
                    className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-alto-sage ${
                      service.connected ? 'bg-alto-sage' : 'bg-gray-200'
                    }`}
                    aria-pressed={service.connected}
                  >
                    <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                      service.connected ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Extended Config Area */}
              {service.id === 'whatsapp' && service.connected && isExpanded && (
                 <div className="mt-2 mb-2 p-3 bg-green-50 border border-green-100 rounded-xl animate-fade-in">
                   <label className="text-[10px] uppercase font-bold text-green-800 mb-1 block">
                     Numéro de téléphone
                   </label>
                   <div className="flex items-center gap-2 bg-white border border-green-200 rounded-lg px-2 py-1.5">
                     <Smartphone size={14} className="text-green-600" />
                     <input 
                       type="tel" 
                       placeholder="+33 6..." 
                       className="w-full text-sm text-gray-700 outline-none placeholder-gray-300 bg-transparent"
                       value={service.phoneNumber || ''}
                       onChange={(e) => handlePhoneChange(service.id, e.target.value)}
                     />
                   </div>
                   <p className="text-[10px] text-green-600 mt-2">
                     Pour activer : envoyez <strong>"join alto-app"</strong> au +1 415 523 8886 (Sandbox Twilio).
                   </p>
                 </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-6 p-4 bg-alto-cream rounded-xl text-xs text-gray-600 leading-relaxed border border-alto-sage/20">
        <p><strong>Astuce :</strong> Activez <strong>Gmail</strong> pour l'importation. Activez <strong>WhatsApp</strong> pour configurer l'envoi du résumé.</p>
      </div>
    </div>
  );
};