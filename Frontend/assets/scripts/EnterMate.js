/* ===== Config da API ===== */
const API_URL = "http://localhost:3000/materias";

function getHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
}

/* ===== Pega o id da matéria na URL: EnterMate.html?materiaId=5 ===== */
const params = new URLSearchParams(window.location.search);
const materiaId = params.get("materiaId");

/* ===== Elementos ===== */
const elBreadcrumb = document.querySelector("#materia-breadcrumb");
const elNome = document.querySelector("#materia-nome");
const elProfessor = document.querySelector("#materia-professor");
const elDescricao = document.querySelector("#materia-descricao");

/* ===== Carrega a matéria ===== */
async function carregarMateria() {
    if (!materiaId) {
        window.location.href = "./materias.html";
        return;
    }

    try {
        const res = await fetch(`${API_URL}/${materiaId}`, {
            method: "GET",
            credentials: "include",
            headers: getHeaders()
        });

        if (res.status === 404) throw new Error("Matéria não encontrada.");
        if (!res.ok) throw new Error("Erro ao buscar a matéria.");

        const materia = await res.json();
        preencherMateria(materia);
    } catch (err) {
        console.error(err);
        elNome.textContent = "Matéria não encontrada";
        elBreadcrumb.textContent = "Erro";
        elProfessor.textContent = "";
        elDescricao.textContent = err.message;
    }
}

function preencherMateria(materia) {
    document.title = `EstudeAqui - ${materia.nome}`;

    /* textContent já escapa HTML, então é seguro */
    elBreadcrumb.textContent = materia.nome;
    elNome.textContent = materia.nome;
    elProfessor.textContent = materia.professor
        ? `Professor: ${materia.professor}`
        : "Professor não informado";
    elDescricao.textContent = materia.descricao || "";
}

carregarMateria();