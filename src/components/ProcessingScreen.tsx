import React, { useEffect, useState } from 'react';
import { 
  Cpu, 
  Layers, 
  Sparkles, 
  Activity, 
  ShieldAlert, 
  CheckCircle, 
  Terminal,
  FastForward
} from 'lucide-react';
import { UploadFormData } from './UploadScreen';

interface ProcessingScreenProps {
  formData: UploadFormData;
  onComplete: () => void;
}

interface PipelineStep {
  id: string;
  title: string;
  description: string;
  status: 'waiting' | 'running' | 'completed';
  latencyMs: number;
}

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({ formData, onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(10);
  const [logs, setLogs] = useState<string[]>([
    `[INFO] Initializing CerviXAI screening runtime v2.4...`,
    `[INFO] Ingesting specimen for ${formData.patientName} (${formData.age}y, ${formData.district})...`,
    `[INFO] Loading multi-scale attention module and backbone weights...`,
  ]);

  const steps: PipelineStep[] = [
    {
      id: 'step-1',
      title: 'Multi-Scale Feature Extraction',
      description: 'Extracting dual-resolution receptive fields to isolate both fine chromatin textures (0.5µm) and macro-architectural cell halos.',
      status: currentStepIndex > 0 ? 'completed' : currentStepIndex === 0 ? 'running' : 'waiting',
      latencyMs: 700,
    },
    {
      id: 'step-2',
      title: 'Deep Feature Encoding & Attention Pooling',
      description: 'Computing spatial self-attention weights over nuclear envelopes to distinguish intermediate squamous cells from dysplastic atypical clusters.',
      status: currentStepIndex > 1 ? 'completed' : currentStepIndex === 1 ? 'running' : 'waiting',
      latencyMs: 800,
    },
    {
      id: 'step-3',
      title: 'Grad-CAM++ Saliency Activation Mapping',
      description: 'Generating pixel-level gradient attribution heatmaps on penultimate convolutional layers to localize regions influencing classification.',
      status: currentStepIndex > 2 ? 'completed' : currentStepIndex === 2 ? 'running' : 'waiting',
      latencyMs: 750,
    },
    {
      id: 'step-4',
      title: 'Temperature Scaling Calibration (T=1.35)',
      description: 'Applying non-linear empirical temperature scaling to softmax logits to adjust overconfidence and establish true posterior probabilities.',
      status: currentStepIndex > 3 ? 'completed' : currentStepIndex === 3 ? 'running' : 'waiting',
      latencyMs: 650,
    },
    {
      id: 'step-5',
      title: 'Selective Prediction Uncertainty Gating',
      description: 'Evaluating softmax entropy against clinical referral boundary (threshold: 0.20) to determine if autonomous sign-off or doctor review is warranted.',
      status: currentStepIndex > 4 ? 'completed' : currentStepIndex === 4 ? 'running' : 'waiting',
      latencyMs: 600,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < steps.length - 1) {
          const next = prev + 1;
          setProgressPercent(Math.round(((next + 1) / steps.length) * 100));
          
          if (next === 1) {
            setLogs((l) => [
              ...l,
              `[TENSOR] Multi-scale pyramid constructed: 256x256 @ 40x, 128x128 @ 20x`,
              `[ATTENTION] Cross-scale spatial attention weights converged (sparsity: 0.72)`,
            ]);
          } else if (next === 2) {
            setLogs((l) => [
              ...l,
              `[GRAD-CAM++] Positive gradient matrices computed for Bethesda classes`,
              `[HEATMAP] High saliency focal zone mapped over atypical hyperchromatic nucleus`,
            ]);
          } else if (next === 3) {
            setLogs((l) => [
              ...l,
              `[CALIBRATION] Applying Temperature T=1.35 via validation Platt scaling`,
              `[ECE] Expected Calibration Error reduced from 11.4% to 2.8%`,
            ]);
          } else if (next === 4) {
            setLogs((l) => [
              ...l,
              `[SELECTIVE GATE] Uncertainty metric evaluated`,
              `[STATUS] Synthesis complete. Routing to Prediction + Heatmap inspector.`,
            ]);
          }
          return next;
        } else {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 500);
          return prev;
        }
      });
    }, 750);

    return () => clearInterval(timer);
  }, []);

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#B85C38] text-white shadow-xs animate-bounce">
          <Activity className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F3A3D]">
          Analyzing Cervical Cytology Slide
        </h2>
        <p className="text-xs sm:text-sm text-[#5B6B6F] max-w-lg mx-auto">
          Multi-Scale Attention Network running inference on sample for{' '}
          <span className="font-semibold text-[#2F3A3D]">{formData.patientName}</span> ({formData.district})
        </p>

        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto pt-3">
          <div className="flex justify-between text-xs font-mono text-[#5B6B6F] mb-1">
            <span>Pipeline Progress</span>
            <span className="font-bold text-[#B85C38]">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-[#DCD4C7] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#B85C38] transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pipeline Steps Cards */}
      <div className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#DCD4C7] pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5B6B6F]">
            Execution Pipeline Architecture
          </span>
          <button
            onClick={handleSkip}
            className="inline-flex items-center text-xs text-[#B85C38] hover:text-[#964726] font-medium"
          >
            <FastForward className="w-3.5 h-3.5 mr-1" />
            Fast-forward to results
          </button>
        </div>

        <div className="space-y-2.5">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className={`p-3 rounded-lg border transition-all flex items-start space-x-3 ${
                step.status === 'completed'
                  ? 'border-[#6B705C]/30 bg-[#6B705C]/10 text-[#2F3A3D]'
                  : step.status === 'running'
                  ? 'border-[#B85C38] bg-[#B85C38]/10 text-[#2F3A3D] shadow-xs ring-1 ring-[#B85C38]'
                  : 'border-[#DCD4C7]/60 bg-[#F5F0E8]/50 text-[#5B6B6F]'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {step.status === 'completed' ? (
                  <CheckCircle className="w-4 h-4 text-[#6B705C]" />
                ) : step.status === 'running' ? (
                  <span className="inline-block w-4 h-4 border-2 border-[#B85C38] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="inline-block w-4 h-4 rounded-full border border-[#5B6B6F]/40 text-[10px] text-center leading-3.5">
                    {idx + 1}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-semibold">{step.title}</h4>
                  <span className="text-[10px] font-mono text-[#5B6B6F]">
                    {step.status === 'completed' ? 'Done' : step.status === 'running' ? 'Active' : 'Queued'}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#5B6B6F] mt-0.5">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terminal Telemetry Log */}
      <div className="bg-[#2F3A3D] text-[#ECE4D6] rounded-xl p-4 shadow-sm font-mono text-xs overflow-hidden">
        <div className="flex items-center justify-between pb-2 border-b border-[#5B6B6F]/40 text-[#9DA8A8]">
          <div className="flex items-center space-x-2">
            <Terminal className="w-3.5 h-3.5 text-[#B85C38]" />
            <span>MultiScaleAttention.InferenceEngine [Live Telemetry]</span>
          </div>
          <span className="text-[10px]">Host: Edge AI Lab v2.4</span>
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
