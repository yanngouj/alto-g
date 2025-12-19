import React from 'react';
import { Section } from './ui/Section';
import { Brain, ShieldCheck, Coffee } from 'lucide-react';

export const Benefits: React.FC = () => {
  return (
    <Section className="bg-alto-navy text-white rounded-[3rem] my-10" id="avantages">
      <div className="text-center mb-12 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Imaginez rentrer du travail...</h2>
        <p className="text-lg text-alto-sageLight leading-relaxed">
          ...sans avoir à tout vérifier. Plus d’oublis, plus de rappels de dernière minute. Alto veille, filtre, anticipe.
          Vous retrouvez du temps pour ce qui compte vraiment : vos enfants, vos moments, votre sérénité.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-4 border-t border-white/10 pt-12">
        {/* Benefit 1 */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm mb-2">
            <Brain className="w-10 h-10 text-alto-sage" />
          </div>
          <h3 className="text-xl font-bold text-white">Zéro Charge Mentale</h3>
          <p className="text-sm text-alto-sageLight leading-relaxed max-w-xs">
            Votre "cerveau externe" qui n'oublie jamais rien, même quand vous êtes fatigué.
          </p>
        </div>

        {/* Benefit 2 */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm mb-2">
            <ShieldCheck className="w-10 h-10 text-alto-sage" />
          </div>
          <h3 className="text-xl font-bold text-white">Fiabilité Totale</h3>
          <p className="text-sm text-alto-sageLight leading-relaxed max-w-xs">
            Une organisation sans faille qui sécurise tous les rendez-vous de la famille.
          </p>
        </div>

        {/* Benefit 3 */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm mb-2">
            <Coffee className="w-10 h-10 text-alto-sage" />
          </div>
          <h3 className="text-xl font-bold text-white">Matinées Zen</h3>
          <p className="text-sm text-alto-sageLight leading-relaxed max-w-xs">
            Tout est prêt, tout est clair. La journée commence dans le calme, pas dans l'urgence.
          </p>
        </div>
      </div>
    </Section>
  );
};