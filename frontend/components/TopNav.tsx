
import React from 'react';
import { Settings, Menu, X, User } from 'lucide-react';

interface TopNavProps {
  userName: string;
  isAdmin: boolean;
  onOpenAdmin: () => void;
  onOpenMenu: () => void;
  isMenuOpen: boolean;
}

const TopNav: React.FC<TopNavProps> = ({ userName, isAdmin, onOpenAdmin, onOpenMenu, isMenuOpen }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 px-4 py-2 bg-white/40 backdrop-blur-xl border border-white/60 rounded-full shadow-lg">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-3 h-3 text-white" />
          </div>
          <span className="text-[10px] font-black text-blue-950 uppercase tracking-widest truncate max-w-[100px]">
            {userName}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="p-3 bg-blue-950 text-white rounded-full shadow-xl active:scale-90 transition-all"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onOpenMenu}
            className="p-3 bg-white/40 backdrop-blur-xl border border-white/60 text-blue-950 rounded-full shadow-lg active:scale-90 transition-all"
          >
            {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
