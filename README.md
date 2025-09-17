# 🚀 Sekampadi Fake Data Injection Tool - Optimized Version

Tool modern dan komprehensif untuk menginjeksi data survey palsu ke sistem Sekampadi Kalbar dengan antarmuka web yang responsif, fitur testing yang canggih, dan dark mode support.

## ✨ Fitur Utama

- **🌟 Modern Web Interface**: UI responsif dengan Tailwind CSS + Dark Mode
- **⚡ Injeksi Otomatis**: Pengambilan CSRF token dan session cookies otomatis
- **🔍 API Testing Panel**: Testing komprehensif dengan console log real-time
- **📊 Batch Operations**: Operasi multi-test dengan progress tracking
- **🎲 Smart Randomization**: Auto-generate data personal dan feedback
- **📈 Real-time Monitoring**: Progress tracking dengan detailed feedback
- **💾 Export Results**: Export hasil testing dalam format JSON
- **🌙 Dark Mode**: Theme switching dengan localStorage persistence
- **📱 Responsive Design**: Optimal di desktop dan mobile
 

### Key Improvements:
- ✅ **Modular Architecture**: Pemisahan logic yang lebih baik
- ✅ **Console Logging**: Real-time API testing dengan console log
- ✅ **Dark Mode**: Theme switching modern
- ✅ **Better UX**: Progress tracking dan collapsible sections
- ✅ **External API Testing**: Support testing endpoint eksternal
- ✅ **Error Handling**: Error handling yang lebih robust

## 🚀 Quick Start

### Prerequisites

```bash
Node.js >= 16.0.0
npm >= 8.0.0
Koneksi internet stabil
```

### Installation

1. **Clone/Download project**
```bash
git clone https://github.com/risunCode/SP_Perkim_Inject.git
cd SP_Perkim_Inject
```

2. **Install dependencies**
```bash
npm install express axios cheerio
```

3. **Start server**
```bash
node server.js
```

4. **Access aplikasi**
```
Main App: http://localhost:3000
API Testing & Batch Operations: http://localhost:3000/testing
Health Check: http://localhost:3000/api/health
```

## 📖 Cara Penggunaan

### 🎯 Main Interface (Single Injection)

1. **Akses** `http://localhost:3000`
2. **Configure Data:**
   - Informasi Personal (Gender, Age, Phone, Job, Education)
   - Survey Questions (12 questions dengan rating 1-4)
   - Kritik & Saran (Feedback text)
3. **Actions:**
   - 🎲 **Randomize All Data**: Acak semua data
   - 🎯 **Randomize Personal**: Acak hanya info personal
   - 📥 **Load Default**: Muat data default asli
   - 🔄 **Batch Operations**: Ke halaman testing
   - 🚀 **Inject Data**: Mulai injeksi single

### 🧪 API Testing & Batch Operations

1. **Akses** `http://localhost:3000/testing`

2. **API Testing Panel:**
   - **GET API Tests:**
     - Test GET /api/defaults
     - Test External GET (sekampadi endpoint)
     - Health Check /api/health
   - **POST API Tests:**
     - Test POST /api/inject (full data)
     - Simple POST Test (minimal data)
   - **Real-time Console Log** dengan color coding

3. **Batch Operation Control:**
   - **POST Delay**: 1-30 detik delay antar request
   - **Jumlah Operasi**: 1-10 operasi otomatis
   - **Auto Randomize**: Generate data random setiap test
   - **Progress Tracking**: Current step + expand untuk semua step
   - **Results Management**: Latest result + expand untuk semua

### 🌙 Dark Mode

- **Toggle**: Klik icon moon/sun di navigation
- **Persistence**: Setting tersimpan di localStorage
- **Sync**: Dark mode tersinkronisasi antara halaman

## 📊 Data Structure

### Input Format
```javascript
{
  jk: "pr",                    // "pr" | "lk"
  usia: 24,                    // 10-120
  telpon: "085254807251",      // 08xxxxxxxxxx
  pekerjaan: 5,                // 1-10 (prioritas: 3,1,5,6)
  pendidikan: 5,               // 1-10 (prioritas: 5,3,4,6)
  layanan: 100,                // Fixed
  opd: 35,                     // Fixed
  kritik_saran: "String",      // Auto-generated feedback
  "pertanyaan[1]": 4,          // Rating 1-4
  // ... pertanyaan[2] sampai pertanyaan[12]
}
```

