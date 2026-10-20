import React from 'react';
import { Leaf, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto bg-[#FFFFFF] border-t border-[#D3EAD7] py-8 text-[#52705F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#EAF5EC] flex items-center justify-center text-[#16845B]">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="font-bold text-[#183B2B] text-sm">
              AI WasteWise
            </span>
            <span className="text-xs text-[#52705F]">
              — Smart Waste Classification & Segregation
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-[#16845B]">
              <ShieldCheck className="w-4 h-4" />
              MobileNetV3 Powered
            </span>
            <span>•</span>
            <span className="text-[#52705F]">
              Lightweight AI Inference
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[#F2F9F3] text-center text-[11px] text-[#52705F]">
          Final-Year Engineering Project • Engineered with React, Vite, FastAPI, PostgreSQL & TensorFlow
        </div>
      </div>
    </footer>
  );
}
