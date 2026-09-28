/* ===== Config da API ===== */
const API_URL = "http://localhost:3000/materias";

/* Se você guarda o token JWT no localStorage após o login, ele é enviado aqui */
function getHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
}

/* ===== Elementos ===== */
const botaoAddMateria = document.querySelector(".add-materia");
const dropdown = document.querySelector(".cronograma-dropdown");
const botaoFechar = document.querySelector(".fechar-btn");
const containerCards = document.querySelector(".cards");
const campoMateria = document.querySelector("#materia");
const campoConteudo = document.querySelector("#conteudo");
const campoProfessor = document.querySelector("#professor");
const contador = document.querySelector(".contador");
const botaoCriar = document.querySelector(".criar-btn");
const tituloModal = document.querySelector(".header-textos h2");

/* Guarda o id da matéria em edição (null = criando uma nova) */
let editandoId = null;

/* ===== Abrir / Fechar modal ===== */
function abrirDropdown() {
    dropdown.classList.add("open");
}

function fecharDropdown() {
    dropdown.classList.remove("open");
    resetarFormulario();
}

function resetarFormulario() {
    editandoId = null;
    campoMateria.value = "";
    campoConteudo.value = "";
    if (campoProfessor) campoProfessor.value = "";
    if (contador) contador.textContent = `0/${campoConteudo.getAttribute("maxlength") || 150} caracteres`;
    if (tituloModal) tituloModal.textContent = "Criação de matérias";
    if (botaoCriar) botaoCriar.innerHTML = `<i data-lucide="plus"></i>Criar matéria`;
    if (window.lucide) lucide.createIcons();
}

if (botaoAddMateria && dropdown) {
    botaoAddMateria.addEventListener("click", function (event) {
        event.preventDefault();
        resetarFormulario();
        abrirDropdown();
    });
}

if (botaoFechar && dropdown) {
    botaoFechar.addEventListener("click", function (event) {
        event.preventDefault();
        fecharDropdown();
    });
}

document.addEventListener("click", function (event) {
    if (!dropdown) return;
    const cliqueForaDoDropdown = !dropdown.contains(event.target);
    const cliqueForaDoBotao = !botaoAddMateria || !botaoAddMateria.contains(event.target);
    if (cliqueForaDoDropdown && cliqueForaDoBotao) {
        fecharDropdown();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        fecharDropdown();
        fecharTodosOsMenusPonto();
    }
});

/* ===== Contador de caracteres ===== */
if (campoConteudo && contador) {
    const max = campoConteudo.getAttribute("maxlength") || 0;
    campoConteudo.addEventListener("input", function () {
        contador.textContent = `${campoConteudo.value.length}/${max} caracteres`;
    });
}

/* ===== Buscar matérias no backend e renderizar ===== */
async function carregarMaterias() {
    try {
        const res = await fetch(API_URL, {
            method: "GET",
            credentials: "include",
            headers: getHeaders()
        });

        if (!res.ok) throw new Error("Erro ao buscar matérias");

        const materias = await res.json();
        renderizarMaterias(materias);
    } catch (err) {
        console.error(err);
        containerCards.innerHTML = `<p style="color:#ff2f2f;">Não foi possível carregar as matérias.</p>`;
    }
}

