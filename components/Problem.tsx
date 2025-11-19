import React from 'react';
import { Section } from './ui/Section';
import { MailWarning, CalendarX, BrainCircuit } from 'lucide-react';

export const Problem: React.FC = () => {
  const problems = [
    {
      icon: MailWarning,
      title: "Trop de mails scolaires",
      desc: "Les informations importantes sont noyées dans un flux continu de newsletters et de notifications."
    },
    {
      icon: CalendarX,
      title: "Trop d'agendas à concilier",
      desc: "Entre les activités des enfants, le travail et la maison, la synchronisation est un casse-tête quotidien."
    },
    {
      icon: BrainCircuit,
      title: "Trop de charge mentale",
      desc: "La peur constante d'oublier un rendez-vous, une inscription ou un paiement crée des tensions inutiles."
    }
  ];

  return (
    <Section className="bg-white rounded-[3rem] my-10 shadow-sm">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-alto-navy mb-6">
          La charge mentale familiale est devenue ingérable.
        </h2>
        <p className="text-lg text-gray-600">
          Vous passez plus de temps à organiser votre vie qu'à en profiter.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {problems.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center text-center space-y-4 group">
            <div className="w-20 h-20 bg-alto-cream rounded-2xl flex items-center justify-center mb-2 group-hover:bg-alto-sage/20 transition-colors duration-300">
              <item.icon className="w-10 h-10 text-alto-navy" />
            </div>
            <h3 className="text-xl font-bold text-alto-navy">{item.title}</h3>
            <p className="text-gray-600 leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
};