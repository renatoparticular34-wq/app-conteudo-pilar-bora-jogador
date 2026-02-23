/**
 * product-suggester.js
 * 
 * Analisa o conteúdo do artigo e sugere 3 produtos Amazon relevantes.
 * Funciona com qualquer tema: SEO, marketing, programação, finanças, etc.
 * 
 * Cada produto tem: emoji, título, descrição curta, categoria.
 */

// Base de dados de produtos organizados por categoria/tema
const PRODUCT_DATABASE = {
    // ----- TECNOLOGIA / DIGITAL -----
    seo: [
        { emoji: '📖', title: 'A Arte de SEO', desc: 'O guia definitivo sobre otimização para mecanismos de busca.' },
        { emoji: '📊', title: 'SEO 2024: Estratégias Avançadas', desc: 'Técnicas atualizadas para dominar o Google.' },
        { emoji: '🎧', title: 'Fone com Cancelamento de Ruído', desc: 'Ideal para foco total na produção de conteúdo.' },
    ],
    marketing: [
        { emoji: '📖', title: 'Marketing Digital na Prática', desc: 'Estratégias testadas para crescer online.' },
        { emoji: '🎙️', title: 'Microfone para Podcast', desc: 'Qualidade profissional para seus conteúdos em áudio.' },
        { emoji: '📸', title: 'Ring Light Profissional', desc: 'Iluminação perfeita para vídeos e lives.' },
    ],
    conteudo: [
        { emoji: '📖', title: 'Copywriting: Palavras que Vendem', desc: 'Domine a arte de escrever textos persuasivos.' },
        { emoji: '⌨️', title: 'Teclado Mecânico Silencioso', desc: 'Conforto e produtividade para escrever por horas.' },
        { emoji: '📓', title: 'Planner de Conteúdo', desc: 'Organize suas ideias e planeje publicações.' },
    ],
    programacao: [
        { emoji: '📖', title: 'Clean Code', desc: 'Código limpo e manutenível — leitura obrigatória.' },
        { emoji: '🖥️', title: 'Monitor Ultrawide', desc: 'Mais espaço para código, terminal e browser.' },
        { emoji: '🖱️', title: 'Mouse Ergonômico Vertical', desc: 'Proteção contra lesão em longas sessões.' },
    ],
    wordpress: [
        { emoji: '📖', title: 'WordPress para Profissionais', desc: 'Do básico ao avançado em desenvolvimento WP.' },
        { emoji: '💻', title: 'Notebook para Desenvolvimento', desc: 'Performance para rodar servidor local e IDEs.' },
        { emoji: '🔌', title: 'Hub USB-C Multiportas', desc: 'Conecte monitor, teclado e mouse em um só cabo.' },
    ],
    blog: [
        { emoji: '📖', title: 'Blog de Sucesso', desc: 'Como criar, crescer e monetizar seu blog.' },
        { emoji: '📸', title: 'Câmera para Criadores', desc: 'Fotos e vídeos profissionais para seus conteúdos.' },
        { emoji: '🎧', title: 'Fone Bluetooth Premium', desc: 'Qualidade sonora para trabalhar com inspiração.' },
    ],

    // ----- NEGÓCIOS / FINANÇAS -----
    empreendedorismo: [
        { emoji: '📖', title: 'Pai Rico, Pai Pobre', desc: 'Mude sua mentalidade sobre dinheiro e investimentos.' },
        { emoji: '📓', title: 'Planner Financeiro', desc: 'Organize finanças pessoais e do negócio.' },
        { emoji: '🖥️', title: 'Monitor 4K para Home Office', desc: 'Profissionalismo e conforto visual no trabalho.' },
    ],
    financas: [
        { emoji: '📖', title: 'Os Segredos da Mente Milionária', desc: 'Transforme sua relação com o dinheiro.' },
        { emoji: '📊', title: 'Calculadora Financeira', desc: 'Ferramenta essencial para cálculos de investimentos.' },
        { emoji: '📓', title: 'Caderno para Anotações', desc: 'Registre insights e planejamentos financeiros.' },
    ],
    renda_extra: [
        { emoji: '📖', title: 'Renda Extra Online', desc: 'Estratégias práticas para gerar renda pela internet.' },
        { emoji: '🎙️', title: 'Webcam HD para Reuniões', desc: 'Profissionalismo em videoconferências e lives.' },
        { emoji: '💡', title: 'Luminária de Mesa LED', desc: 'Iluminação ideal para seu ambiente de trabalho.' },
    ],

    // ----- PRODUTIVIDADE -----
    produtividade: [
        { emoji: '📖', title: 'Hábitos Atômicos', desc: 'Pequenas mudanças geram resultados extraordinários.' },
        { emoji: '⌨️', title: 'Teclado Mecânico', desc: 'Digitação rápida e confortável para o dia a dia.' },
        { emoji: '☕', title: 'Caneca Térmica Premium', desc: 'Café quente por horas durante o trabalho.' },
    ],

    // ----- EDUCAÇÃO -----
    educacao: [
        { emoji: '📖', title: 'Mindset: A Nova Psicologia', desc: 'Como sua mentalidade define o sucesso.' },
        { emoji: '🎧', title: 'Fone Over-Ear', desc: 'Concentração total para estudos e trabalho.' },
        { emoji: '📓', title: 'Caderno Inteligente', desc: 'Reorganize suas anotações quando quiser.' },
    ],

    // ----- SAÚDE / BEM-ESTAR -----
    saude: [
        { emoji: '📖', title: 'O Poder do Hábito', desc: 'Como criar rotinas saudáveis que duram.' },
        { emoji: '⌚', title: 'Smartwatch Fitness', desc: 'Monitore saúde, exercícios e sono.' },
        { emoji: '🧘', title: 'Tapete de Yoga Premium', desc: 'Base confortável para exercícios e meditação.' },
    ],

    // ----- DESIGN / CRIATIVIDADE -----
    design: [
        { emoji: '📖', title: 'Design Thinking', desc: 'Metodologia criativa para resolver problemas.' },
        { emoji: '✏️', title: 'Mesa Digitalizadora', desc: 'Desenho digital com precisão profissional.' },
        { emoji: '🖥️', title: 'Monitor com Cores Precisas', desc: 'Fidelidade de cores para design gráfico.' },
    ],

    // ----- FOTOGRAFIA / VÍDEO -----
    fotografia: [
        { emoji: '📖', title: 'A Visão do Fotógrafo', desc: 'Composição e técnica para fotos impactantes.' },
        { emoji: '📸', title: 'Câmera Mirrorless', desc: 'Qualidade DSLR em corpo compacto.' },
        { emoji: '🔋', title: 'Bateria Extra para Câmera', desc: 'Nunca fique sem carga em sessões longas.' },
    ],

    // ----- CULINÁRIA -----
    culinaria: [
        { emoji: '📖', title: 'Receitas para Todo Dia', desc: 'Pratos práticos e deliciosos para o dia a dia.' },
        { emoji: '🍳', title: 'Panela Antiaderente Premium', desc: 'Cozinhe com menos óleo e mais sabor.' },
        { emoji: '🔪', title: 'Jogo de Facas Profissional', desc: 'Precisão de corte para quem leva a sério.' },
    ],

    // ----- FALLBACK / GENÉRICO -----
    generico: [
        { emoji: '📖', title: 'Livro Recomendado pelo Autor', desc: 'A leitura que mais impactou meu trabalho nesta área.' },
        { emoji: '💻', title: 'Notebook para Trabalho', desc: 'O equipamento que uso para produzir conteúdo.' },
        { emoji: '🎧', title: 'Fone com Cancelamento de Ruído', desc: 'Foco total em qualquer ambiente.' },
    ],

    // ----- ESPORTES / FUTEBOL -----
    esportes: [
        { emoji: '⚽', title: 'Bola de Futebol Oficial', desc: 'A bola oficial para treinos e peladas.' },
        { emoji: '📖', title: 'Anatomia do Futebol', desc: 'Livro definitivo sobre tática, formação e estratégia no futebol.' },
        { emoji: '👟', title: 'Chuteira Society Profissional', desc: 'Performance e conforto para jogar em alto nível.' },
    ],
    futsal: [
        { emoji: '⚽', title: 'Bola de Futsal Penalty', desc: 'A bola preferida para quadras cobertas.' },
        { emoji: '👟', title: 'Tênis para Futsal', desc: 'Aderência e controle de bola em quadra.' },
        { emoji: '📖', title: 'Tática no Futsal Moderno', desc: 'Como pensar o jogo de salão como os grandes times.' },
    ],
    fitness: [
        { emoji: '🏋️', title: 'Kit Halteres Ajustáveis', desc: 'Treino completo em casa com peso variável.' },
        { emoji: '⌚', title: 'Smartwatch Esportivo', desc: 'Monitore batimentos, distância e performance.' },
        { emoji: '📖', title: 'Treino Funcional na Prática', desc: 'Exercícios para aumentar força e mobilidade.' },
    ],
};

