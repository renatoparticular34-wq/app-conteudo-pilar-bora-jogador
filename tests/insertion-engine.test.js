/**
 * insertion-engine.test.js
 * Testes unitários para o motor de inserção.
 * Roda com: node tests/insertion-engine.test.js
 */

const {
    extractHeadings,
    findHeading,
    findHeadingByIndex,
    findTOC,
    findFAQ,
    findConclusion,
    detectExistingBlocks,
    analyzeContent,
    applyInsertions,
    generatePreview,
    BLOCK_IDS,
} = require('../engine/insertion-engine');

const { convertDriveLink } = require('../engine/templates');

// ============================================================
// Mini test runner
// ============================================================
let passed = 0;
let failed = 0;
let total = 0;

function test(name, fn) {
    total++;
    try {
        fn();
        passed++;
        console.log(`  ✅ ${name}`);
    } catch (error) {
        failed++;
        console.log(`  ❌ ${name}`);
        console.log(`     ${error.message}`);
    }
}

function assert(condition, message) {
    if (!condition) throw new Error(message || 'Assertion failed');
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`${message || 'assertEqual'}: expected "${expected}", got "${actual}"`);
    }
}

// ============================================================
// SAMPLE CONTENT
// ============================================================
const sampleContent = `
<h2>Índice</h2>
<p>Neste artigo você vai aprender...</p>

<h2>Entendendo Como Fazer SEO</h2>
<p>SEO é a otimização para mecanismos de busca...</p>

<h2>Como Fazer SEO: Como Funciona na Prática</h2>
<p>Na prática, o SEO funciona assim...</p>

<h3>Pesquisa de Palavras-Chave</h3>
<p>A pesquisa de palavras-chave é fundamental...</p>

<h3>Otimização de Conteúdo</h3>
<p>Para otimizar seu conteúdo...</p>

<h2>SEO Técnico</h2>
<p>O SEO técnico envolve...</p>

<h3>Experiência do Usuário</h3>
<p>A experiência do usuário é crucial...</p>

<h2>Melhores Práticas de Como Fazer SEO</h2>
<p>As melhores práticas incluem...</p>

<h2>FAQ - Perguntas Frequentes</h2>
<p>Aqui estão as perguntas mais comuns...</p>

<h2>Conclusão</h2>
<p>Em conclusão, SEO é essencial...</p>
`;

// ============================================================
// TESTS
// ============================================================

console.log('\n🧪 === Testes do Motor de Inserção ===\n');

// --- extractHeadings ---
console.log('📌 extractHeadings:');

test('deve extrair todos os headings', () => {
    const headings = extractHeadings(sampleContent);
    assert(headings.length === 10, `Expected 10 headings, got ${headings.length}`);
});

test('deve identificar H2 e H3 corretamente', () => {
    const headings = extractHeadings(sampleContent);
    const h2s = headings.filter(h => h.level === 2);
    const h3s = headings.filter(h => h.level === 3);
    assertEqual(h2s.length, 7, 'H2 count');
    assertEqual(h3s.length, 3, 'H3 count');
});

test('deve extrair texto correto dos headings', () => {
    const headings = extractHeadings(sampleContent);
    assertEqual(headings[0].text, 'Índice', 'Primeiro heading');
    assertEqual(headings[1].text, 'Entendendo Como Fazer SEO', 'Segundo heading');
});

// --- findHeading ---
console.log('\n📌 findHeading:');

test('deve encontrar heading por texto parcial', () => {
    const headings = extractHeadings(sampleContent);
    const found = findHeading(headings, ['pesquisa de palavras']);
    assert(found !== null, 'Should find heading');
    assert(found.text.includes('Pesquisa de Palavras'), 'Wrong heading found');
});

test('deve retornar null se não encontrar', () => {
    const headings = extractHeadings(sampleContent);
    const found = findHeading(headings, ['inexistente']);
    assert(found === null, 'Should return null');
});

test('deve buscar múltiplos termos (fallback)', () => {
    const headings = extractHeadings(sampleContent);
    const found = findHeading(headings, ['não existe', 'entendendo como fazer']);
    assert(found !== null, 'Should find second term');
    assert(found.text.includes('Entendendo'), 'Wrong heading');
});

// --- findTOC / findFAQ / findConclusion ---
console.log('\n📌 Detecção de seções especiais:');

