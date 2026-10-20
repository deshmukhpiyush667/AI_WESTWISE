"""
AI WasteWise - Disposal Guidance and Waste Category Knowledge Base
Provides disposal instructions, recommended bin color codes, recyclability status,
and environmental hazard warnings for all supported classes.
"""

from typing import Dict, Any

CATEGORIES_INFO: Dict[str, Dict[str, Any]] = {
    "Organic": {
        "label": "Organic / Biodegradable",
        "bin_color": "Green",
        "bin_hex": "#16845B",
        "recyclable": True,
        "is_hazardous": False,
        "description": "Food scraps, vegetable peels, garden waste, tea bags, and biodegradable matter.",
        "disposal_instructions": [
            "Segregate from non-biodegradable waste immediately to prevent contamination.",
            "Deposit in the green composting or organic wet waste bin.",
            "Can be turned into organic compost or vermicompost for home gardening."
        ],
        "environmental_impact": "Organic waste diverted from landfills reduces methane emissions significantly."
    },
    "Plastic": {
        "label": "Plastic Waste",
        "bin_color": "Blue",
        "bin_hex": "#2563EB",
        "recyclable": True,
        "is_hazardous": False,
        "description": "PET bottles, beverage containers, polythene packaging, food wrappers, clean containers.",
        "disposal_instructions": [
            "Rinse and clean any residual food, liquids, or oil from the container.",
            "Flatten plastic bottles to conserve space in recycling bins.",
            "Separate bottle caps and place in the dry recyclables bin (Blue)."
        ],
        "environmental_impact": "Recycling 1 ton of plastic saves up to 5,774 kWh of electricity and 16.3 barrels of oil."
    },
    "Paper": {
        "label": "Paper & Cardboard",
        "bin_color": "Blue",
        "bin_hex": "#0284C7",
        "recyclable": True,
        "is_hazardous": False,
        "description": "Newspapers, magazines, corrugated cardboard, envelopes, paper bags, egg cartons.",
        "disposal_instructions": [
            "Keep clean and dry; wet or oil-stained paper cannot be recycled.",
            "Flatten cardboard cartons and remove non-paper packing tapes.",
            "Drop in dry recyclable paper bin or bundle for local paper recycling drives."
        ],
        "environmental_impact": "Every ton of recycled paper preserves approximately 17 mature trees and 7,000 gallons of water."
    },
    "Metal": {
        "label": "Metal & Cans",
        "bin_color": "Yellow / Silver",
        "bin_hex": "#D97706",
        "recyclable": True,
        "is_hazardous": False,
        "description": "Aluminum soda cans, tin cans, foil trays, metal bottle caps, clean metal scrap.",
        "disposal_instructions": [
            "Empty and rinse all liquid or food residue.",
            "Crush aluminum cans if possible to optimize collection bin volume.",
            "Place inside designated metal recycling receptacles."
        ],
        "environmental_impact": "Recycling aluminum requires 95% less energy than producing aluminum from bauxite ore."
    },
    "Glass": {
        "label": "Glass Ware & Bottles",
        "bin_color": "Cyan / Red",
        "bin_hex": "#0D9488",
        "recyclable": True,
        "is_hazardous": False,
        "description": "Clear and colored glass bottles, glass jars, non-broken glass beverage containers.",
        "disposal_instructions": [
            "Rinse thoroughly and remove metal or plastic caps.",
            "Do not break; broken glass presents safety hazards to sanitation workers.",
            "Place in dedicated glass collection bins. Wrap any broken glass safely in thick paper before disposal."
        ],
        "environmental_impact": "Glass is 100% recyclable and can be melted and remanufactured indefinitely without quality loss."
    },
    "E-Waste": {
        "label": "E-Waste & Hazardous",
        "bin_color": "Red / Black",
        "bin_hex": "#DC2626",
        "recyclable": True,
        "is_hazardous": True,
        "description": "Batteries, consumer electronics, circuit boards, chargers, fluorescent bulbs, power banks.",
        "disposal_instructions": [
            "NEVER throw into general trash or wet waste bins due to heavy metal toxicity.",
            "Store in a dry location and tape battery terminals with electrical tape.",
            "Hand over directly to certified e-waste recyclers or designated municipal drop-off centers."
        ],
        "environmental_impact": "Prevents lead, mercury, and cadmium from leaching into groundwater and agricultural soil."
    }
}

UNCERTAIN_GUIDANCE = {
    "label": "Uncertain / Unrecognized Object",
    "bin_color": "Grey",
    "bin_hex": "#64748B",
    "recyclable": False,
    "is_hazardous": False,
    "description": "The AI model confidence is below the threshold or the image is ambiguous.",
    "disposal_instructions": [
        "Please ensure the image is well-lit, sharp, and focused primarily on the waste item.",
        "If unsure, inspect whether the item has a recycling triangular symbol (RIC 1-7).",
        "Dry materials (clean paper, plastic, metal) belong in dry waste; organic food matter belongs in wet waste."
    ],
    "environmental_impact": "Accurate waste segregation at the source prevents cross-contamination of entire recycling batches."
}

def get_disposal_guidance(category: str) -> Dict[str, Any]:
    """Retrieve detailed disposal advice for a given category name."""
    return CATEGORIES_INFO.get(category, UNCERTAIN_GUIDANCE)
