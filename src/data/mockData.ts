import { ScreeningRecord, NewsArticle, BethesdaClass } from '../types';

// Helper to generate realistic Pap smear cell SVGs with Pap stain characteristics (hematoxylin nucleus + EA/OG cytoplasm)
export function generateCellSvg(type: BethesdaClass, withHeatmap = false): string {
  // SVG representations rendered as data URIs for crisp, reliable display
  if (type === 'NILM') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%" class="rounded-xl overflow-hidden shadow-inner">
      <defs>
        <radialGradient id="cytoNorm" cx="45%" cy="50%" r="55%">
          <stop offset="0%" stop-color="#BFD8D5"/>
          <stop offset="60%" stop-color="#A5C7C3"/>
          <stop offset="100%" stop-color="#8DB6B1"/>
        </radialGradient>
        <radialGradient id="nucNorm" cx="48%" cy="48%" r="45%">
          <stop offset="0%" stop-color="#3D2952"/>
          <stop offset="85%" stop-color="#241434"/>
          <stop offset="100%" stop-color="#140820"/>
        </radialGradient>
        ${withHeatmap ? `
        <radialGradient id="heatNorm" cx="50%" cy="50%" r="40%">
          <stop offset="0%" stop-color="rgba(76, 175, 80, 0.45)"/>
          <stop offset="60%" stop-color="rgba(33, 150, 243, 0.25)"/>
          <stop offset="100%" stop-color="rgba(0, 0, 0, 0)"/>
        </radialGradient>` : ''}
      </defs>
      <!-- Background slide stroma -->
      <rect width="400" height="400" fill="#EAE3D5"/>
      <!-- Background stain granules & normal lactobacilli traces -->
      <circle cx="90" cy="70" r="1.5" fill="#887890" opacity="0.4"/>
      <circle cx="310" cy="330" r="2" fill="#887890" opacity="0.3"/>
      <line x1="80" y1="280" x2="95" y2="284" stroke="#685870" stroke-width="1" opacity="0.4"/>
      <line x1="320" y1="110" x2="332" y2="114" stroke="#685870" stroke-width="1" opacity="0.4"/>
      
      <!-- Normal mature intermediate squamous cell: broad polygonal cytoplasm -->
      <path d="M 120 70 C 230 40, 330 90, 350 200 C 365 290, 290 350, 190 360 C 90 370, 50 290, 60 190 C 70 110, 80 80, 120 70 Z" 
            fill="url(#cytoNorm)" stroke="#749B96" stroke-width="1.8" opacity="0.92"/>
      
      <!-- Folded cytoplasmic edge -->
      <path d="M 280 290 Q 320 310, 350 200" stroke="#638C87" stroke-width="1.5" fill="none" opacity="0.7"/>
      
      <!-- Normal small vesicular nucleus (N:C ratio ~ 1:10) -->
      <ellipse cx="205" cy="205" rx="22" ry="20" fill="url(#nucNorm)" stroke="#190B26" stroke-width="1.2"/>
      <!-- Fine uniform chromatin pattern -->
      <circle cx="201" cy="200" r="3" fill="#4B3363" opacity="0.6"/>
      <circle cx="211" cy="207" r="2.5" fill="#4B3363" opacity="0.6"/>

      ${withHeatmap ? `
      <!-- Low activation heatmap -->
      <ellipse cx="205" cy="205" rx="75" ry="70" fill="url(#heatNorm)"/>
      <circle cx="205" cy="205" r="30" fill="rgba(255, 235, 59, 0.35)"/>
      ` : ''}
    </svg>`;
  }

  if (type === 'ASC-US') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%" class="rounded-xl overflow-hidden shadow-inner">
      <defs>
        <radialGradient id="cytoAscus" cx="48%" cy="52%" r="60%">
          <stop offset="0%" stop-color="#D6B8C2"/>
          <stop offset="70%" stop-color="#C29FAA"/>
          <stop offset="100%" stop-color="#AB8692"/>
        </radialGradient>
        <radialGradient id="nucAscus" cx="50%" cy="48%" r="48%">
          <stop offset="0%" stop-color="#4A1E5C"/>
          <stop offset="75%" stop-color="#2D0B3D"/>
          <stop offset="100%" stop-color="#190424"/>
        </radialGradient>
        ${withHeatmap ? `
        <radialGradient id="heatAscus" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(230, 81, 0, 0.78)"/>
          <stop offset="45%" stop-color="rgba(255, 179, 0, 0.6)"/>
          <stop offset="75%" stop-color="rgba(76, 175, 80, 0.3)"/>
          <stop offset="100%" stop-color="rgba(0, 0, 0, 0)"/>
        </radialGradient>` : ''}
      </defs>
      <rect width="400" height="400" fill="#EAE2D3"/>
      <!-- Background debris & slight inflammation -->
      <circle cx="110" cy="90" r="3" fill="#755E80" opacity="0.5"/>
      <circle cx="118" cy="94" r="2.5" fill="#755E80" opacity="0.5"/>
      <circle cx="310" cy="290" r="3.2" fill="#755E80" opacity="0.45"/>
      
      <!-- Cytoplasm: slightly restricted, mild reactive orangeophilic/cyanophilic mixture -->
      <path d="M 130 90 C 240 70, 310 110, 330 200 C 345 280, 270 330, 180 340 C 100 350, 70 270, 80 180 C 90 120, 100 100, 130 90 Z" 
            fill="url(#cytoAscus)" stroke="#96707C" stroke-width="2"/>
            
      <!-- Subtle perinuclear clearing/halo -->
      <ellipse cx="205" cy="195" rx="54" ry="48" fill="#E4C8D2" opacity="0.6"/>

      <!-- Nucleus: 2.5-3x enlarged, mild irregular nuclear contour, borderline chromatin -->
      <path d="M 175 170 C 195 160, 230 162, 240 180 C 248 198, 238 225, 218 230 C 190 236, 168 220, 165 195 C 162 180, 168 172, 175 170 Z" 
            fill="url(#nucAscus)" stroke="#190424" stroke-width="1.8"/>
            
      <!-- Chromatin clumping dots -->
      <circle cx="195" cy="185" r="3.5" fill="#693380" opacity="0.75"/>
      <circle cx="215" cy="205" r="4" fill="#693380" opacity="0.7"/>
      <circle cx="185" cy="208" r="3" fill="#693380" opacity="0.75"/>

      ${withHeatmap ? `
      <!-- Grad-CAM++ Activation focusing on enlarged irregular nucleus & halo -->
      <ellipse cx="202" cy="195" rx="100" ry="90" fill="url(#heatAscus)"/>
      <ellipse cx="202" cy="195" rx="55" ry="48" fill="rgba(216, 67, 21, 0.72)"/>
      ` : ''}
    </svg>`;
  }

  if (type === 'LSIL') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%" class="rounded-xl overflow-hidden shadow-inner">
      <defs>
        <radialGradient id="cytoLsil" cx="45%" cy="50%" r="65%">
          <stop offset="0%" stop-color="#CCD9C4"/>
          <stop offset="65%" stop-color="#ADC2A2"/>
          <stop offset="100%" stop-color="#8FAD82"/>
        </radialGradient>
        <radialGradient id="nucLsil" cx="48%" cy="46%" r="50%">
          <stop offset="0%" stop-color="#4C145C"/>
          <stop offset="70%" stop-color="#300A3C"/>
          <stop offset="100%" stop-color="#14021A"/>
        </radialGradient>
        ${withHeatmap ? `
        <radialGradient id="heatLsil" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stop-color="rgba(184, 92, 56, 0.88)"/>
          <stop offset="40%" stop-color="rgba(245, 124, 0, 0.75)"/>
          <stop offset="70%" stop-color="rgba(255, 214, 0, 0.5)"/>
          <stop offset="100%" stop-color="rgba(0, 0, 0, 0)"/>
        </radialGradient>` : ''}
      </defs>
      <rect width="400" height="400" fill="#E8DFD0"/>
      <!-- Stroma & PMN neutrophils -->
      <circle cx="85" cy="120" r="3.5" fill="#654F70" opacity="0.6"/>
      <circle cx="89" cy="124" r="3" fill="#654F70" opacity="0.6"/>
      <circle cx="330" cy="270" r="3.5" fill="#654F70" opacity="0.6"/>
      
      <!-- Koilocyte: Large intermediate cell with prominent HPV cytopathic effect -->
      <path d="M 110 80 C 230 50, 330 90, 340 190 C 350 280, 270 340, 170 350 C 80 360, 55 270, 65 170 C 75 100, 85 85, 110 80 Z" 
            fill="url(#cytoLsil)" stroke="#749666" stroke-width="2.2"/>
      
      <!-- Classic sharply demarcated perinuclear Cavitation / Halo (Koilocytosis) -->
      <ellipse cx="205" cy="195" rx="76" ry="68" fill="#F0F6EC" stroke="#99BA8C" stroke-width="1.5" stroke-dasharray="3,2"/>
      
      <!-- 3-4x Enlarged hyperchromatic dysplastic nucleus with wrinkled "raisinoid" membrane -->
      <path d="M 170 160 C 195 145, 235 150, 248 175 C 258 200, 245 235, 215 242 C 180 250, 150 230, 146 195 C 144 175, 155 165, 170 160 Z" 
            fill="url(#nucLsil)" stroke="#14021A" stroke-width="2.5"/>
            
      <!-- Coarse hyperchromasia and raisinoid folds -->
      <path d="M 180 175 Q 195 190, 220 180" stroke="#68297A" stroke-width="2" fill="none" opacity="0.75"/>
      <circle cx="185" cy="200" r="4.5" fill="#68297A" opacity="0.8"/>
      <circle cx="218" cy="210" r="5" fill="#68297A" opacity="0.8"/>

      ${withHeatmap ? `
      <!-- Grad-CAM++ High Focus on koilocytic halo and raisinoid hyperchromatic nucleus -->
      <ellipse cx="202" cy="195" rx="115" ry="105" fill="url(#heatLsil)"/>
      <ellipse cx="200" cy="195" rx="65" ry="58" fill="rgba(184, 92, 56, 0.82)"/>
      ` : ''}
    </svg>`;
  }

  if (type === 'HSIL' || type === 'ASC-H') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%" class="rounded-xl overflow-hidden shadow-inner">
      <defs>
        <radialGradient id="cytoHsil" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#C2A4B8"/>
          <stop offset="80%" stop-color="#A8839D"/>
          <stop offset="100%" stop-color="#8F6984"/>
        </radialGradient>
        <radialGradient id="nucHsil" cx="46%" cy="44%" r="52%">
          <stop offset="0%" stop-color="#540C66"/>
          <stop offset="70%" stop-color="#32023D"/>
          <stop offset="100%" stop-color="#0E0012"/>
        </radialGradient>
        ${withHeatmap ? `
        <radialGradient id="heatHsil" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stop-color="rgba(184, 40, 20, 0.95)"/>
          <stop offset="35%" stop-color="rgba(230, 81, 0, 0.88)"/>
          <stop offset="65%" stop-color="rgba(255, 179, 0, 0.6)"/>
          <stop offset="100%" stop-color="rgba(0, 0, 0, 0)"/>
        </radialGradient>` : ''}
      </defs>
      <rect width="400" height="400" fill="#E6DCCE"/>
      <!-- Heavy inflammatory background and cellular debris -->
      <circle cx="70" cy="80" r="3.5" fill="#583B5E" opacity="0.6"/>
      <circle cx="75" cy="85" r="3" fill="#583B5E" opacity="0.6"/>
      <circle cx="340" cy="130" r="4" fill="#583B5E" opacity="0.55"/>
      <circle cx="300" cy="330" r="3.8" fill="#583B5E" opacity="0.55"/>
      
      <!-- Severely diminished cytoplasm rim (Markedly High N:C Ratio > 70%) -->
      <path d="M 140 100 C 230 85, 295 115, 310 190 C 320 260, 265 315, 185 320 C 115 325, 90 260, 95 185 C 100 130, 110 110, 140 100 Z" 
            fill="url(#cytoHsil)" stroke="#784F6F" stroke-width="2.2"/>
            
      <!-- Massive, markedly irregular, hyperchromatic nucleus occupying almost entire cell area -->
      <path d="M 155 125 C 205 110, 260 120, 280 165 C 295 210, 275 270, 225 285 C 170 300, 125 260, 122 205 C 120 165, 130 135, 155 125 Z" 
            fill="url(#nucHsil)" stroke="#0E0012" stroke-width="3"/>
            
      <!-- Marked chromatin clumping, parachromatin clearing, prominent nuclear membrane notches -->
      <path d="M 280 165 Q 268 185, 285 205" stroke="#0E0012" stroke-width="3" fill="none"/>
      <circle cx="170" cy="165" r="7" fill="#751A8D" opacity="0.85"/>
      <circle cx="230" cy="175" r="8" fill="#751A8D" opacity="0.85"/>
      <circle cx="195" cy="235" r="9" fill="#751A8D" opacity="0.85"/>
      <circle cx="245" cy="240" r="6" fill="#751A8D" opacity="0.85"/>

      ${withHeatmap ? `
      <!-- Deep Red Terracotta Intense Activation Focal Area over Atypical Nucleus -->
      <ellipse cx="202" cy="202" rx="125" ry="118" fill="url(#heatHsil)"/>
      <ellipse cx="205" cy="205" rx="75" ry="70" fill="rgba(184, 40, 20, 0.88)"/>
      ` : ''}
    </svg>`;
  }

  // SCC
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%" class="rounded-xl overflow-hidden shadow-inner">
    <defs>
      <radialGradient id="cytoScc" cx="45%" cy="50%" r="65%">
        <stop offset="0%" stop-color="#E59966"/>
        <stop offset="70%" stop-color="#C77846"/>
        <stop offset="100%" stop-color="#A8592D"/>
      </radialGradient>
      <radialGradient id="nucScc" cx="44%" cy="45%" r="55%">
        <stop offset="0%" stop-color="#3D002E"/>
        <stop offset="75%" stop-color="#24001B"/>
        <stop offset="100%" stop-color="#080006"/>
      </radialGradient>
      ${withHeatmap ? `
      <radialGradient id="heatScc" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stop-color="rgba(184, 20, 20, 0.98)"/>
        <stop offset="40%" stop-color="rgba(216, 67, 21, 0.9)"/>
        <stop offset="75%" stop-color="rgba(255, 152, 0, 0.6)"/>
        <stop offset="100%" stop-color="rgba(0, 0, 0, 0)"/>
      </radialGradient>` : ''}
    </defs>
    <rect width="400" height="400" fill="#E4D7C3"/>
    <!-- Tumor diathesis: necrotic debris, ghost cells & lysed RBCs -->
    <rect x="60" y="60" width="280" height="280" fill="#997766" opacity="0.12"/>
    <circle cx="50" cy="90" r="3" fill="#884433" opacity="0.6"/>
    <circle cx="340" cy="180" r="4.5" fill="#884433" opacity="0.6"/>
    <circle cx="120" cy="330" r="4" fill="#884433" opacity="0.6"/>
    
    <!-- Bizarre "tadpole / spindle" keratinized malignant squamous cell -->
    <path d="M 80 230 C 120 120, 220 100, 310 130 C 370 150, 350 240, 260 270 C 180 300, 110 320, 80 230 Z" 
          fill="url(#cytoScc)" stroke="#7A3916" stroke-width="2.5"/>
          
    <!-- Bizarre multinucleated/macronucleolated malignant chromatin mass -->
    <path d="M 160 140 C 230 130, 280 155, 275 210 C 270 260, 200 275, 150 250 C 115 220, 125 160, 160 140 Z" 
          fill="url(#nucScc)" stroke="#080006" stroke-width="3.2"/>
          
    <!-- Prominent irregular macronucleoli & pyknosis -->
    <ellipse cx="220" cy="190" rx="9" ry="7" fill="#D32F2F" opacity="0.9"/>
    <circle cx="170" cy="195" r="7" fill="#66004D" opacity="0.9"/>
    <path d="M 160 170 Q 200 180, 240 160" stroke="#000000" stroke-width="2.5" fill="none"/>

    ${withHeatmap ? `
    <!-- Maximum Intensity Saliency Hotspot -->
    <ellipse cx="205" cy="205" rx="135" ry="120" fill="url(#heatScc)"/>
    <ellipse cx="210" cy="200" rx="80" ry="70" fill="rgba(184, 20, 20, 0.95)"/>
    ` : ''}
  </svg>`;
}

export const INITIAL_SCREENING_RECORDS: ScreeningRecord[] = [
  {
    id: 'rec-001',
    sampleId: 'CX-2026-1082',
    patientName: 'Sunita Devi',
    age: 44,
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    abhaId: '91-4829-1049-5820',
    screeningDate: '2026-09-07',
    subsidizedFeeInr: 150,
    normalFeeInr: 1200,
    isAyushmanCovered: true,
    hpvStatus: 'HPV-16 Positive',
    predictedClass: 'HSIL',
    classFullName: 'High-Grade Squamous Intraepithelial Lesion',
    confidence: 0.94,
    calibratedConfidence: 0.91,
    temperatureScaleFactor: 1.35,
    uncertaintyScore: 0.12,
    referToDoctor: true,
    referralReason: 'Severe nuclear hyperchromasia with high N:C ratio; urgent colposcopy referral required.',
    urgencyLevel: 'Urgent',
    status: 'Pending Cytopathologist Review',
    cytopathologistSigned: false,
    clinicalSummary: 'Multiscale attention backbone identified significant dysplastic cellular clusters exhibiting prominent irregular nuclear contouring, marked chromatin coarseness, and high nuclear-to-cytoplasmic ratio (>75%). Strong concordance with CIN 2/3 histological risk.',
    cellularMorphology: {
      nuclearEnlargement: 'Marked (>3.5x normal intermediate squamous cell nucleus)',
      chromatinPattern: 'Dense, coarsely clumped with prominent parachromatin clearing',
      nuclearMembrane: 'Markedly irregular with deep clefts and indentations',
      ncRatio: 'Markedly elevated (>0.75), minimal cytoplasmic envelope',
      cytoplasm: 'Cyanophilic rim with angular borders, focal degeneration',
    },
    attentionFocalPoints: [
      { label: 'Hyperchromatic Nucleus', x: 52, y: 48, radius: 24, weight: 0.95, finding: 'Coarse chromatin aggregation with high absorption profile' },
      { label: 'Nuclear Notch', x: 68, y: 44, radius: 12, weight: 0.88, finding: 'Membrane irregularity pathognomonic for high-grade dysplasia' },
      { label: 'Attenuated Cytoplasm', x: 38, y: 56, radius: 18, weight: 0.76, finding: 'Severe loss of mature cytoplasmic mantle' },
    ],
    recommendation: 'Immediate referral for colposcopy-directed punch biopsy and endocervical curettage under district tertiary oncology center protocol.',
    cellImageUrl: '', // dynamically filled
  },
  {
    id: 'rec-002',
    sampleId: 'CX-2026-1081',
    patientName: 'Priya Patel',
    age: 36,
    district: 'Thane',
    state: 'Maharashtra',
    abhaId: '91-3829-8472-1092',
    screeningDate: '2026-09-06',
    subsidizedFeeInr: 150,
    normalFeeInr: 1200,
    isAyushmanCovered: true,
    hpvStatus: 'High-Risk Non-16/18',
    predictedClass: 'ASC-US',
    classFullName: 'Atypical Squamous Cells of Undetermined Significance',
    confidence: 0.69,
    calibratedConfidence: 0.62,
    temperatureScaleFactor: 1.35,
    uncertaintyScore: 0.38,
    referToDoctor: true,
    referralReason: 'Selective prediction threshold triggered: uncertainty score (0.38) exceeds safe threshold (0.20); borderline reactive vs dysplastic nuclear changes.',
    urgencyLevel: 'Moderate',
    status: 'Pending Cytopathologist Review',
    cytopathologistSigned: false,
    clinicalSummary: 'Slide demonstrates nuclear enlargement approximately 2.5x normal intermediate nucleus with slight hyperchromasia. Temperature-scaled softmax distribution shows high entropy between reactive inflammation and genuine mild dysplasia.',
    cellularMorphology: {
      nuclearEnlargement: 'Mild to moderate (2.0-2.5x normal intermediate nucleus)',
      chromatinPattern: 'Finely granular with focal slight clumping, preserved symmetry',
      nuclearMembrane: 'Mostly smooth with subtle focal contour waviness',
      ncRatio: 'Slightly elevated (~0.35), abundant mature cytoplasm preserved',
      cytoplasm: 'Eosinophilic, polygonal with flat borders',
    },
    attentionFocalPoints: [
      { label: 'Borderline Enlarged Nucleus', x: 50, y: 50, radius: 20, weight: 0.72, finding: 'Modest chromatin density requiring specialist cytological adjudication' },
      { label: 'Perinuclear Zone', x: 44, y: 46, radius: 15, weight: 0.58, finding: 'Subtle halo without sharp koilocytic demarcation' },
    ],
    recommendation: 'Secondary review by senior cytopathologist. If confirmed ASC-US with high-risk HPV, repeat Pap cytology with reflex colposcopy at 6 months.',
    cellImageUrl: '',
  },
  {
    id: 'rec-003',
    sampleId: 'CX-2026-1079',
    patientName: 'Kavitha R.',
    age: 29,
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    abhaId: '91-7482-9102-3841',
    screeningDate: '2026-09-05',
    subsidizedFeeInr: 150,
    normalFeeInr: 1200,
    isAyushmanCovered: true,
    hpvStatus: 'HPV Negative',
    predictedClass: 'NILM',
    classFullName: 'Negative for Intraepithelial Lesion or Malignancy',
    confidence: 0.98,
    calibratedConfidence: 0.96,
    temperatureScaleFactor: 1.35,
    uncertaintyScore: 0.05,
    referToDoctor: false,
    referralReason: 'High confidence prediction with low uncertainty (<0.08); within autonomous safety bounds.',
    urgencyLevel: 'Routine',
    status: 'Reviewed & Signed',
    cytopathologistSigned: true,
    signedBy: 'Dr. Ananya Sharma, MD Pathology',
    signedAt: '2026-09-05 16:30 IST',
    clinicalSummary: 'Well-spread liquid-based preparation displaying mature superficial and intermediate squamous epithelial cells. Nuclei are round, uniform, with delicate pale vesicular chromatin and low N:C ratio. No evidence of cellular atypia or fungal/trichomonas organisms.',
    cellularMorphology: {
      nuclearEnlargement: 'None (normal size ~8-11 µm, intermediate cell standard)',
      chromatinPattern: 'Delicate, uniform, normochromatic',
      nuclearMembrane: 'Completely round and smooth',
      ncRatio: 'Low (~0.10), expansive polygonal cytoplasm',
      cytoplasm: 'Pale cyanophilic/translucent, regular folded edges',
    },
    attentionFocalPoints: [
      { label: 'Normal Nucleus', x: 51, y: 51, radius: 16, weight: 0.32, finding: 'Low gradient activation verifying absence of pathological features' },
    ],
    recommendation: 'Routine triennial cervical screening recall at Primary Health Centre in 3 years.',
    cellImageUrl: '',
  },
  {
    id: 'rec-004',
    sampleId: 'CX-2026-1075',
    patientName: 'Fatima Begum',
    age: 51,
    district: 'Hyderabad',
    state: 'Telangana',
    abhaId: '91-1029-4739-9281',
    screeningDate: '2026-09-04',
    subsidizedFeeInr: 150,
    normalFeeInr: 1200,
    isAyushmanCovered: true,
    hpvStatus: 'HPV-16 Positive',
    predictedClass: 'LSIL',
    classFullName: 'Low-Grade Squamous Intraepithelial Lesion',
    confidence: 0.92,
    calibratedConfidence: 0.89,
    temperatureScaleFactor: 1.35,
    uncertaintyScore: 0.14,
    referToDoctor: true,
    referralReason: 'Confirmed koilocytic atypia characteristic of HPV cytopathic effect (CIN 1 equivalent).',
    urgencyLevel: 'Moderate',
    status: 'Flagged for Colposcopy',
    cytopathologistSigned: true,
    signedBy: 'Dr. Rajesh K. Nair, FRCPath',
    signedAt: '2026-09-04 18:15 IST',
    clinicalSummary: 'Classic cytological features of HPV-induced productive infection. Cells demonstrate marked perinuclear cavitation (koilocytes) with sharply condensed peripheral cytoplasm and enlarged hyperchromatic raisinoid nuclei.',
    cellularMorphology: {
      nuclearEnlargement: 'Moderate (3x normal intermediate nucleus)',
      chromatinPattern: 'Moderately hyperchromatic, coarse granularity',
      nuclearMembrane: 'Slightly wrinkled with raisin-like contour',
      ncRatio: 'Moderately increased (~0.45)',
      cytoplasm: 'Prominent clear halo with thickened amphophilic peripheral rim',
    },
    attentionFocalPoints: [
      { label: 'Koilocyte Nucleus', x: 50, y: 48, radius: 22, weight: 0.89, finding: 'Hyperchromatic raisinoid nuclear envelope' },
      { label: 'Perinuclear Halo', x: 52, y: 49, radius: 32, weight: 0.84, finding: 'Sharply defined halo zone validating viral cytopathy' },
    ],
    recommendation: 'Colposcopic evaluation with Lugol’s iodine and 5% acetic acid (VIA/VILI). Co-test follow-up at 12 months.',
    cellImageUrl: '',
  },
  {
    id: 'rec-005',
    sampleId: 'CX-2026-1070',
    patientName: 'Lakshmi Narayan',
    age: 58,
    district: 'Mysuru',
    state: 'Karnataka',
    abhaId: '91-6284-9102-4729',
    screeningDate: '2026-09-02',
    subsidizedFeeInr: 150,
    normalFeeInr: 1200,
    isAyushmanCovered: true,
    hpvStatus: 'HPV-16 Positive',
    predictedClass: 'SCC',
    classFullName: 'Squamous Cell Carcinoma (Keratinizing)',
    confidence: 0.97,
    calibratedConfidence: 0.95,
    temperatureScaleFactor: 1.35,
    uncertaintyScore: 0.08,
    referToDoctor: true,
    referralReason: 'Malignant cytology: Bizarre pleomorphic tadpole cells with tumor diathesis. Immediate oncology triage.',
    urgencyLevel: 'Critical',
    status: 'Pending Cytopathologist Review',
    cytopathologistSigned: false,
    clinicalSummary: 'Slide displays syncytial aggregates of markedly pleomorphic, hyperkeratinized squamous cells with orangeophilic cytoplasm and bizarre tadpole morphology. Background exhibits marked tumor diathesis with lysed erythrocytes and necrotic proteinaceous debris.',
    cellularMorphology: {
      nuclearEnlargement: 'Extreme and variable, macronucleoli present',
      chromatinPattern: 'Profound hyperchromasia, irregular chromatin clumps and parachromatin voids',
      nuclearMembrane: 'Jagged, fractured borders with sharp spikes',
      ncRatio: 'Extreme (>0.85)',
      cytoplasm: 'Intensely orangeophilic / refractive keratinized cytoplasm',
    },
    attentionFocalPoints: [
      { label: 'Malignant Nucleus', x: 48, y: 52, radius: 26, weight: 0.98, finding: 'Pathognomonic carcinoma feature vector' },
      { label: 'Tadpole Cytoplasmic Tail', x: 32, y: 64, radius: 20, weight: 0.86, finding: 'Atypical keratinized cytoplasmic elongation' },
    ],
    recommendation: 'Urgent emergency oncology referral to Kidwai Memorial Institute of Oncology / Regional Cancer Centre for clinical staging and biopsy.',
    cellImageUrl: '',
  },
  {
    id: 'rec-006',
    sampleId: 'CX-2026-1068',
    patientName: 'Manjit Kaur',
    age: 41,
    district: 'Ludhiana',
    state: 'Punjab',
    abhaId: '91-9182-3849-5012',
    screeningDate: '2026-09-01',
    subsidizedFeeInr: 150,
    normalFeeInr: 1200,
    isAyushmanCovered: true,
    hpvStatus: 'HPV Negative',
    predictedClass: 'NILM',
    classFullName: 'Negative for Intraepithelial Lesion or Malignancy',
    confidence: 0.96,
    calibratedConfidence: 0.94,
    temperatureScaleFactor: 1.35,
    uncertaintyScore: 0.07,
    referToDoctor: false,
    referralReason: 'Within autonomous negative classification limits.',
    urgencyLevel: 'Routine',
    status: 'Reviewed & Signed',
    cytopathologistSigned: true,
    signedBy: 'Dr. Ananya Sharma, MD Pathology',
    signedAt: '2026-09-01 14:10 IST',
    clinicalSummary: 'Adequate sample with endocervical transformation zone component present. Normal squamous and glandular elements observed with benign reactive reparative changes.',
    cellularMorphology: {
      nuclearEnlargement: 'Within normal limits',
      chromatinPattern: 'Finely stippled, regular',
      nuclearMembrane: 'Smooth, intact',
      ncRatio: 'Normal low ratio',
      cytoplasm: 'Abundant, cyanophilic',
    },
    attentionFocalPoints: [
      { label: 'Normal Squamous Epithelium', x: 50, y: 50, radius: 18, weight: 0.28, finding: 'Absence of dysplastic activation' },
    ],
    recommendation: 'Routine re-screening per national cervical screening guidelines at 3 years.',
    cellImageUrl: '',
  },
];

// Curated sample library for quick doctor demonstration
export const DEMO_PRESET_SAMPLES = [
  {
    id: 'demo-sample-1',
    name: 'Sample A: High-Grade Cervical Dysplasia (HSIL)',
    patientName: 'Anandi Bai',
    age: 46,
    district: 'Cuttack, Odisha',
    abhaId: '91-5829-3710-9941',
    class: 'HSIL' as const,
    classFullName: 'High-Grade Squamous Intraepithelial Lesion',
    confidence: 0.95,
    calibratedConfidence: 0.92,
    uncertaintyScore: 0.11,
    referToDoctor: true,
    urgencyLevel: 'Urgent' as const,
    clinicalNotes: 'Screened at District Sadar Hospital, Cuttack. Post-coital spotting for 3 months. HPV-16 DNA positive.',
    features: ['High N:C ratio (>0.75)', 'Coarse hyperchromasia', 'Jagged nuclear membranes', 'High Grad-CAM++ saliency'],
  },
  {
    id: 'demo-sample-2',
    name: 'Sample B: Borderline Atypia (ASC-US) - High Uncertainty',
    patientName: 'Rukmini Sharma',
    age: 34,
    district: 'Pune, Maharashtra',
    abhaId: '91-8291-4472-1084',
    class: 'ASC-US' as const,
    classFullName: 'Atypical Squamous Cells of Undetermined Significance',
    confidence: 0.67,
    calibratedConfidence: 0.61,
    uncertaintyScore: 0.39,
    referToDoctor: true,
    urgencyLevel: 'Moderate' as const,
    clinicalNotes: 'Primary Health Centre Shirur, Pune. Mild pelvic pain, chronic cervicitis history. Borderline nuclear size.',
    features: ['Nucleus 2.5x normal', 'Softmax entropy 0.39 (Flagged)', 'Selective prediction referral', 'Equivocal halo'],
  },
  {
    id: 'demo-sample-3',
    name: 'Sample C: Normal Cytology (NILM) - Confident Clear',
    patientName: 'Meera Deshmukh',
    age: 28,
    district: 'Ernakulam, Kerala',
    abhaId: '91-3482-1920-8472',
    class: 'NILM' as const,
    classFullName: 'Negative for Intraepithelial Lesion or Malignancy',
    confidence: 0.98,
    calibratedConfidence: 0.96,
    uncertaintyScore: 0.05,
    referToDoctor: false,
    urgencyLevel: 'Routine' as const,
    clinicalNotes: 'Routine community screening camp at Family Health Centre Aluva. Asymptomatic, HPV negative.',
    features: ['Normal small round nucleus', 'Preserved polygonal cytoplasm', 'Low saliency baseline', 'Clear autonomous safe triage'],
  },
  {
    id: 'demo-sample-4',
    name: 'Sample D: Low-Grade Dysplasia (LSIL) - Koilocytic Atypia',
    patientName: 'Deepa Sen',
    age: 39,
    district: 'Patna, Bihar',
    abhaId: '91-7294-8192-3840',
    class: 'LSIL' as const,
    classFullName: 'Low-Grade Squamous Intraepithelial Lesion',
    confidence: 0.91,
    calibratedConfidence: 0.88,
    uncertaintyScore: 0.15,
    referToDoctor: true,
    urgencyLevel: 'Moderate' as const,
    clinicalNotes: 'Nalanda Medical College & Hospital screening wing. Classic koilocytosis with raisinoid hyperchromatic nucleus.',
    features: ['Prominent perinuclear halo', 'Wrinkled nuclear contour', 'Calibrated confidence 88%', 'Colposcopy triage recommended'],
  },
];

// Impact Metrics: Before vs After AI-assisted Screening
export const IMPACT_METRICS = {
  workflowComparison: [
    {
      metric: 'Average Review Time per Slide',
      manual: '14.5 minutes',
      cerviXai: '1.8 minutes',
      improvement: '87% faster',
      description: 'AI automatically pre-localizes cellular regions of interest with Grad-CAM, cutting cytopathologist slide panning time drastically.',
    },
    {
      metric: 'High-Grade Lesion Sensitivity',
      manual: '74.2% (manual single review)',
      cerviXai: '97.8% (AI + selective doctor review)',
      improvement: '+23.6% gain',
      description: 'Multi-scale attention extracts both micro-chromatin texture and architectural patterns, catching subtle high-grade lesions missed under fatigue.',
    },
    {
      metric: 'Uncertainty Triage Efficiency',
      manual: 'Subjective referral variance (18-35%)',
      cerviXai: 'Objective temperature calibration (T=1.35)',
      improvement: 'Strict safety bounds',
      description: 'Selective prediction flags borderline cases based on entropy thresholding, eliminating inconsistent diagnostic hesitation.',
    },
    {
      metric: 'Turnaround Time in Rural PHCs',
      manual: '18 to 28 days (sample transit to city)',
      cerviXai: 'Under 15 minutes (point-of-care preview)',
      improvement: '98% backlog reduction',
      description: 'Enables immediate patient counseling before loss-to-follow-up at peripheral Indian health centers.',
    },
    {
      metric: 'Cost per Screened Subject',
      manual: '₹1,200 - ₹1,800 (Private Cytology Lab)',
      cerviXai: '₹150 (Ayushman Bharat PM-JAY package)',
      improvement: '88% cost savings',
      description: 'Democratizes high-throughput quality screening for socio-economically vulnerable women.',
    },
  ],
  illustrativeBenchmarks: [
    { model: 'Standard ResNet-50', accuracy: 84.6, sensitivity: 81.2, specificity: 87.0, calibratedEce: 0.142 },
    { model: 'Vision Transformer (ViT)', accuracy: 89.2, sensitivity: 86.8, specificity: 90.5, calibratedEce: 0.118 },
    { model: 'ConvNeXt-Base', accuracy: 90.8, sensitivity: 88.5, specificity: 92.1, calibratedEce: 0.098 },
    { model: 'CerviXAI (Multi-Scale Attention)', accuracy: 95.4, sensitivity: 97.8, specificity: 94.6, calibratedEce: 0.034 },
  ],
};
