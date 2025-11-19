import React, { useState } from 'react';
import { Section } from './ui/Section';
import { Button } from './ui/Button';
import { Send } from 'lucide-react';

export const CTA: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(email) {
      // Simulate API call
      setTimeout(() => setSubmitted(true), 600);
    }
  };

  return (
    <Section id="waitlist" className="mb-20">
      <div className="bg-alto-navy rounded-[3rem] p-8 md:p-16 text-center relative overflow-hidden">
        {/* Decor */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-alto-sage rounded-full opacity-20 blur-3xl"></div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
            Rejoignez Alto avant le lancement
          </h2>
          <p className="text-alto-sageLight text-lg mb-10">
            Les premières places sont limitées. Inscrivez-vous pour bénéficier de 3 mois offerts au lancement officiel.
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="votre@email.com" 
                className="flex-1 px-6 py-4 rounded-full text-alto-navy focus:outline-none focus:ring-2 focus:ring-alto-sage placeholder-gray-400"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" variant="secondary" size="lg" className="whitespace-nowrap">
                Je veux tester Alto
              </Button>
            </form>
          ) : (
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl animate-fade-in">
              <div className="w-16 h-16 bg-alto-sage rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="text-white w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Bienvenue sur la liste !</h3>
              <p className="text-white/80">Nous vous tiendrons informé très prochainement.</p>
            </div>
          )}

          <p className="mt-6 text-white/40 text-sm">
            Promis, nous ne spammerons jamais votre boîte mail.
          </p>
        </div>
      </div>
    </Section>
  );
};