import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  AlertCircle, 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  Stethoscope, 
  X,
  FileImage,
  Trash2
} from 'lucide-react';
import { BethesdaClass } from '../types';

export interface UploadFormData {
  patientName: string;
  age: number | string;
  district: string;
  state: string;
  abhaId: string;
  indication: string;
  isAyushmanCovered: boolean;
  imagePreview: string;
  presetClass?: BethesdaClass;
}

interface UploadScreenProps {
  onStartAnalysis: (data: UploadFormData) => void;
  onCancel: () => void;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({ onStartAnalysis, onCancel }) => {
  // Required starting state: completely blank new-screening form
  const [formData, setFormData] = useState<UploadFormData>({
    patientName: '',
    age: '',
    district: '',
    state: '',
    abhaId: '',
    indication: '',
    isAyushmanCovered: false,
    imagePreview: '',
    presetClass: undefined,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, TIFF, or SVG cervical cytology slide).');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('Image file exceeds the 20MB laboratory limit.');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFormData((prev) => ({
        ...prev,
        imagePreview: result,
        presetClass: undefined, // Real MSA-CNN inference on actual uploaded cytology image
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData((prev) => ({
      ...prev,
      imagePreview: '',
      presetClass: undefined,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Enforce: User must upload an image before analysis can begin
    if (!formData.imagePreview) {
      setError('Please upload a Pap smear cytology slide image before initializing AI analysis.');
      return;
    }
    if (!formData.patientName.trim()) {
      setError('Please enter the patient full name.');
      return;
    }
    setError(null);
    onStartAnalysis(formData);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#DCD4C7] pb-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F3A3D]">
            Screen New Slide
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6B6F] mt-1">
            Upload a digitized cervical cytology slide and enter patient details to initialize automated AI screening.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center text-xs font-medium text-[#5B6B6F] hover:text-[#2F3A3D] self-start sm:self-auto px-2.5 py-1.5 rounded border border-[#DCD4C7] bg-[#FAF7F2]"
        >
          <X className="w-3.5 h-3.5 mr-1" />
          Cancel
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Upload and Form Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Image Upload Dropzone & Live Preview */}
        <div className="md:col-span-6 space-y-4">
          <div className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B6F]">
                Slide Micrograph (Required)
              </label>
              {formData.imagePreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-xs text-red-600 hover:text-red-700 flex items-center"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Remove Image
                </button>
              )}
            </div>

            {/* Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[320px] ${
                isDragging
                  ? 'border-[#B85C38] bg-[#B85C38]/10'
                  : formData.imagePreview
                  ? 'border-[#6B705C] bg-[#FAF7F2]'
                  : 'border-[#DCD4C7] bg-[#F5F0E8] hover:border-[#B85C38]'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {formData.imagePreview ? (
                <div className="w-full flex flex-col items-center">
                  <div className="w-56 h-56 sm:w-64 sm:h-64 relative rounded-lg overflow-hidden border border-[#DCD4C7] shadow-inner bg-[#EAE3D5]">
                    {formData.imagePreview.startsWith('data:image') ? (
                      <img
                        src={formData.imagePreview}
                        alt="Uploaded Pap smear slide preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: formData.imagePreview }}
                      />
                    )}
                  </div>
                  <div className="mt-3 text-xs text-[#5B6B6F] flex items-center">
                    <Check className="w-3.5 h-3.5 mr-1 text-[#6B705C]" />
                    <span className="font-medium text-[#2F3A3D]">Slide Image Loaded Successfully</span>
                  </div>
                  <span className="mt-1 text-xs text-[#B85C38] hover:underline font-medium">
                    Click or drop another file to replace
                  </span>
                </div>
              ) : (
                <div className="py-8 px-4 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-[#ECE4D6] flex items-center justify-center text-[#B85C38] mb-4 shadow-inner">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-[#2F3A3D]">
                    Upload Cervical Cytology Slide
                  </h4>
                  <p className="text-xs text-[#5B6B6F] mt-1.5 max-w-xs">
                    Drag and drop your Pap smear slide micrograph here, or click to browse from device
                  </p>
                  <div className="mt-4 inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium text-white bg-[#B85C38] hover:bg-[#964726] transition-colors shadow-xs">
                    <FileImage className="w-3.5 h-3.5 mr-1.5" />
                    Select Image File
                  </div>
                  <p className="text-[11px] text-[#5B6B6F]/80 mt-3">
                    Supports high-resolution PNG, JPG, or TIFF (Up to 20MB)
                  </p>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-[#5B6B6F]">
              <span className="flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-[#6B705C]" />
                De-identified local pathology telemetry
              </span>
              <span>40x Cytological Resolution</span>
            </div>
          </div>
        </div>

        {/* Right: Essential Patient Information Form (Completely Blank Starting State) */}
        <div className="md:col-span-6 space-y-4">
          <div className="bg-[#FAF7F2] border border-[#DCD4C7] rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#2F3A3D] flex items-center">
              <Stethoscope className="w-4 h-4 mr-1.5 text-[#B85C38]" />
              Enter Patient Details
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#2F3A3D] mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  id="form-patient-name"
                  required
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  placeholder="e.g. Radhika Sharma"
                  className="w-full rounded-md border border-[#DCD4C7] bg-white px-3 py-2 text-xs text-[#2F3A3D] focus:border-[#B85C38] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2F3A3D] mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  id="form-patient-age"
                  min={18}
                  max={95}
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="e.g. 42"
                  className="w-full rounded-md border border-[#DCD4C7] bg-white px-3 py-2 text-xs text-[#2F3A3D] focus:border-[#B85C38] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#2F3A3D] mb-1">
                  District
                </label>
                <input
                  type="text"
                  id="form-patient-district"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g. Madurai"
                  className="w-full rounded-md border border-[#DCD4C7] bg-white px-3 py-2 text-xs text-[#2F3A3D] focus:border-[#B85C38] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2F3A3D] mb-1">
                  State / Territory
                </label>
                <input
                  type="text"
                  id="form-patient-state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="e.g. Tamil Nadu"
                  className="w-full rounded-md border border-[#DCD4C7] bg-white px-3 py-2 text-xs text-[#2F3A3D] focus:border-[#B85C38] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#2F3A3D] mb-1">
                ABHA ID (Ayushman Bharat Health Account)
              </label>
              <input
                type="text"
                id="form-patient-abha"
                value={formData.abhaId}
                onChange={(e) => setFormData({ ...formData, abhaId: e.target.value })}
                placeholder="e.g. 91-4920-3819-2041"
                className="w-full font-mono rounded-md border border-[#DCD4C7] bg-white px-3 py-2 text-xs text-[#2F3A3D] focus:border-[#B85C38] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#2F3A3D] mb-1">
                Clinical Indication & Specimen Notes
              </label>
              <textarea
                id="form-patient-indication"
                rows={3}
                value={formData.indication}
                onChange={(e) => setFormData({ ...formData, indication: e.target.value })}
                placeholder="Clinical background, symptoms, or screening context..."
                className="w-full rounded-md border border-[#DCD4C7] bg-white px-3 py-2 text-xs text-[#2F3A3D] focus:border-[#B85C38] focus:outline-none"
              />
            </div>

            {/* PM-JAY Ayushman Bharat Subsidy Notice */}
            <div className="p-3 rounded-lg bg-[#F5F0E8] border border-[#DCD4C7] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <input
                  type="checkbox"
                  id="form-ayushman-toggle"
                  checked={formData.isAyushmanCovered}
                  onChange={(e) => setFormData({ ...formData, isAyushmanCovered: e.target.checked })}
                  className="rounded border-[#DCD4C7] text-[#B85C38] focus:ring-[#B85C38] h-4 w-4 cursor-pointer"
                />
                <label htmlFor="form-ayushman-toggle" className="text-xs text-[#2F3A3D] cursor-pointer">
                  <span className="font-semibold">PM-JAY Ayushman Bharat Beneficiary</span>
                  <span className="block text-[11px] text-[#5B6B6F]">Subsidized Tariff: ₹150 (Free for Patient)</span>
                </label>
              </div>
              <span className="text-[10px] bg-[#6B705C]/20 text-[#535846] px-2 py-0.5 rounded font-medium">
                Govt Scheme
              </span>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              id="start-ai-analysis-btn"
              className={`w-full py-3 px-4 rounded-md text-sm font-semibold shadow-xs flex items-center justify-center transition-colors ${
                formData.imagePreview
                  ? 'bg-[#B85C38] hover:bg-[#964726] text-white cursor-pointer'
                  : 'bg-[#DCD4C7] text-[#5B6B6F] cursor-not-allowed'
              }`}
            >
              <span>Initialize AI Analysis</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>

            {!formData.imagePreview && (
              <p className="text-[11px] text-center text-[#B85C38] font-medium">
                * Please upload a slide image before initializing analysis
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
