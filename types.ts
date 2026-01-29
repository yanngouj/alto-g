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
  birthDate?: string;  // ISO date string (YYYY-MM-DD)
  schoolName: string;
  activities: string[];  // Array of activity names
  color: string; // css class for badge
}

export interface Parent {
  id: string;
  name: string;
  email?: string;
  isCurrentUser: boolean;
}

// Utility function to calculate age from birth date
export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

// Format age display in French
export const formatAge = (birthDate: string): string => {
  const age = calculateAge(birthDate);
  if (age < 1) {
    const months = Math.floor((new Date().getTime() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30));
    return `${months} mois`;
  }
  return `${age} an${age > 1 ? 's' : ''}`;
};

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
  suggested?: boolean; // Pre-suggested from waitlist preferences
}