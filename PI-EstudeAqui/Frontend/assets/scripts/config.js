document.addEventListener('DOMContentLoaded', () => {
    const CHAVE_TEMA = 'tema';                    // mesma chave que o tema.js já usa
    const CHAVE_PREFERENCIA = 'tema-preferencia';  // guarda a escolha real: light | dark | system

    const grupoTema = document.querySelector('.segmentado[aria-label="Tema"]');
    if (!grupoTema) return;

    const botoes = Array.from(grupoTema.querySelectorAll('.segmento'));
    const mapaBotoes = {};

    botoes.forEach(botao => {
        const icone = botao.querySelector('[data-lucide]');
        const tipo = icone ? icone.getAttribute('data-lucide') : null;
        if (tipo === 'sun') mapaBotoes.light = botao;
        if (tipo === 'moon') mapaBotoes.dark = botao;
        if (tipo === 'monitor') mapaBotoes.system = botao;
    });

    const prefereEscuroNoSistema = () =>
        window.matchMedia('(prefers-color-scheme: dark)').matches;

    function marcarBotaoAtivo(preferencia) {
        botoes.forEach(botao => {
            botao.classList.remove('ativo');
            botao.setAttribute('aria-pressed', 'false');
        });
        const alvo = mapaBotoes[preferencia];
        if (alvo) {
            alvo.classList.add('ativo');
            alvo.setAttribute('aria-pressed', 'true');
        }
    }

    function aplicarTema(preferencia) {
        const escuro = preferencia === 'dark' ||
            (preferencia === 'system' && prefereEscuroNoSistema());

        document.documentElement.classList.toggle('dark', escuro);
        localStorage.setItem(CHAVE_TEMA, escuro ? 'dark' : 'light'); // mantém o tema.js funcionando nas outras páginas
        localStorage.setItem(CHAVE_PREFERENCIA, preferencia);
        marcarBotaoAtivo(preferencia);
    }

    // Preferência salva: usa a nova chave; se não existir, migra de quem já tinha 'tema' salvo; senão, claro por padrão
    const preferenciaSalva = localStorage.getItem(CHAVE_PREFERENCIA)
        || (localStorage.getItem(CHAVE_TEMA) === 'dark' ? 'dark' : 'light');

    aplicarTema(preferenciaSalva);

    Object.entries(mapaBotoes).forEach(([preferencia, botao]) => {
        botao.addEventListener('click', () => aplicarTema(preferencia));
    });

    // Enquanto a preferência for "sistema", acompanha em tempo real a mudança do SO
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (localStorage.getItem(CHAVE_PREFERENCIA) === 'system') {
            aplicarTema('system');
        }
    });

    // Mantém os segmentos sincronizados se o botão do cabeçalho for usado
    const botaoCabecalho = document.getElementById('alterartema');
    if (botaoCabecalho) {
        botaoCabecalho.addEventListener('click', () => {
            const escuroAgora = document.documentElement.classList.contains('dark');
            localStorage.setItem(CHAVE_PREFERENCIA, escuroAgora ? 'dark' : 'light');
            marcarBotaoAtivo(escuroAgora ? 'dark' : 'light');
        });
    }
});