/* Descobre o id do usuário logado e monta a chave do localStorage */
function getUsuarioId() {
    // 1) Se você já salva o id no login, ele é usado direto
    const salvo = localStorage.getItem("usuarioId");
    if (salvo) return salvo;

    // 2) Senão, tenta ler o id de dentro do token JWT
    const token = localStorage.getItem("token");
    if (token) {
        try {
            const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
            const payload = JSON.parse(atob(base64));
            const id = payload.id ?? payload.userId ?? payload.sub;
            if (id) return String(id);
        } catch (e) {
            console.warn("Não foi possível ler o id do token", e);
        }
    }

    // 3) Sem usuário identificado
    return "anonimo";
}

function chaveUltimasMaterias() {
    return `ultimasMaterias_${getUsuarioId()}`;
}