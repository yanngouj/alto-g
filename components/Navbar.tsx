import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/Button';

export const Navbar: React.FC = () => {
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
          <Button variant="primary" size="sm" onClick={() => document.getElementById('waitlist')?.scrollIntoView({behavior: 'smooth'})}>
            Rejoindre la liste d'attente
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-alto-navy" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg p-6 flex flex-col gap-4">
          <a href="#comment-ca-marche" className="text-lg font-medium text-alto-navy" onClick={() => setMobileMenuOpen(false)}>Comment ça marche</a>
          <a href="#avantages" className="text-lg font-medium text-alto-navy" onClick={() => setMobileMenuOpen(false)}>Avantages</a>
          <Button className="w-full" onClick={() => {
            setMobileMenuOpen(false);
            document.getElementById('waitlist')?.scrollIntoView({behavior: 'smooth'});
          }}>
            Rejoindre
          </Button>
        </div>
      )}
    </nav>
  );
};