
import React, { useState, useEffect } from 'react';
import { FamilyContext, ServiceIntegration, Child, Parent } from '../../types';
import { Button } from '../ui/Button';
import { Users, Mail, CheckCircle2, Plus, X, Baby, ArrowRight, Loader2, Info, Copy, Calendar } from 'lucide-react';
import { initGoogleAuth, signInWithGoogle } from '../../services/google';

interface OnboardingWizardProps {
  onComplete: (data: { family: FamilyContext; services: ServiceIntegration[] }) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  
  // STEP 1 STATE: Family
  const [family, setFamily] = useState<FamilyContext>({
    parents: [{ id: 'p1', name: 'Moi', isCurrentUser: true }],
    children: []
  });
  
  // STEP 2 STATE: Services (Rationalized for MVP)
  const [services, setServices] = useState<ServiceIntegration[]>([
    { id: 'gmail', name: 'Gmail', connected: false, type: 'mail', color: 'bg-red-100 text-red-600' },
    { id: 'gcal', name: 'Google Agenda', connected: false, type: 'calendar', color: 'bg-blue-50 text-blue-500' },
    { id: 'whatsapp', name: 'WhatsApp', connected: false, type: 'messaging', color: 'bg-green-100 text-green-600' }, // Hidden in wizard, present in dashboard
  ]);

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [currentOrigin, setCurrentOrigin] = useState('');

