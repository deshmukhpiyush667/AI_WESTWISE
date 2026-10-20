import React, { useRef, useState } from 'react';
import { UploadCloud, Camera, Image as ImageIcon, X, AlertCircle, Sparkles } from 'lucide-react';
import CameraModal from './CameraModal';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ImageUploader({ selectedFile, onFileSelect, onClear, isLoading, onClassify }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fileInputRef = useRef(null);
  const mobileCameraInputRef = useRef(null);

  const handleFile = (file) => {
    setError(null);
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Unsupported file type. Please upload a JPEG, PNG, or WEBP image.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds the 10MB limit. Please select a smaller image.');
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (mobileCameraInputRef.current) mobileCameraInputRef.current.value = '';
    onClear();
  };

  const handleCameraCapture = (file) => {
    handleFile(file);
  };

  return (
    <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#D3EAD7] shadow-[0_4px_20px_-2px_rgba(24,59,43,0.06)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#183B2B] tracking-tight">
            Waste Image Input
          </h2>
          <p className="text-sm text-[#52705F]">
            Upload a photo or capture waste using your device camera
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 animate-in fade-in duration-150">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <div className="text-xs sm:text-sm font-medium">{error}</div>
        </div>
      )}

      {!selectedFile ? (
        <div>
          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-200 ${
              isDragOver
                ? 'border-[#16845B] bg-[#EAF5EC]'
                : 'border-[#D3EAD7] bg-[#F7FAF7] hover:border-[#16845B]/60 hover:bg-[#F2F9F3]'
            }`}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#EAF5EC] border border-[#D3EAD7] flex items-center justify-center text-[#16845B] shadow-sm">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-base sm:text-lg font-bold text-[#183B2B] mb-1">
              Drag & Drop your waste image here
            </h3>
            <p className="text-xs sm:text-sm text-[#52705F] mb-6">
              Supports JPEG, PNG, WEBP (Max 10MB)
            </p>

            {/* Input Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-xl bg-[#16845B] hover:bg-[#126e4b] text-white font-semibold text-sm shadow-sm flex items-center gap-2 transition-all"
              >
                <ImageIcon className="w-4 h-4" />
                Browse Files
              </button>

              {/* Native Mobile Camera Input */}
              <input
                ref={mobileCameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  // If mobile, open native camera; otherwise open WebRTC modal
                  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                  if (isMobile && mobileCameraInputRef.current) {
                    mobileCameraInputRef.current.click();
                  } else {
                    setIsCameraModalOpen(true);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-[#EAF5EC] hover:bg-[#D3EAD7] text-[#16845B] font-semibold text-sm border border-[#D3EAD7] flex items-center gap-2 transition-all"
              >
                <Camera className="w-4 h-4" />
                Capture with Camera
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Selected Image Preview & Action Card */
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-[#D3EAD7] bg-[#F7FAF7] max-h-96 flex items-center justify-center">
            <img
              src={previewUrl}
              alt="Waste preview"
              className="max-h-96 w-auto object-contain mx-auto rounded-2xl"
            />
            <button
              onClick={handleClear}
              disabled={isLoading}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-[#183B2B] shadow-md transition-colors disabled:opacity-50"
              title="Remove image"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-xs text-[#52705F] truncate max-w-xs">
              <span className="font-semibold text-[#183B2B]">{selectedFile.name}</span>
              {' • '}
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleClear}
                disabled={isLoading}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#D3EAD7] text-[#52705F] hover:bg-[#F7FAF7] text-sm font-semibold transition-all disabled:opacity-50"
              >
                Change Photo
              </button>
              <button
                type="button"
                onClick={onClassify}
                disabled={isLoading}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#16845B] hover:bg-[#126e4b] text-white text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Classifying...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Classify Waste
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      <CameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
}
