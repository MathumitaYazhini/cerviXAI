import { DoctorUser, ScreeningRecord } from '../types';
import { INITIAL_SCREENING_RECORDS, generateCellSvg } from '../data/mockData';

const STORAGE_KEY_DOCTORS = 'cervixai_registered_doctors';
const STORAGE_KEY_ACTIVE_SESSION = 'cervixai_active_doctor_session';
const STORAGE_KEY_RECORDS = 'cervixai_doctor_records';

/**
 * Verified Demo Account credentials:
 * Email: demo.doctor@cervixai.com
 * Password: CerviXAI@123
 */
export const DEMO_DOCTOR: DoctorUser = {
  id: 'doc-demo',
  name: 'Dr. Vikramaditya Rao, MD',
  email: 'demo.doctor@cervixai.com',
  password: 'CerviXAI@123',
  regNumber: 'NMC-2018-04921',
  phone: '+91 98101 23456',
  hospital: 'National Cytopathology Centre & AIIMS',
  specialization: 'MD Cytopathology',
  role: 'Consultant Cytopathologist',
  createdAt: '2026-01-15',
};

/**
 * Doctor A Account:
 * Email: doctor.a@cervixai.com
 * Password: CerviXAI@123
 */
export const DOCTOR_A: DoctorUser = {
  id: 'doc-a',
  name: 'Dr. Ananya Sen, MD',
  email: 'doctor.a@cervixai.com',
  password: 'CerviXAI@123',
  regNumber: 'NMC-2019-10293',
  phone: '+91 98201 44556',
  hospital: 'AIIMS Cytopathology Division',
  specialization: 'MD Cytopathology',
  role: 'Consultant Cytopathologist',
  createdAt: '2026-02-01',
};

/**
 * Doctor B Account:
 * Email: doctor.b@cervixai.com
 * Password: CerviXAI@123
 */
export const DOCTOR_B: DoctorUser = {
  id: 'doc-b',
  name: 'Dr. Bhavna Patel, MD',
  email: 'doctor.b@cervixai.com',
  password: 'CerviXAI@123',
  regNumber: 'NMC-2020-83719',
  phone: '+91 98450 77889',
  hospital: 'Apollo Cytopathology Laboratory',
  specialization: 'Senior Consultant Pathologist',
  role: 'Consultant Cytopathologist',
  createdAt: '2026-02-15',
};

export const DEFAULT_DOCTORS: DoctorUser[] = [DEMO_DOCTOR, DOCTOR_A, DOCTOR_B];

/**
 * Normalizes any doctor identifier to its canonical doctor ID.
 */
export function normalizeDoctorId(identifier?: string | null): string {
  if (!identifier) return 'doc-demo';
  const clean = identifier.trim().toLowerCase();
  if (clean === 'doc-a' || clean.includes('doctor.a') || clean.includes('doctora') || clean.includes('ananya') || clean === 'nmc-2019-10293') {
    return 'doc-a';
  }
  if (clean === 'doc-b' || clean.includes('doctor.b') || clean.includes('doctorb') || clean.includes('bhavna') || clean === 'nmc-2020-83719') {
    return 'doc-b';
  }
  if (clean === 'doc-demo' || clean.includes('demo') || clean === 'nmc-2018-04921') {
    return 'doc-demo';
  }
  return identifier;
}

/**
 * Pre-seeded clinical cases for Doctor A (Dr. Ananya Sen)
 */
