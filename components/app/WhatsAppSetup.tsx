import React, { useState } from 'react';
import { MessageCircle, Phone, Send, Check, X, AlertCircle, Loader2, Copy, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';

interface WhatsAppSetupProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  onPhoneChange: (phone: string) => void;
  onTestMessage: () => Promise<boolean>;
}

export const WhatsAppSetup: React.FC<WhatsAppSetupProps> = ({
  isOpen,
  onClose,
  phoneNumber,
  onPhoneChange,
  onTestMessage
}) => {
  const [step, setStep] = useState(1);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const sandboxNumber = '+1 415 523 8886';
  const joinCode = 'join alto-app';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleTestMessage = async () => {
    if (!phoneNumber) {
      setError('Veuillez entrer votre numero de telephone.');
      return;
    }

    setTesting(true);
    setError('');

    try {
      const success = await onTestMessage();
      if (success) {
        setStep(4);
      } else {
        setError('Le message n\'a pas pu etre envoye. Verifiez que vous avez rejoint le Sandbox.');
      }
    } catch {
      setError('Erreur de connexion au serveur.');
    } finally {
      setTesting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setError('');
    onClose();
  };

  const formatPhoneForDisplay = (phone: string) => {
    // Basic formatting for display
    return phone.replace(/(\+\d{2})(\d)/, '$1 $2');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-green-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle size={24} />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">Configuration WhatsApp</h3>
                <p className="text-green-100 text-sm">Recevez votre briefing quotidien</p>
              </div>
            </div>
            <button onClick={handleClose} className="text-white/70 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-6">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex-1 flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= s ? 'bg-white text-green-600' : 'bg-green-400/50 text-green-200'
                }`}>
                  {step > s ? <Check size={14} /> : s}
                </div>
                {s < 4 && (
                  <div className={`flex-1 h-0.5 mx-1 ${step > s ? 'bg-white' : 'bg-green-400/50'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Join Sandbox */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h4 className="font-bold text-alto-navy text-lg mb-4">
                Etape 1 : Rejoindre le Sandbox Twilio
              </h4>
              <p className="text-gray-500 text-sm mb-6">
                Pour recevoir les messages Alto sur WhatsApp, vous devez d'abord rejoindre notre canal de test.
              </p>

              <div className="bg-green-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-green-600 font-bold uppercase mb-1">Numero Sandbox</p>
                    <p className="text-lg font-mono font-bold text-green-800">{sandboxNumber}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(sandboxNumber.replace(/\s/g, ''))}
                    className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <Copy size={18} />
                  </button>
                </div>

                <div className="border-t border-green-200 pt-4">
                  <p className="text-xs text-green-600 font-bold uppercase mb-1">Message a envoyer</p>
                  <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-green-200">
                    <code className="text-green-800 font-mono font-bold">{joinCode}</code>
                    <button
                      onClick={() => copyToClipboard(joinCode)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl mb-6">
                <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Comment faire ?</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Ouvrez WhatsApp sur votre telephone</li>
                    <li>Ajoutez le numero ci-dessus a vos contacts</li>
                    <li>Envoyez le message <strong>"{joinCode}"</strong></li>
                    <li>Attendez la confirmation de Twilio</li>
                  </ol>
                </div>
              </div>

              <a
                href={`https://wa.me/${sandboxNumber.replace(/[\s+]/g, '')}?text=${encodeURIComponent(joinCode)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-colors mb-3"
              >
                <ExternalLink size={18} />
                Ouvrir WhatsApp
              </a>

              <Button variant="secondary" onClick={() => setStep(2)} className="w-full">
                J'ai envoye le message
              </Button>
            </div>
          )}

          {/* Step 2: Enter Phone Number */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h4 className="font-bold text-alto-navy text-lg mb-4">
                Etape 2 : Votre numero de telephone
              </h4>
              <p className="text-gray-500 text-sm mb-6">
                Entrez le numero de telephone sur lequel vous souhaitez recevoir les briefings Alto.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-500 mb-2">
                  Numero de telephone (avec indicatif pays)
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => onPhoneChange(e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors text-lg font-mono"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Format: +33 pour la France, +1 pour les USA, etc.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
                  Retour
                </Button>
                <Button onClick={() => setStep(3)} disabled={!phoneNumber} className="flex-1 !bg-green-500 hover:!bg-green-600">
                  Continuer
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Test Message */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h4 className="font-bold text-alto-navy text-lg mb-4">
                Etape 3 : Tester la connexion
              </h4>
              <p className="text-gray-500 text-sm mb-6">
                Nous allons envoyer un message de test pour verifier que tout fonctionne.
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-xs text-gray-400 uppercase font-bold mb-2">Message de test vers</p>
                <p className="text-lg font-mono font-bold text-alto-navy">
                  {formatPhoneForDisplay(phoneNumber)}
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 rounded-xl mb-6 text-sm text-red-700">
                  <AlertCircle size={18} className="shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(2)} className="flex-1" disabled={testing}>
                  Retour
                </Button>
                <Button
                  onClick={handleTestMessage}
                  disabled={testing}
                  className="flex-1 !bg-green-500 hover:!bg-green-600"
                >
                  {testing ? (
                    <>
                      <Loader2 size={18} className="animate-spin mr-2" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send size={18} className="mr-2" />
                      Envoyer le test
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="animate-fade-in text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={40} className="text-green-600" />
              </div>
              <h4 className="font-bold text-alto-navy text-xl mb-2">
                Configuration terminee !
              </h4>
              <p className="text-gray-500 text-sm mb-6">
                Vous recevrez desormais votre briefing quotidien sur WhatsApp a <strong>{formatPhoneForDisplay(phoneNumber)}</strong>.
              </p>

              <div className="bg-green-50 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm text-green-800">
                  <strong>Prochaines etapes :</strong>
                </p>
                <ul className="text-xs text-green-700 mt-2 space-y-1">
                  <li>Votre briefing sera envoye chaque matin a 7h</li>
                  <li>Vous pouvez modifier l'heure dans les parametres</li>
                  <li>Repondez "STOP" pour desactiver les notifications</li>
                </ul>
              </div>

              <Button onClick={handleClose} className="w-full !bg-green-500 hover:!bg-green-600">
                Terminer
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
