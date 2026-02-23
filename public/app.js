/**
 * app.js
 * Frontend JavaScript para o App Artigo Pilar.
 * Controla toda a lógica de UI: formulários, chamadas API, preview, logs.
 */

(function () {
    'use strict';

    // ============================================================
    // API BASE
    // ============================================================
    const API = window.location.origin;

    // ============================================================
    // DOM ELEMENTS
    // ============================================================
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // Sections
    const sectionConnection = $('#section-connection');
    const sectionPost = $('#section-post');
    const sectionPreview = $('#section-preview');
    const sectionResult = $('#section-result');

    // Inputs
    const inputSiteUrl = $('#input-site-url');
    const inputPostUrl = $('#input-post-url');
    const inputPostId = $('#input-post-id');
    const inputUsername = $('#input-username');
    const inputAppPassword = $('#input-app-password');
    const inputLeadMagnet = $('#input-lead-magnet');
    const inputHostinger = $('#input-hostinger');
    const inputAmazon1 = $('#input-amazon-1');
    const inputAmazon2 = $('#input-amazon-2');
    const inputAmazon3 = $('#input-amazon-3');
    const inputNextLinks = $('#input-next-links');
    const inputLpUrl = $('#input-lp-url');
    const inputPresetName = $('#input-preset-name');

    // Buttons
    const btnTestConn = $('#btn-test-conn');
    const btnLoadPost = $('#btn-load-post');
    const btnPreview = $('#btn-preview');
    const btnApply = $('#btn-apply');
    const btnBackConfig = $('#btn-back-config');
    const btnNew = $('#btn-new');
    const btnClearLogs = $('#btn-clear-logs');
    const btnTogglePw = $('#btn-toggle-pw');
    const btnToggleColors = $('#btn-toggle-colors');
    const btnPresets = $('#btn-presets');
    const btnSavePreset = $('#btn-save-preset');
    const btnConfirmSavePreset = $('#btn-confirm-save-preset');

    // Display elements
    const connStatus = $('#conn-status');
    const postTitle = $('#post-title');
    const postStatusBadge = $('#post-status-badge');
    const postMetaText = $('#post-meta-text');
    const postHeadings = $('#post-headings');
    const postBlocksWarning = $('#post-blocks-warning');
    const previewCount = $('#preview-count');
    const insertionsList = $('#insertions-list');
    const diffView = $('#diff-view');
    const diffStats = $('#diff-stats');
    const resultBox = $('#result-box');
    const resultSub = $('#result-sub');
    const btnViewPost = $('#btn-view-post');
    const logsContainer = $('#logs-container');
    const loadingOverlay = $('#loading-overlay');
    const loadingText = $('#loading-text');

    // Modals
    const modalPresets = $('#modal-presets');
    const modalSavePreset = $('#modal-save-preset');
    const presetsList = $('#presets-list');

    // Color inputs
    const colorInputs = $('#color-inputs');

    // ============================================================
    // STATE
    // ============================================================
    let currentPost = null;
    let currentContent = null;
    let previewData = null;

    // ============================================================
    // LOGGING
    // ============================================================
    function log(message, type = 'info') {
        const container = logsContainer;
        // Remove placeholder
        const empty = container.querySelector('.log-empty');
        if (empty) empty.remove();

        const entry = document.createElement('div');
        entry.className = `log-entry log-${type}`;
        const time = new Date().toLocaleTimeString('pt-BR');
        entry.textContent = `[${time}] ${message}`;
        container.appendChild(entry);
        container.scrollTop = container.scrollHeight;
    }

    function clearLogs() {
        logsContainer.innerHTML = '<div class="log-empty">Aguardando ação...</div>';
    }

    // ============================================================
    // LOADING
    // ============================================================
    function showLoading(text) {
        loadingText.textContent = text || 'Processando...';
        loadingOverlay.classList.remove('hidden');
    }

    function hideLoading() {
        loadingOverlay.classList.add('hidden');
    }

    // ============================================================
    // HELPERS
    // ============================================================
    function getCredentials() {
        return {
            siteUrl: inputSiteUrl.value.trim(),
            username: inputUsername.value.trim(),
            appPassword: inputAppPassword.value.trim(),
        };
    }

    function getConfig() {
        // Parse links internos do textarea (um por linha)
        const nextLinksRaw = inputNextLinks.value.trim();
        const nextLinks = nextLinksRaw
            ? nextLinksRaw.split('\n').map(l => l.trim()).filter(l => l.length > 0).slice(0, 5)
            : [];

        return {
            leadMagnetUrl: inputLeadMagnet.value.trim(),
            hostingerUrl: inputHostinger.value.trim(),
            lpUrl: inputLpUrl.value.trim() || 'https://conteudix.com/lp/',
            amazonLinks: {
                link1: inputAmazon1.value.trim(),
                link2: inputAmazon2.value.trim(),
                link3: inputAmazon3.value.trim(),
            },
            nextLinks,
            colors: {
                primary: $('#color-primary').value,
                accent: $('#color-accent').value,
                background: $('#color-bg').value,
            },
        };
    }

    function getSelectedBlocks() {
        const blocks = [];
        if ($('#check-A').checked) blocks.push('A');
        if ($('#check-B').checked) blocks.push('B');
        if ($('#check-C').checked) blocks.push('C');
        if ($('#check-D').checked) blocks.push('D');
        if ($('#check-E').checked) blocks.push('E');
        if ($('#check-QUIZ').checked) blocks.push('QUIZ');
        if ($('#check-F').checked) blocks.push('F');
        return blocks;
    }

    async function apiCall(endpoint, body) {
        const response = await fetch(`${API}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        if (!response.ok || data.error) {
            throw new Error(data.error || `Erro HTTP ${response.status}`);
        }
        return data;
    }

    // ============================================================
    // TEST CONNECTION
    // ============================================================
    btnTestConn.addEventListener('click', async () => {
        const creds = getCredentials();
        if (!creds.siteUrl || !creds.username || !creds.appPassword) {
            log('❌ Preencha URL, username e password', 'error');
            return;
        }

        showLoading('Testando conexão...');
        log('🔌 Testando conexão com WordPress...', 'step');

        try {
            const result = await apiCall('/api/test-connection', creds);
            connStatus.innerHTML = `<span class="conn-success">✅ Conectado como ${result.user}</span>`;
            log(`✅ Conexão OK! Usuário: ${result.user}`, 'success');
        } catch (error) {
            connStatus.innerHTML = `<span class="conn-error">❌ Falhou</span>`;
            log(`❌ ${error.message}`, 'error');
        } finally {
            hideLoading();
        }
    });

    // ============================================================
    // LOAD POST
    // ============================================================
    btnLoadPost.addEventListener('click', async () => {
        const creds = getCredentials();
        const postUrl = inputPostUrl.value.trim();
        const postId = inputPostId.value.trim();

        if (!creds.siteUrl || !creds.username || !creds.appPassword) {
            log('❌ Preencha as credenciais WordPress', 'error');
            return;
        }
        if (!postUrl && !postId) {
            log('❌ Informe a URL do post ou o ID', 'error');
            return;
        }

        showLoading('Carregando post...');
        log('📄 Carregando post do WordPress...', 'step');

        try {
            const result = await apiCall('/api/load-post', {
                ...creds,
                postUrl: postUrl || undefined,
                postId: postId || undefined,
            });

            currentPost = result.post;
            currentContent = result.content;

            // Exibir informações do post
            postTitle.textContent = currentPost.title;
            postStatusBadge.textContent = currentPost.status;
            postStatusBadge.className = `badge badge-${currentPost.status === 'publish' ? 'publish' : 'draft'}`;
            postMetaText.textContent = `ID: ${currentPost.id} • ${currentPost.contentLength.toLocaleString()} chars • ${result.analysis.headings.length} headings`;

            // Headings
            postHeadings.innerHTML = result.analysis.headings.map(h =>
                `<span class="heading-tag heading-tag-h${h.level}">H${h.level}: ${h.text.slice(0, 40)}${h.text.length > 40 ? '...' : ''}</span>`
            ).join('');

            // Blocos existentes
            if (result.analysis.existingBlocks.length > 0) {
                postBlocksWarning.innerHTML = `<div class="warning-box">⚠️ Blocos já existentes: ${result.analysis.existingBlocks.join(', ')} — serão pulados</div>`;
            } else {
                postBlocksWarning.innerHTML = '';
            }

            log(`✅ Post carregado: "${currentPost.title}"`, 'success');
            log(`📊 ${result.analysis.h2Count} H2, ${result.analysis.h3Count} H3 detectados`, 'info');
            if (result.analysis.hasTOC) log('📑 Índice/Sumário detectado', 'info');
            if (result.analysis.hasFAQ) log('❓ FAQ detectado', 'info');
            if (result.analysis.hasConclusion) log('✅ Conclusão detectada', 'info');

            // Mostrar produtos sugeridos
            if (result.analysis.suggestedProducts) {
                const sp = result.analysis.suggestedProducts;
                log(`📦 Produtos Amazon detectados (tema: ${sp.category}): ${sp.products.map(p => p.title).join(', ')}`, 'info');
                // Atualizar labels dos inputs Amazon
                sp.products.forEach((p, i) => {
                    const label = document.getElementById(`label-amazon-${i + 1}`);
                    if (label) label.textContent = `${p.emoji} ${p.title}`;
                });
                // Atualizar info box
                const infoBox = document.getElementById('auto-products-info');
                if (infoBox) {
                    infoBox.innerHTML = `<p style="margin:0 0 6px 0;font-size:13px;color:var(--primary);">📦 Tema detectado: <strong>${sp.category}</strong></p>
                    <p style="margin:0;font-size:12px;color:var(--text-muted)">Produtos sugeridos: ${sp.products.map(p => `${p.emoji} ${p.title}`).join(' • ')}</p>`;
                }
            }

            // Mostrar seção 2
            sectionPost.classList.remove('hidden');
            sectionPost.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } catch (error) {
            log(`❌ ${error.message}`, 'error');
        } finally {
            hideLoading();
        }
    });

    // ============================================================
    // PREVIEW
    // ============================================================
    btnPreview.addEventListener('click', async () => {
        if (!currentContent) {
            log('❌ Carregue um post primeiro', 'error');
            return;
        }

        const selectedBlocks = getSelectedBlocks();
        if (selectedBlocks.length === 0) {
            log('❌ Selecione pelo menos um bloco', 'error');
            return;
        }

        showLoading('Gerando preview...');
        log('👁️ Gerando preview das inserções...', 'step');

        try {
            const result = await apiCall('/api/preview', {
                content: currentContent,
                config: getConfig(),
                selectedBlocks,
            });

            previewData = result;

            // Contagem
            previewCount.textContent = `${result.insertionCount} bloco${result.insertionCount !== 1 ? 's' : ''}`;

            // Lista de inserções
            insertionsList.innerHTML = result.insertions.map(ins =>
                `<div class="insertion-item">
          <span class="insertion-key">${ins.blockKey}</span>
          <span class="insertion-label">${ins.label}</span>
        </div>`
            ).join('');

            // Diff
            diffStats.textContent = `${result.originalLength.toLocaleString()} → ${result.newLength.toLocaleString()} chars (+${(result.newLength - result.originalLength).toLocaleString()})`;
            diffView.innerHTML = result.diff.map(d => {
                if (d.type === 'added') {
                    return `<div class="diff-line-added">+ ${escapeHtml(d.content)} (${d.lineCount} linhas)</div>`;
                } else if (d.type === 'removed') {
                    return `<div class="diff-line-removed">- ${escapeHtml(d.content)} (${d.lineCount} linhas)</div>`;
                } else {
                    return `<div class="diff-line-context">... ${d.lineCount} linhas sem alteração ...</div>`;
                }
            }).join('');

            // Logs
            result.logs.forEach(l => log(l, l.includes('✅') ? 'success' : 'info'));
            result.warnings.forEach(w => log(w, 'warning'));

            // Mostrar seção 3
            sectionPreview.classList.remove('hidden');
            sectionPreview.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } catch (error) {
            log(`❌ ${error.message}`, 'error');
        } finally {
            hideLoading();
        }
    });

    // ============================================================
    // APPLY
    // ============================================================
    btnApply.addEventListener('click', async () => {
        if (!currentPost || !currentContent) {
            log('❌ Nenhum post carregado', 'error');
            return;
        }

        if (!confirm('Tem certeza que deseja aplicar os blocos no WordPress?\n\nUm backup será criado automaticamente.')) {
            return;
        }

        showLoading('Aplicando no WordPress...');
        log('🚀 Aplicando inserções no WordPress...', 'step');

        try {
            const result = await apiCall('/api/apply', {
                ...getCredentials(),
                postId: currentPost.id,
                content: currentContent,
                config: getConfig(),
                selectedBlocks: getSelectedBlocks(),
                createBackup: $('#check-backup').checked,
            });

            // Logs
            result.logs.forEach(l => log(l, l.includes('✅') ? 'success' : 'info'));
            result.warnings.forEach(w => log(w, 'warning'));
            log(`🎉 ${result.message}`, 'success');

            // Resultado
            resultSub.textContent = result.message;
            resultBox.innerHTML = `
        <p><span class="result-highlight">${result.insertionCount}</span> blocos inseridos com sucesso!</p>
        <p>Post: <strong>${currentPost.title}</strong></p>
        <p>Link: <a href="${result.postLink}" target="_blank" style="color:var(--primary)">${result.postLink}</a></p>
      `;
            btnViewPost.href = result.postLink || currentPost.link;

            // Mostrar resultado
            sectionPreview.classList.add('hidden');
            sectionResult.classList.remove('hidden');
            sectionResult.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } catch (error) {
            log(`❌ ${error.message}`, 'error');
        } finally {
            hideLoading();
        }
    });

    // ============================================================
    // NAVIGATION
    // ============================================================
    btnBackConfig.addEventListener('click', () => {
        sectionPreview.classList.add('hidden');
        sectionPost.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    btnNew.addEventListener('click', () => {
        currentPost = null;
        currentContent = null;
        previewData = null;
        sectionPost.classList.add('hidden');
        sectionPreview.classList.add('hidden');
        sectionResult.classList.add('hidden');
        inputPostUrl.value = '';
        inputPostId.value = '';
        sectionConnection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        log('🔄 Pronto para novo post', 'info');
    });

    // ============================================================
    // UI TOGGLES
    // ============================================================
    btnTogglePw.addEventListener('click', () => {
        const type = inputAppPassword.type === 'password' ? 'text' : 'password';
        inputAppPassword.type = type;
        btnTogglePw.textContent = type === 'password' ? '👁️' : '🙈';
    });

    btnToggleColors.addEventListener('click', () => {
        colorInputs.classList.toggle('hidden');
    });

    btnClearLogs.addEventListener('click', clearLogs);

    // ============================================================
    // PRESETS
    // ============================================================
    btnPresets.addEventListener('click', async () => {
        modalPresets.classList.remove('hidden');
        await loadPresets();
    });

    $('#modal-close-presets').addEventListener('click', () => {
        modalPresets.classList.add('hidden');
    });

    btnSavePreset.addEventListener('click', () => {
        modalSavePreset.classList.remove('hidden');
    });

    $('#modal-close-save').addEventListener('click', () => {
        modalSavePreset.classList.add('hidden');
    });

    btnConfirmSavePreset.addEventListener('click', async () => {
        const name = inputPresetName.value.trim();
        if (!name) {
            log('❌ Nome do preset é obrigatório', 'error');
            return;
        }

        try {
            await apiCall('/api/presets', {
                name,
                config: {
                    ...getCredentials(),
                    ...getConfig(),
                },
            });
            log(`💾 Preset "${name}" salvo!`, 'success');
            modalSavePreset.classList.add('hidden');
            inputPresetName.value = '';
        } catch (error) {
            log(`❌ ${error.message}`, 'error');
        }
    });

    async function loadPresets() {
        try {
            const response = await fetch(`${API}/api/presets`);
            const data = await response.json();

            if (!data.presets || data.presets.length === 0) {
                presetsList.innerHTML = '<p class="text-muted">Nenhum preset salvo.</p>';
                return;
            }

            presetsList.innerHTML = data.presets.map(p => `
        <div class="preset-item" data-filename="${p.filename}">
          <div>
            <div class="preset-name">${p.name}</div>
            <div class="preset-date">${new Date(p.createdAt).toLocaleDateString('pt-BR')}</div>
          </div>
          <div class="preset-actions">
            <button class="btn btn-ghost btn-sm btn-load-preset" data-filename="${p.filename}">Carregar</button>
            <button class="btn btn-ghost btn-sm btn-delete-preset" data-filename="${p.filename}" style="color:var(--danger)">✕</button>
          </div>
        </div>
      `).join('');

            // Event listeners
            presetsList.querySelectorAll('.btn-load-preset').forEach(btn => {
                btn.addEventListener('click', () => {
                    const preset = data.presets.find(p => p.filename === btn.dataset.filename);
                    if (preset && preset.config) {
                        applyPreset(preset.config);
                        modalPresets.classList.add('hidden');
                        log(`📋 Preset "${preset.name}" carregado`, 'success');
                    }
                });
            });

            presetsList.querySelectorAll('.btn-delete-preset').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (!confirm('Deletar este preset?')) return;
                    try {
                        await fetch(`${API}/api/presets/${btn.dataset.filename}`, { method: 'DELETE' });
                        log('🗑️ Preset deletado', 'info');
                        await loadPresets();
                    } catch (e) {
                        log('❌ Erro ao deletar preset', 'error');
                    }
                });
            });
        } catch (error) {
            presetsList.innerHTML = '<p class="text-muted">Erro ao carregar presets.</p>';
        }
    }

    function applyPreset(config) {
        if (config.siteUrl) inputSiteUrl.value = config.siteUrl;
        if (config.username) inputUsername.value = config.username;
        if (config.appPassword) inputAppPassword.value = config.appPassword;
        if (config.leadMagnetUrl) inputLeadMagnet.value = config.leadMagnetUrl;
        if (config.hostingerUrl) inputHostinger.value = config.hostingerUrl;
        if (config.lpUrl) inputLpUrl.value = config.lpUrl;
        if (config.amazonLinks) {
            if (config.amazonLinks.link1 || config.amazonLinks.livro) inputAmazon1.value = config.amazonLinks.link1 || config.amazonLinks.livro || '';
            if (config.amazonLinks.link2 || config.amazonLinks.notebook) inputAmazon2.value = config.amazonLinks.link2 || config.amazonLinks.notebook || '';
            if (config.amazonLinks.link3 || config.amazonLinks.mouse) inputAmazon3.value = config.amazonLinks.link3 || config.amazonLinks.mouse || '';
        }
        if (config.nextLinks && Array.isArray(config.nextLinks)) {
            inputNextLinks.value = config.nextLinks.join('\n');
        }
        if (config.colors) {
            if (config.colors.primary) $('#color-primary').value = config.colors.primary;
            if (config.colors.accent) $('#color-accent').value = config.colors.accent;
            if (config.colors.background) $('#color-bg').value = config.colors.background;
        }
    }

    // Close modals on overlay click
    [modalPresets, modalSavePreset].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    });

    // ============================================================
    // HELPERS
    // ============================================================
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================================
    // INIT — Load saved values from localStorage
    // ============================================================
    function saveToLocal() {
        try {
            localStorage.setItem('ap_site_url', inputSiteUrl.value);
            localStorage.setItem('ap_username', inputUsername.value);
            localStorage.setItem('ap_lead', inputLeadMagnet.value);
            localStorage.setItem('ap_hostinger', inputHostinger.value);
        } catch (e) { /* ignore */ }
    }

    function loadFromLocal() {
        try {
            inputSiteUrl.value = localStorage.getItem('ap_site_url') || '';
            inputUsername.value = localStorage.getItem('ap_username') || '';
            inputLeadMagnet.value = localStorage.getItem('ap_lead') || '';
            inputHostinger.value = localStorage.getItem('ap_hostinger') || '';
        } catch (e) { /* ignore */ }
    }

    // Save on blur
    [inputSiteUrl, inputUsername, inputLeadMagnet, inputHostinger].forEach(el => {
        el.addEventListener('blur', saveToLocal);
    });

    // Init
    loadFromLocal();
    log('🚀 App Artigo Pilar iniciado', 'step');
})();
