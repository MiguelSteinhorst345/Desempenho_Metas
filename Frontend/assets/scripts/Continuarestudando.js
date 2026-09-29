(function () {
    const container = document.getElementById("continuar-estudando");
    if (!container) return;

    const MAX_CARDS = 3;

    let ultimas = [];
    try {
        ultimas = JSON.parse(localStorage.getItem(chaveUltimasMaterias())) || [];
    } catch (e) {
        ultimas = [];
    }

    function escapeHtml(texto) {
        const div = document.createElement("div");
        div.textContent = texto ?? "";
        return div.innerHTML;
    }

    if (ultimas.length === 0) {
        container.innerHTML = `
            <p style="display:flex; margin-top:100px; opacity:.6; font-size:14px;">
                Nenhuma matéria para continuar estudando
            </p>`;
        return;
    }

    const cards = ultimas.slice(0, MAX_CARDS).map(function (materia) {
        return `
        <div class="card">
            <div class="card-topo2">
                <div class="card-icone2">
                    <i data-lucide="book-open"></i>
                </div>
            </div>

            <span class="card-valor2">${escapeHtml(materia.nome)}</span>
            <span class="card-legenda">${escapeHtml(materia.descricao)}</span>

            <a class="btn-entrar" href="./EnterMate.html?materiaId=${encodeURIComponent(materia.id)}">
                Entrar
            </a>
        </div>`;
    });

    /* Completa a linha com espaços invisíveis (mesmo tamanho do .card),
       assim a matéria mais recente fica sempre no começo, e não centralizada */
    const vazios = [];
    for (let i = cards.length; i < MAX_CARDS; i++) {
        vazios.push(`<div class="card" aria-hidden="true" style="visibility:hidden; pointer-events:none;"></div>`);
    }

    container.innerHTML = cards.concat(vazios).join("");

    if (window.lucide) lucide.createIcons();
})();