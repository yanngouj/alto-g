import React, { useState } from 'react';
import { Section } from './ui/Section';
import { Button } from './ui/Button';
import { Send, Lock, Sparkles, ChevronRight, User, Mail, ArrowLeft, MapPin, Baby, HelpCircle } from 'lucide-react';

type Step = 'contact' | 'details' | 'success';

interface FormData {
  firstName: string;
  email: string;
  city: string;
  hasChildren: boolean | null;
  familyType: string;
  schoolLevels: string[];
  mainPainPoint: string;
  currentFeeling: string;
  idealUsage: string;
  techStack: string[];
  desiredVersion: string[];
  aiLevel: string;
}

export const CTA: React.FC = () => {
  const [step, setStep] = useState<Step>('contact');
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    email: '',
    city: '',
    hasChildren: null,
    familyType: '',
    schoolLevels: [],
    mainPainPoint: '',
    currentFeeling: '',
    idealUsage: '',
    techStack: [],
    desiredVersion: [],
    aiLevel: ''
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email && formData.firstName && formData.hasChildren !== null) {
      setStep('details');
      // Scroll to top of section smoothly to ensure user sees the new step
      document.getElementById('waitlist-form-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => setStep('success'), 600);
  };

  const toggleSelection = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const list = prev[field] as string[];
      if (list.includes(value)) {
        return { ...prev, [field]: list.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...list, value] };
      }
    });
  };

  const setSingleSelection = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Section id="waitlist" className="mb-20">
      <div id="waitlist-form-container" className="bg-alto-navy rounded-[3rem] p-6 md:p-12 text-center relative overflow-hidden transition-all duration-500 ease-in-out min-h-[600px] flex flex-col justify-center">
        {/* Decor */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-alto-sage rounded-full opacity-20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-50px] left-[-50px] w-80 h-80 bg-alto-terra rounded-full opacity-10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl mx-auto w-full">
          
          {/* STEP 1: CONTACT & INITIAL SEGMENTATION */}
          {step === 'contact' && (
            <div className="animate-fade-in">
              <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
                Votre famille mérite un peu d’intelligence tranquille.
              </h2>
              <p className="text-alto-sageLight text-lg mb-10 max-w-xl mx-auto">
                Rejoignez les 2,000+ familles qui simplifient leur quotidien. Accès anticipé gratuit.
              </p>

              <form onSubmit={handleContactSubmit} className="flex flex-col gap-4 max-w-md mx-auto mb-8">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="Votre prénom" 
                    className="w-full pl-12 pr-6 py-4 rounded-2xl text-alto-navy focus:outline-none focus:ring-2 focus:ring-alto-sage placeholder-gray-400 shadow-inner"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="email" 
                    placeholder="votre@email.com" 
                    className="w-full pl-12 pr-6 py-4 rounded-2xl text-alto-navy focus:outline-none focus:ring-2 focus:ring-alto-sage placeholder-gray-400 shadow-inner"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="Votre ville (optionnel)" 
                    className="w-full pl-12 pr-6 py-4 rounded-2xl text-alto-navy focus:outline-none focus:ring-2 focus:ring-alto-sage placeholder-gray-400 shadow-inner"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>

                {/* Initial Segmentation: Children? */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <label className="block text-white text-sm font-bold mb-3">Avez-vous des enfants ?</label>
                  <div className="flex gap-4 justify-center">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, hasChildren: true})}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all ${formData.hasChildren === true ? 'bg-alto-sage text-alto-navy' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                      Oui
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, hasChildren: false})}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all ${formData.hasChildren === false ? 'bg-white text-alto-navy' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                      Non
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  variant="secondary" 
                  size="lg" 
                  className="w-full font-bold mt-2"
                  disabled={!formData.email || !formData.firstName || formData.hasChildren === null}
                >
                  Rejoindre la liste d'attente
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </form>
              
              <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-alto-sageLight text-sm opacity-80">
                 <span className="flex items-center gap-1"><Sparkles size={14} /> Accès Beta</span>
                 <span className="flex items-center gap-1"><Lock size={14} /> Données privées</span>
                 <span>Pas de CB requise</span>
              </div>
            </div>
          )}

          {/* STEP 2: QUALIFICATION & PREFERENCES */}
          {step === 'details' && (
            <div className="animate-fade-in text-left">
              <button onClick={() => setStep('contact')} className="text-alto-sageLight hover:text-white flex items-center gap-2 mb-6 text-sm transition-colors">
                <ArrowLeft size={16} /> Retour
              </button>
              
              <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
                Merci {formData.firstName} ! 👋
              </h3>
              <p className="text-alto-sageLight mb-8">
                2 minutes pour adapter Alto à votre famille.
              </p>

              <form onSubmit={handleDetailsSubmit} className="space-y-8">
                
                {/* SECTION A: FAMILY CONTEXT (Only if has children) */}
                {formData.hasChildren && (
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-6">
                    <div className="flex items-center gap-2 text-alto-sage font-bold uppercase text-xs tracking-wider">
                      <Baby size={16} /> Contexte Familial
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-white">Votre situation</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['Classique', 'Recomposée', 'Solo', 'Autre'].map(opt => (
                          <div 
                            key={opt}
                            onClick={() => setSingleSelection('familyType', opt)}
                            className={`cursor-pointer rounded-xl p-3 text-center text-sm font-medium transition-all border-2 ${formData.familyType === opt ? 'bg-alto-sage border-alto-sage text-alto-navy' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-white">Niveaux scolaires</label>
                      <div className="flex flex-wrap gap-2">
                        {['Maternelle', 'CP-CE1', 'CE2-CM2', 'Collège', 'Lycée'].map(opt => (
                          <div 
                            key={opt}
                            onClick={() => toggleSelection('schoolLevels', opt)}
                            className={`cursor-pointer rounded-full px-4 py-2 text-sm transition-all border ${formData.schoolLevels.includes(opt) ? 'bg-white text-alto-navy border-white font-bold' : 'bg-transparent text-alto-sageLight border-white/20 hover:border-white/50'}`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION B: PAIN POINTS & FEELING */}
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-6">
                  <div className="flex items-center gap-2 text-alto-sage font-bold uppercase text-xs tracking-wider">
                    <HelpCircle size={16} /> Vos Besoins
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-white">Ce qui pèse le plus (Charge mentale)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {['Mails d’école', 'Agenda famille', 'Devoirs / Activités', 'Coordination parents', 'Nounou / Intervenants', 'Administratif'].map(opt => (
                        <div 
                          key={opt}
                          onClick={() => setSingleSelection('mainPainPoint', opt)}
                          className={`cursor-pointer rounded-lg px-4 py-3 text-sm text-left transition-all border ${formData.mainPainPoint === opt ? 'bg-white/20 border-white text-white font-bold' : 'bg-transparent text-alto-sageLight border-white/10 hover:bg-white/5'}`}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-white">Gérer le quotidien c'est...</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Très compliqué', emoji: '🌪️' },
                        { label: 'Parfois dur', emoji: '😕' },
                        { label: 'Gérable', emoji: '🙂' },
                        { label: 'Simple', emoji: '😌' }
                      ].map(opt => (
                        <div 
                          key={opt.label}
                          onClick={() => setSingleSelection('currentFeeling', opt.label)}
                          className={`cursor-pointer rounded-xl p-3 text-center transition-all border-2 ${formData.currentFeeling === opt.label ? 'bg-alto-sage border-alto-sage text-alto-navy' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                        >
                          <div className="text-2xl mb-1">{opt.emoji}</div>
                          <div className="text-xs font-medium">{opt.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-white">Usage idéal (1 phrase)</label>
                    <textarea 
                      rows={2}
                      placeholder="Ex: Je veux juste arrêter d'oublier les affaires de piscine..."
                      className="w-full p-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-alto-sage text-sm"
                      value={formData.idealUsage}
                      onChange={(e) => setFormData({...formData, idealUsage: e.target.value})}
                    />
                  </div>
                </div>

                {/* SECTION C: TECH & PREFS */}
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-6">
                  <div className="flex items-center gap-2 text-alto-sage font-bold uppercase text-xs tracking-wider">
                    <Sparkles size={16} /> Préférences
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-white">Outils utilisés</label>
                    <div className="flex flex-wrap gap-2">
                      {['Gmail', 'Outlook', 'Google Agenda', 'Apple Calendar'].map(opt => (
                        <div 
                          key={opt}
                          onClick={() => toggleSelection('techStack', opt)}
                          className={`cursor-pointer rounded-full px-4 py-2 text-sm transition-all border ${formData.techStack.includes(opt) ? 'bg-white text-alto-navy border-white font-bold' : 'bg-transparent text-alto-sageLight border-white/20 hover:border-white/50'}`}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-white">Format préféré</label>
                      <div className="flex flex-wrap gap-2">
                        {['WhatsApp', 'App Mobile', 'Web'].map(opt => (
                          <div 
                            key={opt}
                            onClick={() => toggleSelection('desiredVersion', opt)}
                            className={`cursor-pointer rounded-full px-4 py-2 text-sm transition-all border ${formData.desiredVersion.includes(opt) ? 'bg-white text-alto-navy border-white font-bold' : 'bg-transparent text-alto-sageLight border-white/20 hover:border-white/50'}`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-white">Aisance IA</label>
                      <div className="flex rounded-full bg-white/10 p-1">
                        {['Débutant', 'Interm.', 'Avancé'].map(opt => (
                          <div 
                            key={opt}
                            onClick={() => setSingleSelection('aiLevel', opt)}
                            className={`flex-1 cursor-pointer rounded-full py-1.5 text-xs text-center transition-all font-medium ${formData.aiLevel === opt ? 'bg-white text-alto-navy shadow-sm' : 'text-white hover:bg-white/10'}`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" variant="secondary" size="lg" className="w-full font-bold">
                    Valider mon inscription
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'success' && (
            <div className="bg-white/10 backdrop-blur-md p-8 md:p-12 rounded-3xl animate-fade-in border border-white/10">
              <div className="w-20 h-20 bg-alto-sage rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce-slow">
                <Send className="text-white w-10 h-10" />
              </div>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">Bienvenue sur la liste !</h3>
              <p className="text-alto-sageLight text-lg mb-6">
                Merci pour ces précisions précieuses. Nous vous contacterons très prochainement pour vous donner accès à la beta privée.
              </p>
              <div className="bg-white/5 rounded-xl p-4 text-sm text-white/80 max-w-sm mx-auto">
                <p>Un email de confirmation vient d'être envoyé à <span className="text-white font-bold">{formData.email}</span></p>
              </div>
            </div>
          )}

        </div>
      </div>
    </Section>
  );
};
