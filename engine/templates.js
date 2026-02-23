/**
 * templates.js
 * Templates HTML dos blocos de monetização e engajamento.
 * CSS blindado contra conflitos com GeneratePress e outros temas.
 * Jogo interativo gerado dinamicamente a partir do conteúdo do artigo.
 */

function convertDriveLink(url) {
  if (!url) return url;
  const match = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (match) return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  return url;
}

function getColors(custom = {}) {
  return {
    primary: custom.primary || '#00d4aa',
    accent: custom.accent || '#ff6b35',
    bg: custom.background || '#1a1a2e',
    bgLight: custom.backgroundLight || '#16213e',
    text: custom.text || '#e0e0e0',
    textMuted: custom.textLight || '#b0b0b0',
  };
}

/** CSS Reset que isola o bloco de qualquer tema WordPress */
function cssReset(id) {
  return `
#${id},#${id} *,#${id} *::before,#${id} *::after{box-sizing:border-box!important}
#${id}{all:initial!important;display:block!important;visibility:visible!important;opacity:1!important;position:relative!important;font-family:'Segoe UI','Inter',system-ui,Arial,sans-serif!important;line-height:1.6!important;-webkit-font-smoothing:antialiased!important;-moz-osx-font-smoothing:grayscale!important;isolation:isolate!important;float:none!important;clear:both!important;width:auto!important;max-width:100%!important;min-height:0!important;text-align:left!important;text-transform:none!important;letter-spacing:normal!important;word-spacing:normal!important;text-indent:0!important;text-shadow:none!important;white-space:normal!important;vertical-align:baseline!important}
#${id} h3,#${id} h4{all:unset!important;display:block!important;font-family:inherit!important;line-height:1.3!important;margin:0!important;padding:0!important}
#${id} p{all:unset!important;display:block!important;font-family:inherit!important;line-height:1.6!important;margin:0!important;padding:0!important}
#${id} a{all:unset!important;cursor:pointer!important;font-family:inherit!important;display:inline!important}
#${id} span{all:unset!important;font-family:inherit!important}
#${id} div{font-family:inherit!important}
`;
}

// ============================================================
// PONTO A — CTA Lead Magnet (Topo)
// ============================================================
function templatePontoA(leadMagnetUrl, colors = {}) {
  const c = getColors(colors);
  const dl = convertDriveLink(leadMagnetUrl);
  return `
<!-- wp:html -->
<!-- BLOCO-PILAR: PONTO-A CTA-CHECKLIST -->
<div id="cta-checklist">
<style>
${cssReset('cta-checklist')}
#cta-checklist{background:linear-gradient(135deg,${c.bg} 0%,${c.bgLight} 100%)!important;background-color:${c.bg}!important;border:2px solid ${c.primary}!important;border-radius:16px!important;padding:32px 28px!important;margin:28px 0 36px 0!important;text-align:center!important;overflow:hidden!important;box-shadow:0 8px 32px rgba(0,212,170,0.10)!important;color:${c.text}!important}
#cta-checklist::before{content:''!important;position:absolute!important;top:-2px!important;left:-2px!important;right:-2px!important;bottom:-2px!important;background:linear-gradient(135deg,${c.primary},${c.accent},${c.primary})!important;border-radius:18px!important;z-index:-1!important;opacity:0.15!important}
#cta-checklist .cta-badge{display:inline-block!important;background:${c.primary}!important;color:${c.bg}!important;font-size:12px!important;font-weight:700!important;text-transform:uppercase!important;letter-spacing:1.5px!important;padding:4px 14px!important;border-radius:20px!important;margin-bottom:14px!important}
#cta-checklist h3{color:#fff!important;font-size:22px!important;font-weight:800!important;margin:0 0 10px 0!important;background:transparent!important}
#cta-checklist p{color:${c.textMuted}!important;font-size:15px!important;margin:0 0 22px 0!important;max-width:520px!important;margin-left:auto!important;margin-right:auto!important;background:transparent!important}
#cta-checklist .cta-buttons{display:flex!important;gap:14px!important;justify-content:center!important;flex-wrap:wrap!important}
#cta-checklist .cta-btn{display:inline-flex!important;align-items:center!important;gap:8px!important;padding:14px 28px!important;border-radius:10px!important;font-size:15px!important;font-weight:700!important;text-decoration:none!important;transition:all 0.3s ease!important;border:none!important}
#cta-checklist .cta-btn-primary{background:linear-gradient(135deg,${c.primary},#00b894)!important;color:${c.bg}!important;box-shadow:0 4px 15px rgba(0,212,170,0.3)!important}
#cta-checklist .cta-btn-primary:hover{transform:translateY(-2px)!important;box-shadow:0 6px 20px rgba(0,212,170,0.4)!important}
#cta-checklist .cta-btn-secondary{background:transparent!important;color:${c.primary}!important;border:2px solid ${c.primary}!important}
#cta-checklist .cta-btn-secondary:hover{background:rgba(0,212,170,0.1)!important;transform:translateY(-2px)!important}
</style>
<div class="cta-badge">📥 Material Gratuito</div>
<h3>Checklist SEO Completo — Guia Prático</h3>
<p>Baixe agora o checklist que usei para posicionar +50 artigos no Google. Passo a passo com todas as técnicas deste artigo.</p>
<div class="cta-buttons">
  <a href="${dl}" class="cta-btn cta-btn-primary" target="_blank" rel="noopener">📥 Baixar Checklist Grátis</a>
  <a href="#guia-seo" class="cta-btn cta-btn-secondary">📖 Continuar Leitura</a>
</div>
</div>
<!-- /BLOCO-PILAR: PONTO-A -->
<!-- /wp:html -->`;
}

