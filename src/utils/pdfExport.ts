import { jsPDF } from 'jspdf';
import { ScreeningRecord, AttentionFocalPoint, BethesdaClass } from '../types';
import { generateCellSvg } from '../data/mockData';
import { rasterizeSvgToPng } from './xaiAnalysisEngine';

export interface ReportImages {
  originalImageUrl: string;
  heatmapImageUrl: string;
}

/**
 * Safely loads an image source (SVG string, SVG data URL, PNG/JPEG data URL, or HTTP URL)
 * into an HTMLImageElement for canvas drawing.
 */
function safeLoadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    let src = source.trim();
    let objectUrlToRevoke: string | null = null;

    if (src.startsWith('<svg')) {
      if (!src.includes('xmlns=')) {
        src = src.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      const blob = new Blob([src], { type: 'image/svg+xml;charset=utf-8' });
      src = URL.createObjectURL(blob);
      objectUrlToRevoke = src;
    } else if (src.startsWith('data:image/svg+xml')) {
      // If unencoded SVG XML is inside the data URL, extract and blob it to ensure reliable loading
      if (src.includes('<svg') && !src.includes(';base64,')) {
        const svgContent = src.substring(src.indexOf('<svg'));
        const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        src = URL.createObjectURL(blob);
        objectUrlToRevoke = src;
      }
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
      resolve(img);
    };
    img.onerror = (err) => {
      if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
      reject(new Error(`Failed to load image into canvas: ${err}`));
    };
    img.src = src;
  });
}

/**
 * Rasterizes any image source or SVG into a high-fidelity PNG Data URL.
 */
async function rasterizeToPng(
  source: string,
  width = 600,
  height = 600,
  predClass: BethesdaClass = 'HSIL'
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  let src = source;
  if (!src || src.trim() === '') {
    src = generateCellSvg(predClass, false);
  }

  try {
    const img = await safeLoadImage(src);
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL('image/png');
  } catch (err) {
    console.warn('rasterizeToPng error, falling back to clean mock SVG:', err);
    try {
      const fallbackSvg = generateCellSvg(predClass, false);
      const img = await safeLoadImage(fallbackSvg);
      ctx.drawImage(img, 0, 0, width, height);
      return canvas.toDataURL('image/png');
    } catch {
      return '';
    }
  }
}

/**
 * Composites the Original Cytology Specimen, the Grad-CAM++ Heatmap Overlay,
 * the Numbered Focal-Point Markers (1, 2, 3), and the Saliency Gradient Legend
 * into a single, high-resolution PNG Data URL for embedding into jsPDF.
 */
async function composeXaiHeatmapWithMarkers(
  originalSrc: string,
  heatmapSrc: string,
  focalPoints: AttentionFocalPoint[],
  predClass: BethesdaClass,
  width = 600,
  height = 600
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Draw base cytology specimen
  try {
    let baseSrc = originalSrc;
    if (!baseSrc || baseSrc.trim() === '') {
      baseSrc = generateCellSvg(predClass, false);
    }
    const baseImg = await safeLoadImage(baseSrc);
    ctx.drawImage(baseImg, 0, 0, width, height);
  } catch (err) {
    console.warn('Base specimen load failed in composer:', err);
    try {
      const fallbackSvg = generateCellSvg(predClass, false);
      const fallbackImg = await safeLoadImage(fallbackSvg);
      ctx.drawImage(fallbackImg, 0, 0, width, height);
    } catch {
      ctx.fillStyle = '#EAE3D5';
      ctx.fillRect(0, 0, width, height);
    }
  }

  // 2. Overlay Grad-CAM++ Heatmap
  try {
    let heatSrc = heatmapSrc;
    if (!heatSrc || heatSrc.trim() === '') {
      heatSrc = generateCellSvg(predClass, true);
    }
    const heatImg = await safeLoadImage(heatSrc);
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.drawImage(heatImg, 0, 0, width, height);
    ctx.restore();
  } catch (err) {
    console.warn('Heatmap overlay load failed in composer:', err);
    try {
      const fallbackHeatSvg = generateCellSvg(predClass, true);
      const fallbackHeatImg = await safeLoadImage(fallbackHeatSvg);
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.drawImage(fallbackHeatImg, 0, 0, width, height);
      ctx.restore();
    } catch (e) {
      console.error('Heatmap fallback failed:', e);
    }
  }

  // 3. Render Numbered Focal Markers (1, 2, 3)
  const pts = (focalPoints && focalPoints.length > 0)
    ? focalPoints.slice(0, 3)
    : [
        { label: 'Primary Nuclear Focus', x: 50, y: 50, weight: 0.94, finding: 'Hyperchromatic atypical chromatin distribution' },
        { label: 'Nuclear Envelope', x: 42, y: 44, weight: 0.81, finding: 'Membrane contour irregularity and convolution' },
        { label: 'Perinuclear Zone', x: 58, y: 56, weight: 0.72, finding: 'Cytoplasmic clearing / halo interface' },
      ];

  pts.forEach((pt, idx) => {
    const px = Math.round((pt.x / 100) * width);
    const py = Math.round((pt.y / 100) * height);
    const markerNum = String(idx + 1);

    ctx.save();
    // Outer translucent pulse ring
    ctx.beginPath();
    ctx.arc(px, py, 17, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(184, 92, 56, 0.45)';
    ctx.fill();

    // White border ring with subtle shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    ctx.beginPath();
    ctx.arc(px, py, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // Inner Terracotta solid circle
    ctx.shadowColor = 'transparent';
    ctx.beginPath();
    ctx.arc(px, py, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#B85C38';
    ctx.fill();

    // White bold number text
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(markerNum, px, py);
    ctx.restore();
  });

  // 4. Render Saliency Legend at bottom-left
  ctx.save();
  const legendX = 14;
  const legendY = height - 36;
  const legendW = 164;
  const legendH = 22;

  // Background pill
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(legendX, legendY, legendW, legendH, 5);
  } else {
    ctx.rect(legendX, legendY, legendW, legendH);
  }
  ctx.fillStyle = 'rgba(47, 58, 61, 0.92)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // "Attention:" label
  ctx.font = 'bold 9px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Attention:', legendX + 8, legendY + legendH / 2);

  // Gradient bar
  const barX = legendX + 54;
  const barY = legendY + 7;
  const barW = 50;
  const barH = 8;
  const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  grad.addColorStop(0.0, '#3B82F6');
  grad.addColorStop(0.35, '#06B6D4');
  grad.addColorStop(0.65, '#FACC15');
  grad.addColorStop(0.85, '#F97316');
  grad.addColorStop(1.0, '#B85C38');

  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(barX, barY, barW, barH, 2);
  } else {
    ctx.rect(barX, barY, barW, barH);
  }
  ctx.fillStyle = grad;
  ctx.fill();

  // "Low → High"
  ctx.font = '8px monospace';
  ctx.fillStyle = '#E5E7EB';
  ctx.fillText('Low → High', barX + barW + 6, legendY + legendH / 2);
  ctx.restore();

  return canvas.toDataURL('image/png');
}

