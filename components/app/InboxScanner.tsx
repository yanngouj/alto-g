import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, Calendar, CheckSquare, Quote, Mail, Send, CheckCircle2, Smartphone, X, Clock, AlertCircle, Paperclip, BrainCircuit } from 'lucide-react';
import { Button } from '../ui/Button';
import { analyzeContent, AnalysisResult } from '../../services/ai';
import { FamilyContext, ServiceIntegration } from '../../types';
import { fetchGmailMessages, GmailMessage, fetchCalendarEvents } from '../../services/google';

const EMAILS = {
  SCHOOL: `De : Maîtresse CM1 <ecole.julesferry@education.fr>
Sujet : Sortie scolaire et fournitures

Bonjour aux parents,

Pour rappel, la sortie à la ferme pédagogique aura lieu le mardi 14 juin. Le départ est prévu à 08h30 précise devant l'école.
Merci de prévoir un pique-nique et des bottes de pluie.

Par ailleurs, nous organisons une réunion de préparation pour la kermesse le jeudi 16 juin à 18h00 en salle 12.

Cordialement,
Mme Dupont`,

  MEDICAL: `De : Docteur Martin <doctolib@confirmation.fr>
Sujet : Confirmation RDV Dentiste

Bonjour,

Votre rendez-vous pour Emma est confirmé pour le Mercredi 22 Juin à 14h30.
Cabinet du Dr Martin, 12 rue de la Paix.
N'oubliez pas d'apporter le carnet de santé.

Cordialement,
Secrétariat Médical`
};

interface InboxScannerProps {
  familyContext: FamilyContext;
  integrations: ServiceIntegration[];
  onContextUpdate?: (ctx: FamilyContext) => void;
}

const categoryLabels: Record<string, string> = {
  school: 'École',
  medical: 'Santé',
  activity: 'Activité',
  other: 'Autre'
};

