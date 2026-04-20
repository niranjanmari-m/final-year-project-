import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { User, Users, Utensils, Trash2, Calendar, Loader2 } from 'lucide-react';
import GlassCard from './GlassCard';

interface RSVPRecord {
  id: string;
  guestName: string;
  guestCount: number;
  foodPreference: string;
  additionalDetails: string;
  originalMessage: string;
  timestamp: any;
}

interface RSVPAdminProps {
  primaryColor: string;
}

const RSVPAdmin: React.FC<RSVPAdminProps> = ({ primaryColor }) => {
  const [rsvps, setRsvps] = useState<RSVPRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const path = 'rsvps';
    const q = query(collection(db, path), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RSVPRecord[];
      setRsvps(data);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching RSVPs:', error);
      handleFirestoreError(error, OperationType.LIST, path);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this RSVP?')) return;
    const path = `rsvps/${id}`;
    try {
      await deleteDoc(doc(db, 'rsvps', id));
    } catch (err) {
      console.error('Error deleting RSVP:', err);
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const totalGuests = rsvps.reduce((acc, curr) => acc + (curr.guestCount || 0), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: primaryColor }} />
        <p className="text-blue-600/60 font-medium animate-pulse">Loading RSVPs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-black uppercase tracking-tighter" style={{ color: primaryColor }}>RSVP Dashboard</h2>
        <div className="flex justify-center gap-4">
          <div className="px-4 py-2 bg-white/60 rounded-2xl border border-white/60 shadow-sm">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Total RSVPs</p>
            <p className="text-xl font-black text-blue-950">{rsvps.length}</p>
          </div>
          <div className="px-4 py-2 bg-white/60 rounded-2xl border border-white/60 shadow-sm">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Total Guests</p>
            <p className="text-xl font-black text-blue-950">{totalGuests}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {rsvps.length === 0 ? (
          <div className="text-center py-20 bg-white/20 rounded-[3rem] border border-white/40 border-dashed">
            <p className="text-blue-600/40 font-medium">No RSVPs yet.</p>
          </div>
        ) : (
          rsvps.map((rsvp) => (
            <GlassCard key={rsvp.id} className="p-6 space-y-4 relative group">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-black text-blue-950 uppercase tracking-tight">{rsvp.guestName}</h4>
                    <p className="text-xs text-blue-600/60 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {rsvp.timestamp?.toDate().toLocaleDateString() || 'Just now'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(rsvp.id)}
                  className="w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-white/40 rounded-2xl border border-white/60 flex items-center gap-3">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-blue-950">{rsvp.guestCount} Guests</span>
                </div>
                <div className="p-3 bg-white/40 rounded-2xl border border-white/60 flex items-center gap-3">
                  <Utensils className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-blue-950 truncate">{rsvp.foodPreference || 'Not Specified'}</span>
                </div>
              </div>

              {rsvp.additionalDetails && rsvp.additionalDetails !== 'None' && (
                <div className="p-3 bg-white/40 rounded-2xl border border-white/60">
                   <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Dietary / Specifics</p>
                   <p className="text-xs text-blue-950 font-bold">{rsvp.additionalDetails}</p>
                </div>
              )}

              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Original Message</p>
                <p className="text-xs text-blue-950/80 font-medium italic leading-relaxed">"{rsvp.originalMessage}"</p>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};

export default RSVPAdmin;
