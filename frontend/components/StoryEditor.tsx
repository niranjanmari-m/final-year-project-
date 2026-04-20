
import React, { useState } from 'react';
import { Sparkles, Loader2, Send, Heart, Quote } from 'lucide-react';
import { generateLoveStory } from '../src/services/aiService';
import GlassCard from './GlassCard';

interface StoryEditorProps {
  currentStory: string;
  onSave: (newStory: string) => void;
  primaryColor: string;
  isAdmin?: boolean;
}

const StoryEditor: React.FC<StoryEditorProps> = ({ currentStory, onSave, primaryColor, isAdmin = false }) => {
  const [input, setInput] = useState(currentStory || '');
  const [story, setStory] = useState(currentStory || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!isAdmin || !input.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const generatedStory = await generateLoveStory(input);
      setStory(generatedStory);
      onSave(generatedStory);
    } catch (err) {
      console.error('Error generating story:', err);
      setError('Failed to generate story. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isAdmin && !story) {
    return (
      <div className="space-y-10 animate-fade-in pb-20">
        <div className="text-left space-y-3 px-2">
          <h2 className="text-4xl font-black uppercase tracking-tighter" style={{ color: primaryColor }}>Our Story</h2>
          <p className="text-blue-800/60 font-medium text-sm italic">Our love story is being written. Check back soon!</p>
        </div>
        <GlassCard className="p-10 flex flex-col items-center justify-center space-y-4">
          <Heart className="w-12 h-12 text-blue-100" />
          <p className="text-blue-300 font-bold uppercase tracking-widest text-[10px]">Coming Soon</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="text-left space-y-3 px-2">
        <h2 className="text-4xl font-black uppercase tracking-tighter" style={{ color: primaryColor }}>Our Story</h2>
        <p className="text-blue-800/60 font-medium text-sm">How we met and our journey so far.</p>
      </div>

      {!story && isAdmin ? (
        <GlassCard className="p-8 space-y-6">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Share some memories</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., Met in college, first date at a coffee shop, proposed during a sunset hike..."
              className="w-full h-40 p-6 bg-white/50 border border-white/60 rounded-3xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-blue-950 font-medium"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !input.trim()}
            className="w-full py-5 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            style={{ background: primaryColor }}
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Generate Magic Story
          </button>
          {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}
        </GlassCard>
      ) : (
        <div className="space-y-8">
          <GlassCard className="p-10 relative overflow-hidden group">
            <div className="absolute top-0 left-0 p-6 opacity-10">
              <Quote className="w-20 h-20 text-blue-950" />
            </div>
            
            <div className="relative space-y-8">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                  <Heart className="w-8 h-8 text-blue-600 animate-pulse" />
                </div>
              </div>
              
              <p className="text-blue-950 font-medium leading-relaxed text-lg text-center italic playfair">
                {story}
              </p>
              
              <div className="flex justify-center">
                <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
              </div>
            </div>
          </GlassCard>

          {isAdmin && (
            <button
              onClick={() => setStory('')}
              className="w-full py-4 bg-white border border-blue-100 text-blue-800 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all"
            >
              Rewrite Story
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default StoryEditor;
