import { FamilyContext } from "../types";

// This service handles Google OAuth and Gmail API interactions

// REPLACE THIS WITH YOUR REAL CLIENT ID IF YOU WANT REAL AUTH
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '513802369002-ogajiab8l9433p8o3uue17hhmfpm4n13.apps.googleusercontent.com'; 
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.events.readonly';

export interface GmailMessage {
  id: string;
  snippet: string;
  subject: string;
  from: string;
  senderEmail: string; // Extracted pure email
  body: string;
  date: string;
  hasAttachments: boolean;
  relevanceScore: number; // 0 to 100
  breakdown?: string[]; // Reasons for the score (debug)
}

let tokenClient: any;

// --- Utilities ---

// Robust UTF-8 Base64 Decoder
const decodeBase64 = (str: string): string => {
  try {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch (e) {
    console.warn("Decoding failed, returning raw string", e);
    return str;
  }
};

const extractEmailAddress = (fromHeader: string): string => {
  const match = fromHeader.match(/<([^>]+)>/);
  return match ? match[1].toLowerCase() : fromHeader.toLowerCase();
};

// --- ADVANCED SCORING ALGORITHM ---
const calculateRelevanceScore = (
  subject: string, 
  body: string, 
  fromHeader: string, 
  hasAttachments: boolean,
  context?: FamilyContext
): { score: number, breakdown: string[] } => {
  let score = 0;
  const breakdown: string[] = [];
  const lowerText = (subject + " " + body).toLowerCase();
  const senderEmail = extractEmailAddress(fromHeader);
  const senderDomain = senderEmail.split('@')[1] || '';

  let isTrustedOrAuthority = false;

  // 1. CONTINUOUS LEARNING: Trusted Senders (Highest Priority)
  if (context?.trustedSenders?.includes(senderEmail)) {
    score += 50;
    isTrustedOrAuthority = true;
    breakdown.push("Trusted Sender (+50)");
  }

  // 2. FAMILY CONTEXT MATCHES (Increased Weight)
  if (context) {
    context.children.forEach(child => {
      if (child.name && lowerText.includes(child.name.toLowerCase())) {
        score += 40; // Increased from 30
        breakdown.push(`Child Name: ${child.name} (+40)`);
      }
      if (child.schoolName && lowerText.includes(child.schoolName.toLowerCase())) {
        score += 45; // Increased from 35
        isTrustedOrAuthority = true;
        breakdown.push(`School: ${child.schoolName} (+45)`);
      }
    });
  }

  // 3. DOMAIN AUTHORITY & CATEGORY
  // Education
  if (senderDomain.includes('.edu') || senderDomain.includes('education.gouv') || senderDomain.includes('ecole') || senderDomain.includes('ac-') || senderDomain.includes('college') || senderDomain.includes('lycee')) {
    score += 25;
    isTrustedOrAuthority = true;
    breakdown.push("Education Domain (+25)");
  }
  // Health
  if (senderDomain.includes('doctolib') || senderDomain.includes('medecin') || senderDomain.includes('sante') || senderDomain.includes('hopital') || senderDomain.includes('laboratoire')) {
    score += 25;
    isTrustedOrAuthority = true;
    breakdown.push("Health Domain (+25)");
  }
  // Administration / Utility
  if (senderDomain.includes('caf.fr') || senderDomain.includes('impots') || senderDomain.includes('banque') || senderDomain.includes('ameli') || senderDomain.includes('assurance')) {
    score += 15;
    isTrustedOrAuthority = true;
    breakdown.push("Admin Domain (+15)");
  }

  // 4. ACTION REQUIRED DETECTION (High Value)
  const actionPhrases = [
    'répondre avant', 'confirmer votre', 'coupon réponse', 'retourner signé', 
    'merci de prévoir', 'apporter', 'paiement', 'virement', 'facture à régler',
    'inscription', 'réinscription', 'dossier complet', 'urgent', 'important'
  ];
  
  if (actionPhrases.some(phrase => lowerText.includes(phrase))) {
    score += 25;
    breakdown.push("Action Required (+25)");
  }

  // 5. CONTENT SIGNALS (Family, Edu, Sports keywords boosted)
  // Attachments
  if (hasAttachments) {
    score += 15;
    breakdown.push("Has Attachments (+15)");
  }

  // Expanded Keywords List
  const familyEduSportsKeywords = [
    // School
    'classe', 'maîtresse', 'enseignant', 'professeur', 'directeur', 'réunion', 
    'sortie scolaire', 'pique-nique', 'cantine', 'menu', 'poux', 'grève', 'bulletin', 'notes', 'absence',
    // Sports & Activities
    'entrainement', 'entraînement', 'match', 'tournoi', 'compétition', 'licence', 'cotisation', 
    'judo', 'tennis', 'foot', 'danse', 'musique', 'piano', 'guitare', 'piscine', 'gymnase', 'stade',
    // Family Logistic
    'vacances', 'centre aéré', 'colonie', 'anniversaire', 'fête'
  ];
  
  if (familyEduSportsKeywords.some(k => lowerText.includes(k))) {
    score += 20;
    breakdown.push("Family/Sport Keyword (+20)");
  }

  // 5b. LEARNED KEYWORDS (Contextual)
  if (context?.learnedKeywords) {
    if (context.learnedKeywords.some(k => lowerText.includes(k.toLowerCase()))) {
      score += 15;
      breakdown.push("Learned Keyword (+15)");
    }
  }

  // 6. PURE INFO PROTECTION
  // If it's a trusted authority (School/Club) but has no specific action, 
  // we still want to surface it as "Info".
  if (isTrustedOrAuthority && score < 60) {
    score += 20;
    breakdown.push("Trusted Info Boost (+20)");
  }

  // 7. NEGATIVE SIGNALS (Noise Reduction)
  // Only apply marketing penalty if it's NOT a trusted/authority source.
  // (e.g. prevent blocking the School Newsletter)
  if (!isTrustedOrAuthority) {
    const marketingKeywords = [
      'désinscrire', 'unsubscribe', 'promo', 'soldes', 'offres', 'newsletter', 
      'publicité', 'partenaire', 'découvrir nos', 'exclusivité', 'black friday',
      'votre avis', 'parrainage', 'last chance', 'dernière chance'
    ];
    if (marketingKeywords.some(k => lowerText.includes(k))) {
      score -= 40; // Stronger penalty
      breakdown.push("Marketing Signal (-40)");
    }
  }

  return { score: Math.max(0, Math.min(score, 100)), breakdown };
};

const getDateDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0].replace(/-/g, '/');
};


