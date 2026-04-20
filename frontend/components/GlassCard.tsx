
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = "" }) => {
  return (
    <div className={`bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[3rem] shadow-2xl ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;
