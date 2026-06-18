/**
 * Lumax Spend Cube — Mock Data
 * Covers all 11 wireframe dashboards + Universal Alert Center
 */

// ─── Dashboard 1: Executive Summary ───────────────────────────────────────
export function getSpendOverviewData() {
  return {
    "totalDirectSpend": 1250.5,
    "budgetedSpend": 1200.0,
    "variancePercent": 4.2,
    "yoyChange": 8.5,
    "activeSupplierCount": 450,
    "totalSkuCount": 12000,
    "entityWiseSpend": [
      {"name": "Entity A", "value": 500, "percentage": 40},
      {"name": "Entity B", "value": 450, "percentage": 36},
      {"name": "Entity C", "value": 300.5, "percentage": 24},
    ],
  };
}

export function getExecutiveSummary() {
  return {
    "alertSummary": {
      "critical": 3,
      "dueToday": 7,
      "escalated": 2,
    },
    "topRisks": [
      {"supplier": "Tata Steel", "category": "Raw Materials", "riskType": "Price Spike", "rating": "Red"},
      {"supplier": "Bosch India", "category": "Components", "riskType": "Single Source", "rating": "Yellow"},
      {"supplier": "JSW Steel", "category": "Raw Materials", "riskType": "Payment Delay", "rating": "Red"},
      {"supplier": "Motherson", "category": "Packaging", "riskType": "Rating Drop", "rating": "Yellow"},
      {"supplier": "Minda Corp", "category": "Components", "riskType": "Delivery Risk", "rating": "Red"},
    ],
    "treemapData": [
      {"name": "Raw Materials", "size": 600, "children": [
        {"name": "Steel", "size": 300},
        {"name": "Aluminum", "size": 180},
        {"name": "Copper", "size": 120},
      ]},
      {"name": "Components", "size": 450, "children": [
        {"name": "Electronics", "size": 220},
        {"name": "Plastics", "size": 130},
        {"name": "Rubber", "size": 100},
      ]},
      {"name": "Packaging", "size": 200, "children": [
        {"name": "Corrugated", "size": 120},
        {"name": "Labels", "size": 80},
      ]},
    ],
  };
}

// ─── Dashboard 2: Plant-wise Spend ────────────────────────────────────────
export function getPlantWiseSpend() {
  return [
    {"plant": "Gurugram", "spend": 400, "share": 32, "yoyGrowth": 9.2},
    {"plant": "Pune",     "spend": 350, "share": 28, "yoyGrowth": 6.5},
    {"plant": "Chennai",  "spend": 300, "share": 24, "yoyGrowth": 11.1},
    {"plant": "Manesar",  "spend": 200.5, "share": 16, "yoyGrowth": 4.8},
  ];
}

export function getPlantSpendTrend() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const gurugram = [62, 65, 70, 68, 72, 63];
  const pune = [55, 58, 60, 57, 62, 58];
  const chennai = [48, 50, 52, 55, 51, 44];
  const manesar = [32, 33, 35, 31, 34, 35];
  
  return months.map((m, i) => ({
    month: m,
    Gurugram: gurugram[i],
    Pune: pune[i],
    Chennai: chennai[i],
    Manesar: manesar[i],
  }));
}

// ─── Dashboard 3: Category-wise Spend ─────────────────────────────────────
export function getCategoryWiseSpend() {
  return [
    {"category": "Raw Materials", "spend": 600, "share": 48,  "yoyChange": 5,  "topSupplier": "Tata Steel"},
    {"category": "Components",    "spend": 450, "share": 36,  "yoyChange": 12, "topSupplier": "Bosch India"},
    {"category": "Packaging",     "spend": 200.5, "share": 16, "yoyChange": -2, "topSupplier": "ITC Paper"},
  ];
}

export function getCategoryTrend() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const rawMaterials = [95, 98, 102, 100, 105, 100];
  const components = [72, 75, 78, 74, 77, 74];
  const packaging = [32, 33, 34, 33, 35, 33];
  
  return months.map((m, i) => ({
    month: m,
    "Raw Materials": rawMaterials[i],
    Components: components[i],
    Packaging: packaging[i],
  }));
}