test('deve detectar Índice', () => {
    const headings = extractHeadings(sampleContent);
    const toc = findTOC(headings);
    assert(toc !== null, 'TOC should be found');
    assertEqual(toc.text, 'Índice', 'TOC text');
});

test('deve detectar FAQ', () => {
    const headings = extractHeadings(sampleContent);
    const faq = findFAQ(headings);
    assert(faq !== null, 'FAQ should be found');
    assert(faq.text.includes('FAQ'), 'FAQ text');
});

test('deve detectar Conclusão', () => {
    const headings = extractHeadings(sampleContent);
    const conclusion = findConclusion(headings);
    assert(conclusion !== null, 'Conclusion should be found');
    assertEqual(conclusion.text, 'Conclusão', 'Conclusion text');
});

test('deve retornar null se não houver TOC', () => {
    const content = '<h2>Intro</h2><h2>Main</h2>';
    const headings = extractHeadings(content);
    const toc = findTOC(headings);
    assert(toc === null, 'TOC should be null');
});

// --- detectExistingBlocks ---
console.log('\n📌 Detecção de blocos existentes:');

test('deve detectar bloco existente por ID', () => {
    const content = '<div id="cta-checklist">...</div>';
    const existing = detectExistingBlocks(content);
    assert(existing.includes('A'), 'Should detect block A');
});

test('deve detectar múltiplos blocos existentes', () => {
    const content = '<div id="cta-checklist">...</div><div id="cx-hostinger">...</div>';
    const existing = detectExistingBlocks(content);
    assert(existing.includes('A'), 'Should detect A');
    assert(existing.includes('B'), 'Should detect B');
});

test('deve retornar array vazio se nenhum bloco existe', () => {
    const existing = detectExistingBlocks(sampleContent);
    assertEqual(existing.length, 0, 'No blocks should exist');
});

test('deve detectar por marcador de comentário', () => {
    const content = '<!-- BLOCO-PILAR: PONTO-A CTA-CHECKLIST -->...';
    const existing = detectExistingBlocks(content);
    assert(existing.includes('A'), 'Should detect by marker');
});

// --- analyzeContent ---
console.log('\n📌 analyzeContent:');

test('deve retornar análise completa', () => {
    const analysis = analyzeContent(sampleContent);
    assert(analysis.headings.length > 0, 'Should have headings');
    assert(analysis.toc !== null, 'Should have TOC');
    assert(analysis.faq !== null, 'Should have FAQ');
    assert(analysis.conclusion !== null, 'Should have conclusion');
    assertEqual(analysis.existingBlocks.length, 0, 'No existing blocks');
});

// --- applyInsertions ---
console.log('\n📌 applyInsertions:');

const testConfig = {
    leadMagnetUrl: 'https://drive.google.com/file/d/ABC123/view',
    hostingerUrl: 'https://hostinger.com.br?ref=test',
    amazonLinks: { livro: 'https://amzn.to/livro', notebook: 'https://amzn.to/nb', mouse: 'https://amzn.to/mouse' },
    nextLinks: ['https://site.com/1', 'https://site.com/2', 'https://site.com/3'],
};

test('deve inserir todos os blocos selecionados', () => {
    const result = applyInsertions(sampleContent, testConfig, ['A', 'B', 'C', 'D', 'E', 'QUIZ']);
    assert(result.insertions.length > 0, 'Should have insertions');
    assert(result.newContent.length > sampleContent.length, 'New content should be longer');
});

test('deve inserir Ponto A antes do Índice', () => {
    const result = applyInsertions(sampleContent, testConfig, ['A']);
    assert(result.newContent.includes('id="cta-checklist"'), 'Should contain CTA');
    const ctaPos = result.newContent.indexOf('cta-checklist');
    const indicePos = result.newContent.indexOf('<h2>Índice</h2>');
    assert(ctaPos < indicePos, 'CTA should be before Índice');
});

test('deve inserir âncora guia-artigo', () => {
    const result = applyInsertions(sampleContent, testConfig, ['A']);
    assert(result.newContent.includes('id="guia-artigo"'), 'Should contain anchor');
});

test('deve inserir Quiz antes do FAQ', () => {
    const result = applyInsertions(sampleContent, testConfig, ['QUIZ']);
    assert(result.newContent.includes('id="seo-quiz"'), 'Should contain quiz');
    const quizPos = result.newContent.indexOf('seo-quiz');
    const faqPos = result.newContent.indexOf('FAQ - Perguntas Frequentes');
    assert(quizPos < faqPos, 'Quiz should be before FAQ');
});

