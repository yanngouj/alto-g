import React from 'react';
import { Section } from './ui/Section';
import { Link2, Search, Smartphone } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: "01",
      title: "Connectez vos comptes",
      desc: "Liez simplement votre adresse Gmail et vos agendas (Google, Apple, Outlook) à Alto de manière sécurisée.",
      icon: Link2
    },
    {
      num: "02",
      title: "Alto analyse et organise",
      desc: "L'IA d'Alto scanne vos emails entrants pour détecter les événements scolaires, RDV et tâches.",
      icon: Search
    },
    {
      num: "03",
      title: "Recevez votre résumé",
      desc: "Chaque matin, ou lorsqu'une info urgente tombe, vous recevez une notification WhatsApp claire.",
      icon: Smartphone
    }
  ];

  return (
    <Section id="comment-ca-marche">
       <div className="text-center mb-20">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-alto-navy">Comment ça marche ?</h2>
        <p className="text-gray-600 mt-4">La magie opère en trois étapes simples</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {/* Connecting Line (Desktop only) */}
        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-1 bg-alto-sage/20 -z-10" />

        {steps.map((step, idx) => (
          <div key={idx} className="relative flex flex-col items-center text-center bg-white md:bg-transparent p-6 rounded-2xl md:p-0 shadow-sm md:shadow-none">
            <div className="w-24 h-24 bg-alto-cream rounded-full flex items-center justify-center border-4 border-white shadow-lg mb-6 z-10">
               <step.icon className="w-10 h-10 text-alto-navy" />
               <div className="absolute -top-2 -right-2 w-8 h-8 bg-alto-terra text-white rounded-full flex items-center justify-center font-bold shadow-sm">
                 {step.num}
               </div>
            </div>
            <h3 className="text-xl font-bold text-alto-navy mb-2">{step.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed max-w-[250px]">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
};