function createDoctorACases(): ScreeningRecord[] {
  return [
    {
      id: 'rec-a-001',
      caseId: 'CVX-A-2026-0001',
      doctorId: 'doc-a',
      sampleId: 'CX-2026-A101',
      patientName: 'Meera Sharma',
      age: 44,
      district: 'Varanasi',
      state: 'Uttar Pradesh',
      abhaId: '91-4829-1049-5820',
      isAyushmanCovered: true,
      subsidizedFeeInr: 150,
      screeningDate: '2026-09-15',
      cellImageUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(generateCellSvg('HSIL', false)),
      heatmapImageUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(generateCellSvg('HSIL', true)),
      blendedHeatmapUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(generateCellSvg('HSIL', true)),
      predictedClass: 'HSIL',
      classFullName: 'High-Grade Squamous Intraepithelial Lesion',
      confidence: 0.94,
      calibratedConfidence: 0.91,
      temperatureFactor: 1.35,
      uncertaintyScore: 0.11,
      referToDoctor: true,
      urgencyLevel: 'Urgent',
      referralReason: 'High-grade dysplastic cellular pattern detected with prominent nuclear hyperchromasia and high N:C ratio.',
      clinicalSummary: 'High-grade dysplastic cellular clusters exhibiting coarse chromatin and marked nuclear contour irregular clefting. Urgent colposcopy indicated.',
      cellularMorphology: {
        nuclearEnlargement: 'Marked (>3.5x normal intermediate nucleus)',
        chromatinPattern: 'Coarse chromatin clumping with parachromatin clearing',
        nuclearMembrane: 'Markedly irregular with deep clefts',
        ncRatio: 'Markedly elevated (>0.75)',
        cytoplasm: 'Cyanophilic rim with angular borders',
      },
      attentionFocalPoints: [
        { x: 50, y: 50, weight: 0.94, label: 'Primary Nuclear Focus', finding: 'Hyperchromatic atypical chromatin distribution' },
        { x: 42, y: 44, weight: 0.82, label: 'Nuclear Envelope', finding: 'Membrane contour irregularity and convolution' },
      ],
      recommendation: 'Urgent referral for colposcopy examination and punch biopsy within 7-14 days.',
      status: 'Pending Cytopathologist Review',
      cytopathologistSigned: false,
    },
    {
      id: 'rec-a-002',
      caseId: 'CVX-A-2026-0002',
      doctorId: 'doc-a',
      sampleId: 'CX-2026-A102',
      patientName: 'Pooja Verma',
      age: 38,
      district: 'Lucknow',
      state: 'Uttar Pradesh',
      abhaId: '91-3920-5819-2049',
      isAyushmanCovered: true,
      subsidizedFeeInr: 150,
      screeningDate: '2026-09-14',
      cellImageUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(generateCellSvg('NILM', false)),
      heatmapImageUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(generateCellSvg('NILM', true)),
      blendedHeatmapUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(generateCellSvg('NILM', true)),
      predictedClass: 'NILM',
      classFullName: 'Negative for Intraepithelial Lesion or Malignancy',
      confidence: 0.97,
      calibratedConfidence: 0.95,
      temperatureFactor: 1.35,
      uncertaintyScore: 0.04,
      referToDoctor: false,
      urgencyLevel: 'Routine',
      referralReason: 'Benign cellular changes with normal intermediate squamous cells. Autonomous clearance criteria satisfied.',
      clinicalSummary: 'Normal cytological profile consistent with standard intermediate squamous maturation. No dysplastic nuclear features identified.',
      cellularMorphology: {
        nuclearEnlargement: 'Normal (~8µm)',
        chromatinPattern: 'Finely granular and evenly dispersed',
        nuclearMembrane: 'Smooth, oval, uniform',
        ncRatio: 'Normal low N:C ratio (~1:10)',
        cytoplasm: 'Broad polygonal cyanophilic/eosinophilic cytoplasm',
      },
      attentionFocalPoints: [
        { x: 50, y: 50, weight: 0.35, label: 'Standard Nuclear Baseline', finding: 'Uniform vesicular chromatin without atypia' },
      ],
      recommendation: 'Routine repeat cervical screening in 3 years as per national guidelines.',
      status: 'Reviewed & Signed',
      cytopathologistSigned: true,
      signedBy: 'Dr. Ananya Sen, MD',
      signedAt: '2026-09-14T11:30:00.000Z',
    },
    {
      id: 'rec-a-003',
      caseId: 'CVX-A-2026-0003',
      doctorId: 'doc-a',
      sampleId: 'CX-2026-A103',
      patientName: 'Radha Devi',
      age: 49,
      district: 'Gorakhpur',
      state: 'Uttar Pradesh',
      abhaId: '91-7294-1029-8472',
      isAyushmanCovered: false,
      subsidizedFeeInr: 150,
      screeningDate: '2026-09-12',
      cellImageUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(generateCellSvg('ASC-US', false)),
      heatmapImageUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(generateCellSvg('ASC-US', true)),
      blendedHeatmapUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(generateCellSvg('ASC-US', true)),
      predictedClass: 'ASC-US',
      classFullName: 'Atypical Squamous Cells of Undetermined Significance',
      confidence: 0.78,
      calibratedConfidence: 0.71,
      temperatureFactor: 1.35,
      uncertaintyScore: 0.34,
      referToDoctor: true,
      urgencyLevel: 'Routine',
      referralReason: 'Model uncertainty exceeds threshold boundary (0.25). Ambiguous nuclear enlargement detected.',
      clinicalSummary: 'Enlarged squamous cell nuclei exhibiting borderline hyperchromasia and mild perinuclear clearing.',
      cellularMorphology: {
        nuclearEnlargement: 'Enlarged 2.5x normal intermediate nucleus',
        chromatinPattern: 'Borderline clumping with mild irregularity',
        nuclearMembrane: 'Slight contour waviness',
        ncRatio: 'Mildly elevated',
        cytoplasm: 'Restricted cyanophilic borders',
      },
      attentionFocalPoints: [
        { x: 50, y: 50, weight: 0.78, label: 'Atypical Nuclear Envelope', finding: 'Borderline enlargement and hyperchromasia' },
      ],
      recommendation: 'Reflex HPV DNA testing and colposcopy triage if high-risk HPV positive.',
      status: 'Pending Cytopathologist Review',
      cytopathologistSigned: false,
    },
    {
      id: 'rec-a-004',
      caseId: 'CVX-A-2026-0004',
      doctorId: 'doc-a',
      sampleId: 'CX-2026-A104',
      patientName: 'Kavita Singh',
      age: 52,
      district: 'Kanpur',
      state: 'Uttar Pradesh',
      abhaId: '91-1029-4820-3948',
      isAyushmanCovered: true,
      subsidizedFeeInr: 150,
      screeningDate: '2026-09-10',
      cellImageUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(generateCellSvg('LSIL', false)),
      heatmapImageUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(generateCellSvg('LSIL', true)),
      blendedHeatmapUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(generateCellSvg('LSIL', true)),
      predictedClass: 'LSIL',
      classFullName: 'Low-Grade Squamous Intraepithelial Lesion',
      confidence: 0.89,
      calibratedConfidence: 0.84,
      temperatureFactor: 1.35,
      uncertaintyScore: 0.16,
      referToDoctor: true,
      urgencyLevel: 'Routine',
      referralReason: 'Prominent koilocytic halo and nuclear enlargement characteristic of transient low-grade HPV infection.',
      clinicalSummary: 'Intermediate squamous cells with characteristic sharp perinuclear halos and enlarged hyperchromatic nuclei.',
      cellularMorphology: {
        nuclearEnlargement: 'Enlarged ~3x normal nucleus',
        chromatinPattern: 'Slightly smudgy, mildly coarse',
        nuclearMembrane: 'Wavy and gently folded',
        ncRatio: 'Moderately elevated',
        cytoplasm: 'Classic perinuclear cavitation / halo',
      },
      attentionFocalPoints: [
        { x: 50, y: 50, weight: 0.86, label: 'Koilocytic Cavitation', finding: 'Perinuclear halo with distinct outer condensation' },
      ],
      recommendation: 'Colposcopy evaluation or repeat cytology in 6-12 months.',
      status: 'Reviewed & Signed',
      cytopathologistSigned: true,
      signedBy: 'Dr. Ananya Sen, MD',
      signedAt: '2026-09-10T14:45:00.000Z',
    },
  ];
}

