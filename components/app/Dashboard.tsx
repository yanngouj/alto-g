import React, { useState, useEffect } from 'react';
import { Integrations } from './Integrations';
import { InboxScanner } from './InboxScanner';
import { FamilySettings } from './FamilySettings';
import { NewsModal } from './NewsModal';
import { Button } from '../ui/Button';
import { LogOut, Newspaper } from 'lucide-react';
import { FamilyContext, ServiceIntegration } from '../../types';
import { fetchFamilyNews, NewsResult } from '../../services/ai';
import { initGoogleAuth, signInWithGoogle } from '../../services/google';

interface DashboardProps {
  onLogout: () => void;
  initialContext?: FamilyContext;
  initialIntegrations?: ServiceIntegration[];
  familyId?: string | null;
  userId?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onLogout,
  initialContext,
  initialIntegrations,
  familyId,
  userId
}) => {
  // Use provided initial context or fallback to demo data
  const [familyContext, setFamilyContext] = useState<FamilyContext>(initialContext || {
    parents: [
      { id: 'p1', name: 'Moi', isCurrentUser: true }
    ],
    children: [
      { id: 'c1', name: 'Léo', schoolName: 'École Jules Ferry', activities: ['Football', 'Piano'], color: 'bg-blue-100 text-blue-700' },
      { id: 'c2', name: 'Emma', schoolName: 'Crèche Les Petits Pas', activities: [], color: 'bg-pink-100 text-pink-700' }
    ],
    trustedSenders: [],
    learnedKeywords: []
  });

  // Use provided integrations or fallback to demo data
  const [integrations, setIntegrations] = useState<ServiceIntegration[]>(initialIntegrations || [
    { id: 'gmail', name: 'Gmail', connected: false, type: 'mail', color: 'bg-red-100 text-red-600' },
    { id: 'outlook', name: 'Outlook', connected: false, type: 'mail', color: 'bg-blue-100 text-blue-600' },
    { id: 'gcal', name: 'Google Agenda', connected: false, type: 'calendar', color: 'bg-blue-50 text-blue-500' },
    { id: 'whatsapp', name: 'WhatsApp', connected: false, type: 'messaging', color: 'bg-green-100 text-green-600' },
  ]);

  // News State
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsData, setNewsData] = useState<NewsResult | null>(null);

  // Initialize Google Auth Listener
  useEffect(() => {
    initGoogleAuth((response) => {
      if (response && response.access_token) {
        // Mutualized Connection: Connect BOTH Gmail and Calendar on success
        setIntegrations(prev => prev.map(service => 
          (service.id === 'gmail' || service.id === 'gcal') 
            ? { ...service, connected: true, accessToken: response.access_token } 
            : service
        ));
      }
    });
  }, []);

  const handleToggleIntegration = (id: string) => {
    const service = integrations.find(s => s.id === id);
    if (!service) return;

    // Disconnect logic
    if (service.connected) {
      setIntegrations(prev => prev.map(s => s.id === id ? { ...s, connected: false } : s));
      return;
    }

    // Connect logic
    if (id === 'gmail' || id === 'gcal') {
      // Check if we already have a token from the other Google service
      const existingToken = integrations.find(s => (s.id === 'gmail' || s.id === 'gcal') && s.accessToken)?.accessToken;

      if (existingToken) {
        // Reuse token immediately
        setIntegrations(prev => prev.map(s => s.id === id ? { ...s, connected: true, accessToken: existingToken } : s));
      } else {
        // Start Auth Flow
        try {
          signInWithGoogle();
        } catch {
          console.warn("Google Auth failed (missing Client ID?). Falling back to demo mode.");
          // Fallback to demo mode visual toggle
          setIntegrations(prev => prev.map(s => s.id === id ? { ...s, connected: true } : s));
        }
      }
    } else {
      // Standard toggle for non-Google services
      setIntegrations(prev => prev.map(s => s.id === id ? { ...s, connected: !s.connected } : s));
    }
  };

  const handleUpdateIntegrationData = (id: string, data: Partial<ServiceIntegration>) => {
    setIntegrations(prev => prev.map(service => 
      service.id === id ? { ...service, ...data } : service
    ));
  };

  const handleOpenNews = async () => {
    setIsNewsOpen(true);
    if (!newsData) {
      setNewsLoading(true);
      try {
        const data = await fetchFamilyNews();
        setNewsData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setNewsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* App Navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
         <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-alto-navy rounded-lg flex items-center justify-center text-white font-display font-bold">A</div>
           <span className="font-display font-bold text-xl text-alto-navy">Alto</span>
           <span className="bg-alto-sage/20 text-alto-navy text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ml-2">Beta</span>
         </div>
         <div className="flex items-center gap-3">
           <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 mr-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Système opérationnel
           </div>
           
           <Button 
             variant="secondary" 
             size="sm" 
             onClick={handleOpenNews}
             className="flex items-center gap-2 !px-3"
             title="Actualités Famille"
           >
             <Newspaper size={18} />
             <span className="hidden sm:inline">Actualités</span>
           </Button>

           <div className="h-6 w-px bg-gray-200 mx-1"></div>

           <Button variant="outline" size="sm" onClick={onLogout} className="flex items-center gap-2 !px-3 border-gray-200 hover:border-red-200 hover:text-red-600 hover:bg-red-50">
             <LogOut size={18} />
             <span className="hidden sm:inline">Quitter</span>
           </Button>
         </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Integrations & Family */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <FamilySettings context={familyContext} onUpdate={setFamilyContext} familyId={familyId} userId={userId} />
          <Integrations 
            services={integrations} 
            onToggle={handleToggleIntegration} 
            onUpdateData={handleUpdateIntegrationData}
          />
        </div>

        {/* Main Content: Scanner */}
        <div className="lg:col-span-9">
           <InboxScanner 
              familyContext={familyContext} 
              integrations={integrations} 
              // Pass ability to update context for learning
              onContextUpdate={setFamilyContext}
           />
        </div>
      </main>

      {/* News Modal */}
      <NewsModal 
        isOpen={isNewsOpen} 
        onClose={() => setIsNewsOpen(false)} 
        loading={newsLoading} 
        data={newsData} 
      />
    </div>
  );
};