// ============================================================
// PONTO B — Banner Hostinger
// ============================================================
function templatePontoB(hostingerUrl, colors = {}) {
  const c = getColors(colors);
  return `
<!-- wp:html -->
<!-- BLOCO-PILAR: PONTO-B HOSTINGER -->
<div id="cx-hostinger">
<style>
${cssReset('cx-hostinger')}
#cx-hostinger{background:linear-gradient(135deg,#0d1b2a 0%,#1b2838 50%,#0d1b2a 100%)!important;background-color:#0d1b2a!important;border:2px solid #6c63ff!important;border-radius:16px!important;padding:32px 28px!important;margin:36px 0!important;text-align:center!important;overflow:hidden!important;box-shadow:0 8px 32px rgba(108,99,255,0.12)!important;color:#e0e0e0!important}
#cx-hostinger::before{content:''!important;position:absolute!important;top:0!important;left:0!important;right:0!important;height:4px!important;background:linear-gradient(90deg,#6c63ff,${c.primary},#6c63ff)!important}
#cx-hostinger .hst-icon{font-size:40px!important;margin-bottom:12px!important;display:block!important;background:transparent!important}
#cx-hostinger h3{color:#fff!important;font-size:21px!important;font-weight:800!important;margin:0 0 10px 0!important;background:transparent!important}
#cx-hostinger p{color:#b0b0b0!important;font-size:15px!important;margin:0 0 22px 0!important;max-width:520px!important;margin-left:auto!important;margin-right:auto!important;background:transparent!important}
#cx-hostinger .hst-features{display:flex!important;justify-content:center!important;gap:20px!important;flex-wrap:wrap!important;margin-bottom:22px!important}
#cx-hostinger .hst-feat{display:flex!important;align-items:center!important;gap:6px!important;color:${c.primary}!important;font-size:13px!important;font-weight:600!important;background:transparent!important}
#cx-hostinger .hst-buttons{display:flex!important;gap:14px!important;justify-content:center!important;flex-wrap:wrap!important}
#cx-hostinger .hst-btn{display:inline-flex!important;align-items:center!important;gap:8px!important;padding:14px 28px!important;border-radius:10px!important;font-size:15px!important;font-weight:700!important;text-decoration:none!important;transition:all 0.3s ease!important;border:none!important}
#cx-hostinger .hst-btn-primary{background:linear-gradient(135deg,#6c63ff,#5a52d5)!important;color:#fff!important;box-shadow:0 4px 15px rgba(108,99,255,0.3)!important}
#cx-hostinger .hst-btn-primary:hover{transform:translateY(-2px)!important;box-shadow:0 6px 20px rgba(108,99,255,0.4)!important}
#cx-hostinger .hst-btn-secondary{background:transparent!important;color:#6c63ff!important;border:2px solid #6c63ff!important}
#cx-hostinger .hst-btn-secondary:hover{background:rgba(108,99,255,0.1)!important;transform:translateY(-2px)!important}
</style>
<div class="hst-icon">🚀</div>
<h3>Hospedagem WordPress que Realmente Funciona</h3>
<p>A mesma hospedagem que uso neste blog. WordPress otimizado, SSL grátis, velocidade absurda e suporte 24/7.</p>
<div class="hst-features">
  <span class="hst-feat">⚡ LiteSpeed Cache</span>
  <span class="hst-feat">🔒 SSL Grátis</span>
  <span class="hst-feat">🌐 Domínio Grátis</span>
  <span class="hst-feat">💰 Até 80% OFF</span>
</div>
<div class="hst-buttons">
  <a href="${hostingerUrl}" class="hst-btn hst-btn-primary" target="_blank" rel="nofollow sponsored noopener">🚀 Ver Planos Hostinger</a>
  <a href="#seo-quiz" class="hst-btn hst-btn-secondary">🎮 Teste seus Conhecimentos</a>
</div>
</div>
<!-- /BLOCO-PILAR: PONTO-B -->
<!-- /wp:html -->`;
}

