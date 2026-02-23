/**
 * insertion-engine.js
 * Motor de inserção de blocos de monetização em posts WordPress.
 * 
 * Responsável por:
 * 1. Analisar o conteúdo HTML do post
 * 2. Detectar headings (H2, H3) e seções
 * 3. Inserir blocos nos pontos estratégicos corretos
 * 4. Evitar duplicação (detecta blocos já inseridos por IDs)
 * 5. Respeitar regras de segurança (não inserir em posições proibidas)
 */

const templates = require('./templates');
const { generateGame } = require('./game-generator');
const { suggestProducts } = require('./product-suggester');

// ============================================================
// IDs dos blocos para detecção de duplicação
// ============================================================
const BLOCK_IDS = {
    A: 'cta-checklist',
    B: 'cx-hostinger',
    QUIZ: 'seo-quiz',
    C: 'cx-amazon',
    D1: 'cx-micro-hostinger',
    D2: 'cx-micro-checklist',
    E1: 'cx-checklist',
    E2: 'cx-next',
    F: 'cx-banner-guia',
};

const BLOCK_MARKERS = {
    A: 'BLOCO-PILAR: PONTO-A',
    B: 'BLOCO-PILAR: PONTO-B',
    QUIZ: 'BLOCO-PILAR: QUIZ-SEO',
    C: 'BLOCO-PILAR: PONTO-C',
    D1: 'BLOCO-PILAR: MICRO-CTA-HOSTINGER',
    D2: 'BLOCO-PILAR: MICRO-CTA-CHECKLIST',
    E1: 'BLOCO-PILAR: CHECKLIST-VISUAL',
    E2: 'BLOCO-PILAR: PROXIMOS-PASSOS',
    F: 'BLOCO-PILAR: BANNER-GUIA',
    ANCHOR: 'BLOCO-PILAR: ANCHOR-',
};

// ============================================================
// Parsing — Extrai estrutura do conteúdo
// ============================================================

/**
 * Extrai todos os headings e suas posições no conteúdo
 */
function extractHeadings(content) {
    const headings = [];
    // Regex para H2 e H3 (Gutenberg e classic editor)
    const regex = /<h([2-3])([^>]*)>(.*?)<\/h\1>/gi;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const text = match[3].replace(/<[^>]+>/g, '').trim();
        headings.push({
            level: parseInt(match[1]),
            fullMatch: match[0],
            text: text,
            textLower: text.toLowerCase(),
            index: match.index,
            endIndex: match.index + match[0].length,
        });
    }
    return headings;
}

/**
 * Encontra heading por texto (busca parcial, case-insensitive)
 */
function findHeading(headings, searchTerms) {
    if (!Array.isArray(searchTerms)) searchTerms = [searchTerms];
    for (const term of searchTerms) {
        const t = term.toLowerCase();
        const found = headings.find(h => h.textLower.includes(t));
        if (found) return found;
    }
    return null;
}

/**
 * Encontra heading por nível (primeiro H2, segundo H2, etc.)
 */
function findHeadingByIndex(headings, level, nth = 0) {
    const filtered = headings.filter(h => h.level === level);
    return filtered[nth] || null;
}

/**
 * Encontra o heading do "Índice" / "Table of Contents"
 */
function findTOC(headings) {
    return findHeading(headings, ['índice', 'indice', 'sumário', 'sumario', 'table of contents', 'conteúdo do artigo']);
}

/**
 * Encontra heading de FAQ
 */
function findFAQ(headings) {
    return findHeading(headings, ['faq', 'perguntas frequentes', 'dúvidas frequentes', 'duvidas frequentes']);
}

/**
 * Encontra heading de Conclusão
 */
function findConclusion(headings) {
    return findHeading(headings, ['conclusão', 'conclusao', 'considerações finais', 'consideracoes finais', 'resumo final']);
}

/**
 * Encontra o final de uma seção (próximo heading do mesmo nível ou superior)
 */
function findSectionEnd(content, heading, headings) {
    const idx = headings.indexOf(heading);
    if (idx < 0) return content.length;

    // Encontrar próximo heading do mesmo nível ou superior (menor número = superior)
    for (let i = idx + 1; i < headings.length; i++) {
        if (headings[i].level <= heading.level) {
            return headings[i].index;
        }
    }
    return content.length;
}

