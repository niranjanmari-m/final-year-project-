
import React from 'react';
import { Heart } from 'lucide-react';

interface FooterProps {
  data?: any;
}

const Footer: React.FC<FooterProps> = ({ data }) => {
  return (
    <footer className="py-12 px-6 text-center space-y-4">
      <div className="flex items-center justify-center gap-2">
        <div className="w-8 h-[1px] bg-blue-200" />
        <Heart className="w-4 h-4 text-red-400 animate-pulse" />
        <div className="w-8 h-[1px] bg-blue-200" />
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black text-blue-950 uppercase tracking-[0.4em]">Made with Love</p>
        <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">For Arjun & Meera</p>
      </div>
    </footer>
  );
};

export default Footer;
