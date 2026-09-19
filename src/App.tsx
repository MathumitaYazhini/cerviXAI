import React, { useState, useEffect } from 'react';
import { ActiveScreen, ScreeningRecord, DoctorUser } from './types';
import { 
  getActiveDoctorSession, 
  saveActiveDoctorSession, 
  clearActiveDoctorSession, 
  getDoctorRecords, 
  saveDoctorRecords,
  DEMO_DOCTOR,
  generateNextCaseId 
} from './utils/authStorage';
import { generateCellSvg } from './data/mockData';
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
  // Session is restored if previously saved in localStorage
  const [activeDoctor, setActiveDoctor] = useState<DoctorUser | null>(() => {
    return getActiveDoctorSession();
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!getActiveDoctorSession();
  });

  // Default to 'login' screen on startup if not authenticated; 'dashboard' if already logged in
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>(() => {
    return getActiveDoctorSession() ? 'dashboard' : 'login';
  });

  // Doctor-isolated records stored in localStorage
  const [records, setRecords] = useState<ScreeningRecord[]>(() => {
    const session = getActiveDoctorSession();
    return session ? getDoctorRecords(session.id) : [];
  });

  const [selectedRecord, setSelectedRecord] = useState<ScreeningRecord | null>(() => {
    const session = getActiveDoctorSession();
    if (session) {
      const recs = getDoctorRecords(session.id);
      return recs[0] || null;
    }
    return null;
  });

  // Ensure records are synchronized with the active doctor account
  useEffect(() => {
    if (activeDoctor) {
      const docRecords = getDoctorRecords(activeDoctor.id);
      setRecords(docRecords);
      setSelectedRecord((prev) => {
        if (!prev && docRecords.length > 0) return docRecords[0];
        if (prev && docRecords.some((r) => r.id === prev.id || r.caseId === prev.caseId)) return prev;
        return docRecords[0] || null;
      });
    } else {
      setRecords([]);
      setSelectedRecord(null);
    }
  }, [activeDoctor?.id]);

  const [currentUploadData, setCurrentUploadData] = useState<UploadFormData | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialChatPrompt, setInitialChatPrompt] = useState<string>('');

  // Handle successful login or account registration
  const handleLoginSuccess = (doctor: DoctorUser, rememberMe: boolean) => {
    setActiveDoctor(doctor);
    setIsLoggedIn(true);
    saveActiveDoctorSession(doctor, rememberMe);

    // Retrieve records belonging specifically to this doctor
    const doctorRecords = getDoctorRecords(doctor.id);
    setRecords(doctorRecords);
    setSelectedRecord(doctorRecords[0] || null);

    // Open the personalized doctor dashboard
    setCurrentScreen('dashboard');
  };

  // Functional logout
  const handleLogout = () => {
    clearActiveDoctorSession();
    setActiveDoctor(null);
    setIsLoggedIn(false);
    setRecords([]);
    setSelectedRecord(null);
    setCurrentScreen('login');
  };

  const handleStartAnalysis = (data: UploadFormData) => {
    setCurrentUploadData(data);
    setCurrentScreen('processing');
  };

  const handleProcessingComplete = (pipelineRecord?: ScreeningRecord) => {
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
    let urgency: 'Urgent' | 'Moderate' | 'Routine' | 'Critical' = 'Urgent';
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

    const doctorOwnerId = activeDoctor?.id || DEMO_DOCTOR.id;
    const generatedCaseId = generateNextCaseId(doctorOwnerId);

    const newRecord: ScreeningRecord = {
      id: pipelineRecord?.id || `rec-${Date.now()}`,
      caseId: generatedCaseId,
      doctorId: doctorOwnerId,
      sampleId: generatedCaseId,
      patientName: currentUploadData.patientName.trim() || 'Screened Patient',
      age: patientAge,
      district: currentUploadData.district.trim() || 'General District',
      state: currentUploadData.state.trim() || 'National Health Mission',
      abhaId: currentUploadData.abhaId.trim() || `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      isAyushmanCovered: currentUploadData.isAyushmanCovered,
      subsidizedFeeInr: 150,
      screeningDate: new Date().toISOString().split('T')[0],
      cellImageUrl: pipelineRecord?.cellImageUrl || currentUploadData.imagePreview || ('data:image/svg+xml;utf8,' + encodeURIComponent(generateCellSvg(predClass, false))),
      heatmapImageUrl: pipelineRecord?.heatmapImageUrl || ('data:image/svg+xml;utf8,' + encodeURIComponent(generateCellSvg(predClass, true))),
      blendedHeatmapUrl: pipelineRecord?.blendedHeatmapUrl || pipelineRecord?.heatmapImageUrl || ('data:image/svg+xml;utf8,' + encodeURIComponent(generateCellSvg(predClass, true))),
      predictedClass: pipelineRecord?.predictedClass || predClass,
      classFullName: pipelineRecord?.classFullName || classFullName,
      confidence: pipelineRecord?.confidence ?? conf,
      calibratedConfidence: pipelineRecord?.calibratedConfidence ?? calConf,
      temperatureFactor: 1.35,
      uncertaintyScore: pipelineRecord?.uncertaintyScore ?? entropy,
      referToDoctor: pipelineRecord?.referToDoctor ?? refer,
      urgencyLevel: (pipelineRecord?.urgencyLevel as any) || urgency,
      referralReason: pipelineRecord?.referralReason || referralReason,
      clinicalSummary: pipelineRecord?.clinicalSummary || `Digital cytopathology evaluation reveals characteristic ${predClass} cellular morphology. Dual-scale attention highlights hyperchromatic nuclear atypia.`,
      cellularMorphology: pipelineRecord?.cellularMorphology || {
        nuclearEnlargement: predClass === 'NILM' ? 'Normal (~8µm)' : 'Enlarged 2.5-3x normal intermediate nucleus',
        chromatinPattern: predClass === 'NILM' ? 'Finely granular and evenly dispersed' : 'Coarse chromatin clumping with hyperchromasia',
        nuclearMembrane: predClass === 'NILM' ? 'Smooth, oval, uniform' : 'Irregular, notched, thickened contours',
        ncRatio: predClass === 'NILM' ? 'Normal low N:C ratio' : 'Significantly elevated N:C ratio',
        cytoplasm: 'Standard squamous differentiation',
      },
      attentionFocalPoints: (pipelineRecord?.attentionFocalPoints && pipelineRecord.attentionFocalPoints.length > 0)
        ? pipelineRecord.attentionFocalPoints
        : [
            { x: 50, y: 50, weight: 0.94, label: 'Primary Nuclear Focus', finding: 'Hyperchromatic atypical chromatin distribution' },
            { x: 42, y: 44, weight: 0.81, label: 'Nuclear Envelope', finding: 'Membrane contour irregularity and convolution' },
            { x: 58, y: 56, weight: 0.72, label: 'Perinuclear Zone', finding: 'Cytoplasmic clearing / halo interface' },
          ],
      supportedMorphologicalFindings: pipelineRecord?.supportedMorphologicalFindings,
      explainabilitySummary: pipelineRecord?.explainabilitySummary,
      recommendation: pipelineRecord?.recommendation || recommendation,
      status: 'Pending Cytopathologist Review',
      cytopathologistSigned: false,
      signedBy: undefined,
      signedAt: undefined,
    };

    setRecords((prev) => {
      const updated = [newRecord, ...prev];
      saveDoctorRecords(doctorOwnerId, updated);
      return updated;
    });

    setSelectedRecord(newRecord);
    // Mandatory workflow: Complete AI Analysis -> Review Prediction & Visual Attribution
    setCurrentScreen('prediction');
  };

  const handleSelectRecord = (record: ScreeningRecord) => {
    setSelectedRecord(record);
    setCurrentScreen('prediction');
  };

  const handleDeleteRecord = (recordId: string) => {
    const doctorOwnerId = activeDoctor?.id || DEMO_DOCTOR.id;
    setRecords((prev) => {
      const updated = prev.filter((r) => r.id !== recordId && r.caseId !== recordId);
      saveDoctorRecords(doctorOwnerId, updated);
      return updated;
    });

    setSelectedRecord((prev) => {
      if (prev && (prev.id === recordId || prev.caseId === recordId)) {
        return null;
      }
      return prev;
    });
  };

  const handleUpdateRecord = (updatedRecord: ScreeningRecord) => {
    const doctorOwnerId = activeDoctor?.id || DEMO_DOCTOR.id;
    setSelectedRecord(updatedRecord);
    setRecords((prev) => {
      const updated = prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r));
      saveDoctorRecords(doctorOwnerId, updated);
      return updated;
    });
  };

  const handleToggleSignRecord = () => {
    if (!selectedRecord) return;
    const isSigned = !selectedRecord.cytopathologistSigned;
    const doctorDisplayName = activeDoctor 
      ? `${activeDoctor.name}, ${activeDoctor.specialization}` 
      : 'Consultant Cytopathologist, MD';

    const updated: ScreeningRecord = {
      ...selectedRecord,
      cytopathologistSigned: isSigned,
      status: isSigned ? 'Reviewed & Signed' : 'Pending Cytopathologist Review',
      signedBy: isSigned ? doctorDisplayName : undefined,
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
        doctor={activeDoctor}
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
        isChatOpen={isChatOpen}
      />

      {/* Main Dynamic Viewport */}
      <main className="flex-1 print:p-0 print:m-0">
        {!isLoggedIn && (
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        )}

        {isLoggedIn && currentScreen === 'dashboard' && (
          <DashboardScreen
            records={records}
            onSelectRecord={handleSelectRecord}
            onNavigate={setCurrentScreen}
            doctor={activeDoctor}
            onDeleteRecord={handleDeleteRecord}
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
            doctor={activeDoctor}
          />
        )}

        {isLoggedIn && currentScreen === 'report' && selectedRecord && (
          <AnalysisReportScreen
            record={selectedRecord}
            onNavigate={setCurrentScreen}
            onToggleSignRecord={handleToggleSignRecord}
            doctor={activeDoctor}
          />
        )}

        {isLoggedIn && currentScreen === 'history' && (
          <HistoryScreen
            records={records}
            onSelectRecord={handleSelectRecord}
            onNavigate={setCurrentScreen}
            doctor={activeDoctor}
            onDeleteRecord={handleDeleteRecord}
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
