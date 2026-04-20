
import React from 'react';

interface LogoProps {
  src?: string;
  title: string;
  className?: string;
  primaryColor?: string;
}

const Logo: React.FC<LogoProps> = ({ src, title, className = "", primaryColor }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div className="absolute inset-0 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="relative w-full h-full bg-white/40 backdrop-blur-xl border-2 border-white/60 rounded-full flex items-center justify-center shadow-2xl overflow-hidden group">
        {src ? (
          <img 
            src={src} 
            alt="Wedding Logo" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="text-3xl font-black text-blue-950 tracking-tighter playfair">{title}</span>
        )}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};

export default Logo;
