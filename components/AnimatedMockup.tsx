import React, { useState, useEffect, useRef } from 'react';
import { Section } from './ui/Section';

interface Message {
  id: number;
  type: 'alto' | 'user';
  content: React.ReactNode;
  time: string;
}

interface MessageBubbleProps {
  message: Message;
  isVisible: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isVisible }) => {
  const isAlto = message.type === 'alto';

  return (
    <div
      className={`
        max-w-[85%] transition-all duration-300 ease-out
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0'}
        ${isVisible ? '' : (isAlto ? '-translate-x-3' : 'translate-x-3')}
      `}
    >
      <div
        className={`
          rounded-2xl px-4 py-3 text-sm
          ${isAlto
            ? 'bg-[#E8F5E9] text-gray-800 rounded-tl-sm'
            : 'bg-[#1E3A5F] text-white rounded-tr-sm'
          }
        `}
      >
        {message.content}
      </div>
      <div
        className={`
          text-xs text-gray-400 mt-1
          ${isAlto ? 'text-left' : 'text-right'}
        `}
      >
        {message.time}
      </div>
    </div>
  );
};

const TypingIndicator: React.FC = () => {
  return (
    <div className="bg-[#E8F5E9] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
      <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full" style={{ animationDelay: '0ms' }} />
      <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full" style={{ animationDelay: '150ms' }} />
      <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full" style={{ animationDelay: '300ms' }} />
    </div>
  );
};

export const AnimatedMockup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const mockupRef = useRef<HTMLDivElement>(null);

  const messages: Message[] = [
    {
      id: 1,
      type: 'alto',
      content: (
        <>
          <strong>Bonjour ! Voici le briefing du jour 🌟</strong>
          <ul className="mt-2 space-y-1">
            <li>• Pique-nique pour Léo (ne pas oublier !) 🥪</li>
            <li>• 17h00: RDV Dentiste Dr. Martin 🦷</li>
            <li>• Payer la cantine avant ce soir 💳</li>
          </ul>
        </>
      ),
      time: '08:01'
    },
    {
      id: 2,
      type: 'user',
      content: 'Merci Alto ! Ajoute "Acheter du pain" pour ce soir stp.',
      time: '08:15'
    },
    {
      id: 3,
      type: 'alto',
      content: (
        <>
          C'est noté ! ✅
          <br />
          <span className="text-sm opacity-80">
            J'ai aussi vu un mail de l'école pour la réunion de jeudi. Je l'ai ajouté à l'agenda partagé.
          </span>
        </>
      ),
      time: '08:16'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (mockupRef.current) {
      observer.observe(mockupRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const timings = [
      800,   // Typing 1
      1200,  // Message 1
      2500,  // Typing 2 (user message)
      2800,  // Message 2
      3600,  // Typing 3
      4200,  // Message 3
    ];

    timings.forEach((delay, index) => {
      setTimeout(() => {
        setAnimationStep(index + 1);
      }, delay);
    });
  }, [isVisible]);

  return (
    <Section id="mockup">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-alto-navy mb-4">
          Votre assistant en action
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          Chaque matin, Alto vous prépare un briefing personnalisé. Répondez en langage naturel, il s'occupe du reste.
        </p>
      </div>

      <div
        ref={mockupRef}
        className="mockup-container relative mx-auto"
        style={{ maxWidth: '320px' }}
      >
        {/* iPhone Frame */}
        <div className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-2xl z-10" />

          {/* Screen */}
          <div className="bg-white rounded-[2.5rem] overflow-hidden">
            {/* Status Bar */}
            <div className="bg-[#1E3A5F] text-white px-6 py-2 pt-8">
              <div className="flex items-center justify-between text-xs">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Chat Header */}
            <div className="bg-[#1E3A5F] text-white px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#5B8F7B] rounded-full flex items-center justify-center font-bold">
                A
              </div>
              <div>
                <div className="font-semibold">Alto Assistant</div>
                <div className="text-xs text-green-300 status-online">En ligne</div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="bg-[#F5F5F0] p-4 min-h-[400px] space-y-3">
              {/* Date Badge */}
              <div className="flex justify-center">
                <span className="bg-[#D5E8D5] text-[#1E3A5F] text-xs px-3 py-1 rounded-full">
                  AUJOURD'HUI
                </span>
              </div>

              {/* Message 1 - Alto */}
              <div className="flex justify-start">
                {animationStep >= 1 && animationStep < 2 && (
                  <TypingIndicator />
                )}
                {animationStep >= 2 && (
                  <MessageBubble
                    message={messages[0]}
                    isVisible={animationStep >= 2}
                  />
                )}
              </div>

              {/* Message 2 - User */}
              {animationStep >= 4 && (
                <div className="flex justify-end">
                  <MessageBubble
                    message={messages[1]}
                    isVisible={animationStep >= 4}
                  />
                </div>
              )}

              {/* Message 3 - Alto */}
              <div className="flex justify-start">
                {animationStep >= 5 && animationStep < 6 && (
                  <TypingIndicator />
                )}
                {animationStep >= 6 && (
                  <MessageBubble
                    message={messages[2]}
                    isVisible={animationStep >= 6}
                  />
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-3 flex items-center gap-2">
              <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-400">
                Écrivez un message...
              </div>
              <div className="w-10 h-10 bg-[#5B8F7B] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};
