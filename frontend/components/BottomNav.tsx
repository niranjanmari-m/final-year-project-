
import React from 'react';
import { Home, Info, MessageSquare, ClipboardCheck, Sparkles, Heart } from 'lucide-react';

interface BottomNavProps {
  onMicClick: () => void;
  primaryColor: string;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  isAdmin?: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ onMicClick, primaryColor, activeTab = 'home', setActiveTab = () => {}, isAdmin = false }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'info', icon: Info, label: 'Info' },
    { id: 'story', icon: Heart, label: 'Story' },
    { id: 'wall', icon: MessageSquare, label: 'Wall' },
    { id: 'rsvp', icon: ClipboardCheck, label: 'RSVP' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-8 pt-4 bg-gradient-to-t from-white via-white/90 to-transparent backdrop-blur-sm">
      <div className="max-w-md mx-auto bg-blue-950 rounded-[2.5rem] p-2 flex items-center justify-between shadow-2xl border border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
                isActive ? 'bg-white text-blue-950 scale-110 shadow-lg' : 'text-white/40 hover:text-white/60'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'animate-bounce-slow' : ''}`} />
              {isActive && (
                <span className="absolute -bottom-1 w-1 h-1 bg-blue-950 rounded-full" />
              )}
            </button>
          );
        })}
        
        <div className="w-[1px] h-8 bg-white/10 mx-1" />
        
        <button
          onClick={onMicClick}
          className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-400 to-blue-600 text-white flex items-center justify-center shadow-lg active:scale-90 transition-all group"
        >
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default BottomNav;
