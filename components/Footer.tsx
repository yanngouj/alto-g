import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white py-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-alto-navy rounded-lg flex items-center justify-center text-white font-display font-bold">
             A
           </div>
           <span className="font-display font-bold text-xl text-alto-navy">Alto</span>
        </div>
        
        <div className="flex gap-8 text-sm text-gray-500">
          <a href="#" className="hover:text-alto-navy transition-colors">Mentions légales</a>
          <a href="#" className="hover:text-alto-navy transition-colors">Confidentialité</a>
          <a href="#" className="hover:text-alto-navy transition-colors">Contact</a>
        </div>

        <div className="text-sm text-gray-400">
          © {new Date().getFullYear()} Alto Assistant. Paris, France.
        </div>
      </div>
    </footer>
  );
};