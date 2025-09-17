// inject.js - Optimized Core Injection Logic
const axios = require('axios');
const cheerio = require('cheerio');

// Configuration
const CONFIG = {
  target: 'https://sekampadi.kalbarprov.go.id',
  endpoints: {
    get: '/survey2?opd=MzU%3D',
    post: '/survey2/simpan'
  },
  timeout: 10000,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

// Utilities
const utils = {
  toInt: (v, def = 0) => Number.isNaN(Number.parseInt(v, 10)) ? def : Number.parseInt(v, 10),
  clamp: (n, min, max) => Math.min(Math.max(n, min), max),
  escapeHtml: (s = '') => String(s).replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[m])
};

// Default payload builder
function buildDefaultPayload() {
  const base = {
    jk: 'pr',
    kritik_saran: 'Pelayanan konsultasi perumahan sudah cukup baik, namun perlu peningkatan dalam hal penyediaan informasi teknis mengenai standar bangunan rumah layak huni. Saya berharap ada brosur atau panduan lengkap yang bisa dibawa pulang untuk referensi pembangunan. Selain itu, waktu konsultasi bisa diperpanjang karena banyak hal teknis yang perlu dijelaskan secara detail, terutama untuk masyarakat awam seperti saya.',
    layanan: 100,
    opd: 35,
    pekerjaan: 5,
    pendidikan: 5,
    telpon: '085254807251',
    usia: 24
  };
  
  // Add questions 1-12 with default score 4
  for (let i = 1; i <= 12; i++) {
    base[`pertanyaan[${i}]`] = 4;
  }
  
  return base;
}

// Normalize payload data
function normalizePayload(input = {}) {
  const normalized = {
    jk: input.jk === 'lk' ? 'lk' : 'pr',
    kritik_saran: String(input.kritik_saran || '').trim(),
    layanan: utils.clamp(utils.toInt(input.layanan, 100), 0, 100),
    opd: utils.toInt(input.opd, 35),
    pekerjaan: utils.toInt(input.pekerjaan, 5),
    pendidikan: utils.toInt(input.pendidikan, 5),
    telpon: String(input.telpon || '').trim(),
    usia: utils.clamp(utils.toInt(input.usia, 24), 10, 120)
  };
  
  // Normalize questions (1-4 scale)
  for (let i = 1; i <= 12; i++) {
    const key = `pertanyaan[${i}]`;
    normalized[key] = utils.clamp(utils.toInt(input[key], 4), 1, 4);
  }
  
  return normalized;
}

// Get token and cookies from server
async function getTokenAndCookies() {
  try {
    const response = await axios.get(`${CONFIG.target}${CONFIG.endpoints.get}`, {
      withCredentials: true,
      validateStatus: (s) => s >= 200 && s < 400,
      timeout: CONFIG.timeout
    });
    
    const cookies = response.headers['set-cookie'];
    if (!cookies) throw new Error('Cookie session tidak ditemukan!');
    
    const $ = cheerio.load(response.data);
    const token = $('input[name="_token"]').val();
    if (!token) throw new Error('CSRF _token tidak ditemukan!');
    
    return { token, cookies };
  } catch (error) {
    if (error.response) {
      throw new Error(`HTTP Error ${error.response.status}: ${error.response.statusText}`);
    } else if (error.request) {
      throw new Error('Tidak dapat terhubung ke server target. Pastikan koneksi internet stabil.');
    } else {
      throw new Error(`Error: ${error.message}`);
    }
  }
}

// Post survey data to server
async function postSurvey(payload, token, cookies) {
  try {
    const body = new URLSearchParams({ _token: token, ...payload });
    
    const response = await axios.post(
      `${CONFIG.target}${CONFIG.endpoints.post}`,
      body.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': cookies.join('; '),
          'User-Agent': CONFIG.userAgent
        },
        validateStatus: (s) => s >= 200 && s < 400,
        timeout: CONFIG.timeout
      }
    );
    
    return { status: response.status, data: response.data };
  } catch (error) {
    if (error.response) {
      return { 
        status: error.response.status, 
        data: error.response.data,
        error: `HTTP Error ${error.response.status}`
      };
    }
    throw error;
  }
}

// Detect success from HTML response
function detectSuccess(html) {
  if (typeof html !== 'string') return false;
  
  const keywords = ['terima kasih', 'berhasil', 'data berhasil', 'sukses', 'success'];
  const lower = html.toLowerCase();
  
  return keywords.some(keyword => lower.includes(keyword));
}

// Main injection function
async function injectSurveyData(inputPayload = {}) {
  const startTime = Date.now();
  const steps = [];
  
  try {
    // Step 1: Normalize payload
    const payload = normalizePayload(inputPayload);
    
    steps.push({
      step: 1,
      action: 'Data Normalization', 
      status: 'success',
      message: 'Payload normalized successfully'
    });
    
    // Step 2: Get token and cookies
    console.log('🔄 Getting token and cookies...');
    const tokenStart = Date.now();
    const { token, cookies } = await getTokenAndCookies();
    const tokenDuration = Date.now() - tokenStart;
    
    // Show full token info
    console.log(`🔄 _token = ${token}`);
    
    steps.push({
      step: 2,
      action: `GET ${CONFIG.endpoints.get}`,
      status: 'success',
      httpCode: 200,
      duration: tokenDuration,
      message: 'Token and cookies retrieved successfully'
    });
    
    // Step 3: Post survey
    console.log('🚀 Posting survey data...');
    console.log('📥 Starting injection with payload:', payload);
    
    const postStart = Date.now();
    const result = await postSurvey(payload, token, cookies);
    const postDuration = Date.now() - postStart;
    
    const postStatus = result.status >= 200 && result.status < 300 ? 'success' : 'error';
    steps.push({
      step: 3,
      action: `POST ${CONFIG.endpoints.post}`,
      status: postStatus,
      httpCode: result.status,
      duration: postDuration,
      message: postStatus === 'success' ? 'Survey data submitted successfully' : 'Survey submission failed'
    });
    
    // Step 4: Detect success
    const isSuccess = detectSuccess(result.data);
    const totalDuration = Date.now() - startTime;
    
    console.log('📤 Injection completed:', { success: isSuccess, status: result.status, duration: totalDuration });
    
    return {
      success: isSuccess,
      status: result.status,
      payload,
      response: result.data,
      duration: totalDuration,
      steps,
      error: result.error || null
    };
    
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    
    steps.push({
      step: steps.length + 1,
      action: 'Error Handler',
      status: 'error',
      duration: 0,
      message: error.message
    });
    
    console.error('💥 Injection failed:', error.message);
    
    return {
      success: false,
      status: 0,
      payload: normalizePayload(inputPayload),
      response: null,
      duration: totalDuration,
      steps,
      error: error.message
    };
  }
}

module.exports = {
  buildDefaultPayload,
  normalizePayload,
  getTokenAndCookies,
  postSurvey,
  detectSuccess,
  injectSurveyData,
  utils
};
