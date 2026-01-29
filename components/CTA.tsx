import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Section } from './ui/Section';
import {
  User, Mail, MapPin, ChevronRight, ChevronLeft,
  Loader2, AlertCircle, Check, Copy, Share2,
  Sparkles, Bell, Rocket, Lock, MessageCircle
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

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

interface CTAProps {
  prefillFirstName?: string;
  prefillEmail?: string;
  onSuccess?: () => void;
}

/* ───────── Stepper ───────── */
const Stepper: React.FC<{ currentStep: number; totalSteps: number }> = ({ currentStep, totalSteps }) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((s) => {
        const done = s < currentStep;
        const active = s === currentStep;
        return (
          <React.Fragment key={s}>
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                done
                  ? 'bg-alto-sage text-white'
                  : active
                  ? 'bg-alto-navy text-white shadow-lg ring-4 ring-alto-navy/20'
                  : 'bg-alto-sand text-gray-400'
              }`}
            >
              {done ? <Check className="w-4 h-4" /> : s}
            </div>
            {s < totalSteps && (
              <div
                className={`w-10 h-0.5 transition-all duration-300 ${
                  s < currentStep ? 'bg-alto-sage' : 'bg-alto-sand'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ───────── Confetti ───────── */
const Confetti: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const colors = ['#9EB89E', '#E07A5F', '#1B3B6F', '#C8DBC8', '#EFEBE0', '#FFD700'];
    const pieces: { x: number; y: number; w: number; h: number; color: string; vx: number; vy: number; rot: number; rv: number; opacity: number }[] = [];

    for (let i = 0; i < 120; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -Math.random() * canvas.height * 0.5,
        w: Math.random() * 8 + 4,
        h: Math.random() * 6 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        rot: Math.random() * Math.PI * 2,
        rv: (Math.random() - 0.5) * 0.15,
        opacity: 1,
      });
    }

    let frame: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of pieces) {
        if (p.opacity <= 0) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.rot += p.rv;
        if (p.y > canvas.height * 0.7) p.opacity -= 0.02;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-20"
    />
  );
};

