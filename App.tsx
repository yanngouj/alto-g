import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Problem } from './components/Problem';
import { Solution } from './components/Solution';
import { Benefits } from './components/Benefits';
import { HowItWorks } from './components/HowItWorks';
import { TargetAudience } from './components/TargetAudience';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-alto-cream font-sans selection:bg-alto-sage selection:text-white">
      <Navbar />
      <main className="overflow-x-hidden">
        <Hero />
        <Problem />
        <Solution />
        <Benefits />
        <HowItWorks />
        <TargetAudience />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default App;