// ============================================================
// PONTO C — Amazon 3 Produtos
// ============================================================
function templatePontoC(products = [], colors = {}) {
  const c = getColors(colors);
  // Support old format (object with livro/notebook/mouse) or new format (array of products)
  let productCards;
  if (Array.isArray(products)) {
    productCards = products.map(p =>
      `<div class="amz-card"><div class="amz-emoji">${p.emoji || '📦'}</div><h4>${p.title || 'Produto'}</h4><p>${p.desc || 'Recomendado pelo autor.'}</p><a href="${p.url || '#'}" class="amz-btn" target="_blank" rel="nofollow sponsored noopener">Ver na Amazon</a></div>`
    ).join('\n  ');
  } else {
    // Fallback: old format
    const l1 = products.livro || products.link1 || '#';
    const l2 = products.notebook || products.link2 || '#';
    const l3 = products.mouse || products.link3 || '#';
    productCards = `<div class="amz-card"><div class="amz-emoji">📖</div><h4>Livro Recomendado</h4><p>A leitura que mais impactou meu trabalho nesta área.</p><a href="${l1}" class="amz-btn" target="_blank" rel="nofollow sponsored noopener">Ver na Amazon</a></div>
  <div class="amz-card"><div class="amz-emoji">💻</div><h4>Notebook para Trabalho</h4><p>O equipamento que uso para produzir conteúdo.</p><a href="${l2}" class="amz-btn" target="_blank" rel="nofollow sponsored noopener">Ver na Amazon</a></div>
  <div class="amz-card"><div class="amz-emoji">🖱️</div><h4>Mouse Ergonômico</h4><p>Conforto para longas sessões de trabalho.</p><a href="${l3}" class="amz-btn" target="_blank" rel="nofollow sponsored noopener">Ver na Amazon</a></div>`;
  }
  return `
<!-- wp:html -->
<!-- BLOCO-PILAR: PONTO-C AMAZON -->
<div id="cx-amazon">
<style>
${cssReset('cx-amazon')}
#cx-amazon{background:linear-gradient(135deg,${c.bg} 0%,${c.bgLight} 100%)!important;background-color:${c.bg}!important;border:2px solid #ff9900!important;border-radius:16px!important;padding:32px 24px!important;margin:36px 0!important;color:${c.text}!important}
#cx-amazon .amz-header{text-align:center!important;margin-bottom:24px!important}
#cx-amazon .amz-badge{display:inline-block!important;background:#ff9900!important;color:#1a1a2e!important;font-size:11px!important;font-weight:800!important;text-transform:uppercase!important;letter-spacing:1.5px!important;padding:4px 14px!important;border-radius:20px!important;margin-bottom:10px!important}
#cx-amazon h3{color:#fff!important;font-size:20px!important;font-weight:800!important;margin:0 0 6px 0!important;background:transparent!important}
#cx-amazon .amz-sub{color:#888!important;font-size:13px!important;margin:0!important;background:transparent!important}
#cx-amazon .amz-grid{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))!important;gap:16px!important}
#cx-amazon .amz-card{background:rgba(255,255,255,0.04)!important;border:1.5px solid rgba(255,153,0,0.2)!important;border-radius:12px!important;padding:24px 18px!important;text-align:center!important;transition:all 0.3s ease!important}
#cx-amazon .amz-card:hover{border-color:#ff9900!important;transform:translateY(-3px)!important;box-shadow:0 8px 24px rgba(255,153,0,0.15)!important}
#cx-amazon .amz-emoji{font-size:36px!important;margin-bottom:12px!important;display:block!important;background:transparent!important}
#cx-amazon .amz-card h4{color:#fff!important;font-size:15px!important;font-weight:700!important;margin:0 0 6px 0!important;background:transparent!important}
#cx-amazon .amz-card p{color:#999!important;font-size:12px!important;margin:0 0 16px 0!important;background:transparent!important}
#cx-amazon .amz-btn{display:inline-block!important;background:linear-gradient(135deg,#ff9900,#e88a00)!important;color:#1a1a2e!important;padding:10px 20px!important;border-radius:8px!important;font-size:13px!important;font-weight:700!important;text-decoration:none!important;transition:all 0.3s ease!important}
#cx-amazon .amz-btn:hover{transform:translateY(-1px)!important;box-shadow:0 4px 12px rgba(255,153,0,0.3)!important}
</style>
<div class="amz-header">
  <div class="amz-badge">📦 Recomendações</div>
  <h3>Ferramentas Que Eu Uso e Recomendo</h3>
  <p class="amz-sub">Links afiliados — você não paga nada a mais</p>
</div>
<div class="amz-grid">
  ${productCards}
</div>
</div>
<!-- /BLOCO-PILAR: PONTO-C -->
<!-- /wp:html -->`;
}

// ============================================================
// MICRO CTAs (D1 + D2) — Inline
// ============================================================
function templateMicroCTAHostinger(hostingerUrl) {
  return `
<!-- wp:html -->
<!-- BLOCO-PILAR: MICRO-CTA-HOSTINGER -->
<div id="cx-micro-hostinger">
<style>
${cssReset('cx-micro-hostinger')}
#cx-micro-hostinger{background:linear-gradient(135deg,rgba(108,99,255,0.08),rgba(108,99,255,0.03))!important;background-color:rgba(108,99,255,0.05)!important;border-left:4px solid #6c63ff!important;border-radius:0 10px 10px 0!important;padding:16px 20px!important;margin:20px 0!important;color:#ccc!important}
#cx-micro-hostinger span{font-size:14px!important}
#cx-micro-hostinger .mh-label{color:#6c63ff!important;font-weight:700!important}
#cx-micro-hostinger a{color:#6c63ff!important;font-weight:700!important;text-decoration:underline!important;font-size:14px!important}
</style>
<span class="mh-label">💡 Dica Pro:</span>
<span> Precisa de hospedagem rápida para seu blog? </span>
<a href="${hostingerUrl}" target="_blank" rel="nofollow sponsored noopener">Veja os planos da Hostinger com desconto →</a>
</div>
<!-- /BLOCO-PILAR: MICRO-CTA-HOSTINGER -->
<!-- /wp:html -->`;
}

function templateMicroCTAChecklist(leadMagnetUrl) {
  const dl = convertDriveLink(leadMagnetUrl);
  return `
<!-- wp:html -->
<!-- BLOCO-PILAR: MICRO-CTA-CHECKLIST -->
<div id="cx-micro-checklist">
<style>
${cssReset('cx-micro-checklist')}
#cx-micro-checklist{background:linear-gradient(135deg,rgba(0,212,170,0.08),rgba(0,212,170,0.03))!important;background-color:rgba(0,212,170,0.05)!important;border-left:4px solid #00d4aa!important;border-radius:0 10px 10px 0!important;padding:16px 20px!important;margin:20px 0!important;color:#ccc!important}
#cx-micro-checklist span{font-size:14px!important}
#cx-micro-checklist .mc-label{color:#00d4aa!important;font-weight:700!important}
#cx-micro-checklist a{color:#00d4aa!important;font-weight:700!important;text-decoration:underline!important;font-size:14px!important}
</style>
<span class="mc-label">📋 Não esqueça:</span>
<span> Baixe o checklist completo para aplicar tudo isso na prática. </span>
<a href="${dl}" target="_blank" rel="noopener">Baixar Checklist SEO Grátis →</a>
</div>
<!-- /BLOCO-PILAR: MICRO-CTA-CHECKLIST -->
<!-- /wp:html -->`;
}

