import React from 'react';
import { X, Newspaper, ExternalLink, Loader2 } from 'lucide-react';
import { NewsResult } from '../../services/ai';
import { Button } from '../ui/Button';

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  data: NewsResult | null;
}

export const NewsModal: React.FC<NewsModalProps> = ({ isOpen, onClose, loading, data }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-alto-navy/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh] animate-fade-in-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-alto-cream/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-alto-sage/20 rounded-xl flex items-center justify-center text-alto-navy">
              <Newspaper size={20} />
            </div>
            <div>
              <h3 className="font-display font-bold text-alto-navy text-lg">Actualités Famille</h3>
              <p className="text-xs text-gray-500">Tendances & charge mentale (Source: Google)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-10 h-10 text-alto-sage animate-spin mb-4" />
              <p className="text-alto-navy font-medium">Recherche des actualités en cours...</p>
              <p className="text-sm text-gray-400 mt-1">Alto parcourt le web pour vous.</p>
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Main Text content - rendering simple markdown-like text */}
              <div className="prose prose-sm max-w-none text-gray-600">
                {data.text.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-2 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Sources */}
              {data.sources.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Sources consultées</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.sources.map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-alto-sage/10 border border-gray-100 hover:border-alto-sage/30 transition-all group"
                      >
                        <ExternalLink size={14} className="mt-0.5 text-gray-400 group-hover:text-alto-navy shrink-0" />
                        <div>
                          <div className="text-sm font-bold text-alto-navy leading-tight mb-0.5 group-hover:underline">
                            {source.title}
                          </div>
                          <div className="text-[10px] text-gray-400 truncate max-w-[200px]">
                            {new URL(source.uri).hostname}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
             <div className="text-center py-8 text-gray-500">
               Impossible de charger les actualités pour le moment.
             </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <Button variant="primary" size="sm" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
};