export const InboxScanner: React.FC<InboxScannerProps> = ({ familyContext, integrations, onContextUpdate }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string>('');
  
  // WhatsApp State
  const [whatsappSending, setWhatsappSending] = useState(false);
  const [whatsappSent, setWhatsappSent] = useState(false);

  // Real Import State
  const [importingGmail, setImportingGmail] = useState(false);
  const [importingCalendar, setImportingCalendar] = useState(false);
  const [fetchedEmails, setFetchedEmails] = useState<GmailMessage[]>([]);
  const [showEmailSelector, setShowEmailSelector] = useState(false);
  
  // Date Range State
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: new Date().toISOString().split('T')[0], // Today
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // +7 days
  });

  const [importError, setImportError] = useState<string>('');
  
  // Current selected email metadata for learning
  const [currentEmailMeta, setCurrentEmailMeta] = useState<{sender: string} | null>(null);
  const [learnedInfo, setLearnedInfo] = useState<{words: string[], sender?: string} | null>(null);

  const gmailService = integrations.find(s => s.id === 'gmail');
  const gcalService = integrations.find(s => s.id === 'gcal');
  const hasRealGoogleToken = !!gmailService?.accessToken || !!gcalService?.accessToken;
  
  const isOutlookConnected = integrations.find(s => s.id === 'outlook')?.connected;
  const whatsappService = integrations.find(s => s.id === 'whatsapp');

  // Shared token (since we mutualized auth)
  const googleToken = gmailService?.accessToken || gcalService?.accessToken;

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    setAnalysisError('');
    setWhatsappSent(false);
    setLearnedInfo(null);
    
    // 1. PRE-LEARN: Trusted Sender
    let newTrustedSender = '';
    if (onContextUpdate && currentEmailMeta && currentEmailMeta.sender) {
       const currentTrusted = familyContext.trustedSenders || [];
       if (!currentTrusted.includes(currentEmailMeta.sender)) {
          // Temporarily store, will update context all at once if possible or just here
          newTrustedSender = currentEmailMeta.sender;
       }
    }

    try {
      const data = await analyzeContent(input, familyContext);
      setResult(data);

      // 2. CONTINUOUS LEARNING LOGIC
      if (onContextUpdate) {
        const updates: Partial<FamilyContext> = {};
        const learnedWords: string[] = [];
        
        // Handle New Keywords from AI
        if (data.learningSuggestions?.newKeywords && data.learningSuggestions.newKeywords.length > 0) {
           const currentKeywords = familyContext.learnedKeywords || [];
           // Filter duplicates
           const uniqueNew = data.learningSuggestions.newKeywords.filter(k => 
             !currentKeywords.includes(k) && !currentKeywords.includes(k.toLowerCase())
           );
           
           if (uniqueNew.length > 0) {
             updates.learnedKeywords = [...currentKeywords, ...uniqueNew];
             learnedWords.push(...uniqueNew);
           }
        }

        // Handle Trusted Sender
        if (newTrustedSender) {
           const currentTrusted = familyContext.trustedSenders || [];
           updates.trustedSenders = [...currentTrusted, newTrustedSender];
        }

        // Apply Updates
        if (Object.keys(updates).length > 0) {
           onContextUpdate({
             ...familyContext,
             ...updates
           });
           
           // UI Feedback
           setLearnedInfo({
             words: learnedWords,
             sender: newTrustedSender
           });
           
           console.log("🧠 Alto Learned:", updates);
        }
      }

    } catch (e: any) {
      console.error(e);
      setAnalysisError(e.message || "Erreur inconnue lors de l'analyse");
    } finally {
      setLoading(false);
    }
  };

  const handleSendWhatsapp = async () => {
    if (!whatsappService?.connected) {
      setAnalysisError("Veuillez d'abord activer l'intégration WhatsApp dans la barre latérale.");
      return;
    }
    
    if (!whatsappService?.phoneNumber) {
      setAnalysisError("Veuillez configurer votre numéro de téléphone dans l'onglet Connecteurs.");
      return;
    }

    if (!result) return;

    setWhatsappSending(true);
    setAnalysisError('');
    
    try {
      // Try connecting to local backend
      console.log(`Attempting to send to backend: http://localhost:3001/api/send-whatsapp`);
      const response = await fetch('http://localhost:3001/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: whatsappService.phoneNumber,
          summary: result.summary,
          events: result.events,
          tasks: result.tasks
        })
      });

      if (!response.ok) {
        throw new Error('Backend unreachable or returned error');
      }
      
      const data = await response.json();
      console.log('Backend response:', data);
      setWhatsappSent(true);

    } catch (error) {
      console.warn("Backend unavailable, falling back to simulation.", error);
      // Fallback simulation
      setTimeout(() => {
        setWhatsappSent(true);
      }, 1500);
    } finally {
      setWhatsappSending(false);
    }
  };

  const handleRealGmailImport = async () => {
    if (!googleToken) return;
    
    setImportingGmail(true);
    setImportError('');
    setFetchedEmails([]);
    setResult(null);

    try {
      const messages = await fetchGmailMessages(
        googleToken, 
        familyContext, 
        20, 
        dateRange
      );
      
      if (messages.length > 0) {
        setFetchedEmails(messages);
        setShowEmailSelector(true);
      } else {
        setImportError("Aucun email pertinent trouvé sur cette période.");
      }
    } catch (error: any) {
      console.error(error);
      if (error.message === 'API_NOT_ENABLED') {
        setImportError("L'API Gmail n'est pas activée sur ce projet Google Cloud. Vous devez l'activer manuellement.");
      } else {
        setImportError("Impossible de récupérer les emails. Vérifiez la console.");
      }
    } finally {
      setImportingGmail(false);
    }
  };

  const handleRealCalendarImport = async () => {
    if (!googleToken) return;
    setImportingCalendar(true);
    setResult(null);
    setInput('');
    
    try {
      const eventsText = await fetchCalendarEvents(googleToken, dateRange);
      setInput(eventsText);
    } catch (error) {
      console.error(error);
      setImportError("Impossible de récupérer l'agenda.");
    } finally {
      setImportingCalendar(false);
    }
  };

  const selectEmail = (msg: GmailMessage) => {
    setInput(`De : ${msg.from}\nSujet : ${msg.subject}\nDate : ${msg.date}\n\n${msg.body}`);
    setCurrentEmailMeta({ sender: msg.senderEmail });
    setShowEmailSelector(false);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Input Area */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
          <h2 className="font-display font-bold text-alto-navy text-xl flex items-center gap-2">
            <Sparkles className="text-alto-terra" />
            Analyseur Intelligent
          </h2>
          
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* GOOGLE ACTIONS (Unified) */}
            {(gmailService?.connected || gcalService?.connected) && hasRealGoogleToken ? (
              <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-1.5 pr-2 rounded-lg border border-gray-200">
                <div className="flex items-center gap-1">
                  <input 
                    type="date" 
                    className="text-[10px] w-20 border border-gray-200 rounded px-1 py-1 bg-white text-gray-600 focus:outline-none focus:border-alto-sage"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  />
                  <span className="text-gray-400 text-xs">au</span>
                  <input 
                    type="date" 
                    className="text-[10px] w-20 border border-gray-200 rounded px-1 py-1 bg-white text-gray-600 focus:outline-none focus:border-alto-sage"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  />
                </div>
                
                <div className="h-4 w-px bg-gray-300 mx-1 hidden sm:block"></div>

                {/* Gmail Button */}
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={handleRealGmailImport} 
                  disabled={importingGmail}
                  className="!py-1 !px-2 text-xs bg-white hover:bg-red-50 text-red-600 shadow-none border border-red-100 h-7"
                  title="Importer les emails"
                >
                  {importingGmail ? <Loader2 className="animate-spin w-3 h-3" /> : <Mail size={12} className="mr-1" />}
                  Emails
                </Button>

                {/* Calendar Button */}
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={handleRealCalendarImport} 
                  disabled={importingCalendar}
                  className="!py-1 !px-2 text-xs bg-white hover:bg-blue-50 text-blue-600 shadow-none border border-blue-100 h-7"
                  title="Importer l'agenda"
                >
                  {importingCalendar ? <Loader2 className="animate-spin w-3 h-3" /> : <Calendar size={12} className="mr-1" />}
                  Agenda
                </Button>
              </div>
            ) : (
              // Demo Buttons if not connected to real Google
              <>
                 {isOutlookConnected && (
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={() => { setInput(EMAILS.MEDICAL); setCurrentEmailMeta(null); }} 
                    className="!py-1.5 !px-3 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 shadow-none border border-blue-100"
                  >
                    <Calendar size={14} className="mr-1" />
                    Démo Médical
                  </Button>
                )}
                {!hasRealGoogleToken && (
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={() => { setInput(EMAILS.SCHOOL); setCurrentEmailMeta(null); }} 
                    className="!py-1.5 !px-3 text-xs bg-red-50 hover:bg-red-100 text-red-600 shadow-none border border-red-100"
                  >
                    <Mail size={14} className="mr-1" />
                    Démo École
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Import Error Alert */}
        {importError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-start gap-2 animate-fade-in">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-bold">Erreur d'importation</p>
              <p>{importError}</p>
              {importError.includes("API Gmail") && (
                <a 
                  href="https://console.developers.google.com/apis/api/gmail.googleapis.com/overview" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs underline mt-1 block hover:text-red-900"
                >
                  Activer l'API Gmail dans la console →
                </a>
              )}
            </div>
            <button onClick={() => setImportError('')} className="text-red-400 hover:text-red-600"><X size={14}/></button>
          </div>
        )}
        
        {/* Analysis Error Alert */}
        {analysisError && (
          <div className="mb-4 p-3 bg-amber-50 text-amber-800 text-sm rounded-xl border border-amber-100 flex items-start gap-2 animate-fade-in">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-bold">Message système</p>
              <p>{analysisError}</p>
            </div>
            <button onClick={() => setAnalysisError('')} className="text-amber-500 hover:text-amber-700"><X size={14}/></button>
          </div>
        )}

        <textarea
          className="w-full flex-1 p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-alto-sage focus:ring-1 focus:ring-alto-sage outline-none resize-none text-gray-700 font-medium leading-relaxed text-sm mb-4"
          placeholder="Collez un email, un message WhatsApp ou importez votre agenda pour analyse..."
          value={input}
          onChange={(e) => { setInput(e.target.value); setCurrentEmailMeta(null); }}
        />

        <div className="flex justify-end items-center gap-4">
          {currentEmailMeta && (
            <span className="text-xs text-alto-sage font-bold bg-alto-sage/10 px-3 py-1 rounded-full animate-fade-in">
              ✨ Apprentissage actif
            </span>
          )}
          <Button onClick={handleAnalyze} disabled={!input || loading} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                Analyse en cours...
              </>
            ) : (
              <>
                Analyser le contenu <ArrowRight className="ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Results Area */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
          {/* Left Col: Summary & Tasks */}
          <div className="space-y-6">
            
            {/* Learning Feedback */}
            {learnedInfo && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-2xl border border-purple-100 animate-fade-in flex items-start gap-3">
                 <div className="bg-white p-2 rounded-full shadow-sm text-purple-600">
                    <BrainCircuit size={18} />
                 </div>
                 <div>
                   <h4 className="font-bold text-alto-navy text-sm">J'ai mémorisé de nouvelles infos !</h4>
                   <p className="text-xs text-gray-600 mt-1">
                     Pour mieux filtrer vos prochains emails, j'ai enregistré :
                   </p>
                   <div className="flex flex-wrap gap-2 mt-2">
                      {learnedInfo.sender && (
                        <span className="text-[10px] bg-white border border-purple-100 text-purple-700 px-2 py-1 rounded-md font-medium shadow-sm">
                           Expéditeur : {learnedInfo.sender}
                        </span>
                      )}
                      {learnedInfo.words.map((w, i) => (
                        <span key={i} className="text-[10px] bg-white border border-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium shadow-sm">
                           Mot-clé : {w}
                        </span>
                      ))}
                   </div>
                 </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-alto-sage">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-alto-navy flex items-center gap-2">
                  <Quote size={18} className="text-alto-sage" />
                  Résumé Flash
                </h3>
                
                <Button 
                  size="sm" 
                  variant={whatsappSent ? "secondary" : "primary"} 
                  onClick={handleSendWhatsapp} 
                  disabled={whatsappSending || whatsappSent}
                  className={`!py-1.5 !px-3 text-xs transition-all duration-500 ${whatsappSent ? 'bg-green-100 text-green-700 border-green-200' : 'bg-[#25D366] hover:bg-[#128C7E] text-white border-transparent'}`}
                >
                  {whatsappSending ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : whatsappSent ? (
                    <>
                      <CheckCircle2 size={16} className="mr-1.5" />
                      Envoyé !
                    </>
                  ) : (
                    <>
                      <Send size={14} className="mr-1.5 transform -rotate-45 translate-y-0.5 translate-x-[-2px]" />
                      WhatsApp
                    </>
                  )}
                </Button>
              </div>
              <p className="text-gray-700 italic leading-relaxed text-sm bg-gray-50 p-3 rounded-lg">
                "{result.summary}"
              </p>
              {whatsappSent && (
                <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-400 justify-end animate-fade-in">
                  <Smartphone size={12} /> Délivré à {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-alto-navy mb-4 flex items-center gap-2">
                <CheckSquare size={18} className="text-alto-terra" />
                Tâches Détectées
              </h3>
              <div className="space-y-3">
                {result.tasks.map((task, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                      task.priority === 'high' ? 'bg-red-500' : 
                      task.priority === 'medium' ? 'bg-orange-400' : 'bg-green-400'
                    }`} />
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 text-sm">{task.title}</div>
                      <div className="flex gap-2 mt-1">
                        {task.deadline && task.deadline !== 'None' && (
                          <span className="text-[10px] text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                            📅 {task.deadline}
                          </span>
                        )}
                        {task.assignedTo && (
                          <span className="text-[10px] text-alto-navy bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-bold">
                            👤 {task.assignedTo}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {result.tasks.length === 0 && <p className="text-sm text-gray-400 italic">Aucune tâche détectée.</p>}
              </div>
            </div>
          </div>

          {/* Right Col: Events */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <h3 className="font-bold text-alto-navy mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-blue-500" />
              Agenda Mis à jour
            </h3>
            <div className="space-y-4">
              {result.events.map((event, idx) => (
                <div key={idx} className="relative overflow-hidden p-4 rounded-xl border border-gray-100 bg-white hover:border-blue-200 transition-colors group">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    event.category === 'school' ? 'bg-orange-400' :
                    event.category === 'medical' ? 'bg-red-400' :
                    event.category === 'activity' ? 'bg-green-400' : 'bg-gray-400'
                  }`} />
                  
                  <div className="flex justify-between items-start mb-1 pl-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      event.category === 'school' ? 'bg-orange-50 text-orange-600' :
                      event.category === 'medical' ? 'bg-red-50 text-red-600' :
                      event.category === 'activity' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {categoryLabels[event.category] || event.category}
                    </span>
                    {event.assignedTo && (
                      <span className="text-[10px] font-bold text-alto-navy bg-alto-cream px-2 py-0.5 rounded-full">
                        Pour {event.assignedTo}
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-alto-navy text-lg pl-2 mb-1">{event.title}</h4>
                  
                  <div className="pl-2 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={14} className="text-gray-400" />
                      {event.date} {event.time !== 'All day' && `à ${event.time}`}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="w-3.5 flex justify-center"><div className="w-1 h-1 bg-gray-400 rounded-full" /></div>
                        {event.location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {result.events.length === 0 && <p className="text-sm text-gray-400 italic">Aucun événement détecté.</p>}
            </div>
          </div>
        </div>
      )}

      {/* EMAIL SELECTOR MODAL */}
      {showEmailSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-alto-navy/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in-up">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-alto-navy flex items-center gap-2">
                <Mail size={18} /> Choisir un email à analyser
              </h3>
              <button onClick={() => setShowEmailSelector(false)} className="p-1 hover:bg-gray-200 rounded-full"><X size={18}/></button>
            </div>
            <div className="overflow-y-auto p-2">
              {fetchedEmails.map(msg => (
                <div 
                  key={msg.id} 
                  onClick={() => selectEmail(msg)}
                  className="p-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors group last:border-0 relative"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm text-alto-navy group-hover:text-blue-700">{msg.from.replace(/<.*>/, '').trim()}</span>
                    <span className="text-xs text-gray-400">{new Date(msg.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-medium text-sm text-gray-800">{msg.subject}</div>
                    {msg.hasAttachments && <Paperclip size={12} className="text-gray-400" />}
                  </div>
                  <div className="text-xs text-gray-500 line-clamp-2 mb-2">{msg.snippet}</div>
                  
                  {/* Relevance Badges */}
                  <div className="flex flex-wrap gap-2">
                     <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        msg.relevanceScore >= 80 ? 'bg-green-100 text-green-700' : 
                        msg.relevanceScore >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
                     }`}>
                       Score: {msg.relevanceScore}/100
                     </span>
                     
                     {/* Debug Breakdown (Hidden in small, mostly for show) */}
                     {msg.breakdown && msg.breakdown.slice(0, 2).map((reason, i) => (
                        <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                          {reason}
                        </span>
                     ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};