// ============================================================
// PONTO E1 — Checklist Visual
// ============================================================
function templateChecklistVisual(colors = {}) {
  const c = getColors(colors);
  return `
<!-- wp:html -->
<!-- BLOCO-PILAR: CHECKLIST-VISUAL -->
<div id="cx-checklist">
<style>
${cssReset('cx-checklist')}
#cx-checklist{background:linear-gradient(135deg,#0f0f23 0%,#1a1a3e 100%)!important;background-color:#0f0f23!important;border:2px solid ${c.primary}!important;border-radius:16px!important;padding:32px 24px!important;margin:36px 0!important;color:#e0e0e0!important}
#cx-checklist h3{color:#fff!important;font-size:20px!important;font-weight:800!important;text-align:center!important;margin:0 0 6px 0!important;background:transparent!important}
#cx-checklist .ck-sub{color:#888!important;font-size:13px!important;text-align:center!important;margin:0 0 24px 0!important;background:transparent!important}
#cx-checklist .ck-grid{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))!important;gap:12px!important}
#cx-checklist .ck-item{display:flex!important;align-items:flex-start!important;gap:12px!important;background:rgba(255,255,255,0.03)!important;border:1px solid rgba(255,255,255,0.06)!important;border-radius:10px!important;padding:14px 16px!important;transition:all 0.25s ease!important;cursor:pointer!important}
#cx-checklist .ck-item:hover{border-color:${c.primary}!important;background:rgba(0,212,170,0.05)!important}
#cx-checklist .ck-check{width:22px!important;height:22px!important;border:2px solid rgba(255,255,255,0.15)!important;border-radius:6px!important;display:flex!important;align-items:center!important;justify-content:center!important;flex-shrink:0!important;transition:all 0.25s ease!important;font-size:12px!important;color:transparent!important;margin-top:1px!important;background:transparent!important}
#cx-checklist .ck-item.checked .ck-check{background:${c.primary}!important;border-color:${c.primary}!important;color:#0f0f23!important}
#cx-checklist .ck-text{color:#e0e0e0!important;font-size:13px!important;background:transparent!important}
#cx-checklist .ck-item.checked .ck-text{text-decoration:line-through!important;color:#666!important}
</style>
<h3>✅ Checklist SEO — Antes de Publicar</h3>
<p class="ck-sub">Clique nos itens para marcar como concluídos</p>
<div class="ck-grid">
  <div class="ck-item" onclick="this.classList.toggle('checked')"><div class="ck-check">✓</div><div class="ck-text">Palavra-chave no título (H1) e meta title</div></div>
  <div class="ck-item" onclick="this.classList.toggle('checked')"><div class="ck-check">✓</div><div class="ck-text">Meta description com CTA e palavra-chave</div></div>
  <div class="ck-item" onclick="this.classList.toggle('checked')"><div class="ck-check">✓</div><div class="ck-text">URL limpa e amigável (slug otimizado)</div></div>
  <div class="ck-item" onclick="this.classList.toggle('checked')"><div class="ck-check">✓</div><div class="ck-text">Heading H2/H3 com hierarquia correta</div></div>
  <div class="ck-item" onclick="this.classList.toggle('checked')"><div class="ck-check">✓</div><div class="ck-text">Imagens otimizadas com alt text</div></div>
  <div class="ck-item" onclick="this.classList.toggle('checked')"><div class="ck-check">✓</div><div class="ck-text">Links internos (3-5 por artigo)</div></div>
  <div class="ck-item" onclick="this.classList.toggle('checked')"><div class="ck-check">✓</div><div class="ck-text">Link externo para fonte confiável</div></div>
  <div class="ck-item" onclick="this.classList.toggle('checked')"><div class="ck-check">✓</div><div class="ck-text">Schema markup / FAQ schema</div></div>
  <div class="ck-item" onclick="this.classList.toggle('checked')"><div class="ck-check">✓</div><div class="ck-text">Velocidade de carregamento < 3s</div></div>
  <div class="ck-item" onclick="this.classList.toggle('checked')"><div class="ck-check">✓</div><div class="ck-text">Mobile-friendly e responsivo</div></div>
</div>
</div>
<!-- /BLOCO-PILAR: CHECKLIST-VISUAL -->
<!-- /wp:html -->`;
}

// ============================================================
// PONTO E2 — Próximos Passos
// ============================================================
function templateProximosPassos(links = [], colors = {}) {
  const c = getColors(colors);

  // Auto-generate title from URL slug
  function titleFromUrl(url) {
    try {
      const u = new URL(url);
      const slug = u.pathname.replace(/^\/|\/$/g, '').split('/').pop();
      if (!slug) return url;
      return slug
        .replace(/-/g, ' ')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    } catch { return url; }
  }

  // Filter valid links
  const validLinks = (Array.isArray(links) ? links : [links])
    .filter(l => l && l.trim() && l.trim() !== '#')
    .slice(0, 5);

  if (validLinks.length === 0) {
    // Fallback: 3 placeholder links
    validLinks.push('#', '#', '#');
  }

  const items = validLinks.map(url => {
    const trimmed = url.trim();
    const title = trimmed === '#' ? 'Artigo Relacionado' : titleFromUrl(trimmed);
    // NÃO colocar URL raw no texto — WordPress faz oEmbed e transforma em card
    const desc = trimmed === '#' ? 'Continue sua jornada de aprendizado' : 'Clique para ler o artigo completo';
    return { url: trimmed, title, desc };
  });

  return `
<!-- wp:html -->
<!-- BLOCO-PILAR: PROXIMOS-PASSOS -->
<div id="cx-next">
<style>
${cssReset('cx-next')}
#cx-next{background:linear-gradient(135deg,${c.bg} 0%,${c.bgLight} 100%)!important;background-color:${c.bg}!important;border:2px solid ${c.primary}!important;border-radius:16px!important;padding:32px 24px!important;margin:36px 0!important;color:#e0e0e0!important}
#cx-next h3{color:#fff!important;font-size:20px!important;font-weight:800!important;text-align:center!important;margin:0 0 6px 0!important;background:transparent!important}
#cx-next .nx-sub{color:#888!important;font-size:13px!important;text-align:center!important;margin:0 0 24px 0!important;background:transparent!important}
#cx-next .nx-list{display:flex!important;flex-direction:column!important;gap:12px!important}
#cx-next .nx-item{display:flex!important;align-items:center!important;gap:16px!important;background:rgba(255,255,255,0.03)!important;border:1.5px solid rgba(255,255,255,0.06)!important;border-radius:12px!important;padding:18px 20px!important;text-decoration:none!important;transition:all 0.3s ease!important}
#cx-next .nx-item:hover{border-color:${c.primary}!important;background:rgba(0,212,170,0.06)!important;transform:translateX(6px)!important}
#cx-next .nx-num{width:36px!important;height:36px!important;background:linear-gradient(135deg,${c.primary},#00b894)!important;border-radius:10px!important;display:flex!important;align-items:center!important;justify-content:center!important;color:${c.bg}!important;font-weight:900!important;font-size:16px!important;flex-shrink:0!important}
#cx-next .nx-info h4{color:#fff!important;font-size:15px!important;font-weight:700!important;margin:0 0 3px 0!important;background:transparent!important}
#cx-next .nx-info p{color:#999!important;font-size:12px!important;margin:0!important;background:transparent!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;max-width:400px!important}
#cx-next .nx-arrow{margin-left:auto!important;color:${c.primary}!important;font-size:18px!important;background:transparent!important}
</style>
<h3>🚀 Próximos Passos</h3>
<p class="nx-sub">Continue sua jornada de aprendizado</p>
<div class="nx-list">
  ${items.map((item, i) => `
  <a href="${item.url}" class="nx-item">
    <div class="nx-num">${i + 1}</div>
    <div class="nx-info"><h4>${item.title}</h4><p>${item.desc}</p></div>
    <div class="nx-arrow">→</div>
  </a>`).join('')}
</div>
</div>
<!-- /BLOCO-PILAR: PROXIMOS-PASSOS -->
<!-- /wp:html -->`;
}

