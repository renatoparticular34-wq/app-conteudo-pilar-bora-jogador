/**
 * wordpress-api.js
 * Cliente para WordPress REST API.
 * Suporta autenticação via Application Password (Basic Auth).
 * 
 * CORREÇÃO LiteSpeed/Apache:
 * Hostings com LiteSpeed (como Hostinger) removem o header Authorization.
 * Este cliente tenta múltiplos métodos de autenticação:
 * 1. Header Authorization: Basic (padrão)
 * 2. Header X-WP-Auth (via plugin ou .htaccess workaround)
 * 3. URL auth (user:pass@domain)
 */

const axios = require('axios');
const https = require('https');
const http = require('http');

// User-Agent realista de navegador para evitar bloqueio por WAF/Firewall
const BROWSER_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// Agente HTTPS: aceita certificados auto-assinados + keep-alive
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
    keepAlive: true,
});

const httpAgent = new http.Agent({
    keepAlive: true,
});

class WordPressAPI {
    /**
     * @param {string} siteUrl - URL do site WordPress (ex: https://conteudix.com)
     * @param {string} username - Usuário WP
     * @param {string} appPassword - Application Password
     */
    constructor(siteUrl, username, appPassword) {
        // Normalizar URL: remover trailing slashes
        this.siteUrl = siteUrl.replace(/\/+$/, '');
        this.apiBase = `${this.siteUrl}/wp-json/wp/v2`;

        // Normalizar Application Password: remover espaços extras nas pontas
        const cleanPassword = appPassword.trim();
        const cleanUsername = username.trim();

        this.username = cleanUsername;
        this.password = cleanPassword;
        this.authHeader = 'Basic ' + Buffer.from(`${cleanUsername}:${cleanPassword}`).toString('base64');

        // Montar URL com auth embutido (para LiteSpeed/Apache workaround)
        const urlObj = new URL(this.siteUrl);
        this.authSiteUrl = `${urlObj.protocol}//${encodeURIComponent(cleanUsername)}:${encodeURIComponent(cleanPassword)}@${urlObj.host}${urlObj.pathname}`;

        console.log(`[WP-API] Site: ${this.siteUrl}`);
        console.log(`[WP-API] API Base: ${this.apiBase}`);
        console.log(`[WP-API] Username: ${cleanUsername}`);
        console.log(`[WP-API] Password length: ${cleanPassword.length} chars`);

        // Alerta se a password parece curta demais
        if (cleanPassword.length < 20) {
            console.log(`[WP-API] ⚠️ ATENÇÃO: A Application Password parece curta (${cleanPassword.length} chars).`);
            console.log(`[WP-API] ⚠️ Application Passwords do WordPress normalmente têm 24 chars (formato: xxxx xxxx xxxx xxxx xxxx xxxx).`);
            console.log(`[WP-API] ⚠️ Certifique-se de que copiou a senha COMPLETA, incluindo os espaços.`);
        }
    }

    /**
     * Headers padrão para todas as requisições
     */
    getHeaders() {
        return {
            'Authorization': this.authHeader,
            'Content-Type': 'application/json',
            'User-Agent': BROWSER_USER_AGENT,
            'Accept': 'application/json, text/html, */*',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
        };
    }

    /**
     * Configuração do axios com timeout e HTTPS agent
     */
    getAxiosConfig(extra = {}) {
        return {
            headers: this.getHeaders(),
            httpsAgent: httpsAgent,
            httpAgent: httpAgent,
            timeout: 30000,
            maxRedirects: 5,
            decompress: true,
            validateStatus: null,
            // Também enviar auth via axios auth (método alternativo)
            auth: {
                username: this.username,
                password: this.password,
            },
            ...extra,
        };
    }

