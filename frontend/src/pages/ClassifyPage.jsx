import React, { useState } from 'react';
import ImageUploader from '../components/classify/ImageUploader';
import PredictionCard from '../components/classify/PredictionCard';
import GuidanceCard from '../components/classify/GuidanceCard';
import { classifyWasteImage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Leaf, Info, Sparkles, CheckCircle, AlertTriangle, Trophy } from 'lucide-react';

export default function ClassifyPage({ onClassificationComplete }) {
  const { user, refreshUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [pointsAwarded, setPointsAwarded] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setPrediction(null);
    setPointsAwarded(false);
    setError(null);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPrediction(null);
    setPointsAwarded(false);
    setError(null);
  };

  const handleClassify = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    setPointsAwarded(false);
    try {
      const result = await classifyWasteImage(selectedFile);
      setPrediction(result);
      if (user) {
        setPointsAwarded(true);
        refreshUser();
      }
      if (onClassificationComplete) {
        onClassificationComplete(result);
      }
    } catch (err) {
      console.error('Classification error:', err);
      setError(err.message || 'Failed to classify image. Please check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Banner */}
      <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-10 border border-[#D3EAD7] shadow-[0_4px_20px_-2px_rgba(24,59,43,0.06)] relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EAF5EC] text-[#16845B] border border-[#D3EAD7] text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Driven Waste Segregation • MobileNetV3 (90.65% Accuracy)
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#183B2B] tracking-tight leading-tight">
            Classify Waste with <span className="text-[#16845B]">Precision</span>
          </h1>
          <p className="text-sm sm:text-base text-[#52705F] leading-relaxed">
            Upload or capture an image of any waste item. Our deep transfer-learning model powered by MobileNetV3 instantly determines its recyclable category, bin destination, and safe disposal steps.
          </p>
        </div>

        {/* Decorative corner icon */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-[#EAF5EC]/60 pointer-events-none flex items-center justify-center">
          <Leaf className="w-24 h-24 text-[#16845B]/20" />
        </div>
      </div>

      {/* Main Upload / Input Section */}
      <ImageUploader
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
        onClear={handleClear}
        isLoading={isLoading}
        onClassify={handleClassify}
      />

      {/* Points Awarded Banner */}
      {pointsAwarded && user && (
        <div className="p-4 rounded-2xl bg-[#EAF5EC] border border-[#D3EAD7] text-[#16845B] text-xs font-bold flex items-center justify-between shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            <span>+10 Eco-Points awarded for recording your sustainable classification!</span>
          </div>
          <span className="font-extrabold text-xs">Total: {user.eco_points} pts</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 animate-in fade-in duration-200">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <div className="text-sm font-semibold">{error}</div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-[#FFFFFF] rounded-3xl p-8 border border-[#D3EAD7] shadow-sm space-y-4 animate-pulse">
          <div className="h-4 bg-[#EAF5EC] rounded-full w-1/4"></div>
          <div className="h-8 bg-[#EAF5EC] rounded-2xl w-1/2"></div>
          <div className="h-24 bg-[#F7FAF7] rounded-2xl w-full"></div>
        </div>
      )}

      {/* Results View */}
      {prediction && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-in slide-in-from-bottom-4 duration-300">
          <PredictionCard prediction={prediction} />
          <GuidanceCard guidance={prediction.disposal_guidance} />
        </div>
      )}

      {/* Supported Categories Reference Pills */}
      <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#D3EAD7] shadow-[0_4px_20px_-2px_rgba(24,59,43,0.06)]">
        <div className="flex items-center gap-2 mb-4 text-[#183B2B] font-extrabold text-base">
          <Info className="w-4 h-4 text-[#16845B]" />
          Supported Waste Categories
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Organic', bin: 'Green Bin', desc: 'Food & Compostables' },
            { label: 'Plastic', bin: 'Blue Bin', desc: 'Bottles & Rigid Polymers' },
            { label: 'Paper', bin: 'Blue Bin', desc: 'Cardboard & Pulp' },
            { label: 'Metal', bin: 'Yellow Bin', desc: 'Aluminum & Steel Cans' },
            { label: 'Glass', bin: 'Glass Bin', desc: 'Jars & Beverage Bottles' },
            { label: 'E-Waste', bin: 'Special Drop-Off', desc: 'Electronics & Circuits' },
          ].map((cat) => (
            <div
              key={cat.label}
              className="p-3 rounded-2xl bg-[#F7FAF7] border border-[#D3EAD7] text-center"
            >
              <div className="font-bold text-[#183B2B] text-xs sm:text-sm">{cat.label}</div>
              <div className="text-[11px] font-semibold text-[#16845B] mt-0.5">{cat.bin}</div>
              <div className="text-[10px] text-[#52705F] mt-0.5">{cat.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
