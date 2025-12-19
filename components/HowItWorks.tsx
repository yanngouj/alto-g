import React, { useState, useEffect } from 'react';
import { Section } from './ui/Section';
import { Link2, Search, Smartphone, Check, Mail, Calendar } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  // Auto-rotate steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      title: "Connectez vos comptes",
      desc: "Liez simplement votre adresse Gmail et vos agendas (Google, Apple, Outlook) à Alto de manière sécurisée.",
      icon: Link2
    },
    {
      title: "Alto analyse et organise",
      desc: "L'IA d'Alto scanne vos emails entrants pour détecter les événements scolaires, RDV et tâches.",
      icon: Search
    },
    {
      title: "Recevez votre résumé",
      desc: "Chaque matin, ou lorsqu'une info urgente tombe, vous recevez une notification WhatsApp claire.",
      icon: Smartphone
    }
  ];

  return (
    <Section id="comment-ca-marche" className="bg-white relative overflow-hidden">
       {/* Background subtle decoration */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-alto-cream rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-20 right-10 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
       </div>

       <div className="text-center mb-16 relative z-10">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-alto-navy">Comment ça marche ?</h2>
        <p className="text-gray-600 mt-4 text-lg">La magie opère en trois étapes simples</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto relative z-10">
        
        {/* Left Column: Steps Navigation */}
        <div className="space-y-6">
          {steps.map((step, idx) => (
            <div 
              key={idx}
              className={`cursor-pointer p-6 rounded-2xl transition-all duration-300 border-2 flex gap-4 group ${
                activeStep === idx 
                  ? 'border-alto-navy bg-white shadow-md scale-[1.02]' 
                  : 'border-transparent hover:bg-white/50 opacity-60 hover:opacity-100'
              }`}
              onClick={() => setActiveStep(idx)}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${
                 activeStep === idx ? 'bg-alto-navy text-white shadow-lg scale-110' : 'bg-gray-200 text-gray-500 group-hover:bg-gray-300'
              }`}>
                <span className="font-bold font-display text-lg">{idx + 1}</span>
              </div>
              <div>
                <h3 className={`text-xl font-bold mb-2 transition-colors ${activeStep === idx ? 'text-alto-navy' : 'text-gray-600'}`}>
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Animated Mockup */}
        <div className="relative mx-auto lg:mr-0 pt-8 lg:pt-0">
            {/* Phone Frame */}
            <div className="relative border-gray-900 bg-gray-900 border-[12px] rounded-[2.5rem] h-[540px] w-[290px] shadow-2xl flex flex-col overflow-hidden mx-auto z-10">
                {/* Camera Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[24px] w-32 bg-black rounded-b-xl z-30"></div>
                
                {/* Screen Content Container */}
                <div className="flex-1 bg-gray-50 w-full h-full pt-8 relative overflow-hidden font-sans">
                    
                    {/* Screen 1: Connect */}
                    <div className={`absolute inset-0 w-full h-full p-5 transition-all duration-500 ease-in-out flex flex-col ${activeStep === 0 ? 'translate-x-0 opacity-100 delay-100' : '-translate-x-full opacity-0'}`}>
                       <div className="mt-6 mb-6">
                         <h4 className="font-bold text-2xl text-alto-navy mb-1">Comptes</h4>
                         <p className="text-sm text-gray-500">Gérez vos intégrations</p>
                       </div>
                       <div className="space-y-4">
                         <IntegrationRow icon={Mail} label="Gmail" connected={true} color="bg-red-100 text-red-600" />
                         <IntegrationRow icon={Calendar} label="G. Calendar" connected={true} color="bg-blue-100 text-blue-600" />
                         <IntegrationRow icon={Calendar} label="Outlook" connected={false} color="bg-blue-50 text-blue-400" />
                         <IntegrationRow icon={Mail} label="Yahoo" connected={false} color="bg-purple-50 text-purple-400" />
                       </div>
                       <div className="mt-auto mb-8 bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-xs text-emerald-800 flex items-center gap-3 shadow-sm">
                         <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                         <span className="font-medium">Synchronisation active</span>
                       </div>
                    </div>

                    {/* Screen 2: Analyze */}
                    <div className={`absolute inset-0 w-full h-full p-5 transition-all duration-500 ease-in-out flex flex-col ${activeStep === 1 ? 'translate-x-0 opacity-100 delay-100' : activeStep < 1 ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0'}`}>
                        <div className="mt-6 mb-6 text-center">
                          <div className="inline-flex items-center justify-center w-14 h-14 bg-alto-navy text-white rounded-2xl mb-3 shadow-lg shadow-alto-navy/20">
                            <Search size={24} className="animate-pulse"/>
                          </div>
                          <h4 className="font-bold text-alto-navy text-lg">Analyse en cours...</h4>
                        </div>

                        <div className="relative">
                          {/* Mock Email Card (Source) */}
                          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-2 transform origin-bottom transition-all duration-700 relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-600">E</div>
                              <div>
                                <span className="text-xs font-bold text-gray-800 block">École Jules Ferry</span>
                                <span className="text-[10px] text-gray-400">À: Parents CM1</span>
                              </div>
                            </div>
                            <div className="h-2 w-3/4 bg-gray-100 rounded mb-2"></div>
                            <div className="h-2 w-full bg-gray-100 rounded mb-2"></div>
                            <div className="h-2 w-1/2 bg-gray-100 rounded"></div>
                            
                            {/* Highlighted content */}
                            <div className="absolute top-[52px] left-4 w-32 h-2 bg-yellow-200/50 rounded animate-pulse"></div>
                          </div>

                          {/* Transformation Arrow */}
                          <div className="flex justify-center my-3 relative z-0">
                            <div className="bg-alto-sage/20 p-2 rounded-full animate-bounce-slow">
                              <Check size={18} className="text-alto-navy" />
                            </div>
                            {/* Connecting line */}
                            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-gradient-to-b from-gray-200 to-alto-sage/50 -z-10"></div>
                          </div>

                          {/* Mock Event Card (Result) */}
                          <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-alto-sage transform transition-all duration-500 translate-y-0 opacity-100">
                            <div className="flex justify-between items-start mb-2">
                              <div className="text-[10px] text-alto-sage font-bold uppercase tracking-wider">Nouvel événement</div>
                              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">Ajouté</span>
                            </div>
                            <div className="font-bold text-alto-navy text-base mb-1">Sortie Piscine 🏊‍♂️</div>
                            <div className="text-xs text-gray-500 font-medium">Mardi 14 mai • 08:30 - 11:30</div>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              <span className="bg-gray-100 text-gray-600 text-[10px] font-medium px-2 py-1 rounded-md border border-gray-200">Sac de sport</span>
                              <span className="bg-gray-100 text-gray-600 text-[10px] font-medium px-2 py-1 rounded-md border border-gray-200">Bonnet</span>
                            </div>
                          </div>
                        </div>
                    </div>

                    {/* Screen 3: Summary */}
                    <div className={`absolute inset-0 w-full h-full bg-[#ECE5DD] transition-all duration-500 ease-in-out flex flex-col ${activeStep === 2 ? 'translate-x-0 opacity-100 delay-100' : 'translate-x-full opacity-0'}`}>
                        {/* WhatsApp Header */}
                        <div className="h-20 bg-[#075E54] flex items-end pb-3 px-4 text-white shadow-md z-10">
                           <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#075E54] font-bold text-sm border border-gray-200">A</div>
                             <div>
                               <span className="font-semibold text-sm block leading-none">Alto</span>
                               <span className="text-[10px] opacity-80">En ligne</span>
                             </div>
                           </div>
                        </div>

                        <div className="p-4 space-y-4 overflow-hidden">
                           <div className="flex justify-center">
                             <span className="bg-[#DDECF2] text-[10px] font-medium px-2 py-1 rounded-lg text-gray-600 shadow-sm">Aujourd'hui</span>
                           </div>

                           <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm text-xs text-gray-800 max-w-[95%] animate-fade-in-up">
                              <p className="font-bold text-alto-navy text-sm mb-2">Résumé du jour ☀️</p>
                              <p className="mb-2 text-gray-600">Bonjour ! Voici l'essentiel pour aujourd'hui :</p>
                              
                              <div className="space-y-2 mb-2">
                                <div className="flex gap-2 bg-red-50 p-2 rounded-lg border border-red-100">
                                  <span className="text-red-500 font-bold mt-0.5">•</span>
                                  <span className="font-medium text-gray-800">Piscine pour Léo <br/><span className="text-gray-500 font-normal text-[10px]">N'oublie pas le sac !</span></span>
                                </div>
                                <div className="flex gap-2 bg-blue-50 p-2 rounded-lg border border-blue-100">
                                  <span className="text-blue-500 font-bold mt-0.5">•</span>
                                  <span className="font-medium text-gray-800">18h: Réunion parents</span>
                                </div>
                              </div>
                              <span className="text-[10px] text-gray-400 block text-right mt-1">08:00</span>
                           </div>
                        </div>
                        
                        {/* Mock Input Area */}
                        <div className="mt-auto bg-[#F0F2F5] p-2 flex items-center gap-2 pb-6">
                           <div className="w-6 h-6 rounded-full bg-white border border-gray-300 text-gray-400 flex items-center justify-center">+</div>
                           <div className="flex-1 bg-white h-8 rounded-full border border-gray-200"></div>
                           <div className="w-8 h-8 rounded-full bg-[#00897B] flex items-center justify-center text-white">
                             <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-1"></div>
                           </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Decorative blob behind phone */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] bg-alto-sage/20 rounded-full blur-3xl -z-10" />
        </div>
      </div>
    </Section>
  );
};

interface IntegrationRowProps {
  icon: React.ElementType;
  label: string;
  connected: boolean;
  color: string;
}

const IntegrationRow: React.FC<IntegrationRowProps> = ({ icon: Icon, label, connected, color }) => (
  <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100">
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
      <span className="text-sm font-bold text-gray-700">{label}</span>
    </div>
    <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${connected ? 'bg-alto-sage' : 'bg-gray-200'}`}>
      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${connected ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
  </div>
);
