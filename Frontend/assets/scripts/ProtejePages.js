const baseApi = 'http://localhost:3000'

document.addEventListener("DOMContentLoaded", async () => {

    const res = await fetch(`${baseApi}/me`, {
        credentials: "include"
    })

    if (!res.ok) {
        window.location.href = '../pages/login.html'
        return
    }

    const data = await res.json()

    // Preenche o campo de nome no perfil (span/div, usa textContent)
    const perfilNome = document.querySelector('.perfil-nome')
    if (perfilNome) {
        perfilNome.textContent = capitalizarNome(data.user.name)
    }

    // Preenche o input de nome na config (input, usa .value)
    const nomeConfig = document.querySelector('.nome-config')
    if (nomeConfig) {
        nomeConfig.value = capitalizarNome(data.user.name)
    }

    const avatar = document.querySelector('.avatar')
    if (avatar) {
        avatar.textContent = gerarIniciais(data.user.name)
    }

    const avatar2 = document.querySelector('.avatar2')
    if (avatar2) {
        avatar2.textContent = gerarIniciais(data.user.name)
    }
})

function capitalizarNome(nome) {
    return nome
        .toLowerCase()
        .split(' ')
        .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
        .join(' ')
}

function gerarIniciais(nome) {
    const palavras = nome.trim().split(' ')

    if (palavras.length === 1) {
        return palavras[0].charAt(0).toUpperCase()
    }

    const primeira = palavras[0].charAt(0)
    const ultima = palavras[palavras.length - 1].charAt(0)

    return (primeira + ultima).toUpperCase()
}