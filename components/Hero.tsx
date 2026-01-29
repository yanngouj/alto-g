import React, { useState } from 'react';
import { ArrowRight, Send } from 'lucide-react';
import { Section } from './ui/Section';
import { PhoneMockup } from './PhoneMockup';

interface HeroProps {
  onHeroSubmit?: (firstName: string, email: string) => void;
}

const avatarInitials = [
  { letter: 'S', bg: 'bg-alto-sage', text: 'text-white' },
  { letter: 'M', bg: 'bg-alto-terra', text: 'text-white' },
  { letter: 'L', bg: 'bg-alto-navy', text: 'text-white' },
  { letter: 'A', bg: 'bg-alto-sageLight', text: 'text-alto-navy' },
];

export const Hero: React.FC<HeroProps> = ({ onHeroSubmit }) => {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName.trim() && email.trim()) {
      onHeroSubmit?.(firstName.trim(), email.trim());
      document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToWaitlist = () => {
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Section className="relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-alto-sage/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-alto-terra/10 rounded-full blur-3xl -z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 text-center lg:text-left z-10">
          <h1 className="text-5xl md:text-6xl font-display font-extrabold text-alto-navy leading-[1.1]">
            Et si l'IA allégeait enfin la <span className="text-alto-sage bg-alto-navy/5 px-2 rounded-lg inline-block transform rotate-[-1deg]">charge mentale</span> familiale ?
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
            Alto anticipe, organise et simplifie le quotidien des familles actives — pour que vous retrouviez du temps, de la clarté et du calme.
          </p>

          {/* Inline quick-signup form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-3 max-w-xl mx-auto lg:mx-0">
            <input
              type="text"
              placeholder="Prénom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="flex-1 px-4 py-3 rounded-full border-2 border-alto-sand bg-white text-alto-navy placeholder-gray-400 focus:outline-none focus:border-alto-sage transition-colors"
              required
            />
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-full border-2 border-alto-sand bg-white text-alto-navy placeholder-gray-400 focus:outline-none focus:border-alto-sage transition-colors"
              required
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-alto-navy text-white font-bold hover:bg-alto-navyLight shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
            >
              <Send className="w-4 h-4" />
              Rejoindre
            </button>
          </form>

          <div className="text-center lg:text-left">
            <button
              type="button"
              onClick={scrollToWaitlist}
              className="text-sm text-gray-500 hover:text-alto-terra transition-colors"
            >
              ou — <span className="underline">Répondre au questionnaire complet (30s)</span>
              <ArrowRight className="inline ml-1 w-3 h-3" />
            </button>
          </div>

          <div className="pt-2 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500">
             <div className="flex -space-x-2">
               {avatarInitials.map(({ letter, bg, text }) => (
                 <div
                   key={letter}
                   className={`w-8 h-8 rounded-full border-2 border-white ${bg} ${text} flex items-center justify-center text-xs font-bold`}
                 >
                   {letter}
                 </div>
               ))}
             </div>
             <p>Déjà <span className="font-bold text-alto-navy">2,847</span> familles déjà inscrites</p>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end mt-10 lg:mt-0">
          <div className="relative z-10 transform lg:rotate-2 transition-transform hover:rotate-0 duration-500">
             <PhoneMockup />
          </div>

          {/* Decorative Circle behind phone */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-alto-sage rounded-full -z-10 opacity-20 animate-pulse" />
        </div>
      </div>
    </Section>
  );
};
