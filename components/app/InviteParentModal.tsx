import React, { useState } from 'react';
import { X, Mail, Send, Loader2, Check, Copy, Link } from 'lucide-react';
import { Button } from '../ui/Button';
import { createInvitation, isSupabaseConfigured } from '../../services/supabase';

interface InviteParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyId?: string | null;
  userId?: string;
}

export const InviteParentModal: React.FC<InviteParentModalProps> = ({
  isOpen,
  onClose,
  familyId,
  userId
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [inviteLink, setInviteLink] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Demo mode
    if (!isSupabaseConfigured() || !familyId || !userId) {
      const demoToken = 'demo-' + Math.random().toString(36).substr(2, 9);
      const link = `${window.location.origin}?token=${demoToken}`;
      setInviteLink(link);
      setSuccess(true);
      setLoading(false);
      return;
    }

    try {
      const invitation = await createInvitation(familyId, userId, email);

      // Generate invite link
      const link = `${window.location.origin}?token=${invitation.token}`;
      setInviteLink(link);

      // Send email via backend
      try {
        await fetch('/api/send-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            inviteLink: link,
            familyId
          })
        });
      } catch {
        // Email send failed, but invitation was created
        console.warn('Email send failed, but invitation link is ready');
      }

      setSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue.');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
  };

  const handleClose = () => {
    setEmail('');
    setSuccess(false);
    setError('');
    setInviteLink('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="font-display font-bold text-alto-navy text-lg">
            Inviter un partenaire
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-green-600" />
              </div>
              <h4 className="font-bold text-alto-navy mb-2">Invitation envoyee !</h4>
              <p className="text-gray-500 text-sm mb-6">
                {email ? (
                  <>Un email a ete envoye a <strong>{email}</strong>.</>
                ) : (
                  <>Partagez le lien ci-dessous avec votre partenaire.</>
                )}
              </p>

              {/* Invite Link */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Link size={14} className="text-gray-400" />
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Lien d'invitation</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={inviteLink}
                    className="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-600 outline-none"
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <button
                    onClick={copyLink}
                    className="flex items-center gap-1 bg-alto-navy text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-alto-navy/90 transition-colors"
                  >
                    <Copy size={12} />
                    Copier
                  </button>
                </div>
              </div>

              <Button onClick={handleClose} variant="secondary" className="w-full">
                Fermer
              </Button>
            </div>
          ) : (
            <>
              <p className="text-gray-500 text-sm mb-6">
                Entrez l'email de votre partenaire pour l'inviter a rejoindre votre famille sur Alto.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email du partenaire"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-alto-sage focus:outline-none transition-colors"
                    required
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                <Button type="submit" className="w-full" disabled={loading || !email}>
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Send size={16} className="mr-2" />
                      Envoyer l'invitation
                    </>
                  )}
                </Button>
              </form>

              <p className="text-[10px] text-gray-400 text-center mt-4">
                L'invitation expire dans 7 jours.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
