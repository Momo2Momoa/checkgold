const express = require('express');
const router = express.Router();
const goldService = require('../services/gold.service');

// GET /api/gold/price - Get current gold price
router.get('/price', async (req, res) => {
    try {
        const goldPrice = await goldService.getGoldPrice();
        res.json({
            success: true,
            data: goldPrice,
            fetchedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching gold price:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch gold price',
            message: error.message
        });
    }
});

// GET /api/gold/history - Get price history (cached)
router.get('/history', async (req, res) => {
    try {
        const history = goldService.getPriceHistory();
        res.json({
            success: true,
            data: history,
            count: history.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch price history',
            message: error.message
        });
    }
});

// GET /api/gold/refresh - Force refresh price
router.get('/refresh', async (req, res) => {
    try {
        const goldPrice = await goldService.refreshGoldPrice();
        res.json({
            success: true,
            data: goldPrice,
            message: 'Price refreshed successfully',
            fetchedAt: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to refresh gold price',
            message: error.message
        });
    }
});

// GET /api/gold/compare - Compare gold prices from multiple sources
router.get('/compare', async (req, res) => {
    try {
        const comparison = await goldService.compareGoldPrices();
        res.json({
            success: true,
            data: comparison,
            fetchedAt: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to compare gold prices',
            message: error.message
        });
    }
});

module.exports = router;
