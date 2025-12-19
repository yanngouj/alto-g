import React from 'react';
import { Section } from './ui/Section';
import { Quote } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const testimonials = [
    {
      quote: "Avant, j’avais 12 notifications par jour. Maintenant, j’ai un résumé unique, clair, et tout roule.",
      author: "Claire",
      info: "38 ans, Paris"
    },
    {
      quote: "Alto est devenue notre cerveau partagé, sans stress ni surcharge.",
      author: "Karim",
      info: "41 ans, Lyon"
    }
  ];

  return (
    <Section className="bg-alto-sand/30 rounded-[3rem] mb-10">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-alto-navy">
          Ils ont retrouvé leur tranquillité
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {testimonials.map((item, idx) => (
          <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm relative group hover:shadow-md transition-all">
            <Quote className="absolute top-6 right-6 text-alto-sage/20 w-12 h-12 transform rotate-180" />
            <p className="text-lg text-gray-700 italic leading-relaxed mb-6 relative z-10">
              "{item.quote}"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-alto-navy text-white rounded-full flex items-center justify-center font-bold text-sm">
                {item.author.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-alto-navy">{item.author}</div>
                <div className="text-sm text-gray-500">{item.info}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};