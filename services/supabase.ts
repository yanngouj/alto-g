import { createClient, User, Session, AuthChangeEvent } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Running in demo mode.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
}

export interface Family {
  id: string;
  name: string;
  created_at: string;
  created_by: string | null;
}

export interface FamilyMemberRow {
  id: string;
  family_id: string;
  user_id: string;
  role: 'owner' | 'parent';
  joined_at: string;
}

export interface ChildRow {
  id: string;
  family_id: string;
  name: string;
  birth_date: string | null;
  school_name: string | null;
  activities: string[];
  color: string;
}

export interface InvitationRow {
  id: string;
  family_id: string;
  inviter_id: string;
  email: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  expires_at: string;
  families?: { id: string; name: string } | null;
  profiles?: { display_name: string | null; email: string } | null;
}

export interface IntegrationRow {
  id: string;
  family_id: string;
  user_id: string;
  service_type: 'gmail' | 'gcal' | 'whatsapp';
  phone_number: string | null;
  is_active: boolean;
}

// ============================================================================
// AUTH FUNCTIONS
// ============================================================================

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

// Sign up with email/password
export const signUp = async (email: string, password: string, displayName?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName
      }
    }
  });

  if (error) throw error;
  return data;
};

// Sign in with email/password
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
};

// Sign in with Google OAuth
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });

  if (error) throw error;
  return data;
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Get current session
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

// Get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Subscribe to auth changes
export const onAuthStateChange = (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};

// ============================================================================
// PROFILE FUNCTIONS
// ============================================================================

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as Profile | null;
};

export const createProfile = async (userId: string, email: string, displayName?: string): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      display_name: displayName
    })
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
};

export const updateProfile = async (userId: string, updates: { display_name?: string }): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
};

// ============================================================================
// FAMILY FUNCTIONS
// ============================================================================

export const createFamily = async (name: string, createdBy: string): Promise<Family> => {
  const { data, error } = await supabase
    .from('families')
    .insert({
      name,
      created_by: createdBy
    })
    .select()
    .single();

  if (error) throw error;
  return data as Family;
};

export const getFamily = async (familyId: string): Promise<Family> => {
  const { data, error } = await supabase
    .from('families')
    .select('*')
    .eq('id', familyId)
    .single();

  if (error) throw error;
  return data as Family;
};

interface FamilyMemberWithFamily {
  family_id: string;
  role: string;
  joined_at: string;
  families: Family | null;
}

export const getUserFamilies = async (userId: string): Promise<FamilyMemberWithFamily[]> => {
  const { data, error } = await supabase
    .from('family_members')
    .select(`
      family_id,
      role,
      joined_at,
      families (
        id,
        name,
        created_at,
        created_by
      )
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return (data || []) as unknown as FamilyMemberWithFamily[];
};

// ============================================================================
// FAMILY MEMBER FUNCTIONS
// ============================================================================

export const addFamilyMember = async (familyId: string, userId: string, role: 'owner' | 'parent' = 'parent'): Promise<FamilyMemberRow> => {
  const { data, error } = await supabase
    .from('family_members')
    .insert({
      family_id: familyId,
      user_id: userId,
      role
    })
    .select()
    .single();

  if (error) throw error;
  return data as FamilyMemberRow;
};

interface FamilyMemberWithProfile {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles: Profile | null;
}

export const getFamilyMembers = async (familyId: string): Promise<FamilyMemberWithProfile[]> => {
  const { data, error } = await supabase
    .from('family_members')
    .select(`
      id,
      user_id,
      role,
      joined_at,
      profiles (
        id,
        email,
        display_name
      )
    `)
    .eq('family_id', familyId);

  if (error) throw error;
  return (data || []) as unknown as FamilyMemberWithProfile[];
};

// ============================================================================
// CHILDREN FUNCTIONS
// ============================================================================

export const getChildren = async (familyId: string): Promise<ChildRow[]> => {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('family_id', familyId);

  if (error) throw error;
  return (data || []) as ChildRow[];
};

export const addChild = async (
  familyId: string,
  child: {
    name: string;
    birth_date?: string;
    school_name?: string;
    activities?: string[];
    color?: string;
  }
): Promise<ChildRow> => {
  const { data, error } = await supabase
    .from('children')
    .insert({
      family_id: familyId,
      name: child.name,
      birth_date: child.birth_date,
      school_name: child.school_name,
      activities: child.activities || [],
      color: child.color || 'bg-alto-sage/30 text-alto-navy'
    })
    .select()
    .single();

  if (error) throw error;
  return data as ChildRow;
};

export const updateChild = async (
  childId: string,
  updates: {
    name?: string;
    birth_date?: string | null;
    school_name?: string;
    activities?: string[];
    color?: string;
  }
): Promise<ChildRow> => {
  const { data, error } = await supabase
    .from('children')
    .update(updates)
    .eq('id', childId)
    .select()
    .single();

  if (error) throw error;
  return data as ChildRow;
};

export const deleteChild = async (childId: string): Promise<void> => {
  const { error } = await supabase
    .from('children')
    .delete()
    .eq('id', childId);

  if (error) throw error;
};

// ============================================================================
// INVITATION FUNCTIONS
// ============================================================================

export const createInvitation = async (familyId: string, inviterId: string, email: string): Promise<InvitationRow> => {
  const token = crypto.randomUUID();

  const { data, error } = await supabase
    .from('invitations')
    .insert({
      family_id: familyId,
      inviter_id: inviterId,
      email,
      token
    })
    .select()
    .single();

  if (error) throw error;
  return data as InvitationRow;
};

export const getInvitationByToken = async (token: string): Promise<InvitationRow | null> => {
  const { data, error } = await supabase
    .from('invitations')
    .select(`
      *,
      families (
        id,
        name
      ),
      profiles:inviter_id (
        display_name,
        email
      )
    `)
    .eq('token', token)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as InvitationRow | null;
};

export const acceptInvitation = async (token: string, userId: string): Promise<InvitationRow> => {
  // Get invitation
  const invitation = await getInvitationByToken(token);
  if (!invitation) throw new Error('Invalid or expired invitation');

  // Add user to family
  await addFamilyMember(invitation.family_id, userId, 'parent');

  // Update invitation status
  const { error } = await supabase
    .from('invitations')
    .update({ status: 'accepted' })
    .eq('token', token);

  if (error) throw error;

  return invitation;
};

export const getPendingInvitations = async (familyId: string): Promise<InvitationRow[]> => {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('family_id', familyId)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString());

  if (error) throw error;
  return (data || []) as InvitationRow[];
};

export const cancelInvitation = async (invitationId: string): Promise<void> => {
  const { error } = await supabase
    .from('invitations')
    .delete()
    .eq('id', invitationId);

  if (error) throw error;
};

// ============================================================================
// INTEGRATIONS FUNCTIONS
// ============================================================================

export const getIntegrations = async (familyId: string, userId: string): Promise<IntegrationRow[]> => {
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('family_id', familyId)
    .eq('user_id', userId);

  if (error) throw error;
  return (data || []) as IntegrationRow[];
};

export const upsertIntegration = async (
  familyId: string,
  userId: string,
  serviceType: 'gmail' | 'gcal' | 'whatsapp',
  data: { phone_number?: string; is_active?: boolean }
): Promise<IntegrationRow> => {
  const { data: result, error } = await supabase
    .from('integrations')
    .upsert({
      family_id: familyId,
      user_id: userId,
      service_type: serviceType,
      ...data
    }, {
      onConflict: 'family_id,user_id,service_type'
    })
    .select()
    .single();

  if (error) throw error;
  return result as IntegrationRow;
};
