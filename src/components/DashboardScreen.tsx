import React from 'react';
import { ScreeningRecord, ActiveScreen } from '../types';
import { 
  UploadCloud, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ChevronRight, 
  Layers, 
  Microscope
} from 'lucide-react';

interface DashboardScreenProps {
  records: ScreeningRecord[];
  onSelectRecord: (record: ScreeningRecord) => void;
  onNavigate: (screen: ActiveScreen) => void;
  onQuickAnalyzeDemo?: (demoIndex: number) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  records,
  onSelectRecord,
  onNavigate,
}) => {
  // Statistics calculations
  const totalScreened = records.length;
  const referredCount = records.filter((r) => r.referToDoctor).length;
  const highGradeCount = records.filter((r) => r.predictedClass === 'HSIL' || r.predictedClass === 'SCC').length;
  const pendingReviewCount = records.filter((r) => !r.cytopathologistSigned && r.referToDoctor).length;
  const ayushmanCoveredCount = records.filter((r) => r.isAyushmanCovered).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner / Clinical Workspace Status */}
      <div className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F3A3D]">
                Cytopathology Screening Desk
              </h2>
            </div>
            <p className="mt-1 text-sm text-[#5B6B6F]">
              AI-assisted multi-scale Pap smear analysis with calibrated selective referral & Grad-CAM++ interpretability.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              id="dashboard-upload-slide-btn"
              onClick={() => onNavigate('upload')}
              className="inline-flex items-center px-4 py-2.5 rounded-md text-sm font-medium text-white bg-[#B85C38] hover:bg-[#964726] transition-colors shadow-xs"
            >
              <UploadCloud className="w-4 h-4 mr-2" />
              Upload Pap Smear Image
            </button>
            <button
              id="dashboard-view-history-btn"
              onClick={() => onNavigate('history')}
              className="inline-flex items-center px-3.5 py-2 rounded-md text-sm font-medium text-[#2F3A3D] bg-[#ECE4D6] hover:bg-[#DCD4C7] border border-[#DCD4C7] transition-colors"
            >
              <FileText className="w-4 h-4 mr-1.5 text-[#6B705C]" />
              Registry ({records.length})
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#5B6B6F] text-xs font-semibold uppercase tracking-wider">
            <span>Total Screened</span>
            <Layers className="w-4 h-4 text-[#6B705C]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-serif text-3xl font-bold text-[#2F3A3D]">{totalScreened}</span>
            <span className="text-xs font-medium text-[#6B705C]">100% TBS 2014</span>
          </div>
          <div className="mt-1 text-xs text-[#5B6B6F]">
            {ayushmanCoveredCount} screened under Ayushman Bharat (₹150 subsidy)
          </div>
        </div>

        <div className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#5B6B6F] text-xs font-semibold uppercase tracking-wider">
            <span>Referred to Doctor</span>
            <AlertTriangle className="w-4 h-4 text-[#B85C38]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-serif text-3xl font-bold text-[#B85C38]">{referredCount}</span>
            <span className="text-xs font-medium text-[#B85C38]">
              {totalScreened > 0 ? Math.round((referredCount / totalScreened) * 100) : 0}% of volume
            </span>
          </div>
          <div className="mt-1 text-xs text-[#5B6B6F]">
            Selective prediction gated for high certainty
          </div>
        </div>

        <div className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#5B6B6F] text-xs font-semibold uppercase tracking-wider">
            <span>High-Grade / SCC</span>
            <Microscope className="w-4 h-4 text-[#964726]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-serif text-3xl font-bold text-[#964726]">{highGradeCount}</span>
            <span className="text-xs font-medium text-[#964726] bg-[#964726]/10 px-1.5 py-0.5 rounded">
              Immediate Triage
            </span>
          </div>
          <div className="mt-1 text-xs text-[#5B6B6F]">
            Requires urgent colposcopy & punch biopsy
          </div>
        </div>

        <div className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#5B6B6F] text-xs font-semibold uppercase tracking-wider">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-[#6B705C]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-serif text-3xl font-bold text-[#2F3A3D]">{pendingReviewCount}</span>
            <span className="text-xs font-medium text-[#535846]">Awaiting Signature</span>
          </div>
          <div className="mt-1 text-xs text-[#5B6B6F]">
            Average review turnaround: 1.8 mins
          </div>
        </div>
      </div>

      {/* Recent Slide Screening List */}
      <div className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-[#DCD4C7] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#2F3A3D]">
              Recent Screening Log
            </h3>
            <p className="text-xs text-[#5B6B6F]">
              Direct access to slide records, Grad-CAM saliency heatmaps, and doctor referral reviews
            </p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="inline-flex items-center text-xs font-medium text-[#B85C38] hover:text-[#964726] self-start sm:self-auto"
          >
            Open Complete Registry
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#DCD4C7] text-left text-xs">
            <thead className="bg-[#ECE4D6]/60 text-[#5B6B6F] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Sample & Patient</th>
                <th className="py-3 px-4">District / State</th>
                <th className="py-3 px-4">Predicted Class</th>
                <th className="py-3 px-4">Confidence / Calib.</th>
                <th className="py-3 px-4">Triage Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCD4C7]/70 bg-[#FAF7F2]">
              {records.slice(0, 8).map((record) => {
                const isHighRisk = record.predictedClass === 'HSIL' || record.predictedClass === 'SCC';
                const isUncertain = record.predictedClass === 'ASC-US' || record.uncertaintyScore > 0.25;

                return (
                  <tr 
                    key={record.id} 
                    className="hover:bg-[#ECE4D6]/40 transition-colors cursor-pointer"
                    onClick={() => onSelectRecord(record)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#2F3A3D]">{record.patientName}</div>
                      <div className="text-[11px] text-[#5B6B6F] font-mono">{record.sampleId} • {record.age}y</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-[#2F3A3D]">{record.district}</div>
                      <div className="text-[11px] text-[#5B6B6F]">{record.state}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        isHighRisk 
                          ? 'bg-[#964726]/15 text-[#964726] border border-[#964726]/30'
                          : isUncertain
                          ? 'bg-[#D47B57]/15 text-[#D47B57] border border-[#D47B57]/30'
                          : 'bg-[#6B705C]/15 text-[#535846] border border-[#6B705C]/30'
                      }`}>
                        {record.predictedClass}
                      </span>
                      <div className="text-[10px] text-[#5B6B6F] mt-0.5 truncate max-w-[140px]">
                        {record.classFullName}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="text-[#2F3A3D] font-medium">
                        {Math.round(record.calibratedConfidence * 100)}%
                      </div>
                      <div className="text-[10px] text-[#5B6B6F]">
                        Entropy: {record.uncertaintyScore.toFixed(2)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {record.referToDoctor ? (
                        <span className="inline-flex items-center text-[#B85C38] font-medium text-[11px]">
                          <AlertTriangle className="w-3 h-3 mr-1 shrink-0" />
                          Refer to Doctor
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[#6B705C] font-medium text-[11px]">
                          <CheckCircle2 className="w-3 h-3 mr-1 shrink-0" />
                          Auto Cleared
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRecord(record);
                        }}
                        className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium text-[#B85C38] bg-[#B85C38]/10 hover:bg-[#B85C38]/20 transition-colors"
                      >
                        Inspect Slide
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
