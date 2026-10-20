import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Layers, HelpCircle } from 'lucide-react';
import { CATEGORY_COLORS } from '../../utils/constants';

export default function PredictionCard({ prediction }) {
  const [showAllProbabilities, setShowAllProbabilities] = useState(false);

  if (!prediction) return null;

  const { predicted_class, confidence, is_uncertain, probabilities } = prediction;
  const confidencePercent = Math.round(confidence * 100);
  const colorTheme = CATEGORY_COLORS[predicted_class] || CATEGORY_COLORS['Uncertain'];

  return (
    <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#D3EAD7] shadow-[0_4px_20px_-2px_rgba(24,59,43,0.06)] space-y-6">
      {/* Card Header & Badge */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-[#52705F]">
            AI Classification Result
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-[#183B2B] tracking-tight mt-1">
            {predicted_class}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {is_uncertain ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Low Confidence ({confidencePercent}%)
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-xs"
              style={{
                backgroundColor: colorTheme.bg,
                color: colorTheme.text,
                borderColor: colorTheme.border,
              }}
            >
              <CheckCircle2 className="w-4 h-4" />
              {confidencePercent}% Confident
            </span>
          )}
        </div>
      </div>

      {/* Uncertain Warning Banner */}
      {is_uncertain && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            <span className="font-bold">Uncertain Prediction:</span> The model confidence is below the 60% verification threshold. The waste item might be partially obscured, reflective, or outside standard training distributions. Please check the disposal advice below before discarding.
          </div>
        </div>
      )}

      {/* Confidence Meter Bar */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-[#183B2B] mb-2">
          <span className="flex items-center gap-1 text-[#52705F]">
            <Layers className="w-3.5 h-3.5" />
            Model Confidence Level
          </span>
          <span className="text-[#16845B] font-extrabold">{confidencePercent}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-[#EAF5EC] overflow-hidden p-0.5">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.max(confidencePercent, 5)}%`,
              backgroundColor: is_uncertain ? '#D97706' : '#16845B',
            }}
          />
        </div>
      </div>

      {/* Probabilities Breakdown Toggle */}
      {probabilities && (
        <div className="pt-2 border-t border-[#F2F9F3]">
          <button
            onClick={() => setShowAllProbabilities(!showAllProbabilities)}
            className="w-full flex items-center justify-between py-2 text-xs font-bold text-[#52705F] hover:text-[#183B2B] transition-colors"
          >
            <span>All Category Probabilities ({Object.keys(probabilities).length})</span>
            {showAllProbabilities ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAllProbabilities && (
            <div className="mt-3 space-y-2.5 animate-in fade-in duration-200">
              {Object.entries(probabilities)
                .sort(([, a], [, b]) => b - a)
                .map(([category, prob]) => {
                  const pct = Math.round(prob * 100);
                  const isTop = category === predicted_class;
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-semibold ${isTop ? 'text-[#16845B]' : 'text-[#52705F]'}`}>
                          {category} {isTop && '★'}
                        </span>
                        <span className="font-bold text-[#183B2B]">{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#EAF5EC] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: isTop ? '#16845B' : '#A7D9B4',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
