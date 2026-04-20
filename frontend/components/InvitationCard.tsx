
import React from 'react';
import { Heart } from 'lucide-react';

interface InvitationCardProps {
  data: any;
  primaryColor?: string;
}

const InvitationCard: React.FC<InvitationCardProps> = ({ data: weddingData, primaryColor }) => {
  return (
    <div className="space-y-8 animate-scale-in">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/40 backdrop-blur-md border border-white/60 rounded-full">
          <Heart className="w-3 h-3 text-red-500 fill-red-500" />
          <span className="text-[10px] font-black text-blue-950 uppercase tracking-[0.3em]">Save The Date</span>
        </div>
        
        <h1 className="text-6xl font-black text-blue-950 tracking-tighter playfair leading-none">
          {weddingData.groomName} <br />
          <span className="text-blue-400">&</span> <br />
          {weddingData.brideName}
        </h1>
        
        <p className="text-blue-800/60 font-medium uppercase tracking-[0.2em] text-xs">Are getting married</p>
      </div>
    </div>
  );
};

export default InvitationCard;
