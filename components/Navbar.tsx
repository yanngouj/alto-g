import React, { useState, useEffect } from 'react';
import { Menu, X, LayoutDashboard, KeyRound } from 'lucide-react';
import { Button } from './ui/Button';

interface NavbarProps {
  onEnterDemo?: () => void;
  onEnterBeta?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onEnterDemo, onEnterBeta }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
           {/* Logo Symbol */}
           <div className="w-10 h-10 bg-alto-navy rounded-xl flex items-center justify-center text-white font-display font-bold text-xl">
             A
           </div>
           <span className="font-display font-bold text-2xl text-alto-navy">Alto</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#comment-ca-marche" className="text-alto-navy font-medium hover:text-alto-terra transition-colors">Comment ça marche</a>
          <a href="#avantages" className="text-alto-navy font-medium hover:text-alto-terra transition-colors">Avantages</a>
          
          <div className="flex items-center gap-3">
            {onEnterDemo && (
              <button 
                onClick={onEnterDemo}
                className="text-alto-navy/70 font-medium hover:text-alto-navy flex items-center gap-2 text-sm px-3 py-2 rounded-lg hover:bg-alto-cream transition-colors"
              >
                <LayoutDashboard size={16} />
                Démo publique
              </button>
            )}
            {onEnterBeta && (
              <Button variant="secondary" size="sm" onClick={onEnterBeta} className="flex items-center gap-2">
                <KeyRound size={16} />
                Connexion Beta
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={() => document.getElementById('waitlist')?.scrollIntoView({behavior: 'smooth'})}>
              Rejoindre la liste
            </Button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-alto-navy" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg p-6 flex flex-col gap-4 border-t border-gray-100">
          <a href="#comment-ca-marche" className="text-lg font-medium text-alto-navy" onClick={() => setMobileMenuOpen(false)}>Comment ça marche</a>
          <a href="#avantages" className="text-lg font-medium text-alto-navy" onClick={() => setMobileMenuOpen(false)}>Avantages</a>
          
          <div className="border-t border-gray-100 my-2 pt-4 space-y-3">
            {onEnterBeta && (
               <button 
                 onClick={() => { setMobileMenuOpen(false); onEnterBeta(); }}
                 className="w-full text-left text-lg font-medium text-alto-navy flex items-center gap-2 bg-alto-cream/50 p-3 rounded-xl"
               >
                 <KeyRound size={20} />
                 J'ai un code Beta
               </button>
            )}
            {onEnterDemo && (
               <button 
                 onClick={() => { setMobileMenuOpen(false); onEnterDemo(); }}
                 className="w-full text-left text-lg font-medium text-gray-500 flex items-center gap-2 px-3"
               >
                 <LayoutDashboard size={20} />
                 Voir la démo publique
               </button>
            )}
          </div>
          
          <Button className="w-full mt-2" onClick={() => {
            setMobileMenuOpen(false);
            document.getElementById('waitlist')?.scrollIntoView({behavior: 'smooth'});
          }}>
            Rejoindre la liste
          </Button>
        </div>
      )}
    </nav>
  );
};