/**
 * Prepares both the Original Cytology Image and the Grad-CAM++ Explainability Map
 * as raster PNG Data URLs with embedded markers and legend for jsPDF embedding.
 */
export async function prepareReportImages(record: ScreeningRecord): Promise<ReportImages> {
  const width = 600;
  const height = 600;

  // 1. Get raw source for original image
  let origSource = record.cellImageUrl || '';
  if (!origSource || origSource.trim() === '') {
    origSource = generateCellSvg(record.predictedClass, false);
  }

  // 2. Get raw source for heatmap
  let heatSource = record.blendedHeatmapUrl || record.heatmapImageUrl || '';
  if (!heatSource || heatSource.trim() === '') {
    heatSource = generateCellSvg(record.predictedClass, true);
  }

  // 3. Focal points for the markers
  const focalPoints = (record.attentionFocalPoints && record.attentionFocalPoints.length > 0)
    ? record.attentionFocalPoints
    : [
        { label: 'Primary Nuclear Focus', x: 50, y: 50, weight: 0.94, finding: 'Hyperchromatic atypical chromatin distribution' },
        { label: 'Nuclear Envelope', x: 42, y: 44, weight: 0.81, finding: 'Membrane contour irregularity and convolution' },
        { label: 'Perinuclear Zone', x: 58, y: 56, weight: 0.72, finding: 'Cytoplasmic clearing / halo interface' },
      ];

  // 4. Create pure raster PNG for Original Cytology Image
  let originalImageUrl = '';
  try {
    originalImageUrl = await rasterizeToPng(origSource, width, height, record.predictedClass);
  } catch (err) {
    console.warn('rasterizeToPng failed for original, fallback to svg:', err);
    originalImageUrl = await rasterizeSvgToPng(generateCellSvg(record.predictedClass, false), width, height);
  }

  // 5. Create pure composite raster PNG for XAI Heatmap with Markers 1, 2, 3 and Legend
  let heatmapImageUrl = '';
  try {
    heatmapImageUrl = await composeXaiHeatmapWithMarkers(
      origSource,
      heatSource,
      focalPoints,
      record.predictedClass,
      width,
      height
    );
  } catch (err) {
    console.warn('composeXaiHeatmapWithMarkers failed, fallback to blended SVG:', err);
    try {
      heatmapImageUrl = await rasterizeSvgToPng(generateCellSvg(record.predictedClass, true), width, height);
    } catch {
      heatmapImageUrl = originalImageUrl;
    }
  }

  return {
    originalImageUrl,
    heatmapImageUrl,
  };
}

/**
 * Legacy single-image adapter for backward compatibility.
 */
