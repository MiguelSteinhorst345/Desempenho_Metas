// Atualização de nome, e-mail e senha (página de Configurações).
// Está dentro de uma função para não conflitar com o `const baseApi`
// declarado em outros scripts (ex.: userDelete.js).
(function () {
    const API = 'http://localhost:3000';
    let usuarioId = null;

    async function carregarUsuario() {
        const res = await fetch(`${API}/me`, { credentials: 'include' });
        if (!res.ok) return;

        const data = await res.json();
        const user = data.user ?? data; // ajuste se o /me devolver em outro formato

        usuarioId = user.id;
        document.getElementById('nome').value = user.name ?? '';
        document.getElementById('email').value = user.email ?? '';
    }

    async function atualizarUsuario(body) {
        if (usuarioId === null) {
            throw new Error('Não foi possível identificar o usuário logado.');
        }

        const res = await fetch(`${API}/users/${usuarioId}`, { // ajuste ao seu userRoutes
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erro ao atualizar');
        return data.user;
    }

    document.getElementById('form-perfil').addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();

        try {
            await atualizarUsuario({ name, email });
            alert('Perfil atualizado com sucesso!');
        } catch (err) {
            alert(err.message);
        }
    });

    document.getElementById('form-senha').addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentPassword = document.getElementById('senha-atual').value;
        const password = document.getElementById('senha-nova').value;
        const confirmar = document.getElementById('senha-confirmar').value;

        if (!currentPassword || !password) {
            alert('Preencha a senha atual e a nova senha.');
            return;
        }

        if (password !== confirmar) {
            alert('A confirmação não confere com a nova senha.');
            return;
        }

        try {
            await atualizarUsuario({ currentPassword, password });
            e.target.reset();
            alert('Senha atualizada com sucesso!');
        } catch (err) {
            alert(err.message);
        }
    });

    carregarUsuario();
})();