/* ───────── Main CTA ───────── */
export const CTA: React.FC<CTAProps> = ({ prefillFirstName, prefillEmail, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [queuePosition] = useState(() => Math.floor(Math.random() * 400) + 2400);
  const containerRef = useRef<HTMLDivElement>(null);

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
    aiLevel: '',
  });

  // Accept prefill values from the Hero form
  useEffect(() => {
    if (prefillFirstName || prefillEmail) {
      setFormData((prev) => ({
        ...prev,
        firstName: prefillFirstName || prev.firstName,
        email: prefillEmail || prev.email,
      }));
    }
  }, [prefillFirstName, prefillEmail]);

  const scrollToTop = useCallback(() => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  /* ── Helpers ── */
  const toggleSelection = (field: keyof FormData, value: string) => {
    setFormData((prev) => {
      const list = prev[field] as string[];
      return {
        ...prev,
        [field]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      };
    });
  };

  const setSingleSelection = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field] === value ? '' : value,
    }));
  };

  /* ── Navigation ── */
  const goNext = () => {
    setCurrentStep((s) => Math.min(s + 1, 4));
    scrollToTop();
  };

  const goBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 1));
    scrollToTop();
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email && formData.firstName && formData.hasChildren !== null) {
      goNext();
    }
  };

  const submitForm = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setCurrentStep(4);
        scrollToTop();
        onSuccess?.();
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de l'inscription");
      }
    } catch {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Next = () => {
    submitForm();
  };

  const handleSkip = () => {
    if (currentStep === 3) {
      submitForm();
    } else {
      goNext();
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ───────── Chip helpers ───────── */
  const SingleChip: React.FC<{ label: string; selected: boolean; onClick: () => void }> = ({ label, selected, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all border-2 ${
        selected
          ? 'bg-alto-navy text-white border-alto-navy'
          : 'bg-white text-gray-600 border-alto-sand hover:border-alto-sage'
      }`}
    >
      {label}
    </button>
  );

  const MultiChip: React.FC<{ label: string; selected: boolean; onClick: () => void }> = ({ label, selected, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all border-2 ${
        selected
          ? 'bg-alto-sage text-white border-alto-sage'
          : 'bg-white text-gray-600 border-alto-sand hover:border-alto-sage'
      }`}
    >
      {label}
    </button>
  );

  const EmojiCard: React.FC<{ emoji: string; label: string; selected: boolean; onClick: () => void }> = ({ emoji, label, selected, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-4 rounded-2xl transition-all border-2 ${
        selected
          ? 'bg-alto-navy text-white border-alto-navy shadow-lg scale-105'
          : 'bg-white text-gray-600 border-alto-sand hover:border-alto-sage hover:shadow-md'
      }`}
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  /* ───────── Step content ───────── */
  const renderStep = () => {
    switch (currentStep) {
      /* ── Step 1: Vos informations ── */
      case 1:
        return (
          <form onSubmit={handleStep1Submit} className="space-y-5 animate-slide-in">
            <div>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-alto-navy mb-2">
                Vos informations
              </h3>
              <p className="text-gray-500 mb-6">Rejoignez les 2,847 familles sur la liste d'attente.</p>
            </div>

            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Votre prénom"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-alto-sand bg-white text-alto-navy focus:outline-none focus:border-alto-sage placeholder-gray-400 transition-colors"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                placeholder="votre@email.com"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-alto-sand bg-white text-alto-navy focus:outline-none focus:border-alto-sage placeholder-gray-400 transition-colors"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Votre ville (optionnel)"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-alto-sand bg-white text-alto-navy focus:outline-none focus:border-alto-sage placeholder-gray-400 transition-colors"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            {/* Has children toggle */}
            <div className="bg-alto-cream p-5 rounded-2xl">
              <label className="block text-alto-navy text-sm font-bold mb-3">Avez-vous des enfants ?</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, hasChildren: true })}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 ${
                    formData.hasChildren === true
                      ? 'bg-alto-sage text-white border-alto-sage'
                      : 'bg-white text-gray-500 border-alto-sand hover:border-alto-sage'
                  }`}
                >
                  Oui
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, hasChildren: false })}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 ${
                    formData.hasChildren === false
                      ? 'bg-alto-navy text-white border-alto-navy'
                      : 'bg-white text-gray-500 border-alto-sand hover:border-alto-sage'
                  }`}
                >
                  Non
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!formData.email || !formData.firstName || formData.hasChildren === null}
              className="w-full py-4 rounded-2xl bg-alto-navy text-white font-bold text-lg hover:bg-alto-navyLight shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Continuer
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="flex justify-center items-center gap-4 text-gray-400 text-xs pt-2">
              <span className="flex items-center gap-1"><Sparkles size={12} /> Accès Beta</span>
              <span className="flex items-center gap-1"><Lock size={12} /> Données privées</span>
              <span>Pas de CB requise</span>
            </div>
          </form>
        );

      /* ── Step 2: Votre famille ── */
      case 2:
        return (
          <div className="space-y-6 animate-slide-in">
            <div>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-alto-navy mb-2">
                Votre famille
              </h3>
              <p className="text-gray-500 mb-6">Aidez-nous à personnaliser Alto pour vous.</p>
            </div>

            {/* Family type */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-alto-navy">Votre situation</label>
              <div className="flex flex-wrap gap-2">
                {['Classique', 'Recomposée', 'Solo', 'Autre'].map((opt) => (
                  <SingleChip
                    key={opt}
                    label={opt}
                    selected={formData.familyType === opt}
                    onClick={() => setSingleSelection('familyType', opt)}
                  />
                ))}
              </div>
            </div>

            {/* School levels */}
            {formData.hasChildren && (
              <div className="space-y-3">
                <label className="text-sm font-bold text-alto-navy">Niveaux scolaires</label>
                <div className="flex flex-wrap gap-2">
                  {['Maternelle', 'CP-CE1', 'CE2-CM2', 'Collège', 'Lycée'].map((opt) => (
                    <MultiChip
                      key={opt}
                      label={opt}
                      selected={formData.schoolLevels.includes(opt)}
                      onClick={() => toggleSelection('schoolLevels', opt)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={goBack}
                className="p-3 rounded-xl border-2 border-alto-sand text-gray-400 hover:text-alto-navy hover:border-alto-sage transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="flex-1 py-4 rounded-2xl bg-alto-navy text-white font-bold text-lg hover:bg-alto-navyLight shadow-lg transition-all flex items-center justify-center gap-2"
              >
                Continuer
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center">
              <button type="button" onClick={handleSkip} className="text-sm text-gray-400 hover:text-alto-terra transition-colors underline">
                Passer cette étape
              </button>
            </div>
          </div>
        );

      /* ── Step 3: Vos préférences ── */
      case 3:
        return (
          <div className="space-y-6 animate-slide-in">
            <div>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-alto-navy mb-2">
                Vos préférences
              </h3>
              <p className="text-gray-500 mb-6">Dernière étape — presque fini !</p>
            </div>

            {/* Main pain point */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-alto-navy">Ce qui pèse le plus</label>
              <div className="flex flex-wrap gap-2">
                {['Mails d\'école', 'Agenda famille', 'Devoirs / Activités', 'Coordination parents', 'Nounou / Intervenants', 'Administratif'].map((opt) => (
                  <SingleChip
                    key={opt}
                    label={opt}
                    selected={formData.mainPainPoint === opt}
                    onClick={() => setSingleSelection('mainPainPoint', opt)}
                  />
                ))}
              </div>
            </div>

            {/* Current feeling */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-alto-navy">Gérer le quotidien c'est...</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Très compliqué', emoji: '🌪️' },
                  { label: 'Parfois dur', emoji: '😕' },
                  { label: 'Gérable', emoji: '🙂' },
                  { label: 'Simple', emoji: '😌' },
                ].map((opt) => (
                  <EmojiCard
                    key={opt.label}
                    emoji={opt.emoji}
                    label={opt.label}
                    selected={formData.currentFeeling === opt.label}
                    onClick={() => setSingleSelection('currentFeeling', opt.label)}
                  />
                ))}
              </div>
            </div>

            {/* Desired format */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-alto-navy">Format souhaité</label>
              <div className="flex flex-wrap gap-2">
                {['WhatsApp', 'App Mobile', 'Web'].map((opt) => (
                  <MultiChip
                    key={opt}
                    label={opt}
                    selected={formData.desiredVersion.includes(opt)}
                    onClick={() => toggleSelection('desiredVersion', opt)}
                  />
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={goBack}
                className="p-3 rounded-xl border-2 border-alto-sand text-gray-400 hover:text-alto-navy hover:border-alto-sage transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleStep3Next}
                disabled={loading}
                className="flex-1 py-4 rounded-2xl bg-alto-terra text-white font-bold text-lg hover:bg-[#c96a50] shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Inscription en cours...
                  </>
                ) : (
                  <>
                    Valider mon inscription
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
            <div className="text-center">
              <button type="button" onClick={handleSkip} disabled={loading} className="text-sm text-gray-400 hover:text-alto-terra transition-colors underline disabled:opacity-40">
                Passer et s'inscrire
              </button>
            </div>
          </div>
        );

      /* ── Step 4: Success ── */
      case 4:
        return (
          <div className="space-y-8 animate-slide-in relative">
            <Confetti />

            {/* Success header */}
            <div className="text-center relative z-10">
              <div className="w-20 h-20 bg-alto-sage rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Check className="text-white w-10 h-10" />
              </div>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-alto-navy mb-2">
                Bienvenue {formData.firstName} !
              </h3>
              <p className="text-gray-500 text-lg">
                Vous êtes sur la liste d'attente d'Alto.
              </p>
            </div>

            {/* Queue position */}
            <div className="bg-alto-cream rounded-2xl p-5 text-center relative z-10">
              <p className="text-sm text-gray-500 mb-1">Votre position dans la file</p>
              <p className="text-4xl font-display font-extrabold text-alto-navy">#{queuePosition}</p>
              <p className="text-xs text-gray-400 mt-1">sur 2,847 inscrits</p>
            </div>

            {/* Email confirmation */}
            <div className="bg-white border-2 border-alto-sand rounded-2xl p-5 flex items-start gap-4 relative z-10">
              <div className="w-10 h-10 rounded-full bg-alto-sage/10 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-alto-sage" />
              </div>
              <div>
                <p className="font-bold text-alto-navy text-sm">Email de confirmation envoyé</p>
                <p className="text-gray-500 text-sm mt-0.5">
                  Vérifiez votre boîte <span className="font-medium text-alto-navy">{formData.email}</span>
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative z-10">
              <h4 className="font-bold text-alto-navy text-sm mb-4">Prochaines étapes</h4>
              <div className="space-y-4">
                {[
                  { icon: <Check className="w-4 h-4" />, label: 'Inscription confirmée', desc: "Vous êtes sur la liste", done: true },
                  { icon: <Bell className="w-4 h-4" />, label: 'Accès beta privée', desc: 'Invitation par email', done: false },
                  { icon: <Rocket className="w-4 h-4" />, label: 'Lancement public', desc: 'Accès prioritaire pour vous', done: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      item.done ? 'bg-alto-sage text-white' : 'bg-alto-sand text-gray-400'
                    }`}>
                      {item.icon}
                    </div>
                    <div className="pt-0.5">
                      <p className={`text-sm font-bold ${item.done ? 'text-alto-navy' : 'text-gray-400'}`}>{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Share buttons */}
            <div className="relative z-10">
              <h4 className="font-bold text-alto-navy text-sm mb-3">Partagez avec vos proches</h4>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Je viens de m'inscrire sur Alto, l'assistant familial intelligent ! Rejoins-moi : ${window.location.origin}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#25D366] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Je viens de rejoindre la liste d'attente d'Alto — l'assistant familial IA ! 🏠✨ ${window.location.origin}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-black text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Share2 className="w-4 h-4" />
                  X / Twitter
                </a>
                <button
                  onClick={copyLink}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-alto-sand text-alto-navy text-sm font-medium hover:bg-alto-sageLight transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copié !' : 'Copier le lien'}
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Section id="waitlist" className="mb-20">
      <div ref={containerRef} className="max-w-lg mx-auto">
        {/* Section header (hidden on success) */}
        {currentStep < 4 && (
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-alto-navy mb-3">
              Rejoignez la liste d'attente
            </h2>
            <p className="text-gray-500">
              30 secondes pour réserver votre place — c'est gratuit.
            </p>
          </div>
        )}

        {/* Stepper (hidden on success) */}
        {currentStep < 4 && <Stepper currentStep={currentStep} totalSteps={3} />}

        {/* Form card */}
        <div className={`bg-white rounded-3xl shadow-xl border border-alto-sand/50 p-6 md:p-8 relative overflow-hidden transition-all duration-500 ${currentStep === 4 ? 'shadow-2xl' : ''}`}>
          {renderStep()}
        </div>
      </div>
    </Section>
  );
};
