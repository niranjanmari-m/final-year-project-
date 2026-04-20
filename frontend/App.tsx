
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Settings, ArrowLeft, MapPin, Sparkles, Heart, Star, Smartphone, Download, Play, Square, Menu, X, Home, Info, MessageSquare, ClipboardCheck } from 'lucide-react';
import { UserSession, WeddingData } from './types';
import { DEFAULT_WEDDING_DATA, THEME_CONFIGS } from './constants';
import Login from './components/Login';
import BottomNav from './components/BottomNav';
import InvitationCard from './components/InvitationCard';
import WeddingInfo from './components/WeddingInfo';
import RSVPForm from './components/RSVPForm';
import RSVPAdmin from './components/RSVPAdmin';
import StoryEditor from './components/StoryEditor';
import GuestWall from './components/GuestWall';
import AgentUI from './components/AgentUI';
import CustomizeModal from './components/CustomizeModal';
import Logo from './components/Logo';
import Footer from './components/Footer';

import { db, auth, OperationType, handleFirestoreError, cleanObject } from './firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

const App: React.FC = () => {
  const [weddingData, setWeddingData] = useState<WeddingData>(DEFAULT_WEDDING_DATA);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [session, setSession] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isRevealed, setIsRevealed] = useState(() => {
    const weddingDate = new Date(weddingData.date).getTime();
    return weddingDate > Date.now();
  });
  const [isNarrationPlaying, setIsNarrationPlaying] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  const hasSpokenIntro = useRef(false);
  const currentThemeConfig = THEME_CONFIGS[weddingData.theme.preset];
  const mainRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const scrollToSection = (id: string) => {
    if (isScrolling) return;
    const element = document.getElementById(id);
    if (element && mainRef.current) {
      setIsScrolling(true);
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveTab(id);
      setTimeout(() => setIsScrolling(false), 1000);
    }
  };

  useEffect(() => {
    if (!isDataLoaded || !session) return;

    const options = {
      root: mainRef.current,
      threshold: 0.2, // Lower threshold for more responsive triggering
      rootMargin: '-20% 0px -20% 0px' // Focus on the middle of the screen
    };

    observerRef.current = new IntersectionObserver((entries) => {
      if (isScrolling) return;
      
      // Find the entry that is most visible in our "focused" window
      const visibleEntries = entries.filter(e => e.isIntersecting);
      if (visibleEntries.length > 0) {
        // If multiple are intersecting, the one with the highest ratio wins
        const bestEntry = visibleEntries.reduce((prev, curr) => 
          curr.intersectionRatio > prev.intersectionRatio ? curr : prev
        );
        setActiveTab(bestEntry.target.id);
      }
    }, options);

    const sections = ['home', 'info', 'story', 'wall', 'rsvp', 'venue'];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [isDataLoaded, session, isScrolling]);

  useEffect(() => {
    const checkTimer = () => {
      const isTimerEnded = new Date(weddingData.date).getTime() <= Date.now();
      if (!isTimerEnded) {
        // If timer hasn't ended, always keep it revealed (hidden popup)
        setIsRevealed(true);
      }
    };
    
    checkTimer();
    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, [weddingData.date]);

  useEffect(() => {
    document.title = `${weddingData.groomName} & ${weddingData.brideName} Wedding Invitation`;
    document.documentElement.style.setProperty('--primary', weddingData.theme.primaryColor);
    document.documentElement.style.setProperty('--accent', weddingData.theme.accentColor);
    document.documentElement.style.setProperty('--glass-blur', `${weddingData.theme.glassBlur}px`);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', weddingData.theme.primaryColor);
    
    // Check if already running as PWA
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    // Capture the Chrome install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('Chrome PWA Install Prompt Captured');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [weddingData]);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsStandalone(true);
    }
  };

  const handleSpeechInvitation = () => {
    if (!session) return;
    
    if (isNarrationPlaying) {
      window.speechSynthesis.cancel();
      setIsNarrationPlaying(false);
      return;
    }

    const langCodeMap: Record<string, string> = { 
      'English': 'en-US', 'Hindi': 'hi-IN', 'Tamil': 'ta-IN', 'Telugu': 'te-IN', 'Kannada': 'kn-IN', 'Malayalam': 'ml-IN' 
    };
    const selectedLangCode = langCodeMap[session.language] || 'en-US';
    const weddingDateObj = new Date(weddingData.date);
    const isValidDate = !isNaN(weddingDateObj.getTime());
    const formattedDate = isValidDate 
      ? weddingDateObj.toLocaleDateString(selectedLangCode, { month: 'long', day: 'numeric', year: 'numeric' })
      : (session.language === 'English' ? 'a future date' : 'आने वाली तारीख');
    
    const invitationMessages: Record<string, string> = {
      'English': `Dear guest, we cordially invite you to the wedding of ${weddingData.groomName} and ${weddingData.brideName} on ${formattedDate}. We hope to see you at ${weddingData.venueName}.`,
      'Hindi': `नमस्ते, हम आपको ${formattedDate} को ${weddingData.groomName} और ${weddingData.brideName} के विवाह समारोह में सादर आमंत्रित करते हैं। हम ${weddingData.venueName} में आपके स्वागत की प्रतीक्षा करेंगे।`,
      'Tamil': `வணக்கம், ${formattedDate} அன்று நடைபெறும் ${weddingData.groomName} மற்றும் ${weddingData.brideName} திருமண விழாவிற்கு உங்களை அன்புடன் அழைக்கிறோம். ${weddingData.venueName} இல் உங்களைச் சந்திக்க ஆவலக உள்ளோம்.`,
      'Telugu': `నమస్కారం, ${formattedDate}న జరుగుతున్న ${weddingData.groomName} మరియు ${weddingData.brideName} వివాహ మహోత్సవానికి మిమ్మల్ని సాదరంగా ఆహ్వానిస్తున్నాము. ${weddingData.venueName}లో మిమ్మల్ని కలుస్తామని ఆశిస్తున్నాము.`,
      'Kannada': `ನಮಸ್ಕಾರ, ${formattedDate} ರಂದು ನಡೆಯಲಿರುವ ${weddingData.groomName} ಮತ್ತು ${weddingData.brideName} ಅವರ ವಿವಾಹ ಮಹೋತ್ಸವಕ್ಕೆ ನಿಮ್ಮನ್ನು ಆತ್ಮೀಯವಾಗಿ ಆಹ್ವಾನಿಸುತ್ತೇವೆ. ${weddingData.venueName} ನಲ್ಲಿ ನಿಮ್ಮನ್ನು ಕಾಣಲು ನಾವು ಬಯಸುತ್ತೇವೆ.`,
      'Malayalam': `നമസ്കാരം, ${formattedDate}-ന് നടക്കുന്ന ${weddingData.groomName}, ${weddingData.brideName} എന്നിവരുടെ വിവാഹ ചടങ്ങിലേക്ക് നിങ്ങളെ സ്നേഹപൂർവ്വം ക്ഷണിക്കുന്നു. ${weddingData.venueName}-ൽ വെച്ച് നിങ്ങളെ കാണുമെന്ന് ഞങ്ങൾ പ്രതീക്ഷിക്കുന്നു.`
    };

    const utterance = new SpeechSynthesisUtterance(invitationMessages[session.language] || invitationMessages['English']);
    utterance.lang = selectedLangCode;
    
    // Find a voice that matches the language code exactly
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(selectedLangCode.split('-')[0]));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }
    
    utterance.onstart = () => setIsNarrationPlaying(true);
    utterance.onend = () => setIsNarrationPlaying(false);
    utterance.onerror = () => setIsNarrationPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (session && !hasSpokenIntro.current) {
      handleSpeechInvitation();
      hasSpokenIntro.current = true;
    }
  }, [session]);

  useEffect(() => {
    // 1. First try to load from local SQL backend
    const fetchFromSQL = async () => {
      try {
        const response = await fetch('/api/wedding');
        if (response.ok) {
          const data = await response.json();
          setWeddingData(data);
          setIsDataLoaded(true);
          return true;
        }
      } catch (err) {
        console.error('Error fetching from SQL:', err);
      }
      return false;
    };

    // 2. Setup Firebase sync as secondary source of truth
    const settingsRef = doc(db, 'settings', 'main');
    const unsubscribe = onSnapshot(settingsRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data().config;
        if (data) {
          setWeddingData(data);
          // Sync SQL backend if it matches Firebase
          fetch('/api/wedding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          }).catch(console.error);
        }
      } else {
        // Initialize with default
        const initialData = cleanObject(DEFAULT_WEDDING_DATA);
        setDoc(settingsRef, {
          config: initialData,
          updatedAt: serverTimestamp()
        }).catch(() => {});
        
        fetch('/api/wedding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(initialData)
        }).catch(console.error);
      }
      setIsDataLoaded(true);
    }, (error) => {
      console.error('Error listening to settings:', error);
      fetchFromSQL().then(success => {
        if (!success) {
          const saved = localStorage.getItem('wedding_data');
          if (saved) setWeddingData(JSON.parse(saved));
          setIsDataLoaded(true);
        }
      });
    });

    fetchFromSQL();

    return () => unsubscribe();
  }, []);

  const handleUpdateWedding = async (newData: WeddingData) => {
    setWeddingData(newData);
    localStorage.setItem('wedding_data', JSON.stringify(newData));
    
    // 1. Save to SQL Backend
    try {
      await fetch('/api/wedding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
    } catch (err) {
      console.error('Error updating SQL backend:', err);
    }
    
    // 2. Save to Firestore
    try {
      await setDoc(doc(db, 'settings', 'main'), {
        config: cleanObject(newData),
        updatedAt: serverTimestamp()
      });
      console.log('Settings successfully updated in cloud');
    } catch (err) {
      console.error('Error updating settings in cloud:', err);
    }
  };

  const EntrancePopup = () => {
    const isTimerEnded = new Date(weddingData.date).getTime() <= Date.now();
    if (!isTimerEnded) return null;

    const isSeal = weddingData.theme.entranceStyle === 'seal';
    const isBloom = weddingData.theme.entranceStyle === 'bloom';
    const isCurtains = weddingData.theme.entranceStyle === 'curtains';

    return (
      <div className={`fixed inset-0 z-[100] transition-all duration-1000 ${isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {isCurtains && (
          <>
            <div className={`fixed inset-y-0 left-0 w-1/2 bg-blue-950 z-[101] transition-transform duration-1000 ease-in-out ${isRevealed ? '-translate-x-full' : 'translate-x-0'}`} />
            <div className={`fixed inset-y-0 right-0 w-1/2 bg-blue-950 z-[101] transition-transform duration-1000 ease-in-out ${isRevealed ? 'translate-x-full' : 'translate-x-0'}`} />
          </>
        )}
        <div className={`fixed inset-0 bg-blue-950/20 backdrop-blur-3xl flex items-center justify-center p-8 z-[102]`}>
          <div className={`w-full max-w-sm bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[3rem] p-10 text-center shadow-2xl transition-all duration-700 ${isRevealed ? (isBloom ? 'scale-[5] opacity-0 blur-3xl' : 'scale-150 rotate-12 opacity-0') : 'scale-100'}`}>
            <div className="space-y-8 relative z-10">
              <div className={`mx-auto transition-all ${isSeal ? 'animate-bounce' : 'animate-pulse'}`}>
                <Logo 
                  src={weddingData.logo} 
                  title={`${weddingData.groomName[0]} & ${weddingData.brideName[0]}`} 
                  className="w-28 h-28" 
                  primaryColor={weddingData.theme.primaryColor}
                />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-black uppercase tracking-tighter playfair" style={{ color: weddingData.theme.primaryColor }}>The Invitation</h2>
                <p className="text-blue-950/60 font-medium text-sm italic">Witness the union of {weddingData.groomName} & {weddingData.brideName}</p>
              </div>
              <button 
                onClick={() => setIsRevealed(true)}
                className="w-full py-5 text-white rounded-3xl font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all text-[10px] flex items-center justify-center gap-3"
                style={{ background: weddingData.theme.primaryColor }}
              >
                Enter Experience <Heart className="w-3.5 h-3.5 fill-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isDataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="flex flex-col items-center gap-4">
          <Logo src={DEFAULT_WEDDING_DATA.logo} title="&" className="w-24 h-24 animate-pulse" />
          <p className="text-blue-400 font-bold uppercase tracking-[0.2em] text-[10px]">Preparing Your Invitation...</p>
        </div>
      </div>
    );
  }

  if (!session) return <Login onLogin={setSession} />;

  const menuTabs: { id: string; icon: any; label: string; adminOnly?: boolean }[] = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'info', icon: Info, label: 'Details' },
    { id: 'story', icon: Heart, label: 'Story' },
    { id: 'wall', icon: MessageSquare, label: 'Wall' },
    { id: 'rsvp', icon: ClipboardCheck, label: 'RSVP' },
    { id: 'venue', icon: MapPin, label: 'Venue' },
  ];

  const filteredTabs = menuTabs.filter(tab => !tab.adminOnly || (session && session.isAdmin));

  return (
    <div className="h-screen flex flex-col overflow-hidden relative" style={{ background: currentThemeConfig.bg }}>
      {/* Background Image Layer for Home */}
      {weddingData.homeBackgroundImage && (
        <div 
          className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none z-0 ${activeTab === 'home' ? 'opacity-100' : 'opacity-0'}`}
          style={{ 
            backgroundImage: `url(${weddingData.homeBackgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-blue-900/10 backdrop-blur-[2px]" />
        </div>
      )}
      <EntrancePopup />

      {/* Sidebar Menu */}
      <div className={`fixed inset-0 z-[100] transition-all duration-500 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-md" onClick={() => setIsMenuOpen(false)} />
        <div className={`absolute top-0 left-0 bottom-0 w-72 bg-white shadow-2xl transition-transform duration-500 ease-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
          <div className="p-8 border-b border-blue-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo 
                src={weddingData.logo} 
                title={`${weddingData.groomName[0]} & ${weddingData.brideName[0]}`} 
                className="w-12 h-12" 
                primaryColor={weddingData.theme.primaryColor}
              />
              <span className="text-lg font-black text-blue-950 uppercase tracking-tighter playfair">Menu</span>
            </div>
            <button onClick={() => setIsMenuOpen(false)} className="p-2 text-blue-300 hover:text-blue-950 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-2">
            {filteredTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  scrollToSection(tab.id);
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                  activeTab === tab.id 
                  ? 'bg-blue-50 text-blue-950 shadow-sm' 
                  : 'text-blue-400 hover:bg-blue-50/50 hover:text-blue-800'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-blue-800' : ''}`} />
                <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="p-8 border-t border-blue-50">
            <button 
              onClick={() => setSession(null)}
              className="w-full py-4 bg-blue-50 text-blue-800 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-blue-100 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <header 
        className="flex justify-between items-center px-6 py-5 z-50 shrink-0 bg-transparent"
      >
        <div className="w-10">
          <button 
            onClick={() => setIsMenuOpen(true)} 
            className="w-10 h-10 bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 shadow-sm active:scale-90 transition-all"
          >
            <Menu className="w-5 h-5 text-blue-950" />
          </button>
        </div>
        <div className="flex-1 flex justify-center">
           <div onClick={() => scrollToSection('home')} className="cursor-pointer">
             <Logo 
               src={weddingData.logo} 
               title={`${weddingData.groomName[0]} & ${weddingData.brideName[0]}`} 
               className="w-14 h-14" 
               primaryColor={weddingData.theme.primaryColor}
             />
           </div>
        </div>
        <div className="w-10 flex justify-end">
          {session.isAdmin && (
            <button 
              onClick={() => setIsAdminOpen(true)} 
              className="w-10 h-10 bg-white/40 backdrop-blur-md text-blue-950 rounded-full border border-white/50 shadow-lg active:scale-90 transition-all flex items-center justify-center"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      <main ref={mainRef} className="flex-1 overflow-y-auto px-6 pt-8 pb-0 no-scrollbar scroll-smooth">
        {/* Sections rendered vertically */}
        
        <div id="home" className="min-h-[80vh] flex flex-col justify-center py-10">
          <div className={`flex flex-col gap-10 transition-all duration-1000 ${isRevealed ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}>
            <InvitationCard data={weddingData} />
            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="flex justify-center">
                  <button 
                    onClick={handleSpeechInvitation}
                    className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all"
                    style={{ background: weddingData.theme.primaryColor }}
                  >
                    {isNarrationPlaying ? (
                      <Square className="w-8 h-8 text-white fill-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white fill-white translate-x-0.5" />
                    )}
                  </button>
                </div>

                {deferredPrompt && !isStandalone && (
                  <button 
                    onClick={handleInstallApp}
                    className="w-full p-4 bg-blue-800 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.25em] flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all animate-bounce"
                  >
                    <Download className="w-4 h-4" /> Install Wedding App
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div id="info" className="min-h-screen py-20 border-t border-blue-50/30">
          <WeddingInfo data={weddingData} />
        </div>

        <div id="story" className="min-h-screen py-20 border-t border-blue-50/30">
          <StoryEditor 
            currentStory={weddingData.story} 
            onSave={(newStory) => handleUpdateWedding({ ...weddingData, story: newStory })}
            primaryColor={weddingData.theme.primaryColor}
            isAdmin={session.isAdmin}
          />
        </div>

        <div id="wall" className="min-h-screen py-20 border-t border-blue-50/30">
          <GuestWall primaryColor={weddingData.theme.primaryColor} isAdmin={session.isAdmin} />
        </div>

        <div id="rsvp" className="min-h-screen py-20 border-t border-blue-50/30">
          {session.isAdmin ? (
            <RSVPAdmin primaryColor={weddingData.theme.primaryColor} />
          ) : (
            <RSVPForm primaryColor={weddingData.theme.primaryColor} />
          )}
        </div>

        <div id="venue" className="min-h-screen py-20 border-t border-blue-50/30">
          <div className="space-y-10 animate-fade-in pb-10">
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-black uppercase tracking-tighter" style={{ color: weddingData.theme.primaryColor }}>The Venue</h2>
            </div>
            <div className="overflow-hidden aspect-[4/3] rounded-[3rem] border-8 border-white shadow-2xl relative bg-white/20 backdrop-blur-xl">
               <iframe
                 src={`https://maps.google.com/maps?q=${encodeURIComponent(weddingData.venueName + ' ' + weddingData.venueAddress)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                 width="100%" height="100%" style={{ border: 0 }}
                 className="grayscale hover:grayscale-0 transition-all duration-1000"
               ></iframe>
            </div>
            <div className="p-10 text-center space-y-8 rounded-[3rem] bg-white/40 backdrop-blur-xl border border-white">
               <div className="w-20 h-20 bg-white/60 rounded-full flex items-center justify-center mx-auto shadow-inner">
                 <MapPin className="w-10 h-10" style={{ color: weddingData.theme.primaryColor }} />
               </div>
               <div className="space-y-3">
                 <h3 className="text-2xl font-black text-blue-950 uppercase tracking-tight">{weddingData.venueName}</h3>
                 <p className="text-blue-800/60 font-medium text-sm leading-relaxed px-4">{weddingData.venueAddress}</p>
               </div>
               <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(weddingData.venueAddress)}`} target="_blank" className="block w-full py-5 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all text-center" style={{ background: weddingData.theme.primaryColor }}>
                 Open in Maps
               </a>
            </div>
          </div>
        </div>
        
        <Footer data={weddingData} />
      </main>

      <BottomNav 
        activeTab={activeTab}
        setActiveTab={scrollToSection}
        onMicClick={() => setIsAgentOpen(true)} 
        primaryColor={weddingData.theme.primaryColor}
        isAdmin={session.isAdmin}
      />
      <AgentUI isOpen={isAgentOpen} onClose={() => setIsAgentOpen(false)} language={session.language} weddingData={weddingData} />
      <CustomizeModal 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        data={weddingData} 
        onSave={handleUpdateWedding}
      />

      <style>{`
        :root { --primary: ${weddingData.theme.primaryColor}; --accent: ${weddingData.theme.accentColor}; --glass-blur: ${weddingData.theme.glassBlur}px; }
        .backdrop-blur-xl { backdrop-filter: blur(var(--glass-blur)); }
        .playfair { font-family: 'Playfair Display', serif; }
      `}</style>
    </div>
  );
};

export default App;
