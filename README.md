# 🪙 Gold Price API

Real-time Gold Price API สำหรับเช็คราคาทองคำในประเทศไทย

## 📋 Features

- ✅ ดึงราคาทองคำแบบ Real-time จากสมาคมค้าทองคำ
- ✅ ราคาทองคำแท่ง (Gold Bar) - ราคารับซื้อ/ขายออก
- ✅ ราคาทองรูปพรรณ (Gold Ornament) - ราคารับซื้อ/ขายออก
- ✅ Caching เพื่อลดการ request ซ้ำ (1 นาที)
- ✅ Price History tracking
- ✅ RESTful API

## 🚀 Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Get Current Gold Price
```
GET /api/gold/price
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "source": "Gold Traders Association (สมาคมค้าทองคำ)",
    "sourceUrl": "https://www.goldtraders.or.th/",
    "goldBar": {
      "buy": 43650,
      "sell": 43750,
      "buyFormatted": "43,650.00",
      "sellFormatted": "43,750.00"
    },
    "goldOrnament": {
      "buy": 43150.32,
      "sell": 44250,
      "buyFormatted": "43,150.32",
      "sellFormatted": "44,250.00"
    },
    "priceChange": "+50",
    "updateTime": "28 ธ.ค. 2567 เวลา 09:35:00",
    "currency": "THB",
    "unit": "บาทละ (per baht weight = 15.244 grams)",
    "cached": false
  },
  "fetchedAt": "2024-12-28T02:35:00.000Z"
}
```

### Get Price History
```
GET /api/gold/history
```

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2024-12-28T02:35:00.000Z",
      "goldBar": { "buy": 43650, "sell": 43750 },
      "goldOrnament": { "buy": 43150.32, "sell": 44250 },
      "priceChange": "+50"
    }
  ],
  "count": 1
}
```

### Force Refresh Price
```
GET /api/gold/refresh
```

### Compare Prices
```
GET /api/gold/compare
```

## 💡 Usage Examples

### Using cURL
```bash
# Get current price
curl http://localhost:3000/api/gold/price

# Force refresh
curl http://localhost:3000/api/gold/refresh

# Get history
curl http://localhost:3000/api/gold/history
```

### Using JavaScript (Fetch)
```javascript
// Get gold price
fetch('http://localhost:3000/api/gold/price')
  .then(res => res.json())
  .then(data => {
    console.log('ราคาทองคำแท่ง:', data.data.goldBar);
    console.log('ราคาทองรูปพรรณ:', data.data.goldOrnament);
  });
```

### Using Axios
```javascript
const axios = require('axios');

async function getGoldPrice() {
  const response = await axios.get('http://localhost:3000/api/gold/price');
  console.log(response.data);
}
```

## 📊 Data Source

ข้อมูลราคาทองคำมาจาก **สมาคมค้าทองคำ** (Gold Traders Association)
- Website: https://www.goldtraders.or.th/

## ⚠️ Notes

- ราคาทองคำแท่ง 96.5% และทองรูปพรรณ 96.5%
- หน่วยราคาเป็น "บาทละ" (1 บาททอง = 15.244 กรัม)
- ข้อมูลมี Cache 1 นาที เพื่อไม่ให้ request บ่อยเกินไป
- ใช้ `/api/gold/refresh` เพื่อ force update ราคาล่าสุด

## 📝 License

MIT
