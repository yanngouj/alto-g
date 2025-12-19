import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Problem } from './components/Problem';
import { Solution } from './components/Solution';
import { Benefits } from './components/Benefits';
import { HowItWorks } from './components/HowItWorks';
import { Testimonials } from './components/Testimonials';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';
import { Dashboard } from './components/app/Dashboard';
import { BetaLogin } from './components/auth/BetaLogin';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { FamilyContext, ServiceIntegration } from './types';

type ViewState = 'landing' | 'demo' | 'auth' | 'onboarding' | 'dashboard';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  
  // Store onboarding data to pass to dashboard
  const [userContext, setUserContext] = useState<FamilyContext | undefined>(undefined);
  const [userServices, setUserServices] = useState<ServiceIntegration[] | undefined>(undefined);

  // 1. APP VIEW (Real or Demo)
  if (view === 'dashboard' || view === 'demo') {
    return (
      <Dashboard 
        onLogout={() => {
          setView('landing');
          setUserContext(undefined);
          setUserServices(undefined);
        }} 
        initialContext={userContext}
        initialIntegrations={userServices}
      />
    );
  }

  // 2. AUTH VIEW
  if (view === 'auth') {
    return (
      <BetaLogin 
        onSuccess={() => setView('onboarding')} 
        onCancel={() => setView('landing')} 
      />
    );
  }

  // 3. ONBOARDING VIEW
  if (view === 'onboarding') {
    return (
      <OnboardingWizard 
        onComplete={(data) => {
          setUserContext(data.family);
          setUserServices(data.services);
          setView('dashboard');
        }}
      />
    );
  }

  // 4. LANDING VIEW
  return (
    <div className="min-h-screen bg-alto-cream font-sans selection:bg-alto-sage selection:text-white">
      <Navbar 
        onEnterDemo={() => setView('demo')} 
        onEnterBeta={() => setView('auth')}
      />
      <main className="overflow-x-hidden">
        <Hero />
        <Problem />
        <Solution />
        <Benefits />
        <HowItWorks />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default App;