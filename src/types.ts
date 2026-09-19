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
  saliencyLevel?: 'High saliency' | 'Moderate saliency' | 'Low saliency';
  morphologicalFeature?: string;
  reason?: string;
}

export interface ScreeningRecord {
  id: string;
  sampleId: string;
  caseId?: string; // e.g. CVX-2026-0001
  doctorId?: string; // Links case to doctor account
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
  confidence: number; // 0.0 - 1.0 (Raw confidence)
  calibratedConfidence: number; // 0.0 - 1.0 after temperature scaling
  temperatureFactor?: number;
  temperatureScaleFactor?: number; // e.g. 1.35
  uncertaintyScore: number; // entropy 0.0 - 1.0
  uncertaintyThreshold?: number; // default 0.200
  referralStatusLabel?: 'Review Recommended' | 'Model Prediction Stable';
  referralStatusExplanation?: string;
  referToDoctor: boolean;
  referralReason: string;
  urgencyLevel: 'Routine' | 'Moderate' | 'Urgent' | 'Critical';
  status: 'Reviewed & Signed' | 'Pending Cytopathologist Review' | 'Flagged for Colposcopy' | 'Archived';
  cytopathologistSigned: boolean;
  signedBy?: string;
  signedAt?: string;
  doctorNotes?: string;
  clinicalNotes?: string;
  specimenInfo?: string;
  clinicalSummary: string;
  cellularMorphology: CellularMorphology;
  attentionFocalPoints: AttentionFocalPoint[];
  supportedMorphologicalFindings?: string[];
  explainabilitySummary?: string;
  recommendation: string;
  cellImageUrl?: string; // Original uploaded cytology image
  heatmapImageUrl?: string; // Generated Grad-CAM++ attribution map (PNG)
  gradCamComparisonUrl?: string; // Standard Grad-CAM map (PNG)
  blendedHeatmapUrl?: string; // Original + Grad-CAM++ composite
  heatmapOverlaySvg?: string;
}

export interface DoctorUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  regNumber: string;
  phone?: string;
  hospital: string;
  specialization: string;
  role?: string;
  createdAt?: string;
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