// ============================================================
// ÂNCORA
// ============================================================
function templateAnchor(id) {
  return `\n<!-- BLOCO-PILAR: ANCHOR-${id.toUpperCase()} --><span id="${id}" style="display:block;height:0;visibility:hidden;"></span><!-- /BLOCO-PILAR: ANCHOR-${id.toUpperCase()} -->\n`;
}

// ============================================================
// JOGO INTERATIVO — Gerado a partir do conteúdo do artigo
// ============================================================
function templateGame(gameData, leadMagnetUrl, colors = {}) {
  const c = getColors(colors);
  const dl = convertDriveLink(leadMagnetUrl);

  if (!gameData || !gameData.valid) {
    return `<!-- BLOCO-PILAR: GAME - Conteúdo insuficiente para gerar jogo -->`;
  }

  const gameJSON = JSON.stringify(gameData).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/'/g, '\\u0027');

  return `
<!-- wp:html -->
<!-- BLOCO-PILAR: QUIZ-SEO -->
<div id="seo-quiz">
<style>
${cssReset('seo-quiz')}
#seo-quiz{background:linear-gradient(135deg,#0f0f23 0%,#1a1a3e 100%)!important;background-color:#0f0f23!important;border:2px solid ${c.primary}!important;border-radius:16px!important;padding:36px 28px!important;margin:36px 0!important;overflow:hidden!important;box-shadow:0 12px 40px rgba(0,0,0,0.3)!important;color:#e0e0e0!important}
#seo-quiz .sg-header{text-align:center!important;margin-bottom:28px!important}
#seo-quiz .sg-badge{display:inline-block!important;background:linear-gradient(135deg,${c.primary},${c.accent})!important;color:#0f0f23!important;font-size:11px!important;font-weight:800!important;text-transform:uppercase!important;letter-spacing:2px!important;padding:5px 16px!important;border-radius:20px!important;margin-bottom:12px!important}
#seo-quiz .sg-header h3{color:#fff!important;font-size:24px!important;font-weight:800!important;margin:0 0 8px 0!important;background:transparent!important}
#seo-quiz .sg-header p{color:#888!important;font-size:14px!important;margin:0!important;background:transparent!important}
#seo-quiz .sg-progress{background:rgba(255,255,255,0.05)!important;border-radius:10px!important;height:6px!important;margin-bottom:8px!important;overflow:hidden!important}
#seo-quiz .sg-progress-bar{height:100%!important;background:linear-gradient(90deg,${c.primary},${c.accent})!important;border-radius:10px!important;transition:width 0.5s ease!important;width:0%!important}
#seo-quiz .sg-score-bar{display:flex!important;justify-content:space-between!important;margin-bottom:24px!important;font-size:13px!important}
#seo-quiz .sg-score-bar span{color:#888!important;background:transparent!important}
#seo-quiz .sg-score-bar strong{color:${c.primary}!important;background:transparent!important}
#seo-quiz .sg-phase{display:none!important}
#seo-quiz .sg-phase.active{display:block!important;animation:sgFade 0.4s ease!important}
@keyframes sgFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
#seo-quiz .sg-phase-title{color:${c.accent}!important;font-size:13px!important;font-weight:700!important;text-transform:uppercase!important;letter-spacing:1.5px!important;margin-bottom:16px!important;background:transparent!important}
#seo-quiz .sg-q-text{color:#fff!important;font-size:17px!important;font-weight:700!important;margin-bottom:18px!important;line-height:1.5!important;background:transparent!important}
#seo-quiz .sg-options{display:flex!important;flex-direction:column!important;gap:10px!important}
#seo-quiz .sg-opt{background:rgba(255,255,255,0.04)!important;border:1.5px solid rgba(255,255,255,0.1)!important;border-radius:10px!important;padding:14px 18px!important;color:#e0e0e0!important;font-size:14px!important;cursor:pointer!important;transition:all 0.25s ease!important;text-align:left!important}
#seo-quiz .sg-opt:hover{border-color:${c.primary}!important;background:rgba(0,212,170,0.06)!important}
#seo-quiz .sg-opt.correct{border-color:#00d4aa!important;background:rgba(0,212,170,0.15)!important;color:#fff!important}
#seo-quiz .sg-opt.wrong{border-color:#ff4757!important;background:rgba(255,71,87,0.12)!important;color:#ff4757!important}
#seo-quiz .sg-opt.disabled{pointer-events:none!important;opacity:0.6!important}
#seo-quiz .sg-tf-btns{display:flex!important;gap:14px!important;justify-content:center!important}
#seo-quiz .sg-tf-btn{padding:16px 40px!important;border-radius:12px!important;font-size:16px!important;font-weight:800!important;cursor:pointer!important;transition:all 0.25s ease!important;border:2px solid transparent!important}
#seo-quiz .sg-tf-btn.tf-true{background:rgba(0,212,170,0.1)!important;color:${c.primary}!important;border-color:rgba(0,212,170,0.3)!important}
#seo-quiz .sg-tf-btn.tf-false{background:rgba(255,71,87,0.1)!important;color:#ff4757!important;border-color:rgba(255,71,87,0.3)!important}
#seo-quiz .sg-tf-btn:hover{transform:scale(1.05)!important}
#seo-quiz .sg-tf-btn.correct{background:rgba(0,212,170,0.25)!important;border-color:${c.primary}!important}
#seo-quiz .sg-tf-btn.wrong{background:rgba(255,71,87,0.25)!important;border-color:#ff4757!important}
#seo-quiz .sg-feedback{text-align:center!important;margin-top:14px!important;font-size:13px!important;color:#888!important;min-height:20px!important;background:transparent!important}
#seo-quiz .sg-order-list{display:flex!important;flex-direction:column!important;gap:8px!important}
#seo-quiz .sg-order-item{background:rgba(255,255,255,0.04)!important;border:1.5px solid rgba(255,255,255,0.1)!important;border-radius:10px!important;padding:14px 18px!important;color:#e0e0e0!important;font-size:14px!important;cursor:pointer!important;transition:all 0.25s ease!important;display:flex!important;align-items:center!important;gap:12px!important}
#seo-quiz .sg-order-item:hover{border-color:${c.primary}!important;background:rgba(0,212,170,0.06)!important}
#seo-quiz .sg-order-item.selected{border-color:${c.primary}!important;background:rgba(0,212,170,0.12)!important}
#seo-quiz .sg-order-item .sg-order-num{width:28px!important;height:28px!important;background:rgba(255,255,255,0.08)!important;border-radius:8px!important;display:flex!important;align-items:center!important;justify-content:center!important;font-weight:800!important;font-size:13px!important;color:${c.primary}!important;flex-shrink:0!important}
#seo-quiz .sg-result{display:none!important;text-align:center!important}
#seo-quiz .sg-result.active{display:block!important;animation:sgFade 0.5s ease!important}
#seo-quiz .sg-score-circle{width:130px!important;height:130px!important;border-radius:50%!important;border:4px solid ${c.primary}!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;margin:0 auto 20px auto!important;background:rgba(0,212,170,0.08)!important}
#seo-quiz .sg-score-num{font-size:36px!important;font-weight:900!important;color:${c.primary}!important;line-height:1!important;background:transparent!important}
#seo-quiz .sg-score-label{font-size:12px!important;color:#888!important;background:transparent!important}
#seo-quiz .sg-result h3{color:#fff!important;font-size:22px!important;margin:0 0 8px 0!important;background:transparent!important}
#seo-quiz .sg-result p{color:#aaa!important;font-size:14px!important;margin:0 0 20px 0!important;background:transparent!important}
#seo-quiz .sg-result-btn{display:inline-flex!important;align-items:center!important;gap:8px!important;padding:14px 28px!important;border-radius:10px!important;font-size:15px!important;font-weight:700!important;text-decoration:none!important;background:linear-gradient(135deg,${c.primary},#00b894)!important;color:#0f0f23!important;transition:all 0.3s ease!important;margin:6px!important}
#seo-quiz .sg-result-btn:hover{transform:translateY(-2px)!important;box-shadow:0 6px 20px rgba(0,212,170,0.3)!important}
#seo-quiz .sg-result-btn.secondary{background:rgba(255,255,255,0.08)!important;color:#fff!important}
</style>

<div class="sg-header">
  <div class="sg-badge">🎮 Desafio Interativo</div>
  <h3>Teste seus Conhecimentos</h3>
  <p>Veja o quanto você absorveu deste artigo!</p>
</div>
<div class="sg-progress"><div class="sg-progress-bar" id="sg-bar"></div></div>
<div class="sg-score-bar"><span>Fase: <strong id="sg-phase-name">Iniciando...</strong></span><span>Pontos: <strong id="sg-pts">0</strong>/${gameData.maxPoints}</span></div>

<div id="sg-game-area"></div>

<div class="sg-result" id="sg-result">
  <div class="sg-score-circle"><span class="sg-score-num" id="sg-final-score">0</span><span class="sg-score-label">pontos</span></div>
  <h3 id="sg-final-title">Resultado</h3>
  <p id="sg-final-desc">Carregando...</p>
  <a href="${dl}" class="sg-result-btn" target="_blank" rel="noopener">📥 Baixar Checklist Completo</a>
  <a href="#cta-checklist" class="sg-result-btn secondary">📖 Rever o Artigo</a>
</div>

<script>
(function(){
  var g=document.getElementById('seo-quiz');if(!g)return;
  var data=${gameJSON};
  var area=document.getElementById('sg-game-area');
  var bar=document.getElementById('sg-bar');
  var ptsEl=document.getElementById('sg-pts');
  var phaseEl=document.getElementById('sg-phase-name');
  var pts=0,step=0,totalSteps=0;
  var allSteps=[];

  // Build steps from all phases
  if(data.quiz)data.quiz.forEach(function(q,i){allSteps.push({phase:'🧠 Quiz Rápido',type:'quiz',data:q,num:i+1,total:data.quiz.length})});
  if(data.trueFalse)data.trueFalse.forEach(function(q,i){allSteps.push({phase:'⚡ Verdadeiro ou Falso',type:'tf',data:q,num:i+1,total:data.trueFalse.length})});
  if(data.ordering)allSteps.push({phase:'📋 Ordene as Seções',type:'order',data:data.ordering,num:1,total:1});
  totalSteps=allSteps.length;
  if(totalSteps===0)return;

  function updateProgress(){bar.style.width=((step/totalSteps)*100)+'%';ptsEl.textContent=pts}
  function showStep(){
    if(step>=totalSteps){showResult();return}
    var s=allSteps[step];
    phaseEl.textContent=s.phase;
    updateProgress();
    if(s.type==='quiz')renderQuiz(s);
    else if(s.type==='tf')renderTF(s);
    else if(s.type==='order')renderOrder(s);
  }

  function renderQuiz(s){
    var q=s.data;
    var h='<div class="sg-phase active"><div class="sg-phase-title">'+s.phase+' — '+s.num+'/'+s.total+'</div>';
    h+='<div class="sg-q-text">'+escH(q.question)+'</div><div class="sg-options">';
    q.options.forEach(function(o){h+='<div class="sg-opt" data-val="'+escH(o)+'">'+escH(o)+'</div>'});
    h+='</div><div class="sg-feedback"></div></div>';
    area.innerHTML=h;
    area.querySelectorAll('.sg-opt').forEach(function(el){
      el.addEventListener('click',function(){
        if(el.classList.contains('disabled'))return;
        area.querySelectorAll('.sg-opt').forEach(function(o){o.classList.add('disabled')});
        var correct=el.getAttribute('data-val')===q.correct;
        if(correct){el.classList.add('correct');pts++}
        else{el.classList.add('wrong');area.querySelector('[data-val="'+CSS.escape(q.correct)+'"]').classList.add('correct')}
        area.querySelector('.sg-feedback').textContent=correct?'✅ Correto!':'❌ Resposta: '+q.correct;
        updateProgress();
        setTimeout(function(){step++;showStep()},1200);
      });
    });
  }

  function renderTF(s){
    var q=s.data;
    var h='<div class="sg-phase active"><div class="sg-phase-title">'+s.phase+' — '+s.num+'/'+s.total+'</div>';
    h+='<div class="sg-q-text">'+escH(q.statement)+'</div>';
    h+='<div class="sg-tf-btns"><div class="sg-tf-btn tf-true" data-val="true">✅ Verdadeiro</div>';
    h+='<div class="sg-tf-btn tf-false" data-val="false">❌ Falso</div></div>';
    h+='<div class="sg-feedback"></div></div>';
    area.innerHTML=h;
    area.querySelectorAll('.sg-tf-btn').forEach(function(el){
      el.addEventListener('click',function(){
        if(el.classList.contains('disabled'))return;
        area.querySelectorAll('.sg-tf-btn').forEach(function(o){o.classList.add('disabled')});
        var picked=el.getAttribute('data-val')==='true';
        var correct=picked===q.answer;
        if(correct){el.classList.add('correct');pts++}
        else{el.classList.add('wrong');area.querySelector('[data-val="'+(q.answer?'true':'false')+'"]').classList.add('correct')}
        area.querySelector('.sg-feedback').textContent=q.explanation||'';
        updateProgress();
        setTimeout(function(){step++;showStep()},1500);
      });
    });
  }

  function renderOrder(s){
    var q=s.data;var userOrder=[];
    var h='<div class="sg-phase active"><div class="sg-phase-title">'+s.phase+'</div>';
    h+='<div class="sg-q-text">'+escH(q.instruction)+'</div>';
    h+='<div class="sg-order-list" id="sg-order-list">';
    q.shuffledOrder.forEach(function(t){h+='<div class="sg-order-item" data-title="'+escH(t)+'"><div class="sg-order-num">?</div><span>'+escH(t)+'</span></div>'});
    h+='</div><div class="sg-feedback"></div></div>';
    area.innerHTML=h;
    area.querySelectorAll('.sg-order-item').forEach(function(el){
      el.addEventListener('click',function(){
        if(el.classList.contains('selected'))return;
        el.classList.add('selected');
        userOrder.push(el.getAttribute('data-title'));
        el.querySelector('.sg-order-num').textContent=userOrder.length;
        if(userOrder.length===q.correctOrder.length){
          var correct=0;
          for(var i=0;i<userOrder.length;i++){if(userOrder[i]===q.correctOrder[i])correct++}
          pts+=correct;
          updateProgress();
          var fb=area.querySelector('.sg-feedback');
          fb.textContent=correct===userOrder.length?'🎉 Ordem perfeita!':'Você acertou '+correct+' de '+userOrder.length+' posições.';
          setTimeout(function(){step++;showStep()},1800);
        }
      });
    });
  }

  function showResult(){
    area.innerHTML='';
    bar.style.width='100%';phaseEl.textContent='Finalizado!';
    document.getElementById('sg-final-score').textContent=pts+'/'+data.maxPoints;
    var pct=Math.round((pts/data.maxPoints)*100);
    var t=document.getElementById('sg-final-title');
    var d=document.getElementById('sg-final-desc');
    if(pct>=80){t.textContent='🏆 Expert!';d.textContent='Parabéns! Você domina o conteúdo deste artigo. Baixe o checklist para manter a excelência.'}
    else if(pct>=60){t.textContent='👍 Muito Bom!';d.textContent='Você absorveu boa parte do conteúdo. O checklist vai ajudar a fixar os detalhes.'}
    else if(pct>=40){t.textContent='📚 Em Progresso';d.textContent='Releia as seções que perdeu e use o checklist como guia.'}
    else{t.textContent='🚀 Hora de Estudar!';d.textContent='Aproveite para reler o artigo com calma. O checklist vai te guiar ponto a ponto.'}
    document.getElementById('sg-result').classList.add('active');
  }

  function escH(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
  showStep();
})();
</script>
</div>
<!-- /BLOCO-PILAR: QUIZ-SEO -->
<!-- /wp:html -->`;
}