function renderizarMaterias(materias) {
    if (!materias || materias.length === 0) {
        containerCards.innerHTML = `<p>Nenhuma matéria cadastrada ainda.</p>`;
        return;
    }

    containerCards.innerHTML = materias.map(function (materia) {
        return `
        <div class="card" data-id="${materia.id}">
            <div class="card-icone">
                <i data-lucide="chart-spline"></i>
            </div>

            <div class="Info-materia">
                <span class="nome">${escapeHtml(materia.nome)}</span>
                <span class="descricao">${escapeHtml(materia.descricao)}</span>
               
            </div>

            <a class="btn-entrar" href="./EnterMate.html?materiaId=${materia.id}">
                Entrar
            </a>

            <div class="dropdown-ponto">
                <i data-lucide="ellipsis-vertical"></i>

                <div class="menu-ponto">
                    <button class="item-menu editar" type="button">
                        <i data-lucide="pencil"></i>
                        Editar
                    </button>
                    <button class="item-menu excluir" type="button">
                        <i data-lucide="trash-2"></i>
                        Excluir
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join("");

    if (window.lucide) lucide.createIcons();
}

/* Evita que nome/descrição com < > quebrem o HTML */
function escapeHtml(texto) {
    const div = document.createElement("div");
    div.textContent = texto ?? "";
    return div.innerHTML;
}

/* ===== Criar / Editar matéria ===== */
if (botaoCriar) {
    botaoCriar.addEventListener("click", async function (event) {
        event.preventDefault();

        const nome = campoMateria.value.trim();
        const descricao = campoConteudo.value.trim();
        const professor = campoProfessor ? campoProfessor.value.trim() : "";

        if (!nome) {
            alert("Digite o nome da matéria.");
            return;
        }
        if (!descricao) {
            alert("Digite a descrição da matéria.");
            return;
        }

        const dados = { nome, descricao, professor };

        try {
            const url = editandoId ? `${API_URL}/${editandoId}` : API_URL;
            const method = editandoId ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                credentials: "include",
                headers: getHeaders(),
                body: JSON.stringify(dados)
            });

            if (!res.ok) {
                const erro = await res.json().catch(() => ({}));
                throw new Error(erro.erro || "Erro ao salvar matéria");
            }

            fecharDropdown();
            await carregarMaterias();
        } catch (err) {
            console.error(err);
            alert(err.message || "Não foi possível salvar a matéria.");
        }
    });
}

/* ===== Editar / Excluir (delegação de eventos, pois os cards são recriados) ===== */
containerCards.addEventListener("click", async function (event) {
    const card = event.target.closest(".card");
    if (!card) return;

    const id = card.dataset.id;

    /* Editar */
    if (event.target.closest(".item-menu.editar")) {
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                credentials: "include",
                headers: getHeaders()
            });
            if (!res.ok) throw new Error("Matéria não encontrada");

            const materia = await res.json();

            editandoId = materia.id;
            campoMateria.value = materia.nome;
            campoConteudo.value = materia.descricao;
            if (campoProfessor) campoProfessor.value = materia.professor || "";
            if (contador) contador.textContent = `${campoConteudo.value.length}/${campoConteudo.getAttribute("maxlength") || 150} caracteres`;
            if (tituloModal) tituloModal.textContent = "Editar matéria";
            if (botaoCriar) botaoCriar.innerHTML = `<i data-lucide="check"></i>Salvar alterações`;
            if (window.lucide) lucide.createIcons();

            abrirDropdown();
        } catch (err) {
            console.error(err);
            alert("Não foi possível carregar a matéria para edição.");
        }
        return;
    }

    /* Excluir */
    if (event.target.closest(".item-menu.excluir")) {
        const confirmar = confirm("Tem certeza que deseja excluir esta matéria?");
        if (!confirmar) return;

        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
                credentials: "include",
                headers: getHeaders()
            });

            if (!res.ok && res.status !== 204) throw new Error("Erro ao excluir matéria");

            await carregarMaterias();
        } catch (err) {
            console.error(err);
            alert("Não foi possível excluir a matéria.");
        }
        return;
    }

    /* Menu de 3 pontos: abrir/fechar */
    const dropdownPonto = event.target.closest(".dropdown-ponto");
    if (dropdownPonto) {
        const menu = dropdownPonto.querySelector(".menu-ponto");
        if (menu) {
            const jaAberto = menu.classList.contains("open");
            fecharTodosOsMenusPonto();
            menu.classList.toggle("open", !jaAberto);
        }
    }
});

function fecharTodosOsMenusPonto() {
    document.querySelectorAll(".menu-ponto").forEach(function (menu) {
        menu.classList.remove("open");
    });
}

document.addEventListener("click", function (event) {
    if (!event.target.closest(".dropdown-ponto")) {
        fecharTodosOsMenusPonto();
    }
});

/* ===== Início ===== */
carregarMaterias();