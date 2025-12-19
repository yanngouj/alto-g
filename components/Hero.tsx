import React from 'react';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Section } from './ui/Section';
import { PhoneMockup } from './PhoneMockup';

export const Hero: React.FC = () => {
  return (
    <Section className="relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-alto-sage/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-alto-terra/10 rounded-full blur-3xl -z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 text-center lg:text-left z-10">
          <h1 className="text-5xl md:text-6xl font-display font-extrabold text-alto-navy leading-[1.1]">
            Et si l’IA allégeait enfin la <span className="text-alto-sage bg-alto-navy/5 px-2 rounded-lg inline-block transform rotate-[-1deg]">charge mentale</span> familiale ?
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
            Alto anticipe, organise et simplifie le quotidien des familles actives — pour que vous retrouviez du temps, de la clarté et du calme.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <Button size="lg" onClick={() => document.getElementById('waitlist')?.scrollIntoView({behavior: 'smooth'})}>
              Rejoindre la liste d'attente
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <button className="group flex items-center gap-2 font-bold text-alto-navy hover:text-alto-terra transition-colors px-6 py-3">
              <PlayCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
              Voir la démo (1 min)
            </button>
          </div>
          
          <div className="pt-4 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500">
             <div className="flex -space-x-2">
               {[1,2,3,4].map(i => (
                 <img key={i} src={`https://picsum.photos/32/32?random=${i}`} alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
               ))}
             </div>
             <p>Déjà <span className="font-bold text-alto-navy">2,000+</span> familles inscrites</p>
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