  // Initialize Google Auth on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentOrigin(window.location.origin);
    }

    initGoogleAuth((response) => {
      if (response && response.access_token) {
        handleGoogleSuccess(response.access_token);
      }
    });
  }, []);

  const handleGoogleSuccess = (token: string) => {
    setIsAuthenticating(false);
    // Connect BOTH Gmail and Calendar
    setServices(prev => prev.map(s => 
      (s.id === 'gmail' || s.id === 'gcal') ? { ...s, connected: true, accessToken: token } : s
    ));
  };

  // Helpers
  const addChild = () => {
    const newChild: Child = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      schoolName: '',
      color: 'bg-alto-sage/30 text-alto-navy'
    };
    setFamily({...family, children: [...family.children, newChild]});
  };

  const updateChild = (id: string, field: keyof Child, value: string) => {
    setFamily({
      ...family,
      children: family.children.map(c => c.id === id ? { ...c, [field]: value } : c)
    });
  };

  const forceSimulationMode = () => {
    setIsAuthenticating(false);
    setServices(prev => prev.map(s => 
      (s.id === 'gmail' || s.id === 'gcal') ? { ...s, connected: true } : s
    ));
  };

  const handleConnectGoogle = async () => {
    const isConnected = services.some(s => (s.id === 'gmail' || s.id === 'gcal') && s.connected);
    
    if (isConnected) {
       // Disconnect both
       setServices(prev => prev.map(s => 
         (s.id === 'gmail' || s.id === 'gcal') ? { ...s, connected: false, accessToken: undefined } : s
       ));
       return;
    }

    setIsAuthenticating(true);
    try {
      // Attempt real sign in
      signInWithGoogle();
      // Note: success is handled in the callback defined in useEffect
    } catch (error) {
      console.warn("Real Auth failed or missing Client ID. Using simulation.");
      // Fallback to simulation with delay
      setTimeout(() => {
        forceSimulationMode();
      }, 1500);
    }
  };

  const handleFinish = () => {
    setStep(3); // Show success briefly
    setTimeout(() => {
      onComplete({ family, services });
    }, 1500);
  };

  const copyOrigin = () => {
    navigator.clipboard.writeText(currentOrigin);
    alert("URL copiée ! Ajoutez-la dans 'Authorized JavaScript origins' sur Google Cloud.");
  };

  const googleConnected = services.some(s => s.id === 'gmail' && s.connected);

  return (
    <div className="min-h-screen bg-alto-cream flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-[2.5rem] shadow-xl overflow-hidden min-h-[600px] flex flex-col relative">
        
        {/* Progress Bar */}
        <div className="h-2 bg-gray-100 w-full">
          <div 
            className="h-full bg-alto-sage transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="flex-1 p-8 md:p-12 flex flex-col">
          
          {/* STEP 1: FAMILY SETUP */}
          {step === 1 && (
            <div className="flex-1 flex flex-col animate-fade-in">
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-alto-sage rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-alto-sage/30">
                  <Users size={32} />
                </div>
                <h2 className="text-3xl font-display font-bold text-alto-navy mb-2">Qui compose votre tribu ?</h2>
                <p className="text-gray-500">Alto a besoin de connaître les prénoms pour trier les infos.</p>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[400px] space-y-6 px-4">
                {/* Parents */}
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Les Parents</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
                      <div className="w-10 h-10 bg-alto-navy text-white rounded-full flex items-center justify-center font-bold">M</div>
                      <div className="font-bold text-alto-navy">Moi</div>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-alto-sage hover:text-alto-sage hover:bg-alto-sage/5 cursor-pointer transition-colors">
                      <Plus size={18} className="mr-2" /> Ajouter conjoint(e)
                    </div>
                  </div>
                </div>

                {/* Children */}
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Les Enfants</label>
                  <div className="space-y-3">
                    {family.children.map((child, idx) => (
                      <div key={child.id} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm items-start relative group">
                         <button 
                            onClick={() => setFamily({...family, children: family.children.filter(c => c.id !== child.id)})}
                            className="absolute -top-2 -right-2 bg-white rounded-full p-1 text-gray-300 hover:text-red-500 shadow-sm border border-gray-100"
                         >
                           <X size={14} />
                         </button>
                         <div className="w-10 h-10 rounded-full bg-alto-cream flex items-center justify-center text-alto-terra shrink-0">
                           <Baby size={20} />
                         </div>
                         <div className="flex-1 space-y-3">
                           <div>
                             <label className="text-[10px] text-gray-400 uppercase font-bold">Prénom</label>
                             <input 
                               autoFocus={idx === family.children.length - 1}
                               className="w-full font-bold text-alto-navy border-b border-gray-200 focus:border-alto-sage outline-none bg-transparent py-1"
                               placeholder="Ex: Léo"
                               value={child.name}
                               onChange={(e) => updateChild(child.id, 'name', e.target.value)}
                             />
                           </div>
                           <div>
                             <label className="text-[10px] text-gray-400 uppercase font-bold">École / Classe</label>
                             <input 
                               className="w-full text-sm text-gray-600 border-b border-gray-200 focus:border-alto-sage outline-none bg-transparent py-1"
                               placeholder="Ex: École Jules Ferry"
                               value={child.schoolName}
                               onChange={(e) => updateChild(child.id, 'schoolName', e.target.value)}
                             />
                           </div>
                         </div>
                      </div>
                    ))}
                    
                    <button 
                      onClick={addChild}
                      className="w-full py-4 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 font-bold hover:border-alto-sage hover:text-alto-sage hover:bg-alto-sage/5 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={20} /> Ajouter un enfant
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button onClick={() => setStep(2)} disabled={family.children.length === 0}>
                  Continuer <ArrowRight className="ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: SERVICES (Rationalized) */}
          {step === 2 && (
            <div className="flex-1 flex flex-col animate-fade-in">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 shadow-lg shadow-blue-100">
                  <Mail size={32} />
                </div>
                <h2 className="text-3xl font-display font-bold text-alto-navy mb-2">Une seule connexion</h2>
                <p className="text-gray-500">Pour le MVP, connectez simplement votre compte Google pour tout analyser.</p>
              </div>
              
              {/* OAuth Helper Box */}
              <div className="mx-auto max-w-2xl w-full bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-xs text-blue-800 shadow-sm">
                <div className="flex items-start gap-3">
                   <Info size={16} className="mt-0.5 shrink-0 text-blue-600" />
                   <div className="flex-1 min-w-0">
                     <p className="mb-2">
                       <strong>Configuration Requise :</strong> Ajoutez cette URL dans <em>"Authorized JavaScript origins"</em> sur votre console Google Cloud.
                     </p>
                     
                     <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input 
                            readOnly
                            value={currentOrigin}
                            className="w-full bg-white border border-blue-200 rounded-lg py-2 pl-3 pr-3 font-mono text-[11px] text-gray-600 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 shadow-inner"
                            onClick={(e) => e.currentTarget.select()}
                          />
                        </div>
                        <button 
                          onClick={copyOrigin} 
                          className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors font-bold whitespace-nowrap shadow-sm"
                        >
                          <Copy size={14} /> 
                          <span className="hidden sm:inline">Copier</span>
                        </button>
                     </div>
                   </div>
                </div>
              </div>

              <div className="max-w-md mx-auto w-full">
                  <div 
                    onClick={() => !isAuthenticating && handleConnectGoogle()}
                    className={`relative p-8 rounded-3xl border-2 cursor-pointer transition-all duration-300 flex flex-col items-center text-center gap-6 group hover:shadow-lg ${
                      googleConnected 
                        ? 'border-alto-sage bg-alto-sage/10' 
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    } ${isAuthenticating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {/* Loading Overlay */}
                    {isAuthenticating && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/80 backdrop-blur-sm rounded-3xl text-center p-4">
                         <Loader2 className="animate-spin text-alto-navy w-10 h-10 mb-3" />
                         <span className="text-sm font-bold text-alto-navy">Connexion sécurisée à Google...</span>
                         <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             forceSimulationMode();
                           }}
                           className="mt-4 text-xs underline text-gray-500 hover:text-red-500"
                         >
                           Bloqué ? Forcer le mode démo
                         </button>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${googleConnected ? 'bg-white text-red-600 shadow-md' : 'bg-red-50 text-red-600'}`}>
                        <Mail size={32} />
                      </div>
                      <div className="text-2xl text-gray-300 font-light">+</div>
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${googleConnected ? 'bg-white text-blue-600 shadow-md' : 'bg-blue-50 text-blue-600'}`}>
                        <Calendar size={32} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="font-display font-bold text-xl text-alto-navy mb-1">
                        Google Workspace
                      </div>
                      <p className="text-sm text-gray-500">
                        Active automatiquement l'analyse des emails (Gmail) et la synchronisation de l'agenda.
                      </p>
                    </div>

                    <div className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                      googleConnected ? 'bg-alto-sage text-alto-navy' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-600 group-hover:text-white'
                    }`}>
                      {googleConnected ? 'Connecté ✓' : 'Connecter mon compte'}
                    </div>
                  </div>
              </div>
              
              <div className="mt-auto pt-8 flex justify-between items-center">
                <button onClick={() => setStep(1)} className="text-gray-400 font-bold hover:text-alto-navy transition-colors" disabled={isAuthenticating}>
                  Retour
                </button>
                <Button onClick={handleFinish} disabled={!googleConnected || isAuthenticating}>
                  Terminer l'installation
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 3 && (
            <div className="flex-1 flex flex-col items-center justify-center animate-fade-in text-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
                <CheckCircle2 size={48} className="text-green-600" />
              </div>
              <h2 className="text-3xl font-display font-bold text-alto-navy mb-4">Tout est prêt !</h2>
              <p className="text-lg text-gray-600 max-w-md">
                Alto commence l'analyse de vos données. Redirection vers votre tableau de bord...
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
