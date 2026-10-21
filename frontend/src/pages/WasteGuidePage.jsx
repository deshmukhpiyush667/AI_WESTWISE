import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Recycle,
  Sparkles,
  Info,
  ChevronRight,
} from 'lucide-react';
import { CATEGORIES } from '../utils/constants';

const WASTE_GUIDE_DATA = {
  Organic: {
    color: '#16845B',
    bgColor: '#EAF5EC',
    binName: 'Green Bin / Compost',
    description: 'Biodegradable food scraps, kitchen waste, garden cuttings, and non-treated natural materials.',
    acceptedItems: [
      'Fruit peels, vegetable scraps, and cores',
      'Coffee grounds, paper tea bags (staple-free)',
      'Eggshells and nut shells',
      'Leftover cooked rice, grains, and breads',
      'Garden leaves, trimmed twigs, and grass',
      'Unbleached soiled napkins (small amounts)',
    ],
    notAccepted: [
      'Plastic bags or bio-plastic wraps unless certified home compostable',
      'Pet feces or cat litter (pathogen risks)',
      'Large treated wood logs or chemical fertilizer residues',
      'Cooking oils or deep fry fats in bulk (dispose at bio-oil facilities)',
    ],
    prepTips: [
      'Drain excess liquid before discarding to reduce bin odor and vector breeding.',
      'Wrap moist kitchen waste in a single sheet of newsprint if municipal collection allows.',
      'Keep meat and dairy scraps separate if doing home backyard bin composting.',
    ],
    impact: 'Diverting organic waste from landfills prevents methane emission—a greenhouse gas 28x more potent than CO2.',
  },
  Plastic: {
    color: '#2563EB',
    bgColor: '#EFF6FF',
    binName: 'Blue Bin / Dry Recyclables',
    description: 'Rigid clean plastic bottles, jugs, tubs, and clean polymer packaging (primarily SPI codes 1, 2, and 5).',
    acceptedItems: [
      'PET clear water bottles and carbonated beverage containers (#1)',
      'HDPE milk jugs, shampoo bottles, and detergent jugs (#2)',
      'PP food containers, yogurt tubs, and takeout trays (#5)',
      'Clean rigid plastic caps (screwed onto crushed bottles)',
    ],
    notAccepted: [
      'Plastic grocery film bags, bubble wrap, and cling film (tangles sorting equipment)',
      'Styrofoam or expanded polystyrene (#6)',
      'Multi-layer chip bags with metalized foil liners',
      'Heavily grease-soaked food containers with unrinsed sauce',
    ],
    prepTips: [
      'Rinse lightly to remove grease and food remnants (no need to run through a dishwasher).',
      'Crush empty bottles to conserve bin and truck collection space.',
      'Screw plastic lids back on bottles so they do not fall through sorting grates.',
    ],
    impact: 'Recycling 1 ton of plastic saves approximately 5,774 kWh of electricity and 16.3 barrels of petroleum oil.',
  },
  Paper: {
    color: '#0284C7',
    bgColor: '#F0F9FF',
    binName: 'Blue Bin / Paper Collection',
    description: 'Dry fibers, office sheets, non-waxed cardboard, cartons, and clean paperboard packaging.',
    acceptedItems: [
      'Corrugated cardboard boxes and shipping parcels',
      'Clean office sheets, letters, and printed brochures',
      'Newspapers, magazines, and telephone directories',
      'Cereal boxes and egg cartons made from pressed pulp',
    ],
    notAccepted: [
      'Pizza boxes with soaked grease/oil stains (tear off clean lids for recycling)',
      'Thermal receipt paper (often coated with BPA/BPS)',
      'Wax-lined cups or silicone baking paper',
      'Used tissue papers, paper towels, or wet sanitary wipes',
    ],
    prepTips: [
      'Flatten all corrugated cardboard boxes to maximize bin space.',
      'Remove broad packing tape or polystyrene peanuts before discarding.',
      'Keep paper dry; wet cellulose fibers break down prematurely and spoil pulp bales.',
    ],
    impact: 'Recycling 1 ton of paper saves 17 mature trees, 7,000 gallons of fresh water, and 3 cubic yards of landfill room.',
  },
  Metal: {
    color: '#D97706',
    bgColor: '#FEF3C7',
    binName: 'Yellow / Dry Metals Bin',
    description: 'Ferrous and non-ferrous metals including aluminum beverage cans, tin food tins, and clean steel containers.',
    acceptedItems: [
      'Aluminum beverage cans (soda, seltzer, beer)',
      'Tin-plated steel food cans (soups, beans, tomato puree)',
      'Clean aluminum foil and pie tins (free of food residue)',
      'Metal jar lids and crown bottle caps',
    ],
    notAccepted: [
      'Pressurized aerosol cans containing flammable propellants or paint',
      'Scrap electrical wiring or metal automotive engine parts',
      'Needles, sharps, or medical syringes',
      'Propane tanks or gas canisters (explosive hazard at sorting hubs)',
    ],
    prepTips: [
      'Rinse empty soup/beverage cans clean of remaining sauces or sugar.',
      'Push sharp tin can lids safely inside the empty can.',
      'Aluminum can be recycled indefinitely without losing structural purity.',
    ],
    impact: 'Producing recycled aluminum consumes 95% less energy than extracting virgin alumina from raw bauxite ore.',
  },
  Glass: {
    color: '#0D9488',
    bgColor: '#F0FDFA',
    binName: 'Glass Recycling Bin',
    description: 'Container glass including transparent, green, and brown bottles, beverage flasks, and culinary jars.',
    acceptedItems: [
      'Beverage glass bottles (beer, soda, wine, spirits)',
      'Food condiment jars (pasta sauce, jam, mayonnaise)',
      'Clear cosmetic glass containers (perfume bottles, lotions)',
    ],
    notAccepted: [
      'Ceramic mugs, porcelain dinner plates, and clay pottery',
      'Window panes, mirrors, and vehicle windshields',
      'Pyrex or heat-resistant tempered baking dishes',
      'Incandescent or fluorescent light bulbs',
    ],
    prepTips: [
      'Rinse out food remains; labels do not need to be removed (they burn off in the cullet furnace).',
      'Separate metal lids and sort them into the metal recycling bin.',
      'Do not break bottles before recycling—broken shards endanger sorting line workers.',
    ],
    impact: 'Glass is 100% infinitely recyclable. Every 6 tons of recycled glass containers saves 1 ton of carbon dioxide emissions.',
  },
  'E-Waste': {
    color: '#DC2626',
    bgColor: '#FEF2F2',
    binName: 'Specialized E-Waste Drop-Off Center',
    description: 'Electronic apparatus, printed circuit boards, battery assemblies, peripherals, and electrical cables.',
    acceptedItems: [
      'Discarded smartphones, tablets, laptops, and chargers',
      'Computer monitors, towers, keyboards, and mice',
      'Household power adapters, cables, and remote controls',
      'Small kitchen electric appliances (toasters, blenders)',
    ],
    notAccepted: [
      'Standard municipal curbside wheelie bins (NEVER place e-waste in domestic trash)',
      'Swollen or punctured lithium-ion pouch batteries (fire hazard—tape contacts immediately)',
      'Industrial lead-acid automotive batteries (return to certified auto mechanics)',
    ],
    prepTips: [
      'Perform factory data wipes and remove storage cards before handing over computing equipment.',
      'Tape over exposed battery terminals using non-conductive electrical tape.',
      'Take e-waste directly to certified drop-off centers or authorized municipal take-back days.',
    ],
    impact: 'Recovering metals from 1 million recycled cell phones yields 35,000 lbs of copper, 772 lbs of silver, and 75 lbs of pure gold.',
  },
};

