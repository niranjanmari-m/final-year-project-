
import React, { useState } from 'react';
import { ChevronRight, Phone, User, Loader2, AlertCircle, ShieldCheck, Lock } from 'lucide-react';
import { Language, UserSession, WeddingData } from '../types';
import { ADMIN_PHONE, DEFAULT_WEDDING_DATA } from '../constants';
import Logo from './Logo';
import GlassCard from './GlassCard';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const ADMIN_PASSWORD = "weds030325";

interface LoginProps {
  onLogin: (session: UserSession) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [step, setStep] = useState<2 | 3>(2);
  const [selectedLang] = useState<Language>('English');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [adminPassphrase, setAdminPassphrase] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [weddingData] = useState<WeddingData>(() => {
    const saved = localStorage.getItem('wedding_data');
    return saved ? JSON.parse(saved) : DEFAULT_WEDDING_DATA;
  });

  // Check if current phone is either Super Admin or the set Invitation Controller
  const isAdmin = phone.trim() === ADMIN_PHONE || (weddingData.invitationControllerNumber && phone.trim() === weddingData.invitationControllerNumber);

  const trackGuest = (guestName: string, guestPhone: string) => {
    const savedGuests = localStorage.getItem('wedding_guests');
    const guests = savedGuests ? JSON.parse(savedGuests) : [];
    
    // Check if guest already exists (by phone)
    const exists = guests.some((g: any) => g.phone === guestPhone);
    if (!exists) {
      const newGuest = {
        name: guestName,
        phone: guestPhone,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('wedding_guests', JSON.stringify([...guests, newGuest]));
    }
  };

  const handleDetailsSubmit = async () => {
    if (name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    if (phone.trim().length < 10) {
      setError("Please enter a valid mobile number.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    // Artificial delay for premium feel
    setTimeout(() => {
      setIsLoading(false);
      if (isAdmin) {
        setStep(3);
      } else {
        trackGuest(name.trim(), phone.trim());
        onLogin({
          name: name.trim(),
          phone: phone.trim(),
          language: selectedLang,
          isAuthenticated: true,
          isAdmin: false
        });
      }
    }, 800);
  };

  const handleAdminAuth = async () => {
    if (adminPassphrase === ADMIN_PASSWORD) {
      setIsLoading(true);
      setError(null);
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        
        onLogin({
          name: name.trim(),
          phone: phone.trim(),
          language: selectedLang,
          isAuthenticated: true,
          isAdmin: true
        });
      } catch (err: any) {
        console.error('Google Sign-In Error:', err);
        setError("Admin verification failed. Please sign in with Google to access the dashboard.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setError("Invalid admin passphrase.");
    }
  };

  const logoTitle = `${weddingData.groomName[0]} & ${weddingData.brideName[0]}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-12 bg-transparent relative z-10">
      <div className="animate-float-slow">
        <Logo src={weddingData.logo} title={logoTitle} className="w-32 h-32 scale-125 mb-8" />
      </div>
      
      <GlassCard className="w-full max-w-sm p-8 space-y-8 animate-scale-in relative overflow-hidden">
        {error && (
          <div className="absolute top-0 left-0 right-0 bg-red-500/10 border-b border-red-500/20 p-4 flex items-center gap-3 animate-slide-down z-20">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-[10px] font-bold text-red-600 uppercase tracking-tight leading-tight flex-1">{error}</p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 pt-4">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-blue-950 uppercase tracking-tighter playfair">Guest Portal</h2>
              <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.1em]">Secure Invitation Access</p>
            </div>
            
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-blue-50 rounded-xl transition-colors group-focus-within:bg-blue-100">
                  <User className="text-blue-600 w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Full Name"
                  disabled={isLoading}
                  className="w-full pl-16 pr-4 py-5 bg-white border border-blue-100 rounded-[2rem] text-blue-950 font-bold placeholder:text-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-600/5 transition-all disabled:opacity-50"
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-blue-50 rounded-xl transition-colors group-focus-within:bg-blue-100">
                  <Phone className="text-blue-600 w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Mobile Number"
                  disabled={isLoading}
                  className="w-full pl-16 pr-4 py-5 bg-white border border-blue-100 rounded-[2rem] text-blue-950 font-bold placeholder:text-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-600/5 transition-all disabled:opacity-50"
                />
              </div>

              <button
                onClick={handleDetailsSubmit}
                disabled={isLoading}
                className="w-full py-5 bg-blue-950 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98] transition-all text-[10px] disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Enter Invitation <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 pt-4">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-blue-950 uppercase tracking-tighter playfair">Admin Auth</h2>
              <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.1em]">Verify Credentials</p>
            </div>
            
            <div className="space-y-6">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-blue-50 rounded-xl">
                  <Lock className="text-blue-600 w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={adminPassphrase}
                  onChange={(e) => setAdminPassphrase(e.target.value)}
                  placeholder="Enter Passphrase"
                  className="w-full pl-16 pr-4 py-5 bg-white border border-blue-100 rounded-[2rem] text-blue-950 font-black focus:outline-none focus:ring-4 focus:ring-blue-600/5 placeholder:text-blue-100"
                />
              </div>

              <button
                onClick={handleAdminAuth}
                disabled={isLoading}
                className="w-full py-5 bg-blue-950 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] flex items-center justify-center hover:bg-black shadow-2xl active:scale-[0.98] transition-all text-[10px] disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <><ShieldCheck className="w-4 h-4 mr-2" /> Verify & Login with Google</>
                )}
              </button>
              
              <button 
                onClick={() => setStep(2)} 
                className="w-full text-blue-400 text-[9px] font-black uppercase tracking-widest hover:text-blue-600"
              >
                Back to Details
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      <style>{`
        @keyframes slide-down { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes float-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-slide-down { animation: slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .mask-fade-edges { mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent); }
      `}</style>
    </div>
  );
};

export default Login;
