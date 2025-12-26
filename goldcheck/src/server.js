const express = require('express');
const cors = require('cors');
const goldRoutes = require('./routes/gold.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/gold', goldRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Gold Price API is running'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Gold Price API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      goldPrice: '/api/gold/price',
      goldPriceHistory: '/api/gold/history',
      goldPriceRefresh: '/api/gold/refresh'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🪙 Gold Price API running at http://localhost:${PORT}`);
  console.log(`📊 Get gold price: http://localhost:${PORT}/api/gold/price`);
});
