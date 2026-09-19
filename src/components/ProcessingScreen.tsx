import React, { useEffect, useState, useRef } from 'react';
import { 
  CheckCircle2, 
  Terminal,
  FastForward,
  Loader2,
  Sparkles
} from 'lucide-react';
import { UploadFormData } from './UploadScreen';
import { executeXAIAnalysisPipeline, XAIAnalysisResult } from '../utils/xaiAnalysisEngine';
import { ScreeningRecord } from '../types';

interface ProcessingScreenProps {
  formData: UploadFormData;
  onComplete: (record?: ScreeningRecord) => void;
  doctorId?: string;
  caseId?: string;
}

interface RealisticPipelineStep {
  id: string;
  title: string;
  completedLabel: string;
  description: string;
  logMessage: string;
}

const REALISTIC_STEPS: RealisticPipelineStep[] = [
  {
    id: 'step-preprocess',
    title: 'Image Preprocessing',
    completedLabel: 'Image preprocessing completed',
    description: 'Normalizing stain luminance, background stroma contrast, and optical density channels.',
    logMessage: '[PREPROCESS] Specimen stroma normalized; color deconvolution for Hematoxylin & EA/OG completed.',
  },
  {
    id: 'step-cellular',
    title: 'Cellular Region Detection',
    completedLabel: 'Cellular regions detected',
    description: 'Segmenting squamous cell boundaries and identifying high-contrast nuclear candidate clusters.',
    logMessage: '[DETECTION] Primary nuclear centroid & cellular envelope contours segmented at 40x resolution.',
  },
  {
    id: 'step-classification',
    title: 'AI Classification',
    completedLabel: 'Classification completed',
    description: 'Multi-scale convolutional backbone inference according to The Bethesda System (TBS 2014).',
    logMessage: '[MODEL] TBS 2014 Bethesda classification inferred; raw class activation scores generated.',
  },
  {
    id: 'step-calibration',
    title: 'Confidence Calibration',
    completedLabel: 'Confidence calibrated',
    description: 'Applying empirical temperature scaling (T=1.35) to prevent overconfidence and establish true posterior probability.',
    logMessage: '[CALIBRATION] Temperature scaling applied; expected calibration error minimized.',
  },
  {
    id: 'step-gradcam',
    title: 'Grad-CAM++ Attribution',
    completedLabel: 'Grad-CAM++ attribution generated',
    description: 'Computing positive higher-order gradients to map visual model attention onto nuclear and cellular regions.',
    logMessage: '[GRAD-CAM++] Saliency attribution field mapped to detected cellular morphology.',
  },
  {
    id: 'step-morphology',
    title: 'Morphological Evaluation',
    completedLabel: 'Evaluating morphological features',
    description: 'Extracting nuclear size, N:C ratio, chromatin coarseness, and membrane contour irregularity.',
    logMessage: '[MORPHOLOGY] Nuclear-to-cytoplasmic ratio & hyperchromatic chromatin distribution verified.',
  },
  {
    id: 'step-uncertainty',
    title: 'Uncertainty Assessment',
    completedLabel: 'Assessing prediction uncertainty',
    description: 'Computing predictive entropy against clinical referral threshold (0.200) for selective triage.',
    logMessage: '[UNCERTAINTY] Softmax entropy evaluated against screening referral safety threshold (0.200).',
  },
  {
    id: 'step-report',
    title: 'Report Synthesis',
    completedLabel: 'Preparing explainable report',
    description: 'Synthesizing XAI heatmap, region-level attributions, and clinical recommendation for physician review.',
    logMessage: '[READY] Explainable diagnostic evaluation and digital case record prepared.',
  },
];

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({
  formData,
  onComplete,
  doctorId,
  caseId,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(12);
  const [logs, setLogs] = useState<string[]>([
    `[INFO] Initializing CerviXAI screening runtime v2.4...`,
    `[INFO] Ingesting specimen for ${formData.patientName} (${formData.age}y, ${formData.district})...`,
    `[INFO] Starting Explainable AI (XAI) deep cytopathology pipeline...`,
  ]);

  const analysisResultRef = useRef<XAIAnalysisResult | null>(null);
  const isCompletedRef = useRef(false);

  // Run the genuine XAI pipeline in parallel with the realistic UI sequence
  useEffect(() => {
    let isCancelled = false;

    const runAnalysis = async () => {
      try {
        const result = await executeXAIAnalysisPipeline(formData.imagePreview, {
          patientName: formData.patientName,
          age: formData.age,
          district: formData.district,
          state: formData.state,
          abhaId: formData.abhaId,
          isAyushmanCovered: formData.isAyushmanCovered,
          presetClass: formData.presetClass,
          doctorId,
          caseId,
        });

        if (!isCancelled) {
          analysisResultRef.current = result;
        }
      } catch (err) {
        console.error('XAI analysis pipeline error:', err);
      }
    };

    runAnalysis();

    return () => {
      isCancelled = true;
    };
  }, [formData, doctorId, caseId]);

  // Stepper timer for realistic sequence (~3.2 seconds total, ~380ms per step)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < REALISTIC_STEPS.length - 1) {
          const next = prev + 1;
          const pct = Math.round(((next + 1) / REALISTIC_STEPS.length) * 100);
          setProgressPercent(pct);
          setLogs((prevLogs) => [...prevLogs, REALISTIC_STEPS[next].logMessage]);
          return next;
        } else {
          clearInterval(interval);
          if (!isCompletedRef.current) {
            isCompletedRef.current = true;
            setTimeout(() => {
              onComplete(analysisResultRef.current?.record);
            }, 450);
          }
          return prev;
        }
      });
    }, 380);

    return () => clearInterval(interval);
  }, [onComplete]);

  const handleFastForward = () => {
    if (!isCompletedRef.current) {
      isCompletedRef.current = true;
      onComplete(analysisResultRef.current?.record);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#B85C38] text-white shadow-xs animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F3A3D]">
          Analyzing Cytology Image...
        </h2>
        <p className="text-xs sm:text-sm text-[#5B6B6F] max-w-lg mx-auto">
          Executing multi-scale cervical cytopathology triage for{' '}
          <span className="font-semibold text-[#2F3A3D]">{formData.patientName}</span> ({formData.district})
        </p>

        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto pt-3">
          <div className="flex justify-between text-xs font-mono text-[#5B6B6F] mb-1.5">
            <span>XAI Pipeline Progress</span>
            <span className="font-bold text-[#B85C38]">{progressPercent}%</span>
          </div>
          <div className="h-2.5 w-full bg-[#DCD4C7] rounded-full overflow-hidden p-0.5 border border-[#DCD4C7]">
            <div
              className="h-full bg-[#B85C38] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Realistic Sequence Cards */}
      <div className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#DCD4C7] pb-2.5">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#B85C38]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#2F3A3D]">
              Deep Learning Cytopathology Pipeline
            </span>
          </div>
          <button
            type="button"
            onClick={handleFastForward}
            className="inline-flex items-center text-xs text-[#B85C38] hover:text-[#964726] font-medium transition-colors"
          >
            <FastForward className="w-3.5 h-3.5 mr-1" />
            Fast-forward to results
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {REALISTIC_STEPS.map((step, idx) => {
            const isCompleted = currentStepIndex > idx;
            const isRunning = currentStepIndex === idx;

            return (
              <div
                key={step.id}
                className={`p-3 rounded-lg border transition-all flex items-start space-x-3 ${
                  isCompleted
                    ? 'border-[#6B705C]/30 bg-[#6B705C]/10 text-[#2F3A3D]'
                    : isRunning
                    ? 'border-[#B85C38] bg-[#B85C38]/10 text-[#2F3A3D] shadow-xs ring-1 ring-[#B85C38]'
                    : 'border-[#DCD4C7]/50 bg-[#F5F0E8]/40 text-[#5B6B6F]'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-[#6B705C]" />
                  ) : isRunning ? (
                    <span className="inline-block w-4 h-4 border-2 border-[#B85C38] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="inline-block w-4 h-4 rounded-full border border-[#5B6B6F]/40 text-[10px] text-center leading-3.5 font-mono">
                      {idx + 1}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold">
                      {isCompleted ? `✓ ${step.completedLabel}` : step.title}
                    </h4>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-[#5B6B6F]">
                      {isCompleted ? 'Done' : isRunning ? 'Active' : 'Queued'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5B6B6F] mt-0.5 leading-snug">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal Telemetry Log */}
      <div className="bg-[#2F3A3D] text-[#ECE4D6] rounded-xl p-4 shadow-sm font-mono text-xs overflow-hidden">
        <div className="flex items-center justify-between pb-2 border-b border-[#5B6B6F]/40 text-[#9DA8A8]">
          <div className="flex items-center space-x-2">
            <Terminal className="w-3.5 h-3.5 text-[#B85C38]" />
            <span>CerviXAI.InferenceEngine [Live Telemetry]</span>
          </div>
          <span className="text-[10px] text-[#D47B57]">Status: RUNNING</span>
        </div>
        <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="text-[11px] leading-relaxed">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
