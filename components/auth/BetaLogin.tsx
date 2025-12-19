import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { KeyRound, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';

interface BetaLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const BetaLogin: React.FC<BetaLoginProps> = ({ onSuccess, onCancel }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API check
    setTimeout(() => {
      if (code.trim().toUpperCase() === 'ALTO-BETA') {
        onSuccess();
      } else {
        setError('Code invalide ou expiré. Vérifiez vos emails.');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-alto-cream flex flex-col items-center justify-center p-4">
      <button onClick={onCancel} className="absolute top-6 left-6 text-alto-navy font-medium flex items-center gap-2 hover:text-alto-terra transition-colors">
        <ArrowLeft size={20} /> Retour
      </button>

      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-md w-full text-center animate-fade-in-up">
        <div className="w-16 h-16 bg-alto-sage/20 text-alto-navy rounded-2xl flex items-center justify-center mx-auto mb-6">
          <KeyRound size={32} />
        </div>

        <h2 className="text-2xl font-display font-bold text-alto-navy mb-2">Accès Beta Privé</h2>
        <p className="text-gray-600 mb-8">Entrez le code d'activation reçu par email pour configurer votre assistant Alto.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
             <input 
              type="text" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Code (ex: ALTO-2024)"
              className={`w-full text-center text-2xl font-mono uppercase tracking-widest p-4 rounded-xl border-2 focus:outline-none transition-colors ${error ? 'border-red-300 bg-red-50 text-red-900' : 'border-gray-200 focus:border-alto-sage text-alto-navy'}`}
            />
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 text-red-500 text-sm font-medium animate-shake">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={!code || loading}>
            {loading ? 'Vérification...' : 'Accéder à mon espace'}
            {!loading && <ArrowRight size={18} className="ml-2" />}
          </Button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-400">
           Astuce démo : Le code est <strong>ALTO-BETA</strong>
        </div>
      </div>
    </div>
  );
};