export function getSupplierCategoryMatrix() {
  return {
    "categories": ["Raw Materials", "Components", "Packaging"],
    "suppliers": [
      {"name": "Tata Steel",   "Raw Materials": 180, "Components": 0,   "Packaging": 0},
      {"name": "Bosch India",  "Raw Materials": 0,   "Components": 220, "Packaging": 0},
      {"name": "JSW Steel",    "Raw Materials": 120, "Components": 0,   "Packaging": 0},
      {"name": "ITC Paper",    "Raw Materials": 0,   "Components": 0,   "Packaging": 80},
      {"name": "Motherson",    "Raw Materials": 0,   "Components": 130, "Packaging": 0},
    ],
  };
}

// ─── Dashboard 4: Supplier-wise Spend ─────────────────────────────────────
export function getSupplierWiseSpend() {
  const suppliers = [
    ["Tata Steel",       300, 24.0, 6.2,  "60 days", "Manufacturer"],
    ["Bosch India",      220, 17.6, 11.5, "45 days", "Manufacturer"],
    ["JSW Steel",        120, 9.6,  4.8,  "60 days", "Manufacturer"],
    ["Motherson",        100, 8.0,  8.2,  "30 days", "Manufacturer"],
    ["ITC Paper",         80, 6.4,  -1.5, "30 days", "Trader"],
    ["Minda Corp",        75, 6.0,  15.0, "45 days", "Manufacturer"],
    ["Bharat Forge",      65, 5.2,  7.3,  "60 days", "Manufacturer"],
    ["Lumax Ancillary",   55, 4.4,  3.1,  "30 days", "Manufacturer"],
    ["Rane Holdings",     45, 3.6,  9.8,  "45 days", "Manufacturer"],
    ["Endurance Tech",    40, 3.2,  12.1, "45 days", "Manufacturer"],
  ];
  
  const total = suppliers.reduce((sum, s) => sum + s[1], 0);
  let cumulative = 0;
  
  const topSuppliers = suppliers.map(([name, spend, share, yoy, terms, mfr]) => {
    cumulative += spend;
    return {
      supplier: name,
      spend: spend,
      share: share,
      yoyChange: yoy,
      paymentTerms: terms,
      type: mfr,
      cumulative: Math.round((cumulative / total) * 100 * 10) / 10,
    };
  });
  
  return {
    "summary": {
      "totalSuppliers": 450,
      "activeSuppliers": 420,
      "newSuppliers": 18,
      "inactiveSuppliers": 30,
    },
    "topSuppliers": topSuppliers,
    "trend": [
      {"month": "Jan", "topTen": 90, "others": 110},
      {"month": "Feb", "topTen": 95, "others": 108},
      {"month": "Mar", "topTen": 98, "others": 115},
      {"month": "Apr", "topTen": 92, "others": 112},
      {"month": "May", "topTen": 100, "others": 118},
      {"month": "Jun", "topTen": 96, "others": 111},
    ],
  };
}

// ─── Dashboard 5: Sourcing Control ────────────────────────────────────────
export function getSourcingControl() {
  return {
    "summary": {
      "customerDirected": 520, "customerDirectedPct": 41.6,
      "lumaxControlled":  580, "lumaxControlledPct":  46.4,
      "jvDirected":       150, "jvDirectedPct":       12.0,
    },
    "trend": [
      {"month": "Jan", "Customer Directed": 82, "Lumax Controlled": 95, "JV Directed": 24},
      {"month": "Feb", "Customer Directed": 85, "Lumax Controlled": 98, "JV Directed": 25},
      {"month": "Mar", "Customer Directed": 88, "Lumax Controlled": 100, "JV Directed": 26},
      {"month": "Apr", "Customer Directed": 84, "Lumax Controlled": 96, "JV Directed": 24},
      {"month": "May", "Customer Directed": 90, "Lumax Controlled": 102, "JV Directed": 27},
      {"month": "Jun", "Customer Directed": 91, "Lumax Controlled": 89, "JV Directed": 24},
    ],
    "supplierDistribution": [
      {"type": "Customer Directed", "suppliers": 180},
      {"type": "Lumax Controlled",  "suppliers": 220},
      {"type": "JV Directed",        "suppliers": 50},
    ],
    "details": [
      {"type": "Customer Directed", "supplier": "Bosch India",  "spend": 220, "pct": 17.6},
      {"type": "Customer Directed", "supplier": "Denso India",  "spend": 180, "pct": 14.4},
      {"type": "Lumax Controlled",  "supplier": "Tata Steel",   "spend": 300, "pct": 24.0},
      {"type": "Lumax Controlled",  "supplier": "JSW Steel",    "spend": 120, "pct": 9.6},
      {"type": "JV Directed",       "supplier": "Minda Corp",   "spend": 75,  "pct": 6.0},
      {"type": "JV Directed",       "supplier": "Lumax JOPP",   "spend": 75,  "pct": 6.0},
    ],
  };
}

