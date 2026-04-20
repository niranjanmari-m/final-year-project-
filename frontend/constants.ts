
import { WeddingData, Language, ThemePreset } from './types';

export const LANGUAGES: Language[] = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'];

export const THEME_CONFIGS: Record<ThemePreset, { primary: string; accent: string; bg: string }> = {
  'ethereal-blue': { primary: '#4f46e5', accent: '#0ea5e9', bg: 'linear-gradient(135deg, #f0f7ff 0%, #e0f2fe 100%)' },
  'royal-gold': { primary: '#b8860b', accent: '#d4af37', bg: 'linear-gradient(135deg, #4e83b5 0%, #6ba3d6 100%)' },
  'rose-quartz': { primary: '#9d174d', accent: '#f472b6', bg: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)' },
  'midnight-emerald': { primary: '#064e3b', accent: '#10b981', bg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' }
};

export const DEFAULT_WEDDING_DATA: WeddingData = {
  groomName: "Arjun",
  brideName: "Meera",
  groomJob: "Senior Software Engineer",
  groomNative: "Mysuru",
  groomLiving: "Bengaluru",
  brideJob: "Architectural Designer",
  brideNative: "Mangaluru",
  brideLiving: "Bengaluru",
  date: "2026-12-25T10:00:00Z",
  venueName: "The Grand Orchid Palace",
  venueAddress: "Palm Grove Rd, Bengaluru, Karnataka 560042",
  venueMapUrl: "",
  story: "From classmates to life partners, our journey has been filled with laughter, shared dreams, and endless love. We invite you to witness our special day.",
  timeline: [
    { id: '0', time: 'Dec 20, 08:00 PM', title: 'Bachelor Party', description: 'A night to remember with friends.', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600' },
    { id: 'haldi', time: 'Dec 23, 10:00 AM', title: 'Haldi Ceremony', description: 'The golden touch of tradition.', image: 'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&q=80&w=600' },
    { id: 'mehendi', time: 'Dec 23, 04:00 PM', title: 'Mehendi Ceremony', description: 'Intricate designs for a beautiful bride.', image: 'https://images.unsplash.com/photo-1590424753858-3bc67b75f0f2?auto=format&fit=crop&q=80&w=600' },
    { id: 'sangeet', time: 'Dec 24, 07:00 PM', title: 'Sangeet Night', description: 'Dance, music, and endless celebrations.', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=600' },
    { id: '1', time: 'Dec 25, 10:00 AM', title: 'Wedding Ceremony', description: 'The Muhurtham at the main hall.', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600' },
    { id: '2', time: 'Dec 25, 12:30 PM', title: 'Traditional Lunch', description: 'Grand feast with local delicacies.' },
    { id: '3', time: 'Dec 25, 06:00 PM', title: 'Reception', description: 'Celebrations with music and dance.' }
  ],
  heroImage: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800",
  homeBackgroundImage: "",
  groomImage: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=600",
  brideImage: "https://images.unsplash.com/photo-1621090400843-05f422b40656?auto=format&fit=crop&q=80&w=600",
  gallery: [
    { url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600", isFeatured: true },
    { url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=600", isFeatured: false },
    { url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=600", isFeatured: true },
    { url: "https://images.unsplash.com/photo-1465495910483-0d67497b831a?auto=format&fit=crop&q=80&w=600", isFeatured: false }
  ],
  logo: null as any,
  familyDetails: {
    groomFamily: [
      { id: '1', name: 'Mr. Ramesh Rao', relation: 'Father' },
      { id: '2', name: 'Mrs. Sumitra Rao', relation: 'Mother' },
      { id: '3', name: 'Karthik Rao', relation: 'Brother' }
    ],
    brideFamily: [
      { id: '1', name: 'Mr. Vijay Hegde', relation: 'Father' },
      { id: '2', name: 'Mrs. Anita Hegde', relation: 'Mother' },
      { id: '3', name: 'Sanjana Hegde', relation: 'Sister' }
    ]
  },
  theme: {
    preset: 'royal-gold',
    entranceStyle: 'seal',
    heroAnimation: 'zoom',
    glassBlur: 16,
    primaryColor: '#b8860b',
    accentColor: '#d4af37'
  },
  invitationControllerNumber: ""
};

export const ADMIN_PHONE = "9965693088";
