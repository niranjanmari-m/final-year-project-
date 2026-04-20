
import React from 'react';
import { Heart, Star, Sparkles, MapPin, Calendar, Clock, Users, User, Briefcase, Home as HomeIcon } from 'lucide-react';
import GlassCard from './GlassCard';

interface WeddingInfoProps {
  data: any;
  primaryColor?: string;
}

const WeddingInfo: React.FC<WeddingInfoProps> = ({ data: weddingData, primaryColor }) => {
  return (
    <div className="space-y-12 animate-fade-in pb-20">
      <div className="text-left space-y-3 px-2">
        <h2 className="text-4xl font-black uppercase tracking-tighter" style={{ color: primaryColor }}>Event Details</h2>
        <p className="text-blue-800/60 font-medium text-sm">Everything you need to know about our big day.</p>
      </div>

      <div className="space-y-6">
        <div className="text-left space-y-3 px-2">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
            <User className="w-3 h-3" /> Couple Profiles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Groom Profile */}
           <GlassCard className="p-8 space-y-6 flex flex-col items-center text-center">
             <div className="w-40 h-40 rounded-full border-4 border-white shadow-xl overflow-hidden group">
               <img 
                 src={weddingData.groomImage || 'https://picsum.photos/seed/groom/400/400'} 
                 alt={weddingData.groomName} 
                 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                 referrerPolicy="no-referrer"
               />
             </div>
             <div className="space-y-4 w-full">
               <div className="space-y-1">
                 <h3 className="text-2xl font-black text-blue-950 uppercase tracking-tighter playfair">{weddingData.groomName}</h3>
                 <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em]">The Groom</p>
               </div>
               <div className="grid grid-cols-1 gap-2 text-left">
                 {weddingData.groomJob && (
                   <div className="flex items-center gap-3 p-3 bg-white/40 rounded-2xl border border-white/60">
                     <Briefcase className="w-4 h-4 text-blue-600" />
                     <span className="text-xs font-bold text-blue-900">{weddingData.groomJob}</span>
                   </div>
                 )}
                 {weddingData.groomLiving && (
                   <div className="flex items-center gap-3 p-3 bg-white/40 rounded-2xl border border-white/60">
                     <HomeIcon className="w-4 h-4 text-blue-600" />
                     <span className="text-xs font-bold text-blue-900">Living in {weddingData.groomLiving}</span>
                   </div>
                 )}
                 {weddingData.groomNative && (
                   <div className="flex items-center gap-3 p-3 bg-white/40 rounded-2xl border border-white/60">
                     <MapPin className="w-4 h-4 text-blue-600" />
                     <span className="text-xs font-bold text-blue-900">Native of {weddingData.groomNative}</span>
                   </div>
                 )}
               </div>
             </div>
           </GlassCard>

           {/* Bride Profile */}
           <GlassCard className="p-8 space-y-6 flex flex-col items-center text-center">
             <div className="w-40 h-40 rounded-full border-4 border-white shadow-xl overflow-hidden group">
               <img 
                 src={weddingData.brideImage || 'https://picsum.photos/seed/bride/400/400'} 
                 alt={weddingData.brideName} 
                 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                 referrerPolicy="no-referrer"
               />
             </div>
             <div className="space-y-4 w-full">
               <div className="space-y-1">
                 <h3 className="text-2xl font-black text-blue-950 uppercase tracking-tighter playfair">{weddingData.brideName}</h3>
                 <p className="text-[10px] text-pink-400 font-bold uppercase tracking-[0.2em]">The Bride</p>
               </div>
               <div className="grid grid-cols-1 gap-2 text-left">
                 {weddingData.brideJob && (
                   <div className="flex items-center gap-3 p-3 bg-white/40 rounded-2xl border border-white/60">
                     <Briefcase className="w-4 h-4 text-pink-600" />
                     <span className="text-xs font-bold text-blue-900">{weddingData.brideJob}</span>
                   </div>
                 )}
                 {weddingData.brideLiving && (
                   <div className="flex items-center gap-3 p-3 bg-white/40 rounded-2xl border border-white/60">
                     <HomeIcon className="w-4 h-4 text-pink-600" />
                     <span className="text-xs font-bold text-blue-900">Living in {weddingData.brideLiving}</span>
                   </div>
                 )}
                 {weddingData.brideNative && (
                   <div className="flex items-center gap-3 p-3 bg-white/40 rounded-2xl border border-white/60">
                     <MapPin className="w-4 h-4 text-pink-600" />
                     <span className="text-xs font-bold text-blue-900">Native of {weddingData.brideNative}</span>
                   </div>
                 )}
               </div>
             </div>
           </GlassCard>
        </div>
      </div>

      <div className="space-y-6">
        <div className="text-left space-y-3 px-2">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
            <Users className="w-3 h-3" /> Family Lineage
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Groom's Family List */}
           <GlassCard className="p-8 space-y-6">
              <h4 className="text-sm font-black text-blue-950 uppercase tracking-widest border-b border-blue-100 pb-4">Groom's Side</h4>
              <div className="space-y-4">
                {weddingData.familyDetails.groomFamily.map((member: any) => (
                  <div key={member.id} className="flex justify-between items-center group">
                    <span className="text-sm font-bold text-blue-950 group-hover:translate-x-1 transition-transform">{member.name}</span>
                    <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest bg-blue-50 px-3 py-1 rounded-full">{member.relation}</span>
                  </div>
                ))}
              </div>
           </GlassCard>

           {/* Bride's Family List */}
           <GlassCard className="p-8 space-y-6">
              <h4 className="text-sm font-black text-blue-950 uppercase tracking-widest border-b border-blue-100 pb-4">Bride's Side</h4>
              <div className="space-y-4">
                {weddingData.familyDetails.brideFamily.map((member: any) => (
                  <div key={member.id} className="flex justify-between items-center group">
                    <span className="text-sm font-bold text-blue-950 group-hover:translate-x-1 transition-transform">{member.name}</span>
                    <span className="text-[10px] font-black uppercase text-pink-400 tracking-widest bg-pink-50 px-3 py-1 rounded-full">{member.relation}</span>
                  </div>
                ))}
              </div>
           </GlassCard>
        </div>
      </div>

      <div className="space-y-12">
        <GlassCard className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-blue-950 uppercase tracking-tight">The Ceremony</h3>
              <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">Main Event</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-4 p-4 bg-white/40 rounded-2xl border border-white/60">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-bold text-blue-950">
                {new Date(weddingData.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/40 rounded-2xl border border-white/60">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-bold text-blue-950">
                {new Date(weddingData.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </span>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/40 rounded-2xl border border-white/60">
              <MapPin className="w-5 h-5 text-blue-400" />
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-blue-950 truncate">{weddingData.venueName}</p>
                <p className="text-[10px] text-blue-600/60 font-medium truncate">{weddingData.venueAddress}</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-2 gap-6">
          <GlassCard className="p-6 space-y-4">
            <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-pink-500" />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-blue-950 uppercase tracking-tight text-sm">Dress Code</h4>
              <p className="text-xs text-blue-600/60 font-medium leading-relaxed">Formal / Traditional Ethnic Wear</p>
            </div>
          </GlassCard>

          <GlassCard className="p-6 space-y-4">
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-blue-950 uppercase tracking-tight text-sm">Gifts</h4>
              <p className="text-xs text-blue-600/60 font-medium leading-relaxed">Your presence is our greatest gift!</p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default WeddingInfo;