### Response Format
```javascript
{
  success: boolean,            // Injection success status
  status: number,             // HTTP status code
  payload: object,            // Normalized data yang dikirim
  duration: number,           // Total duration (ms)
  steps: [                    // Detailed process steps
    {
      step: 1,
      action: "Data Normalization",
      status: "success",
      duration: 45,
      message: "Payload normalized successfully"
    },
    // ... more steps
  ],
  error: string | null,       // Error message if any
  response: {                 // Server response (truncated if large)
    truncated: boolean,
    preview: string,
    fullLength: number,
    summary: object
  }
}
```  
### Core Features Deep Dive

#### 🎲 Smart Data Randomization
- **Personal Info**: Gender, age (18-65), phone (Indo format), job, education
- **Weighted Random**: Priority values untuk realistic data distribution
- **Auto Feedback**: AI-generated contextual feedback untuk perumahan/permukiman
- **Phone Generation**: Valid Indonesian mobile numbers (0821, 0851, etc.)

#### 🧪 Advanced API Testing
- **Multi-endpoint Testing**: Internal APIs + External endpoint testing
- **CORS Handling**: No-cors mode untuk external endpoints
- **Real-time Console**: Color-coded logging dengan timestamps
- **Performance Metrics**: Response time tracking per request
- **Error Analysis**: Detailed error reporting dengan suggestions

#### 📊 Batch Operations
- **Configurable Tests**: 1-10 simultaneous operations
- **Delay Management**: 1-30 second delays between requests
- **Progress Tracking**: Real-time progress dengan step-by-step breakdown
- **Result Management**: Latest + expandable full results
- **Export Functionality**: JSON export dengan comprehensive data
 
## 🔧 Configuration

### Environment Variables
```bash
PORT=3000                   # Server port
NODE_ENV=development        # Environment mode
```

### Target Configuration (inject.js)
```javascript
const CONFIG = {
  target: 'https://sekampadi.kalbarprov.go.id',
  endpoints: {
    get: '/survey2?opd=MzU%3D',  // With OPD parameter
    post: '/survey2/simpan'
  },
  timeout: 10000,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};
```
 
## ⚠️ Troubleshooting

### Common Issues

**🔴 "Cookie session tidak ditemukan"**
- Server target maintenance atau network issues
- Retry beberapa kali dengan interval

**🔴 "CSRF _token tidak ditemukan"**  
- Website target struktur berubah
- Check endpoint manually di browser

**🔴 "External GET Test Failed"**
- CORS policy limitations untuk external endpoints
- Expected behavior untuk cross-origin requests

**🔴 Console not showing logs**
- Refresh halaman testing
- Clear browser cache

### Debug Mode
```bash
# Enable detailed logging
NODE_ENV=development node server.js

# Test individual endpoints
curl -v http://localhost:3000/api/health
curl -v http://localhost:3000/api/defaults
```
  
## 📈 Performance Optimizations

### Code Optimizations
- **Function Consolidation**: Menggabungkan similar functions
- **Event Delegation**: Efficient event handling
- **Lazy Loading**: On-demand content loading
- **Debounced Input**: Input validation dengan delay

### UI Optimizations  
- **CSS Purging**: Removed unused styles
- **Component Reuse**: Consistent component patterns
- **Smooth Animations**: Hardware-accelerated transitions
- **Responsive Images**: Adaptive loading

### Network Optimizations
- **Request Batching**: Multiple operations dalam single session
- **Response Caching**: localStorage untuk settings
- **Timeout Management**: Configurable timeouts
- **Error Retry**: Intelligent retry mechanisms

## 🔒 Security & Legal

**⚠️ DISCLAIMER:** Tool ini dibuat untuk keperluan testing dan development. Pastikan Anda memiliki izin yang sesuai sebelum menggunakan pada sistem production.

**🛡️ Security Features:**
- ✅ No data persistence (tidak menyimpan data pribadi)
- ✅ CSRF token handling otomatis
- ✅ Input validation dan sanitization
- ✅ HTTPS communication ke target
- ✅ No sensitive data dalam logs

## 📞 Support & Contributing

### Getting Help
1. ✅ Check troubleshooting section
2. ✅ Review console logs untuk detail
3. ✅ Test individual endpoints
4. ✅ Check network connectivity

### Contributing Guidelines
1. 🍴 Fork repository
2. 🌟 Create feature branch
3. ✅ Test changes thoroughly  
4. 📝 Update documentation
5. 🚀 Submit pull request

### Roadmap Ideas
- [ ] **Database Integration**: Save test results
- [ ] **User Authentication**: Multi-user support
- [ ] **Scheduling**: Automated batch operations
- [ ] **Reporting**: Advanced analytics dashboard
- [ ] **API Gateway**: Rate limiting dan monitoring

---
 
**🚀 Happy Testing! Built with ❤️ for optimal surveying experience**

*Last updated: September 2025*
