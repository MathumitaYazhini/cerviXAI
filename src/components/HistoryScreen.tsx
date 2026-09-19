import React, { useState } from 'react';
import { ScreeningRecord, ActiveScreen, BethesdaClass, DoctorUser } from '../types';
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  FileText, 
  Microscope,
  Calendar,
  MapPin,
  ShieldCheck,
  Building2,
  UserCheck,
  UploadCloud,
  Trash2
} from 'lucide-react';

interface HistoryScreenProps {
  records: ScreeningRecord[];
  onSelectRecord: (record: ScreeningRecord) => void;
  onNavigate: (screen: ActiveScreen) => void;
  doctor?: DoctorUser | null;
  onDeleteRecord?: (recordId: string) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  records,
  onSelectRecord,
  onNavigate,
  doctor,
  onDeleteRecord,
}) => {
  const [recordToDelete, setRecordToDelete] = useState<ScreeningRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Referred' | 'Cleared' | 'HighGrade' | 'Borderline'>('All');
  const [sortBy, setSortBy] = useState<'date' | 'confidence' | 'urgency'>('date');

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.sampleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.predictedClass.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'Referred') return rec.referToDoctor;
    if (filterType === 'Cleared') return !rec.referToDoctor;
    if (filterType === 'HighGrade') return rec.predictedClass === 'HSIL' || rec.predictedClass === 'SCC';
    if (filterType === 'Borderline') return rec.predictedClass === 'ASC-US';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Registry Header */}
      <div className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B85C38]" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2F3A3D]">
              Doctor Patient Registry
            </h2>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2.5 text-xs text-[#5B6B6F]">
            <span className="font-semibold text-[#2F3A3D] flex items-center">
              <UserCheck className="w-3.5 h-3.5 mr-1 text-[#6B705C]" />
              {doctor?.name || 'Dr. Authenticated Clinician'}
            </span>
            <span>•</span>
            <span className="flex items-center">
              <Building2 className="w-3.5 h-3.5 mr-1 text-[#6B705C]" />
              {doctor?.hospital || 'Clinical Cytopathology Laboratory'}
            </span>
            <span>•</span>
            <span>{records.length} {records.length === 1 ? 'case' : 'cases'} in workspace</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('upload')}
          className="inline-flex items-center self-start sm:self-auto px-3.5 py-2 rounded-md text-xs sm:text-sm font-semibold text-white bg-[#B85C38] hover:bg-[#964726] transition-colors shadow-xs cursor-pointer"
        >
          <UploadCloud className="w-4 h-4 mr-1.5" />
          Screen New Slide
        </button>
      </div>

      {/* Search, Filter & Action Bar */}
      <div className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6B6F]" />
            <input
              type="text"
              id="history-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Patient Name, District, Sample ID (e.g. CX-2026), or Class..."
              className="w-full pl-9 pr-4 py-2 rounded-md border border-[#DCD4C7] bg-white text-xs sm:text-sm text-[#2F3A3D] placeholder-[#5B6B6F]/60 focus:border-[#B85C38] focus:outline-none"
            />
          </div>

          <button
            id="history-screen-new-btn"
            onClick={() => onNavigate('upload')}
            className="inline-flex items-center px-4 py-2 rounded-md text-xs sm:text-sm font-semibold text-white bg-[#B85C38] hover:bg-[#964726] transition-colors shadow-xs shrink-0 self-start sm:self-auto"
          >
            <Microscope className="w-4 h-4 mr-1.5" />
            Screen New Specimen
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#DCD4C7]/60">
          {[
            { id: 'All', label: `All (${records.length})` },
            { id: 'Referred', label: `Referred (${records.filter((r) => r.referToDoctor).length})` },
            { id: 'Cleared', label: `Cleared (${records.filter((r) => !r.referToDoctor).length})` },
            { id: 'HighGrade', label: `High-Grade (${records.filter((r) => r.predictedClass === 'HSIL' || r.predictedClass === 'SCC').length})` },
            { id: 'Borderline', label: `ASC-US (${records.filter((r) => r.predictedClass === 'ASC-US').length})` },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterType(f.id as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filterType === f.id
                  ? 'bg-[#B85C38] text-white shadow-xs'
                  : 'bg-[#F5F0E8] text-[#2F3A3D] hover:bg-[#ECE4D6] border border-[#DCD4C7]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Registry Table List */}
      <div className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl overflow-hidden shadow-xs">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 rounded-full bg-[#ECE4D6] flex items-center justify-center mx-auto text-[#5B6B6F] mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-base font-bold text-[#2F3A3D]">No matching screening records</h3>
            <p className="text-xs text-[#5B6B6F] mt-1">
              Try adjusting your search criteria or filter tags.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterType('All');
              }}
              className="mt-3 px-3 py-1.5 bg-[#B85C38] text-white rounded text-xs font-medium"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#DCD4C7] text-left text-xs">
              <thead className="bg-[#ECE4D6]/70 text-[#5B6B6F] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Sample ID & Date</th>
                  <th className="py-3 px-4">Patient Demographics</th>
                  <th className="py-3 px-4">Bethesda Classification</th>
                  <th className="py-3 px-4">Calibrated Conf. / Entropy</th>
                  <th className="py-3 px-4">Doctor Referral Flag</th>
                  <th className="py-3 px-4">Review Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCD4C7]/60 bg-[#FAF7F2]">
                {filteredRecords.map((record) => {
                  const isHighRisk = record.predictedClass === 'HSIL' || record.predictedClass === 'SCC';
                  const isUncertain = record.predictedClass === 'ASC-US';

                  return (
                    <tr
                      key={record.id}
                      onClick={() => onSelectRecord(record)}
                      className="hover:bg-[#ECE4D6]/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-[#2F3A3D]">{record.sampleId}</div>
                        <div className="text-[11px] text-[#5B6B6F]">{record.screeningDate}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#2F3A3D]">{record.patientName}</div>
                        <div className="text-[11px] text-[#5B6B6F]">
                          {record.age}y • {record.district}, {record.state}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          isHighRisk
                            ? 'bg-[#964726]/15 text-[#964726] border border-[#964726]/30'
                            : isUncertain
                            ? 'bg-[#D47B57]/15 text-[#D47B57] border border-[#D47B57]/30'
                            : 'bg-[#6B705C]/15 text-[#535846] border border-[#6B705C]/30'
                        }`}>
                          {record.predictedClass}
                        </span>
                        <div className="text-[10px] text-[#5B6B6F] truncate max-w-[140px] mt-0.5">
                          {record.classFullName}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="text-[#2F3A3D] font-medium">
                          {(record.calibratedConfidence * 100).toFixed(1)}%
                        </div>
                        <div className="text-[10px] text-[#5B6B6F]">
                          H: {record.uncertaintyScore.toFixed(3)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {record.referToDoctor ? (
                          <span className="inline-flex items-center text-[#B85C38] font-semibold text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5 mr-1 shrink-0" />
                            Doctor Referral
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[#6B705C] font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 shrink-0" />
                            Auto Cleared
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                          record.cytopathologistSigned
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {record.cytopathologistSigned ? 'Signed & Endorsed' : 'Awaiting Sign-off'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectRecord(record);
                            }}
                            className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium text-[#B85C38] bg-[#B85C38]/10 hover:bg-[#B85C38]/20 transition-colors cursor-pointer"
                          >
                            View Case
                            <ChevronRight className="w-3 h-3 ml-0.5" />
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
          </div>
        )}
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
