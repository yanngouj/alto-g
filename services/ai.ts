import { GoogleGenAI, Type } from "@google/genai";
import { FamilyContext } from "../types";

// Initialize Gemini
// Ensure API KEY is present, otherwise explicit error will be thrown during call if check fails here
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface ExtractedEvent {
  title: string;
  date: string;
  time: string;
  location: string;
  category: 'school' | 'medical' | 'activity' | 'other';
  assignedTo?: string; // Name of the child or parent
}

export interface ExtractedTask {
  title: string;
  priority: 'high' | 'medium' | 'low';
  deadline: string;
  assignedTo?: string;
}

export interface LearningSuggestions {
  newKeywords: string[];
  relevanceReason: string;
}

export interface AnalysisResult {
  summary: string;
  events: ExtractedEvent[];
  tasks: ExtractedTask[];
  learningSuggestions?: LearningSuggestions;
}

export interface NewsSource {
  title: string;
  uri: string;
}

export interface NewsResult {
  text: string;
  sources: NewsSource[];
}

// Helper: Sleep for retries
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzeContent = async (text: string, context: FamilyContext): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("Clé API manquante (process.env.API_KEY)");
  }

  // Construct context string for the model
  const childrenContext = context.children.map(c => `${c.name} (School/Context: ${c.schoolName})`).join(', ');
  const parentsContext = context.parents.map(p => p.name).join(', ');

  const makeRequest = async (attempt: number = 1): Promise<AnalysisResult> => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
          role: 'user',
          parts: [{ text: text }]
        },
        config: {
          systemInstruction: `You are Alto, a smart family assistant. 
          Analyze the provided text (which could be an email, a message, or a note).
          
          FAMILY CONTEXT:
          - Children: ${childrenContext}
          - Parents: ${parentsContext}
  
          Extract the following structured data:
          1. Calendar Events (dates, times, locations).
          2. Tasks/To-dos (things that need to be done).
          3. A very short, friendly summary (max 1 sentence) for a daily briefing.
          4. CONTINUOUS LEARNING: If the content is highly relevant to family logistics (School, Medical, Activities), extract 1-3 specific unique keywords (nouns or verbs) that characterize this type of message (e.g., 'kermesse', 'poux', 'inscription', 'stage'). Do NOT pick common words like 'bonjour' or 'date'.
          
          CRITICAL INSTRUCTIONS:
          1. LANGUAGE: All generated text (Summary, Event Titles, Task Titles, Locations, Deadlines) MUST BE IN FRENCH.
          2. ASSIGNMENT: Try to assign each event or task to a specific family member (child or parent) based on the context (e.g. school name matches).
             - If the text mentions a school name associated with a child, assign the event to that child.
             - If unsure, leave 'assignedTo' empty string.
  
          For dates, if not specified, assume the nearest future date.
          Return the response in JSON format.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              events: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    date: { type: Type.STRING, description: "YYYY-MM-DD format" },
                    time: { type: Type.STRING, description: "HH:MM format or 'All day'" },
                    location: { type: Type.STRING },
                    category: { type: Type.STRING, enum: ['school', 'medical', 'activity', 'other'] },
                    assignedTo: { type: Type.STRING, description: "Name of the family member or empty string" }
                  }
                }
              },
              tasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    priority: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
                    deadline: { type: Type.STRING, description: "YYYY-MM-DD or 'None'" },
                    assignedTo: { type: Type.STRING, description: "Name of the family member or empty string" }
                  }
                }
              },
              learningSuggestions: {
                type: Type.OBJECT,
                description: "Suggestions for the AI to learn from this content",
                properties: {
                   newKeywords: {
                     type: Type.ARRAY,
                     items: { type: Type.STRING },
                     description: "List of specific keywords found in the text that are valuable for future filtering"
                   },
                   relevanceReason: { type: Type.STRING, description: "Why is this content important? (e.g. 'School Event', 'Medical Appt')" }
                }
              }
            }
          }
        }
      });
  
      if (response.text) {
        return JSON.parse(response.text) as AnalysisResult;
      }
      throw new Error("Réponse vide de l'IA");

    } catch (error: any) {
      // Handle 429 (Quota) or 503 (Service Unavailable)
      const isQuota = error.status === 429 || 
                      error.message?.includes('429') || 
                      error.message?.includes('RESOURCE_EXHAUSTED') ||
                      error.message?.includes('quota');

      if (isQuota && attempt <= 3) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500; // Exponential backoff
        console.warn(`⚠️ AI Quota Hit. Retrying in ${Math.round(delay)}ms (Attempt ${attempt}/3)...`);
        await sleep(delay);
        return makeRequest(attempt + 1);
      }
      
      // Propagate the error if not retryable or max attempts reached
      throw error;
    }
  };

  try {
    return await makeRequest();
  } catch (error: any) {
    console.error("AI Analysis failed final attempt:", error);
    
    if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
       throw new Error("Le serveur d'IA est saturé (Quota dépassé). Veuillez patienter 1 minute avant de réessayer.");
    }
    
    throw new Error(error.message || "Erreur inconnue lors de l'analyse");
  }
};

export const fetchFamilyNews = async (): Promise<NewsResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Quelles sont les 3 actualités ou tendances récentes les plus pertinentes sur l'organisation familiale, la charge mentale parentale ou les nouvelles technologies pour les familles ? Fais un résumé concis en français.",
      config: {
        tools: [{ googleSearch: {} }],
        // Note: responseMimeType is NOT set when using googleSearch as per guidelines
      },
    });

    const text = response.text || "Aucune actualité trouvée pour le moment.";
    
    // Extract sources from grounding metadata
    const sources: NewsSource[] = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || "Source Web",
            uri: chunk.web.uri
          });
        }
      });
    }

    return { text, sources };
  } catch (error) {
    console.error("News fetch failed:", error);
    throw error;
  }
};