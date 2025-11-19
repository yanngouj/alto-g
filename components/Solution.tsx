import React from 'react';
import { Section } from './ui/Section';
import { Mail, CalendarCheck, MessageCircle } from 'lucide-react';

export const Solution: React.FC = () => {
  const features = [
    {
      icon: Mail,
      title: "Analyse des mails",
      desc: "Alto scanne vos mails pour détecter les événements, factures et infos clés.",
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: CalendarCheck,
      title: "Organisation automatique",
      desc: "Il ajoute directement les événements dans l'agenda partagé de la famille.",
      color: "bg-green-50 text-green-600"
    },
    {
      icon: MessageCircle,
      title: "Résumé WhatsApp",
      desc: "Recevez chaque matin un briefing clair de ce qui vous attend aujourd'hui.",
      color: "bg-orange-50 text-orange-600"
    }
  ];

  return (
    <Section>
      <div className="text-center mb-16">
        <span className="text-alto-sage font-bold tracking-wider uppercase text-sm">La solution Alto</span>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-alto-navy mt-2">
          Votre assistant familial intelligent
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <div key={idx} className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
              <feature.icon className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-display font-bold text-alto-navy mb-3">{feature.title}</h3>
            <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            
            {/* Decorative line */}
            <div className="w-12 h-1 bg-alto-cream mt-6 rounded-full group-hover:w-full transition-all duration-500" />
          </div>
        ))}
      </div>
    </Section>
  );
};