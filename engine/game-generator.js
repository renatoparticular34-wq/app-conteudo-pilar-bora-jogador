/**
 * game-generator.js
 * 
 * Analisa o conteúdo HTML do post e gera um jogo interativo personalizado.
 * O jogo se adapta ao tema do artigo — funciona com qualquer assunto.
 * 
 * Fases do jogo:
 *  1. Quiz Rápido — Perguntas de múltipla escolha sobre o conteúdo
 *  2. Verdadeiro ou Falso — Afirmações rápidas sobre o artigo
 *  3. Ordene as Seções — Colocar headings na ordem correta
 */

// ============================================================
// HELPERS
// ============================================================

function stripHtml(html) {
    return (html || '').replace(/<[^>]+>/g, '').replace(/&[a-zA-Z]+;/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractFirstSentence(text) {
    if (!text) return '';
    // Pega a primeira frase completa (até . ! ou ?)
    const match = text.match(/^(.+?[.!?])\s/);
    if (match && match[1].length > 20) return match[1].trim();
    // Se não achou sentença completa, pega os primeiros 120 chars
    return text.substring(0, Math.min(120, text.length)).trim() + (text.length > 120 ? '...' : '');
}

function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function cleanHeading(text) {
    // Remove emojis, números com ponto, etc.
    return text
        .replace(/^\d+[\.\)]\s*/, '')
        .replace(/^[#]+\s*/, '')
        .replace(/[\u{1F600}-\u{1F9FF}]/gu, '')
        .trim();
}

// Verifica se um heading é "especial" (TOC, FAQ, Conclusão, etc.)
function isSpecialSection(heading) {
    const lower = heading.toLowerCase();
    const skip = [
        'índice', 'sumário', 'table of contents', 'conteúdo',
        'faq', 'perguntas frequentes', 'conclusão', 'considerações finais',
        'referências', 'fontes', 'sobre o autor', 'relacionados',
    ];
    return skip.some(s => lower.includes(s));
}

// ============================================================
// EXTRAÇÃO DE CONTEÚDO
// ============================================================

/**
 * Extrai seções do artigo (H2 + conteúdo entre eles)
 */
function extractSections(htmlContent) {
    const sections = [];

    // Regex para capturar H2 e o conteúdo até o próximo H2
    const regex = /<h2[^>]*>([\s\S]*?)<\/h2>([\s\S]*?)(?=<h2[^>]*>|$)/gi;
    let match;
    let order = 0;

    while ((match = regex.exec(htmlContent)) !== null) {
        const headingText = cleanHeading(stripHtml(match[1]));
        const sectionContent = match[2];

        // Pular seções especiais
        if (isSpecialSection(headingText)) continue;
        if (headingText.length < 3) continue;

        // Extrair parágrafos
        const paragraphs = [];
        const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
        let pMatch;
        while ((pMatch = pRegex.exec(sectionContent)) !== null) {
            const text = stripHtml(pMatch[1]);
            if (text.length > 30) paragraphs.push(text);
        }

        // Extrair termos em negrito
        const boldTerms = [];
        const boldRegex = /<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi;
        let bMatch;
        while ((bMatch = boldRegex.exec(sectionContent)) !== null) {
            const term = stripHtml(bMatch[1]);
            if (term.length > 2 && term.length < 80) boldTerms.push(term);
        }

        // Extrair sub-headings (H3)
        const subHeadings = [];
        const h3Regex = /<h3[^>]*>([\s\S]*?)<\/h3>/gi;
        let h3Match;
        while ((h3Match = h3Regex.exec(sectionContent)) !== null) {
            const text = cleanHeading(stripHtml(h3Match[1]));
            if (text.length > 3 && !isSpecialSection(text)) {
                subHeadings.push(text);
            }
        }

        // Extrair itens de lista
        const listItems = [];
        const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
        let liMatch;
        while ((liMatch = liRegex.exec(sectionContent)) !== null) {
            const text = stripHtml(liMatch[1]);
            if (text.length > 5 && text.length < 120) listItems.push(text);
        }

        const firstSentence = paragraphs.length > 0 ? extractFirstSentence(paragraphs[0]) : '';

        sections.push({
            heading: headingText,
            paragraphs,
            boldTerms,
            subHeadings,
            listItems,
            firstSentence,
            order: order++,
        });
    }

    return sections;
}

/**
 * Extrai o título do artigo (primeiro H1 ou texto mais proeminente)
 */
function extractArticleTitle(htmlContent) {
    const h1Match = htmlContent.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) return stripHtml(h1Match[1]);

    // Fallback: primeiro H2
    const h2Match = htmlContent.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
    if (h2Match) return stripHtml(h2Match[1]);

    return 'este artigo';
}

/**
 * Identifica o tema principal do artigo
 */
function detectTopic(sections) {
    // Pega as palavras mais comuns nos headings
    const allWords = sections
        .map(s => s.heading.toLowerCase().split(/\s+/))
        .flat()
        .filter(w => w.length > 3)
        .filter(w => !['como', 'para', 'sobre', 'com', 'que', 'dos', 'das', 'por', 'mais', 'uma', 'seu', 'sua'].includes(w));

    const freq = {};
    allWords.forEach(w => { freq[w] = (freq[w] || 0) + 1; });

    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : 'conteúdo';
}

// ============================================================
// GERAÇÃO DE PERGUNTAS
// ============================================================

/**
 * Gera perguntas de quiz (múltipla escolha)
 * Baseado nos headings e conteúdo das seções
 */
function generateQuizQuestions(sections) {
    if (sections.length < 3) return [];

    const questions = [];

    // Tipo 1: "Qual seção aborda o tema X?"
    // Usa sub-headings ou termos em negrito como "tema X"
    for (const section of sections) {
        if (section.subHeadings.length > 0) {
            const subHeading = section.subHeadings[0];
            const otherSections = sections.filter(s => s.heading !== section.heading);
            if (otherSections.length < 3) continue;

            const wrongAnswers = shuffleArray(otherSections).slice(0, 3).map(s => s.heading);

            questions.push({
                type: 'quiz',
                question: `Em qual seção do artigo o tema "${subHeading}" é abordado?`,
                correct: section.heading,
                options: shuffleArray([section.heading, ...wrongAnswers]),
            });
        }
    }

    // Tipo 2: "De acordo com o artigo, qual afirmação sobre [heading] é correta?"
    for (const section of sections) {
        if (section.firstSentence && section.firstSentence.length > 30) {
            const otherSentences = sections
                .filter(s => s.heading !== section.heading && s.firstSentence.length > 30)
                .map(s => s.firstSentence);

            if (otherSentences.length < 3) continue;

            const wrongAnswers = shuffleArray(otherSentences).slice(0, 3);

            questions.push({
                type: 'quiz',
                question: `Sobre "${section.heading}", qual informação está correta?`,
                correct: section.firstSentence,
                options: shuffleArray([section.firstSentence, ...wrongAnswers]),
            });
        }
    }

    // Tipo 3: "Qual destes NÃO é um tópico abordado na seção X?"
    for (const section of sections) {
        if (section.subHeadings.length >= 2) {
            const otherSection = sections.find(s =>
                s.heading !== section.heading && s.subHeadings.length > 0
            );
            if (!otherSection) continue;

            const correctSubs = section.subHeadings.slice(0, 3);
            const wrongSub = otherSection.subHeadings[0];

            questions.push({
                type: 'quiz',
                question: `Qual destes tópicos NÃO pertence à seção "${section.heading}"?`,
                correct: wrongSub,
                options: shuffleArray([...correctSubs.slice(0, 3), wrongSub]),
                isNegative: true,
            });
        }
    }

    // Tipo 4: Usando boldTerms
    for (const section of sections) {
        if (section.boldTerms.length >= 1 && section.firstSentence) {
            const term = section.boldTerms[0];
            const otherSections = sections.filter(s => s.heading !== section.heading);
            if (otherSections.length < 3) continue;

            const wrongAnswers = shuffleArray(otherSections).slice(0, 3).map(s => s.heading);

            questions.push({
                type: 'quiz',
                question: `O conceito "${term}" é discutido em qual seção?`,
                correct: section.heading,
                options: shuffleArray([section.heading, ...wrongAnswers]),
            });
        }
    }

    // Retornar no máximo 5 perguntas, sem duplicação por seção usada
    const usedSections = new Set();
    const filtered = [];
    for (const q of shuffleArray(questions)) {
        const key = q.correct;
        if (!usedSections.has(key) && filtered.length < 5) {
            usedSections.add(key);
            filtered.push(q);
        }
    }

    return filtered;
}

/**
 * Gera afirmações Verdadeiro/Falso
 */
function generateTrueFalse(sections) {
    if (sections.length < 3) return [];

    const statements = [];

    // Verdadeiras: Baseadas em headings reais
    for (const section of sections) {
        statements.push({
            type: 'tf',
            statement: `O artigo contém uma seção chamada "${section.heading}".`,
            answer: true,
            explanation: `Sim! "${section.heading}" é uma das seções do artigo.`,
        });
    }

    // Verdadeiras: Baseadas em sub-headings
    for (const section of sections) {
        for (const sub of section.subHeadings.slice(0, 1)) {
            statements.push({
                type: 'tf',
                statement: `O tópico "${sub}" é abordado dentro da seção "${section.heading}".`,
                answer: true,
                explanation: `Correto! "${sub}" é um sub-tópico de "${section.heading}".`,
            });
        }
    }

    // Verdadeiras: Baseadas em termos em negrito
    for (const section of sections) {
        if (section.boldTerms.length > 0) {
            statements.push({
                type: 'tf',
                statement: `O artigo menciona o conceito "${section.boldTerms[0]}" na seção "${section.heading}".`,
                answer: true,
                explanation: `Isso mesmo! "${section.boldTerms[0]}" é destacado na seção "${section.heading}".`,
            });
        }
    }

    // Falsas: Trocar seção de um sub-heading
    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (section.subHeadings.length === 0) continue;

        // Pegar outra seção para criar afirmação falsa
        const otherIdx = (i + 1) % sections.length;
        const other = sections[otherIdx];

        statements.push({
            type: 'tf',
            statement: `O tópico "${section.subHeadings[0]}" é abordado na seção "${other.heading}".`,
            answer: false,
            explanation: `Na verdade, "${section.subHeadings[0]}" pertence à seção "${section.heading}".`,
        });
    }

    // Falsas: Seções que não existem (inventar baseado no tema)
    const fakeTopics = [
        'Monetização com Criptomoedas',
        'Receitas de Culinária',
        'História da Astronomia',
        'Técnicas de Meditação',
        'Guia de Jardinagem',
        'Manutenção de Veículos',
        'Teoria Musical Avançada',
        'Fotografia Submarina',
    ];

    const shuffledFakes = shuffleArray(fakeTopics);
    for (let i = 0; i < Math.min(3, shuffledFakes.length); i++) {
        statements.push({
            type: 'tf',
            statement: `O artigo contém uma seção sobre "${shuffledFakes[i]}".`,
            answer: false,
            explanation: `Falso! O artigo não aborda "${shuffledFakes[i]}".`,
        });
    }

    // Selecionar 5 statements equilibradas (mix de V e F)
    const trues = shuffleArray(statements.filter(s => s.answer === true)).slice(0, 3);
    const falses = shuffleArray(statements.filter(s => s.answer === false)).slice(0, 2);

    return shuffleArray([...trues, ...falses]).slice(0, 5);
}

/**
 * Gera desafio de ordenação
 */
function generateOrdering(sections) {
    if (sections.length < 4) return null;

    // Pegar 5 seções (ou todas se menos de 5)
    const selected = sections.slice(0, Math.min(6, sections.length));

    return {
        type: 'ordering',
        instruction: 'Coloque as seções na ordem em que aparecem no artigo:',
        correctOrder: selected.map(s => s.heading),
        shuffledOrder: shuffleArray(selected.map(s => s.heading)),
    };
}

// ============================================================
// GERADOR PRINCIPAL
// ============================================================

/**
 * Gera o jogo completo baseado no conteúdo HTML do post
 * 
 * @param {string} htmlContent - Conteúdo HTML do post WordPress
 * @returns {object} Dados do jogo (quiz, trueFalse, ordering, metadata)
 */
function generateGame(htmlContent) {
    const sections = extractSections(htmlContent);
    const topic = detectTopic(sections);

    // Se não tem seções suficientes, retorna jogo vazio
    if (sections.length < 3) {
        return {
            valid: false,
            reason: `Poucas seções detectadas (${sections.length}). Precisa de pelo menos 3 seções H2 com conteúdo.`,
            sections: sections.length,
        };
    }

    const quiz = generateQuizQuestions(sections);
    const trueFalse = generateTrueFalse(sections);
    const ordering = generateOrdering(sections);

    // Calcular pontuação máxima
    const maxPoints = quiz.length + trueFalse.length + (ordering ? ordering.correctOrder.length : 0);

    return {
        valid: true,
        topic,
        sectionCount: sections.length,
        sectionTitles: sections.map(s => s.heading),
        quiz,
        trueFalse,
        ordering,
        maxPoints,
        phases: [
            quiz.length > 0 ? { name: 'Quiz Rápido', icon: '🧠', count: quiz.length } : null,
            trueFalse.length > 0 ? { name: 'Verdadeiro ou Falso', icon: '⚡', count: trueFalse.length } : null,
            ordering ? { name: 'Ordene as Seções', icon: '📋', count: ordering.correctOrder.length } : null,
        ].filter(Boolean),
    };
}


module.exports = {
    generateGame,
    extractSections,
    detectTopic,
    stripHtml,
    cleanHeading,
};
