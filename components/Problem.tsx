import React from 'react';
import { Section } from './ui/Section';
import { MailWarning, CalendarX, BrainCircuit } from 'lucide-react';

export const Problem: React.FC = () => {
  return (
    <Section className="bg-white rounded-[3rem] my-10 shadow-sm">
      <div className="text-center max-w-4xl mx-auto mb-10">
        <span className="text-alto-sage font-bold tracking-wider uppercase text-sm mb-2 block">Intérêt</span>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-alto-navy mb-6">
          La vie de famille, c’est un joyeux chaos.
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          Mails, activités extrascolaires, groupes WhatsApp, contrats à signer... 
          Alto analyse vos échanges, repère les informations importantes et crée automatiquement rappels, résumés et actions concrètes.
        </p>
        <p className="text-xl font-bold text-alto-navy mt-6">
          Vous n’avez plus rien à saisir. Vous vivez votre vie, Alto s’occupe du reste.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
         <div className="bg-alto-cream/50 p-6 rounded-2xl text-center hover:bg-alto-cream transition-colors">
           <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 text-alto-terra shadow-sm">
             <MailWarning />
           </div>
           <h3 className="font-bold text-alto-navy mb-2">Flux continu</h3>
           <p className="text-sm text-gray-500">Il filtre le bruit pour ne garder que l'essentiel.</p>
         </div>
         
         <div className="bg-alto-cream/50 p-6 rounded-2xl text-center hover:bg-alto-cream transition-colors">
           <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 text-alto-navy shadow-sm">
             <CalendarX />
           </div>
           <h3 className="font-bold text-alto-navy mb-2">Zéro saisie</h3>
           <p className="text-sm text-gray-500">Plus besoin de reporter manuellement chaque date.</p>
         </div>

         <div className="bg-alto-cream/50 p-6 rounded-2xl text-center hover:bg-alto-cream transition-colors">
           <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 text-alto-sage shadow-sm">
             <BrainCircuit />
           </div>
           <h3 className="font-bold text-alto-navy mb-2">Esprit libre</h3>
           <p className="text-sm text-gray-500">Retrouvez la sérénité de ne rien oublier.</p>
         </div>
      </div>
    </Section>
  );
};