import React from 'react';
import { Section } from './ui/Section';

export const TargetAudience: React.FC = () => {
  const audience = [
    { title: "Familles urbaines actives", emoji: "🏙️" },
    { title: "Couples débordés", emoji: "🏃💨" },
    { title: "Familles recomposées", emoji: "🧩" },
    { title: "Parents solos", emoji: "🦸" },
  ];

  return (
    <Section className="bg-alto-sand/30 rounded-[3rem]">
      <div className="flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="md:w-1/2">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-alto-navy mb-6">
            Pour les familles actives qui veulent reprendre le contrôle.
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            Alto a été conçu pour ceux qui jonglent avec mille responsabilités et qui refusent que l'organisation logistique prenne le pas sur les moments de qualité.
          </p>
          <ul className="space-y-3">
            {['Sécurité des données garantie', 'Compatible tout agenda', 'Sans engagement'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-alto-navy font-medium">
                <div className="w-6 h-6 rounded-full bg-alto-sage/30 flex items-center justify-center">
                  <span className="text-alto-navy text-sm">✓</span>
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="md:w-1/2 grid grid-cols-2 gap-4">
          {audience.map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center aspect-square">
              <span className="text-4xl mb-3">{item.emoji}</span>
              <span className="font-bold text-alto-navy">{item.title}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};