// ─── Dashboard 6: Import vs Domestic ──────────────────────────────────────
export function getImportDomestic() {
  return {
    "summary": {
      "importSpend": 312.5, "domesticSpend": 938.0,
      "importPct": 25.0,   "countries": 8,
    },
    "countryRanking": [
      {"country": "China",   "spend": 120, "supplierCount": 18, "flag": "🇨🇳"},
      {"country": "Germany", "spend": 80,  "supplierCount": 12, "flag": "🇩🇪"},
      {"country": "Japan",   "spend": 55,  "supplierCount": 8,  "flag": "🇯🇵"},
      {"country": "South Korea", "spend": 30, "supplierCount": 5, "flag": "🇰🇷"},
      {"country": "USA",     "spend": 18,  "supplierCount": 4,  "flag": "🇺🇸"},
      {"country": "Taiwan",  "spend": 9.5, "supplierCount": 3,  "flag": "🇹🇼"},
    ],
    "trend": [
      {"month": "Jan", "Import": 50, "Domestic": 150},
      {"month": "Feb", "Import": 52, "Domestic": 155},
      {"month": "Mar", "Import": 55, "Domestic": 160},
      {"month": "Apr", "Import": 51, "Domestic": 158},
      {"month": "May", "Import": 57, "Domestic": 162},
      {"month": "Jun", "Import": 47, "Domestic": 153},
    ],
  };
}

// ─── Dashboard 7: LME & Commodity Trends ──────────────────────────────────
export function getCommodityExposure() {
  return [
    {"commodity": "LME Copper",   "exposure": 250.0, "currentPrice": 8500, "unit": "USD/MT", "percentage": 20, "changePercent": 2.1},
    {"commodity": "LME Aluminum", "exposure": 375.0, "currentPrice": 2200, "unit": "USD/MT", "percentage": 30, "changePercent": -0.8},
    {"commodity": "Steel Index",  "exposure": 500.0, "currentPrice": 650,  "unit": "USD/MT", "percentage": 40, "changePercent": 1.5},
    {"commodity": "Forex USD/INR","exposure": 125.5, "currentPrice": 83.5, "unit": "INR",    "percentage": 10, "changePercent": 0.3},
  ];
}

export function getCommodityTrends() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const copper = [8200, 8350, 8500, 8420, 8600, 8500];
  const aluminum = [2100, 2150, 2200, 2180, 2250, 2200];
  const steel = [620,  635,  650,  640,  660,  650];
  const forex = [82.5, 82.8, 83.1, 83.5, 83.8, 83.5];
  
  const priceTrend = months.map((m, i) => ({
    month: m,
    Copper: copper[i],
    Aluminum: aluminum[i],
    Steel: steel[i],
  }));
  
  const forexTrend = months.map((m, i) => ({
    month: m,
    USD_INR: forex[i],
  }));

  return {
    "priceTrend": priceTrend,
    "forexTrend": forexTrend,
    "spendImpact": [
      {"commodity": "Copper",   "priceChange": 2.1,  "spendImpact": 5.25},
      {"commodity": "Aluminum", "priceChange": -0.8, "spendImpact": -3.0},
      {"commodity": "Steel",    "priceChange": 1.5,  "spendImpact": 7.5},
      {"commodity": "Forex",    "priceChange": 0.3,  "spendImpact": 0.38},
    ],
    "forecast": [
      {"month": "Jul", "Copper": 8650, "Aluminum": 2280, "Steel": 670, "isForecast": true},
      {"month": "Aug", "Copper": 8720, "Aluminum": 2310, "Steel": 680, "isForecast": true},
      {"month": "Sep", "Copper": 8800, "Aluminum": 2350, "Steel": 695, "isForecast": true},
    ],
    "alerts": [
      {"type": "Price Spike",  "commodity": "Copper",   "message": "Copper up 2.1% — ₹5.25 Cr impact"},
      {"type": "Price Spike",  "commodity": "Steel",    "message": "Steel up 1.5% — ₹7.5 Cr impact"},
      {"type": "Price Drop",   "commodity": "Aluminum", "message": "Aluminum down 0.8% — ₹3 Cr saving"},
    ],
  };
}

