import React from 'react';
import { Trash2, Recycle, AlertOctagon, CheckCircle, Info, Sparkles } from 'lucide-react';

export default function GuidanceCard({ guidance }) {
  if (!guidance) return null;

  const {
    label,
    bin_color,
    bin_hex,
    recyclable,
    is_hazardous,
    description,
    disposal_instructions,
    environmental_impact,
  } = guidance;

  return (
    <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#D3EAD7] shadow-[0_4px_20px_-2px_rgba(24,59,43,0.06)] space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs uppercase font-extrabold tracking-wider text-[#52705F]">
          Segregation & Disposal Protocol
        </span>
        <h3 className="text-xl sm:text-2xl font-black text-[#183B2B] tracking-tight mt-1">
          {label}
        </h3>
        <p className="text-xs sm:text-sm text-[#52705F] mt-1">{description}</p>
      </div>

      {/* Badges Bar: Bin Color, Recyclability, Hazard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Recommended Bin */}
        <div className="p-3.5 rounded-2xl bg-[#F7FAF7] border border-[#D3EAD7] flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
            style={{ backgroundColor: bin_hex || '#16845B' }}
          >
            <Trash2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#52705F] uppercase tracking-wider">
              Target Bin
            </div>
            <div className="text-sm font-extrabold text-[#183B2B]">{bin_color} Bin</div>
          </div>
        </div>

        {/* Recyclability Status */}
        <div className="p-3.5 rounded-2xl bg-[#F7FAF7] border border-[#D3EAD7] flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-xs ${
            recyclable ? 'bg-[#EAF5EC] text-[#16845B]' : 'bg-gray-100 text-gray-500'
          }`}>
            <Recycle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#52705F] uppercase tracking-wider">
              Recyclability
            </div>
            <div className={`text-sm font-extrabold ${recyclable ? 'text-[#16845B]' : 'text-gray-600'}`}>
              {recyclable ? 'Recyclable' : 'Non-Recyclable'}
            </div>
          </div>
        </div>

        {/* Hazard Level */}
        <div className="p-3.5 rounded-2xl bg-[#F7FAF7] border border-[#D3EAD7] flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-xs ${
            is_hazardous ? 'bg-red-100 text-red-600' : 'bg-[#EAF5EC] text-[#16845B]'
          }`}>
            {is_hazardous ? <AlertOctagon className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#52705F] uppercase tracking-wider">
              Safety Risk
            </div>
            <div className={`text-sm font-extrabold ${is_hazardous ? 'text-red-600' : 'text-[#16845B]'}`}>
              {is_hazardous ? 'Hazardous Waste' : 'Standard Waste'}
            </div>
          </div>
        </div>
      </div>

      {/* Disposal Instructions */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#183B2B] mb-3 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-[#16845B]" />
          Recommended Action Steps
        </h4>
        <ul className="space-y-2.5">
          {disposal_instructions && disposal_instructions.map((step, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 p-3 rounded-2xl bg-[#F7FAF7] border border-[#D3EAD7]/60 text-xs sm:text-sm text-[#183B2B]"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#EAF5EC] text-[#16845B] font-bold text-xs flex items-center justify-center border border-[#D3EAD7]">
                {idx + 1}
              </span>
              <span className="leading-relaxed font-medium">{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Environmental Impact Card */}
      {environmental_impact && (
        <div className="p-4 rounded-2xl bg-[#EAF5EC] border border-[#D3EAD7] flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#16845B] shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-[#16845B] uppercase tracking-wider">
              Ecological Impact
            </div>
            <p className="text-xs sm:text-sm text-[#183B2B] font-medium leading-relaxed mt-0.5">
              {environmental_impact}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
