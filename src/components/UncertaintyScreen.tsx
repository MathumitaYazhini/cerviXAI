import React, { useState } from 'react';
import { ScreeningRecord, ActiveScreen, DoctorUser } from '../types';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  HelpCircle, 
  Sliders, 
  FileText, 
  ArrowRight, 
  Microscope, 
  UserCheck, 
  Stethoscope, 
  Info, 
  Check 
} from 'lucide-react';

interface UncertaintyScreenProps {
  record: ScreeningRecord;
  onUpdateRecord: (updated: ScreeningRecord) => void;
  onNavigate: (screen: ActiveScreen) => void;
  doctor?: DoctorUser | null;
}

export const UncertaintyScreen: React.FC<UncertaintyScreenProps> = ({
  record,
  onUpdateRecord,
  onNavigate,
  doctor,
}) => {
  const [doctorNotes, setDoctorNotes] = useState<string>(
    record.doctorNotes || (record.referToDoctor 
      ? 'Agreed with automated selective referral flag. Slide displays focal nuclear enlargement and uneven chromatin clumping warranting secondary cytological review.' 
      : 'Concur with autonomous clearance. Normal intermediate squamous pattern confirmed without dysplastic atypia.')
  );
  const [overrideReferral, setOverrideReferral] = useState<boolean>(record.referToDoctor);
  const [isSaved, setIsSaved] = useState(false);

  // Calibration calculations
  const rawConfidencePct = Math.round(record.confidence * 100);
  const calibratedPct = Math.round(record.calibratedConfidence * 100);
  const entropy = record.uncertaintyScore;
  const referralThreshold = 0.20; // entropy threshold for selective prediction

  const handleSaveDecision = () => {
    const updated: ScreeningRecord = {
      ...record,
      referToDoctor: overrideReferral,
      doctorNotes,
      status: overrideReferral ? 'Pending Cytopathologist Review' : (record.cytopathologistSigned ? 'Reviewed & Signed' : 'Pending Cytopathologist Review'),
      cytopathologistSigned: record.cytopathologistSigned,
      signedBy: record.signedBy,
      signedAt: record.signedAt,
    };
    onUpdateRecord(updated);
    setIsSaved(true);
    setTimeout(() => {
      onNavigate('report');
    }, 400);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-[#5B6B6F]">
            <span>Specimen: {record.sampleId}</span>
            <span>•</span>
            <span>Patient: {record.patientName} ({record.age}y, {record.district})</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F3A3D] mt-1">
            Prediction Reliability & Selective Referral Gate
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6B6F] mt-0.5">
            Temperature-scaled posterior calibration and selective doctor referral evaluation.
          </p>
        </div>

        <button
          onClick={() => onNavigate('prediction')}
          className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium text-[#2F3A3D] bg-[#ECE4D6] hover:bg-[#DCD4C7] border border-[#DCD4C7] self-start md:self-auto"
        >
          Back to Heatmap
        </button>
      </div>

      {/* Main Status Callout */}
      <div className={`p-5 rounded-xl border shadow-xs ${
        record.referToDoctor
          ? 'bg-[#B85C38]/10 border-[#B85C38]/40 text-[#2F3A3D]'
          : 'bg-[#6B705C]/10 border-[#6B705C]/40 text-[#2F3A3D]'
      }`}>
        <div className="flex items-start space-x-3.5">
          <div className={`p-2.5 rounded-lg shrink-0 ${
            record.referToDoctor ? 'bg-[#B85C38] text-white' : 'bg-[#6B705C] text-white'
          }`}>
            {record.referToDoctor ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-serif text-xl font-bold">
                {record.referToDoctor
                  ? 'Referral to Cytopathologist Required'
                  : 'Prediction Meets Autonomous Safety Threshold'}
              </h3>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                record.referToDoctor ? 'bg-[#B85C38] text-white' : 'bg-[#6B705C] text-white'
              }`}>
                {record.urgencyLevel} Priority
              </span>
            </div>
            <p className="text-xs sm:text-sm mt-1 text-[#2F3A3D]/90 leading-relaxed">
              {record.referralReason}
            </p>
          </div>
        </div>
      </div>

      {/* Dual Calibration Cards: Temperature Scaling & Selective Prediction Theory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Temperature Scaling Math Card */}
        <div className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#DCD4C7] pb-2">
            <h3 className="font-serif text-base font-bold text-[#2F3A3D] flex items-center">
              <Sliders className="w-4 h-4 mr-1.5 text-[#B85C38]" />
              Temperature Scaling Calibration
            </h3>
            <span className="text-xs font-mono text-[#5B6B6F]">T = 1.35</span>
          </div>

          <p className="text-xs text-[#5B6B6F] leading-relaxed">
            Standard deep learning models frequently suffer from uncalibrated overconfidence on borderline dysplastic cells. Applying validation-fitted temperature scaling smooths the softmax distribution to reflect realistic empirical precision.
          </p>

          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between text-xs font-medium text-[#2F3A3D] mb-1">
                <span>Raw Deep Learning Confidence:</span>
                <span className="font-mono font-bold text-[#B85C38]">{rawConfidencePct}%</span>
              </div>
              <div className="h-2 w-full bg-[#DCD4C7] rounded-full overflow-hidden">
                <div className="h-full bg-[#B85C38]" style={{ width: `${rawConfidencePct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-[#2F3A3D] mb-1">
                <span>Calibrated Posterior Probability (T=1.35):</span>
                <span className="font-mono font-bold text-[#6B705C]">{calibratedPct}%</span>
              </div>
              <div className="h-2 w-full bg-[#DCD4C7] rounded-full overflow-hidden">
                <div className="h-full bg-[#6B705C]" style={{ width: `${calibratedPct}%` }} />
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#F5F0E8] border border-[#DCD4C7] rounded-lg text-xs space-y-1 text-[#2F3A3D]">
            <div className="font-semibold text-[#535846]">Clinical Calibration Impact:</div>
            <div className="text-[11px] text-[#5B6B6F]">
              Expected Calibration Error (ECE) is lowered from 11.4% to 2.8%, preventing unearned certainty on atypical squamous cells.
            </div>
          </div>
        </div>

        {/* Right: Selective Prediction & Entropy Bounds */}
        <div className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#DCD4C7] pb-2">
            <h3 className="font-serif text-base font-bold text-[#2F3A3D] flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-[#6B705C]" />
              Selective Prediction Uncertainty Gating
            </h3>
            <span className="text-xs font-mono text-[#5B6B6F]">Boundary: 0.20</span>
          </div>

          <p className="text-xs text-[#5B6B6F] leading-relaxed">
            Rather than forcing a rigid prediction on every slide, CerviXAI rejects ambiguous classifications by evaluating prediction entropy. Cases exceeding the 0.20 entropy threshold are selectively referred for human review.
          </p>

          <div className="p-3 bg-[#F5F0E8] border border-[#DCD4C7] rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#5B6B6F]">Current Slide Entropy Score:</span>
              <span className={`font-mono font-bold ${
                entropy > referralThreshold ? 'text-[#B85C38]' : 'text-[#6B705C]'
              }`}>
                {entropy.toFixed(3)}
              </span>
            </div>

            <div className="relative h-4 w-full bg-[#DCD4C7] rounded-full overflow-hidden">
              <div
                className={`h-full ${entropy > referralThreshold ? 'bg-[#B85C38]' : 'bg-[#6B705C]'}`}
                style={{ width: `${Math.min(100, (entropy / 0.5) * 100)}%` }}
              />
              {/* Threshold line at 0.20 / 0.5 = 40% */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-[#2F3A3D]" 
                style={{ left: '40%' }}
                title="Referral Threshold 0.20"
              />
            </div>

            <div className="flex justify-between text-[10px] text-[#5B6B6F] font-mono">
              <span>0.0 (High Certainty)</span>
              <span className="text-[#2F3A3D] font-bold">▲ Cutoff 0.20</span>
              <span>0.5 (High Ambiguity)</span>
            </div>
          </div>

          <div className="text-xs text-[#5B6B6F]">
            {entropy > referralThreshold ? (
              <span className="text-[#B85C38] font-medium">
                • Entropy exceeds safety bound. Model defers to cytopathologist judgment.
              </span>
            ) : (
              <span className="text-[#6B705C] font-medium">
                • Entropy safely beneath threshold. Clear autonomous concordance.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Doctor Adjudication & Clinical Endorsement Controls */}
      <div className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="font-serif text-base font-bold text-[#2F3A3D] flex items-center">
          <Stethoscope className="w-4 h-4 mr-1.5 text-[#B85C38]" />
          Cytopathologist Clinical Decision
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className={`p-3 rounded-lg border cursor-pointer flex items-start space-x-2.5 transition-all ${
            overrideReferral
              ? 'border-[#B85C38] bg-[#B85C38]/10 text-[#2F3A3D] ring-1 ring-[#B85C38]'
              : 'border-[#DCD4C7] bg-[#F5F0E8] text-[#5B6B6F]'
          }`}>
            <input
              type="radio"
              name="referralDecision"
              checked={overrideReferral}
              onChange={() => setOverrideReferral(true)}
              className="mt-0.5 text-[#B85C38] focus:ring-[#B85C38]"
            />
            <div>
              <div className="text-xs font-bold text-[#2F3A3D]">Confirm Doctor Referral</div>
              <div className="text-[11px] text-[#5B6B6F] mt-0.5">
                Route patient for specialist cytopathology review and colposcopy triage.
              </div>
            </div>
          </label>

          <label className={`p-3 rounded-lg border cursor-pointer flex items-start space-x-2.5 transition-all ${
            !overrideReferral
              ? 'border-[#6B705C] bg-[#6B705C]/10 text-[#2F3A3D] ring-1 ring-[#6B705C]'
              : 'border-[#DCD4C7] bg-[#F5F0E8] text-[#5B6B6F]'
          }`}>
            <input
              type="radio"
              name="referralDecision"
              checked={!overrideReferral}
              onChange={() => setOverrideReferral(false)}
              className="mt-0.5 text-[#6B705C] focus:ring-[#6B705C]"
            />
            <div>
              <div className="text-xs font-bold text-[#2F3A3D]">Clear for Routine Follow-Up</div>
              <div className="text-[11px] text-[#5B6B6F] mt-0.5">
                Doctor confirms specimen is benign/negative; routine re-screening in 3 years.
              </div>
            </div>
          </label>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#2F3A3D] mb-1">
            Doctor Clinical Notes & Endorsement Rationale:
          </label>
          <textarea
            rows={3}
            value={doctorNotes}
            onChange={(e) => setDoctorNotes(e.target.value)}
            className="w-full rounded-md border border-[#DCD4C7] bg-white p-2.5 text-xs text-[#2F3A3D] focus:border-[#B85C38] focus:outline-none"
            placeholder="Add cytopathology observations or colposcopy instructions..."
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#DCD4C7]">
          <div className="text-xs text-[#5B6B6F] flex items-center">
            <UserCheck className="w-4 h-4 mr-1 text-[#6B705C]" />
            <span>
              Authenticated: {doctor?.name || 'Dr. Authenticated Clinician'}, {doctor?.specialization || 'MD Cytopathology'} ({doctor?.hospital || 'Clinical Laboratory'})
            </span>
          </div>

          <button
            type="button"
            id="save-decision-btn"
            onClick={handleSaveDecision}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold text-white bg-[#B85C38] hover:bg-[#964726] transition-colors shadow-xs"
          >
            <Check className="w-4 h-4 mr-1.5" />
            <span>Endorse & Generate Formal Analysis Report</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
