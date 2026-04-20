
export type Language = 'English' | 'Hindi' | 'Tamil' | 'Telugu' | 'Kannada' | 'Malayalam';

export type ThemePreset = 'ethereal-blue' | 'royal-gold' | 'rose-quartz' | 'midnight-emerald';
export type EntranceStyle = 'seal' | 'mist' | 'stars' | 'curtains' | 'bloom';
export type HeroAnimation = 'zoom' | 'float' | 'none' | 'ken-burns' | 'shimmer';

export interface WeddingTheme {
  preset: ThemePreset;
  entranceStyle: EntranceStyle;
  heroAnimation: HeroAnimation;
  glassBlur: number;
  primaryColor: string;
  accentColor: string;
}

export interface GalleryImage {
  url: string;
  isFeatured: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
}

export interface WeddingData {
  groomName: string;
  brideName: string;
  groomJob?: string;
  groomNative?: string;
  groomLiving?: string;
  brideJob?: string;
  brideNative?: string;
  brideLiving?: string;
  date: string; // ISO string
  venueName: string;
  venueAddress: string;
  venueMapUrl: string;
  story: string;
  timeline: TimelineEvent[];
  heroImage: string; // Base64
  homeBackgroundImage?: string; // Base64
  groomImage: string; // Base64
  brideImage: string; // Base64
  gallery: GalleryImage[]; 
  logo?: string; // Base64
  familyDetails: {
    groomFamily: FamilyMember[];
    brideFamily: FamilyMember[];
  };
  theme: WeddingTheme;
  invitationControllerNumber?: string;
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  image?: string;
}

export interface UserSession {
  name: string;
  phone: string;
  language: Language;
  isAuthenticated: boolean;
  isAdmin: boolean;
}