    /**
     * Faz request com fallback de autenticação
     * Se o método padrão falhar com rest_not_logged_in, tenta URL auth
     */
    async requestWithAuthFallback(method, url, data = null, extraConfig = {}) {
        // Tentativa 1: Header Authorization + axios auth
        console.log(`[WP-API] Tentativa 1: Auth via header Authorization`);
        let response;
        if (method === 'GET') {
            response = await axios.get(url, { ...this.getAxiosConfig(), ...extraConfig });
        } else {
            response = await axios.post(url, data, { ...this.getAxiosConfig(), ...extraConfig });
        }

        this._logResponse(response);

        // Se 401 com rest_not_logged_in, tentar método 2
        if (response.status === 401 && response.data?.code === 'rest_not_logged_in') {
            console.log(`[WP-API] ⚠️ Auth header foi removida pelo servidor (LiteSpeed/Apache)`);
            console.log(`[WP-API] Tentativa 2: Auth via URL (user:pass@domain)`);

            // Reconstruir URL com credenciais embutidas
            const urlObj = new URL(url);
            urlObj.username = this.username;
            urlObj.password = this.password;
            const authUrl = urlObj.toString();

            const config2 = {
                httpsAgent,
                httpAgent,
                timeout: 30000,
                decompress: true,
                validateStatus: null,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': BROWSER_USER_AGENT,
                    'Accept': 'application/json',
                },
                ...extraConfig,
            };

            if (method === 'GET') {
                response = await axios.get(authUrl, config2);
            } else {
                response = await axios.post(authUrl, data, config2);
            }

            this._logResponse(response);

            // Se ainda 401, tentar método 3: PHP_AUTH workaround via query param
            if (response.status === 401 && response.data?.code === 'rest_not_logged_in') {
                console.log(`[WP-API] ⚠️ URL auth também falhou`);
                console.log(`[WP-API] Tentativa 3: Auth via query parameter _authorization`);

                // Alguns plugins e configurações aceitam auth via query
                const sep = url.includes('?') ? '&' : '?';
                const authParamUrl = `${url}${sep}_authorization=${encodeURIComponent(this.authHeader)}`;

                if (method === 'GET') {
                    response = await axios.get(authParamUrl, config2);
                } else {
                    response = await axios.post(authParamUrl, data, config2);
                }

                this._logResponse(response);
            }
        }

