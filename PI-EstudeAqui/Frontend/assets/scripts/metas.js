document.addEventListener('DOMContentLoaded', () => {
    const corpoTabela = document.querySelector('.tabela-metas tbody');

    const dropdownAdicionar = document.querySelector('.dropdown-add-meta');
    const botaoAdicionar = document.getElementById('botao-adicionar-meta');
    const painelAdicionar = document.getElementById('painel-add-meta');
    const campoTitulo = document.getElementById('nova-meta-titulo');
    const campoTipo = document.getElementById('nova-meta-tipo');
    const campoPrazo = document.getElementById('nova-meta-prazo');
    const botaoCancelar = document.getElementById('cancelar-add-meta');
    const botaoConfirmar = document.getElementById('confirmar-add-meta');

    const paletaCores = ['#2F6BFF', '#16A34A', '#F59E0B', '#7C3AED', '#DC2626'];
    let indiceCor = 0;

    function fecharTodosDropdownPonto(exceto) {
        document.querySelectorAll('.dropdown-ponto').forEach(dropdown => {
            if (dropdown !== exceto) dropdown.classList.remove('aberto');
        });
    }

    function fecharPainelAdicionar() {
        if (dropdownAdicionar) dropdownAdicionar.classList.remove('aberto');
    }

    // Fecha qualquer outro menu/painel aberto, exceto o elemento passado
    function fecharTudo(exceto) {
        fecharTodosDropdownPonto(exceto);
        if (exceto !== dropdownAdicionar) fecharPainelAdicionar();
    }

    function limparFormularioAdicionar() {
        if (campoTitulo) campoTitulo.value = '';
        if (campoPrazo) campoPrazo.value = '';
        if (campoTipo) campoTipo.value = 'Meta semanal';
    }

    // Atualiza o card "Objetivo Principal" com os dados da meta escolhida
    function marcarComoMetaPrincipal(linha) {
        const titulo = linha.querySelector('.titulo-linha-meta')?.textContent.trim() || '';
        const tipo = linha.querySelector('.descrito-sub')?.textContent.trim() || '';

        const tituloObgp = document.querySelector('.titulo-obgp');
        const subtituloObgp = document.querySelector('.subtitulo-obgp');

        if (tituloObgp) tituloObgp.textContent = titulo;
        if (subtituloObgp) subtituloObgp.textContent = tipo;
    }

    // Liga o clique dos 3 pontinhos + Editar/Excluir/Iniciar/Principal de UM dropdown
    function inicializarDropdownPonto(dropdown) {
        const menu = dropdown.querySelector('.menu-ponto');
        const gatilho = dropdown.firstElementChild; // sempre o ícone dos 3 pontinhos
        if (!gatilho || !menu) return;

        gatilho.addEventListener('click', (evento) => {
            evento.stopPropagation();
            const estaAberto = dropdown.classList.contains('aberto');
            fecharTudo(dropdown);
            dropdown.classList.toggle('aberto', !estaAberto);
        });

        const botaoEditar = menu.querySelector('.item-menu:not(.excluir):not(.iniciar):not(.principal)');
        const botaoExcluir = menu.querySelector('.item-menu.excluir');
        const botaoIniciar = menu.querySelector('.item-menu.iniciar');
        const botaoPrincipal = menu.querySelector('.item-menu.principal');

        if (botaoEditar) {
            botaoEditar.addEventListener('click', () => {
                dropdown.classList.remove('aberto');
                const linha = dropdown.closest('tr');
                // TODO: abrir aqui o formulário/modal de edição da meta
                console.log('Editar meta da linha:', linha);
            });
        }

        if (botaoExcluir) {
            botaoExcluir.addEventListener('click', () => {
                dropdown.classList.remove('aberto');
                const linha = dropdown.closest('tr');
                if (linha && confirm('Tem certeza que deseja excluir esta meta?')) {
                    linha.remove();
                }
            });
        }

        if (botaoIniciar) {
            botaoIniciar.addEventListener('click', () => {
                dropdown.classList.remove('aberto');
                const linha = dropdown.closest('tr');
                if (!linha) return;
                const status = linha.querySelector('.status-badge');
                if (status) {
                    status.textContent = 'Em andamento';
                    status.classList.remove('status-naoiniciada');
                    status.classList.add('status-andamento');
                }
            });
        }

        if (botaoPrincipal) {
            botaoPrincipal.addEventListener('click', () => {
                dropdown.classList.remove('aberto');
                const linha = dropdown.closest('tr');
                if (!linha) return;
                marcarComoMetaPrincipal(linha);
            });
        }
    }

    // Liga os menus de 3 pontinhos que já existem na página ao carregar
    document.querySelectorAll('.dropdown-ponto').forEach(inicializarDropdownPonto);

    // Abre/fecha o painel de "Adicionar meta"
    if (botaoAdicionar && dropdownAdicionar) {
        botaoAdicionar.addEventListener('click', (evento) => {
            evento.stopPropagation();
            const estaAberto = dropdownAdicionar.classList.contains('aberto');
            fecharTudo(dropdownAdicionar);
            dropdownAdicionar.classList.toggle('aberto', !estaAberto);
            if (!estaAberto && campoTitulo) campoTitulo.focus();
        });
    }

    // Clicar dentro do painel não deve fechar ele (o listener global fecha ao clicar fora)
    if (painelAdicionar) {
        painelAdicionar.addEventListener('click', (evento) => evento.stopPropagation());
    }

    if (botaoCancelar) {
        botaoCancelar.addEventListener('click', () => {
            limparFormularioAdicionar();
            fecharPainelAdicionar();
        });
    }

    if (botaoConfirmar && corpoTabela) {
        botaoConfirmar.addEventListener('click', () => {
            const titulo = campoTitulo ? campoTitulo.value.trim() : '';
            if (!titulo) {
                if (campoTitulo) campoTitulo.focus();
                return;
            }

            const tipo = campoTipo ? campoTipo.value : 'Meta semanal';
            const prazo = campoPrazo ? campoPrazo.value.trim() : '';
            const cor = paletaCores[indiceCor % paletaCores.length];
            indiceCor++;

            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td
                    <div class="descricao-meta">
                        <span class="icone-meta" style="background:${cor};">
                            <i data-lucide="target"></i>
                        </span>
                        <div>
                            <p class="titulo-linha-meta"></p>
                            <p class="descrito-sub"></p>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="data-meta">
                        ${prazo ? '<i data-lucide="calendar"></i>' : ''}
                    </div>
                </td>
                <td><span class="status-badge status-naoiniciada">Não iniciada</span></td>
                <td>
                    <div class="dropdown-ponto">
                        <i data-lucide="ellipsis-vertical"></i>
                        <div class="menu-ponto">
                            <button class="item-menu" type="button">
                                <i data-lucide="pencil"></i>
                                Editar
                            </button>
                            <button class="item-menu excluir" type="button">
                                <i data-lucide="trash-2"></i>
                                Excluir
                            </button>
                            <button class="item-menu iniciar" type="button">
                                <i data-lucide="astroid"></i>
                                Iniciar
                            </button>
                            <button class="item-menu principal" type="button">
                                <i data-lucide="trophy"></i>
                                Marcar como principal
                            </button>
                        </div>
                    </div>
                </td>
            `;

            // Título e tipo entram via textContent (evita problemas com HTML digitado pelo usuário)
            linha.querySelector('.titulo-linha-meta').textContent = titulo;
            linha.querySelector('.descrito-sub').textContent = tipo;
            if (prazo) {
                linha.querySelector('.data-meta').append(' ' + prazo);
            }

            corpoTabela.appendChild(linha);

            if (window.lucide) window.lucide.createIcons();

            inicializarDropdownPonto(linha.querySelector('.dropdown-ponto'));

            limparFormularioAdicionar();
            fecharPainelAdicionar();
        });
    }

    // Fecha qualquer menu/painel aberto ao clicar fora ou apertar Esc
    document.addEventListener('click', () => fecharTudo(null));
    document.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape') fecharTudo(null);
    });
});


/* ===== Modal "Nova meta" (mesmo padrão do modal de matérias) ===== */
const modalNovaMeta = document.querySelector("#modal-nova-meta");
const fecharModalMetaBtn = modalNovaMeta.querySelector(".fechar-btn");
const botaoAdicionarMetaOriginal = document.getElementById("botao-adicionar-meta");

function abrirModalMeta() {
    modalNovaMeta.classList.add("open");
}

function fecharModalMeta() {
    modalNovaMeta.classList.remove("open");
}

// Intercepta o clique no botão "Adicionar meta" ANTES do código acima agir,
// pra abrir o modal novo em vez do painel pequeno antigo.
document.addEventListener("click", function (event) {
    if (botaoAdicionarMetaOriginal && botaoAdicionarMetaOriginal.contains(event.target)) {
        event.preventDefault();
        event.stopPropagation();
        abrirModalMeta();
    }
}, true); // true = fase de captura, roda antes do listener de dentro do DOMContentLoaded

if (fecharModalMetaBtn) {
    fecharModalMetaBtn.addEventListener("click", function (event) {
        event.preventDefault();
        fecharModalMeta();
    });
}

document.addEventListener("click", function (event) {
    if (modalNovaMeta.classList.contains("open") && !modalNovaMeta.contains(event.target)) {
        fecharModalMeta();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") fecharModalMeta();
});