import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

interface FloatingCTAProps {
  hidden?: boolean;
}

export const FloatingCTA: React.FC<FloatingCTAProps> = ({ hidden = false }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.querySelector('section'); // first section = hero
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show bar when hero is out of view
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  if (hidden || !visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 animate-slide-up">
      <div className="bg-white/95 backdrop-blur-md border-t border-alto-sand shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alto-sage opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-alto-sage" />
            </span>
            <p className="text-sm text-alto-navy font-medium truncate">
              Rejoignez <span className="font-bold">2,847 familles</span> sur la liste d'attente
            </p>
          </div>
          <button
            onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-alto-terra text-white text-sm font-bold hover:bg-[#c96a50] shadow-md transition-all"
          >
            S'inscrire maintenant
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