/**
 * Pre-seeded clinical cases for Doctor B (Dr. Bhavna Patel)
 */
function createDoctorBCases(): ScreeningRecord[] {
  return [
    {
      id: 'rec-b-001',
      caseId: 'CVX-B-2026-0001',
      doctorId: 'doc-b',
      sampleId: 'CX-2026-B201',
      patientName: 'Anjali Nair',
      age: 46,
      district: 'Ernakulam',
      state: 'Kerala',
      abhaId: '91-5820-3948-1029',
      isAyushmanCovered: true,
      subsidizedFeeInr: 150,
      screeningDate: '2026-09-16',
      cellImageUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(generateCellSvg('HSIL', false)),
      heatmapImageUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(generateCellSvg('HSIL', true)),
      blendedHeatmapUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(generateCellSvg('HSIL', true)),
      predictedClass: 'HSIL',
      classFullName: 'High-Grade Squamous Intraepithelial Lesion',
      confidence: 0.95,
      calibratedConfidence: 0.92,
      temperatureFactor: 1.35,
      uncertaintyScore: 0.09,
      referToDoctor: true,
      urgencyLevel: 'Urgent',
      referralReason: 'Syncytial cluster with marked hyperchromasia and high nuclear-to-cytoplasmic ratio.',
      clinicalSummary: 'Dysplastic syncytial aggregate exhibiting hyperchromasia, chromatin clumping, and loss of cytoplasmic maturation.',
      cellularMorphology: {
        nuclearEnlargement: 'Marked (>3x normal intermediate nucleus)',
        chromatinPattern: 'Coarse, irregularly distributed',
        nuclearMembrane: 'Irregular, notched contours',
        ncRatio: 'Markedly elevated (>0.80)',
        cytoplasm: 'Scant cyanophilic border',
      },
      attentionFocalPoints: [
        { x: 50, y: 50, weight: 0.95, label: 'Syncytial Nuclear Mass', finding: 'High absorption hyperchromatic atypia' },
      ],
      recommendation: 'Urgent colposcopic referral and punch biopsy within 7-10 days.',
      status: 'Pending Cytopathologist Review',
      cytopathologistSigned: false,
    },
    {
      id: 'rec-b-002',
      caseId: 'CVX-B-2026-0002',
      doctorId: 'doc-b',
      sampleId: 'CX-2026-B202',
      patientName: 'Deepa Menon',
      age: 35,
      district: 'Thrissur',
      state: 'Kerala',
      abhaId: '91-2049-5819-3920',
      isAyushmanCovered: true,
      subsidizedFeeInr: 150,
      screeningDate: '2026-09-13',
      cellImageUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(generateCellSvg('NILM', false)),
      heatmapImageUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(generateCellSvg('NILM', true)),
      blendedHeatmapUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(generateCellSvg('NILM', true)),
      predictedClass: 'NILM',
      classFullName: 'Negative for Intraepithelial Lesion or Malignancy',
      confidence: 0.98,
      calibratedConfidence: 0.96,
      temperatureFactor: 1.35,
      uncertaintyScore: 0.03,
      referToDoctor: false,
      urgencyLevel: 'Routine',
      referralReason: 'Normal mature squamous cells. Clear autonomous negative classification.',
      clinicalSummary: 'Benign cellular sample dominated by intermediate and superficial squamous cells with abundant cytoplasm.',
      cellularMorphology: {
        nuclearEnlargement: 'Normal (~8µm)',
        chromatinPattern: 'Finely granular',
        nuclearMembrane: 'Smooth, round, uniform',
        ncRatio: 'Low (~1:10)',
        cytoplasm: 'Broad translucent cytoplasm',
      },
      attentionFocalPoints: [
        { x: 50, y: 50, weight: 0.32, label: 'Benign Squamous Cell', finding: 'Uniform chromatin without dyskaryosis' },
      ],
      recommendation: 'Routine screening repeat in 3 years.',
      status: 'Reviewed & Signed',
      cytopathologistSigned: true,
      signedBy: 'Dr. Bhavna Patel, MD',
      signedAt: '2026-09-13T10:15:00.000Z',
    },
    {
      id: 'rec-b-003',
      caseId: 'CVX-B-2026-0003',
      doctorId: 'doc-b',
      sampleId: 'CX-2026-B203',
      patientName: 'Lakshmi Pillai',
      age: 58,
      district: 'Kozhikode',
      state: 'Kerala',
      abhaId: '91-8472-1029-7294',
      isAyushmanCovered: false,
      subsidizedFeeInr: 150,
      screeningDate: '2026-09-11',
      cellImageUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(generateCellSvg('SCC', false)),
      heatmapImageUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(generateCellSvg('SCC', true)),
      blendedHeatmapUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(generateCellSvg('SCC', true)),
      predictedClass: 'SCC',
      classFullName: 'Squamous Cell Carcinoma',
      confidence: 0.96,
      calibratedConfidence: 0.94,
      temperatureFactor: 1.35,
      uncertaintyScore: 0.07,
      referToDoctor: true,
      urgencyLevel: 'Urgent',
      referralReason: 'Pleomorphic tadpole malignant cell with prominent macronucleoli and tumor diathesis background.',
      clinicalSummary: 'Invasive malignant cellular patterns with irregular hyperchromatic macronucleoli and necroinflammatory tumor diathesis.',
      cellularMorphology: {
        nuclearEnlargement: 'Bizarre pleomorphic enlargement',
        chromatinPattern: 'Extremely coarse, dense, irregularly aggregated',
        nuclearMembrane: 'Jagged, fractured, thickened borders',
        ncRatio: 'Severely elevated with variable bizarre shapes',
        cytoplasm: 'Keratinized orangeophilic cytoplasm with tadpole extensions',
      },
      attentionFocalPoints: [
        { x: 50, y: 50, weight: 0.98, label: 'Malignant Tadpole Cell', finding: 'Pleomorphic macronucleoli and keratinization' },
      ],
      recommendation: 'Immediate emergency oncology referral for diagnostic colposcopy, biopsy, and staging.',
      status: 'Pending Cytopathologist Review',
      cytopathologistSigned: false,
    },
  ];
}

