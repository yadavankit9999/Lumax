import * as mockData from '../mock_data.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// We apply the client-side mock interception ONLY if VITE_API_BASE_URL is not configured (or is empty/undefined)
if (!API_BASE) {
  const routes = {
    '/api/v1/spend/overview': mockData.getSpendOverviewData,
    '/api/v1/executive/summary': mockData.getExecutiveSummary,
    '/api/v1/spend/plant-wise': mockData.getPlantWiseSpend,
    '/api/v1/spend/plant-trend': mockData.getPlantSpendTrend,
    '/api/v1/spend/category-wise': mockData.getCategoryWiseSpend,
    '/api/v1/spend/category-trend': mockData.getCategoryTrend,
    '/api/v1/spend/supplier-category-matrix': mockData.getSupplierCategoryMatrix,
    '/api/v1/spend/supplier-wise': mockData.getSupplierWiseSpend,
    '/api/v1/spend/sourcing-control': mockData.getSourcingControl,
    '/api/v1/spend/import-domestic': mockData.getImportDomestic,
    '/api/v1/spend/commodity-exposure': mockData.getCommodityExposure,
    '/api/v1/commodity/trends': mockData.getCommodityTrends,
    '/api/v1/supplier/ratings': mockData.getSupplierRatingsOverview,
    '/api/v1/supplier/rating-trend': mockData.getSupplierRatingTrend,
    '/api/v1/supplier/plant-level': mockData.getPlantLevelRating,
    '/api/v1/supplier/plant-rating-trend': mockData.getPlantRatingTrend,
    '/api/v1/supplier/quality-delivery': mockData.getQualityDeliveryScores,
    '/api/v1/supplier/quality-deep-dive': mockData.getSupplierQualityDeepDive,
    '/api/v1/supplier/defects': mockData.getDefectData,
    '/api/v1/alerts': mockData.getAlerts,
    '/api/v1/ai-insights/supplier-consolidation': mockData.getSupplierConsolidation,
    '/api/v1/ai-insights/part-price-variance': mockData.getPartPriceVariance,
  };

  const originalFetch = window.fetch;
  window.fetch = async function (input, init) {
    let url = typeof input === 'string' ? input : input.url;

    // Clean up if it was prefixed with literally "undefined"
    if (url.startsWith('undefined/')) {
      url = url.replace('undefined/', '/');
    }

    // Parse the path (remove origin and query params)
    let path = url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        const parsed = new URL(url);
        path = parsed.pathname;
      } catch (e) {
        // Fallback if URL is invalid
      }
    } else if (!url.startsWith('/')) {
      // It's a relative URL, let's treat it as relative to the current site root
      path = '/' + url;
    }
    // Remove query parameters
    path = path.split('?')[0];

    const handler = routes[path];
    if (handler) {
      // Simulate slight network delay
      await new Promise((resolve) => setTimeout(resolve, 200));
      try {
        const data = handler();
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return originalFetch.apply(this, arguments);
  };
  console.log('Client-side API mocking activated (VITE_API_BASE_URL is not set).');
}
