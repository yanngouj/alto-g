import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const PhoneMockup: React.FC = () => {
  return (
    <div className="relative mx-auto border-gray-900 bg-gray-900 border-[12px] rounded-[2.5rem] h-[500px] w-[280px] shadow-2xl flex flex-col overflow-hidden">
      {/* Camera Notch */}
      <div className="h-[32px] w-full bg-gray-900 absolute top-0 left-0 z-20 flex justify-center">
         <div className="h-4 w-32 bg-black rounded-b-xl"></div>
      </div>
      
      {/* Screen Content */}
      <div className="flex-1 bg-[#ECE5DD] pt-12 pb-4 px-3 flex flex-col font-sans overflow-hidden relative">
        {/* WhatsApp Header */}
        <div className="absolute top-0 left-0 w-full h-16 bg-[#075E54] flex items-end pb-2 px-4 text-white z-10">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-alto-sage rounded-full flex items-center justify-center text-alto-navy font-bold text-xs">A</div>
             <span className="font-semibold">Alto Assistant</span>
           </div>
        </div>

        {/* Chat Bubbles */}
        <div className="mt-6 space-y-4 flex flex-col">
          
          {/* Date Badge */}
          <div className="self-center bg-[#DDECF2] text-[#555] text-[10px] px-2 py-1 rounded shadow-sm uppercase">
            Aujourd'hui
          </div>

          {/* Message 1 */}
          <div className="self-start bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-[90%] text-xs text-gray-800 relative">
             <p className="font-bold text-alto-navy mb-1">Bonjour ! Voici le briefing du jour ☀️</p>
             <ul className="space-y-2">
               <li className="flex items-start gap-2">
                 <span className="text-alto-terra">•</span>
                 <span>Pique-nique pour Léo (ne pas oublier !) 🥪</span>
               </li>
               <li className="flex items-start gap-2">
                 <span className="text-alto-navy">•</span>
                 <span>17h00: RDV Dentiste Dr. Martin 🦷</span>
               </li>
               <li className="flex items-start gap-2">
                 <span className="text-alto-navy">•</span>
                 <span>Payer la cantine avant ce soir 💶</span>
               </li>
             </ul>
             <span className="text-[9px] text-gray-400 absolute bottom-1 right-2">08:01</span>
          </div>

          {/* Message 2 (User) */}
          <div className="self-end bg-[#DCF8C6] p-2 rounded-lg rounded-tr-none shadow-sm max-w-[80%] text-xs text-gray-800 relative">
             <p>Merci Alto ! Ajoute "Acheter du pain" pour ce soir stp.</p>
             <span className="text-[9px] text-gray-400 absolute bottom-1 right-2 flex items-center gap-0.5">
               08:15 <CheckCircle2 size={8} className="text-blue-500" />
             </span>
          </div>

          {/* Message 3 */}
           <div className="self-start bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-[90%] text-xs text-gray-800 relative">
             <p>C'est noté ! ✅</p>
             <p className="mt-1">J'ai aussi vu un mail de l'école pour la réunion de jeudi. Je l'ai ajouté à l'agenda partagé.</p>
             <span className="text-[9px] text-gray-400 absolute bottom-1 right-2">08:16</span>
          </div>

        </div>
      </div>
    </div>
  );
};