/**
 * Pre-seeded clinical cases for Demo Doctor (Dr. Vikramaditya Rao)
 */
function createDemoCases(): ScreeningRecord[] {
  return INITIAL_SCREENING_RECORDS.map((r, idx) => ({
    ...r,
    doctorId: 'doc-demo',
    caseId: `CVX-2026-${String(idx + 1).padStart(4, '0')}`,
    sampleId: r.sampleId || `CX-2026-${8492 - idx}`,
    cellImageUrl: r.cellImageUrl || ('data:image/svg+xml;utf8,' + encodeURIComponent(generateCellSvg(r.predictedClass, false))),
    heatmapImageUrl: r.heatmapImageUrl || ('data:image/svg+xml;utf8,' + encodeURIComponent(generateCellSvg(r.predictedClass, true))),
    blendedHeatmapUrl: r.blendedHeatmapUrl || ('data:image/svg+xml;utf8,' + encodeURIComponent(generateCellSvg(r.predictedClass, true))),
    signedBy: r.cytopathologistSigned ? DEMO_DOCTOR.name : undefined,
  }));
}

/**
 * Retrieves all registered doctor accounts from localStorage.
 * Ensures DEMO_DOCTOR, DOCTOR_A, and DOCTOR_B are always registered.
 */
export function getRegisteredDoctors(): DoctorUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DOCTORS);
    let doctors: DoctorUser[] = [];
    if (raw) {
      doctors = JSON.parse(raw) as DoctorUser[];
    }
    
    // Ensure all default doctors exist
    let updated = false;
    for (const defDoc of DEFAULT_DOCTORS) {
      if (!doctors.some((d) => d.id === defDoc.id || d.email.toLowerCase() === defDoc.email.toLowerCase())) {
        doctors.unshift(defDoc);
        updated = true;
      }
    }

    if (updated || !raw) {
      localStorage.setItem(STORAGE_KEY_DOCTORS, JSON.stringify(doctors));
    }
    return doctors;
  } catch (err) {
    console.warn('Error reading doctors from localStorage:', err);
    return DEFAULT_DOCTORS;
  }
}

