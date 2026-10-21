import React from 'react';
import {
  Sparkles,
  Camera,
  Search,
  MapPin,
  Trophy,
  ShieldCheck,
  ArrowRight,
  Cpu,
  BarChart2,
  Leaf,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react';

export default function HomePage({ onNavigate }) {
  return (
    <div className="space-y-16 py-4 animate-in fade-in duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-[#EAF5EC] bg-gradient-to-b from-[#EAF5EC] via-[#F2F9F3] to-[#FFFFFF] p-8 sm:p-14 border border-[#D3EAD7] shadow-[0_4px_20px_-2px_rgba(24,59,43,0.06)] text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFFFF] border border-[#D3EAD7] text-xs font-extrabold text-[#16845B] mb-6 shadow-xs">
          <Sparkles className="w-4 h-4 text-[#16845B]" />
          Powered by MobileNetV3 AI & MWCD Dataset (90.65% Test Accuracy)
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#183B2B] tracking-tight leading-tight max-w-3xl mx-auto">
          Intelligent Waste Sorting at the Speed of Light
        </h1>

        <p className="mt-4 sm:mt-6 text-base sm:text-lg text-[#52705F] max-w-2xl mx-auto leading-relaxed">
          AI WasteWise helps individuals, municipalities, and recycling facilities classify waste instantly from photos, verify disposal guidelines, and earn eco-points for sustainable living.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={() => onNavigate('classify')}
            className="px-6 sm:px-8 py-3.5 bg-[#16845B] hover:bg-[#126e4b] text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm sm:text-base group"
          >
            <Camera className="w-5 h-5 transition-transform group-hover:scale-110" />
            Classify Waste Now
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('guide')}
            className="px-6 sm:px-8 py-3.5 bg-[#FFFFFF] hover:bg-[#F2F9F3] text-[#183B2B] border border-[#D3EAD7] rounded-2xl font-bold shadow-xs hover:shadow-sm transition-all text-sm sm:text-base"
          >
            Explore Waste Guide
          </button>

          <button
            onClick={() => onNavigate('chat')}
            className="px-6 sm:px-8 py-3.5 bg-[#EAF5EC] hover:bg-[#D3EAD7] text-[#16845B] border border-[#D3EAD7] rounded-2xl font-bold shadow-xs hover:shadow-sm transition-all flex items-center gap-2 text-sm sm:text-base"
          >
            <MessageCircle className="w-5 h-5" />
            Chat with AI
          </button>
        </div>

        {/* Feature Badges */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-[#D3EAD7]/60 pt-8 text-left">
          <div className="bg-[#FFFFFF]/80 p-3.5 rounded-2xl border border-[#D3EAD7]">
            <div className="text-xl font-black text-[#16845B]">6 Classes</div>
            <div className="text-xs text-[#52705F] font-semibold">Plastic, Paper, Glass, Metal, Organic, E-Waste</div>
          </div>
          <div className="bg-[#FFFFFF]/80 p-3.5 rounded-2xl border border-[#D3EAD7]">
            <div className="text-xl font-black text-[#16845B]">90.65%</div>
            <div className="text-xs text-[#52705F] font-semibold">Held-Out Test Accuracy on Unseen Data</div>
          </div>
          <div className="bg-[#FFFFFF]/80 p-3.5 rounded-2xl border border-[#D3EAD7]">
            <div className="text-xl font-black text-[#16845B]">~28ms</div>
            <div className="text-xs text-[#52705F] font-semibold">Ultra-Fast MobileNetV3 Inference</div>
          </div>
          <div className="bg-[#FFFFFF]/80 p-3.5 rounded-2xl border border-[#D3EAD7]">
            <div className="text-xl font-black text-[#16845B]">100% Free</div>
            <div className="text-xs text-[#52705F] font-semibold">Open Sustainability Platform</div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#16845B]">
            Enterprise Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#183B2B]">
            Everything Needed for Modern Waste Management
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div
            onClick={() => onNavigate('classify')}
            className="cursor-pointer bg-[#FFFFFF] p-6 rounded-3xl border border-[#D3EAD7] shadow-card hover:border-[#16845B] transition group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#EAF5EC] flex items-center justify-center text-[#16845B] mb-4 group-hover:scale-105 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#183B2B] mb-2">Live Camera & Upload</h3>
            <p className="text-xs text-[#52705F] leading-relaxed">
              Capture waste items directly with your smartphone camera or upload JPG/PNG/WebP images up to 10MB with instant preview.
            </p>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => onNavigate('guide')}
            className="cursor-pointer bg-[#FFFFFF] p-6 rounded-3xl border border-[#D3EAD7] shadow-card hover:border-[#16845B] transition group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#EAF5EC] flex items-center justify-center text-[#16845B] mb-4 group-hover:scale-105 transition-transform">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#183B2B] mb-2">Verified Disposal Guide</h3>
            <p className="text-xs text-[#52705F] leading-relaxed">
              Preparation steps, recycling bin rules, and contamination warnings for organic, plastic, paper, metal, glass, and electronic waste.
            </p>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => onNavigate('locator')}
            className="cursor-pointer bg-[#FFFFFF] p-6 rounded-3xl border border-[#D3EAD7] shadow-card hover:border-[#16845B] transition group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#EAF5EC] flex items-center justify-center text-[#16845B] mb-4 group-hover:scale-105 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#183B2B] mb-2">Center Locator</h3>
            <p className="text-xs text-[#52705F] leading-relaxed">
              Find verified municipal drop-off sites and certified e-waste recyclers nearby with real-time distance calculation and directions.
            </p>
          </div>

          {/* Card 4 */}
          <div
            onClick={() => onNavigate('challenges')}
            className="cursor-pointer bg-[#FFFFFF] p-6 rounded-3xl border border-[#D3EAD7] shadow-card hover:border-[#16845B] transition group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#EAF5EC] flex items-center justify-center text-[#16845B] mb-4 group-hover:scale-105 transition-transform">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#183B2B] mb-2">Eco-Points & Streaks</h3>
            <p className="text-xs text-[#52705F] leading-relaxed">
              Earn reward points for recorded scans and verified actions, complete weekly challenges, unlock sustainable badges, and compete on leaderboards.
            </p>
          </div>

          {/* Card 5 */}
          <div
            onClick={() => onNavigate('dashboard')}
            className="cursor-pointer bg-[#FFFFFF] p-6 rounded-3xl border border-[#D3EAD7] shadow-card hover:border-[#16845B] transition group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#EAF5EC] flex items-center justify-center text-[#16845B] mb-4 group-hover:scale-105 transition-transform">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#183B2B] mb-2">Personalized Telemetry</h3>
            <p className="text-xs text-[#52705F] leading-relaxed">
              Review personal scan trends, material breakdown distributions, daily progress, and export scan history directly to CSV reports.
            </p>
          </div>

          {/* Card 6 */}
          <div
            onClick={() => onNavigate('classify')}
            className="cursor-pointer bg-[#FFFFFF] p-6 rounded-3xl border border-[#D3EAD7] shadow-card hover:border-[#16845B] transition group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#EAF5EC] flex items-center justify-center text-[#16845B] mb-4 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#183B2B] mb-2">Confidence Transparency</h3>
            <p className="text-xs text-[#52705F] leading-relaxed">
              Automatic uncertainty alerts trigger for confidence below 60%, with full softmax probability distributions and misclassification triage reporting.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto rounded-3xl bg-[#FFFFFF] p-8 sm:p-10 border border-[#D3EAD7] shadow-card">
        <h3 className="text-xl sm:text-2xl font-black text-[#183B2B] text-center mb-8">
          How AI WasteWise Works in 3 Steps
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#16845B] text-white font-black text-sm flex items-center justify-center mx-auto mb-3">
              1
            </div>
            <h4 className="font-bold text-[#183B2B] text-sm">Capture or Upload</h4>
            <p className="text-xs text-[#52705F]">
              Take a photo of your waste item using your webcam, mobile camera, or file picker.
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#16845B] text-white font-black text-sm flex items-center justify-center mx-auto mb-3">
              2
            </div>
            <h4 className="font-bold text-[#183B2B] text-sm">Deep Neural Inference</h4>
            <p className="text-xs text-[#52705F]">
              MobileNetV3 processes features through 30 fine-tuned layers and evaluates class confidence.
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#16845B] text-white font-black text-sm flex items-center justify-center mx-auto mb-3">
              3
            </div>
            <h4 className="font-bold text-[#183B2B] text-sm">Act & Earn Eco-Points</h4>
            <p className="text-xs text-[#52705F]">
              Follow bin-specific disposal guidance, locate a local drop-off center, and claim your points.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