// Mapeamento de palavras-chave para categorias
const KEYWORD_MAP = [
    { keywords: ['seo', 'google', 'ranquear', 'rankear', 'serp', 'busca orgânica', 'busca organica', 'indexação', 'backlink', 'link building'], category: 'seo' },
    { keywords: ['marketing', 'funil', 'leads', 'conversão', 'tráfego', 'trafego', 'anúncios', 'anuncios', 'facebook ads', 'google ads', 'campanha'], category: 'marketing' },
    { keywords: ['conteúdo', 'conteudo', 'copywriting', 'redação', 'redacao', 'escrever', 'artigo', 'headline', 'texto'], category: 'conteudo' },
    { keywords: ['programação', 'programacao', 'código', 'codigo', 'javascript', 'python', 'react', 'node', 'api', 'desenvolvimento', 'software', 'framework'], category: 'programacao' },
    { keywords: ['wordpress', 'wp', 'tema', 'plugin', 'gutenberg', 'woocommerce', 'elementor', 'astra'], category: 'wordpress' },
    { keywords: ['blog', 'blogueiro', 'blogger', 'nicho', 'monetizar', 'adsense', 'afiliado'], category: 'blog' },
    { keywords: ['empreendedorismo', 'empreender', 'startup', 'negócio', 'negocio', 'empresa', 'cnpj', 'mei'], category: 'empreendedorismo' },
    { keywords: ['finanças', 'financas', 'investimento', 'bolsa', 'ação', 'acao', 'cripto', 'bitcoin', 'renda fixa', 'tesouro'], category: 'financas' },
    { keywords: ['renda extra', 'freelancer', 'freelance', 'trabalho remoto', 'home office', 'ganhar dinheiro'], category: 'renda_extra' },
    { keywords: ['produtividade', 'hábito', 'habito', 'organização', 'organizacao', 'gestão do tempo', 'gestao do tempo', 'foco', 'pomodoro'], category: 'produtividade' },
    { keywords: ['educação', 'educacao', 'estudo', 'aprender', 'curso', 'faculdade', 'conhecimento', 'ensino'], category: 'educacao' },
    { keywords: ['saúde', 'saude', 'exercício', 'exercicio', 'fitness', 'academia', 'alimentação', 'dieta', 'bem-estar', 'meditação'], category: 'saude' },
    { keywords: ['design', 'ui', 'ux', 'figma', 'photoshop', 'ilustração', 'ilustracao', 'logo', 'identidade visual'], category: 'design' },
    { keywords: ['fotografia', 'foto', 'câmera', 'camera', 'lightroom', 'edição de fotos', 'composição fotográfica'], category: 'fotografia' },
    { keywords: ['culinária', 'culinaria', 'receita', 'cozinha', 'gastronomia', 'ingrediente', 'preparo'], category: 'culinaria' },
    { keywords: ['futebol', 'gol', 'jogador', 'craque', 'tática', 'tatica', 'formação', 'formacao', 'brasileirão', 'brasileirao', 'copa', 'seleção', 'campeonato', 'atacante', 'zagueiro', 'goleiro', 'meio-campo', 'drible', 'pênalti', 'penalti', 'escanteio', 'impedimento', 'lateral', 'volante', 'meia', 'centroavante'], category: 'esportes' },
    { keywords: ['futsal', 'quadra', 'pivô', 'pivo', 'ala', 'fixo', 'goleiro de futsal'], category: 'futsal' },
    { keywords: ['academia', 'treino', 'crossfit', 'musculação', 'musculacao', 'corrida', 'maratona', 'exercício físico'], category: 'fitness' },
];