/**
 * Encontra posição de inserção "após a seção" de um heading 
 * (é a posição do próximo heading — insere antes dele)
 */
function getInsertAfterSection(content, heading, headings) {
    const sectionEnd = findSectionEnd(content, heading, headings);
    return sectionEnd;
}

/**
 * Encontra posição de inserção "antes" de um heading
 */
function getInsertBefore(heading) {
    return heading.index;
}

// ============================================================
// Verificação de duplicação
// ============================================================

/**
 * Verifica se um bloco já existe no conteúdo
 */
function blockExists(content, blockKey) {
    const id = BLOCK_IDS[blockKey];
    const marker = BLOCK_MARKERS[blockKey];
    if (id && content.includes(`id="${id}"`)) return true;
    if (id && content.includes(`id='${id}'`)) return true;
    if (marker && content.includes(marker)) return true;
    return false;
}

/**
 * Retorna lista de blocos já existentes
 */
function detectExistingBlocks(content) {
    const existing = [];
    for (const key of Object.keys(BLOCK_IDS)) {
        if (blockExists(content, key)) {
            existing.push(key);
        }
    }
    return existing;
}

// ============================================================
// Motor de inserção principal
// ============================================================

/**
 * Analisa o conteúdo e determina os pontos de inserção.
 * Retorna objeto com metadados (headings, posições, etc.)
 */
function analyzeContent(content) {
    const headings = extractHeadings(content);
    const toc = findTOC(headings);
    const faq = findFAQ(headings);
    const conclusion = findConclusion(headings);
    const firstH2 = findHeadingByIndex(headings, 2, 0);
    const secondH2 = findHeadingByIndex(headings, 2, 1);
    const existingBlocks = detectExistingBlocks(content);

    return {
        headings,
        toc,
        faq,
        conclusion,
        firstH2,
        secondH2,
        existingBlocks,
        totalHeadings: headings.length,
        h2Count: headings.filter(h => h.level === 2).length,
        h3Count: headings.filter(h => h.level === 3).length,
    };
}

/**
 * Aplica inserções no conteúdo.
 * 
 * @param {string} content - Conteúdo HTML do post
 * @param {Object} config - Configuração com links e opções
 * @param {string[]} selectedBlocks - Blocos selecionados ['A','B','C','D','E','QUIZ']
 * @returns {Object} { newContent, insertions, logs, warnings }
 */
