import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as mockData from './mock_data.js'

function mockBackendPlugin() {
  return {
    name: 'mock-backend',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url.split('?')[0];

        if (url.startsWith('/api/v1/')) {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

          if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            return res.end();
          }

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
          };

          const handler = routes[url];
          if (handler) {
            try {
              const data = handler();
              res.statusCode = 200;
              return res.end(JSON.stringify(data));
            } catch (err) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: err.message }));
            }
          } else {
            res.statusCode = 404;
            return res.end(JSON.stringify({ error: `Mock endpoint ${url} not found` }));
          }
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mockBackendPlugin()],
  server: {
    port: 5173,
    allowedHosts: true,
  },
})
