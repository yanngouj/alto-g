import React from 'react';
import { Section } from './ui/Section';
import { Brain, ShieldCheck, Coffee } from 'lucide-react';

export const Benefits: React.FC = () => {
  return (
    <Section className="bg-alto-navy text-white rounded-[3rem] my-10" id="avantages">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-display font-bold">Pourquoi choisir Alto ?</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-4">
        {/* Benefit 1 */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm mb-4">
            <Brain className="w-12 h-12 text-alto-sage" />
          </div>
          <h3 className="text-2xl font-bold text-white">Moins de charge mentale</h3>
          <p className="text-alto-sageLight leading-relaxed max-w-xs">
            Libérez votre esprit. Alto stocke, trie et vous rappelle tout ce qui est important, au bon moment.
          </p>
        </div>

        {/* Benefit 2 */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm mb-4">
            <ShieldCheck className="w-12 h-12 text-alto-sage" />
          </div>
          <h3 className="text-2xl font-bold text-white">Une organisation fiable</h3>
          <p className="text-alto-sageLight leading-relaxed max-w-xs">
            Fini les oublis de dernière minute. La fiabilité d'un assistant personnel pour toute la famille.
          </p>
        </div>

        {/* Benefit 3 */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm mb-4">
            <Coffee className="w-12 h-12 text-alto-sage" />
          </div>
          <h3 className="text-2xl font-bold text-white">Un briefing simple</h3>
          <p className="text-alto-sageLight leading-relaxed max-w-xs">
            Commencez la journée sereinement avec un résumé clair envoyé directement sur votre téléphone.
          </p>
        </div>
      </div>
    </Section>
  );
};