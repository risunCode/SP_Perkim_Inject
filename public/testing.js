// testing.js - Optimized API Testing Logic
class APITesting {
    constructor() {
        this.elements = {
            statusIndicator: document.getElementById('statusIndicator'),
            statusText: document.getElementById('statusText'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            loadingText: document.getElementById('loadingText'),
            loadingSubText: document.getElementById('loadingSubText'),
            dataPreviewSection: document.getElementById('dataPreviewSection'),
            progressSection: document.getElementById('progressSection'),
            resultsSection: document.getElementById('resultsSection'),
            consoleLog: document.getElementById('consoleLog')
        };
        
        this.testResults = [];
        this.updateStatus('ready');
        this.logToConsole('✅ API Testing System Initialized', 'success');
    }

    updateStatus(status, message = '') {
        const { statusIndicator, statusText } = this.elements;
        statusIndicator.className = 'w-2 h-2 rounded-full';
        
        const statusConfig = {
            ready: { class: 'status-online', text: 'Ready' },
            loading: { class: 'status-loading', text: message || 'Processing...' },
            success: { class: 'status-online', text: 'Success' },
            error: { class: 'status-offline', text: 'Error' }
        };
        
        const config = statusConfig[status] || statusConfig.ready;
        statusIndicator.classList.add(config.class);
        statusText.textContent = config.text;
        
        if (['success', 'error'].includes(status)) {
            setTimeout(() => {
                statusText.textContent = 'Ready';
                statusIndicator.className = 'w-2 h-2 rounded-full status-online';
            }, status === 'success' ? 2000 : 3000);
        }
    }

    showLoading(show, text = 'Processing...', subText = 'Please wait') {
        const { loadingOverlay, loadingText, loadingSubText } = this.elements;
        if (show) {
            loadingOverlay.classList.remove('hidden');
            loadingText.textContent = text;
            loadingSubText.textContent = subText;
        } else {
            loadingOverlay.classList.add('hidden');
        }
    }

    async getDataOnly() {
        try {
            this.updateStatus('loading', 'Getting data...');
            this.showLoading(true, 'Getting default data...', 'Fetching from server');
            
            const response = await fetch('/api/defaults');
            const result = await response.json();
            
            this.showLoading(false);
            
            if (result.success) {
                this.updateStatus('success');
                this.logToConsole(`✅ Data Retrieved Successfully`, 'success');
                this.logToConsole(`📊 Keys: ${Object.keys(result.data).join(', ')}`, 'info');
                
                Swal.fire({
                    icon: 'success',
                    title: 'Data Retrieved!',
                    text: 'Default data has been fetched successfully',
                    timer: 2000,
                    timerProgressBar: true
                });
            } else {
                throw new Error(result.error || 'Failed to get data');
            }
        } catch (error) {
            this.showLoading(false);
            this.updateStatus('error');
            Swal.fire({
                icon: 'error',
                title: 'Get Data Failed',
                text: error.message
            });
        }
    }

    async startFullTest() {
        const testCount = parseInt(document.getElementById('testCount').value) || 1;
        const postDelay = parseInt(document.getElementById('postDelay').value) || 3;
        const autoRandomize = document.getElementById('autoRandomize').checked;
        
        // Show confirmation dialog with test details
        const result = await Swal.fire({
            icon: 'question',
            title: 'Konfirmasi Full Test Operation',
            html: `
                <div class="text-left bg-blue-50 rounded-lg p-4 mb-4">
                    <h4 class="font-semibold text-blue-900 mb-3">🚀 Test Configuration:</h4>
                    <div class="space-y-2 text-sm">
                        <p><strong>📊 Jumlah Test:</strong> ${testCount} operasi</p>
                        <p><strong>⏱️ POST Delay:</strong> ${postDelay} detik per test</p>
                        <p><strong>🎲 Auto Randomize:</strong> ${autoRandomize ? '✅ Enabled' : '❌ Disabled'}</p>
                        <p><strong>⏳ Estimasi Waktu:</strong> ~${Math.ceil((testCount * (postDelay + 2)))} detik</p>
                    </div>
                </div>
                <div class="text-left bg-yellow-50 rounded-lg p-3">
                    <p class="text-sm text-yellow-800">
                        <strong>⚠️ Proses ini akan:</strong><br>
                        • Menjalankan ${testCount} kali operasi GET → Preview → POST<br>
                        • Menggunakan delay ${postDelay} detik antar POST<br>
                        • ${autoRandomize ? 'Mengacak data setiap test' : 'Menggunakan data yang sama'}
                    </p>
                </div>
            `,
            showCancelButton: true,
            confirmButtonColor: '#3B82F6',
            cancelButtonColor: '#EF4444',
            confirmButtonText: `🚀 Mulai ${testCount} Test`,
            cancelButtonText: '❌ Batal',
            reverseButtons: true,
            focusCancel: true
        });

        if (!result.isConfirmed) {
            this.logToConsole('❌ Full Test dibatalkan oleh user', 'warning');
            return;
        }

        try {
            this.logToConsole(`🚀 Memulai Full Test: ${testCount} operasi dengan delay ${postDelay}s`, 'info');
            
            this.testResults = [];
            this.showProgress(true);
            this.updateProgress(0, 'Starting test...');
            
            // Scroll to Testing Progress section after test starts
            setTimeout(() => {
                this.scrollToTestingProgress();
            }, 500); // Small delay to let the progress section show first
            
            for (let i = 1; i <= testCount; i++) {
                await this.runSingleTest(i, testCount, postDelay, autoRandomize);
                this.updateProgress((i / testCount) * 100, `Completed ${i}/${testCount} tests`);
            }
            
            this.showResults();
            this.updateStatus('success');
            
            Swal.fire({
                icon: 'success',
                title: 'All Tests Completed! 🎉',
                html: `
                    <div class="text-left bg-green-50 rounded-lg p-4">
                        <p><strong>✅ Status:</strong> Semua test berhasil diselesaikan</p>
                        <p><strong>📊 Total Test:</strong> ${testCount} operasi</p>
                        <p><strong>⏱️ Configuration:</strong> ${postDelay}s delay, ${autoRandomize ? 'randomized' : 'static'} data</p>
                        <p><strong>📋 Results:</strong> Lihat detail hasil di bawah</p>
                    </div>
                `,
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: true,
                confirmButtonText: 'Excellent! 🎊'
            });
            
        } catch (error) {
            this.updateStatus('error');
            Swal.fire({
                icon: 'error',
                title: 'Test Failed',
                text: error.message
            });
        }
    }

    async runSingleTest(testIndex, totalTests, postDelay, autoRandomize) {
        const testResult = {
            testIndex,
            startTime: Date.now(),
            steps: [],
            success: false,
            error: null
        };

        try {
            // Step 1: GET defaults
            this.addProgressStep(testIndex, 'GET', 'loading', 'Getting default data...');
            this.updateStatus('loading', `Test ${testIndex}: Getting data...`);
            
            const defaultsResponse = await fetch('/api/defaults');
            const defaultsResult = await defaultsResponse.json();
            
            if (!defaultsResult.success) throw new Error('Failed to get default data');
            
            testResult.steps.push({
                step: 'GET',
                status: 'success',
                message: 'Default data retrieved'
            });
            this.addProgressStep(testIndex, 'GET', 'success', 'Default data retrieved');

            // Step 2: Prepare data
            let testData = defaultsResult.data;
            if (autoRandomize) {
                testData = this.randomizeData(testData);
                this.addProgressStep(testIndex, 'PREP', 'success', 'Data randomized');
            }
            
            if (testIndex === 1) this.showDataPreview(testData);

            // Step 3: Wait delay
            this.addProgressStep(testIndex, 'WAIT', 'loading', `Waiting ${postDelay}s...`);
            this.updateStatus('loading', `Test ${testIndex}: Waiting ${postDelay}s...`);
            await this.sleep(postDelay * 1000);
            this.addProgressStep(testIndex, 'WAIT', 'success', `Waited ${postDelay}s`);

            // Step 4: POST data
            this.addProgressStep(testIndex, 'POST', 'loading', 'Posting data...');
            this.updateStatus('loading', `Test ${testIndex}: Posting data...`);
            
            const postStart = Date.now();
            const postResponse = await fetch('/api/inject', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testData)
            });
            
            const postResult = await postResponse.json();
            const postDuration = Date.now() - postStart;
            
            testResult.steps.push({
                step: 'POST',
                status: postResult.success ? 'success' : 'error',
                duration: postDuration,
                message: postResult.message || (postResult.success ? 'Data posted successfully' : 'POST failed')
            });
            
            this.addProgressStep(testIndex, 'POST', postResult.success ? 'success' : 'error', 
                postResult.success ? `Posted successfully (${postDuration}ms)` : 'POST failed');

            testResult.success = postResult.success;
            testResult.postResult = postResult;
            testResult.payload = testData;
            
        } catch (error) {
            testResult.error = error.message;
            this.addProgressStep(testIndex, 'ERROR', 'error', error.message);
        }

