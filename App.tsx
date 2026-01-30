import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Problem } from './components/Problem';
import { Solution } from './components/Solution';
import { Benefits } from './components/Benefits';
import { HowItWorks } from './components/HowItWorks';
import { Testimonials } from './components/Testimonials';
import { CTA } from './components/CTA';
import { FloatingCTA } from './components/FloatingCTA';
import { Footer } from './components/Footer';
import { Dashboard } from './components/app/Dashboard';
import { AuthPage } from './components/auth/AuthPage';
import { AcceptInvitation } from './components/auth/AcceptInvitation';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { FamilyContext, ServiceIntegration } from './types';
import {
  onAuthStateChange,
  getSession,
  signOut,
  getUserFamilies,
  getChildren,
  isSupabaseConfigured
} from './services/supabase';
import type { User } from '@supabase/supabase-js';

type ViewState = 'landing' | 'demo' | 'auth' | 'invitation' | 'onboarding' | 'dashboard';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [currentFamilyId, setCurrentFamilyId] = useState<string | null>(null);

  // Store onboarding data to pass to dashboard
  const [userContext, setUserContext] = useState<FamilyContext | undefined>(undefined);
  const [userServices, setUserServices] = useState<ServiceIntegration[] | undefined>(undefined);

  // Hero → CTA prefill state
  const [heroPrefill, setHeroPrefill] = useState<{ firstName: string; email: string } | null>(null);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  // Check for invite token in URL and initialize auth
  useEffect(() => {
    // Check URL for invitation token
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const isDemo = urlParams.get('demo') === 'true';

    if (isDemo) {
      setView('demo');
      setLoading(false);
      return;
    }

    if (token) {
      setInviteToken(token);
      setView('invitation');
      setLoading(false);
      return;
    }

    if (window.location.pathname === '/auth') {
      setView('auth');
      setLoading(false);
      return;
    }

    // Check for auth callback (from OAuth redirect)
    if (window.location.pathname === '/auth/callback') {
      // Handle the OAuth callback
      setLoading(true);
    }

    // Initialize auth state
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Get initial session
    getSession().then((session) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch(() => {
      setLoading(false);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        loadUserData(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setCurrentFamilyId(null);
        setUserContext(undefined);
        setView('landing');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load user's family data from Supabase
  const loadUserData = async (userId: string) => {
    try {
      const families = await getUserFamilies(userId);

      if (families && families.length > 0) {
        // User has a family, load it
        const family = families[0].families;
        if (family) {
          setCurrentFamilyId(family.id);

          // Load children
          const children = await getChildren(family.id);

          setUserContext({
            parents: [{ id: userId, name: 'Moi', isCurrentUser: true }],
            children: children?.map(c => ({
              id: c.id,
              name: c.name,
              birthDate: c.birth_date || undefined,
              schoolName: c.school_name || '',
              activities: c.activities || [],
              color: c.color
            })) || []
          });

          setView('dashboard');
        }
      } else {
        // No family, go to onboarding
        setView('onboarding');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setView('onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (isSupabaseConfigured()) {
        await signOut();
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
    setUser(null);
    setCurrentFamilyId(null);
    setUserContext(undefined);
    setUserServices(undefined);
    setView('landing');
    // Clear URL params
    window.history.replaceState({}, '', window.location.pathname);
  };

  const handleAuthSuccess = (userId: string) => {
    if (isSupabaseConfigured()) {
      loadUserData(userId);
    } else {
      // Demo mode
      setView('onboarding');
    }
  };

  const handleInvitationSuccess = (familyId: string) => {
    setCurrentFamilyId(familyId);
    // Clear the token from URL
    window.history.replaceState({}, '', window.location.pathname);
    setInviteToken(null);
    // Load the family data
    if (user) {
      loadUserData(user.id);
    } else {
      setView('dashboard');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-alto-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-alto-navy rounded-xl flex items-center justify-center text-white font-display font-bold text-xl animate-pulse">
            A
          </div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  // 1. INVITATION VIEW
  if (view === 'invitation' && inviteToken) {
    return (
      <AcceptInvitation
        token={inviteToken}
        onSuccess={handleInvitationSuccess}
        onCancel={() => {
          setInviteToken(null);
          setView('landing');
          window.history.replaceState({}, '', window.location.pathname);
        }}
      />
    );
  }

  // 2. APP VIEW (Real or Demo)
  if (view === 'dashboard' || view === 'demo') {
    return (
      <Dashboard
        onLogout={handleLogout}
        initialContext={userContext}
        initialIntegrations={userServices}
        familyId={currentFamilyId}
        userId={user?.id}
      />
    );
  }

  // 3. AUTH VIEW
  if (view === 'auth') {
    return (
      <AuthPage
        onSuccess={handleAuthSuccess}
        onCancel={() => setView('landing')}
      />
    );
  }

  // 4. ONBOARDING VIEW
  if (view === 'onboarding') {
    return (
      <OnboardingWizard
        userId={user?.id}
        userEmail={user?.email}
        onComplete={(data) => {
          setUserContext(data.family);
          setUserServices(data.services);
          if (data.familyId) {
            setCurrentFamilyId(data.familyId);
          }
          setView('dashboard');
        }}
      />
    );
  }

  // 5. LANDING VIEW
  return (
    <div className="min-h-screen bg-alto-cream font-sans selection:bg-alto-sage selection:text-white">
      <Navbar
        onEnterDemo={() => setView('demo')}
        onEnterBeta={() => setView('auth')}
      />
      <main className="overflow-x-hidden">
        <Hero onHeroSubmit={(firstName, email) => setHeroPrefill({ firstName, email })} />
        <Problem />
        <Solution />
        <Benefits />
        <HowItWorks />
        <Testimonials />
        <CTA
          prefillFirstName={heroPrefill?.firstName}
          prefillEmail={heroPrefill?.email}
          onSuccess={() => setWaitlistSuccess(true)}
        />
      </main>
      <FloatingCTA hidden={waitlistSuccess} />
      <Footer />
    </div>
  );
};

export default App;