// ─── Dashboard 8: Supplier Ratings Overview ────────────────────────────────
export function getSupplierRatingsOverview() {
  return {
    "ratingSplit": [
      {"rating": "Green",  "count": 300, "percentage": 66.6},
      {"rating": "Yellow", "count": 100, "percentage": 22.2},
      {"rating": "Red",    "count":  50, "percentage": 11.2},
    ],
    "chronicRedSuppliers": 15,
    "criticalSuppliers": [
      {"supplier": "Alpha Parts",   "plant": "Gurugram", "rating": "Red",    "monthsInRed": 5},
      {"supplier": "Beta Metals",   "plant": "Pune",     "rating": "Red",    "monthsInRed": 4},
      {"supplier": "Gamma Casting", "plant": "Chennai",  "rating": "Red",    "monthsInRed": 3},
      {"supplier": "Delta Forge",   "plant": "Manesar",  "rating": "Yellow", "monthsInRed": 2},
      {"supplier": "Epsilon Auto",  "plant": "Gurugram", "rating": "Red",    "monthsInRed": 6},
    ],
  };
}

export function getSupplierRatingTrend() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const green = [280, 285, 290, 295, 298, 300];
  const yellow = [110, 108, 105, 104, 102, 100];
  const red = [60,  57,  55,  51,  50,  50];
  
  return months.map((m, i) => ({
    month: m,
    Green: green[i],
    Yellow: yellow[i],
    Red: red[i],
  }));
}

// ─── Dashboard 9: Plant-Level Rating ──────────────────────────────────────
export function getPlantLevelRating() {
  return [
    {"plant": "Gurugram", "Green": 70, "Yellow": 20, "Red": 10},
    {"plant": "Pune",     "Green": 60, "Yellow": 25, "Red": 15},
    {"plant": "Chennai",  "Green": 80, "Yellow": 15, "Red": 5},
    {"plant": "Manesar",  "Green": 50, "Yellow": 30, "Red": 20},
  ];
}

export function getPlantRatingTrend() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const gurugram = [68, 69, 70, 70, 71, 70];
  const pune = [58, 59, 60, 60, 61, 60];
  const chennai = [78, 79, 80, 80, 81, 80];
  const manesar = [48, 49, 50, 50, 51, 50];
  
  return months.map((m, i) => ({
    month: m,
    Gurugram: gurugram[i],
    Pune: pune[i],
    Chennai: chennai[i],
    Manesar: manesar[i],
  }));
}

// ─── Dashboard 10: Supplier Quality & Delivery ────────────────────────────
export function getQualityDeliveryScores() {
  return {
    "summary": {
      "avgQualityScore": 82.4, "avgDeliveryScore": 78.6,
      "avgTotalScore": 80.5, "trend": "+2.1",
    },
    "supplierScores": [
      {"supplier": "Tata Steel",    "quality": 92, "delivery": 88, "total": 90,  "rating": "Green"},
      {"supplier": "Bosch India",   "quality": 88, "delivery": 85, "total": 86.5,"rating": "Green"},
      {"supplier": "JSW Steel",     "quality": 75, "delivery": 70, "total": 72.5,"rating": "Yellow"},
      {"supplier": "Motherson",     "quality": 80, "delivery": 82, "total": 81,  "rating": "Green"},
      {"supplier": "ITC Paper",     "quality": 65, "delivery": 60, "total": 62.5,"rating": "Red"},
      {"supplier": "Minda Corp",    "quality": 78, "delivery": 75, "total": 76.5,"rating": "Yellow"},
      {"supplier": "Bharat Forge",  "quality": 85, "delivery": 80, "total": 82.5,"rating": "Green"},
      {"supplier": "Rane Holdings", "quality": 55, "delivery": 52, "total": 53.5,"rating": "Red"},
    ],
    "scoreTrend": [
      {"month": "Jan", "Quality": 80, "Delivery": 76},
      {"month": "Feb", "Quality": 81, "Delivery": 77},
      {"month": "Mar", "Quality": 82, "Delivery": 78},
      {"month": "Apr", "Quality": 81, "Delivery": 77},
      {"month": "May", "Quality": 83, "Delivery": 79},
      {"month": "Jun", "Quality": 82, "Delivery": 78},
    ],
  };
}

