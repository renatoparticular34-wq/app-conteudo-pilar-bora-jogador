/**
 * server.js
 * Servidor Express para o App Artigo Pilar.
 * 
 * Endpoints:
 * - GET  /                    → Serve o frontend
 * - POST /api/load-post       → Carrega post do WordPress
 * - POST /api/preview         → Gera preview das inserções
 * - POST /api/apply           → Aplica inserções no WordPress
 * - POST /api/test-connection → Testa conexão com WordPress
 * - GET  /api/presets         → Lista presets salvos
 * - POST /api/presets         → Salva preset
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { diffLines } = require('diff');

const WordPressAPI = require('./engine/wordpress-api');
const { applyInsertions, generatePreview, analyzeContent } = require('./engine/insertion-engine');
const { suggestProducts } = require('./engine/product-suggester');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Middleware ----
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ---- Diretórios necessários ----
const BACKUPS_DIR = path.join(__dirname, 'backups');
const PRESETS_DIR = path.join(__dirname, 'presets');
if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });
if (!fs.existsSync(PRESETS_DIR)) fs.mkdirSync(PRESETS_DIR, { recursive: true });

// ============================================================
// ROTAS API
// ============================================================

/**
 * Testa conexão com WordPress
 */
app.post('/api/test-connection', async (req, res) => {
    try {
        const { siteUrl, username, appPassword } = req.body;
        if (!siteUrl || !username || !appPassword) {
            return res.status(400).json({ error: 'Campos siteUrl, username e appPassword são obrigatórios.' });
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log(`[TESTE CONEXÃO] Site: ${siteUrl}`);
        console.log(`[TESTE CONEXÃO] User: ${username}`);
        console.log(`[TESTE CONEXÃO] Pass: ${appPassword.substring(0, 4)}... (${appPassword.length} chars)`);
        console.log(`${'='.repeat(60)}`);

        const wp = new WordPressAPI(siteUrl, username, appPassword);
        const result = await wp.testConnection();

        console.log(`[TESTE CONEXÃO] ✅ SUCESSO: ${JSON.stringify(result)}`);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error(`[TESTE CONEXÃO] ❌ ERRO: ${error.message}`);
        console.error(`[TESTE CONEXÃO] Stack: ${error.stack}`);
        const status = error.status || 500;
        res.status(status).json({
            error: error.message,
            hint: status === 500 ? 'Verifique o terminal do servidor para mais detalhes.' : undefined
        });
    }
});

/**
 * Carrega post do WordPress
 */
app.post('/api/load-post', async (req, res) => {
    try {
        const { siteUrl, username, appPassword, postUrl, postId } = req.body;
        if (!siteUrl || !username || !appPassword) {
            return res.status(400).json({ error: 'Credenciais WordPress são obrigatórias.' });
        }
        if (!postUrl && !postId) {
            return res.status(400).json({ error: 'Post URL ou Post ID é obrigatório.' });
        }

        const wp = new WordPressAPI(siteUrl, username, appPassword);
        let post;

        if (postId) {
            post = await wp.getPostById(parseInt(postId));
        } else {
            post = await wp.getPostByUrl(postUrl);
        }

        // Analisar conteúdo
        const analysis = analyzeContent(post.content);
        const productSuggestion = suggestProducts(post.content);

        res.json({
            success: true,
            post: {
                id: post.id,
                title: post.title,
                status: post.status,
                slug: post.slug,
                link: post.link,
                modified: post.modified,
                excerpt: post.excerpt,
                contentLength: post.content.length,
            },
            analysis: {
                headings: analysis.headings.map(h => ({
                    level: h.level,
                    text: h.text,
                })),
                hasTOC: !!analysis.toc,
                hasFAQ: !!analysis.faq,
                hasConclusion: !!analysis.conclusion,
                existingBlocks: analysis.existingBlocks,
                h2Count: analysis.h2Count,
                h3Count: analysis.h3Count,
                suggestedProducts: productSuggestion,
            },
            // Guardar conteúdo no lado do cliente para o preview
            content: post.content,
        });
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
});

/**
 * Gera preview (sem publicar)
 */
app.post('/api/preview', async (req, res) => {
    try {
        const { content, config, selectedBlocks } = req.body;
        if (!content) {
            return res.status(400).json({ error: 'Conteúdo do post é obrigatório.' });
        }

        const preview = generatePreview(content, config || {}, selectedBlocks || ['A', 'B', 'C', 'D', 'E', 'QUIZ']);

        // Gerar diff simplificado
        const diff = generateSimpleDiff(content, preview.newContent);

        res.json({
            success: true,
            insertionCount: preview.insertionCount,
            insertions: preview.insertions,
            logs: preview.logs,
            warnings: preview.warnings,
            originalLength: preview.originalLength,
            newLength: preview.newLength,
            diff: diff,
            newContent: preview.newContent,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Aplica inserções no WordPress
 */
app.post('/api/apply', async (req, res) => {
    try {
        const { siteUrl, username, appPassword, postId, content, config, selectedBlocks, createBackup } = req.body;

        if (!siteUrl || !username || !appPassword || !postId || !content) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios para aplicar.' });
        }

        // 1. Criar backup se solicitado
        if (createBackup !== false) {
            const backupData = {
                postId,
                timestamp: new Date().toISOString(),
                siteUrl,
                originalContent: content,
            };
            const backupFile = path.join(BACKUPS_DIR, `backup_post_${postId}_${Date.now()}.json`);
            fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2), 'utf-8');
            console.log(`💾 Backup salvo: ${backupFile}`);
        }

        // 2. Aplicar inserções
        const result = applyInsertions(content, config || {}, selectedBlocks || ['A', 'B', 'C', 'D', 'E', 'QUIZ']);

        // 3. Atualizar no WordPress
        const wp = new WordPressAPI(siteUrl, username, appPassword);
        const updatedPost = await wp.updatePost(postId, result.newContent);

        res.json({
            success: true,
            message: `Post atualizado com sucesso! ${result.insertions.length} blocos inseridos.`,
            postLink: updatedPost.link,
            insertionCount: result.insertions.length,
            insertions: result.insertions,
            logs: result.logs,
            warnings: result.warnings,
        });
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
});

// ============================================================
// PRESETS
// ============================================================

app.get('/api/presets', (req, res) => {
    try {
        const files = fs.readdirSync(PRESETS_DIR).filter(f => f.endsWith('.json'));
        const presets = files.map(f => {
            const data = JSON.parse(fs.readFileSync(path.join(PRESETS_DIR, f), 'utf-8'));
            return { filename: f, ...data };
        });
        res.json({ success: true, presets });
    } catch (error) {
        res.json({ success: true, presets: [] });
    }
});

app.post('/api/presets', (req, res) => {
    try {
        const { name, config } = req.body;
        if (!name || !config) {
            return res.status(400).json({ error: 'Nome e config são obrigatórios.' });
        }
        const filename = name.replace(/[^a-zA-Z0-9\-_]/g, '_') + '.json';
        const data = {
            name,
            config,
            createdAt: new Date().toISOString(),
        };
        fs.writeFileSync(path.join(PRESETS_DIR, filename), JSON.stringify(data, null, 2), 'utf-8');
        res.json({ success: true, message: `Preset "${name}" salvo!` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/presets/:filename', (req, res) => {
    try {
        const filepath = path.join(PRESETS_DIR, req.params.filename);
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Preset não encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// HELPERS
// ============================================================

/**
 * Gera diff simplificado entre dois textos
 */
function generateSimpleDiff(original, modified) {
    const changes = diffLines(original, modified);
    const result = [];
    let lineNum = 0;

    for (const part of changes) {
        const lines = part.value.split('\n').filter(l => l.trim());
        if (part.added) {
            // Mostrar apenas as primeiras 3 linhas de cada adição
            const preview = lines.slice(0, 3).join('\n');
            const more = lines.length > 3 ? ` ... (+${lines.length - 3} linhas)` : '';
            result.push({
                type: 'added',
                content: preview + more,
                lineCount: lines.length,
            });
        } else if (part.removed) {
            result.push({
                type: 'removed',
                content: lines.slice(0, 2).join('\n'),
                lineCount: lines.length,
            });
        } else {
            lineNum += lines.length;
            if (lines.length > 0) {
                result.push({
                    type: 'unchanged',
                    lineCount: lines.length,
                });
            }
        }
    }

    return result;
}

// ---- Fallback: servir index.html para rotas não-API ----
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---- Iniciar servidor ----
app.listen(PORT, () => {
    console.log(`\n🚀 App Artigo Pilar rodando em http://localhost:${PORT}`);
    console.log(`📂 Backups em: ${BACKUPS_DIR}`);
    console.log(`📋 Presets em: ${PRESETS_DIR}\n`);
});
