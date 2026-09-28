 const API_URL = "http://localhost:3000/api";

    function mostrarErro(mensagem) {
        const el = document.getElementById("mensagemErro");
        if (!el) return;
        el.textContent = mensagem;
        el.style.display = "block";
    }

    function esconderErro() {
        const el = document.getElementById("mensagemErro");
        if (el) el.style.display = "none";
    }

    const formLogin = document.getElementById("formLogin");

    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault();
        esconderErro();

        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value;

        try {
            const resposta = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                mostrarErro(dados.mensagem || "Email ou senha inválidos.");
                return;
            }

            localStorage.setItem("token", dados.token);
            localStorage.setItem("usuario", JSON.stringify(dados.usuario));

            window.location.href = "./home.html";

        } catch (erro) {
            console.error(erro);
            mostrarErro("Não foi possível conectar ao servidor.");
        }
    });