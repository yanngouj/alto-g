import { LucideIcon } from 'lucide-react';

export interface FeatureItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface StepItem {
  number: string;
  title: string;
  description: string;
}

export interface AudienceItem {
  title: string;
  tags: string[];
}

// Family Context Types for Demo
export interface Child {
  id: string;
  name: string;
  schoolName: string;
  color: string; // css class for badge
}

export interface Parent {
  id: string;
  name: string;
  isCurrentUser: boolean;
}

export interface FamilyContext {
  parents: Parent[];
  children: Child[];
  // Continuous Learning Fields
  trustedSenders?: string[]; 
  learnedKeywords?: string[];
}

export interface ServiceIntegration {
  id: string;
  name: string;
  connected: boolean;
  type: 'mail' | 'calendar' | 'messaging';
  color: string;
  accessToken?: string; // For real Gmail connection
  phoneNumber?: string; // For WhatsApp connection
}