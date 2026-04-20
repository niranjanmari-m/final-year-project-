
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, X, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';
import { decode, decodeAudioData, createBlob } from '../utils/audio';
import { WeddingData, Language } from '../types';

interface AgentUIProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  weddingData: WeddingData;
}

const AgentUI: React.FC<AgentUIProps> = ({ isOpen, onClose, language, weddingData }) => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [pulse, setPulse] = useState(1);
  const [history, setHistory] = useState<{ text: string; role: 'user' | 'model' }[]>([]);
  const [isMuted, setIsMuted] = useState(false);

  const sessionRef = useRef<any>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const historyEndRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isMutedRef = useRef(isMuted);
  const isModelSpeakingRef = useRef(isModelSpeaking);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    isModelSpeakingRef.current = isModelSpeaking;
  }, [isModelSpeaking]);

  const displayDateLong = (() => {
    const d = new Date(weddingData.date);
    if (isNaN(d.getTime())) return "TBD";
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  })();

  // Enhanced Knowledge Base for the AI
  const groomDetails = `${weddingData.groomName}: A ${weddingData.groomJob || 'Professional'}, originally from ${weddingData.groomNative || 'N/A'}, currently living in ${weddingData.groomLiving || 'N/A'}.`;
  const brideDetails = `${weddingData.brideName}: An ${weddingData.brideJob || 'Professional'}, originally from ${weddingData.brideNative || 'N/A'}, currently living in ${weddingData.brideLiving || 'N/A'}.`;
  
  const groomFamily = weddingData.familyDetails.groomFamily.map(m => `${m.name} (${m.relation})`).join(', ');
  const brideFamily = weddingData.familyDetails.brideFamily.map(m => `${m.name} (${m.relation})`).join(', ');
  
  const schedule = weddingData.timeline.map(e => `- ${e.time}: ${e.title} (${e.description})`).join('\n');

  const systemInstruction = `You are the Ethereal Wedding Concierge for ${weddingData.groomName} and ${weddingData.brideName}.
Your primary goal is to assist guests with information about the wedding with a warm, celebratory, and helpful tone.

KNOWLEDGE BASE:
- Couple:
  * ${groomDetails}
  * ${brideDetails}
- Our Story: ${weddingData.story}
- Event Logistics:
  * Date: ${displayDateLong}
  * Venue: ${weddingData.venueName}
  * Address: ${weddingData.venueAddress}
- Family Members:
  * Groom's Family: ${groomFamily}
  * Bride's Family: ${brideFamily}
- Detailed Schedule:
${schedule}

CRITICAL GUIDELINES:
1. Language: Detect the user's language from their audio input and respond in the EXACT SAME language. If the user speaks Tamil, you speak Tamil. If the user speaks Hindi, you speak Hindi. If they speak English, you speak English. NEVER respond in a different language than the user's current input.
2. NO THINKING TEXT: Do NOT output your internal reasoning, metadata, or "thinking" process. Output ONLY the final response meant for the user.
3. Tone: Elegant, hospitable, and joyous.
4. Capabilities: Answer questions about the couple's background, family members, the schedule for today, and directions to the venue.
5. Privacy: Be helpful but keep the conversation focused on the wedding festivities.
6. Voice Output: Your response will be read aloud in the user's language, so keep it conversational and natural.
7. Real-time Awareness: Always reference the latest family details and couple background provided. When asked about family, list them warmly. if asked about the couple, you can mention their professions and hometowns as updated in the info tab.`;

  const stopAudio = useCallback(() => {
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setIsModelSpeaking(false);
  }, []);

  const cleanup = useCallback(() => {
    sessionRef.current?.close();
    sessionRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    
    if (inputCtxRef.current && inputCtxRef.current.state !== 'closed') {
      inputCtxRef.current.close().catch(() => {});
    }
    inputCtxRef.current = null;

    if (outputCtxRef.current && outputCtxRef.current.state !== 'closed') {
      outputCtxRef.current.close().catch(() => {});
    }
    outputCtxRef.current = null;

    stopAudio();
    setStatus('idle');
  }, [stopAudio]);

  useEffect(() => {
    if (historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  const startConnection = async () => {
    // Try both Vite standard and the custom define from vite.config.ts
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (window as any).process?.env?.GEMINI_API_KEY || (window as any).process?.env?.API_KEY;
    
    console.log("AgentUI: Starting connection...", { hasApiKey: !!apiKey });

    if (!apiKey) {
      setStatus('error');
      setErrorMessage("API Key is missing. Please ensure VITE_GEMINI_API_KEY is set in your .env file.");
      return;
    }

    if (status !== 'idle' && status !== 'error') return;
    
    setStatus('connecting');
    setErrorMessage(null);

    try {
      console.log("AgentUI: Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      console.log("AgentUI: Microphone access granted.");

      const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      await inCtx.resume();
      await outCtx.resume();
      inputCtxRef.current = inCtx;
      outputCtxRef.current = outCtx;

      const ai = new GoogleGenAI({ apiKey });
      
      console.log("AgentUI: Connecting to Live API with model: gemini-2.5-flash-native-audio-preview-12-2025");
      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        callbacks: {
          onopen: () => {
            console.log("AgentUI: Live API Connection Opened.");
            setStatus('active');
            const source = inCtx.createMediaStreamSource(stream);
            const processor = inCtx.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              if (isMutedRef.current) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              
              if (sessionRef.current) {
                sessionRef.current.sendRealtimeInput({ media: pcmBlob });
              }

              if (!isModelSpeakingRef.current) {
                const vol = Math.sqrt(inputData.reduce((acc, v) => acc + v * v, 0) / inputData.length);
                setPulse(1 + vol * 3);
              }
            };

            source.connect(processor);
            processor.connect(inCtx.destination);
          },
          onmessage: async (msg: any) => {
            console.log("AgentUI: Message received", msg);
            if (msg.serverContent?.interrupted) {
              stopAudio();
              return;
            }

            const base64 = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            const textPart = msg.serverContent?.modelTurn?.parts?.find((p: any) => p.text)?.text;
            
            if (textPart) {
              // Filter out "thinking" text if it starts with ** or contains "Retrieving"
              // This is a safety measure in case the system instruction is ignored
              const isThinking = textPart.includes('**') || 
                                textPart.toLowerCase().includes('retrieving') || 
                                textPart.toLowerCase().includes('thinking') ||
                                (textPart.length > 50 && textPart.includes('I have successfully identified'));

              if (!isThinking) {
                setHistory(prev => {
                  const last = prev[prev.length - 1];
                  if (last?.role === 'model') return [...prev.slice(0, -1), { ...last, text: last.text + textPart }];
                  return [...prev, { text: textPart, role: 'model' }];
                });
              }
            }

            if (base64) {
              setIsModelSpeaking(true);
              try {
                const buffer = await decodeAudioData(decode(base64), outCtx, 24000, 1);
                const source = outCtx.createBufferSource();
                source.buffer = buffer;
                source.connect(outCtx.destination);
                
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
                
                sourcesRef.current.add(source);
                source.onended = () => {
                  sourcesRef.current.delete(source);
                  if (sourcesRef.current.size === 0) setIsModelSpeaking(false);
                };
              } catch (e) {
                console.error("AgentUI: Audio Decode Error:", e);
              }
            }

            if (msg.serverContent?.outputAudioTranscription) {
              const text = msg.serverContent.outputAudioTranscription.text;
              const isThinking = text.includes('**') || 
                                text.toLowerCase().includes('retrieving') || 
                                text.toLowerCase().includes('thinking') ||
                                (text.length > 50 && text.includes('I have successfully identified'));

              if (!isThinking) {
                setHistory(prev => {
                  const last = prev[prev.length - 1];
                  if (last?.role === 'model') return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                  return [...prev, { text, role: 'model' }];
                });
              }
            } else if (msg.serverContent?.inputAudioTranscription) {
              const text = msg.serverContent.inputAudioTranscription.text;
              setHistory(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'user') return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                return [...prev, { text, role: 'user' }];
              });
            }
          },
          onerror: (e) => { 
            console.error("AgentUI: Live API Error Details:", e); 
            setStatus('error');
            setErrorMessage(`Connection error: ${e?.message || 'Unknown error'}. Check console for details.`);
          },
          onclose: (event) => {
            console.log("AgentUI: Live API Connection Closed.", event);
            if (event && !event.wasClean) {
              console.warn("AgentUI: Connection closed unexpectedly:", event.reason, event.code);
            }
            cleanup();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          outputAudioTranscription: {},
          inputAudioTranscription: {}
        }
      });

      sessionRef.current = await sessionPromise;
      console.log("AgentUI: Session object acquired.");
    } catch (err: any) {
      console.error("AgentUI: Connection Init Error:", err);
      setStatus('error');
      setErrorMessage(err.message || "Failed to start the consultation.");
    }
  };

  const toggleSession = () => {
    if (status === 'active') cleanup();
    else startConnection();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-0 bg-blue-950/20 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white/30 backdrop-blur-2xl rounded-t-[4rem] p-8 flex flex-col items-center gap-6 shadow-2xl h-[94vh] animate-slide-up relative border-x border-t border-white/50">
        <div className="w-12 h-1 bg-blue-900/10 rounded-full shrink-0 mb-2"></div>
        <button onClick={() => { cleanup(); onClose(); }} className="absolute top-8 right-8 p-3 text-blue-900/40 bg-white/20 rounded-full active:scale-90 transition-all border border-white/40">
          <X className="w-6 h-6" />
        </button>

        <div className="text-center space-y-2 mt-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 border border-white/40 rounded-full shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[10px] font-black uppercase text-blue-800 tracking-widest">Ethereal Brain</span>
          </div>
          <h3 className="text-3xl font-black text-blue-950 uppercase tracking-tighter playfair">Concierge</h3>
        </div>

        {status === 'error' && (
          <div className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-pulse">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-[10px] font-bold text-red-700 uppercase tracking-tight leading-tight flex-1">{errorMessage}</p>
          </div>
        )}

        <div className="relative flex items-center justify-center py-8 w-full">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[...Array(status === 'active' ? 3 : 0)].map((_, i) => (
              <div 
                key={i}
                style={{ 
                  transform: `scale(${pulse * (1 + i * 0.4)})`,
                  opacity: (isModelSpeaking ? 0.25 : 0.1) / (i + 1),
                  transition: 'transform 0.1s ease-out',
                }}
                className="absolute w-40 h-40 border-2 rounded-full border-blue-600/30 shadow-lg"
              />
            ))}
          </div>
          
          <div className={`w-36 h-36 rounded-full flex items-center justify-center shadow-xl z-10 transition-all duration-700 backdrop-blur-3xl border border-white/60 ${
            status === 'active' 
            ? isModelSpeaking ? 'bg-slate-600/20 scale-105' : 'bg-zinc-500/10 scale-100'
            : 'bg-white/10'
          }`}>
            {status === 'connecting' ? (
              <Loader2 className="w-10 h-10 text-blue-600/60 animate-spin" />
            ) : status === 'active' ? (
              <div className="flex gap-1.5 items-center">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-1.5 bg-blue-600/60 rounded-full animate-wave" style={{ 
                    height: `${isModelSpeaking ? 20 + Math.random() * 40 : 10 + Math.random() * 20}px`,
                    animationDelay: `${i * 0.1}s`
                  }} />
                ))}
              </div>
            ) : (
              <Mic className="w-10 h-10 text-blue-950/20" />
            )}
          </div>
        </div>

        <div className="flex-1 w-full overflow-y-auto px-4 space-y-6 no-scrollbar border-y border-white/10 py-8 scroll-smooth mask-fade-edges">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-4">
              <p className="text-[10px] font-black uppercase text-blue-900 tracking-widest leading-loose px-10">
                I am here to guide you through the wedding of {weddingData.groomName} & {weddingData.brideName}
              </p>
            </div>
          ) : (
            history.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-900/40 mb-2 px-4">
                  {msg.role === 'user' ? 'You' : 'Concierge'}
                </span>
                <div className={`max-w-[85%] px-6 py-4 rounded-[2.5rem] text-sm font-medium shadow-sm backdrop-blur-xl border transition-all duration-500 ${
                  msg.role === 'user' 
                  ? 'bg-slate-600/30 text-slate-950 rounded-br-none border-white/40' 
                  : 'bg-white/40 text-slate-950 rounded-bl-none border-white/60'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))
          )}
          <div ref={historyEndRef} />
        </div>

        <div className="w-full flex items-center justify-center pt-4 pb-10">
          <button 
            onClick={toggleSession} 
            disabled={status === 'connecting'} 
            className={`w-20 h-20 rounded-full shadow-2xl active:scale-90 transition-all flex items-center justify-center backdrop-blur-xl border border-white/40 ${
              status === 'active' 
              ? 'bg-slate-900 text-white' 
              : 'bg-white/40 text-slate-950'
            }`}
          >
            {status === 'connecting' ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : status === 'active' ? (
              <MicOff className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes wave { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.5); } }
        .animate-wave { animation: wave 0.8s ease-in-out infinite; }
        .mask-fade-edges { mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent); }
      `}</style>
    </div>
  );
};

export default AgentUI;
