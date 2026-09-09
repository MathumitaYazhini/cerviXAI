import React, { useState } from 'react';
import { ActiveScreen, ScreeningRecord } from './types';
import { INITIAL_SCREENING_RECORDS } from './data/mockData';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { UploadScreen, UploadFormData } from './components/UploadScreen';
import { ProcessingScreen } from './components/ProcessingScreen';
import { PredictionHeatmapScreen } from './components/PredictionHeatmapScreen';
import { UncertaintyScreen } from './components/UncertaintyScreen';
import { AnalysisReportScreen } from './components/AnalysisReportScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { NewsScreen } from './components/NewsScreen';
import { ChatbotDrawer } from './components/ChatbotDrawer';
import { ShieldCheck, Building2 } from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [doctorName, setDoctorName] = useState('Dr. Ananya Sharma, MD');
  const [doctorRole, setDoctorRole] = useState('Cytopathologist');
  // First page shown after login is Screen New Slide
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('upload');
  const [records, setRecords] = useState<ScreeningRecord[]>(INITIAL_SCREENING_RECORDS);
  const [selectedRecord, setSelectedRecord] = useState<ScreeningRecord>(INITIAL_SCREENING_RECORDS[0]);
  const [currentUploadData, setCurrentUploadData] = useState<UploadFormData | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialChatPrompt, setInitialChatPrompt] = useState<string>('');

  const handleLogin = (name: string, role: string) => {
    setDoctorName(name);
    setDoctorRole(role);
    setIsLoggedIn(true);
    // Mandatory flow: Login -> Screen New Slide
    setCurrentScreen('upload');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentScreen('login');
  };

  const handleStartAnalysis = (data: UploadFormData) => {
    setCurrentUploadData(data);
    setCurrentScreen('processing');
  };

  const handleProcessingComplete = () => {
    if (!currentUploadData) {
      setCurrentScreen('prediction');
      return;
    }

    // Determine predicted class based on preset or default
    const predClass = currentUploadData.presetClass || 'HSIL';
    let classFullName = 'High-Grade Squamous Intraepithelial Lesion';
    let conf = 0.94;
    let calConf = 0.89;
    let entropy = 0.08;
    let refer = true;
    let urgency: 'Urgent' | 'Routine' | 'Elective' = 'Urgent';
    let referralReason = 'High-grade dysplastic cellular pattern detected. High probability of HSIL requiring immediate colposcopy.';
    let recommendation = 'Urgent referral for colposcopy examination and directed cervical punch biopsy within 7-14 days.';

    if (predClass === 'NILM') {
      classFullName = 'Negative for Intraepithelial Lesion or Malignancy';
      conf = 0.97;
      calConf = 0.95;
      entropy = 0.04;
      refer = false;
      urgency = 'Routine';
      referralReason = 'Benign cellular changes with normal intermediate and superficial squamous cells. Meets autonomous clearance criteria.';
      recommendation = 'Routine cervical cancer screening repeat in 3 years as per national guidelines. Maintain routine wellness surveillance.';
    } else if (predClass === 'ASC-US') {
      classFullName = 'Atypical Squamous Cells of Undetermined Significance';
      conf = 0.74;
      calConf = 0.68;
      entropy = 0.38;
      refer = true;
      urgency = 'Routine';
      referralReason = 'Prediction entropy (0.38) exceeds safe autonomous clearance boundary (0.20). Slide exhibits ambiguous nuclear enlargement.';
      recommendation = 'Reflex colposcopy triage recommended; if negative, schedule repeat cytology in 12 months.';
    } else if (predClass === 'LSIL') {
      classFullName = 'Low-Grade Squamous Intraepithelial Lesion';
      conf = 0.88;
      calConf = 0.83;
      entropy = 0.17;
      refer = true;
      urgency = 'Routine';
      referralReason = 'Perinuclear cavitation and koilocytosis characteristic of transient low-grade dysplastic cytopathic effect.';
      recommendation = 'Colposcopy evaluation recommended, or repeat cytological evaluation at 6 months to evaluate spontaneous clearance.';
    }

    const patientAge = typeof currentUploadData.age === 'number' 
      ? currentUploadData.age 
      : parseInt(String(currentUploadData.age), 10) || 35;

    const newRecord: ScreeningRecord = {
      id: `rec-${Date.now()}`,
      sampleId: `CX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: currentUploadData.patientName.trim() || 'Screened Patient',
      age: patientAge,
      district: currentUploadData.district.trim() || 'General District',
      state: currentUploadData.state.trim() || 'National Health Mission',
      abhaId: currentUploadData.abhaId.trim() || `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      isAyushmanCovered: currentUploadData.isAyushmanCovered,
      subsidizedFeeInr: 150,
      screeningDate: new Date().toISOString().split('T')[0],
      cellImageUrl: currentUploadData.imagePreview || undefined,
      predictedClass: predClass,
      classFullName,
      confidence: conf,
      calibratedConfidence: calConf,
      temperatureFactor: 1.35,
      uncertaintyScore: entropy,
      referToDoctor: refer,
      urgencyLevel: urgency,
      referralReason,
      clinicalSummary: `Digital cytopathology evaluation reveals characteristic ${predClass} cellular morphology. Dual-scale attention highlights hyperchromatic nuclear atypia.`,
      cellularMorphology: {
        nuclearEnlargement: predClass === 'NILM' ? 'Normal (~8µm)' : 'Enlarged 2.5-3x normal intermediate nucleus',
        chromatinPattern: predClass === 'NILM' ? 'Finely granular and evenly dispersed' : 'Coarse chromatin clumping with hyperchromasia',
        nuclearMembrane: predClass === 'NILM' ? 'Smooth, oval, uniform' : 'Irregular, notched, thickened contours',
        ncRatio: predClass === 'NILM' ? 'Normal low N:C ratio' : 'Significantly elevated N:C ratio',
        cytoplasm: 'Standard squamous differentiation',
      },
      attentionFocalPoints: [
        { x: 50, y: 50, weight: 0.94, label: 'Primary Nuclear Focus', finding: 'Hyperchromatic atypical chromatin distribution' },
        { x: 42, y: 44, weight: 0.81, label: 'Nuclear Envelope', finding: 'Membrane contour irregularity and convolution' },
        { x: 58, y: 56, weight: 0.72, label: 'Perinuclear Zone', finding: 'Cytoplasmic clearing / Halo interface' },
      ],
      recommendation,
      status: 'Pending Cytopathologist Review',
      cytopathologistSigned: false,
      signedBy: undefined,
      signedAt: undefined,
    };

    setRecords((prev) => [newRecord, ...prev]);
    setSelectedRecord(newRecord);
    // Mandatory workflow: Complete AI Analysis -> Review Prediction & Visual Attribution
    setCurrentScreen('prediction');
  };

  const handleSelectRecord = (record: ScreeningRecord) => {
    setSelectedRecord(record);
    setCurrentScreen('prediction');
  };

  const handleUpdateRecord = (updatedRecord: ScreeningRecord) => {
    setSelectedRecord(updatedRecord);
    setRecords((prev) => prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r)));
  };

  const handleToggleSignRecord = () => {
    if (!selectedRecord) return;
    const isSigned = !selectedRecord.cytopathologistSigned;
    const updated: ScreeningRecord = {
      ...selectedRecord,
      cytopathologistSigned: isSigned,
      status: isSigned ? 'Reviewed & Signed' : 'Pending Cytopathologist Review',
      signedBy: isSigned ? doctorName : undefined,
      signedAt: isSigned ? new Date().toISOString() : undefined,
    };
    handleUpdateRecord(updated);
  };

  const handleAskChatbot = (promptText: string) => {
    setInitialChatPrompt(promptText);
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col text-[#2F3A3D] font-sans print:bg-white print:min-h-0 print:block print:p-0">
      {/* Header Navigation */}
      <Header
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
        isChatOpen={isChatOpen}
      />

      {/* Main Dynamic Viewport */}
      <main className="flex-1 print:p-0 print:m-0">
        {!isLoggedIn && (
          <LoginScreen onLogin={handleLogin} />
        )}

        {isLoggedIn && currentScreen === 'dashboard' && (
          <DashboardScreen
            records={records}
            onSelectRecord={handleSelectRecord}
            onNavigate={setCurrentScreen}
          />
        )}

        {isLoggedIn && currentScreen === 'upload' && (
          <UploadScreen
            onStartAnalysis={handleStartAnalysis}
            onCancel={() => setCurrentScreen('dashboard')}
          />
        )}

        {isLoggedIn && currentScreen === 'processing' && currentUploadData && (
          <ProcessingScreen
            formData={currentUploadData}
            onComplete={handleProcessingComplete}
          />
        )}

        {isLoggedIn && currentScreen === 'prediction' && selectedRecord && (
          <PredictionHeatmapScreen
            record={selectedRecord}
            onNavigate={setCurrentScreen}
            onAskChatbot={handleAskChatbot}
          />
        )}

        {isLoggedIn && currentScreen === 'uncertainty' && selectedRecord && (
          <UncertaintyScreen
            record={selectedRecord}
            onUpdateRecord={handleUpdateRecord}
            onNavigate={setCurrentScreen}
          />
        )}

        {isLoggedIn && currentScreen === 'report' && selectedRecord && (
          <AnalysisReportScreen
            record={selectedRecord}
            onNavigate={setCurrentScreen}
            onToggleSignRecord={handleToggleSignRecord}
          />
        )}

        {isLoggedIn && currentScreen === 'history' && (
          <HistoryScreen
            records={records}
            onSelectRecord={handleSelectRecord}
            onNavigate={setCurrentScreen}
          />
        )}

        {isLoggedIn && currentScreen === 'news' && (
          <NewsScreen onNavigate={setCurrentScreen} />
        )}
      </main>

      {/* Chatbot Copilot Drawer */}
      <ChatbotDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        activeRecord={selectedRecord}
        initialPrompt={initialChatPrompt}
        onClearInitialPrompt={() => setInitialChatPrompt('')}
      />

      {/* Institutional Clinical Footer */}
      <footer className="bg-[#FAF7F2] border-t border-[#DCD4C7] py-6 px-4 sm:px-6 lg:px-8 print:hidden text-xs text-[#5B6B6F]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-[#B85C38] text-white flex items-center justify-center font-serif font-bold text-xs">
              C
            </div>
            <div>
              <span className="font-serif font-bold text-[#2F3A3D]">CerviXAI Platform</span>
              <span className="mx-1.5">•</span>
              <span>Multi-Scale Attention Cervical Cytopathology</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-[#6B705C]" />
              The Bethesda System 2014 Standard
            </span>
            <span className="flex items-center">
              <Building2 className="w-3.5 h-3.5 mr-1 text-[#6B705C]" />
              Ayushman Bharat (ABDM) & DISHA Compliant
            </span>
            <span>Temperature Calibration T=1.35</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-[#DCD4C7]/60 text-[10px] text-[#5B6B6F]/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p>
            Clinical Decision Support System (CDSS) for medical research and verified cytopathological triage.
          </p>
          <p>
            Empowering tier-2/3 & rural screening programs to prevent cervical cancer deaths.
          </p>
        </div>
      </footer>
    </div>
  );
}