// ─── Dashboard 11: Quality Deep Dive ──────────────────────────────────────
export function getSupplierQualityDeepDive() {
  return {
    "rejectionRateTrend": [
      {"month": "Jan", "rate": 2.5},
      {"month": "Feb", "rate": 2.2},
      {"month": "Mar", "rate": 2.8},
      {"month": "Apr", "rate": 1.9},
      {"month": "May", "rate": 1.5},
      {"month": "Jun", "rate": 1.7},
    ],
    "ppmTrend": [
      {"month": "Jan", "ppm": 2500},
      {"month": "Feb", "ppm": 2200},
      {"month": "Mar", "ppm": 2800},
      {"month": "Apr", "ppm": 1900},
      {"month": "May", "ppm": 1500},
      {"month": "Jun", "ppm": 1700},
    ],
  };
}

export function getDefectData() {
  return {
    "summary": {
      "avgPpm": 2100, "rejectionPct": 2.1,
      "defectCount": 1250, "trend": "-12%",
    },
    "defectCategories": [
      {"category": "Dimensional",   "count": 450, "pct": 36},
      {"category": "Surface Defect","count": 300, "pct": 24},
      {"category": "Material",      "count": 250, "pct": 20},
      {"category": "Assembly",      "count": 150, "pct": 12},
      {"category": "Packaging",     "count": 100, "pct": 8},
    ],
    "supplierComparison": [
      {"supplier": "Alpha Parts",   "ppm": 3800},
      {"supplier": "Beta Metals",   "ppm": 3200},
      {"supplier": "Gamma Casting", "ppm": 2800},
      {"supplier": "Tata Steel",    "ppm": 1200},
      {"supplier": "Bosch India",   "ppm": 800},
    ],
    "heatmap": [
      {"plant": "Gurugram", "Alpha Parts": "high", "Bosch India": "low",    "Tata Steel": "low"},
      {"plant": "Pune",     "Alpha Parts": "high", "Bosch India": "medium", "Tata Steel": "low"},
      {"plant": "Chennai",  "Alpha Parts": "medium","Bosch India": "low",   "Tata Steel": "medium"},
      {"plant": "Manesar",  "Alpha Parts": "high", "Bosch India": "medium", "Tata Steel": "low"},
    ],
    "defectDetails": [
      {"supplier": "Alpha Parts",    "part": "Bracket-A12",  "ppm": 3800, "rejections": 45, "action": "CAPA Raised"},
      {"supplier": "Beta Metals",    "part": "Housing-B07",  "ppm": 3200, "rejections": 38, "action": "Audit Scheduled"},
      {"supplier": "Gamma Casting",  "part": "Cover-G04",    "ppm": 2800, "rejections": 32, "action": "Re-inspection"},
      {"supplier": "Delta Forge",    "part": "Shaft-D01",    "ppm": 2200, "rejections": 26, "action": "Under Review"},
      {"supplier": "Epsilon Auto",   "part": "Clip-E08",     "ppm": 1900, "rejections": 20, "action": "Closed"},
    ],
  };
}

