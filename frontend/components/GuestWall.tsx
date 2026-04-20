
import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType, cleanObject } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { MessageSquare, Send, Heart, Star, Loader2, User } from 'lucide-react';
import { beautifyMessage, BeautifiedMessage } from '../src/services/aiService';
import GlassCard from './GlassCard';

interface WallMessage {
  id: string;
  text: string;
  author: string;
  title: string;
  rating: number;
  timestamp: any;
}

interface GuestWallProps {
  userName?: string;
  primaryColor: string;
  isAdmin?: boolean;
}

const GuestWall: React.FC<GuestWallProps> = ({ userName = "Guest", primaryColor, isAdmin }) => {
  const [messages, setMessages] = useState<WallMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const path = 'messages';
    const q = query(collection(db, path), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WallMessage[];
      setMessages(data);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching messages:', error);
      handleFirestoreError(error, OperationType.LIST, path);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    setIsSending(true);
    const path = 'messages';
    try {
      const beautified = await beautifyMessage(input);
      if (beautified.isAppropriate) {
        await addDoc(collection(db, path), cleanObject({
          text: beautified.beautifiedText,
          author: userName,
          title: beautified.title,
          rating: beautified.rating,
          timestamp: serverTimestamp(),
        }));
        setInput('');
      } else {
        alert('Your message was flagged as inappropriate. Please keep it celebratory!');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      handleFirestoreError(err, OperationType.WRITE, path);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-32">
      <div className="text-left space-y-3 px-2">
        <h2 className="text-4xl font-black uppercase tracking-tighter" style={{ color: primaryColor }}>Guest Wall</h2>
        <p className="text-blue-800/60 font-medium text-sm">Leave a beautiful message for the couple.</p>
      </div>

      <GlassCard className="p-6 space-y-4">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write your wishes here..."
            className="w-full h-24 p-4 bg-white/50 border border-white/60 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-blue-950 font-medium text-sm"
          />
        </div>
        <button
          onClick={handleSend}
          disabled={isSending || !input.trim()}
          className="w-full py-4 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: primaryColor }}
        >
          {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Post Message
        </button>
      </GlassCard>

      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-blue-600/40 font-medium">No messages yet. Be the first!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <GlassCard key={msg.id} className="p-6 space-y-4 animate-slide-up">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-black text-blue-950 uppercase tracking-tight text-sm">{msg.author}</h4>
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{msg.title}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Heart key={i} className={`w-3 h-3 ${i < msg.rating ? 'text-red-500 fill-red-500' : 'text-slate-200'}`} />
                  ))}
                </div>
              </div>
              <p className="text-blue-950/80 font-medium leading-relaxed italic">"{msg.text}"</p>
              <p className="text-[9px] text-blue-600/40 font-black uppercase tracking-widest text-right">
                {msg.timestamp?.toDate().toLocaleDateString()}
              </p>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};

export default GuestWall;