        return response;
    }

    /**
     * Busca post por ID
     */
    async getPostById(postId) {
        console.log(`[WP-API] GET post by ID: ${postId}`);
        try {
            const url = `${this.apiBase}/posts/${postId}`;
            console.log(`[WP-API] Request URL: ${url}`);

            const response = await this.requestWithAuthFallback('GET', url, null, {
                params: { context: 'edit' },
            });

            if (response.status >= 400) {
                throw this._createError(response, `Buscar post ID ${postId}`);
            }

            return this._normalizePost(response.data);
        } catch (error) {
            if (error.wpContext) throw error;
            throw this._handleError(error, `Buscar post ID ${postId}`);
        }
    }

    /**
     * Busca post por slug (ex: "como-fazer-seo")
     */
    async getPostBySlug(slug) {
        console.log(`[WP-API] GET post by slug: ${slug}`);
        try {
            const url = `${this.apiBase}/posts`;
            console.log(`[WP-API] Request URL: ${url}?slug=${slug}`);

            const response = await this.requestWithAuthFallback('GET', url, null, {
                params: {
                    slug: slug,
                    context: 'edit',
                    per_page: 1,
                    status: 'any',
                },
            });

            if (response.status >= 400) {
                throw this._createError(response, `Buscar post com slug "${slug}"`);
            }

            if (!response.data || response.data.length === 0) {
                // Tentar sem context=edit (pode ser permissão)
                console.log(`[WP-API] Post não encontrado com context=edit, tentando sem...`);
                const response2 = await this.requestWithAuthFallback('GET', url, null, {
                    params: { slug: slug, per_page: 1 },
                });

                if (response2.status >= 400) {
                    throw this._createError(response2, `Buscar post com slug "${slug}"`);
                }

                if (!response2.data || response2.data.length === 0) {
                    throw new Error(`Post não encontrado com slug: "${slug}". Verifique se a URL está correta.`);
                }

                return this._normalizePost(response2.data[0]);
            }

            return this._normalizePost(response.data[0]);
        } catch (error) {
            if (error.wpContext) throw error;
            if (error.message && error.message.includes('não encontrado')) throw error;
            throw this._handleError(error, `Buscar post com slug "${slug}"`);
        }
    }

    /**
     * Busca post por URL completa
     */
    async getPostByUrl(url) {
        const slug = this._extractSlug(url);
        console.log(`[WP-API] Extracted slug from URL: "${slug}"`);
        if (!slug) {
            throw new Error(`Não foi possível extrair o slug da URL: ${url}`);
        }
        return this.getPostBySlug(slug);
    }

    /**
     * Atualiza o conteúdo de um post
     */
    async updatePost(postId, content) {
        console.log(`[WP-API] PUT post ID: ${postId}`);
        try {
            const url = `${this.apiBase}/posts/${postId}`;
            const response = await this.requestWithAuthFallback('POST', url, { content });

            if (response.status >= 400) {
                throw this._createError(response, `Atualizar post ID ${postId}`);
            }

            return this._normalizePost(response.data);
        } catch (error) {
            if (error.wpContext) throw error;
            throw this._handleError(error, `Atualizar post ID ${postId}`);
        }
    }

    /**
     * Testa a conexão com a API WordPress
     * Tenta múltiplos endpoints e métodos de auth
     */
    async testConnection() {
        console.log(`[WP-API] ---- TESTE DE CONEXÃO ----`);

        // PASSO 1: Verificar se o site responde
        try {
            console.log(`[WP-API] Passo 1: Verificando se o site responde...`);
            const browserHeaders = {
                'User-Agent': BROWSER_USER_AGENT,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept-Encoding': 'gzip, deflate, br',
            };
            const siteResponse = await axios.get(this.siteUrl, {
                httpsAgent,
                httpAgent,
                timeout: 15000,
                maxRedirects: 5,
                decompress: true,
                validateStatus: null,
                headers: browserHeaders,
            });
            console.log(`[WP-API] Site respondeu: HTTP ${siteResponse.status}`);
        } catch (error) {
            console.log(`[WP-API] ❌ Site não responde: ${error.message}`);
            throw new Error(`Não foi possível conectar ao site ${this.siteUrl}. Verifique a URL. (${error.code || error.message})`);
        }

        // PASSO 2: Verificar se a REST API está acessível
        try {
            console.log(`[WP-API] Passo 2: Verificando REST API...`);
            const apiResponse = await axios.get(`${this.siteUrl}/wp-json/`, {
                httpsAgent,
                httpAgent,
                timeout: 15000,
                decompress: true,
                validateStatus: null,
                headers: {
                    'User-Agent': BROWSER_USER_AGENT,
                    'Accept': 'application/json, text/html, */*',
                },
            });
            console.log(`[WP-API] REST API respondeu: HTTP ${apiResponse.status}`);

            if (apiResponse.status === 404) {
                throw new Error('REST API não encontrada. Verifique se os permalinks estão configurados (Configurações → Links Permanentes) e se não há plugins bloqueando.');
            }

            // Verificar se retornou JSON válido
            const contentType = apiResponse.headers['content-type'] || '';
            if (!contentType.includes('json') && !contentType.includes('javascript')) {
                console.log(`[WP-API] ⚠️ REST API retornou Content-Type: ${contentType} (esperava JSON)`);

                // Tentar endpoint alternativo
                console.log(`[WP-API] Tentando endpoint alternativo: ?rest_route=/`);
                const altResponse = await axios.get(`${this.siteUrl}/?rest_route=/`, {
                    httpsAgent, httpAgent, timeout: 15000, decompress: true, validateStatus: null,
                    headers: { 'User-Agent': BROWSER_USER_AGENT, 'Accept': 'application/json' },
                });

                const altContentType = altResponse.headers['content-type'] || '';
                if (altContentType.includes('json')) {
                    console.log(`[WP-API] ✅ Endpoint alternativo funciona!`);
                    this.apiBase = `${this.siteUrl}/?rest_route=/wp/v2`;
                    this.useRestRoute = true;
                }
            }
        } catch (error) {
            if (error.message.includes('REST API')) throw error;
            console.log(`[WP-API] ❌ REST API falhou: ${error.message}`);
            throw new Error(`REST API não acessível em ${this.siteUrl}/wp-json/. Erro: ${error.message}`);
        }

        // PASSO 3: Autenticação (com fallbacks automáticos)
        try {
            console.log(`[WP-API] Passo 3: Testando autenticação...`);
            const authUrl = this.useRestRoute
                ? `${this.siteUrl}/?rest_route=/wp/v2/users/me`
                : `${this.apiBase}/users/me`;

            console.log(`[WP-API] Auth URL: ${authUrl}`);

            // Usar o requestWithAuthFallback que tenta múltiplos métodos
            const response = await this.requestWithAuthFallback('GET', authUrl, null, {
                params: { context: 'edit' },
            });

            if (response.status === 401) {
                const wpMsg = response.data?.message || '';
                const wpCode = response.data?.code || '';
                console.log(`[WP-API] ❌ Auth 401 FINAL (após todos os fallbacks): code=${wpCode}, message=${wpMsg}`);

                let helpMsg = 'Autenticação falhou após tentar todos os métodos.\n\n';
                helpMsg += '🔧 SOLUÇÃO (LiteSpeed/Apache):\n';
                helpMsg += 'Adicione esta linha no arquivo .htaccess do seu WordPress (na raiz):\n\n';
                helpMsg += 'SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1\n\n';
                helpMsg += 'Ou adicione no wp-config.php (antes de "That\'s all"):\n';
                helpMsg += '// Fix Application Password auth\n';
                helpMsg += 'if (isset($_SERVER["REDIRECT_HTTP_AUTHORIZATION"])) {\n';
                helpMsg += '    $_SERVER["HTTP_AUTHORIZATION"] = $_SERVER["REDIRECT_HTTP_AUTHORIZATION"];\n';
                helpMsg += '}\n\n';
                helpMsg += 'Também verifique:\n';
                helpMsg += '• Username correto (login do WP, não email)\n';
                helpMsg += '• Application Password completa (24 chars com espaços: xxxx xxxx xxxx xxxx xxxx xxxx)\n';
                helpMsg += '• Gere uma NOVA Application Password no WP Admin → Usuários → Perfil';

                // Verificar se a senha é curta
                if (this.password.length < 20) {
                    helpMsg += '\n\n⚠️ ATENÇÃO: Sua senha tem apenas ' + this.password.length + ' caracteres.';
                    helpMsg += '\nApplication Passwords do WordPress têm normalmente 24 caracteres.';
                    helpMsg += '\nVerifique se copiou a senha COMPLETA (com espaços).';
                }

                throw new Error(helpMsg);
            }

            if (response.status === 403) {
                throw new Error('Sem permissão (403). O usuário não tem permissão para acessar a API.');
            }

            if (response.status >= 400) {
                throw this._createError(response, 'Autenticação');
            }

            const user = response.data;
            console.log(`[WP-API] ✅ Autenticação OK! Usuário: ${user.name || user.slug}`);

            return {
                success: true,
                user: user.name || user.slug,
                roles: user.roles || [],
            };
        } catch (error) {
            if (error.message.includes('Autenticação') || error.message.includes('SOLUÇÃO')) throw error;
            console.log(`[WP-API] ❌ Erro na autenticação: ${error.message}`);
            throw this._handleError(error, 'Testar conexão');
        }
    }

    // ---- Helpers ----

    _logResponse(response) {
        const status = response.status;
        const contentType = response.headers?.['content-type'] || 'unknown';
        const dataPreview = typeof response.data === 'string'
            ? response.data.substring(0, 200)
            : JSON.stringify(response.data).substring(0, 200);
        console.log(`[WP-API] Response: HTTP ${status} (${contentType})`);
        if (status >= 400) {
            console.log(`[WP-API] Error data: ${dataPreview}`);
        }
    }

    _normalizePost(data) {
        return {
            id: data.id,
            title: data.title?.rendered || data.title?.raw || '',
            content: data.content?.raw || data.content?.rendered || '',
            status: data.status,
            slug: data.slug,
            link: data.link,
            modified: data.modified,
            excerpt: (data.excerpt?.rendered || '').replace(/<[^>]+>/g, '').trim().slice(0, 200),
        };
    }

    _extractSlug(url) {
        try {
            const parsed = new URL(url);
            const path = parsed.pathname.replace(/^\/|\/$/g, '');
            const segments = path.split('/').filter(s => s.length > 0);
            return segments[segments.length - 1] || null;
        } catch {
            const clean = url.replace(/^https?:\/\/[^/]+\/?/, '').replace(/\/$/, '');
            return clean.split('/').filter(s => s.length > 0).pop() || null;
        }
    }

    _createError(response, context) {
        const status = response.status;
        const data = response.data;
        const wpCode = data?.code || '';
        const wpMsg = data?.message || '';

        let message = `[${status}] `;

        switch (status) {
            case 401:
                if (wpCode === 'invalid_username') {
                    message += 'Username inválido. Use o login do WordPress (não o email).';
                } else if (wpCode === 'incorrect_password') {
                    message += 'Senha incorreta. Use a Application Password (com espaços, como gerada).';
                } else if (wpCode === 'rest_not_logged_in') {
                    message += 'REST API não reconhece a autenticação. Servidor removendo header Authorization.';
                } else {
                    message += `Autenticação falhou. ${wpMsg} (code: ${wpCode})`;
                }
                break;
            case 403:
                message += `Sem permissão. ${wpMsg || 'Verifique o role do usuário.'}`;
                break;
            case 404:
                message += `Não encontrado. ${wpMsg || 'Verifique URL ou ID do post.'}`;
                break;
            case 500:
                message += `Erro interno do WordPress. ${wpMsg}`;
                break;
            default:
                message += wpMsg || `Erro HTTP ${status}`;
        }

        const err = new Error(`${context}: ${message}`);
        err.status = status;
        err.wpData = data;
        err.wpContext = context;
        return err;
    }

    _handleError(error, context) {
        if (error.response) {
            return this._createError(error.response, context);
        }

        if (error.code === 'ECONNREFUSED') {
            return new Error(`${context}: Conexão recusada. O site não está acessível.`);
        }
        if (error.code === 'ENOTFOUND') {
            return new Error(`${context}: Domínio não encontrado. Verifique a URL.`);
        }
        if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
            return new Error(`${context}: Timeout na conexão. Servidor demorou demais.`);
        }

        return new Error(`${context}: ${error.message}`);
    }
}

module.exports = WordPressAPI;
