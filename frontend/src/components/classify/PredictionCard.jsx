import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Layers,
  HelpCircle,
  Flag,
  Send,
  X,
} from 'lucide-react';
import { CATEGORY_COLORS } from '../../utils/constants';
import { submitClassificationFeedback } from '../../api/client';

export default function PredictionCard({ prediction }) {
  const [showAllProbabilities, setShowAllProbabilities] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState('');
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);

  if (!prediction) return null;

  const { record_id, predicted_class, confidence, is_uncertain, probabilities } = prediction;
  const confidencePercent = Math.round(confidence * 100);
  const colorTheme = CATEGORY_COLORS[predicted_class] || CATEGORY_COLORS['Uncertain'];

  const availableCategories = ['Organic', 'Plastic', 'Paper', 'Metal', 'Glass', 'E-Waste'];

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!suggestedCategory) {
      setFeedbackError('Please select what you think the correct category is.');
      return;
    }
    setSubmittingFeedback(true);
    setFeedbackError(null);
    try {
      await submitClassificationFeedback({
        record_id: record_id,
        actual_category: suggestedCategory,
        notes: feedbackNotes.trim(),
      });
      setFeedbackSuccess(true);
      setTimeout(() => {
        setShowFeedbackModal(false);
        setFeedbackSuccess(false);
        setSuggestedCategory('');
        setFeedbackNotes('');
      }, 2000);
    } catch (err) {
      setFeedbackError(err.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

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
                backgroundColor: colorTheme?.bg || '#EAF5EC',
                color: colorTheme?.text || '#16845B',
                borderColor: colorTheme?.border || '#D3EAD7',
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

      {/* Misclassification Feedback Trigger */}
      {record_id && (
        <div className="pt-2 border-t border-[#F2F9F3] flex justify-end">
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#52705F] hover:text-[#16845B] transition-colors"
          >
            <Flag className="w-3.5 h-3.5" />
            Report Misclassification
          </button>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FFFFFF] rounded-3xl border border-[#D3EAD7] shadow-modal w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowFeedbackModal(false)}
              className="absolute top-5 right-5 text-[#52705F] hover:text-[#183B2B]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#EAF5EC] flex items-center justify-center text-[#16845B]">
                <Flag className="w-4 h-4" />
              </div>
              <h4 className="text-lg font-bold text-[#183B2B]">Help Improve WasteWise</h4>
            </div>

            <p className="text-xs text-[#52705F] mb-4">
              AI predicted: <strong className="text-[#183B2B]">{predicted_class}</strong>. Your feedback will be queued for manual review by researchers to improve future models.
            </p>

            {feedbackSuccess ? (
              <div className="p-4 rounded-2xl bg-[#EAF5EC] border border-[#D3EAD7] text-center text-xs font-bold text-[#16845B] flex flex-col items-center gap-2 py-6">
                <CheckCircle2 className="w-8 h-8" />
                Thank you! Your feedback has been queued for administrator review.
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                {feedbackError && (
                  <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                    {feedbackError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#183B2B] mb-1.5">
                    What was the actual material? *
                  </label>
                  <select
                    value={suggestedCategory}
                    onChange={(e) => setSuggestedCategory(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#D3EAD7] bg-[#F7FAF7] text-sm text-[#183B2B] focus:outline-none focus:ring-2 focus:ring-[#16845B]"
                  >
                    <option value="">Select correct category...</option>
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#183B2B] mb-1.5">
                    Notes or Observations (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={feedbackNotes}
                    onChange={(e) => setFeedbackNotes(e.target.value)}
                    placeholder="e.g., Clear polyethylene water bottle, mistaken for glass due to reflections"
                    className="w-full px-3 py-2 rounded-xl border border-[#D3EAD7] bg-[#F7FAF7] text-xs text-[#183B2B] focus:outline-none focus:ring-2 focus:ring-[#16845B]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-4 py-2 text-xs font-bold text-[#52705F] hover:bg-[#F2F9F3] rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="px-5 py-2 text-xs font-bold bg-[#16845B] hover:bg-[#126e4b] text-white rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submittingFeedback ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
