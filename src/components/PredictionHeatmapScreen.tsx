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
  ShieldCheck,
  SplitSquareVertical,
  Crosshair
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
  const [isHeatmapVisible, setIsHeatmapVisible] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'overlay' | 'original' | 'heatmapOnly' | 'split'>('overlay');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeFocalPoint, setActiveFocalPoint] = useState<number | null>(null);

  const isHighRisk = record.predictedClass === 'HSIL' || record.predictedClass === 'SCC';
  const uncertaintyThreshold = record.uncertaintyThreshold ?? 0.200;
  const isUncertain = record.uncertaintyScore > uncertaintyThreshold || record.predictedClass === 'ASC-US';

  // Heatmap source URLs (either genuine image-extracted PNGs or SVG fallbacks)
  const currentHeatmapUrl = heatmapAlgorithm === 'Grad-CAM++'
    ? (record.heatmapImageUrl || record.blendedHeatmapUrl)
    : (record.gradCamComparisonUrl || record.heatmapImageUrl);

  const fallbackBaseSvg = generateCellSvg(record.predictedClass, false);
  const fallbackHeatSvg = generateCellSvg(record.predictedClass, true);

  // Supported morphological findings for the XAI Explanation
  const findingsList = record.supportedMorphologicalFindings && record.supportedMorphologicalFindings.length > 0
    ? record.supportedMorphologicalFindings
    : [
        'Enlarged nuclear region (increased nuclear diameter)',
        'Increased nuclear-to-cytoplasmic ratio',
        'Hyperchromatic appearance with dense optical density',
        'Irregular nuclear membrane contours with focal indentations',
        'Coarse / abnormal chromatin clumping pattern',
      ];

  // Region focal points with explanations
  const focalPoints = record.attentionFocalPoints && record.attentionFocalPoints.length > 0
    ? record.attentionFocalPoints
    : [
        {
          label: 'Region 1 — Primary Nuclear Core',
          x: 50,
          y: 50,
          weight: 0.94,
          saliencyLevel: 'High saliency' as const,
          morphologicalFeature: 'Nuclear morphology',
          finding: 'Marked hyperchromasia and nuclear enlargement',
          reason: 'Nuclear morphology contributed strongly to classification.',
        },
        {
          label: 'Region 2 — Nuclear Envelope Contour',
          x: 44,
          y: 45,
          weight: 0.81,
          saliencyLevel: 'High saliency' as const,
          morphologicalFeature: 'Nuclear membrane irregularity',
          finding: 'Thickened, convoluted nuclear membrane contours',
          reason: 'Irregular cellular morphology and envelope thickening contributed to the prediction.',
        },
        {
          label: 'Region 3 — Perinuclear / N:C Interface',
          x: 56,
          y: 56,
          weight: 0.72,
          saliencyLevel: 'Moderate saliency' as const,
          morphologicalFeature: 'N:C ratio',
          finding: 'Altered nuclear-to-cytoplasmic boundary ratio',
          reason: 'Increased nuclear-to-cytoplasmic characteristics contributed to the prediction.',
        },
      ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Clinical Header Banner */}
      <div className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-[#5B6B6F] uppercase tracking-wider font-semibold">
              Case ID: {record.sampleId || record.caseId}
            </span>
            <span className="text-[#DCD4C7]">•</span>
            <span className="text-xs text-[#5B6B6F]">
              {record.patientName} ({record.age}y), {record.district}, {record.state}
            </span>
            {record.isAyushmanCovered && (
              <>
                <span className="text-[#DCD4C7]">•</span>
                <span className="text-[11px] font-bold text-[#535846] bg-[#6B705C]/15 px-2 py-0.5 rounded">
                  PM-JAY Subsidized
                </span>
              </>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F3A3D]">
              XAI Cytopathology Evaluation
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
            type="button"
            id="heatmap-btn-report"
            onClick={() => onNavigate('report')}
            className="inline-flex items-center px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium text-white bg-[#B85C38] hover:bg-[#964726] transition-colors shadow-xs cursor-pointer"
          >
            <FileText className="w-4 h-4 mr-1.5" />
            <span>Generate Clinical Report</span>
          </button>
        </div>
      </div>

      {/* Main Dual Grid: Micrograph Stage & Model Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Interactive Micrograph Stage + XAI Explanations */}
        <div className="lg:col-span-7 space-y-5">
          {/* Micrograph Card */}
          <div className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl p-4 shadow-xs space-y-3">
            {/* Viewer Controls Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#DCD4C7]">
              {/* Attribution Algorithm Toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-[#5B6B6F] uppercase tracking-wider">
                  Attribution:
                </span>
                <div className="inline-flex rounded-md border border-[#DCD4C7] p-0.5 bg-[#F5F0E8]">
                  <button
                    type="button"
                    onClick={() => setHeatmapAlgorithm('Grad-CAM++')}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      heatmapAlgorithm === 'Grad-CAM++'
                        ? 'bg-[#B85C38] text-white shadow-xs'
                        : 'text-[#2F3A3D] hover:text-[#B85C38]'
                    }`}
                  >
                    Grad-CAM++
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeatmapAlgorithm('Grad-CAM')}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      heatmapAlgorithm === 'Grad-CAM'
                        ? 'bg-[#B85C38] text-white shadow-xs'
                        : 'text-[#2F3A3D] hover:text-[#B85C38]'
                    }`}
                  >
                    Grad-CAM
                  </button>
                </div>
              </div>

              {/* View Mode Selector */}
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('overlay');
                    setIsHeatmapVisible(true);
                  }}
                  className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                    viewMode === 'overlay' && isHeatmapVisible
                      ? 'bg-[#2F3A3D] text-white border-[#2F3A3D]'
                      : 'bg-[#F5F0E8] text-[#5B6B6F] border-[#DCD4C7] hover:text-[#2F3A3D]'
                  }`}
                  title="Blended Heatmap Overlay"
                >
                  Overlay
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('original');
                    setIsHeatmapVisible(false);
                  }}
                  className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                    viewMode === 'original' || !isHeatmapVisible
                      ? 'bg-[#2F3A3D] text-white border-[#2F3A3D]'
                      : 'bg-[#F5F0E8] text-[#5B6B6F] border-[#DCD4C7] hover:text-[#2F3A3D]'
                  }`}
                  title="Original Cytology Image Only"
                >
                  Original Image
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('split');
                    setIsHeatmapVisible(true);
                  }}
                  className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                    viewMode === 'split'
                      ? 'bg-[#2F3A3D] text-white border-[#2F3A3D]'
                      : 'bg-[#F5F0E8] text-[#5B6B6F] border-[#DCD4C7] hover:text-[#2F3A3D]'
                  }`}
                  title="Side-by-Side Dual View"
                >
                  Side-by-Side
                </button>
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
                <span className="text-xs font-mono text-[#5B6B6F] px-1 min-w-[42px] text-center">
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
                  className="p-1.5 text-[#5B6B6F] hover:text-[#2F3A3D] bg-[#F5F0E8] border border-[#DCD4C7] rounded"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Stage: View Mode Handling */}
            {viewMode === 'split' ? (
              /* Side-by-Side Dual Stage */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Original Cytology Image */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#5B6B6F] uppercase tracking-wider px-1">
                    <span>Original Cytology Specimen</span>
                    <span className="font-mono text-[10px]">Brightfield / Pap Stain</span>
                  </div>
                  <div className="relative aspect-square bg-[#EAE3D5] rounded-xl overflow-hidden border border-[#DCD4C7] shadow-inner">
                    {record.cellImageUrl ? (
                      <img 
                        src={record.cellImageUrl} 
                        alt="Original Cytology Specimen" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div 
                        className="w-full h-full"
                        dangerouslySetInnerHTML={{ __html: fallbackBaseSvg }}
                      />
                    )}
                  </div>
                </div>

                {/* 2. Grad-CAM++ Attribution Map */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#B85C38] uppercase tracking-wider px-1">
                    <span>{heatmapAlgorithm} Attribution Map</span>
                    <span className="font-mono text-[10px]">Dual-Scale Attention</span>
                  </div>
                  <div className="relative aspect-square bg-[#EAE3D5] rounded-xl overflow-hidden border border-[#DCD4C7] shadow-inner">
                    {record.cellImageUrl ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={record.cellImageUrl} 
                          alt="Underlying Specimen" 
                          className="w-full h-full object-cover opacity-60 filter grayscale"
                        />
                        {currentHeatmapUrl && (
                          <img 
                            src={currentHeatmapUrl} 
                            alt="Heatmap Layer" 
                            className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-95"
                          />
                        )}
                      </div>
                    ) : (
                      <div 
                        className="w-full h-full"
                        dangerouslySetInnerHTML={{ __html: fallbackHeatSvg }}
                      />
                    )}

                    {/* Saliency Legend */}
                    <div className="absolute bottom-2 left-2 bg-[#2F3A3D]/90 backdrop-blur-xs text-white px-2 py-1 rounded text-[9px] flex items-center space-x-1.5 border border-white/20">
                      <span>Attention:</span>
                      <div className="w-14 h-1.5 rounded bg-gradient-to-r from-blue-500 via-yellow-400 to-[#B85C38]" />
                      <span className="font-mono">Low → High</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Single Viewport with Layer Blending & Opacity */
              <div className="relative w-full aspect-square max-h-[460px] bg-[#EAE3D5] rounded-xl overflow-hidden border border-[#DCD4C7] shadow-inner flex items-center justify-center">
                <div
                  className="w-full h-full relative transition-transform duration-200"
                  style={{ transform: `scale(${zoomLevel})` }}
                >
                  {/* Layer 1: Base Original Cytology Image */}
                  {record.cellImageUrl ? (
                    <img 
                      src={record.cellImageUrl} 
                      alt="Original Cytology Image" 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 w-full h-full"
                      dangerouslySetInnerHTML={{ __html: fallbackBaseSvg }}
                    />
                  )}

                  {/* Layer 2: Grad-CAM++ Attribution Map with Dynamic Opacity */}
                  {isHeatmapVisible && viewMode !== 'original' && (
                    <>
                      {currentHeatmapUrl ? (
                        <img 
                          src={currentHeatmapUrl} 
                          alt="Grad-CAM++ Attribution Map" 
                          className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-150 mix-blend-multiply"
                          style={{ opacity: heatmapOpacity / 100 }}
                        />
                      ) : (
                        <div
                          className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-150"
                          style={{ opacity: heatmapOpacity / 100 }}
                          dangerouslySetInnerHTML={{ __html: fallbackHeatSvg }}
                        />
                      )}
                    </>
                  )}

                  {/* Layer 3: Salient Focal-Point Markers (Corresponded to Saliency Peaks) */}
                  {showFocalPoints &&
                    focalPoints.map((point, idx) => (
                      <div
                        key={idx}
                        onClick={() => setActiveFocalPoint(activeFocalPoint === idx ? null : idx)}
                        style={{ left: `${point.x}%`, top: `${point.y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                      >
                        <span className="relative flex h-6 w-6 items-center justify-center">
                          <span className={`absolute inline-flex h-full w-full rounded-full ${
                            activeFocalPoint === idx ? 'bg-[#B85C38] opacity-90 animate-ping' : 'bg-[#B85C38] opacity-60'
                          }`} />
                          <span className={`relative inline-flex rounded-full h-5 w-5 ${
                            activeFocalPoint === idx ? 'bg-[#2F3A3D] ring-2 ring-[#B85C38]' : 'bg-[#B85C38]'
                          } text-white text-[10px] font-bold items-center justify-center border-2 border-white shadow-md transition-transform group-hover:scale-110`}>
                            {idx + 1}
                          </span>
                        </span>

                        {/* Interactive Tooltip on hover */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-8 hidden group-hover:block z-30 w-52 p-2.5 rounded bg-[#2F3A3D] text-[#ECE4D6] text-[11px] shadow-xl pointer-events-none border border-white/20">
                          <div className="font-bold text-white flex items-center justify-between">
                            <span>{point.label}</span>
                            <span className="text-[#D47B57] text-[10px] font-mono">
                              {Math.round(point.weight * 100)}% Saliency
                            </span>
                          </div>
                          <div className="text-[10px] text-[#DCD4C7] mt-1">
                            {point.finding}
                          </div>
                          {point.reason && (
                            <div className="text-[9px] text-[#9DA8A8] mt-1 pt-1 border-t border-white/10 italic">
                              {point.reason}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>

                {/* Thermal Gradient Saliency Legend */}
                <div className="absolute bottom-3 left-3 bg-[#2F3A3D]/90 backdrop-blur-xs text-white px-2.5 py-1.5 rounded-md text-[10px] flex items-center space-x-2 border border-white/20 z-20">
                  <span className="font-medium">Model Attention:</span>
                  <div className="w-20 h-2 rounded bg-gradient-to-r from-blue-500 via-yellow-400 via-orange-500 to-[#B85C38]" />
                  <span className="font-mono">Low → High Saliency</span>
                </div>
              </div>
            )}

            {/* Opacity Slider & Quick Layer Controls */}
            <div className="pt-3 border-t border-[#DCD4C7] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center space-x-3 flex-1">
                <Sliders className="w-4 h-4 text-[#5B6B6F] shrink-0" />
                <label className="text-xs font-semibold text-[#2F3A3D] whitespace-nowrap min-w-[130px]">
                  Heatmap Opacity: {heatmapOpacity}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={heatmapOpacity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setHeatmapOpacity(val);
                    if (val > 0) setIsHeatmapVisible(true);
                  }}
                  className="w-full accent-[#B85C38] cursor-pointer"
                />
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setIsHeatmapVisible(!isHeatmapVisible)}
                  className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors flex items-center space-x-1 ${
                    isHeatmapVisible
                      ? 'bg-[#B85C38] text-white border-[#B85C38]'
                      : 'bg-[#F5F0E8] text-[#2F3A3D] border-[#DCD4C7]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  <span>{isHeatmapVisible ? 'Heatmap Active' : 'Heatmap Hidden'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowFocalPoints(!showFocalPoints)}
                  className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors flex items-center space-x-1 ${
                    showFocalPoints
                      ? 'bg-[#6B705C] text-white border-[#535846]'
                      : 'bg-[#F5F0E8] text-[#2F3A3D] border-[#DCD4C7]'
                  }`}
                >
                  <Crosshair className="w-3.5 h-3.5 mr-1" />
                  <span>{showFocalPoints ? 'Markers Visible' : 'Markers Hidden'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: EXPLAIN WHAT THE HEATMAP MEANS */}
          <div className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#DCD4C7] pb-2.5">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-[#B85C38]" />
                <h3 className="font-serif text-base font-bold text-[#2F3A3D]">
                  XAI Explanation: Why did the model make this prediction?
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#5B6B6F] uppercase tracking-wider bg-[#F5F0E8] px-2 py-0.5 rounded border border-[#DCD4C7]">
                Morphological Attribution
              </span>
            </div>

            {/* Saliency Core Attribution Statement */}
            <p className="text-xs text-[#2F3A3D] leading-relaxed font-medium bg-white p-3 rounded-lg border border-[#DCD4C7]">
              {record.explainabilitySummary || 
                `Model attention was concentrated primarily on nuclear regions showing features associated with the predicted classification (${record.predictedClass}).`}
            </p>

            {/* Supported Morphological Findings */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6B6F] block">
                Important findings associated with the highlighted regions:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {findingsList.map((finding, idx) => (
                  <li 
                    key={idx}
                    className="flex items-start space-x-2 p-2 rounded bg-[#FAF7F2] border border-[#DCD4C7]/70 text-[#2F3A3D]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B85C38] mt-1.5 shrink-0" />
                    <span className="leading-snug">{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 5: REGION-LEVEL EXPLANATION */}
          <div className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#DCD4C7] pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5B6B6F]">
                Region-Level Saliency Attribution Breakdown
              </span>
              <span className="text-[11px] text-[#5B6B6F] font-mono">
                Image Region → Attention → Feature → Prediction
              </span>
            </div>

            <div className="space-y-2.5">
              {focalPoints.map((region, idx) => {
                const isSelected = activeFocalPoint === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveFocalPoint(isSelected ? null : idx)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-white border-[#B85C38] shadow-sm ring-1 ring-[#B85C38]' 
                        : 'bg-[#F5F0E8]/70 border-[#DCD4C7] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#B85C38] text-white text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-[#2F3A3D]">
                          {region.label} — {region.saliencyLevel || (region.weight > 0.8 ? 'High saliency' : 'Moderate saliency')}
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono font-semibold text-[#B85C38]">
                        {(region.weight * 100).toFixed(0)}% Attention
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-[#2F3A3D] space-y-1 pl-7">
                      <div>
                        <strong className="text-[#5B6B6F]">Reason: </strong>
                        <span>{region.reason || region.finding}</span>
                      </div>
                      <div className="text-[11px] text-[#5B6B6F] flex items-center space-x-1 font-mono pt-1">
                        <span className="text-[#B85C38]">Coordinate: ({region.x}%, {region.y}%)</span>
                        <span>→</span>
                        <span className="text-[#2F3A3D]">{region.morphologicalFeature || 'Cellular morphology'}</span>
                        <span>→</span>
                        <span className="font-semibold text-[#6B705C]">{record.predictedClass}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Model Classification Panel & Clinical Triage Guidance */}
        <div className="lg:col-span-5 space-y-5">
          {/* Section 6: MODEL CLASSIFICATION PANEL */}
          <div className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCD4C7] pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5B6B6F]">
                Model Classification & Telemetry
              </span>
              <span className="text-xs font-mono text-[#5B6B6F]">TBS 2014 Criteria</span>
            </div>

            {/* Predicted Class Heading */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6B6F] block">
                Predicted Classification
              </span>
              <div className="text-xl sm:text-2xl font-serif font-bold text-[#2F3A3D] mt-0.5">
                {record.classFullName}
              </div>
              <div className="text-xs font-bold text-[#B85C38] mt-0.5">
                Bethesda Category: {record.predictedClass}
              </div>
            </div>

            {/* Quantitative Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded bg-white border border-[#DCD4C7]">
                <span className="text-[11px] text-[#5B6B6F] block">Raw Model Confidence:</span>
                <span className="font-mono text-base font-bold text-[#2F3A3D]">
                  {(record.confidence * 100).toFixed(1)}%
                </span>
              </div>

              <div className="p-2.5 rounded bg-white border border-[#DCD4C7]">
                <span className="text-[11px] text-[#5B6B6F] block">Calibrated Confidence:</span>
                <span className="font-mono text-base font-bold text-[#6B705C]">
                  {(record.calibratedConfidence * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-[#5B6B6F] block">Temperature T=1.35</span>
              </div>

              <div className="p-2.5 rounded bg-white border border-[#DCD4C7]">
                <span className="text-[11px] text-[#5B6B6F] block">Uncertainty Score:</span>
                <span className={`font-mono text-base font-bold ${
                  isUncertain ? 'text-[#D47B57]' : 'text-[#2F3A3D]'
                }`}>
                  {record.uncertaintyScore.toFixed(3)}
                </span>
                <span className="text-[10px] text-[#5B6B6F] block">Softmax Entropy</span>
              </div>

              <div className="p-2.5 rounded bg-white border border-[#DCD4C7]">
                <span className="text-[11px] text-[#5B6B6F] block">Referral Threshold:</span>
                <span className="font-mono text-base font-bold text-[#2F3A3D]">
                  {uncertaintyThreshold.toFixed(3)}
                </span>
                <span className="text-[10px] text-[#5B6B6F] block">Decision Boundary</span>
              </div>
            </div>

            {/* Section 7: UNCERTAINTY / REFERRAL LOGIC */}
            <div className={`p-3.5 rounded-lg border space-y-1.5 ${
              isUncertain
                ? 'bg-[#D47B57]/10 border-[#D47B57]/40 text-[#2F3A3D]'
                : 'bg-[#6B705C]/10 border-[#6B705C]/30 text-[#2F3A3D]'
            }`}>
              <div className="flex items-center space-x-2">
                {isUncertain ? (
                  <AlertTriangle className="w-4 h-4 text-[#D47B57] shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-[#6B705C] shrink-0" />
                )}
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Status: {isUncertain ? 'Review Recommended' : 'Model Prediction Stable'}
                </h4>
              </div>
              <p className="text-xs leading-relaxed pl-6">
                {isUncertain
                  ? 'Prediction uncertainty is elevated. This case should be reviewed by a qualified clinician.'
                  : 'Prediction confidence is within the configured screening threshold.'}
              </p>
            </div>

            {/* Referral Recommendation */}
            <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#DCD4C7] text-xs space-y-1">
              <span className="font-bold text-[#2F3A3D] block text-[11px] uppercase tracking-wider">
                Referral Recommendation:
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

            {/* Morphological Alterations Evaluated Summary */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6B6F]">
                Morphological Features Evaluated:
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

            {/* Clinical Decision Support Positioning & Regulatory Disclaimer */}
            <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#DCD4C7] flex items-start space-x-2 text-[11px] text-[#5B6B6F] leading-snug">
              <ShieldCheck className="w-4 h-4 text-[#6B705C] shrink-0 mt-0.5" />
              <span>
                <strong>Clinical Decision Support Notice:</strong> AI-generated findings are intended to support qualified clinical review and should not be used as a standalone diagnosis.
              </span>
            </div>

            {/* Copilot Quick Inquiries */}
            <div className="pt-2 border-t border-[#DCD4C7]">
              <span className="text-[11px] font-medium text-[#5B6B6F] flex items-center mb-1.5">
                <MessageSquareText className="w-3 h-3 mr-1 text-[#B85C38]" />
                Ask CerviXAI Copilot regarding this analysis:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => onAskChatbot(`Explain why the Grad-CAM++ hotspot focused on the nuclear envelope in this ${record.predictedClass} slide.`)}
                  className="px-2.5 py-1.5 rounded bg-[#F5F0E8] hover:bg-[#ECE4D6] border border-[#DCD4C7] text-[11px] text-[#2F3A3D] transition-colors text-left"
                >
                  Explain Grad-CAM hotspot
                </button>
                <button
                  type="button"
                  onClick={() => onAskChatbot(`Is selective prediction referral warranted for this ${record.predictedClass} case with entropy ${record.uncertaintyScore}?`)}
                  className="px-2.5 py-1.5 rounded bg-[#F5F0E8] hover:bg-[#ECE4D6] border border-[#DCD4C7] text-[11px] text-[#2F3A3D] transition-colors text-left"
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
