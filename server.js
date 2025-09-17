// server.js - Optimized Express Server
const express = require('express');
const path = require('path');
const https = require('https');
const http = require('http');
const zlib = require('zlib');
const { URL } = require('url');
const { injectSurveyData, buildDefaultPayload } = require('./inject');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/testing', (req, res) => res.sendFile(path.join(__dirname, 'public', 'testing.html')));

// API Routes
app.get('/api/defaults', async (req, res) => {
  try {
    const defaults = buildDefaultPayload();
    res.json({ success: true, data: defaults });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/inject', async (req, res) => {
  try {
    const result = await injectSurveyData(req.body);
    
    // Truncate large responses for better performance
    let response = null;
    if (result.response) {
      const responseStr = typeof result.response === 'string' ? result.response : JSON.stringify(result.response);
      const isTruncated = responseStr.length > 2000;
      
      response = {
        truncated: isTruncated,
        preview: isTruncated ? responseStr.substring(0, 2000) + '...\n[Truncated]' : responseStr,
        fullLength: responseStr.length,
        summary: extractResponseSummary(responseStr)
      };
    }

    res.json({
      success: result.success,
      status: result.status,
      payload: result.payload,
      duration: result.duration,
      steps: result.steps || [],
      message: result.success ? '🎉 Data berhasil diinjeksi!' : '❌ Injeksi gagal!',
      error: result.error,
      response
    });
    
  } catch (error) {
    console.error('💥 Server error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: '💥 Terjadi kesalahan server'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'Server berjalan normal',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Fetch title from external URL with better error handling and gzip support
app.post('/api/fetch-title', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }
    
    const startTime = Date.now();
    const result = await fetchTitleFromURL(url);
    const duration = Date.now() - startTime;
    
    res.json({
      success: true,
      title: result.title,
      url: url,
      statusCode: result.statusCode,
      contentLength: result.contentLength,
      duration: duration,
      timestamp: new Date().toISOString()
    });
    
    console.log(`✅ Title fetched from ${url}: "${result.title}" (${duration}ms)`);
    
  } catch (error) {
    console.error('❌ Fetch title error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      url: req.body.url,
      timestamp: new Date().toISOString()
    });
  }
});

// Helper function to fetch title with proper gzip handling and redirects
async function fetchTitleFromURL(url, maxRedirects = 5, redirectCount = 0) {
  if (redirectCount >= maxRedirects) {
    throw new Error('Too many redirects');
  }
  
  const urlObj = new URL(url);
  const isHttps = urlObj.protocol === 'https:';
  const httpModule = isHttps ? https : http;
  
  const options = {
    hostname: urlObj.hostname,
    port: urlObj.port || (isHttps ? 443 : 80),
    path: urlObj.pathname + urlObj.search,
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    }
  };
  
  return new Promise((resolve, reject) => {
    const request = httpModule.request(options, (response) => {
      const { statusCode, headers } = response;
      
      // Handle redirects
      if (statusCode >= 300 && statusCode < 400 && headers.location) {
        const redirectUrl = new URL(headers.location, url).href;
        console.log(`🔄 Redirect ${statusCode}: ${url} -> ${redirectUrl}`);
        return fetchTitleFromURL(redirectUrl, maxRedirects, redirectCount + 1)
          .then(resolve)
          .catch(reject);
      }
      
      if (statusCode < 200 || statusCode >= 300) {
        return reject(new Error(`HTTP ${statusCode}: ${response.statusMessage}`));
      }
      
      let stream = response;
      const encoding = headers['content-encoding'];
      
      // Handle gzip/deflate compression
      if (encoding === 'gzip') {
        stream = response.pipe(zlib.createGunzip());
      } else if (encoding === 'deflate') {
        stream = response.pipe(zlib.createInflate());
      } else if (encoding === 'br') {
        stream = response.pipe(zlib.createBrotliDecompress());
      }
      
      let data = '';
      let totalSize = 0;
      const maxSize = 1024 * 1024; // 1MB limit
      
      stream.on('data', (chunk) => {
        totalSize += chunk.length;
        if (totalSize > maxSize) {
          stream.destroy();
          return reject(new Error('Response too large'));
        }
        data += chunk.toString('utf8');
        
        // Early termination if we find title tag
        const titleMatch = data.match(/<title[^>]*>(.*?)<\/title>/i);
        if (titleMatch) {
          stream.destroy();
          const title = cleanTitle(titleMatch[1]);
          return resolve({
            title,
            statusCode,
            contentLength: totalSize
          });
        }
      });
      
      stream.on('end', () => {
        const titleMatch = data.match(/<title[^>]*>(.*?)<\/title>/i);
        const title = titleMatch ? cleanTitle(titleMatch[1]) : 'No title found';
        
        resolve({
          title,
          statusCode,
          contentLength: totalSize
        });
      });
      
      stream.on('error', reject);
    });
    
    request.on('error', (error) => {
      reject(new Error(`Request error: ${error.message}`));
    });
    
    request.setTimeout(15000, () => {
      request.destroy();
      reject(new Error('Request timeout (15s)'));
    });
    
    request.end();
  });
}

// Helper function to clean HTML title
function cleanTitle(title) {
  return title
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/<[^>]*>/g, '') // Remove any HTML tags
    .trim();
}

// Helper function to extract response summary
function extractResponseSummary(responseStr) {
  const summary = {};
  const lowerResponse = responseStr.toLowerCase();
  
  // Check for success/error indicators
  const successKeywords = ['terima kasih', 'berhasil', 'sukses', 'success'];
  const errorKeywords = ['error', 'gagal', 'failed', 'invalid'];
  
  summary.hasSuccessIndicator = successKeywords.some(keyword => lowerResponse.includes(keyword));
  summary.hasErrorIndicator = errorKeywords.some(keyword => lowerResponse.includes(keyword));
  
  // Extract title and main heading
  const titleMatch = responseStr.match(/<title>(.*?)<\/title>/i);
  if (titleMatch) summary.title = titleMatch[1].trim();
  
  const h1Match = responseStr.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (h1Match) summary.mainHeading = h1Match[1].replace(/<[^>]*>/g, '').trim();
  
  return summary;
}

// Error handler
app.use((error, req, res, next) => {
  console.error('💥 Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: '💥 Terjadi kesalahan yang tidak terduga'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 ===== SEKAMPADI INJECT SERVER =====');
  console.log(`🌐 Server: http://localhost:${PORT}`); 
  console.log(`🧪 Testing: http://localhost:${PORT}/testing`);
  console.log(`🔧 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started: ${new Date().toLocaleString('id-ID')}`);
  console.log('=====================================');
});

// Graceful shutdown
['SIGTERM', 'SIGINT'].forEach(signal => {
  process.on(signal, () => {
    console.log(`🛑 ${signal} received. Shutting down gracefully...`);
    process.exit(0);
  });
});
