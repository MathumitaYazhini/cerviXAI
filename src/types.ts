export type BethesdaClass =
  | 'NILM'
  | 'ASC-US'
  | 'ASC-H'
  | 'LSIL'
  | 'HSIL'
  | 'SCC';

export interface CellularMorphology {
  nuclearEnlargement: string;
  chromatinPattern: string;
  nuclearMembrane: string;
  ncRatio: string;
  cytoplasm: string;
}

export interface AttentionFocalPoint {
  label: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  radius?: number; // percentage 0-100
  weight: number; // 0.0 - 1.0
  finding: string;
}

export interface ScreeningRecord {
  id: string;
  sampleId: string;
  patientName: string;
  age: number;
  district: string;
  state: string;
  abhaId: string;
  screeningDate: string;
  subsidizedFeeInr: number;
  normalFeeInr?: number;
  isAyushmanCovered: boolean;
  hpvStatus?: 'HPV-16 Positive' | 'HPV-18 Positive' | 'High-Risk Non-16/18' | 'HPV Negative' | 'Awaiting PCR';
  predictedClass: BethesdaClass;
  classFullName: string;
  confidence: number; // 0.0 - 1.0
  calibratedConfidence: number; // 0.0 - 1.0 after temperature scaling
  temperatureFactor?: number;
  temperatureScaleFactor?: number; // e.g. 1.35
  uncertaintyScore: number; // entropy 0.0 - 1.0
  referToDoctor: boolean;
  referralReason: string;
  urgencyLevel: 'Routine' | 'Moderate' | 'Urgent' | 'Critical';
  status: 'Reviewed & Signed' | 'Pending Cytopathologist Review' | 'Flagged for Colposcopy' | 'Archived';
  cytopathologistSigned: boolean;
  signedBy?: string;
  signedAt?: string;
  doctorNotes?: string;
  clinicalSummary: string;
  cellularMorphology: CellularMorphology;
  attentionFocalPoints: AttentionFocalPoint[];
  recommendation: string;
  cellImageUrl?: string;
  heatmapOverlaySvg?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  date?: string;
  publishedDate?: string;
  source: string;
  url: string;
  category: string;
  summary: string;
  impact?: string;
}

export type ResearchArticle = NewsArticle;

export interface ChatMessage {
  id: string;
  sender?: 'user' | 'assistant';
  role?: 'user' | 'assistant';
  timestamp: string;
  text?: string;
  content?: string;
  sources?: string[];
}

export type ActiveScreen =
  | 'login'
  | 'dashboard'
  | 'upload'
  | 'processing'
  | 'prediction'
  | 'uncertainty'
  | 'report'
  | 'history'
  | 'news';
