import React, { useState } from 'react';
import { Mail, Calendar, RefreshCw, MessageCircle, Settings, ChevronRight } from 'lucide-react';
import { ServiceIntegration } from '../../types';
import { WhatsAppSetup } from './WhatsAppSetup';

interface IntegrationsProps {
  services: ServiceIntegration[];
  onToggle: (id: string) => void;
  onUpdateData?: (id: string, data: Partial<ServiceIntegration>) => void;
}

export const Integrations: React.FC<IntegrationsProps> = ({ services, onToggle, onUpdateData }) => {
  const [isWhatsAppSetupOpen, setIsWhatsAppSetupOpen] = useState(false);

  const getIcon = (type: string, id: string) => {
    if (id === 'whatsapp') return MessageCircle;
    if (type === 'mail') return Mail;
    return Calendar;
  };

  const handlePhoneChange = (value: string) => {
    if (onUpdateData) {
      onUpdateData('whatsapp', { phoneNumber: value });
    }
  };

  const handleTestMessage = async (): Promise<boolean> => {
    const whatsappService = services.find(s => s.id === 'whatsapp');
    if (!whatsappService?.phoneNumber) return false;

    try {
      const response = await fetch('http://localhost:3001/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: whatsappService.phoneNumber,
          summary: 'Ceci est un message de test depuis Alto. Si vous recevez ce message, la configuration WhatsApp est reussie !',
          events: [],
          tasks: []
        })
      });

      return response.ok;
    } catch {
      return false;
    }
  };

  const whatsappService = services.find(s => s.id === 'whatsapp');
  const otherServices = services.filter(s => s.id !== 'whatsapp');

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-alto-navy text-lg">Connecteurs</h3>
        <RefreshCw size={16} className="text-gray-400" />
      </div>

      {/* WhatsApp - Featured */}
      {whatsappService && (
        <div className="mb-6">
          <div className={`p-4 rounded-xl border-2 transition-colors ${
            whatsappService.connected
              ? 'border-green-200 bg-green-50'
              : 'border-gray-100 bg-gray-50'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  whatsappService.connected ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  <MessageCircle size={20} />
                </div>
                <div>
                  <span className="font-medium text-alto-navy block">WhatsApp</span>
                  <span className="text-[10px] text-gray-500">
                    {whatsappService.connected
                      ? whatsappService.phoneNumber || 'Configure'
                      : 'Non connecte'}
                  </span>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => onToggle('whatsapp')}
                className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                  whatsappService.connected ? 'bg-green-500' : 'bg-gray-200'
                }`}
                aria-pressed={whatsappService.connected}
              >
                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                  whatsappService.connected ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Setup Button */}
            {whatsappService.connected && (
              <button
                onClick={() => setIsWhatsAppSetupOpen(true)}
                className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-green-200 text-sm font-medium text-green-700 hover:bg-green-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Settings size={14} />
                  {whatsappService.phoneNumber ? 'Modifier la configuration' : 'Configurer WhatsApp'}
                </div>
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          {!whatsappService.connected && (
            <p className="text-[10px] text-gray-400 mt-2 px-1">
              Activez WhatsApp pour recevoir votre briefing quotidien.
            </p>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-gray-100 mb-4 pt-2">
        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Sources de donnees</p>
      </div>

      {/* Other Services */}
      <div className="space-y-3">
        {otherServices.map((service) => {
          const Icon = getIcon(service.type, service.id);

          return (
            <div key={service.id} className="flex items-center justify-between p-2">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  service.connected ? service.color : 'bg-gray-100 text-gray-400'
                }`}>
                  <Icon size={20} />
                </div>
                <span className={`font-medium ${service.connected ? 'text-alto-navy' : 'text-gray-500'}`}>
                  {service.name}
                </span>
              </div>

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
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-alto-cream rounded-xl text-xs text-gray-600 leading-relaxed border border-alto-sage/20">
        <p><strong>Astuce :</strong> Activez <strong>Gmail</strong> pour l'importation. Activez <strong>WhatsApp</strong> pour configurer l'envoi du resume.</p>
      </div>

      {/* WhatsApp Setup Modal */}
      <WhatsAppSetup
        isOpen={isWhatsAppSetupOpen}
        onClose={() => setIsWhatsAppSetupOpen(false)}
        phoneNumber={whatsappService?.phoneNumber || ''}
        onPhoneChange={handlePhoneChange}
        onTestMessage={handleTestMessage}
      />
    </div>
  );
};
