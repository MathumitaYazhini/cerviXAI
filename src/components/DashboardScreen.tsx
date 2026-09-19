import React, { useState } from 'react';
import { ScreeningRecord, ActiveScreen, DoctorUser } from '../types';
import { getDoctorRecords } from '../utils/authStorage';
import { 
  UploadCloud, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ChevronRight, 
  Layers, 
  Microscope,
  Building2,
  UserCheck,
  Trash2,
  Calendar
} from 'lucide-react';

interface DashboardScreenProps {
  records: ScreeningRecord[];
  onSelectRecord: (record: ScreeningRecord) => void;
  onNavigate: (screen: ActiveScreen) => void;
  doctor?: DoctorUser | null;
  onQuickAnalyzeDemo?: (demoIndex: number) => void;
  onDeleteRecord?: (recordId: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  records,
  onSelectRecord,
  onNavigate,
  doctor,
  onDeleteRecord,
}) => {
  const [recordToDelete, setRecordToDelete] = useState<ScreeningRecord | null>(null);

  // Authenticated doctor's records with immediate fallback to localStorage
  const activeRecords = (records && records.length > 0)
    ? records
    : (doctor ? getDoctorRecords(doctor.id) : (records || []));

  // Dynamic statistics calculations strictly from authenticated doctor's records
  const totalScreened = activeRecords.length;
  const referredCount = activeRecords.filter((r) => r.referToDoctor).length;
  const highGradeCount = activeRecords.filter((r) => r.predictedClass === 'HSIL' || r.predictedClass === 'SCC').length;
  const pendingReviewCount = activeRecords.filter((r) => !r.cytopathologistSigned && r.referToDoctor).length;
  const ayushmanCoveredCount = activeRecords.filter((r) => r.isAyushmanCovered).length;

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
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#5B6B6F]">
              <span className="font-semibold text-[#2F3A3D] flex items-center">
                <UserCheck className="w-3.5 h-3.5 mr-1 text-[#6B705C]" />
                {doctor?.name || 'Dr. Authenticated Clinician'}
              </span>
              <span>•</span>
              <span className="flex items-center text-[#6B705C]">
                <Building2 className="w-3.5 h-3.5 mr-1 text-[#6B705C]" />
                {doctor?.hospital || 'Clinical Cytopathology Laboratory'}
              </span>
              <span>•</span>
              <span>TBS 2014 Multi-Scale Screening</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              id="dashboard-upload-slide-btn"
              onClick={() => onNavigate('upload')}
              className="inline-flex items-center px-4 py-2.5 rounded-md text-sm font-medium text-white bg-[#B85C38] hover:bg-[#964726] transition-colors shadow-xs cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 mr-2" />
              Upload Pap Smear Image
            </button>
            <button
              id="dashboard-view-history-btn"
              onClick={() => onNavigate('history')}
              className="inline-flex items-center px-3.5 py-2 rounded-md text-sm font-medium text-[#2F3A3D] bg-[#ECE4D6] hover:bg-[#DCD4C7] border border-[#DCD4C7] transition-colors cursor-pointer"
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

      {/* Recent History / Slide Screening List */}
      <div className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-[#DCD4C7] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#2F3A3D]">
              Recent History
            </h3>
            <p className="text-xs text-[#5B6B6F]">
              Patient analysis and screening records for {doctor?.name || 'the authenticated clinician'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="inline-flex items-center text-xs font-medium text-[#B85C38] hover:text-[#964726] self-start sm:self-auto cursor-pointer"
          >
            Open Complete Registry
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          {activeRecords.length === 0 ? (
            <div className="py-12 px-4 text-center bg-[#FAF7F2]">
              <div className="w-12 h-12 rounded-full bg-[#ECE4D6] text-[#5B6B6F] flex items-center justify-center mx-auto mb-3">
                <Microscope className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-base font-bold text-[#2F3A3D]">No recent analysis records</h4>
              <p className="text-xs text-[#5B6B6F] max-w-md mx-auto mt-1 leading-relaxed">
                Your recent screening history is empty. Upload a Pap smear slide image using the button above to initiate multi-scale attention inference and generate a new case.
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-[#DCD4C7] text-left text-xs">
              <thead className="bg-[#ECE4D6]/60 text-[#5B6B6F] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Patient & Case ID</th>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">AI Classification</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Referral & Review Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCD4C7]/70 bg-[#FAF7F2]">
                {activeRecords.slice(0, 8).map((record) => {
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
                        <div className="text-[11px] text-[#5B6B6F] font-mono">
                          <span className="text-[#B85C38] font-semibold">{record.caseId || record.sampleId}</span> • {record.age}y
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center text-xs text-[#2F3A3D] font-medium">
                          <Calendar className="w-3.5 h-3.5 mr-1 text-[#6B705C] shrink-0" />
                          {record.screeningDate}
                        </div>
                        <div className="text-[11px] text-[#5B6B6F]">{record.district}, {record.state}</div>
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
                        <div className="text-[10px] text-[#5B6B6F] mt-0.5 truncate max-w-[150px]">
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
                        <div>
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
                        </div>
                        <div className="text-[10px] text-[#5B6B6F] mt-0.5">
                          {record.cytopathologistSigned ? 'Reviewed & Signed' : 'Pending Review'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectRecord(record);
                            }}
                            className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold text-white bg-[#B85C38] hover:bg-[#964726] transition-colors cursor-pointer shadow-2xs"
                          >
                            View Case
                          </button>
                          <button
                            type="button"
                            title="Delete record"
                            aria-label="Delete analysis record"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRecordToDelete(record);
                            }}
                            className="p-1 rounded text-[#5B6B6F] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {recordToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
          onClick={() => setRecordToDelete(null)}
        >
          <div 
            className="w-full max-w-md bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl shadow-lg p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-lg font-bold text-[#2F3A3D]">
                  Delete this analysis record?
                </h3>
                <p className="text-sm text-[#5B6B6F] mt-1.5 leading-relaxed">
                  This will permanently remove this case from your history.
                </p>
                <div className="mt-3 p-2.5 rounded-md bg-white border border-[#DCD4C7] text-xs font-mono text-[#2F3A3D] flex items-center justify-between">
                  <span className="font-bold">{recordToDelete.sampleId}</span>
                  <span>{recordToDelete.patientName} ({recordToDelete.predictedClass})</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-[#DCD4C7]/60">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-[#2F3A3D] bg-[#ECE4D6] hover:bg-[#DCD4C7] rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (recordToDelete && onDeleteRecord) {
                    onDeleteRecord(recordToDelete.id);
                  }
                  setRecordToDelete(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors cursor-pointer shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