export default function WasteGuidePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredCategories = Object.entries(WASTE_GUIDE_DATA).filter(([name, data]) => {
    const matchesCategory = selectedCategory === 'All' || selectedCategory === name;
    if (!matchesCategory) return false;

    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    const matchesName = name.toLowerCase().includes(term);
    const matchesDesc = data.description.toLowerCase().includes(term);
    const matchesItems = data.acceptedItems.some((item) => item.toLowerCase().includes(term));
    const matchesAvoid = data.notAccepted.some((item) => item.toLowerCase().includes(term));
    return matchesName || matchesDesc || matchesItems || matchesAvoid;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF5EC] text-xs font-bold text-[#16845B]">
          <Recycle className="w-4 h-4" />
          Official Waste Sorting Guidelines
        </div>
        <h2 className="text-3xl font-black text-[#183B2B] tracking-tight">
          Comprehensive Waste Disposal Guide
        </h2>
        <p className="text-xs sm:text-sm text-[#52705F]">
          Learn how to prepare, clean, and properly dispose of all 6 waste categories recognized by our AI classifier.
        </p>
      </div>

      {/* Search & Category Pills */}
      <div className="bg-[#FFFFFF] p-4 sm:p-6 rounded-3xl border border-[#D3EAD7] shadow-card space-y-4 max-w-4xl mx-auto">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-3 text-[#52705F]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search items like 'water bottle', 'pizza box', 'cell phone', 'aluminum'..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-[#D3EAD7] bg-[#F7FAF7] text-sm text-[#183B2B] placeholder:text-[#52705F]/60 focus:outline-none focus:ring-2 focus:ring-[#16845B]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F2F9F3]">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedCategory === 'All'
                ? 'bg-[#16845B] text-white shadow-xs'
                : 'bg-[#F7FAF7] text-[#52705F] hover:bg-[#EAF5EC]'
            }`}
          >
            All Categories (6)
          </button>
          {Object.keys(WASTE_GUIDE_DATA).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedCategory === cat
                  ? 'bg-[#16845B] text-white shadow-xs'
                  : 'bg-[#F7FAF7] text-[#52705F] hover:bg-[#EAF5EC]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Category Guide Cards */}
      <div className="space-y-6 max-w-4xl mx-auto">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12 bg-[#FFFFFF] rounded-3xl border border-[#D3EAD7] p-8">
            <Info className="w-8 h-8 text-[#52705F] mx-auto mb-2" />
            <h4 className="font-bold text-[#183B2B]">No matching items found</h4>
            <p className="text-xs text-[#52705F] mt-1">Try another search term or clear the filter.</p>
          </div>
        ) : (
          filteredCategories.map(([category, guide]) => (
            <div
              key={category}
              className="bg-[#FFFFFF] rounded-3xl border border-[#D3EAD7] shadow-card overflow-hidden transition hover:border-[#16845B]"
            >
              {/* Card Header */}
              <div
                className="p-6 sm:p-8 border-b border-[#D3EAD7]/50"
                style={{ backgroundColor: guide.bgColor }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span
                      className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg"
                      style={{ backgroundColor: '#FFFFFF', color: guide.color }}
                    >
                      {guide.binName}
                    </span>
                    <h3 className="text-2xl font-black text-[#183B2B] mt-2">{category}</h3>
                  </div>
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-xs"
                    style={{ backgroundColor: guide.color }}
                  >
                    {category[0]}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-[#183B2B]/80 mt-3 leading-relaxed">
                  {guide.description}
                </p>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Accepted */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-[#16845B]">
                      <CheckCircle2 className="w-4 h-4" />
                      ACCEPTED IN RECYCLING / DISPOSAL
                    </div>
                    <ul className="space-y-2 text-xs text-[#183B2B]">
                      {guide.acceptedItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#16845B] mt-1.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Prohibited */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                      DO NOT INCLUDE (CONTAMINANTS)
                    </div>
                    <ul className="space-y-2 text-xs text-[#52705F]">
                      {guide.notAccepted.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Preparation Rules */}
                <div className="bg-[#F7FAF7] p-4 rounded-2xl border border-[#D3EAD7] space-y-2">
                  <div className="text-xs font-bold text-[#183B2B]">Preparation & Handling Instructions:</div>
                  <ul className="space-y-1.5 text-xs text-[#52705F]">
                    {guide.prepTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-[#16845B] mt-0.5 shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Eco Impact */}
                <div className="p-3.5 rounded-2xl bg-[#EAF5EC] text-xs text-[#16845B] font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>{guide.impact}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
