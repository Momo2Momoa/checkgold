const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');

// Cache for 1 minute (60 seconds)
const cache = new NodeCache({ stdTTL: 60 });
const CACHE_KEY = 'gold_price';
const HISTORY_KEY = 'gold_history';

// Price history storage (in-memory)
let priceHistory = [];
const MAX_HISTORY = 100;

/**
 * Scrape gold price from Gold Traders Association (สมาคมค้าทองคำ)
 * Source: https://www.goldtraders.or.th/
 */
async function scrapeGoldTradersPrice() {
    try {
        const response = await axios.get('https://www.goldtraders.or.th/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'th,en-US;q=0.9,en;q=0.8'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);

        // ราคาทองคำแท่ง (Gold Bar)
        const goldBarBuy = $('#DetailPlace_uc_goldprices1_lblBLBuy').text().trim() ||
            $('span[id*="lblBLBuy"]').first().text().trim();
        const goldBarSell = $('#DetailPlace_uc_goldprices1_lblBLSell').text().trim() ||
            $('span[id*="lblBLSell"]').first().text().trim();

        // ราคาทองรูปพรรณ (Gold Ornament)
        const goldOrnamentBuy = $('#DetailPlace_uc_goldprices1_lblOMBuy').text().trim() ||
            $('span[id*="lblOMBuy"]').first().text().trim();
        const goldOrnamentSell = $('#DetailPlace_uc_goldprices1_lblOMSell').text().trim() ||
            $('span[id*="lblOMSell"]').first().text().trim();

        // Price change
        const priceChange = $('#DetailPlace_uc_goldprices1_lblDiff').text().trim() ||
            $('span[id*="lblDiff"]').first().text().trim();

        // Update time
        const updateTime = $('#DetailPlace_uc_goldprices1_lblAsOn').text().trim() ||
            $('span[id*="lblAsOn"]').first().text().trim();

        return {
            source: 'Gold Traders Association (สมาคมค้าทองคำ)',
            sourceUrl: 'https://www.goldtraders.or.th/',
            goldBar: {
                buy: parsePrice(goldBarBuy),
                sell: parsePrice(goldBarSell),
                buyFormatted: goldBarBuy || 'N/A',
                sellFormatted: goldBarSell || 'N/A'
            },
            goldOrnament: {
                buy: parsePrice(goldOrnamentBuy),
                sell: parsePrice(goldOrnamentSell),
                buyFormatted: goldOrnamentBuy || 'N/A',
                sellFormatted: goldOrnamentSell || 'N/A'
            },
            priceChange: priceChange || '0',
            updateTime: updateTime || new Date().toLocaleString('th-TH'),
            currency: 'THB',
            unit: 'บาทละ (per baht weight = 15.244 grams)'
        };
    } catch (error) {
        console.error('Error scraping Gold Traders:', error.message);
        throw new Error('Failed to fetch from Gold Traders Association');
    }
}

/**
 * Get international gold price from API
 */
async function getInternationalGoldPrice() {
    try {
        // Using a free API for gold prices
        const response = await axios.get('https://api.metalpriceapi.com/v1/latest?api_key=demo&base=XAU&currencies=USD,THB', {
            timeout: 10000
        });

        if (response.data && response.data.rates) {
            return {
                source: 'International Market',
                pricePerOunce: {
                    USD: response.data.rates.USD ? (1 / response.data.rates.USD).toFixed(2) : null,
                    THB: response.data.rates.THB ? (response.data.rates.THB / response.data.rates.USD).toFixed(2) : null
                }
            };
        }
    } catch (error) {
        console.log('International price API not available, using Thai source only');
        return null;
    }
}

/**
 * Parse price string to number
 */
function parsePrice(priceStr) {
    if (!priceStr) return null;
    const cleaned = priceStr.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
}

/**
 * Get gold price (with caching)
 */
async function getGoldPrice() {
    // Check cache first
    const cachedPrice = cache.get(CACHE_KEY);
    if (cachedPrice) {
        return {
            ...cachedPrice,
            cached: true
        };
    }

    // Fetch new price
    const price = await scrapeGoldTradersPrice();

    // Store in cache
    cache.set(CACHE_KEY, price);

    // Add to history
    addToHistory(price);

    return {
        ...price,
        cached: false
    };
}

/**
 * Force refresh gold price
 */
async function refreshGoldPrice() {
    cache.del(CACHE_KEY);
    return await getGoldPrice();
}

/**
 * Add price to history
 */
function addToHistory(price) {
    const historyEntry = {
        timestamp: new Date().toISOString(),
        goldBar: price.goldBar,
        goldOrnament: price.goldOrnament,
        priceChange: price.priceChange
    };

    priceHistory.unshift(historyEntry);

    // Keep only last MAX_HISTORY entries
    if (priceHistory.length > MAX_HISTORY) {
        priceHistory = priceHistory.slice(0, MAX_HISTORY);
    }
}

/**
 * Get price history
 */
function getPriceHistory() {
    return priceHistory;
}

/**
 * Compare prices from multiple sources
 */
async function compareGoldPrices() {
    const [thaiPrice, intlPrice] = await Promise.all([
        scrapeGoldTradersPrice().catch(() => null),
        getInternationalGoldPrice().catch(() => null)
    ]);

    return {
        thailand: thaiPrice,
        international: intlPrice,
        comparison: {
            note: 'Thai gold prices are in THB per baht weight (1 baht weight = 15.244 grams)',
            internationalNote: 'International prices are per troy ounce (31.1035 grams)'
        }
    };
}

module.exports = {
    getGoldPrice,
    refreshGoldPrice,
    getPriceHistory,
    compareGoldPrices
};