test('deve inserir Amazon antes do FAQ', () => {
    const result = applyInsertions(sampleContent, testConfig, ['C']);
    assert(result.newContent.includes('id="cx-amazon"'), 'Should contain Amazon');
    const amazonPos = result.newContent.indexOf('cx-amazon');
    const faqPos = result.newContent.indexOf('FAQ - Perguntas Frequentes');
    assert(amazonPos < faqPos, 'Amazon should be before FAQ');
});

test('deve inserir Próximos Passos antes da Conclusão', () => {
    const result = applyInsertions(sampleContent, testConfig, ['E']);
    assert(result.newContent.includes('id="cx-next"'), 'Should contain next steps');
    const nextPos = result.newContent.indexOf('cx-next');
    const conclusionPos = result.newContent.indexOf('<h2>Conclusão</h2>');
    assert(nextPos < conclusionPos, 'Next steps should be before Conclusão');
});

test('NÃO deve duplicar blocos se já existem', () => {
    // Primeira aplicação
    const result1 = applyInsertions(sampleContent, testConfig, ['A', 'B']);
    // Segunda aplicação sobre o resultado
    const result2 = applyInsertions(result1.newContent, testConfig, ['A', 'B']);
    // Deve ter warnings de duplicação
    assert(result2.warnings.length > 0, 'Should have warnings');
    // Conteúdo não deve mudar
    assertEqual(result2.insertions.length, 0, 'No new insertions');
});

test('deve gerar logs úteis', () => {
    const result = applyInsertions(sampleContent, testConfig, ['A']);
    assert(result.logs.length > 0, 'Should have logs');
    assert(result.logs.some(l => l.includes('heading')), 'Should mention headings in logs');
});

// --- generatePreview ---
console.log('\n📌 generatePreview:');

test('deve retornar preview sem modificar original', () => {
    const preview = generatePreview(sampleContent, testConfig, ['A', 'B', 'C']);
    assert(preview.insertionCount > 0, 'Should have insertions');
    assert(preview.originalLength === sampleContent.length, 'Original should not change');
    assert(preview.newLength > preview.originalLength, 'New should be longer');
});

// --- convertDriveLink ---
console.log('\n📌 convertDriveLink:');

test('deve converter link de visualização do Drive para download', () => {
    const result = convertDriveLink('https://drive.google.com/file/d/ABC123XYZ/view');
    assertEqual(result, 'https://drive.google.com/uc?export=download&id=ABC123XYZ', 'Drive link conversion');
});

test('deve manter link que não é do Drive', () => {
    const url = 'https://example.com/file.pdf';
    assertEqual(convertDriveLink(url), url, 'Non-drive link');
});

test('deve manter link de download direto do Drive', () => {
    const url = 'https://drive.google.com/uc?export=download&id=ABC';
    assertEqual(convertDriveLink(url), url, 'Already download link');
});

// --- Content without standard sections ---
console.log('\n📌 Edge cases:');

test('deve funcionar com conteúdo mínimo (sem headings)', () => {
    const content = '<p>Conteúdo simples sem headings</p>';
    const result = applyInsertions(content, testConfig, ['A']);
    assert(result.newContent.includes('cta-checklist'), 'Should insert at top');
});

test('deve funcionar com conteúdo vazio', () => {
    const result = applyInsertions('', testConfig, ['A']);
    assert(result.newContent.length > 0, 'Should still insert');
});

test('deve inserir seletivamente (apenas blocos escolhidos)', () => {
    const result = applyInsertions(sampleContent, testConfig, ['A']);
    assert(result.newContent.includes('cta-checklist'), 'Should have A');
    assert(!result.newContent.includes('cx-hostinger'), 'Should NOT have B');
    assert(!result.newContent.includes('cx-amazon'), 'Should NOT have C');
});

// ============================================================
// RESULTADO
// ============================================================
console.log(`\n${'='.repeat(50)}`);
console.log(`📊 Resultado: ${passed}/${total} testes passaram${failed > 0 ? ` (${failed} falharam)` : ''}`);
console.log(`${'='.repeat(50)}\n`);

process.exit(failed > 0 ? 1 : 0);