// ============================================================
// PONTO F — Banner Guia No-Code (LP)
// ============================================================
function templateBannerGuia(lpUrl, colors = {}) {
  const c = getColors(colors);
  const url = lpUrl || 'https://conteudix.com/lp/';
  return `
<!-- wp:html -->
<!-- BLOCO-PILAR: BANNER-GUIA -->
<div id="cx-banner-guia">
<style>
${cssReset('cx-banner-guia')}
@keyframes cx-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
@keyframes cx-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes cx-pulse-glow{0%,100%{box-shadow:0 0 20px rgba(108,99,255,0.3),0 0 40px rgba(108,99,255,0.1)}50%{box-shadow:0 0 30px rgba(108,99,255,0.5),0 0 60px rgba(108,99,255,0.2)}}
#cx-banner-guia{background:linear-gradient(135deg,#0a0e27 0%,#1a1040 30%,#0d1b3e 60%,#0a0e27 100%)!important;background-color:#0a0e27!important;border:2px solid rgba(108,99,255,0.5)!important;border-radius:20px!important;padding:0!important;margin:40px 0!important;color:#fff!important;overflow:hidden!important;animation:cx-pulse-glow 4s ease-in-out infinite!important}
#cx-banner-guia .bg-inner{display:flex!important;align-items:center!important;gap:28px!important;padding:32px 36px!important;position:relative!important;z-index:1!important}
#cx-banner-guia .bg-deco{position:absolute!important;top:0!important;left:0!important;right:0!important;bottom:0!important;overflow:hidden!important;pointer-events:none!important;z-index:0!important}
#cx-banner-guia .bg-deco::before{content:''!important;position:absolute!important;top:-50%!important;right:-20%!important;width:300px!important;height:300px!important;background:radial-gradient(circle,rgba(108,99,255,0.15) 0%,transparent 70%)!important;border-radius:50%!important}
#cx-banner-guia .bg-deco::after{content:''!important;position:absolute!important;bottom:-30%!important;left:-10%!important;width:200px!important;height:200px!important;background:radial-gradient(circle,rgba(0,212,170,0.1) 0%,transparent 70%)!important;border-radius:50%!important}
#cx-banner-guia .bg-icon{flex-shrink:0!important;width:80px!important;height:80px!important;background:linear-gradient(135deg,rgba(108,99,255,0.2),rgba(0,212,170,0.15))!important;border-radius:20px!important;display:flex!important;align-items:center!important;justify-content:center!important;font-size:42px!important;animation:cx-float 3s ease-in-out infinite!important;border:1px solid rgba(108,99,255,0.3)!important}
#cx-banner-guia .bg-content{flex:1!important;min-width:0!important}
#cx-banner-guia .bg-badge{display:inline-block!important;background:linear-gradient(90deg,#00d4aa,#00b894,#00d4aa)!important;background-size:200% 100%!important;animation:cx-shimmer 3s linear infinite!important;color:#0a0e27!important;font-size:10px!important;font-weight:900!important;text-transform:uppercase!important;letter-spacing:2px!important;padding:4px 14px!important;border-radius:20px!important;margin-bottom:10px!important}
#cx-banner-guia .bg-content h3{color:#fff!important;font-size:22px!important;font-weight:900!important;margin:0 0 8px 0!important;background:transparent!important;line-height:1.2!important}
#cx-banner-guia .bg-content h3 span{color:#a78bfa!important;background:transparent!important}
#cx-banner-guia .bg-content p{color:#b0b0c0!important;font-size:14px!important;margin:0!important;background:transparent!important;line-height:1.5!important}
#cx-banner-guia .bg-cta{flex-shrink:0!important}
#cx-banner-guia .bg-btn{display:inline-flex!important;align-items:center!important;gap:10px!important;background:linear-gradient(135deg,#6c63ff,#5a52d5)!important;color:#fff!important;padding:16px 32px!important;border-radius:14px!important;font-size:16px!important;font-weight:800!important;text-decoration:none!important;transition:all 0.3s cubic-bezier(0.4,0,0.2,1)!important;box-shadow:0 4px 20px rgba(108,99,255,0.35)!important;border:none!important;white-space:nowrap!important}
#cx-banner-guia .bg-btn:hover{transform:translateY(-3px) scale(1.02)!important;box-shadow:0 8px 30px rgba(108,99,255,0.5)!important;background:linear-gradient(135deg,#7c73ff,#6c63ff)!important}
#cx-banner-guia .bg-btn .btn-arrow{display:inline-block!important;transition:transform 0.3s ease!important;font-size:18px!important;background:transparent!important}
#cx-banner-guia .bg-btn:hover .btn-arrow{transform:translateX(4px)!important}
@media(max-width:768px){
#cx-banner-guia .bg-inner{flex-direction:column!important;text-align:center!important;padding:28px 20px!important}
#cx-banner-guia .bg-icon{width:64px!important;height:64px!important;font-size:32px!important}
#cx-banner-guia .bg-content h3{font-size:19px!important}
#cx-banner-guia .bg-btn{width:100%!important;justify-content:center!important;padding:14px 24px!important}
}
</style>
<div class="bg-deco"></div>
<div class="bg-inner">
  <div class="bg-icon">📘</div>
  <div class="bg-content">
    <div class="bg-badge">✨ Grátis</div>
    <h3>Guia <span>20+ Ferramentas No-Code</span> 2026</h3>
    <p>Baixe agora e descubra as melhores ferramentas para automatizar seu negócio.</p>
  </div>
  <div class="bg-cta">
    <a href="${url}" class="bg-btn" target="_blank" rel="noopener">Quero o guia grátis <span class="btn-arrow">→</span></a>
  </div>
</div>
</div>
<!-- /BLOCO-PILAR: BANNER-GUIA -->
<!-- /wp:html -->`;
}

module.exports = {
  convertDriveLink, getColors, cssReset,
  templatePontoA, templatePontoB, templatePontoC,
  templateMicroCTAHostinger, templateMicroCTAChecklist,
  templateChecklistVisual, templateProximosPassos,
  templateAnchor, templateGame, templateBannerGuia,
};
