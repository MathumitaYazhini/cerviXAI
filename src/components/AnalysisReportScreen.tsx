import React, { useState, useEffect } from 'react';
import { ScreeningRecord, ActiveScreen } from '../types';
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
  Lock,
  ExternalLink
} from 'lucide-react';
import { generateCellSvg } from '../data/mockData';
import { generateClinicalPdfBlobUrl, downloadClinicalPdf } from '../utils/pdfExport';

interface AnalysisReportScreenProps {
  record: ScreeningRecord;
  onNavigate: (screen: ActiveScreen) => void;
  onToggleSignRecord: () => void;
}

export const AnalysisReportScreen: React.FC<AnalysisReportScreenProps> = ({
  record,
  onNavigate,
  onToggleSignRecord,
}) => {
  const [activeView, setActiveView] = useState<'web' | 'pdf'>('web');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const isSigned = record.cytopathologistSigned;
  const isHighRisk = record.predictedClass === 'HSIL' || record.predictedClass === 'SCC';
  const isUncertain = record.predictedClass === 'ASC-US' || record.uncertaintyScore > 0.20;

  // Lifecycle rule: The PDF must NOT be generated before digital signing.
  // The PDF is generated in memory ONLY after successful digital signing.
  // The PDF must NOT automatically download to the user's device.
  useEffect(() => {
    let isCurrent = true;
    let createdUrl: string | null = null;

    if (isSigned) {
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
    } else {
      setPdfBlobUrl(null);
      if (activeView === 'pdf') {
        setActiveView('web');
      }
    }

    return () => {
      isCurrent = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [isSigned, record.id, record.signedAt, record.predictedClass, record.calibratedConfidence]);

  const handleSignReport = () => {
    setIsSigning(true);
    setTimeout(() => {
      onToggleSignRecord();
      setIsSigning(false);
    }, 250);
  };

  /**
   * Directly triggers the actual file download of the generated clinical PDF.
   * Does NOT open the browser print dialog.
   * Does NOT require manually selecting "Save as PDF".
   * Downloads the genuine binary PDF file to the user's disk.
   */
  const handleDownloadPdf = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!isSigned) return;

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

  const fileName = `CerviXAI_Report_${record.sampleId}.pdf`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF7F2] p-4 rounded-xl border border-[#DCD4C7] shadow-xs">
        <button
          onClick={() => onNavigate('prediction')}
          className="inline-flex items-center text-xs font-medium text-[#2F3A3D] hover:text-[#B85C38]"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Prediction & Visual Attribution
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher (Available once digitally signed and PDF is generated) */}
          {isSigned && (
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
          )}

          {/* REAL, WORKING DOWNLOAD PDF BUTTON:
              Triggers the verified binary PDF download with genuine cytology image and clinical layout.
          */}
          {isSigned ? (
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
          ) : (
            <div
              className="inline-flex items-center px-3 py-1.5 rounded-md text-xs text-[#5B6B6F] bg-[#ECE4D6]/60 border border-[#DCD4C7] cursor-not-allowed"
              title="The doctor must digitally sign the clinical report before PDF generation & download"
            >
              <Lock className="w-3.5 h-3.5 mr-1.5 text-[#5B6B6F]" />
              <span>Sign to Unlock PDF</span>
            </div>
          )}

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

      {/* Signing Status & Workflow Guidance Notice */}
      {!isSigned ? (
        <div className="p-4 bg-[#F5F0E8] border border-[#DCD4C7] rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-[#2F3A3D]">
          <div className="flex items-start space-x-2.5">
            <Lock className="w-4 h-4 text-[#B85C38] mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-[#2F3A3D]">
                Awaiting Doctor's Digital Signature
              </p>
              <p className="text-[11px] text-[#5B6B6F] mt-0.5">
                Review the clinical findings below. The official clinical PDF report will be generated and made available for viewing and download only after you digitally sign the report.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignReport}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded bg-[#B85C38] text-white text-xs font-semibold hover:bg-[#964726] transition-colors shrink-0 shadow-xs"
          >
            Sign Digitally Now
          </button>
        </div>
      ) : (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-emerald-900">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">
              Report digitally signed and certified by Dr. Ananya Sharma, MD. Official clinical PDF generated and ready for download.
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

      {/* VIEW 1: Embedded PDF Document Viewer inside the Report Interface */}
      {isSigned && activeView === 'pdf' && pdfBlobUrl && (
        <div className="bg-white border border-[#DCD4C7] rounded-xl p-4 sm:p-6 shadow-sm space-y-4 text-[#2F3A3D]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#DCD4C7] pb-3">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2F3A3D] flex items-center">
                <FileCheck className="w-4 h-4 mr-1.5 text-[#6B705C]" />
                Official Clinical Cytopathology PDF Document
              </h2>
              <p className="text-xs text-[#5B6B6F]">
                Generated in-interface after doctor digital signature • Sample: {record.sampleId}
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

          {/* In-interface Embedded PDF Viewer */}
          <div className="w-full h-[650px] sm:h-[820px] rounded-lg overflow-hidden border border-[#DCD4C7] bg-[#FAF7F2]">
            <iframe
              src={pdfBlobUrl}
              className="w-full h-full border-0"
              title={`Clinical Cytopathology PDF - Sample ${record.sampleId}`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-[#5B6B6F] pt-2">
            <span className="flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-[#6B705C]" />
              Preserves identical clinical report format, TBS 2014 diagnosis, Grad-CAM attribution, and digital signature.
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
          {/* Lab / Institutional Header */}
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
                  Department of Cytopathology & GYN Oncology Screening • ABDM DISHA Interoperable
                </p>
              </div>
            </div>

            <div className="sm:text-right text-xs space-y-0.5 text-[#5B6B6F]">
              <div className="font-mono font-bold text-sm text-[#2F3A3D]">
                REPORT REF: {record.sampleId}
              </div>
              <div>Date of Screening: {record.screeningDate}</div>
              <div>Evaluation Protocol: TBS 2014</div>
            </div>
          </div>

          {/* Patient Demographics & Health Profile Grid */}
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
              <span className="text-[#5B6B6F] block text-[11px]">Specimen Type:</span>
              <span className="font-semibold text-[#2F3A3D]">Liquid-Based Cytology (LBC) / Conventional Pap</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-[#5B6B6F] block text-[11px]">Financial Scheme Tariff:</span>
              <span className="font-semibold text-[#535846]">
                {record.isAyushmanCovered 
                  ? `Ayushman Bharat PM-JAY Subsidized (₹${record.subsidizedFeeInr} - Zero Out-of-Pocket)` 
                  : 'Standard Institutional Cytopathology Tariff'}
              </span>
            </div>
          </div>

          {/* Primary Diagnosis & Confidence Assessment Banner */}
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
            <div className="sm:text-right font-mono text-xs">
              <div>Calibrated Posterior Confidence: <strong>{(record.calibratedConfidence * 100).toFixed(1)}%</strong></div>
              <div>Entropy Uncertainty Score: <strong>{record.uncertaintyScore.toFixed(3)}</strong> (Decision Threshold 0.200)</div>
            </div>
          </div>

          {/* Explainable AI / Visual Attribution Micrograph & Cellular Morphology Criteria */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-4 flex flex-col items-center">
              <div 
                id="clinical-report-cell-image"
                className="w-48 h-48 sm:w-52 sm:h-52 relative rounded-lg overflow-hidden border border-[#DCD4C7] shadow-inner bg-[#EAE3D5]"
              >
                {record.cellImageUrl ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={record.cellImageUrl} 
                      alt="Analyzed Cytology Specimen" 
                      className="w-full h-full object-cover"
                    />
                    <div 
                      className="absolute inset-0 w-full h-full pointer-events-none opacity-85 mix-blend-multiply"
                      dangerouslySetInnerHTML={{ __html: generateCellSvg(record.predictedClass, true) }}
                    />
                  </div>
                ) : (
                  <div 
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{ __html: generateCellSvg(record.predictedClass, true) }}
                  />
                )}
              </div>
              <span className="text-[11px] text-[#5B6B6F] mt-2 text-center">
                Grad-CAM++ Saliency Attribution Overlay (Dual-Resolution ConvBackbone)
              </span>
            </div>

            <div className="md:col-span-8 space-y-3 text-xs">
              <h3 className="font-semibold text-sm text-[#2F3A3D] uppercase tracking-wider">
                Microscopic Cellular Morphology Evaluation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#2F3A3D]">
                <div className="p-2.5 rounded bg-[#FAF7F2] border border-[#DCD4C7]">
                  <span className="text-[#5B6B6F] block text-[11px]">Nuclear Enlargement:</span>
                  <span className="font-medium">{record.cellularMorphology?.nuclearEnlargement || 'Normal (~8µm)'}</span>
                </div>
                <div className="p-2.5 rounded bg-[#FAF7F2] border border-[#DCD4C7]">
                  <span className="text-[#5B6B6F] block text-[11px]">Chromatin Distribution:</span>
                  <span className="font-medium">{record.cellularMorphology?.chromatinPattern || 'Uniformly fine'}</span>
                </div>
                <div className="p-2.5 rounded bg-[#FAF7F2] border border-[#DCD4C7]">
                  <span className="text-[#5B6B6F] block text-[11px]">Nuclear Membrane:</span>
                  <span className="font-medium">{record.cellularMorphology?.nuclearMembrane || 'Smooth and regular'}</span>
                </div>
                <div className="p-2.5 rounded bg-[#FAF7F2] border border-[#DCD4C7]">
                  <span className="text-[#5B6B6F] block text-[11px]">N:C Ratio:</span>
                  <span className="font-medium">{record.cellularMorphology?.ncRatio || 'Low, abundant cytoplasm'}</span>
                </div>
              </div>
              <div className="p-2.5 rounded bg-[#FAF7F2] border border-[#DCD4C7]">
                <span className="text-[#5B6B6F] block text-[11px]">Cytoplasmic Differentiation:</span>
                <span className="font-medium">{record.cellularMorphology?.cytoplasm || 'Clear cyanophilic envelope'}</span>
              </div>
            </div>
          </div>

          {/* Explainability Focal Points */}
          {record.attentionFocalPoints && record.attentionFocalPoints.length > 0 && (
            <div className="bg-[#FAF7F2] p-3.5 rounded-lg border border-[#DCD4C7] text-xs space-y-1.5">
              <span className="font-semibold text-[#2F3A3D] uppercase tracking-wider block text-[11px]">
                Focal Regions of Maximum Saliency Attribution
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {record.attentionFocalPoints.slice(0, 3).map((pt, idx) => (
                  <div key={idx} className="p-2 bg-white rounded border border-[#DCD4C7]">
                    <div className="font-semibold text-[#B85C38]">
                      {pt.label} ({Math.round(pt.weight * 100)}% Focus)
                    </div>
                    <div className="text-[11px] text-[#5B6B6F] mt-0.5">
                      {pt.finding}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clinical Recommendation & Triage Decision */}
          <div className="p-4 rounded-lg bg-[#FAF7F2] border border-[#DCD4C7] space-y-2">
            <div className="flex items-center space-x-2">
              {record.referToDoctor ? (
                <AlertTriangle className="w-4 h-4 text-[#B85C38]" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-[#6B705C]" />
              )}
              <h4 className="font-serif text-sm font-bold text-[#2F3A3D]">
                Clinical Recommendation & Referral Decision
              </h4>
            </div>
            <p className="text-xs text-[#2F3A3D] leading-relaxed">
              {record.recommendation}
            </p>
            {record.referralReason && (
              <p className="text-xs text-[#B85C38] font-medium">
                Triage Trigger: {record.referralReason}
              </p>
            )}
          </div>

          {/* Doctor Signature & Legal Verification Block */}
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
                    {record.signedBy || 'Dr. Ananya Sharma, MD Pathology'}
                  </div>
                  <div className="text-[10px] text-emerald-700">
                    Digitally Endorsed • {record.signedAt ? new Date(record.signedAt).toLocaleDateString() : record.screeningDate}
                  </div>
                  <div className="text-[9px] font-mono text-emerald-600">
                    TOKEN: CX-SIG-{record.sampleId.replace(/[^0-9]/g, '') || '8492'}-2026
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-end space-y-1.5">
                  <div className="inline-block p-2 rounded border border-dashed border-[#B85C38] bg-[#F5F0E8] text-right">
                    <div className="text-xs text-[#B85C38] font-semibold">Doctor Signature Required</div>
                    <div className="text-[10px] text-[#5B6B6F]">Sign to certify and unlock PDF download</div>
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
