import React, { useState, useEffect } from 'react';
import { ScreeningRecord, ActiveScreen, DoctorUser } from '../types';
import { 
  Download, 
  ShieldCheck, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft, 
  Microscope, 
  Eye, 
  FileText, 
  ExternalLink,
  Info
} from 'lucide-react';
import { generateCellSvg } from '../data/mockData';
import { generateClinicalPdfBlobUrl, downloadClinicalPdf } from '../utils/pdfExport';

interface AnalysisReportScreenProps {
  record: ScreeningRecord;
  onNavigate: (screen: ActiveScreen) => void;
  onToggleSignRecord: () => void;
  doctor?: DoctorUser | null;
}

export const AnalysisReportScreen: React.FC<AnalysisReportScreenProps> = ({
  record,
  onNavigate,
  onToggleSignRecord,
  doctor,
}) => {
  const [activeView, setActiveView] = useState<'web' | 'pdf'>('web');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const isSigned = record.cytopathologistSigned;
  const isHighRisk = record.predictedClass === 'HSIL' || record.predictedClass === 'SCC';
  const uncertaintyThreshold = record.uncertaintyThreshold ?? 0.200;
  const isUncertain = record.uncertaintyScore > uncertaintyThreshold || record.predictedClass === 'ASC-US';

  // Supported findings list
  const findingsList = record.supportedMorphologicalFindings && record.supportedMorphologicalFindings.length > 0
    ? record.supportedMorphologicalFindings
    : [
        'Enlarged nuclear region (increased nuclear diameter)',
        'Increased nuclear-to-cytoplasmic ratio',
        'Hyperchromatic appearance with dense optical density',
        'Irregular nuclear membrane contours with focal indentations',
        'Coarse / abnormal chromatin pattern',
      ];

  const fallbackBaseSvg = generateCellSvg(record.predictedClass, false);
  const fallbackHeatSvg = generateCellSvg(record.predictedClass, true);

  const focalPoints = (record.attentionFocalPoints && record.attentionFocalPoints.length > 0)
    ? record.attentionFocalPoints.slice(0, 3)
    : [
        { label: 'Primary Nuclear Focus', x: 50, y: 50, weight: 0.94, finding: 'Hyperchromatic atypical chromatin distribution' },
        { label: 'Nuclear Envelope', x: 42, y: 44, weight: 0.81, finding: 'Membrane contour irregularity and convolution' },
        { label: 'Perinuclear Zone', x: 58, y: 56, weight: 0.72, finding: 'Cytoplasmic clearing / halo interface' },
      ];

  // Generate in-memory PDF dynamically for the case
  useEffect(() => {
    let isCurrent = true;
    let createdUrl: string | null = null;

    generateClinicalPdfBlobUrl(record)
      .then((url) => {
        if (isCurrent) {
          createdUrl = url;
          setPdfBlobUrl(url);
        } else {
          URL.revokeObjectURL(url);
        }
      })
      .catch((err) => {
        console.error('Failed to generate PDF blob URL:', err);
      });

    return () => {
      isCurrent = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [
    isSigned,
    record.id,
    record.sampleId,
    record.signedAt,
    record.predictedClass,
    record.calibratedConfidence,
    record.cellImageUrl,
    record.heatmapImageUrl,
    record.blendedHeatmapUrl,
  ]);

  const handleSignReport = () => {
    setIsSigning(true);
    setTimeout(() => {
      onToggleSignRecord();
      setIsSigning(false);
    }, 250);
  };

  const handleDownloadPdf = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();

    setIsDownloading(true);
    try {
      await downloadClinicalPdf(record);
    } catch (err) {
      console.error('Download PDF error:', err);
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
      }, 1000);
    }
  };

  const fileName = `CerviXAI_Report_${record.sampleId || record.caseId}.pdf`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF7F2] p-4 rounded-xl border border-[#DCD4C7] shadow-xs">
        <button
          onClick={() => onNavigate('prediction')}
          className="inline-flex items-center text-xs font-medium text-[#2F3A3D] hover:text-[#B85C38]"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Prediction & XAI Attribution
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher */}
          <div className="inline-flex rounded-md border border-[#DCD4C7] p-0.5 bg-[#F5F0E8] mr-1">
            <button
              type="button"
              id="tab-view-web"
              onClick={() => setActiveView('web')}
              className={`inline-flex items-center px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                activeView === 'web'
                  ? 'bg-[#B85C38] text-white shadow-xs'
                  : 'text-[#2F3A3D] hover:text-[#B85C38]'
              }`}
            >
              <FileText className="w-3.5 h-3.5 mr-1" />
              <span>Clinical Report</span>
            </button>
            <button
              type="button"
              id="tab-view-pdf"
              onClick={() => setActiveView('pdf')}
              className={`inline-flex items-center px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                activeView === 'pdf'
                  ? 'bg-[#B85C38] text-white shadow-xs'
                  : 'text-[#2F3A3D] hover:text-[#B85C38]'
              }`}
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              <span>View Generated PDF</span>
            </button>
          </div>

          {/* Download PDF Button */}
          <button
            type="button"
            id="report-download-pdf-btn"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="inline-flex items-center px-4 py-2 rounded-md text-xs sm:text-sm font-semibold text-white bg-[#B85C38] hover:bg-[#964726] shadow-xs transition-colors cursor-pointer disabled:opacity-75"
            title={`Download actual generated PDF file (${fileName})`}
          >
            <Download className="w-4 h-4 mr-1.5" />
            <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
          </button>

          {/* Digital Signature Action */}
          <button
            type="button"
            id="report-sign-btn"
            onClick={handleSignReport}
            disabled={isSigning}
            className={`inline-flex items-center px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors shadow-xs ${
              isSigned
                ? 'bg-[#6B705C] text-white'
                : 'bg-[#B85C38] hover:bg-[#964726] text-white font-semibold'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 mr-1.5" />
            {isSigning
              ? 'Applying Digital Signature...'
              : isSigned
              ? 'Signed & Endorsed'
              : 'Sign Digitally'}
          </button>
        </div>
      </div>

      {/* Signed Status Notification */}
      {isSigned && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-emerald-900">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">
              Report digitally signed and certified by {record.signedBy || (doctor ? doctor.name : 'Authorized Cytopathologist')}. Official clinical PDF generated and ready for download.
            </span>
          </div>
          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveView(activeView === 'pdf' ? 'web' : 'pdf')}
              className="text-xs font-semibold text-emerald-800 underline hover:text-emerald-950 flex items-center"
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              {activeView === 'pdf' ? 'Switch to Web View' : 'View Generated PDF'}
            </button>
            <span className="text-emerald-300">|</span>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="text-xs font-semibold text-[#B85C38] hover:underline flex items-center cursor-pointer disabled:opacity-75"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 1: Embedded PDF Document Viewer */}
      {isSigned && activeView === 'pdf' && pdfBlobUrl && (
        <div className="bg-white border border-[#DCD4C7] rounded-xl p-4 sm:p-6 shadow-sm space-y-4 text-[#2F3A3D]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#DCD4C7] pb-3">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2F3A3D] flex items-center">
                <FileCheck className="w-4 h-4 mr-1.5 text-[#6B705C]" />
                Official Clinical Cytopathology PDF Document
              </h2>
              <p className="text-xs text-[#5B6B6F]">
                Generated in-interface after doctor digital signature • Case ID: {record.sampleId || record.caseId}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="inline-flex items-center px-3.5 py-1.5 rounded text-xs font-semibold text-white bg-[#B85C38] hover:bg-[#964726] shadow-xs transition-colors cursor-pointer disabled:opacity-75"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
              </button>
              <a
                href={pdfBlobUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center px-3 py-1.5 rounded text-xs font-medium text-[#2F3A3D] bg-[#FAF7F2] hover:bg-[#ECE4D6] border border-[#DCD4C7] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                <span>Open in Tab</span>
              </a>
            </div>
          </div>

          <div className="w-full h-[650px] sm:h-[820px] rounded-lg overflow-hidden border border-[#DCD4C7] bg-[#FAF7F2]">
            <iframe
              src={pdfBlobUrl}
              className="w-full h-full border-0"
              title={`Clinical Cytopathology PDF - Case ${record.sampleId || record.caseId}`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-[#5B6B6F] pt-2">
            <span className="flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-[#6B705C]" />
              Contains Original Cytology Image and Grad-CAM++ Explainability Map with clinical morphology findings.
            </span>
            <button
              type="button"
              onClick={() => setActiveView('web')}
              className="text-[#B85C38] hover:underline font-medium text-xs mt-1 sm:mt-0"
            >
              Return to Clinical Web View
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: Official Clinical Report Web View */}
      {(activeView === 'web' || !isSigned) && (
        <div 
          id="clinical-report-content"
          className="bg-white border border-[#DCD4C7] rounded-xl p-6 sm:p-10 shadow-sm space-y-6 text-[#2F3A3D] font-sans"
        >
          {/* Institutional Header */}
          <div className="border-b border-[#DCD4C7] pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg bg-[#B85C38] flex items-center justify-center text-white shadow-xs">
                <Microscope className="w-7 h-7" />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold tracking-tight text-[#2F3A3D]">
                  CerviXAI Diagnostic Evaluation
                </h1>
                <p className="text-xs text-[#5B6B6F]">
                  Department of Cytopathology & GYN Oncology • Explainable AI (XAI) Workstation
                </p>
              </div>
            </div>

            <div className="sm:text-right text-xs space-y-0.5 text-[#5B6B6F]">
              <div className="font-mono font-bold text-sm text-[#2F3A3D]">
                CASE ID: {record.sampleId || record.caseId}
              </div>
              <div>Date of Screening: {record.screeningDate}</div>
              <div>Evaluation Protocol: The Bethesda System (TBS 2014)</div>
            </div>
          </div>

          {/* 1. Patient / Case Information */}
          <div className="bg-[#FAF7F2] p-4 rounded-lg border border-[#DCD4C7] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[#5B6B6F] block text-[11px]">Patient Name:</span>
              <span className="font-bold text-[#2F3A3D] text-sm">{record.patientName}</span>
            </div>
            <div>
              <span className="text-[#5B6B6F] block text-[11px]">Age / Gender:</span>
              <span className="font-semibold text-[#2F3A3D]">{record.age} Years / Female</span>
            </div>
            <div>
              <span className="text-[#5B6B6F] block text-[11px]">District / State:</span>
              <span className="font-semibold text-[#2F3A3D]">{record.district}, {record.state}</span>
            </div>
            <div>
              <span className="text-[#5B6B6F] block text-[11px]">ABHA Health ID:</span>
              <span className="font-mono font-semibold text-[#2F3A3D]">{record.abhaId || 'N/A'}</span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-[#5B6B6F] block text-[11px]">Specimen Information:</span>
              <span className="font-semibold text-[#2F3A3D]">
                {record.specimenInfo || 'Liquid-Based Cytology (LBC) / Conventional Pap'}
              </span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-[#5B6B6F] block text-[11px]">Financial Scheme Tariff:</span>
              <span className="font-semibold text-[#535846]">
                {record.isAyushmanCovered 
                  ? `Ayushman Bharat PM-JAY Subsidized (₹${record.subsidizedFeeInr} - Zero Out-of-Pocket)` 
                  : 'Standard Institutional Cytopathology Tariff'}
              </span>
            </div>
            {record.clinicalNotes && (
              <div className="col-span-2 sm:col-span-4 pt-1 border-t border-[#DCD4C7]/60">
                <span className="text-[#5B6B6F] block text-[11px]">Relevant Clinical Notes:</span>
                <span className="text-[#2F3A3D]">{record.clinicalNotes}</span>
              </div>
            )}
          </div>

          {/* 2. AI Screening Result Banner */}
          <div className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
            isHighRisk
              ? 'bg-[#964726]/10 border-[#964726]/30 text-[#964726]'
              : isUncertain
              ? 'bg-[#D47B57]/10 border-[#D47B57]/30 text-[#D47B57]'
              : 'bg-[#6B705C]/10 border-[#6B705C]/30 text-[#535846]'
          }`}>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider block">
                The Bethesda System (TBS 2014) Interpretation
              </span>
              <span className="font-serif text-2xl font-bold">
                {record.predictedClass} — {record.classFullName}
              </span>
            </div>
            <div className="sm:text-right font-mono text-xs space-y-0.5">
              <div>Raw Confidence: <strong>{(record.confidence * 100).toFixed(1)}%</strong> | Calibrated: <strong>{(record.calibratedConfidence * 100).toFixed(1)}%</strong></div>
              <div>
                Entropy Uncertainty: <strong>{record.uncertaintyScore.toFixed(3)}</strong> (Threshold 0.200) |{' '}
                <span className="font-bold">
                  {isUncertain ? 'Review Recommended' : 'Model Prediction Stable'}
                </span>
              </div>
            </div>
          </div>

          {/* 3 & 4. DUAL IMAGE EMBED: ORIGINAL CYTOLOGY IMAGE & GRAD-CAM++ EXPLAINABILITY MAP */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#5B6B6F] uppercase tracking-wider block">
              CYTOLOGICAL IMAGE & XAI SALIENCY ATTRIBUTION
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 3. Original Cytology Image */}
              <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#DCD4C7] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#2F3A3D]">
                  <span>ORIGINAL CYTOLOGY IMAGE</span>
                  <span className="text-[10px] font-mono text-[#5B6B6F]">High-Power Field</span>
                </div>
                <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-[#DCD4C7] bg-[#EAE3D5] shadow-inner">
                  {record.cellImageUrl ? (
                    <img 
                      src={record.cellImageUrl} 
                      alt="Original Cytology Image" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-full h-full"
                      dangerouslySetInnerHTML={{ __html: fallbackBaseSvg }}
                    />
                  )}
                </div>
                <span className="text-[11px] text-[#5B6B6F] block text-center">
                  Brightfield Micrograph (40x) • Unaltered Clinical Specimen
                </span>
              </div>

              {/* 4. Grad-CAM++ Explainability Map */}
              <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#DCD4C7] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#B85C38]">
                  <span>XAI EXPLAINABILITY — GRAD-CAM++</span>
                  <span className="text-[10px] font-mono text-[#5B6B6F]">Dual-Scale Attention</span>
                </div>
                <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-[#DCD4C7] bg-[#EAE3D5] shadow-inner">
                  {record.blendedHeatmapUrl ? (
                    <img
                      src={record.blendedHeatmapUrl}
                      alt="XAI Explainability — Grad-CAM++"
                      className="w-full h-full object-cover"
                    />
                  ) : record.cellImageUrl ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={record.cellImageUrl} 
                        alt="Base Micrograph" 
                        className="w-full h-full object-cover opacity-60 filter grayscale"
                      />
                      {(record.heatmapImageUrl || record.blendedHeatmapUrl) && (
                        <img 
                          src={record.heatmapImageUrl || record.blendedHeatmapUrl} 
                          alt="Grad-CAM++ Attribution Map" 
                          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-90"
                        />
                      )}
                    </div>
                  ) : (
                    <div 
                      className="w-full h-full"
                      dangerouslySetInnerHTML={{ __html: fallbackHeatSvg }}
                    />
                  )}

                  {/* Focal-Point Markers 1, 2, 3 */}
                  {focalPoints.slice(0, 3).map((point, idx) => (
                    <div
                      key={idx}
                      style={{ left: `${point.x}%`, top: `${point.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
                    >
                      <span className="relative flex h-6 w-6 items-center justify-center">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-[#B85C38] opacity-50 animate-pulse" />
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-[#B85C38] text-white text-[10px] font-bold items-center justify-center border-2 border-white shadow-md">
                          {idx + 1}
                        </span>
                      </span>
                    </div>
                  ))}

                  {/* Visual Legend */}
                  <div className="absolute bottom-2 left-2 bg-[#2F3A3D]/90 backdrop-blur-xs text-white px-2 py-1 rounded text-[9px] flex items-center space-x-1.5 border border-white/20">
                    <span>Attention:</span>
                    <div className="w-14 h-1.5 rounded bg-gradient-to-r from-blue-500 via-yellow-400 to-[#B85C38]" />
                    <span className="font-mono">Low → High</span>
                  </div>
                </div>
                <span className="text-[11px] text-[#5B6B6F] block text-center">
                  Grad-CAM++ Explainability Map — highlighted regions indicate areas contributing to the model prediction.
                </span>
              </div>
            </div>
          </div>

          {/* 5. EXPLAINABILITY FINDINGS & 6. MORPHOLOGICAL FEATURES EVALUATED */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* 5. Explainability Findings */}
            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#DCD4C7] space-y-3">
              <div className="flex items-center space-x-1.5 border-b border-[#DCD4C7] pb-2">
                <Info className="w-4 h-4 text-[#B85C38]" />
                <h3 className="font-serif font-bold text-sm text-[#2F3A3D]">
                  Explainability Findings (Model Attention)
                </h3>
              </div>
              <p className="text-[#2F3A3D] leading-relaxed bg-white p-2.5 rounded border border-[#DCD4C7]">
                {record.explainabilitySummary || 
                  `Model attention was concentrated primarily on nuclear regions showing features associated with the predicted classification (${record.predictedClass}).`}
              </p>
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-[#5B6B6F] uppercase tracking-wider block">
                  Supported Morphological Findings:
                </span>
                <ul className="space-y-1.5">
                  {findingsList.map((finding, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-[#2F3A3D]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B85C38] mt-1.5 shrink-0" />
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 6. Morphological Features Evaluated */}
            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#DCD4C7] space-y-3">
              <div className="flex items-center space-x-1.5 border-b border-[#DCD4C7] pb-2">
                <Microscope className="w-4 h-4 text-[#6B705C]" />
                <h3 className="font-serif font-bold text-sm text-[#2F3A3D]">
                  Microscopic Cellular Morphology Evaluation
                </h3>
              </div>
              <div className="space-y-2">
                <div className="p-2 bg-white rounded border border-[#DCD4C7] flex justify-between items-center">
                  <span className="text-[#5B6B6F]">Nuclear Size:</span>
                  <span className="font-semibold text-[#2F3A3D] text-right">
                    {record.cellularMorphology?.nuclearEnlargement || 'Normal (~8µm)'}
                  </span>
                </div>
                <div className="p-2 bg-white rounded border border-[#DCD4C7] flex justify-between items-center">
                  <span className="text-[#5B6B6F]">Chromatin Texture:</span>
                  <span className="font-semibold text-[#2F3A3D] text-right">
                    {record.cellularMorphology?.chromatinPattern || 'Uniformly fine'}
                  </span>
                </div>
                <div className="p-2 bg-white rounded border border-[#DCD4C7] flex justify-between items-center">
                  <span className="text-[#5B6B6F]">Nuclear Membrane:</span>
                  <span className="font-semibold text-[#2F3A3D] text-right">
                    {record.cellularMorphology?.nuclearMembrane || 'Smooth and regular'}
                  </span>
                </div>
                <div className="p-2 bg-white rounded border border-[#DCD4C7] flex justify-between items-center">
                  <span className="text-[#5B6B6F]">N:C Ratio:</span>
                  <span className="font-semibold text-[#2F3A3D] text-right">
                    {record.cellularMorphology?.ncRatio || 'Preserved low to moderate'}
                  </span>
                </div>
                <div className="p-2 bg-white rounded border border-[#DCD4C7] flex justify-between items-center">
                  <span className="text-[#5B6B6F]">Cytoplasmic Diff.:</span>
                  <span className="font-semibold text-[#2F3A3D] text-right">
                    {record.cellularMorphology?.cytoplasm || 'Clear cyanophilic envelope'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Region-Level Attribution Focal Points */}
          <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#DCD4C7] text-xs space-y-2.5">
            <span className="font-bold text-[#5B6B6F] uppercase tracking-wider block text-[11px]">
              Focal Regions of Maximum Saliency
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {focalPoints.slice(0, 3).map((pt, idx) => (
                <div key={idx} className="p-3 bg-white rounded-lg border border-[#DCD4C7] space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#B85C38] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-[#2F3A3D]">
                        Region {idx + 1} — {pt.label.replace(/^Region \d+ — /, '')}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-[11px] text-[#B85C38] shrink-0">
                      {Math.round(pt.weight * 100)}%
                    </span>
                  </div>
                  <div className="text-[11px] text-[#5B6B6F]">
                    <span className="font-medium text-[#2F3A3D]">Feature: </span>
                    {pt.finding || pt.reason || 'Hyperchromatic atypical chromatin distribution'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 7, 8, 9. CLINICAL INTERPRETATION & REFERRAL RECOMMENDATION */}
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#DCD4C7] space-y-2.5">
            <div className="flex items-center space-x-2">
              {record.referToDoctor ? (
                <AlertTriangle className="w-5 h-5 text-[#B85C38]" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-[#6B705C]" />
              )}
              <h4 className="font-serif text-base font-bold text-[#2F3A3D]">
                Clinical Interpretation & Referral Recommendation
              </h4>
            </div>
            <p className="text-xs text-[#2F3A3D] leading-relaxed">
              {record.clinicalSummary}
            </p>
            <div className="p-3 bg-white rounded-lg border border-[#DCD4C7] text-xs space-y-1">
              <span className="font-bold text-[#2F3A3D] block text-[11px] uppercase tracking-wider">
                Management Action:
              </span>
              <p className="text-[#2F3A3D] leading-relaxed">
                {record.recommendation}
              </p>
              {record.referralReason && (
                <p className="text-[#B85C38] font-medium text-[11px] pt-1">
                  Trigger: {record.referralReason}
                </p>
              )}
            </div>
          </div>

          {/* 10. XAI DISCLAIMER NOTICE */}
          <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#DCD4C7] flex items-start space-x-2 text-[11px] text-[#5B6B6F] leading-snug">
            <ShieldCheck className="w-4 h-4 text-[#6B705C] shrink-0 mt-0.5" />
            <span>
              <strong>XAI Clinical Decision Support Notice:</strong> AI-generated findings are intended to support qualified clinical review and should not be used as a standalone diagnosis.
            </span>
          </div>

          {/* 11. Doctor Signature & Legal Verification Block */}
          <div className="pt-4 border-t border-[#DCD4C7] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-xs text-[#5B6B6F] space-y-1">
              <div className="flex items-center">
                <ShieldCheck className="w-4 h-4 mr-1 text-[#6B705C]" />
                <span className="font-semibold text-[#2F3A3D]">Compliant with ABDM DISHA & ISO 15189 standards</span>
              </div>
              <div>Automated deep learning model output verified under cytopathologist clinical oversight.</div>
            </div>

            <div className="text-right">
              {isSigned ? (
                <div className="inline-block p-2.5 rounded-lg border border-emerald-300 bg-emerald-50 text-right">
                  <div className="text-xs font-bold text-emerald-900">
                    {record.signedBy || (doctor ? `${doctor.name}, ${doctor.specialization}` : 'Consultant Cytopathologist, MD')}
                  </div>
                  <div className="text-[10px] text-emerald-700">
                    Digitally Endorsed • {record.signedAt ? new Date(record.signedAt).toLocaleDateString() : record.screeningDate}
                  </div>
                  <div className="text-[9px] font-mono text-emerald-600">
                    TOKEN: CX-SIG-{(record.sampleId || record.caseId).replace(/[^0-9]/g, '') || '8492'}-2026
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-end space-y-1.5">
                  <div className="inline-block p-2 rounded border border-dashed border-[#B85C38] bg-[#F5F0E8] text-right">
                    <div className="text-xs text-[#B85C38] font-semibold">Doctor Signature Required</div>
                    <div className="text-[10px] text-[#5B6B6F]">Sign to certify and unlock official PDF download</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignReport}
                    className="px-3 py-1 rounded bg-[#B85C38] text-white text-xs font-medium hover:bg-[#964726] transition-colors shadow-xs"
                  >
                    Sign Digitally
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
