import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { ArrowRight, AlertCircle, ArrowLeft, Mail, Lock, User, Loader2, Users, CheckCircle } from 'lucide-react';
import {
  signUp,
  signIn,
  getInvitationByToken,
  acceptInvitation,
  isSupabaseConfigured,
  getCurrentUser
} from '../../services/supabase';

interface AcceptInvitationProps {
  token: string;
  onSuccess: (familyId: string) => void;
  onCancel: () => void;
}

type AuthMode = 'signin' | 'signup';
type PageState = 'loading' | 'invitation' | 'auth' | 'joining' | 'success' | 'error';

interface InvitationData {
  familyName: string;
  inviterName: string;
  inviterEmail: string;
  familyId: string;
}

export const AcceptInvitation: React.FC<AcceptInvitationProps> = ({ token, onSuccess, onCancel }) => {
  const [pageState, setPageState] = useState<PageState>('loading');
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [error, setError] = useState('');

  const [mode, setMode] = useState<AuthMode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const isConfigured = isSupabaseConfigured();

  // Load invitation on mount
  useEffect(() => {
    const loadInvitation = async () => {
      if (!isConfigured) {
        // Demo mode
        setInvitation({
          familyName: 'Famille Demo',
          inviterName: 'Parent Demo',
          inviterEmail: 'demo@alto.app',
          familyId: 'demo-family-id'
        });
        setPageState('invitation');
        return;
      }

      try {
        const data = await getInvitationByToken(token);
        if (data) {
          setInvitation({
            familyName: data.families?.name || 'Ma Famille',
            inviterName: data.profiles?.display_name || 'Un parent',
            inviterEmail: data.profiles?.email || '',
            familyId: data.family_id
          });
          setPageState('invitation');
        } else {
          setError('Cette invitation n\'existe pas ou a expire.');
          setPageState('error');
        }
      } catch {
        setError('Erreur lors du chargement de l\'invitation.');
        setPageState('error');
      }
    };

    loadInvitation();
  }, [token, isConfigured]);

  const handleContinue = async () => {
    // Check if user is already logged in
    if (isConfigured) {
      try {
        const user = await getCurrentUser();
        if (user) {
          // User is logged in, join family directly
          await joinFamily(user.id);
          return;
        }
      } catch {
        // Not logged in, continue to auth
      }
    }
    setPageState('auth');
  };

  const joinFamily = async (userId: string) => {
    setPageState('joining');

    if (!isConfigured) {
      // Demo mode
      setTimeout(() => {
        setPageState('success');
        setTimeout(() => {
          onSuccess(invitation?.familyId || 'demo-family-id');
        }, 1500);
      }, 1000);
      return;
    }

    try {
      await acceptInvitation(token, userId);
      setPageState('success');
      setTimeout(() => {
        onSuccess(invitation?.familyId || '');
      }, 1500);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
      setPageState('error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!isConfigured) {
      // Demo mode
      setTimeout(() => {
        joinFamily('demo-user-id');
      }, 1000);
      return;
    }

    try {
      let userId: string;

      if (mode === 'signup') {
        const { user } = await signUp(email, password, displayName);
        if (!user) throw new Error('Erreur lors de la creation du compte');
        userId = user.id;
      } else {
        const { user } = await signIn(email, password);
        if (!user) throw new Error('Erreur lors de la connexion');
        userId = user.id;
      }

      await joinFamily(userId);
    } catch (err) {
      if (err instanceof Error) {
        const errorMap: Record<string, string> = {
          'Invalid login credentials': 'Email ou mot de passe incorrect.',
          'User already registered': 'Cet email est deja utilise. Connectez-vous plutot.',
          'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caracteres.'
        };
        setError(errorMap[err.message] || err.message);
      }
      setLoading(false);
    }
  };

  // Loading state
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-alto-cream flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-alto-sage" />
      </div>
    );
  }

  // Error state
  if (pageState === 'error') {
    return (
      <div className="min-h-screen bg-alto-cream flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-display font-bold text-alto-navy mb-4">Invitation invalide</h2>
          <p className="text-gray-500 mb-8">{error}</p>
          <Button onClick={onCancel}>
            Retour a l'accueil
          </Button>
        </div>
      </div>
    );
  }

  // Success state
  if (pageState === 'success') {
    return (
      <div className="min-h-screen bg-alto-cream flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-md w-full text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-display font-bold text-alto-navy mb-4">Bienvenue dans la famille !</h2>
          <p className="text-gray-500">
            Vous avez rejoint <strong>{invitation?.familyName}</strong>. Redirection en cours...
          </p>
        </div>
      </div>
    );
  }

  // Joining state
  if (pageState === 'joining') {
    return (
      <div className="min-h-screen bg-alto-cream flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-md w-full text-center">
          <Loader2 size={48} className="animate-spin text-alto-sage mx-auto mb-6" />
          <h2 className="text-xl font-display font-bold text-alto-navy">Vous rejoignez la famille...</h2>
        </div>
      </div>
    );
  }

  // Invitation preview state
  if (pageState === 'invitation') {
    return (
      <div className="min-h-screen bg-alto-cream flex flex-col items-center justify-center p-4">
        <button
          onClick={onCancel}
          className="absolute top-6 left-6 text-alto-navy font-medium flex items-center gap-2 hover:text-alto-terra transition-colors"
        >
          <ArrowLeft size={20} /> Retour
        </button>

        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-md w-full text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-alto-sage/20 text-alto-sage rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users size={32} />
          </div>

          <h2 className="text-2xl font-display font-bold text-alto-navy mb-2">
            Invitation a rejoindre
          </h2>

          <div className="my-6 p-6 bg-alto-cream rounded-2xl">
            <p className="text-3xl font-display font-bold text-alto-navy mb-2">
              {invitation?.familyName}
            </p>
            <p className="text-gray-500 text-sm">
              Invite par <strong>{invitation?.inviterName}</strong>
            </p>
          </div>

          <p className="text-gray-500 mb-8">
            Rejoignez cette famille sur Alto pour partager les informations scolaires, les activites et le calendrier familial.
          </p>

          <Button onClick={handleContinue} className="w-full">
            Accepter l'invitation <ArrowRight size={18} className="ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Auth state
  return (
    <div className="min-h-screen bg-alto-cream flex flex-col items-center justify-center p-4">
      <button
        onClick={() => setPageState('invitation')}
        className="absolute top-6 left-6 text-alto-navy font-medium flex items-center gap-2 hover:text-alto-terra transition-colors"
      >
        <ArrowLeft size={20} /> Retour
      </button>

      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-md w-full animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-2 bg-alto-sage/20 text-alto-navy text-sm font-medium rounded-full mb-4">
            Rejoindre {invitation?.familyName}
          </div>
          <h2 className="text-2xl font-display font-bold text-alto-navy mb-2">
            {mode === 'signin' ? 'Connectez-vous' : 'Creez votre compte'}
          </h2>
          <p className="text-gray-500">
            {mode === 'signin'
              ? 'Utilisez votre compte Alto existant.'
              : 'Creez un compte pour rejoindre la famille.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Votre prenom"
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-alto-sage focus:outline-none transition-colors"
              />
            </div>
          )}

          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-alto-sage focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-alto-sage focus:outline-none transition-colors"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm font-medium">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                {mode === 'signin' ? 'Se connecter et rejoindre' : "S'inscrire et rejoindre"}
                <ArrowRight size={18} className="ml-2" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          {mode === 'signin' ? (
            <>
              Pas encore de compte ?{' '}
              <button onClick={() => setMode('signup')} className="text-alto-navy font-medium hover:underline">
                Creer un compte
              </button>
            </>
          ) : (
            <>
              Deja un compte ?{' '}
              <button onClick={() => setMode('signin')} className="text-alto-navy font-medium hover:underline">
                Se connecter
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