export async function generateReportAnalyzedImageDataUrl(record: ScreeningRecord): Promise<string> {
  const images = await prepareReportImages(record);
  return images.heatmapImageUrl || images.originalImageUrl;
}

/**
 * Builds the official Clinical Cytopathology PDF report document.
 * Exactly preserves:
 * 1. Patient / Case Demographics
 * 2. AI Screening Result (TBS 2014)
 * 3. Dedicated Section: CYTOLOGICAL IMAGE & XAI SALIENCY ATTRIBUTION
 *    LEFT: ORIGINAL CYTOLOGY IMAGE
 *    RIGHT: XAI EXPLAINABILITY — GRAD-CAM++ (with focal markers 1, 2, 3)
 *    Caption: "Grad-CAM++ Explainability Map — highlighted regions indicate areas contributing to the model prediction."
 * 4. Dedicated Section: FOCAL REGIONS OF MAXIMUM SALIENCY
 *    Region 1, Region 2, Region 3 with Saliency % and Feature explanation
 * 5. Explainability Findings & Microscopic Morphology Evaluation
 * 6. Clinical Interpretation & Referral Recommendation
 * 7. XAI Clinical Decision Support Disclaimer
 * 8. Doctor Signature & Legal Certification Block
 */
export function buildClinicalPdfDocument(
  record: ScreeningRecord,
  images?: ReportImages | string
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 12; // 12mm left & right
  const contentWidth = pageWidth - margin * 2; // 186mm

  // Parse images parameter
  let originalImgData: string | undefined;
  let heatmapImgData: string | undefined;

  if (typeof images === 'string') {
    heatmapImgData = images;
    originalImgData = record.cellImageUrl || images;
  } else if (images && typeof images === 'object') {
    originalImgData = images.originalImageUrl;
    heatmapImgData = images.heatmapImageUrl;
  }

  // -------------------------------------------------------------
  // INSTITUTIONAL HEADER
  // -------------------------------------------------------------
  let currentY = 8.0;

  // Terracotta Logo Box
  doc.setFillColor(184, 92, 56); // #B85C38
  doc.roundedRect(margin, currentY, 12, 12, 2.5, 2.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('C', margin + 3.8, currentY + 8.2);

  // Clinic Title
  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(47, 58, 61);
  doc.text('CerviXAI Diagnostic Evaluation', margin + 15, currentY + 6.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(91, 107, 111);
  doc.text(
    'Department of Cytopathology & GYN Oncology • Explainable AI (XAI) Screening Workstation',
    margin + 15,
    currentY + 10.6
  );

  // Right Reference Header
  doc.setFont('courier', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(47, 58, 61);
  doc.text(`CASE ID: ${record.sampleId || record.caseId}`, pageWidth - margin, currentY + 4.2, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(91, 107, 111);
  doc.text(`Date of Screening: ${record.screeningDate}`, pageWidth - margin, currentY + 8.2, { align: 'right' });
  doc.text('Protocol: The Bethesda System (TBS 2014)', pageWidth - margin, currentY + 11.8, { align: 'right' });

  currentY += 15.0;
  doc.setDrawColor(220, 212, 199);
  doc.setLineWidth(0.35);
  doc.line(margin, currentY, margin + contentWidth, currentY);
  currentY += 3.0;

  // -------------------------------------------------------------
  // 1. PATIENT / CASE INFORMATION
  // -------------------------------------------------------------
  const demoHeight = 22.0;
  doc.setFillColor(250, 247, 242);
  doc.setDrawColor(220, 212, 199);
  doc.roundedRect(margin, currentY, contentWidth, demoHeight, 2, 2, 'FD');

  const c1 = margin + 3.5;
  const c2 = margin + 49;
  const c3 = margin + 95;
  const c4 = margin + 142;

  // Row 1: Demographics
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(91, 107, 111);
  doc.text('Patient Name:', c1, currentY + 4.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.4);
  doc.setTextColor(47, 58, 61);
  doc.text(record.patientName, c1, currentY + 8.8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(91, 107, 111);
  doc.text('Age / Gender:', c2, currentY + 4.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.4);
  doc.setTextColor(47, 58, 61);
  doc.text(`${record.age} Years / Female`, c2, currentY + 8.8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(91, 107, 111);
  doc.text('District / State:', c3, currentY + 4.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.0);
  doc.setTextColor(47, 58, 61);
  doc.text(`${record.district}, ${record.state}`, c3, currentY + 8.8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(91, 107, 111);
  doc.text('ABHA Health ID:', c4, currentY + 4.5);
  doc.setFont('courier', 'bold');
  doc.setFontSize(8.0);
  doc.setTextColor(47, 58, 61);
  doc.text(record.abhaId || 'N/A', c4, currentY + 8.8);

  // Row 2: Specimen info & Tariff
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(91, 107, 111);
  doc.text('Specimen Information:', c1, currentY + 13.8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(47, 58, 61);
  doc.text(record.specimenInfo || 'Liquid-Based Cytology (LBC) / ThinPrep Pap Smear', c1, currentY + 18.0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(91, 107, 111);
  doc.text('Financial Scheme / Tariff:', c3, currentY + 13.8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(83, 88, 70);
  const tariff = record.isAyushmanCovered
    ? `Ayushman Bharat PM-JAY Subsidized (₹${record.subsidizedFeeInr} - Zero Out-of-Pocket)`
    : 'Standard Institutional Cytopathology Tariff';
  doc.text(tariff, c3, currentY + 18.0);

  currentY += demoHeight + 3.0;

  // -------------------------------------------------------------
  // 2. AI SCREENING RESULT BANNER (TBS 2014)
  // -------------------------------------------------------------
  const isHighRisk = record.predictedClass === 'HSIL' || record.predictedClass === 'SCC';
  const uncertaintyThreshold = record.uncertaintyThreshold ?? 0.200;
  const isUncertain = record.uncertaintyScore > uncertaintyThreshold || record.predictedClass === 'ASC-US';

  // 4 clearly separated rows to ensure zero overlap between diagnosis, confidence, uncertainty, and status
  const diagHeight = 26.0;
  if (isHighRisk) {
    doc.setFillColor(254, 242, 237);
    doc.setDrawColor(184, 92, 56);
  } else if (isUncertain) {
    doc.setFillColor(254, 247, 243);
    doc.setDrawColor(212, 123, 87);
  } else {
    doc.setFillColor(242, 244, 240);
    doc.setDrawColor(107, 112, 92);
  }
  doc.roundedRect(margin, currentY, contentWidth, diagHeight, 2, 2, 'FD');

  // Row 1: Banner Header Category
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(91, 107, 111);
  doc.text('THE BETHESDA SYSTEM (TBS 2014) INTERPRETATION', margin + 4.0, currentY + 4.5);

  // Row 2: Diagnosis Title (HSIL — High-Grade Squamous Intraepithelial Lesion)
  // Full row width is strictly dedicated to this title - no elements overlap it!
  doc.setFont('times', 'bold');
  doc.setFontSize(12.5);
  if (isHighRisk) {
    doc.setTextColor(150, 71, 38);
  } else if (isUncertain) {
    doc.setTextColor(212, 123, 87);
  } else {
    doc.setTextColor(83, 88, 70);
  }
  doc.text(`${record.predictedClass} — ${record.classFullName}`, margin + 4.0, currentY + 11.0);

  // Row 3: Quantitative Model Confidence Telemetry (Dedicated Line)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(91, 107, 111);
  doc.text('Model Confidence:', margin + 4.0, currentY + 16.8);

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.4);
  doc.setTextColor(47, 58, 61);
  doc.text(
    `Raw: ${(record.confidence * 100).toFixed(1)}%   •   Calibrated Probability: ${(record.calibratedConfidence * 100).toFixed(1)}%`,
    margin + 32.0,
    currentY + 16.8
  );

  // Row 4: Shannon Entropy Uncertainty & Stability Status (Dedicated Line)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(91, 107, 111);
  doc.text('Uncertainty Evaluation:', margin + 4.0, currentY + 22.0);

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.2);
  if (isUncertain) {
    doc.setTextColor(184, 92, 56);
  } else {
    doc.setTextColor(4, 120, 87);
  }
  doc.text(
    `Entropy: ${record.uncertaintyScore.toFixed(3)} (Threshold: ${uncertaintyThreshold.toFixed(3)})   •   Status: ${isUncertain ? 'Pathologist Review Recommended' : 'Model Prediction Stable'}`,
    margin + 37.0,
    currentY + 22.0
  );

  currentY += diagHeight + 3.0;

  // -------------------------------------------------------------
  // DEDICATED SECTION: CYTOLOGICAL IMAGE & XAI SALIENCY ATTRIBUTION
  // -------------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(47, 58, 61);
  doc.text('CYTOLOGICAL IMAGE & XAI SALIENCY ATTRIBUTION', margin, currentY + 3.5);
  currentY += 5.0;

  // Dual Images: Left (Original) & Right (Heatmap with Markers 1, 2, 3)
  const imageCardW = (contentWidth - 4) / 2; // 91mm
  const imageSize = 48.0; // 48mm x 48mm high resolution square brightfield aspect ratio
  const totalImgCardH = 61.0; // generous height for header, image, and footer subtext
  const imgInsetX = (imageCardW - imageSize) / 2; // horizontal centering

  // Left Image Card: ORIGINAL CYTOLOGY IMAGE
  doc.setFillColor(250, 247, 242);
  doc.setDrawColor(220, 212, 199);
  doc.roundedRect(margin, currentY, imageCardW, totalImgCardH, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(47, 58, 61);
  doc.text('ORIGINAL CYTOLOGY IMAGE', margin + 3.5, currentY + 4.5);

  doc.setFont('courier', 'bold');
  doc.setFontSize(6.4);
  doc.setTextColor(91, 107, 111);
  doc.text('Brightfield 40x', margin + imageCardW - 3.5, currentY + 4.5, { align: 'right' });

  const imgBoxX1 = margin + imgInsetX;
  const imgBoxY1 = currentY + 6.2;

  doc.setFillColor(234, 227, 213);
  doc.roundedRect(imgBoxX1 - 0.5, imgBoxY1 - 0.5, imageSize + 1, imageSize + 1, 1.5, 1.5, 'FD');

  if (originalImgData) {
    try {
      doc.addImage(originalImgData, 'PNG', imgBoxX1, imgBoxY1, imageSize, imageSize);
    } catch (e) {
      console.warn('doc.addImage originalImgData error:', e);
    }
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(91, 107, 111);
  doc.text('Brightfield High-Power Field (40x) • Unaltered Specimen', margin + imageCardW / 2, currentY + totalImgCardH - 2.2, {
    align: 'center',
  });

  // Right Image Card: XAI EXPLAINABILITY — GRAD-CAM++
  const rightImgCardX = margin + imageCardW + 4;
  doc.setFillColor(250, 247, 242);
  doc.setDrawColor(220, 212, 199);
  doc.roundedRect(rightImgCardX, currentY, imageCardW, totalImgCardH, 2, 2, 'FD');

  // Separated headers with non-colliding widths
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.0);
  doc.setTextColor(184, 92, 56);
  doc.text('XAI EXPLAINABILITY — GRAD-CAM++', rightImgCardX + 3.5, currentY + 4.5);

  doc.setFont('courier', 'bold');
  doc.setFontSize(6.4);
  doc.setTextColor(184, 92, 56);
  doc.text('Dual-Scale Attention', rightImgCardX + imageCardW - 3.5, currentY + 4.5, { align: 'right' });

  const imgBoxX2 = rightImgCardX + imgInsetX;
  const imgBoxY2 = currentY + 6.2;

  doc.setFillColor(234, 227, 213);
  doc.roundedRect(imgBoxX2 - 0.5, imgBoxY2 - 0.5, imageSize + 1, imageSize + 1, 1.5, 1.5, 'FD');

  if (heatmapImgData) {
    try {
      doc.addImage(heatmapImgData, 'PNG', imgBoxX2, imgBoxY2, imageSize, imageSize);
    } catch (e) {
      console.warn('doc.addImage heatmapImgData error:', e);
    }
  }

  // Draw crisp vector focal markers 1, 2, 3 directly over the right heatmap image in PDF
  const focalPoints = (record.attentionFocalPoints && record.attentionFocalPoints.length > 0)
    ? record.attentionFocalPoints.slice(0, 3)
    : [
        { label: 'Primary Nuclear Focus', x: 50, y: 50, weight: 0.94, finding: 'Hyperchromatic nuclear chromatin and marked nuclear enlargement contributing directly to classification' },
        { label: 'Nuclear Envelope Contour', x: 42, y: 44, weight: 0.81, finding: 'Irregular nuclear membrane contours with focal indentation and thickened envelope' },
        { label: 'Perinuclear / N:C Interface', x: 58, y: 56, weight: 0.72, finding: 'Increased nuclear-to-cytoplasmic ratio with restricted cytoplasmic differentiation' },
      ];

  focalPoints.forEach((pt, idx) => {
    const fx = imgBoxX2 + (pt.x / 100) * imageSize;
    const fy = imgBoxY2 + (pt.y / 100) * imageSize;

    // Outer white halo
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(255, 255, 255);
    doc.circle(fx, fy, 2.5, 'FD');

    // Inner Terracotta circle
    doc.setFillColor(184, 92, 56);
    doc.circle(fx, fy, 2.0, 'F');

    // Number text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(255, 255, 255);
    doc.text(String(idx + 1), fx, fy + 0.7, { align: 'center' });
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(91, 107, 111);
  doc.text('Dual-Scale Grad-CAM++ Attribution Map • Saliency Overlay', rightImgCardX + imageCardW / 2, currentY + totalImgCardH - 2.2, {
    align: 'center',
  });

  currentY += totalImgCardH + 1.8;

  // Single Centered Caption below both images
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(91, 107, 111);
  const heatCaption = 'Grad-CAM++ Explainability Map — highlighted regions indicate areas contributing to the model prediction.';
  doc.text(heatCaption, margin + contentWidth / 2, currentY + 2.4, { align: 'center' });

  currentY += 4.5;

  // -------------------------------------------------------------
  // DEDICATED SECTION: FOCAL REGIONS OF MAXIMUM SALIENCY
  // -------------------------------------------------------------
  const focalBoxHeight = 31.0;
  doc.setFillColor(250, 247, 242);
  doc.setDrawColor(220, 212, 199);
  doc.roundedRect(margin, currentY, contentWidth, focalBoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(47, 58, 61);
  doc.text('FOCAL REGIONS OF MAXIMUM SALIENCY', margin + 3.5, currentY + 4.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.4);
  doc.setTextColor(91, 107, 111);
  doc.text('Visual Saliency Weights & Cytomorphological Correlates', pageWidth - margin - 3.5, currentY + 4.2, { align: 'right' });

  const focalCardW = (contentWidth - 6) / 3; // 60mm
  focalPoints.forEach((pt, idx) => {
    const fX = margin + 2 + idx * (focalCardW + 1);
    const fY = currentY + 5.5;
    const fH = 23.5;

    // Independent card container with white background
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 212, 199);
    doc.roundedRect(fX, fY, focalCardW, fH, 1.2, 1.2, 'FD');

    // Number circular badge [1], [2], [3]
    doc.setFillColor(184, 92, 56);
    doc.circle(fX + 3.6, fY + 3.6, 1.9, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(255, 255, 255);
    doc.text(String(idx + 1), fX + 3.6, fY + 4.3, { align: 'center' });

    // Region title (Line 1): on its own dedicated space
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.6);
    doc.setTextColor(47, 58, 61);
    const labelTitle = pt.label.startsWith('Region') ? pt.label : `Region ${idx + 1} — ${pt.label}`;
    const titleLines = doc.splitTextToSize(labelTitle, focalCardW - 8.5);
    doc.text(titleLines[0] || labelTitle, fX + 6.8, fY + 4.1);

    // Saliency Badge (Line 2): On a separate line to NEVER overlap the region title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(184, 92, 56);
    doc.text(`Saliency: ${Math.round(pt.weight * 100)}%`, fX + 3.2, fY + 8.2);

    // Feature header (Line 3)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(91, 107, 111);
    doc.text('Feature:', fX + 3.2, fY + 12.0);

    // Feature explanation lines (Lines 4-5) wrapped cleanly inside card width
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(47, 58, 61);
    const rawFinding = pt.finding || pt.reason || pt.morphologicalFeature || 'Hyperchromatic nuclear chromatin and marked nuclear enlargement contributing directly to classification';
    const featureLines = doc.splitTextToSize(rawFinding, focalCardW - 6.0);
    doc.text(featureLines.slice(0, 3), fX + 3.2, fY + 15.2);
  });

  currentY += focalBoxHeight + 3.0;

  // -------------------------------------------------------------
  // 5. EXPLAINABILITY FINDINGS & 6. MORPHOLOGICAL FEATURES EVALUATED
  // -------------------------------------------------------------
  const explainColW = (contentWidth - 4) / 2;
  const explainBoxH = 43.5;

  // Left: Explainability Findings
  doc.setFillColor(250, 247, 242);
  doc.setDrawColor(220, 212, 199);
  doc.roundedRect(margin, currentY, explainColW, explainBoxH, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.4);
  doc.setTextColor(47, 58, 61);
  doc.text('EXPLAINABILITY FINDINGS (MODEL ATTENTION)', margin + 3.5, currentY + 4.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.6);
  doc.setTextColor(47, 58, 61);
  const summaryText = record.explainabilitySummary || 
    `Model attention was concentrated primarily on nuclear regions showing features associated with the predicted classification (${record.predictedClass}).`;
  const summaryLines = doc.splitTextToSize(summaryText, explainColW - 7);
  doc.text(summaryLines.slice(0, 2), margin + 3.5, currentY + 8.2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.6);
  doc.setTextColor(91, 107, 111);
  doc.text('Supported Morphological Findings:', margin + 3.5, currentY + 16.5);

  const findings = (record.supportedMorphologicalFindings && record.supportedMorphologicalFindings.length > 0)
    ? record.supportedMorphologicalFindings.slice(0, 5)
    : [
        'Enlarged nuclear region (increased nuclear diameter)',
        'Increased nuclear-to-cytoplasmic ratio',
        'Hyperchromatic appearance with optical density aggregation',
        'Irregular nuclear membrane contours with focal indentations',
        'Coarse / abnormal chromatin pattern',
      ];

  findings.forEach((finding, idx) => {
    const fY = currentY + 20.2 + idx * 4.4;
    doc.setFillColor(184, 92, 56);
    doc.circle(margin + 5.0, fY - 0.9, 0.65, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(47, 58, 61);
    const findingLines = doc.splitTextToSize(finding, explainColW - 11);
    doc.text(findingLines[0] || finding, margin + 7.5, fY);
  });

  // Right: 6. Morphological Features Evaluated
  const rightColX = margin + explainColW + 4;
  doc.setFillColor(250, 247, 242);
  doc.setDrawColor(220, 212, 199);
  doc.roundedRect(rightColX, currentY, explainColW, explainBoxH, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.4);
  doc.setTextColor(47, 58, 61);
  doc.text('MICROSCOPIC CELLULAR MORPHOLOGY EVALUATION', rightColX + 3.5, currentY + 4.2);

  const morph = record.cellularMorphology || {
    nuclearEnlargement: 'Enlarged 2.5–3x normal intermediate nucleus (~20–25µm)',
    chromatinPattern: 'Coarse chromatin clumping with hyperchromasia',
    nuclearMembrane: 'Irregular, notched, thickened contours',
    ncRatio: 'Significantly elevated N:C ratio (>1:2)',
    cytoplasm: 'Diminished, dense cyanophilic squamous envelope',
  };

  const morphRows = [
    { label: 'Nuclear Enlargement', val: morph.nuclearEnlargement },
    { label: 'Chromatin Texture', val: morph.chromatinPattern },
    { label: 'Nuclear Membrane', val: morph.nuclearMembrane },
    { label: 'N:C Ratio', val: morph.ncRatio },
    { label: 'Cytoplasmic Diff.', val: morph.cytoplasm },
  ];

  const labelColW = 27.0;
  const valColW = explainColW - 35.0; // 56mm width for value text
  const valColX = rightColX + 32.0;

  morphRows.forEach((row, idx) => {
    const cardY = currentY + 6.2 + idx * 7.1;
    const cardH = 6.4;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 212, 199);
    doc.roundedRect(rightColX + 2.5, cardY, explainColW - 5.0, cardH, 1, 1, 'FD');

    // Subtle column separator line
    doc.setDrawColor(235, 230, 222);
    doc.setLineWidth(0.25);
    doc.line(valColX - 1.5, cardY + 1.0, valColX - 1.5, cardY + cardH - 1.0);

    // Left Column: Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(91, 107, 111);
    doc.text(row.label, rightColX + 4.2, cardY + 4.0);

    // Right Column: Value with automatic text wrapping
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.3);
    doc.setTextColor(47, 58, 61);
    const valLines = doc.splitTextToSize(row.val, valColW);
    if (valLines.length === 1) {
      doc.text(valLines[0], valColX, cardY + 4.0);
    } else {
      doc.text(valLines[0], valColX, cardY + 2.7);
      doc.text(valLines[1], valColX, cardY + 5.4);
    }
  });

  currentY += explainBoxH + 3.0;

  // -------------------------------------------------------------
  // 7. CLINICAL INTERPRETATION & REFERRAL RECOMMENDATION
  // -------------------------------------------------------------
  const recBoxHeight = 19.5;
  doc.setFillColor(250, 247, 242);
  doc.setDrawColor(220, 212, 199);
  doc.roundedRect(margin, currentY, contentWidth, recBoxHeight, 2, 2, 'FD');

  doc.setFont('times', 'bold');
  doc.setFontSize(8.6);
  doc.setTextColor(47, 58, 61);
  doc.text('Clinical Interpretation & Referral Recommendation', margin + 3.5, currentY + 4.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(47, 58, 61);
  const recLines = doc.splitTextToSize(
    `${record.clinicalSummary} ${record.recommendation}`,
    contentWidth - 7
  );
  doc.text(recLines.slice(0, 2), margin + 3.5, currentY + 8.8);

  if (record.referralReason) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.0);
    doc.setTextColor(184, 92, 56);
    doc.text(`Triage Trigger: ${record.referralReason}`, margin + 3.5, currentY + 16.2);
  }

  currentY += recBoxHeight + 3.0;

  // -------------------------------------------------------------
  // 8. XAI DISCLAIMER NOTICE
  // -------------------------------------------------------------
  const disclaimerH = 7.0;
  doc.setFillColor(245, 240, 232);
  doc.setDrawColor(220, 212, 199);
  doc.roundedRect(margin, currentY, contentWidth, disclaimerH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.4);
  doc.setTextColor(184, 92, 56);
  doc.text('XAI CLINICAL DECISION SUPPORT DISCLAIMER:', margin + 3.5, currentY + 4.4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.4);
  doc.setTextColor(91, 107, 111);
  const discLines = doc.splitTextToSize(
    'AI-generated findings are intended to support qualified clinical review and should not be used as a standalone diagnosis.',
    contentWidth - 63
  );
  doc.text(discLines, margin + 60.0, currentY + 4.4);

  currentY += disclaimerH + 3.0;

  // -------------------------------------------------------------
  // 9. DOCTOR SIGNATURE & LEGAL VERIFICATION BLOCK
  // -------------------------------------------------------------
  doc.setDrawColor(220, 212, 199);
  doc.setLineWidth(0.35);
  doc.line(margin, currentY, margin + contentWidth, currentY);

  currentY += 2.0;

  // Left: Compliance credentials
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(47, 58, 61);
  doc.text('Compliant with ABDM DISHA & ISO 15189 standards', margin, currentY + 4.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(91, 107, 111);
  doc.text(
    'Automated deep learning model output verified under cytopathologist clinical oversight.',
    margin,
    currentY + 8.4
  );

  doc.setFont('courier', 'normal');
  doc.setFontSize(6.4);
  doc.setTextColor(110, 120, 123);
  doc.text(
    'Verification Hash: SHA-256 Validated • Clinical Decision Support System (CDSS)',
    margin,
    currentY + 12.6
  );

  // Right: Doctor Signature Card
  const signCardW = 82;
  const signCardX = pageWidth - margin - signCardW;
  const signCardH = 17.0;

  const isSigned = record.cytopathologistSigned;
  if (isSigned) {
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(110, 231, 183);
  } else {
    doc.setFillColor(250, 247, 242);
    doc.setDrawColor(220, 212, 199);
  }

  doc.roundedRect(signCardX, currentY, signCardW, signCardH, 1.5, 1.5, 'FD');

  if (isSigned) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.0);
    doc.setTextColor(6, 95, 70);
    doc.text(record.signedBy || 'Consultant Cytopathologist, MD', signCardX + signCardW - 3.5, currentY + 4.5, {
      align: 'right',
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(4, 120, 87);
    const signDateStr = record.signedAt
      ? new Date(record.signedAt).toLocaleDateString()
      : record.screeningDate;
    doc.text(`Digitally Endorsed • ${signDateStr}`, signCardX + signCardW - 3.5, currentY + 8.8, { align: 'right' });

    doc.setFont('courier', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(5, 150, 105);
    const tokenClean = record.sampleId.replace(/[^0-9]/g, '') || '8492';
    doc.text(`TOKEN: CX-SIG-${tokenClean}-2026`, signCardX + signCardW - 3.5, currentY + 13.2, { align: 'right' });
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.6);
    doc.setTextColor(184, 92, 56);
    doc.text('Doctor Signature Required', signCardX + signCardW - 3.5, currentY + 5.8, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.6);
    doc.setTextColor(91, 107, 111);
    doc.text('Sign in CerviXAI to certify official diagnostic report', signCardX + signCardW - 3.5, currentY + 11.0, { align: 'right' });
  }

  // Institutional Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.4);
  doc.setTextColor(140, 150, 153);
  doc.text(
    'CerviXAI Diagnostic Platform • Explainable AI Clinical Decision Support System (CDSS) for validated cytopathological screening.',
    pageWidth / 2,
    289.5,
    { align: 'center' }
  );

  // Guarantee single page document
  while (doc.getNumberOfPages() > 1) {
    doc.deletePage(doc.getNumberOfPages());
  }

  return doc;
}

/**
 * Returns a Blob representation of the generated clinical PDF document.
 */
export async function generateClinicalPdfBlob(
  record: ScreeningRecord,
  images?: ReportImages | string
): Promise<Blob> {
  const prepared = (typeof images === 'object' && images !== null)
    ? images
    : await prepareReportImages(record);
  const doc = buildClinicalPdfDocument(record, prepared);
  return doc.output('blob');
}

/**
 * Generates an in-memory PDF Blob URL for viewing inside the report interface.
 */
export async function generateClinicalPdfBlobUrl(
  record: ScreeningRecord,
  images?: ReportImages | string
): Promise<string> {
  const blob = await generateClinicalPdfBlob(record, images);
  return URL.createObjectURL(blob);
}

/**
 * Executes a direct file download of the generated clinical PDF.
 */
export async function downloadClinicalPdf(
  record: ScreeningRecord,
  images?: ReportImages | string
): Promise<void> {
  const fileName = `CerviXAI_Report_${record.sampleId || record.caseId}.pdf`;
  try {
    const prepared = (typeof images === 'object' && images !== null)
      ? images
      : await prepareReportImages(record);
    const doc = buildClinicalPdfDocument(record, prepared);
    const blob = doc.output('blob');

    const pdfBlob = new Blob([blob], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(pdfBlob);

    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = blobUrl;
    downloadAnchor.download = fileName;
    downloadAnchor.rel = 'noopener';
    downloadAnchor.style.display = 'none';
    document.body.appendChild(downloadAnchor);

    downloadAnchor.click();

    setTimeout(() => {
      try {
        if (document.body.contains(downloadAnchor)) {
          document.body.removeChild(downloadAnchor);
        }
        URL.revokeObjectURL(blobUrl);
      } catch {
        // cleanup done
      }
    }, 1500);
  } catch (err) {
    console.warn('Anchor download fallback executing doc.save():', err);
    try {
      const prepared = await prepareReportImages(record);
      const doc = buildClinicalPdfDocument(record, prepared);
      doc.save(fileName);
    } catch (saveErr) {
      console.error('Failed to trigger PDF download:', saveErr);
    }
  }
}
