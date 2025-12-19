import React from 'react';
import { Section } from './ui/Section';
import { Search, CalendarCheck, MessageCircle, Sparkles } from 'lucide-react';

export const Solution: React.FC = () => {
  const features = [
    {
      icon: Search,
      title: "Analyse automatique",
      desc: "Analyse des mails et calendriers pour détecter ce qui compte.",
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: CalendarCheck,
      title: "Création d’événements",
      desc: "Ajout intelligent et partagé sans aucune intervention de votre part.",
      color: "bg-green-50 text-green-600"
    },
    {
      icon: MessageCircle,
      title: "Résumés WhatsApp",
      desc: "Recevez chaque matin un briefing clair de votre journée.",
      color: "bg-orange-50 text-orange-600"
    },
    {
      icon: Sparkles,
      title: "Apprentissage continu",
      desc: "Alto s'adapte à votre rythme familial pour être de plus en plus pertinent.",
      color: "bg-purple-50 text-purple-600"
    }
  ];

  return (
    <Section>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
            <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
              <feature.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-display font-bold text-alto-navy mb-2 leading-tight">{feature.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </Section>
  );
};