import React, { useState } from 'react';
import { ScreeningRecord, ActiveScreen } from '../types';
import { 
  Eye, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  MessageSquareText, 
  Sliders, 
  Microscope,
  Info,
  Maximize2
} from 'lucide-react';
import { generateCellSvg } from '../data/mockData';

interface PredictionHeatmapScreenProps {
  record: ScreeningRecord;
  onNavigate: (screen: ActiveScreen) => void;
  onAskChatbot: (prompt: string) => void;
}

export const PredictionHeatmapScreen: React.FC<PredictionHeatmapScreenProps> = ({
  record,
  onNavigate,
  onAskChatbot,
}) => {
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(75);
  const [heatmapAlgorithm, setHeatmapAlgorithm] = useState<'Grad-CAM++' | 'Grad-CAM'>('Grad-CAM++');
  const [showFocalPoints, setShowFocalPoints] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeFocalPoint, setActiveFocalPoint] = useState<number | null>(null);

  const isHighRisk = record.predictedClass === 'HSIL' || record.predictedClass === 'SCC';
  const isUncertain = record.predictedClass === 'ASC-US' || record.uncertaintyScore > 0.20;

  // Render SVG slide based on class and heatmap overlay
  const baseSlideSvg = generateCellSvg(record.predictedClass, false);
  const heatSlideSvg = generateCellSvg(record.predictedClass, true);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Clinical Header */}
      <div className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-[#5B6B6F] uppercase tracking-wider">
              Sample ID: {record.sampleId}
            </span>
            <span className="text-[#DCD4C7]">•</span>
            <span className="text-xs text-[#5B6B6F]">
              {record.patientName} ({record.age}y), {record.district}, {record.state}
            </span>
          </div>
          <div className="mt-1 flex items-center space-x-3">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F3A3D]">
              Prediction & Visual Attribution
            </h2>
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
              isHighRisk
                ? 'bg-[#964726]/15 text-[#964726] border border-[#964726]/30'
                : isUncertain
                ? 'bg-[#D47B57]/15 text-[#D47B57] border border-[#D47B57]/30'
                : 'bg-[#6B705C]/15 text-[#535846] border border-[#6B705C]/30'
            }`}>
              {record.predictedClass} (TBS 2014)
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="heatmap-btn-uncertainty"
            onClick={() => onNavigate('uncertainty')}
            className={`inline-flex items-center px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors shadow-xs ${
              record.referToDoctor
                ? 'bg-[#F5F0E8] hover:bg-[#ECE4D6] text-[#B85C38] border border-[#B85C38]/30'
                : 'bg-[#ECE4D6] hover:bg-[#DCD4C7] text-[#2F3A3D]'
            }`}
          >
            <AlertTriangle className="w-4 h-4 mr-1.5" />
            <span>Triage ({record.referToDoctor ? 'REFERRAL' : 'CLEARED'})</span>
          </button>

          <button
            id="heatmap-btn-report"
            onClick={() => onNavigate('report')}
            className="inline-flex items-center px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium text-white bg-[#B85C38] hover:bg-[#964726] transition-colors shadow-xs"
          >
            <FileText className="w-4 h-4 mr-1.5" />
            <span>Generate Clinical Report</span>
          </button>
        </div>
      </div>

      {/* Main Dual Grid: Interactive Micrograph Stage & Clinical Diagnostic Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Grad-CAM Interactive Micrograph Viewer */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl p-4 shadow-xs">
            {/* Viewer Controls Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-[#DCD4C7]">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-[#5B6B6F] uppercase tracking-wider">
                  Attribution:
                </span>
                <div className="inline-flex rounded-md border border-[#DCD4C7] p-0.5 bg-[#F5F0E8]">
                  <button
                    type="button"
                    onClick={() => setHeatmapAlgorithm('Grad-CAM++')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      heatmapAlgorithm === 'Grad-CAM++'
                        ? 'bg-[#B85C38] text-white'
                        : 'text-[#2F3A3D] hover:text-[#B85C38]'
                    }`}
                  >
                    Grad-CAM++
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeatmapAlgorithm('Grad-CAM')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      heatmapAlgorithm === 'Grad-CAM'
                        ? 'bg-[#B85C38] text-white'
                        : 'text-[#2F3A3D] hover:text-[#B85C38]'
                    }`}
                  >
                    Grad-CAM
                  </button>
                </div>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))}
                  className="p-1.5 text-[#5B6B6F] hover:text-[#2F3A3D] bg-[#F5F0E8] border border-[#DCD4C7] rounded"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono text-[#5B6B6F] px-1">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(2.2, z + 0.2))}
                  className="p-1.5 text-[#5B6B6F] hover:text-[#2F3A3D] bg-[#F5F0E8] border border-[#DCD4C7] rounded"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="p-1.5 text-[#5B6B6F] hover:text-[#2F3A3D] bg-[#F5F0E8] border border-[#DCD4C7] rounded ml-1"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Micrograph Canvas with Grad-CAM Blending */}
            <div className="relative w-full aspect-square max-h-[460px] bg-[#EAE3D5] rounded-xl overflow-hidden border border-[#DCD4C7] shadow-inner flex items-center justify-center">
              <div
                className="w-full h-full relative transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                {/* Base Pap Smear Slide SVG */}
                <div
                  className="absolute inset-0 w-full h-full"
                  dangerouslySetInnerHTML={{ __html: baseSlideSvg }}
                />

                {/* Heatmap Saliency Layer with dynamic opacity */}
                <div
                  className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-150"
                  style={{ opacity: heatmapOpacity / 100 }}
                  dangerouslySetInnerHTML={{ __html: heatSlideSvg }}
                />

                {/* Multi-Scale Attention Focal Markers */}
                {showFocalPoints &&
                  record.attentionFocalPoints.map((point, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveFocalPoint(activeFocalPoint === idx ? null : idx)}
                      style={{ left: `${point.x}%`, top: `${point.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    >
                      <span className="relative flex h-6 w-6 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B85C38] opacity-75" />
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-[#B85C38] text-white text-[9px] font-bold items-center justify-center border-2 border-white shadow-xs">
                          {idx + 1}
                        </span>
                      </span>

                      {/* Tooltip on marker */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-7 hidden group-hover:block z-20 w-48 p-2 rounded bg-[#2F3A3D] text-[#ECE4D6] text-[11px] shadow-lg pointer-events-none">
                        <div className="font-bold text-white">{point.label}</div>
                        <div className="text-[10px] text-[#DCD4C7] mt-0.5">{point.finding}</div>
                        <div className="text-[9px] text-[#D47B57] mt-1 font-mono">
                          Activation Weight: {(point.weight * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Thermal Heatmap Gradient Legend Overlay */}
              <div className="absolute bottom-3 left-3 bg-[#2F3A3D]/90 backdrop-blur-xs text-white px-2.5 py-1.5 rounded-md text-[10px] flex items-center space-x-2 border border-white/20">
                <span>Attention:</span>
                <div className="w-20 h-2 rounded bg-gradient-to-r from-blue-500 via-yellow-400 via-orange-500 to-[#B85C38]" />
                <span className="font-mono">Low → High Saliency</span>
              </div>
            </div>

            {/* Opacity Slider Control */}
            <div className="mt-4 pt-3 border-t border-[#DCD4C7] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center space-x-3 flex-1">
                <Sliders className="w-4 h-4 text-[#5B6B6F] shrink-0" />
                <label className="text-xs font-semibold text-[#2F3A3D] whitespace-nowrap">
                  Heatmap Opacity: {heatmapOpacity}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={heatmapOpacity}
                  onChange={(e) => setHeatmapOpacity(parseInt(e.target.value))}
                  className="w-full accent-[#B85C38] cursor-pointer"
                />
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setShowFocalPoints(!showFocalPoints)}
                  className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                    showFocalPoints
                      ? 'bg-[#6B705C] text-white border-[#535846]'
                      : 'bg-[#F5F0E8] text-[#2F3A3D] border-[#DCD4C7]'
                  }`}
                >
                  {showFocalPoints ? 'Hide Focal Points' : 'Show Focal Points'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Clinical Diagnostic Findings & Multi-Scale Attention Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          {/* Predicted Classification Summary Card */}
          <div className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#DCD4C7] pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5B6B6F]">
                Model Classification
              </span>
              <span className="text-xs font-mono text-[#5B6B6F]">TBS 2014 Criteria</span>
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-serif font-bold text-[#2F3A3D]">
                {record.classFullName}
              </div>
              <div className="mt-1 flex items-center space-x-2">
                <span className="text-xs text-[#5B6B6F]">Prediction Confidence:</span>
                <span className="font-mono text-sm font-bold text-[#B85C38]">
                  {(record.confidence * 100).toFixed(1)}% (Raw)
                </span>
                <span className="text-[#DCD4C7]">→</span>
                <span className="font-mono text-sm font-bold text-[#6B705C]">
                  {(record.calibratedConfidence * 100).toFixed(1)}% (Calibrated)
                </span>
              </div>
            </div>

            {/* Clinical Summary Statement */}
            <div className="p-3 rounded-lg bg-[#F5F0E8] border border-[#DCD4C7] text-xs leading-relaxed text-[#2F3A3D]">
              <p className="font-semibold text-[#535846] mb-1 flex items-center">
                <Microscope className="w-3.5 h-3.5 mr-1 text-[#6B705C]" />
                Cytopathological Findings
              </p>
              {record.clinicalSummary}
            </div>

            {/* Cellular Morphology Checklist */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6B6F]">
                Morphological Alterations Evaluated:
              </span>
              <div className="grid grid-cols-1 gap-1 text-xs">
                <div className="flex justify-between py-1 border-b border-[#DCD4C7]/50">
                  <span className="text-[#5B6B6F]">Nuclear Size:</span>
                  <span className="font-medium text-[#2F3A3D] text-right">
                    {record.cellularMorphology.nuclearEnlargement}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#DCD4C7]/50">
                  <span className="text-[#5B6B6F]">Chromatin Texture:</span>
                  <span className="font-medium text-[#2F3A3D] text-right">
                    {record.cellularMorphology.chromatinPattern}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#DCD4C7]/50">
                  <span className="text-[#5B6B6F]">Nuclear Membrane:</span>
                  <span className="font-medium text-[#2F3A3D] text-right">
                    {record.cellularMorphology.nuclearMembrane}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#DCD4C7]/50">
                  <span className="text-[#5B6B6F]">N:C Ratio:</span>
                  <span className="font-medium text-[#2F3A3D] text-right">
                    {record.cellularMorphology.ncRatio}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Copilot Inquiry Chips */}
            <div className="pt-2 border-t border-[#DCD4C7]">
              <span className="text-[11px] font-medium text-[#5B6B6F] flex items-center mb-1.5">
                <MessageSquareText className="w-3 h-3 mr-1 text-[#B85C38]" />
                Ask CerviXAI Assistant about this slide:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => onAskChatbot(`Explain why the Grad-CAM++ hotspot focused on the nuclear envelope in this ${record.predictedClass} slide.`)}
                  className="px-2 py-1 rounded bg-[#F5F0E8] hover:bg-[#ECE4D6] border border-[#DCD4C7] text-[11px] text-[#2F3A3D] transition-colors text-left"
                >
                  Explain Grad-CAM hotspot
                </button>
                <button
                  type="button"
                  onClick={() => onAskChatbot(`Is selective prediction referral warranted for this ${record.predictedClass} case with entropy ${record.uncertaintyScore}?`)}
                  className="px-2 py-1 rounded bg-[#F5F0E8] hover:bg-[#ECE4D6] border border-[#DCD4C7] text-[11px] text-[#2F3A3D] transition-colors text-left"
                >
                  Verify referral threshold
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
