// script.js - Optimized Client-side JavaScript
class SekampadiInject {
    constructor() {
        this.elements = {
            form: document.getElementById('injectionForm'),
            injectBtn: document.getElementById('injectBtn'),
            injectBtnText: document.getElementById('injectBtnText'),
            resultsSection: document.getElementById('resultsSection'),
            resultsContent: document.getElementById('resultsContent'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            statusIndicator: document.getElementById('statusIndicator')
        };
        
        this.lastResults = null;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.generateQuestions();
        await this.loadRandomizedDefaults();
        this.updateStatus('ready');
    }

    setupEventListeners() {
        this.elements.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.elements.form.addEventListener('input', () => this.validateForm());
        this.setupInputValidations();
    }

    generateQuestions() {
        const container = document.getElementById('questionsContainer');
        const questions = {
            1: "Kesesuaian & kemudahan PERSYARATAN dalam pelayanan",
            2: "Kemudahan ALUR / PROSEDUR dalam pelayanan", 
            3: "Kecepatan WAKTU dalam pelayanan",
            4: "Biaya / Tarif lain diluar ketentuan resmi (pungli/calo)",
            5: "Kesesuaian dan KUALITAS PRODUK / JASA pelayanan",
            6: "KOMPETENSI / KEMAMPUAN PETUGAS dalam memberikan pelayanan",
            7: "PERILAKU PETUGAS dalam memberikan pelayanan",
            8: "Kenyamanan FASILITAS SARANA & PRASARANA pada ruang pelayanan",
            9: "Kelengkapan media penanganan PENGADUAN / SARAN / MASUKAN",
            10: "Pelayanan secara UMUM / KESELURUHAN",
            11: "TRANSPARANSI (keterbukaan persyaratan, alur, biaya, waktu)",
            12: "INTEGRITAS PETUGAS (sikap jujur dan dapat dipercaya)"
        };

        const scaleLabels = { 1: "Tidak Baik", 2: "Kurang Baik", 3: "Baik", 4: "Sangat Baik" };
        
        for (let i = 1; i <= 12; i++) {
            const isServiceElement = i <= 9;
            const categoryLabel = isServiceElement ? 'Unsur Pelayanan' : 'MCP KPK';
            const colorClasses = isServiceElement ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-purple-600 bg-purple-50 border-purple-200';
            
            const questionDiv = document.createElement('div');
            questionDiv.className = 'col-span-1';
            questionDiv.innerHTML = `
                <div class="bg-white rounded-xl shadow-sm border ${colorClasses.split(' ')[2]} p-4 hover:shadow-md transition-shadow h-full">
                    <div class="flex justify-between items-start mb-3">
                        <span class="text-xs font-medium uppercase tracking-wider px-2 py-1 rounded ${colorClasses}">
                            ${categoryLabel} ${i}
                        </span>
                        <span class="inline-block bg-primary text-white text-xs px-2 py-1 rounded-full question-value" id="value-${i}">4</span>
                    </div>
                    <h4 class="text-sm font-medium text-gray-900 mb-4 leading-relaxed line-clamp-2">
                        ${questions[i]}
                    </h4>
                    <div class="relative mt-auto">
                        <input type="range" name="pertanyaan[${i}]" min="1" max="4" value="4"
                               class="question-slider w-full" data-question="${i}">
                        <div class="flex justify-between text-xs text-gray-500 mt-2">
                            <span>1</span><span>2</span><span>3</span><span>4</span>
                        </div>
                        <div class="text-center mt-1">
                            <span class="text-xs text-gray-600 question-label" id="label-${i}">Sangat Baik</span>
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(questionDiv);
            
            // Add slider event listener
            const slider = questionDiv.querySelector(`input[name="pertanyaan[${i}]"]`);
            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                questionDiv.querySelector(`#value-${i}`).textContent = value;
                questionDiv.querySelector(`#label-${i}`).textContent = scaleLabels[value];
                this.updateSliderColor(questionDiv.querySelector('.question-value'), value);
            });
            
            this.updateSliderColor(questionDiv.querySelector('.question-value'), 4);
        }
    }

    updateSliderColor(element, value) {
        const colors = { 1: 'bg-red-500', 2: 'bg-orange-500', 3: 'bg-blue-500', 4: 'bg-green-500' };
        element.className = `inline-block text-white text-xs px-2 py-1 rounded-full question-value ${colors[value]}`;
    }

    async loadDefaults() {
        try {
            this.updateStatus('loading');
            const response = await fetch('/api/defaults');
            const result = await response.json();
            
            if (result.success) {
                this.populateForm(result.data);
                this.showAlert('success', '✅ Data default asli telah dimuat ke form');
                this.updateStatus('ready');
            } else {
                throw new Error(result.error || 'Gagal memuat data default');
            }
        } catch (error) {
            console.error('Error loading defaults:', error);
            this.showAlert('error', `Gagal memuat data default: ${error.message}`);
            this.updateStatus('error');
        }
    }

    async loadRandomizedDefaults() {
        try {
            const response = await fetch('/api/defaults');
            const result = await response.json();
            
            if (result.success) {
                const randomizedData = {
                    ...result.data,
                    jk: Math.random() > 0.5 ? 'lk' : 'pr',
                    usia: Math.floor(Math.random() * (65 - 18 + 1)) + 18,
                    telpon: this.generatePhoneNumber(),
                    pekerjaan: [1, 3, 5, 6][Math.floor(Math.random() * 4)],
                    pendidikan: [3, 4, 5, 6][Math.floor(Math.random() * 4)],
                    kritik_saran: this.generateAutomaticFeedback()
                };
                
                this.populateForm(randomizedData);
                this.updateStatus('ready');
            }
        } catch (error) {
            // Fallback to basic data
            this.populateForm({
                jk: 'pr', usia: 27, telpon: '082154837552', pekerjaan: 3, pendidikan: 5,
                layanan: 100, opd: 35, kritik_saran: 'Pelayanan sudah baik, perlu peningkatan.'
            });
            this.updateStatus('ready');
        }
    }

    randomizeAllData() {
        const data = {
            jk: Math.random() > 0.5 ? 'lk' : 'pr',
            usia: Math.floor(Math.random() * (65 - 18 + 1)) + 18,
            telpon: this.generatePhoneNumber(),
            pekerjaan: [1, 3, 5, 6][Math.floor(Math.random() * 4)],
            pendidikan: [3, 4, 5, 6][Math.floor(Math.random() * 4)],
            layanan: 100,
            opd: 35,
            kritik_saran: this.generateAutomaticFeedback()
        };
        
        this.populateForm(data);
        this.showAlert('success', '✅ Data berhasil diacak dengan informasi random!');
    }

    randomizePersonalInfo() {
        const data = {
            jk: Math.random() > 0.5 ? 'lk' : 'pr',
            usia: Math.floor(Math.random() * (65 - 18 + 1)) + 18,
            telpon: this.generatePhoneNumber(),
            pekerjaan: [1, 3, 5, 6][Math.floor(Math.random() * 4)],
            pendidikan: [3, 4, 5, 6][Math.floor(Math.random() * 4)],
            layanan: 100,
            opd: 35
        };
        
        this.populateForm(data);
        this.showAlert('success', `✅ Personal info diacak: ${data.jk === 'pr' ? 'Perempuan' : 'Laki-laki'}, ${data.usia}th`);
    }

    generatePhoneNumber() {
        const prefixes = ['0821', '0851', '0852', '0812', '0815', '0898', '0878'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const remaining = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
        return prefix + remaining;
    }

    generateAutomaticFeedback() {
        const components = {
            openings: ['Pelayanan {service} sudah cukup baik', 'Sangat terbantu dengan layanan {service}', 'Layanan {service} sudah memuaskan'],
            services: ['konsultasi perumahan', 'penyuluhan kawasan permukiman', 'konsultasi teknis bangunan'],
            issues: ['perlu peningkatan dalam hal penyediaan informasi teknis', 'proses konsultasi bisa lebih efisien', 'perlu perbaikan aksesibilitas informasi'],
            improvements: ['brosur atau panduan lengkap', 'workshop praktis untuk masyarakat', 'konsultasi lapangan langsung']
        };

        const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
        const opening = random(components.openings).replace('{service}', random(components.services));
        
        return `${opening}. Namun, ${random(components.issues)}. Saya berharap ada ${random(components.improvements)} untuk meningkatkan pelayanan.`;
    }

    populateForm(data) {
        Object.keys(data).forEach(key => {
            const element = this.elements.form.querySelector(`[name="${key}"]`);
            if (element) {
                if (element.type === 'radio') {
                    const radio = this.elements.form.querySelector(`[name="${key}"][value="${data[key]}"]`);
                    if (radio) radio.checked = true;
                } else {
                    element.value = data[key];
                    
                    if (element.type === 'range') {
                        const questionMatch = key.match(/pertanyaan\[(\d+)\]/);
                        if (questionMatch) {
                            const num = questionMatch[1];
                            const valueDisplay = document.getElementById(`value-${num}`);
                            if (valueDisplay) {
                                valueDisplay.textContent = data[key];
                                this.updateSliderColor(valueDisplay, data[key]);
                            }
                        }
                    }
                }
            }
        });
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) return;

        const formData = new FormData(this.elements.form);
        const data = Object.fromEntries(formData.entries());
        
        try {
            this.setLoading(true);
            this.updateStatus('loading');
            
            const response = await fetch('/api/inject', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showAlert('success', `🎉 ${result.message} (${result.duration}ms)`);
                this.displayResults(result);
                this.updateStatus('success');
            } else {
                throw new Error(result.error || 'Injeksi gagal');
            }
            
        } catch (error) {
            console.error('Injection error:', error);
            this.showAlert('error', `💥 ${error.message}`);
            this.updateStatus('error');
        } finally {
            this.setLoading(false);
        }
    }

    validateForm() {
        const requiredFields = ['usia', 'telpon'];
        let isValid = true;
        const errors = [];
        
        requiredFields.forEach(field => {
            const element = this.elements.form.querySelector(`[name="${field}"]`);
            if (element && !element.value.trim()) {
                element.classList.add('border-red-500');
                isValid = false;
                errors.push(field === 'usia' ? 'Usia harus diisi' : 'Nomor telepon harus diisi');
            } else if (element) {
                element.classList.remove('border-red-500');
            }
        });
        
        // Phone validation
        const telpon = this.elements.form.querySelector('[name="telpon"]').value;
        if (telpon && !telpon.match(/^08\d{8,11}$/)) {
            this.elements.form.querySelector('[name="telpon"]').classList.add('border-red-500');
            isValid = false;
            errors.push('Format nomor telepon tidak valid (08xxxxxxxxxx)');
        }
        
        if (!isValid) {
            this.showAlert('warning', `Data tidak valid: ${errors.join(', ')}`);
        }
        
        return isValid;
    }

    setupInputValidations() {
        const telponInput = this.elements.form.querySelector('[name="telpon"]');
        telponInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 13) value = value.substring(0, 13);
            e.target.value = value;
        });
        
        const usiaInput = this.elements.form.querySelector('[name="usia"]');
        usiaInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            if (value < 10) e.target.value = 10;
            if (value > 120) e.target.value = 120;
        });
    }

    displayResults(result) {
        const duration = result.duration ? `${result.duration}ms` : 'N/A';
        const statusClass = result.success ? 'text-green-600' : 'text-red-600';
        const statusIcon = result.success ? '✅' : '❌';
        
        // Generate step-by-step process display
        const stepsHtml = result.steps ? result.steps.map(step => {
            const stepStatusClass = step.status === 'success' ? 'text-green-600' : 'text-red-600';
            const stepStatusIcon = step.status === 'success' ? '✅' : '❌';
            const httpCode = step.httpCode ? `HTTP ${step.httpCode}` : '';
            const stepDuration = step.duration ? `${step.duration}ms` : '';
            
            return `
                <div class="flex items-start space-x-3 p-3 rounded-lg border ${step.status === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}">
                    <div class="flex-shrink-0 w-6 h-6 rounded-full ${step.status === 'success' ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center text-white text-xs font-bold">
                        ${step.step}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between">
                            <p class="text-sm font-medium text-gray-900">${step.action}</p>
                            <span class="${stepStatusClass}">${stepStatusIcon}</span>
                        </div>
                        <p class="text-xs text-gray-600 mt-1">${step.message}</p>
                        ${httpCode || stepDuration ? `
                            <div class="flex space-x-4 mt-2 text-xs text-gray-500">
                                ${httpCode ? `<span class="font-mono">${httpCode}</span>` : ''}
                                ${stepDuration ? `<span>${stepDuration}</span>` : ''}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('') : '';
        
        this.elements.resultsContent.innerHTML = `
            <!-- Overall Status -->
            <div class="mb-6 p-4 rounded-xl ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <div class="w-12 h-12 rounded-full ${result.success ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center text-white text-xl">
                            ${statusIcon}
                        </div>
                        <div class="ml-4">
                            <h3 class="text-lg font-semibold ${statusClass}">${result.message}</h3>
                            <p class="text-sm text-gray-600">Total Duration: ${duration}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-sm text-gray-600">Final Status</p>
                        <p class="text-lg font-bold ${statusClass}">HTTP ${result.status}</p>
                    </div>
                </div>
            </div>

            <!-- Process Steps -->
            ${result.steps ? `
            <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <i class="fas fa-list-ol mr-2 text-blue-500"></i>
                    Injection Process Steps
                </h3>
                <div class="space-y-3">
                    ${stepsHtml}
                </div>
            </div>
            ` : ''}

            <!-- Data Summary -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div class="bg-gray-50 rounded-lg p-4">
                    <h3 class="font-semibold text-gray-900 mb-3 flex items-center">
                        <i class="fas fa-user mr-2 text-purple-500"></i>
                        Data Summary
                    </h3>
                    <div class="text-sm space-y-2">
                        <div class="flex justify-between">
                            <span>Gender:</span>
                            <span class="font-medium">${result.payload.jk === 'pr' ? 'Perempuan' : 'Laki-laki'}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Usia:</span>
                            <span class="font-medium">${result.payload.usia} tahun</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Telepon:</span>
                            <span class="font-medium font-mono">${result.payload.telpon}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Layanan:</span>
                            <span class="font-medium">${result.payload.layanan}/100</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Survey Questions:</span>
                            <span class="font-medium">${Object.keys(result.payload).filter(k => k.startsWith('pertanyaan')).length} items</span>
                        </div>
                    </div>
                </div>

                <div class="bg-gray-50 rounded-lg p-4">
                    <h3 class="font-semibold text-gray-900 mb-3 flex items-center">
                        <i class="fas fa-clock mr-2 text-indigo-500"></i>
                        Timing Details
                    </h3>
                    <div class="text-sm space-y-2">
                        <div class="flex justify-between">
                            <span>Timestamp:</span>
                            <span class="font-medium">${new Date().toLocaleString('id-ID')}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Total Duration:</span>
                            <span class="font-medium">${duration}</span>
                        </div>
                        ${result.steps ? result.steps.filter(s => s.duration).map(s => `
                            <div class="flex justify-between text-xs text-gray-600">
                                <span>${s.action}:</span>
                                <span>${s.duration}ms</span>
                            </div>
                        `).join('') : ''}
                    </div>
                </div>
            </div>

            ${result.error ? `
            <div class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 class="font-semibold text-red-900 mb-2 flex items-center">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    Error Details
                </h3>
                <p class="text-red-700 text-sm font-mono bg-red-100 p-2 rounded">${result.error}</p>
            </div>
            ` : ''}

            <!-- Data & Response Grid Layout -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <!-- Injected Data (Collapsible) -->
                <div>
                    <button onclick="sekampadiInject.toggleDataVisibility()" id="toggleDataBtn" 
                            class="flex items-center justify-between w-full p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                        <h3 class="font-semibold text-blue-900 flex items-center">
                            <i class="fas fa-database mr-2"></i>
                            Show Injected Data
                        </h3>
                        <i class="fas fa-chevron-down text-blue-600" id="toggleDataIcon"></i>
                    </button>
                    <div id="injectedDataContainer" class="hidden mt-3 p-4 bg-gray-100 rounded-lg border">
                        <pre class="text-xs text-gray-800 whitespace-pre-wrap font-mono overflow-x-auto">${JSON.stringify(result.payload, null, 2)}</pre>
                    </div>
                </div>

                <!-- Response Summary -->
                ${result.response ? `
                <div>
                    <div class="p-3 ${result.response.summary && result.response.summary.hasSuccessIndicator ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'} rounded-lg">
                        <h3 class="font-semibold ${result.response.summary && result.response.summary.hasSuccessIndicator ? 'text-green-900' : 'text-red-900'} mb-3 flex items-center">
                            <i class="fas fa-${result.response.summary && result.response.summary.hasSuccessIndicator ? 'check-circle' : 'exclamation-triangle'} mr-2"></i>
                            Response Summary
                        </h3>
                        ${result.response.summary && (result.response.summary.hasSuccessIndicator || result.response.summary.hasErrorIndicator) ? `
                        <div class="text-sm space-y-2">
                            ${result.response.summary.title ? `<p><strong>Title:</strong> ${result.response.summary.title}</p>` : ''}
                            ${result.response.summary.mainHeading ? `<p><strong>Main Message:</strong> ${result.response.summary.mainHeading}</p>` : ''}
                            <p><strong>Status:</strong> ${result.response.summary.hasSuccessIndicator ? '✅ Contains success indicators' : '❌ Contains error indicators'}</p>
                            <p><strong>Response Size:</strong> ${result.response.fullLength || 0} characters ${result.response.truncated ? '(truncated)' : ''}</p>
                        </div>
                        ` : `
                        <div class="text-sm space-y-2">
                            <p><strong>Response received:</strong> ${result.response.fullLength || 0} characters</p>
                            <p><strong>Status:</strong> ${result.response.truncated ? '⚠️ Response truncated for performance' : '✅ Full response captured'}</p>
                            <p class="text-xs text-gray-600">Server responded but content analysis unavailable</p>
                        </div>
                        `}
                    </div>
                </div>
                ` : `
                <div>
                    <div class="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <h3 class="font-semibold text-gray-900 mb-3 flex items-center">
                            <i class="fas fa-info-circle mr-2"></i>
                            Response Summary
                        </h3>
                        <p class="text-sm text-gray-600">No server response data available</p>
                    </div>
                </div>
                `}
            </div>
            
            <div class="flex justify-center gap-3">
                <button onclick="sekampadiInject.hideResults()" 
                        class="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                    <i class="fas fa-times mr-2"></i>
                    Tutup Hasil
                </button>
                <button onclick="sekampadiInject.exportResults()" 
                        class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                    <i class="fas fa-download mr-2"></i>
                    Export Results
                </button>
            </div>
        `;
        
        this.elements.resultsSection.classList.remove('hidden');
        this.lastResults = result;
        this.elements.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    hideResults() {
        this.elements.resultsSection.classList.add('hidden');
    }

    exportResults() {
        if (!this.lastResults) {
            this.showAlert('warning', 'Tidak ada data untuk diekspor!');
            return;
        }

        const exportData = {
            timestamp: new Date().toISOString(),
            success: this.lastResults.success,
            status: this.lastResults.status,
            duration: this.lastResults.duration,
            payload: this.lastResults.payload,
            steps: this.lastResults.steps || []
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sekampadi-result-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        this.showAlert('success', '📁 File berhasil diunduh');
    }

    showAlert(type, message) {
        const iconMap = { success: 'success', error: 'error', warning: 'warning', info: 'info' };
        const colorMap = { success: '#10B981', error: '#EF4444', warning: '#F59E0B', info: '#3B82F6' };

        Swal.fire({
            icon: iconMap[type] || 'info',
            title: message,
            confirmButtonColor: colorMap[type] || '#3B82F6',
            timer: 3000,
            timerProgressBar: true
        });
    }

    setLoading(loading) {
        const icon = this.elements.injectBtn.querySelector('i');
        if (loading) {
            this.elements.loadingOverlay.classList.remove('hidden');
            this.elements.injectBtn.disabled = true;
            this.elements.injectBtnText.textContent = 'Injecting...';
            icon.className = 'fas fa-spinner fa-spin mr-2';
        } else {
            this.elements.loadingOverlay.classList.add('hidden');
            this.elements.injectBtn.disabled = false;
            this.elements.injectBtnText.textContent = 'Inject Data';
            icon.className = 'fas fa-rocket mr-2';
        }
    }

    updateStatus(status) {
        const indicator = this.elements.statusIndicator;
        const statusText = indicator?.nextElementSibling;
        
        if (!indicator || !statusText) return;
        
        indicator.className = 'w-2 h-2 rounded-full';
        
        const statusMap = {
            ready: { class: 'status-online', text: 'Ready' },
            loading: { class: 'status-loading', text: 'Processing...' },
            success: { class: 'status-online', text: 'Success' },
            error: { class: 'status-offline', text: 'Error' }
        };
        
        const statusConfig = statusMap[status] || statusMap.ready;
        indicator.classList.add(statusConfig.class);
        statusText.textContent = statusConfig.text;
        
        if (status === 'success' || status === 'error') {
            setTimeout(() => {
                if (statusText && indicator) {
                    statusText.textContent = 'Ready';
                    indicator.className = 'w-2 h-2 rounded-full status-online';
                }
            }, status === 'success' ? 2000 : 3000);
        }
    }

    toggleDataVisibility() {
        const container = document.getElementById('injectedDataContainer');
        const btn = document.getElementById('toggleDataBtn');
        const icon = document.getElementById('toggleDataIcon');
        
        if (container && btn && icon) {
            const isHidden = container.classList.contains('hidden');
            container.classList.toggle('hidden');
            btn.querySelector('h3').textContent = isHidden ? 'Hide Injected Data' : 'Show Injected Data';
            icon.classList.toggle('fa-chevron-down', !isHidden);
            icon.classList.toggle('fa-chevron-up', isHidden);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sekampadiInject = new SekampadiInject();
});