/**
 * Registers a new doctor account and persists it to localStorage.
 */
export function registerNewDoctor(data: {
  name: string;
  email: string;
  password: string;
  regNumber: string;
  phone?: string;
  hospital: string;
  specialization: string;
}): { success: boolean; error?: string; doctor?: DoctorUser } {
  const doctors = getRegisteredDoctors();

  const cleanEmail = data.email.trim().toLowerCase();
  const existing = doctors.find(
    (d) => d.email.toLowerCase() === cleanEmail || d.regNumber.toLowerCase() === data.regNumber.trim().toLowerCase()
  );

  if (existing) {
    if (existing.email.toLowerCase() === cleanEmail) {
      return { success: false, error: 'A doctor account with this institutional email is already registered.' };
    }
    return { success: false, error: 'A doctor account with this Medical Registration Number already exists.' };
  }

  // Ensure title prefix
  let formattedName = data.name.trim();
  if (!formattedName.toLowerCase().startsWith('dr')) {
    formattedName = `Dr. ${formattedName}`;
  }

  const newDoctor: DoctorUser = {
    id: `doc-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    name: formattedName,
    email: cleanEmail,
    password: data.password,
    regNumber: data.regNumber.trim().toUpperCase(),
    phone: data.phone?.trim() || '',
    hospital: data.hospital.trim() || 'Regional Oncology Center',
    specialization: data.specialization.trim() || 'MD Cytopathology',
    role: 'Consultant Cytopathologist',
    createdAt: new Date().toISOString().split('T')[0],
  };

  const updatedDoctors = [newDoctor, ...doctors];
  try {
    localStorage.setItem(STORAGE_KEY_DOCTORS, JSON.stringify(updatedDoctors));
  } catch (err) {
    console.error('Error saving doctor to localStorage:', err);
  }

  return { success: true, doctor: newDoctor };
}

/**
 * Authenticates doctor credentials against stored profiles.
 * Supports Doctor A, Doctor B, Demo Doctor, and any registered accounts.
 */
export function authenticateDoctor(
  emailOrReg: string,
  pass: string
): { success: boolean; error?: string; doctor?: DoctorUser } {
  const doctors = getRegisteredDoctors();
  const cleanInput = emailOrReg.trim().toLowerCase();

  // Check predefined aliases first
  let doctor: DoctorUser | undefined;

  if (cleanInput === 'doctor.a' || cleanInput === 'doctora' || cleanInput === 'doc-a' || cleanInput === 'doctor.a@cervixai.com' || cleanInput === 'doctora@cervixai.com' || cleanInput === 'dr.ananya' || cleanInput === 'nmc-2019-10293') {
    doctor = doctors.find((d) => d.id === 'doc-a') || DOCTOR_A;
  } else if (cleanInput === 'doctor.b' || cleanInput === 'doctorb' || cleanInput === 'doc-b' || cleanInput === 'doctor.b@cervixai.com' || cleanInput === 'doctorb@cervixai.com' || cleanInput === 'dr.bhavna' || cleanInput === 'nmc-2020-83719') {
    doctor = doctors.find((d) => d.id === 'doc-b') || DOCTOR_B;
  } else if (cleanInput === 'demo.doctor@cervixai.com' || cleanInput === 'demo.doctor' || cleanInput === 'demo' || cleanInput === 'demodoctor' || cleanInput === 'doc-demo' || cleanInput === 'nmc-2018-04921') {
    doctor = doctors.find((d) => d.id === 'doc-demo') || DEMO_DOCTOR;
  } else {
    // General lookup
    doctor = doctors.find(
      (d) => d.email.toLowerCase() === cleanInput || d.regNumber.toLowerCase() === cleanInput || d.id === cleanInput
    );
  }

  if (!doctor) {
    return {
      success: false,
      error: 'Doctor account not found. Please check your credentials or click "Create Doctor Account".',
    };
  }

  // Allow standard password or prototype bypass for easy evaluation
  const passClean = pass.trim();
  const isDemoPass = passClean === 'CerviXAI@123' || passClean.toLowerCase() === 'cervixai@123';
  if (doctor.password && doctor.password !== passClean && !isDemoPass) {
    return {
      success: false,
      error: 'Incorrect password. Please verify your password or use CerviXAI@123.',
    };
  }

  return { success: true, doctor };
}

/**
 * Retrieves the currently active authenticated session.
 */
export function getActiveSession(): DoctorUser | null {
  try {
    // Check localStorage (Remember Me)
    const local = localStorage.getItem(STORAGE_KEY_ACTIVE_SESSION);
    if (local) {
      return JSON.parse(local) as DoctorUser;
    }
    // Check sessionStorage (Single Session)
    const session = sessionStorage.getItem(STORAGE_KEY_ACTIVE_SESSION);
    if (session) {
      return JSON.parse(session) as DoctorUser;
    }
    return null;
  } catch (err) {
    console.warn('Error reading active session:', err);
    return null;
  }
}

/**
 * Saves the active doctor session to local or session storage.
 */
export function saveActiveSession(doctor: DoctorUser, rememberMe: boolean): void {
  try {
    const data = JSON.stringify(doctor);
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_SESSION, data);
      sessionStorage.removeItem(STORAGE_KEY_ACTIVE_SESSION);
    } else {
      sessionStorage.setItem(STORAGE_KEY_ACTIVE_SESSION, data);
      localStorage.removeItem(STORAGE_KEY_ACTIVE_SESSION);
    }
  } catch (err) {
    console.error('Error saving active session:', err);
  }
}

/**
 * Clears the active doctor session (Logout).
 */
export function clearActiveSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_ACTIVE_SESSION);
    sessionStorage.removeItem(STORAGE_KEY_ACTIVE_SESSION);
  } catch (err) {
    console.error('Error clearing active session:', err);
  }
}

// Convenient aliases for session management
export const getActiveDoctorSession = getActiveSession;
export const saveActiveDoctorSession = saveActiveSession;
export const clearActiveDoctorSession = clearActiveSession;

/**
 * Saves or replaces the complete list of doctor records in localStorage.
 */
export function saveDoctorRecords(doctorId: string, records: ScreeningRecord[]): void {
  try {
    const normId = normalizeDoctorId(doctorId);
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    let recordStore: Record<string, ScreeningRecord[]> = {};
    if (raw) {
      recordStore = JSON.parse(raw);
    }
    recordStore[normId] = records;
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(recordStore));
  } catch (err) {
    console.error('Error saving doctor records:', err);
  }
}

/**
 * Deletes a single case record by id or caseId for a given doctor.
 * Saves updated list to localStorage and returns updated array.
 */
export function deleteDoctorRecord(doctorId: string, recordId: string): ScreeningRecord[] {
  try {
    const normId = normalizeDoctorId(doctorId);
    const records = getDoctorRecords(normId);
    const updated = records.filter((r) => r.id !== recordId && r.caseId !== recordId);
    saveDoctorRecords(normId, updated);
    return updated;
  } catch (err) {
    console.error('Error deleting doctor record:', err);
    return [];
  }
}

/**
 * Generates the next sequential Case ID for a given doctor (e.g., CVX-A-2026-0005).
 */
export function generateNextCaseId(doctorId: string): string {
  const normId = normalizeDoctorId(doctorId);
  const records = getDoctorRecords(normId);
  const currentCount = records.length;
  const seq = String(currentCount + 1).padStart(4, '0');
  if (normId === 'doc-a') return `CVX-A-2026-${seq}`;
  if (normId === 'doc-b') return `CVX-B-2026-${seq}`;
  return `CVX-2026-${seq}`;
}

/**
 * Retrieves patient/case records belonging strictly to the specified doctor.
 * Doctor A gets Doctor A's cases.
 * Doctor B gets Doctor B's cases.
 * Demo Doctor gets Demo Doctor's cases.
 * Newly registered doctors start with 0 cases until they analyze a slide.
 */
export function getDoctorRecords(doctorId: string): ScreeningRecord[] {
  try {
    const normId = normalizeDoctorId(doctorId);
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    let recordStore: Record<string, ScreeningRecord[]> = {};
    if (raw) {
      recordStore = JSON.parse(raw);
    }

    // If records exist for this doctor (even if empty array from deletion), return them
    if (recordStore[normId] !== undefined) {
      return recordStore[normId];
    }

    // Seed Doctor A if not initialized yet
    if (normId === 'doc-a') {
      const seededA = createDoctorACases();
      recordStore['doc-a'] = seededA;
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(recordStore));
      return seededA;
    }

    // Seed Doctor B if not initialized yet
    if (normId === 'doc-b') {
      const seededB = createDoctorBCases();
      recordStore['doc-b'] = seededB;
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(recordStore));
      return seededB;
    }

    // Seed Demo Doctor if not initialized yet
    if (normId === 'doc-demo') {
      const seededDemo = createDemoCases();
      recordStore['doc-demo'] = seededDemo;
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(recordStore));
      return seededDemo;
    }

    // Newly registered doctor starts with 0 cases
    recordStore[normId] = [];
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(recordStore));
    return [];
  } catch (err) {
    console.warn('Error reading doctor records from localStorage:', err);
    if (doctorId === 'doc-a') return createDoctorACases();
    if (doctorId === 'doc-b') return createDoctorBCases();
    return createDemoCases();
  }
}

/**
 * Saves a new screening case to the doctor's record store in localStorage.
 */
export function saveDoctorRecord(doctorId: string, record: ScreeningRecord): ScreeningRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    let recordStore: Record<string, ScreeningRecord[]> = {};
    if (raw) {
      recordStore = JSON.parse(raw);
    }

    const currentList = recordStore[doctorId] || (doctorId === 'doc-demo' ? INITIAL_SCREENING_RECORDS : []);
    const updated = [record, ...currentList.filter((r) => r.id !== record.id)];
    recordStore[doctorId] = updated;

    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(recordStore));
    return updated;
  } catch (err) {
    console.error('Error saving doctor record:', err);
    return [record];
  }
}

/**
 * Updates an existing screening case in the doctor's record store in localStorage.
 */
export function updateDoctorRecord(doctorId: string, updatedRecord: ScreeningRecord): ScreeningRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    let recordStore: Record<string, ScreeningRecord[]> = {};
    if (raw) {
      recordStore = JSON.parse(raw);
    }

    const currentList = recordStore[doctorId] || [];
    const updated = currentList.map((r) => (r.id === updatedRecord.id ? updatedRecord : r));
    recordStore[doctorId] = updated;

    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(recordStore));
    return updated;
  } catch (err) {
    console.error('Error updating doctor record:', err);
    return [];
  }
}