/**
 * Detecta a categoria do conteúdo
 * @param {string} htmlContent - Conteúdo HTML do post
 * @returns {string} Categoria detectada
 */
function detectCategory(htmlContent) {
    const text = htmlContent.replace(/<[^>]+>/g, '').toLowerCase();
    const scores = {};

    for (const mapping of KEYWORD_MAP) {
        let score = 0;
        for (const keyword of mapping.keywords) {
            // Contar ocorrências da keyword
            const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            const matches = text.match(regex);
            if (matches) score += matches.length;
        }
        if (score > 0) scores[mapping.category] = score;
    }

    // Ordenar por score e pegar a campeã
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    if (sorted.length === 0) return 'generico';

    console.log(`[PRODUCTS] Categorias detectadas: ${sorted.map(s => `${s[0]}(${s[1]})`).join(', ')}`);

    return sorted[0][0];
}

/**
 * Sugere 3 produtos baseado no conteúdo do artigo
 * 
 * @param {string} htmlContent - Conteúdo HTML do post
 * @returns {object} { category, products: [{emoji, title, desc}] }
 */
function suggestProducts(htmlContent) {
    const category = detectCategory(htmlContent);
    const products = PRODUCT_DATABASE[category] || PRODUCT_DATABASE.generico;

    console.log(`[PRODUCTS] Categoria principal: ${category}`);
    console.log(`[PRODUCTS] Produtos sugeridos: ${products.map(p => p.title).join(', ')}`);

    return {
        category,
        products: products.map(p => ({ ...p })),
    };
}

module.exports = { suggestProducts, detectCategory, PRODUCT_DATABASE };