        testResult.endTime = Date.now();
        testResult.totalDuration = testResult.endTime - testResult.startTime;
        this.testResults.push(testResult);
    }

    randomizeData(data) {
        return {
            ...data,
            jk: Math.random() > 0.5 ? 'lk' : 'pr',
            usia: Math.floor(Math.random() * (65 - 18 + 1)) + 18,
            telpon: this.generatePhoneNumber(),
            pekerjaan: [1, 3, 5, 6][Math.floor(Math.random() * 4)],
            pendidikan: [3, 4, 5, 6][Math.floor(Math.random() * 4)],
            kritik_saran: this.generateAutomaticFeedback()
        };
    }

    generatePhoneNumber() {
        const prefixes = ['0821', '0851', '0852', '0812', '0815', '0898', '0878'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const remaining = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
        return prefix + remaining;
    }

    generateAutomaticFeedback() {
        const components = {
            openings: ['Pelayanan {service} sudah cukup baik', 'Sangat terbantu dengan layanan {service}'],
            services: ['konsultasi perumahan', 'penyuluhan kawasan permukiman', 'konsultasi teknis bangunan'],
            issues: ['perlu peningkatan dalam hal penyediaan informasi teknis', 'proses konsultasi bisa lebih efisien'],
            improvements: ['brosur atau panduan lengkap', 'workshop praktis untuk masyarakat']
        };

        const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
        const opening = random(components.openings).replace('{service}', random(components.services));
        
        return `${opening}. Namun, ${random(components.issues)}. Saya berharap ada ${random(components.improvements)} untuk meningkatkan pelayanan.`;
    }


    showProgress(show) {
        if (show) {
            this.elements.progressSection.classList.remove('hidden');
            document.getElementById('progressSteps').innerHTML = '';
            document.getElementById('latestProgress').innerHTML = '';
            
            // Reset expand state
            const expandBtn = document.getElementById('expandProgressBtn');
            const allSteps = document.getElementById('allProgressSteps');
            if (expandBtn && allSteps) {
                expandBtn.textContent = '📋 Show All Steps';
                allSteps.classList.add('hidden');
            }
        } else {
            this.elements.progressSection.classList.add('hidden');
        }
    }

    toggleProgressSteps() {
        const expandBtn = document.getElementById('expandProgressBtn');
        const allSteps = document.getElementById('allProgressSteps');
        
        if (allSteps.classList.contains('hidden')) {
            allSteps.classList.remove('hidden');
            expandBtn.textContent = '📋 Hide All Steps';
        } else {
            allSteps.classList.add('hidden');
            expandBtn.textContent = '📋 Show All Steps';
        }
    }

    updateProgress(percentage, message) {
        document.getElementById('progressBar').style.width = `${percentage}%`;
        document.getElementById('progressPercentage').textContent = `${Math.round(percentage)}%`;
    }

    addProgressStep(testIndex, step, status, message) {
        const container = document.getElementById('progressSteps');
        const latestContainer = document.getElementById('latestProgress');
        const stepId = `test-${testIndex}-${step}`;
        
        const statusConfig = {
            loading: { color: 'border-yellow-200 bg-yellow-50', icon: 'fas fa-spinner fa-spin text-yellow-600' },
            success: { color: 'border-green-200 bg-green-50', icon: 'fas fa-check-circle text-green-600' },
            error: { color: 'border-red-200 bg-red-50', icon: 'fas fa-exclamation-triangle text-red-600' }
        };
        
        const config = statusConfig[status] || statusConfig.loading;
        const stepHtml = `
            <div class="flex items-center space-x-3 p-3 rounded-lg border ${config.color}">
                <div class="flex-shrink-0">
                    <i class="${config.icon}"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900">Test ${testIndex} - ${step}</p>
                    <p class="text-xs text-gray-600">${message}</p>
                </div>
            </div>
        `;
        
        // Update latest progress (always visible)
        if (latestContainer) {
            latestContainer.innerHTML = stepHtml;
        }
        
        // Update full progress (hidden by default)
        const existingStep = document.getElementById(stepId);
        if (existingStep) {
            existingStep.outerHTML = `<div id="${stepId}">${stepHtml}</div>`;
        } else {
            container.innerHTML += `<div id="${stepId}">${stepHtml}</div>`;
        }
    }

    showResults() {
        const successCount = this.testResults.filter(r => r.success).length;
        const totalCount = this.testResults.length;
        const latestResult = this.testResults[this.testResults.length - 1];
        
        document.getElementById('resultsContent').innerHTML = `
            <!-- Summary Stats -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold text-blue-600">${totalCount}</div>
                    <div class="text-sm text-blue-800">Total Tests</div>
                </div>
                <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold text-green-600">${successCount}</div>
                    <div class="text-sm text-green-800">Successful</div>
                </div>
                <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold text-red-600">${totalCount - successCount}</div>
                    <div class="text-sm text-red-800">Failed</div>
                </div>
            </div>
            
            <!-- Latest Result -->
            ${latestResult ? `
            <div class="mb-4">
                <div class="flex justify-between items-center mb-3">
                    <h3 class="text-lg font-semibold text-gray-900">Latest Test Result</h3>
                    <button onclick="apiTesting.toggleAllResults()" id="expandResultsBtn" 
                            class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
                        📊 Show All Results
                    </button>
                </div>
                <div class="border ${latestResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'} rounded-lg p-4">
                    <div class="flex justify-between items-start mb-3">
                        <h4 class="font-semibold ${latestResult.success ? 'text-green-900' : 'text-red-900'}">
                            Test ${latestResult.testIndex} - ${latestResult.success ? 'SUCCESS' : 'FAILED'}
                        </h4>
                        <span class="text-xs ${latestResult.success ? 'text-green-600' : 'text-red-600'}">
                            ${latestResult.totalDuration}ms total
                        </span>
                    </div>
                    
                    ${latestResult.error ? `
                    <div class="bg-red-100 border border-red-300 rounded p-2 mb-3">
                        <p class="text-sm text-red-800">❌ ${latestResult.error}</p>
                    </div>
                    ` : ''}
                    
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        ${latestResult.steps.map(step => `
                            <div class="flex items-center space-x-2">
                                <i class="fas fa-${step.status === 'success' ? 'check' : 'times'} ${step.status === 'success' ? 'text-green-500' : 'text-red-500'}"></i>
                                <span>${step.step}</span>
                                ${step.duration ? `<span class="text-gray-500">(${step.duration}ms)</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            ` : ''}
            
            <!-- All Results (Hidden by default) -->
            <div id="allTestResults" class="hidden space-y-4 mb-6">
                <h3 class="text-lg font-semibold text-gray-900">All Test Results</h3>
                ${this.testResults.map((result) => `
                    <div class="border ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'} rounded-lg p-4">
                        <div class="flex justify-between items-start mb-3">
                            <h4 class="font-semibold ${result.success ? 'text-green-900' : 'text-red-900'}">
                                Test ${result.testIndex} - ${result.success ? 'SUCCESS' : 'FAILED'}
                            </h4>
                            <span class="text-xs ${result.success ? 'text-green-600' : 'text-red-600'}">
                                ${result.totalDuration}ms total
                            </span>
                        </div>
                        
                        ${result.error ? `
                        <div class="bg-red-100 border border-red-300 rounded p-2 mb-3">
                            <p class="text-sm text-red-800">❌ ${result.error}</p>
                        </div>
                        ` : ''}
                        
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            ${result.steps.map(step => `
                                <div class="flex items-center space-x-2">
                                    <i class="fas fa-${step.status === 'success' ? 'check' : 'times'} ${step.status === 'success' ? 'text-green-500' : 'text-red-500'}"></i>
                                    <span>${step.step}</span>
                                    ${step.duration ? `<span class="text-gray-500">(${step.duration}ms)</span>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="text-center">
                <button onclick="apiTesting.exportResults()" 
                        class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                    <i class="fas fa-download mr-2"></i>
                    Export Results
                </button>
            </div>
        `;
        
        this.elements.resultsSection.classList.remove('hidden');
        this.elements.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    toggleAllResults() {
        const expandBtn = document.getElementById('expandResultsBtn');
        const allResults = document.getElementById('allTestResults');
        
        if (allResults.classList.contains('hidden')) {
            allResults.classList.remove('hidden');
            expandBtn.textContent = '📊 Hide All Results';
        } else {
            allResults.classList.add('hidden');
            expandBtn.textContent = '📊 Show All Results';
        }
    }

    exportResults() {
        if (this.testResults.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Results',
                text: 'No test results to export!'
            });
            return;
        }

        const exportData = {
            timestamp: new Date().toISOString(),
            totalTests: this.testResults.length,
            successfulTests: this.testResults.filter(r => r.success).length,
            results: this.testResults
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `api-test-results-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        link.click();
        URL.revokeObjectURL(url);

        Swal.fire({
            icon: 'success',
            title: 'Export Complete!',
            text: 'Test results exported successfully',
            timer: 2000,
            timerProgressBar: true
        });
    }

    clearResults() {
        this.testResults = [];
        this.elements.dataPreviewSection.classList.add('hidden');
        this.elements.progressSection.classList.add('hidden');
        this.elements.resultsSection.classList.add('hidden');
        this.updateStatus('ready');
        
        Swal.fire({
            icon: 'info',
            title: 'Results Cleared',
            text: 'All test results have been cleared',
            timer: 1500,
            timerProgressBar: true
        });
    }

    showDataPreview(testData) {
        // Log data preview to console for debugging
        this.logToConsole('📊 Data Preview for Test 1:', 'info');
        this.logToConsole(`👤 Gender: ${testData.jk === 'pr' ? 'Perempuan' : 'Laki-laki'}`, 'info');
        this.logToConsole(`📅 Age: ${testData.usia} years`, 'info');
        this.logToConsole(`📱 Phone: ${testData.telpon}`, 'info');
        this.logToConsole(`💼 Job: ${testData.pekerjaan}`, 'info');
        this.logToConsole(`🎓 Education: ${testData.pendidikan}`, 'info');
        this.logToConsole(`📝 Feedback: ${testData.kritik_saran.substring(0, 50)}...`, 'info');
        
        const questionCount = Object.keys(testData).filter(k => k.startsWith('pertanyaan')).length;
        this.logToConsole(`❓ Survey Questions: ${questionCount} items`, 'info');
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Console logging functionality
    logToConsole(message, type = 'info') {
        if (!this.elements.consoleLog) return;
        
        const timestamp = new Date().toLocaleTimeString('id-ID');
        const colors = {
            info: 'text-gray-300',
            success: 'text-green-400',
            error: 'text-red-400',
            warning: 'text-yellow-400',
            request: 'text-blue-400'
        };
        
        const colorClass = colors[type] || colors.info;
        const logEntry = document.createElement('div');
        logEntry.className = colorClass;
        logEntry.innerHTML = `<span class="text-gray-500">[${timestamp}]</span> ${message}`;
        
        this.elements.consoleLog.appendChild(logEntry);
        this.elements.consoleLog.scrollTop = this.elements.consoleLog.scrollHeight;
    }

    clearConsole() {
        if (this.elements.consoleLog) {
            this.elements.consoleLog.innerHTML = '<div class="text-green-400">➜ API Testing Console Ready...</div>';
        }
    }

    scrollToTestingProgress() {
        try {
            // Find the Testing Progress section by looking for h2 elements with specific text
            let testingProgressPanel = null;
            
            // Method 1: Search by text content
            const h2Elements = document.querySelectorAll('h2');
            for (const h2 of h2Elements) {
                if (h2.textContent.includes('Testing Progress')) {
                    testingProgressPanel = h2;
                    break;
                }
            }
            
            // Method 2: Fallback to find by icon (fas fa-tasks)
            if (!testingProgressPanel) {
                const iconElements = document.querySelectorAll('i.fas.fa-tasks');
                for (const icon of iconElements) {
                    const h2 = icon.closest('h2');
                    if (h2) {
                        testingProgressPanel = h2;
                        break;
                    }
                }
            }
            
            // Method 3: Fallback to progressSection element
            if (!testingProgressPanel) {
                testingProgressPanel = document.getElementById('progressSection');
            }
            
            if (testingProgressPanel) {
                // Find the parent container (usually the white panel)
                const panel = testingProgressPanel.closest('.bg-white') || 
                             testingProgressPanel.closest('.rounded-2xl') ||
                             testingProgressPanel.parentElement || 
                             testingProgressPanel;
                
                this.logToConsole('📍 Scrolling to Testing Progress section...', 'info');
                panel.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest' 
                });
                
                // Add a subtle highlight effect
                panel.style.transition = 'box-shadow 0.3s ease';
                panel.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.3)';
                setTimeout(() => {
                    panel.style.boxShadow = '';
                }, 2000);
                
            } else {
                // Fallback: scroll to progress section if exists
                this.logToConsole('⚠️ Testing Progress Panel tidak ditemukan, mencoba ID progressSection', 'warning');
                const progressSection = document.getElementById('progressSection');
                if (progressSection) {
                    progressSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                    this.logToConsole('❌ Progress section tidak ditemukan', 'error');
                }
            }
        } catch (error) {
            this.logToConsole(`❌ Error saat scroll ke Testing Progress: ${error.message}`, 'error');
            console.error('Testing Progress scroll error:', error);
        }
    }

    // API Testing functions

    async testExternalEndpoint() {
        try {
            this.logToConsole('🔄 Testing External Title Fetch from sekampadi.kalbarprov.go.id...', 'request');
            this.updateStatus('loading', 'Fetching Page Title...');
            
            const proxyUrl = '/api/fetch-title';
            const targetUrl = 'https://sekampadi.kalbarprov.go.id/survey2?opd=MzU%3D';
            
            this.logToConsole(`📤 Sending request to: ${proxyUrl}`, 'info');
            this.logToConsole(`🎯 Target URL: ${targetUrl}`, 'info');
            
            const startTime = Date.now();
            const response = await fetch(proxyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: targetUrl })
            });
            
            const duration = Date.now() - startTime;
            this.logToConsole(`📥 Response received: HTTP ${response.status} (${duration}ms)`, 'info');
            
            // Always try to parse JSON response
            let result;
            try {
                result = await response.json();
                this.logToConsole(`📊 Response data: ${JSON.stringify(result, null, 2)}`, 'info');
            } catch (parseError) {
                this.logToConsole(`❌ Failed to parse JSON response: ${parseError.message}`, 'error');
                throw new Error(`Invalid JSON response from server: ${parseError.message}`);
            }
            
            if (response.ok && result && result.success) {
                // Success case - same as working Response Summary approach
                const title = result.title || 'No title extracted';
                const statusCode = result.statusCode || response.status;
                const contentLength = result.contentLength || 0;
                
                this.logToConsole(`✅ External Title Fetch SUCCESS (${duration}ms)`, 'success');
                this.logToConsole(`📄 Page Title: "${title}"`, 'success');
                this.logToConsole(`🌐 URL: ${targetUrl}`, 'info');
                this.logToConsole(`📊 HTTP Status: ${statusCode}`, 'info');
                this.logToConsole(`📏 Content Length: ${contentLength} bytes`, 'info');
                
                // Validate that we actually got a meaningful title
                if (title && title !== 'No title found' && title.length > 0) {
                    Swal.fire({
                        icon: 'success',
                        title: 'External Title Fetch Success!',
                        html: `
                            <div class="text-left bg-green-50 rounded-lg p-4">
                                <div class="space-y-2">
                                    <p><strong>🌐 URL:</strong><br><a href="${targetUrl}" target="_blank" class="text-blue-600 hover:underline break-all">${targetUrl}</a></p>
                                    <p><strong>📄 Page Title:</strong><br><span class="font-medium text-green-700 italic">"${title}"</span></p>
                                    <p><strong>⚡ Response Time:</strong> ${duration}ms</p>
                                    <p><strong>📊 HTTP Status:</strong> ${statusCode}</p>
                                    <p><strong>📏 Content Size:</strong> ${contentLength.toLocaleString()} bytes</p>
                                    <p><strong>✅ Status:</strong> <span class="text-green-600 font-semibold">Title successfully extracted!</span></p>
                                </div>
                            </div>
                        `,
                        timer: 8000,
                        timerProgressBar: true,
                        showConfirmButton: true,
                        confirmButtonText: 'Excellent! 🎉'
                    });
                } else {
                    // Title extraction failed
                    this.logToConsole(`⚠️ Warning: Empty or invalid title extracted`, 'warning');
                    Swal.fire({
                        icon: 'warning',
                        title: 'Title Fetch Partial Success',
                        html: `
                            <div class="text-left bg-yellow-50 rounded-lg p-4">
                                <p><strong>⚠️ Status:</strong> Connected successfully but title extraction failed</p>
                                <p><strong>📄 Title:</strong> "${title}"</p>
                                <p><strong>🌐 URL:</strong> ${targetUrl}</p>
                                <p><strong>⏱️ Response Time:</strong> ${duration}ms</p>
                                <p><strong>💡 Possible Issues:</strong></p>
                                <ul class="list-disc list-inside text-sm mt-2 ml-4">
                                    <li>Page has no &lt;title&gt; tag</li>
                                    <li>Title is dynamically loaded with JavaScript</li>
                                    <li>Server responded with different content</li>
                                </ul>
                            </div>
                        `,
                        showConfirmButton: true,
                        confirmButtonText: 'Understood'
                    });
                }
                
                this.updateStatus('success');
                
            } else {
                // Error case - detailed error reporting
                const errorMessage = result?.error || `HTTP ${response.status}: ${response.statusText}`;
                this.logToConsole(`❌ Server returned error: ${errorMessage}`, 'error');
                
                if (result) {
                    this.logToConsole(`📊 Full error response: ${JSON.stringify(result, null, 2)}`, 'error');
                }
                
                Swal.fire({
                    icon: 'error',
                    title: 'External Title Fetch Failed',
                    html: `
                        <div class="text-left bg-red-50 rounded-lg p-4">
                            <p><strong>❌ Error:</strong> ${errorMessage}</p>
                            <p><strong>🌐 URL:</strong> ${targetUrl}</p>
                            <p><strong>📊 HTTP Status:</strong> ${response.status}</p>
                            <p><strong>⏱️ Response Time:</strong> ${duration}ms</p>
                            ${result?.timestamp ? `<p><strong>🕒 Server Time:</strong> ${result.timestamp}</p>` : ''}
                            <div class="mt-3 p-2 bg-gray-100 rounded text-xs">
                                <strong>Technical Details:</strong><br>
                                ${result ? JSON.stringify(result, null, 2) : 'No additional details'}
                            </div>
                        </div>
                    `,
                    showConfirmButton: true,
                    confirmButtonText: 'OK'
                });
                
                this.updateStatus('error');
            }
            
        } catch (error) {
            const duration = Date.now() - (Date.now() - 1000); // Fallback timing
            this.logToConsole(`💥 External Title Fetch Exception: ${error.message}`, 'error');
            this.logToConsole(`🔍 Error stack: ${error.stack}`, 'error');
            this.updateStatus('error');
            
            Swal.fire({
                icon: 'error',
                title: 'External Test Exception',
                html: `
                    <div class="text-left bg-red-50 rounded-lg p-4">
                        <p><strong>💥 Exception:</strong> ${error.message}</p>
                        <p><strong>🌐 Target:</strong> https://sekampadi.kalbarprov.go.id/survey2</p>
                        <p><strong>🔧 Possible Causes:</strong></p>
                        <ul class="list-disc list-inside text-sm mt-2 ml-4">
                            <li>Network connectivity issues</li>
                            <li>Server-side proxy error</li>
                            <li>Target website is down or blocking requests</li>
                            <li>CORS or firewall restrictions</li>
                            <li>Request timeout (15 seconds)</li>
                        </ul>
                        <div class="mt-3 p-2 bg-gray-100 rounded text-xs">
                            <strong>Technical Error:</strong><br>
                            ${error.message}
                        </div>
                    </div>
                `,
                showConfirmButton: true,
                confirmButtonText: 'Understood'
            });
        }
    }

    async testHealthAPI() {
        try {
            this.logToConsole('🔄 Testing GET /api/health...', 'request');
            this.updateStatus('loading', 'Testing Health API...');
            
            const startTime = Date.now();
            const response = await fetch('/api/health');
            const result = await response.json();
            const duration = Date.now() - startTime;
            
            if (response.ok && result.success) {
                this.logToConsole(`✅ Health Check SUCCESS (${duration}ms)`, 'success');
                this.logToConsole(`📊 Server Status: ${result.status}`, 'info');
                this.logToConsole(`⏱️ Uptime: ${Math.round(result.uptime)}s`, 'info');
                
                Swal.fire({
                    icon: 'success',
                    title: 'Health Check Success!',
                    html: `
                        <div class="text-left">
                            <p><strong>Status:</strong> ${result.status}</p>
                            <p><strong>Uptime:</strong> ${Math.round(result.uptime)}s</p>
                            <p><strong>Response Time:</strong> ${duration}ms</p>
                        </div>
                    `,
                    timer: 3000,
                    timerProgressBar: true
                });
            } else {
                throw new Error(result.error || `HTTP ${response.status}`);
            }
            
            this.updateStatus('success');
        } catch (error) {
            this.logToConsole(`❌ Health Check Failed: ${error.message}`, 'error');
            this.updateStatus('error');
            
            Swal.fire({
                icon: 'error',
                title: 'Health Check Failed',
                text: error.message
            });
        }
    }


    async testNullDataPOST() {
        // Test scenarios that will be run
        const nullDataTests = [
            { name: 'Completely Null', data: null },
            { name: 'Empty Object', data: {} },
            { name: 'Undefined Data', data: undefined },
            { name: 'Empty String Values', data: { jk: '', usia: '', telpon: '' } },
            { name: 'Missing Required Fields', data: { someField: 'test' } }
        ];

        // Show confirmation dialog with test details
        const result = await Swal.fire({
            icon: 'question',
            title: 'Konfirmasi POST Null Data Test',
            html: `
                <div class="text-left bg-orange-50 rounded-lg p-4 mb-4">
                    <h4 class="font-semibold text-orange-900 mb-3">🧪 Test Scenarios:</h4>
                    <div class="space-y-1 text-sm">
                        ${nullDataTests.map((test, index) => `
                            <p><strong>${index + 1}.</strong> ${test.name}</p>
                        `).join('')}
                    </div>
                </div>
                <div class="text-left bg-blue-50 rounded-lg p-3">
                    <p class="text-sm text-blue-800">
                        <strong>🎯 Tujuan Test:</strong><br>
                        • Menguji validasi server terhadap data null/kosong<br>
                        • Memastikan error handling yang proper<br>
                        • Mengecek response untuk setiap skenario invalid data<br>
                        • Durasi: ~${nullDataTests.length * 1.5} detik
                    </p>
                </div>
            `,
            showCancelButton: true,
            confirmButtonColor: '#F97316',
            cancelButtonColor: '#EF4444',
            confirmButtonText: `🧪 Jalankan ${nullDataTests.length} Test`,
            cancelButtonText: '❌ Batal',
            reverseButtons: true,
            focusCancel: true
        });

        if (!result.isConfirmed) {
            this.logToConsole('❌ Null Data POST Test dibatalkan oleh user', 'warning');
            return;
        }

        try {
            this.logToConsole(`🧪 Memulai Null Data POST Test: ${nullDataTests.length} scenarios`, 'info');
            this.logToConsole('🔄 Testing POST /api/inject with null/empty data...', 'request');
            this.updateStatus('loading', 'Testing Null Data POST...');
            
            for (let i = 0; i < nullDataTests.length; i++) {
                const testCase = nullDataTests[i];
                this.logToConsole(`🧪 Test ${i + 1}/${nullDataTests.length}: ${testCase.name}`, 'info');
                
                const startTime = Date.now();
                
                try {
                    const response = await fetch('/api/inject', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(testCase.data)
                    });
                    
                    const result = await response.json();
                    const duration = Date.now() - startTime;
                    
                    this.logToConsole(`📤 Data sent: ${JSON.stringify(testCase.data)}`, 'info');
                    this.logToConsole(`📥 HTTP ${response.status} (${duration}ms): ${result.message || 'No message'}`, response.ok ? 'success' : 'warning');
                    
                    if (result.error) {
                        this.logToConsole(`⚠️ Error: ${result.error}`, 'warning');
                    }
                    
                } catch (fetchError) {
                    const duration = Date.now() - startTime;
                    this.logToConsole(`❌ Request Error (${duration}ms): ${fetchError.message}`, 'error');
                }
                
                // Add delay between tests
                if (i < nullDataTests.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            
            this.logToConsole('✅ Null Data POST Tests Completed!', 'success');
            
            Swal.fire({
                icon: 'success',
                title: 'Null Data POST Tests Completed! 🧪',
                html: `
                    <div class="text-left bg-green-50 rounded-lg p-4">
                        <p><strong>✅ Status:</strong> Semua test scenario berhasil dijalankan</p>
                        <p><strong>🧪 Tests Run:</strong> ${nullDataTests.length} scenarios</p>
                        <p><strong>🎯 Purpose:</strong> Validasi server error handling</p>
                        <p><strong>📋 Expected:</strong> Server menangani null/empty data dengan graceful</p>
                        <p><strong>📊 Check Console:</strong> Review detail hasil test di console log</p>
                    </div>
                `,
                timer: 6000,
                timerProgressBar: true,
                showConfirmButton: true,
                confirmButtonText: 'Excellent! 🎊'
            });
            
            this.updateStatus('success');
        } catch (error) {
            this.logToConsole(`❌ Null Data POST Test Failed: ${error.message}`, 'error');
            this.updateStatus('error');
            
            Swal.fire({
                icon: 'error',
                title: 'Null Data POST Test Failed',
                html: `
                    <div class="text-left bg-red-50 rounded-lg p-3">
                        <p><strong>❌ Error:</strong> ${error.message}</p>
                        <p><strong>🔧 Action:</strong> Check console untuk detail error</p>
                    </div>
                `
            });
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.apiTesting = new APITesting();
});