// ─── Universal Alert Center ────────────────────────────────────────────────
export function getAlerts() {
  return [
    {
      "id": 101, "level": "L3", "severity": "High", "type": "AI Insight", "aiAlert": true, "aiType": "consolidation",
      "message": "Supplier consolidation is possible — Connector terminals",
      "dashboard": "/ai-supplier-consolidation", "time": "Just now",
      "details": {
        "subCategory": "Connector terminals", "category": "Electricals", "severity": "High",
        "message": "The Connector terminals sub-category under Electricals currently has 6 active suppliers in a single sub-category — above the 5-supplier threshold. The AI recommends consolidating to 3 suppliers, with an estimated saving of ~₹5.0 Cr in FY27.",
        "currentBase": 6, "recommendedBase": 3, "spend": "48 Cr", "saving": "5.0 Cr",
        "trigger": "More than 5 suppliers in one sub-category",
        "owner": "Category Manager - Electricals"
      }
    },
    {
      "id": 102, "level": "L3", "severity": "High", "type": "AI Insight", "aiAlert": true, "aiType": "variance",
      "message": "Same part priced differently across plants — Connector terminals",
      "dashboard": "/ai-part-price-variance", "time": "2m ago",
      "details": {
        "subCategory": "Connector terminals", "category": "Electricals", "severity": "High",
        "message": "In Connector terminals (Electricals), 26 of 128 SKUs are priced differently across plants for the same part and supplier. For example, CT-1042 costs ₹57 at Chakan but only ₹50 at Bawal — a 14% gap with no justification. Levelling every plant to each part's lowest validated price recovers ~₹28 L in FY27.",
        "skusAnalysed": 128, "skusWithGap": 26, "spend": "48 Cr", "saving": "28 L",
        "trigger": "Same part supplied at different prices across plants / suppliers",
        "owner": "Category Manager - Electricals"
      }
    },
    {"id": 1, "level": "L3", "severity": "Critical", "type": "Spend Budget Breach",
     "message": "Raw Materials spend exceeded budget by 8.3%", "dashboard": "/spend-overview", "time": "2h ago"},
    {"id": 2, "level": "L3", "severity": "Critical", "type": "Supplier Rating Drop",
     "message": "Alpha Parts dropped to Red — 5 consecutive months", "dashboard": "/supplier-performance", "time": "4h ago"},
    {"id": 3, "level": "L3", "severity": "Critical", "type": "Single Source Risk",
     "message": "Bosch India is sole source for 3 critical parts", "dashboard": "/supplier-wise-spend", "time": "6h ago"},
    {"id": 4, "level": "L2", "severity": "High", "type": "Price Variation Alert",
     "message": "LME Copper up 2.1% — ₹5.25 Cr spend impact", "dashboard": "/commodity-trends", "time": "1h ago"},
    {"id": 5, "level": "L2", "severity": "High", "type": "MSME Payment Delay",
     "message": "4 MSME suppliers beyond 45-day payment terms", "dashboard": "/supplier-wise-spend", "time": "3h ago"},
    {"id": 6, "level": "L1", "severity": "Medium", "type": "Spend Budget Breach",
     "message": "Components category at 92% of budget with 2 months remaining", "dashboard": "/category-wise-spend", "time": "5h ago"},
    {"id": 7, "level": "L1", "severity": "Medium", "type": "Supplier Rating Drop",
     "message": "Beta Metals moved from Yellow to Red this month", "dashboard": "/supplier-performance", "time": "8h ago"},
    {"id": 8, "level": "L0", "severity": "Info", "type": "Price Variation Alert",
     "message": "LME Aluminum down 0.8% — ₹3 Cr potential saving", "dashboard": "/commodity-trends", "time": "12h ago"},
  ];
}

