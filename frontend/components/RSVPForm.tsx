import React, { useState } from 'react';
import { Send, User, Users, Utensils, CheckCircle2, Loader2 } from 'lucide-react';
import { extractRSVPInfo, ExtractedRSVP } from '../src/services/aiService';
import { db, handleFirestoreError, OperationType, cleanObject } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import GlassCard from './GlassCard';

interface RSVPFormProps {
  primaryColor: string;
}

const RSVPForm: React.FC<RSVPFormProps> = ({ primaryColor }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedRSVP | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    setError(null);
    try {
      const data = await extractRSVPInfo(input);
      setExtractedData(data);
    } catch (err) {
      console.error('Error extracting RSVP:', err);
      setError('Sorry, I couldn\'t understand that. Please try again with more details like your name and guest count.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!extractedData) return;
    setIsProcessing(true);
    const path = 'rsvps';
    try {
      await addDoc(collection(db, path), cleanObject({
        ...extractedData,
        originalMessage: input,
        timestamp: serverTimestamp(),
      }));
      setIsSaved(true);
    } catch (err) {
      console.error('Error saving RSVP:', err);
      handleFirestoreError(err, OperationType.WRITE, path);
      setError('Failed to save RSVP. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSaved) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-12 animate-fade-in">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center shadow-inner">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-blue-950">Thank You!</h2>
          <p className="text-blue-800/60 font-medium">Your RSVP has been recorded successfully.</p>
        </div>
        <button 
          onClick={() => { setIsSaved(false); setExtractedData(null); setInput(''); }}
          className="px-8 py-4 bg-white border border-blue-100 rounded-2xl text-blue-800 font-bold uppercase tracking-widest text-[10px] hover:bg-blue-50 transition-all"
        >
          Send Another RSVP
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="text-left space-y-3 px-2">
        <h2 className="text-4xl font-black uppercase tracking-tighter" style={{ color: primaryColor }}>RSVP</h2>
        <p className="text-blue-800/60 font-medium text-sm">Just tell us who's coming and any special needs!</p>
      </div>

      {!extractedData ? (
        <GlassCard className="p-8 space-y-6">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Your Message</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., I'm coming with 3 people, my name is John. We'd like vegetarian food."
              className="w-full h-32 p-6 bg-white/50 border border-white/60 rounded-3xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-blue-950 font-medium"
            />
          </div>
          <button
            onClick={handleProcess}
            disabled={isProcessing || !input.trim()}
            className="w-full py-5 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            style={{ background: primaryColor }}
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            Confirm Details
          </button>
          {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}
        </GlassCard>
      ) : (
        <GlassCard className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 bg-white/40 rounded-2xl border border-white/60">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                <User className="w-5 h-5 text-blue-800" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Name</p>
                <p className="text-blue-950 font-bold truncate">{extractedData.guestName}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white/40 rounded-2xl border border-white/60">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                <Users className="w-5 h-5 text-blue-800" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">People</p>
                <p className="text-blue-950 font-bold">{extractedData.guestCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white/40 rounded-2xl border border-white/60">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                <Utensils className="w-5 h-5 text-blue-800" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Food Preference</p>
                <p className="text-blue-950 font-bold">{extractedData.foodPreference}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white/40 rounded-2xl border border-white/60">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                <CheckCircle2 className="w-5 h-5 text-blue-800" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Details</p>
                <p className="text-blue-950 font-bold truncate">{extractedData.additionalDetails}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setExtractedData(null)}
              className="flex-1 py-5 bg-white border border-blue-100 text-blue-800 rounded-3xl font-black uppercase tracking-[0.2em] active:scale-95 transition-all text-[10px]"
            >
              Edit
            </button>
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className="flex-[2] py-5 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              style={{ background: primaryColor }}
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              Submit RSVP
            </button>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default RSVPForm;