// --- Auth ---

export const initGoogleAuth = (callback: (response: any) => void) => {
  if (typeof window !== 'undefined') {
    if ((window as any).google && CLIENT_ID) {
      try {
        tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: callback,
        });
        return true;
      } catch (e) {
        console.error("Failed to initialize Google Token Client", e);
        return false;
      }
    }
  }
  return false;
};

export const signInWithGoogle = () => {
  if (tokenClient) {
    tokenClient.requestAccessToken({ prompt: '' });
  } else {
    console.warn("Google Auth not initialized or Client ID missing.");
    throw new Error("CLIENT_ID_MISSING");
  }
};


// --- API ---

export const fetchGmailMessages = async (
  accessToken: string, 
  context?: FamilyContext,
  maxResults = 20,
  dateRange?: { start: string, end: string }
): Promise<GmailMessage[]> => {
  if (!accessToken) return [];

  try {
    let query = '';
    
    // Format YYYY/MM/DD for Gmail API
    const formatDateForGmail = (isoDate: string) => isoDate.replace(/-/g, '/');

    if (dateRange && dateRange.start && dateRange.end) {
      const start = formatDateForGmail(dateRange.start);
      
      // 'before' is exclusive in Gmail API, so we add 1 day to the end date
      const endObj = new Date(dateRange.end);
      endObj.setDate(endObj.getDate() + 1);
      const end = formatDateForGmail(endObj.toISOString().split('T')[0]);

      query = `after:${start} before:${end}`;
    } else {
      const fiveDaysAgo = getDateDaysAgo(5);
      query = `after:${fiveDaysAgo}`;
    }
    
    console.log(`Fetching Gmail with query: ${query}`);

    let response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`, 
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    let listData = await response.json();

    if (!response.ok) {
      const errorReason = listData.error?.errors?.[0]?.reason;
      if (errorReason === 'accessNotConfigured') {
         throw new Error("API_NOT_ENABLED");
      }
      throw new Error(JSON.stringify(listData.error));
    }

    let messages = listData.messages || [];

    // Fallback logic
    if (messages.length === 0 && !dateRange) {
       response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10`, 
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      listData = await response.json();
      messages = listData.messages || [];
    }

    if (messages.length === 0) {
        return [];
    }

    // Fetch details
    const detailedMessages = await Promise.all(
      messages.map(async (msg: any) => {
        try {
          const detailResponse = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          const detailData = await detailResponse.json();
          
          if (!detailData.payload) return null;

          // Extract headers
          const headers = detailData.payload.headers || [];
          const subject = headers.find((h: any) => h.name === 'Subject')?.value || '(No Subject)';
          const from = headers.find((h: any) => h.name === 'From')?.value || '(Unknown)';
          const dateHeader = headers.find((h: any) => h.name === 'Date')?.value || '';

          // Check for attachments
          let hasAttachments = false;
          if (detailData.payload.parts) {
             hasAttachments = detailData.payload.parts.some((part: any) => 
               (part.filename && part.filename.length > 0) || 
               (part.mimeType && part.mimeType.startsWith('application/'))
             );
          }

          // Extract and Decode Body
          let body = detailData.snippet; 
          let rawBody = '';

          if (detailData.payload.body && detailData.payload.body.data) {
            rawBody = detailData.payload.body.data;
          } else if (detailData.payload.parts) {
            const part = detailData.payload.parts.find((p: any) => p.mimeType === 'text/plain') 
                      || detailData.payload.parts.find((p: any) => p.mimeType === 'text/html');
            if (part && part.body && part.body.data) {
              rawBody = part.body.data;
            }
          }

          if (rawBody) {
            body = decodeBase64(rawBody);
          }

          // Calculate Score with Breakdown
          const { score, breakdown } = calculateRelevanceScore(subject, body, from, hasAttachments, context);

          return {
            id: msg.id,
            snippet: detailData.snippet,
            subject,
            from,
            senderEmail: extractEmailAddress(from),
            body,
            date: dateHeader,
            hasAttachments,
            relevanceScore: score,
            breakdown
          };
        } catch (err) {
           console.warn("Skipping message due to error", err);
           return null;
        }
      })
    );

    const validMessages = detailedMessages.filter((m): m is GmailMessage => m !== null);
    
    // Sort: High score first
    return validMessages.sort((a, b) => b.relevanceScore - a.relevanceScore);

  } catch (error) {
    console.error("Error fetching Gmail:", error);
    throw error;
  }
};

export const fetchCalendarEvents = async (accessToken: string, dateRange?: { start: string, end: string }): Promise<string> => {
  if (!accessToken) return '';

  try {
    let timeMin: string;
    let timeMax: string;

    if (dateRange && dateRange.start && dateRange.end) {
      timeMin = new Date(dateRange.start).toISOString();
      const end = new Date(dateRange.end);
      end.setHours(23, 59, 59);
      timeMax = end.toISOString();
    } else {
      timeMin = new Date().toISOString();
      const end = new Date();
      end.setDate(end.getDate() + 7); // Default to 7 days if no range
      timeMax = end.toISOString();
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`, 
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return "Aucun événement trouvé dans l'agenda pour cette période.";
    }

    let eventsText = "Agenda existant (pour vérifier conflits) :\n";
    data.items.forEach((event: any) => {
       const start = event.start.dateTime ? new Date(event.start.dateTime).toLocaleString([], {weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'}) : 'Journée entière';
       eventsText += `- ${start} : ${event.summary} ${event.location ? `(${event.location})` : ''}\n`;
    });

    return eventsText;

  } catch (error) {
    console.error("Error fetching Calendar:", error);
    return "Impossible de récupérer l'agenda.";
  }
};