// ─── AI Insights Data ──────────────────────────────────────────────────────
export function getSupplierConsolidation() {
  return {
    summary: {
      flaggedCategories: 6,
      currentBase: 40,
      recommendedBase: 21,
      potentialSaving: "18 Cr"
    },
    categorySummary: [
      { subCategory: "Connector / terminal", category: "Electricals", currentBase: 6, recommendedBase: 3, spend: "48 Cr", saving: "5.0 Cr" },
      { subCategory: "Resistor", category: "Electronics", currentBase: 7, recommendedBase: 4, spend: "31 Cr", saving: "3.1 Cr" },
      { subCategory: "Packing (C-Box)", category: "Packaging", currentBase: 7, recommendedBase: 4, spend: "26 Cr", saving: "2.6 Cr" },
      { subCategory: "Chemical", category: "Chemicals", currentBase: 7, recommendedBase: 4, spend: "18 Cr", saving: "2.4 Cr" },
      { subCategory: "Copper wire", category: "Electricals", currentBase: 7, recommendedBase: 4, spend: "16 Cr", saving: "1.9 Cr" },
      { subCategory: "Bare PCB", category: "Electronics", currentBase: 6, recommendedBase: 3, spend: "14 Cr", saving: "1.6 Cr" }
    ],
    deepDive: {
      "Connector / terminal": [
        { supplier: "Supplier A", sow: "19.2 Cr (40%)", rating: "Green", action: "Retain" },
        { supplier: "Supplier B", sow: "14.9 Cr (31%)", rating: "Green", action: "Retain" },
        { supplier: "Supplier C", sow: "5.8 Cr (12%)", rating: "Yellow", action: "Retain" },
        { supplier: "Supplier D", sow: "4.3 Cr (9%)", rating: "Yellow", action: "Exit" },
        { supplier: "Supplier E", sow: "2.4 Cr (5%)", rating: "Red", action: "Exit" },
        { supplier: "Supplier F", sow: "1.4 Cr (3%)", rating: "Red", action: "Exit" }
      ],
      "Resistor": [
        { supplier: "Supplier P", sow: "12.4 Cr (40%)", rating: "Green", action: "Retain" },
        { supplier: "Supplier Q", sow: "9.0 Cr (29%)", rating: "Green", action: "Retain" },
        { supplier: "Supplier R", sow: "4.6 Cr (15%)", rating: "Yellow", action: "Retain" },
        { supplier: "Supplier S", sow: "2.8 Cr (9%)", rating: "Yellow", action: "Exit" },
        { supplier: "Supplier T", sow: "1.5 Cr (5%)", rating: "Red", action: "Exit" },
        { supplier: "Supplier U", sow: "0.7 Cr (2%)", rating: "Red", action: "Exit" }
      ]
    }
  };
}

export function getPartPriceVariance() {
  return {
    summary: {
      flaggedCategories: 6,
      skusAnalysed: 467,
      skusWithGap: 101,
      potentialSaving: "99 L"
    },
    categorySummary: [
      { subCategory: "Connector terminals", category: "Electronics", skusAnalysed: 128, skusWithGap: 26, highestGap: "14%", saving: "28 L" },
      { subCategory: "Resistor", category: "Electronics", skusAnalysed: 96, skusWithGap: 18, highestGap: "11%", saving: "19 L" },
      { subCategory: "Cartons", category: "Packaging", skusAnalysed: 74, skusWithGap: 15, highestGap: "12%", saving: "16 L" },
      { subCategory: "Bolts", category: "Fasteners", skusAnalysed: 68, skusWithGap: 13, highestGap: "9%", saving: "12 L" },
      { subCategory: "Hoses", category: "Rubber", skusAnalysed: 54, skusWithGap: 11, highestGap: "10%", saving: "9 L" },
      { subCategory: "Wire harness", category: "Electricals", skusAnalysed: 47, skusWithGap: 9, highestGap: "8%", saving: "7 L" }
    ],
    deepDive: {
      "Connector terminals": [
        { sku: "CT-1042 2-pin housing", supplier: "Supplier A", bawal: 50, manesar: 52, gurgaon: 52, chakan: 57, minPrice: 50, annualQty: "1.8 L", saving: "6.8 L" },
        { sku: "CT-1078 6-pin connector", supplier: "Supplier B", bawal: 38, manesar: 40, gurgaon: 40, chakan: 43, minPrice: 38, annualQty: "1.2 L", saving: "4.2 L" },
        { sku: "CT-1130 terminal pin", supplier: "Supplier A", bawal: 16, manesar: 17, gurgaon: 17, chakan: 18.5, minPrice: 16, annualQty: "2.5 L", saving: "3.8 L" },
        { sku: "CT-1205 sealed cap", supplier: "Supplier C", bawal: 24, manesar: 25, gurgaon: 25, chakan: 27, minPrice: 24, annualQty: "0.9 L", saving: "2.0 L" },
        { sku: "CT-1260 lock clip", supplier: "Supplier B", bawal: 9.0, manesar: 9.3, gurgaon: 9.5, chakan: 10.0, minPrice: 9.0, annualQty: "1.1 L", saving: "1.2 L" }
      ]
    }
  };
}