function applyInsertions(content, config, selectedBlocks) {
    const logs = [];
    const warnings = [];
    const insertions = []; // { position, html, label, blockKey }

    const analysis = analyzeContent(content);
    const { headings, toc, faq, conclusion, firstH2, secondH2, existingBlocks } = analysis;

    const colors = config.colors || {};
    const leadMagnetUrl = config.leadMagnetUrl || '';
    const hostingerUrl = config.hostingerUrl || '';
    const amazonLinks = config.amazonLinks || {};
    const nextLinks = config.nextLinks || [];
    const lpUrl = config.lpUrl || 'https://conteudix.com/lp/';

    logs.push(`📊 Análise: ${headings.length} headings encontrados (${analysis.h2Count} H2, ${analysis.h3Count} H3)`);
    if (toc) logs.push(`📑 Índice encontrado: "${toc.text}"`);
    if (faq) logs.push(`❓ FAQ encontrado: "${faq.text}"`);
    if (conclusion) logs.push(`✅ Conclusão encontrada: "${conclusion.text}"`);
    if (existingBlocks.length > 0) {
        logs.push(`⚠️ Blocos já existentes: ${existingBlocks.join(', ')}`);
    }

    // Helper: Adiciona inserção se bloco não existir
    function addInsertion(blockKey, position, html, label) {
        if (existingBlocks.includes(blockKey)) {
            warnings.push(`⏭️ Bloco ${blockKey} já existe — pulado`);
            return false;
        }
        insertions.push({ position, html, label, blockKey });
        logs.push(`✅ ${blockKey}: será inserido ${label}`);
        return true;
    }

    // ----- PONTO A: CTA Lead Magnet (topo) -----
    if (selectedBlocks.includes('A')) {
        if (toc) {
            // Inserir antes do índice
            addInsertion('A', getInsertBefore(toc), templates.templatePontoA(leadMagnetUrl, colors), `antes do Índice ("${toc.text}")`);
        } else if (firstH2) {
            // Inserir antes do primeiro H2
            addInsertion('A', getInsertBefore(firstH2), templates.templatePontoA(leadMagnetUrl, colors), `antes do primeiro H2 ("${firstH2.text}")`);
        } else {
            // Inserir no topo absoluto
            addInsertion('A', 0, templates.templatePontoA(leadMagnetUrl, colors), 'no topo do conteúdo');
        }
    }

    // ----- ÂNCORA guia-artigo -----
    if (selectedBlocks.includes('A')) {
        // Inserir âncora antes do primeiro H2 (genérico para qualquer nicho)
        const anchorTarget = firstH2;
        if (anchorTarget && !content.includes('id="guia-artigo"')) {
            addInsertion('ANCHOR_GUIA', getInsertBefore(anchorTarget),
                templates.templateAnchor('guia-artigo'),
                `antes do heading "${anchorTarget.text}" (âncora #guia-artigo)`
            );
        }
    }

    // ----- PONTO B: Hostinger (meio) -----
    if (selectedBlocks.includes('B')) {
        // Posicionar após o 2º H2 (genérico para qualquer nicho)
        if (secondH2) {
            addInsertion('B', getInsertAfterSection(content, secondH2, headings),
                templates.templatePontoB(hostingerUrl, colors),
                `após o segundo H2 ("${secondH2.text}")`
            );
        } else if (firstH2) {
            addInsertion('B', getInsertAfterSection(content, firstH2, headings),
                templates.templatePontoB(hostingerUrl, colors),
                `após o primeiro H2 ("${firstH2.text}") — fallback`
            );
        } else {
            warnings.push('⚠️ Ponto B: Não foi possível encontrar posição adequada');
        }
    }

    // ----- JOGO INTERATIVO (gerado a partir do conteúdo) -----
    if (selectedBlocks.includes('QUIZ')) {
        const gameData = generateGame(content);
        if (gameData.valid) {
            logs.push(`🎮 Jogo gerado: ${gameData.quiz.length} quiz + ${gameData.trueFalse.length} V/F + ordenação (${gameData.sectionCount} seções detectadas)`);
            const gameHtml = templates.templateGame(gameData, leadMagnetUrl, colors);
            if (faq) {
                addInsertion('QUIZ', getInsertBefore(faq),
                    gameHtml,
                    `antes do FAQ ("${faq.text}")`
                );
            } else if (conclusion) {
                addInsertion('QUIZ', getInsertBefore(conclusion),
                    gameHtml,
                    `antes da Conclusão ("${conclusion.text}")`
                );
            } else {
                const pos = Math.floor(content.length * 0.75);
                addInsertion('QUIZ', pos, gameHtml, 'a ~75% do conteúdo (fallback)');
            }
        } else {
            warnings.push(`⚠️ Jogo: ${gameData.reason || 'Conteúdo insuficiente para gerar jogo interativo'}`);
        }
    }

    // ----- PONTO C: Amazon (produtos auto-detectados) -----
    if (selectedBlocks.includes('C')) {
        // Detectar produtos baseado no conteúdo
        const suggestion = suggestProducts(content);
        logs.push(`📦 Produtos Amazon detectados (tema: ${suggestion.category}): ${suggestion.products.map(p => p.title).join(', ')}`);

        // Merge links do usuário com produtos sugeridos
        const products = suggestion.products.map((p, i) => ({
            ...p,
            url: amazonLinks[`link${i + 1}`] || amazonLinks.livro || amazonLinks.notebook || amazonLinks.mouse || '#',
        }));

        const amazonHtml = templates.templatePontoC(products, colors);

        if (faq) {
            addInsertion('C', getInsertBefore(faq), amazonHtml, `antes do FAQ ("${faq.text}")`);
        } else if (conclusion) {
            addInsertion('C', getInsertBefore(conclusion), amazonHtml, `antes da Conclusão ("${conclusion.text}")`);
        } else {
            const lastH2 = headings.filter(h => h.level === 2).slice(-1)[0];
            if (lastH2) {
                addInsertion('C', getInsertBefore(lastH2), amazonHtml, `antes do último H2 ("${lastH2.text}")`);
            } else {
                warnings.push('⚠️ Ponto C: Não foi possível encontrar posição adequada');
            }
        }
    }

    // ----- PONTO D: Micro CTAs -----
    if (selectedBlocks.includes('D')) {
        // D2: Micro CTA Checklist — após o 3º H2 (genérico)
        const thirdH2_d = findHeadingByIndex(headings, 2, 2);
        if (thirdH2_d) {
            addInsertion('D2', getInsertAfterSection(content, thirdH2_d, headings),
                templates.templateMicroCTAChecklist(leadMagnetUrl),
                `após terceiro H2 ("${thirdH2_d.text}")`
            );
        }

        // D1: Micro CTA Hostinger — após o 4º H2 (genérico)
        const fourthH2_d = findHeadingByIndex(headings, 2, 3);
        if (fourthH2_d) {
            addInsertion('D1', getInsertAfterSection(content, fourthH2_d, headings),
                templates.templateMicroCTAHostinger(hostingerUrl),
                `após quarto H2 ("${fourthH2_d.text}")`
            );
        }
    }

    // ----- PONTO E: Checklist Visual + Próximos Passos -----
    if (selectedBlocks.includes('E')) {
        // E1: Checklist Visual — após o penúltimo H2 (genérico)
        const h2s_e = headings.filter(h => h.level === 2);
        const penultH2 = h2s_e.length >= 2 ? h2s_e[h2s_e.length - 2] : null;
        if (penultH2) {
            addInsertion('E1', getInsertAfterSection(content, penultH2, headings),
                templates.templateChecklistVisual(colors),
                `após penúltimo H2 ("${penultH2.text}")`
            );
        } else if (conclusion) {
            addInsertion('E1', getInsertBefore(conclusion),
                templates.templateChecklistVisual(colors),
                `antes da Conclusão ("${conclusion.text}") — fallback`
            );
        }

        // E2: Próximos Passos — antes da Conclusão
        if (conclusion) {
            addInsertion('E2', getInsertBefore(conclusion),
                templates.templateProximosPassos(nextLinks, colors),
                `antes da Conclusão ("${conclusion.text}")`
            );
        } else if (faq) {
            addInsertion('E2', getInsertBefore(faq),
                templates.templateProximosPassos(nextLinks, colors),
                `antes do FAQ ("${faq.text}") — fallback`
            );
        }
    }
    // ----- PONTO F: Banner Guia No-Code -----
    if (selectedBlocks.includes('F')) {
        const h2s = headings.filter(h => h.level === 2);
        const thirdH2 = h2s[2]; // após o 3º H2
        if (thirdH2) {
            addInsertion('F', getInsertAfterSection(content, thirdH2, headings),
                templates.templateBannerGuia(lpUrl, colors),
                `após terceiro H2 ("${thirdH2.text}")`
            );
        } else if (secondH2) {
            addInsertion('F', getInsertAfterSection(content, secondH2, headings),
                templates.templateBannerGuia(lpUrl, colors),
                `após segundo H2 ("${secondH2.text}") — fallback`
            );
        } else {
            const pos = Math.floor(content.length * 0.4);
            addInsertion('F', pos,
                templates.templateBannerGuia(lpUrl, colors),
                'a ~40% do conteúdo (fallback)'
            );
        }
    }

    // Ordenar inserções por posição (do fim para o início para não deslocar índices)
    insertions.sort((a, b) => b.position - a.position);

    // Aplicar inserções
    let newContent = content;
    for (const ins of insertions) {
        newContent = newContent.slice(0, ins.position) + ins.html + newContent.slice(ins.position);
    }

    logs.push(`\n🎯 Total: ${insertions.length} blocos inseridos`);

    return {
        newContent,
        insertions: insertions.map(i => ({ label: i.label, blockKey: i.blockKey, position: i.position })),
        logs,
        warnings,
        analysis,
    };
}

/**
 * Gera preview das inserções sem aplicar
 */
function generatePreview(content, config, selectedBlocks) {
    const result = applyInsertions(content, config, selectedBlocks);
    return {
        insertionCount: result.insertions.length,
        insertions: result.insertions,
        logs: result.logs,
        warnings: result.warnings,
        analysis: result.analysis,
        originalLength: content.length,
        newLength: result.newContent.length,
        newContent: result.newContent,
    };
}

module.exports = {
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
    BLOCK_MARKERS,
};
