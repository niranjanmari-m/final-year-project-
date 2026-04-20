
import React, { useRef } from 'react';
import { X, Palette, Type, Layout, Check, Camera, Image as ImageIcon, MapPin, Calendar, Briefcase, Home as HomeIcon, Map, Heart, Users } from 'lucide-react';
import { THEME_CONFIGS } from '../constants';
import { ThemePreset, WeddingData } from '../types';
import GlassCard from './GlassCard';

interface CustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WeddingData;
  onSave: (newData: WeddingData) => void;
}

const ImageUpload: React.FC<{
  label: string;
  value: string | undefined;
  onChange: (base64: string) => void;
}> = ({ label, value, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image is too large. Please select an image smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-[9px] font-bold text-blue-950/60 uppercase ml-2">{label}</label>
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="w-full h-32 rounded-3xl border-2 border-dashed border-blue-100 bg-white/40 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50/50 transition-all group relative overflow-hidden"
      >
        {value ? (
          <>
            <img src={value} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-blue-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </>
        ) : (
          <>
            <ImageIcon className="w-8 h-8 text-blue-200 group-hover:text-blue-400 transition-colors" />
            <span className="text-[10px] text-blue-300 font-bold uppercase tracking-widest mt-2">Upload Image</span>
          </>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
      </div>
    </div>
  );
};

const CustomizeModal: React.FC<CustomizeModalProps> = ({ isOpen, onClose, data: weddingData, onSave: setWeddingData }) => {
  if (!isOpen) return null;

  const handleThemeSelect = (preset: string) => {
    const config = THEME_CONFIGS[preset as ThemePreset];
    setWeddingData({
      ...weddingData,
      theme: {
        ...weddingData.theme,
        preset: preset as ThemePreset,
        primaryColor: config.primary,
        accentColor: config.accent
      }
    });
  };

  const updateField = (field: string, value: any) => {
    setWeddingData({ ...weddingData, [field]: value });
  };

  const updateThemeField = (field: string, value: any) => {
    setWeddingData({
      ...weddingData,
      theme: { ...weddingData.theme, [field]: value }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
      <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-md" onClick={onClose} />
      
      <GlassCard className="w-full max-w-lg p-8 space-y-8 relative animate-scale-in max-h-[85vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10 -mx-8 -mt-8 p-6 border-b border-blue-50">
          <div className="flex items-center gap-3">
            <Palette className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-black text-blue-950 uppercase tracking-tighter">Admin Panel</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-blue-50 rounded-full transition-colors">
            <X className="w-6 h-6 text-blue-950" />
          </button>
        </div>

        <div className="space-y-12">
          {/* Section: Theme */}
          <div className="space-y-6">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
              <Palette className="w-3 h-3" /> Visual Identity
            </p>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(THEME_CONFIGS).map(([id, config]) => (
                <button
                  key={id}
                  onClick={() => handleThemeSelect(id)}
                  className={`p-4 rounded-3xl border-2 transition-all text-left space-y-2 ${
                    weddingData.theme.preset === id 
                      ? 'border-blue-600 bg-blue-50 shadow-lg scale-[1.02]' 
                      : 'border-white/60 bg-white/40 hover:border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-blue-950 uppercase tracking-tight">{id.replace('-', ' ')}</span>
                    {weddingData.theme.preset === id && <Check className="w-3 h-3 text-blue-600" />}
                  </div>
                  <div className="flex gap-1">
                    <div className="w-4 h-4 rounded-full" style={{ background: config.primary }} />
                    <div className="w-4 h-4 rounded-full" style={{ background: config.accent }} />
                  </div>
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[9px] font-bold text-blue-950/60 uppercase ml-2">Glass Blur ({weddingData.theme.glassBlur}px)</label>
                  <input 
                    type="range" min="0" max="40" 
                    value={weddingData.theme.glassBlur} 
                    onChange={(e) => updateThemeField('glassBlur', parseInt(e.target.value))}
                    className="w-full accent-blue-600 shadow-sm"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] font-bold text-blue-950/60 uppercase ml-2">Theme Tone</label>
                  <div className="flex gap-2">
                    <input 
                      type="color" 
                      value={weddingData.theme.primaryColor} 
                      onChange={(e) => updateThemeField('primaryColor', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 overflow-hidden"
                    />
                    <input 
                      type="color" 
                      value={weddingData.theme.accentColor} 
                      onChange={(e) => updateThemeField('accentColor', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 overflow-hidden"
                    />
                  </div>
               </div>
            </div>
          </div>

          {/* Section: Brand */}
          <div className="space-y-6">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
              <ImageIcon className="w-3 h-3" /> Branding
            </p>
            <ImageUpload label="Wedding Logo" value={weddingData.logo} onChange={(b64) => updateField('logo', b64)} />
          </div>

          {/* Section: Groom */}
          <div className="space-y-6">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">The Groom</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUpload label="Groom's Portrait" value={weddingData.groomImage} onChange={(b64) => updateField('groomImage', b64)} />
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-blue-950/60 uppercase ml-2 flex items-center gap-1"><Type className="w-2.5 h-2.5" /> Full Name</label>
                  <input type="text" value={weddingData.groomName} onChange={(e) => updateField('groomName', e.target.value)} className="w-full p-4 bg-white/60 border border-white/60 rounded-2xl text-blue-950 font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-blue-950/60 uppercase ml-2 flex items-center gap-1"><Briefcase className="w-2.5 h-2.5" /> Occupation</label>
                  <input type="text" value={weddingData.groomJob} onChange={(e) => updateField('groomJob', e.target.value)} className="w-full p-4 bg-white/60 border border-white/60 rounded-2xl text-blue-950 font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-blue-950/60 uppercase ml-2 flex items-center gap-1"><HomeIcon className="w-2.5 h-2.5" /> Living In</label>
                  <input type="text" value={weddingData.groomLiving} onChange={(e) => updateField('groomLiving', e.target.value)} className="w-full p-4 bg-white/60 border border-white/60 rounded-2xl text-blue-950 font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-blue-950/60 uppercase ml-2 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> Native Town</label>
                  <input type="text" value={weddingData.groomNative} onChange={(e) => updateField('groomNative', e.target.value)} className="w-full p-4 bg-white/60 border border-white/60 rounded-2xl text-blue-950 font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Bride */}
          <div className="space-y-6">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">The Bride</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUpload label="Bride's Portrait" value={weddingData.brideImage} onChange={(b64) => updateField('brideImage', b64)} />
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-blue-950/60 uppercase ml-2 flex items-center gap-1"><Type className="w-2.5 h-2.5" /> Full Name</label>
                  <input type="text" value={weddingData.brideName} onChange={(e) => updateField('brideName', e.target.value)} className="w-full p-4 bg-white/60 border border-white/60 rounded-2xl text-blue-950 font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-blue-950/60 uppercase ml-2 flex items-center gap-1"><Briefcase className="w-2.5 h-2.5" /> Occupation</label>
                  <input type="text" value={weddingData.brideJob} onChange={(e) => updateField('brideJob', e.target.value)} className="w-full p-4 bg-white/60 border border-white/60 rounded-2xl text-blue-950 font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-blue-950/60 uppercase ml-2 flex items-center gap-1"><HomeIcon className="w-2.5 h-2.5" /> Living In</label>
                  <input type="text" value={weddingData.brideLiving} onChange={(e) => updateField('brideLiving', e.target.value)} className="w-full p-4 bg-white/60 border border-white/60 rounded-2xl text-blue-950 font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-blue-950/60 uppercase ml-2 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> Native Town</label>
                  <input type="text" value={weddingData.brideNative} onChange={(e) => updateField('brideNative', e.target.value)} className="w-full p-4 bg-white/60 border border-white/60 rounded-2xl text-blue-950 font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Event Details */}
          <div className="space-y-6">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Event Specifics</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-blue-950/60 uppercase ml-2 flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> Wedding Date & Time</label>
                <input
                  type="datetime-local"
                  value={weddingData.date.substring(0, 16)}
                  onChange={(e) => updateField('date', new Date(e.target.value).toISOString())}
                  className="w-full p-4 bg-white/60 border border-white/60 rounded-2xl text-blue-950 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-blue-950/60 uppercase ml-2 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> Venue Name</label>
                <input
                  type="text"
                  value={weddingData.venueName}
                  onChange={(e) => updateField('venueName', e.target.value)}
                  className="w-full p-4 bg-white/60 border border-white/60 rounded-2xl text-blue-950 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-blue-950/60 uppercase ml-2 flex items-center gap-1"><Map className="w-2.5 h-2.5" /> Venue Address</label>
                <textarea
                  value={weddingData.venueAddress}
                  onChange={(e) => updateField('venueAddress', e.target.value)}
                  className="w-full p-4 bg-white/60 border border-white/60 rounded-2xl text-blue-950 font-bold focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24"
                />
              </div>
            </div>
          </div>

          {/* Section: Hero */}
          <div className="space-y-6">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Visual Atmosphere</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUpload label="Hero Background Image" value={weddingData.heroImage} onChange={(b64) => updateField('heroImage', b64)} />
              <ImageUpload label="Home Screen Background" value={weddingData.homeBackgroundImage} onChange={(b64) => updateField('homeBackgroundImage', b64)} />
            </div>
          </div>

          {/* Section: Story */}
          <div className="space-y-6">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
              <Heart className="w-3 h-3" /> Our Story
            </p>
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-blue-950/60 uppercase ml-2">Main Story Text</label>
              <textarea
                value={weddingData.story}
                onChange={(e) => updateField('story', e.target.value)}
                className="w-full p-4 bg-white/60 border border-white/60 rounded-2xl text-blue-950 font-bold focus:ring-2 focus:ring-blue-500 outline-none resize-none h-40"
              />
            </div>
          </div>

          {/* Section: Family */}
          <div className="space-y-6">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-3 h-3" /> Family Lineage
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Groom's Family */}
              <div className="space-y-4">
                <h4 className="text-[9px] font-bold text-blue-950/60 uppercase ml-2">Groom's Family</h4>
                <div className="space-y-3">
                  {weddingData.familyDetails.groomFamily.map((member, index) => (
                    <div key={member.id} className="flex gap-2 items-center bg-white/40 p-2 rounded-2xl border border-white/60">
                      <input 
                        type="text" value={member.name} placeholder="Name"
                        onChange={(e) => {
                          const newGroom = [...weddingData.familyDetails.groomFamily];
                          newGroom[index] = { ...member, name: e.target.value };
                          updateField('familyDetails', { ...weddingData.familyDetails, groomFamily: newGroom });
                        }}
                        className="flex-1 bg-transparent p-2 text-xs font-bold text-blue-950 outline-none"
                      />
                      <input 
                        type="text" value={member.relation} placeholder="Relation"
                        onChange={(e) => {
                          const newGroom = [...weddingData.familyDetails.groomFamily];
                          newGroom[index] = { ...member, relation: e.target.value };
                          updateField('familyDetails', { ...weddingData.familyDetails, groomFamily: newGroom });
                        }}
                        className="w-20 bg-transparent p-2 text-xs font-medium text-blue-600 outline-none"
                      />
                      <button 
                        onClick={() => {
                          const newGroom = weddingData.familyDetails.groomFamily.filter(m => m.id !== member.id);
                          updateField('familyDetails', { ...weddingData.familyDetails, groomFamily: newGroom });
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      const newGroom = [...weddingData.familyDetails.groomFamily, { id: Date.now().toString(), name: '', relation: '' }];
                      updateField('familyDetails', { ...weddingData.familyDetails, groomFamily: newGroom });
                    }}
                    className="w-full py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100"
                  >
                    + Add Groom Family
                  </button>
                </div>
              </div>

              {/* Bride's Family */}
              <div className="space-y-4">
                <h4 className="text-[9px] font-bold text-blue-950/60 uppercase ml-2">Bride's Family</h4>
                <div className="space-y-3">
                  {weddingData.familyDetails.brideFamily.map((member, index) => (
                    <div key={member.id} className="flex gap-2 items-center bg-white/40 p-2 rounded-2xl border border-white/60">
                      <input 
                        type="text" value={member.name} placeholder="Name"
                        onChange={(e) => {
                          const newBride = [...weddingData.familyDetails.brideFamily];
                          newBride[index] = { ...member, name: e.target.value };
                          updateField('familyDetails', { ...weddingData.familyDetails, brideFamily: newBride });
                        }}
                        className="flex-1 bg-transparent p-2 text-xs font-bold text-blue-950 outline-none"
                      />
                      <input 
                        type="text" value={member.relation} placeholder="Relation"
                        onChange={(e) => {
                          const newBride = [...weddingData.familyDetails.brideFamily];
                          newBride[index] = { ...member, relation: e.target.value };
                          updateField('familyDetails', { ...weddingData.familyDetails, brideFamily: newBride });
                        }}
                        className="w-20 bg-transparent p-2 text-xs font-medium text-blue-600 outline-none"
                      />
                      <button 
                        onClick={() => {
                          const newBride = weddingData.familyDetails.brideFamily.filter(m => m.id !== member.id);
                          updateField('familyDetails', { ...weddingData.familyDetails, brideFamily: newBride });
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      const newBride = [...weddingData.familyDetails.brideFamily, { id: Date.now().toString(), name: '', relation: '' }];
                      updateField('familyDetails', { ...weddingData.familyDetails, brideFamily: newBride });
                    }}
                    className="w-full py-2 bg-pink-50 text-pink-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-pink-100"
                  >
                    + Add Bride Family
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setWeddingData(weddingData);
              onClose();
            }}
            className="w-full py-5 bg-blue-950 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl active:scale-95 transition-all mt-8"
          >
            Update Invitation
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default CustomizeModal;
