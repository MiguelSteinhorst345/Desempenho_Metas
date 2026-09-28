// Ajuste para a URL base da sua API
const API_URL = 'http://localhost:3000'

const listaCards = document.querySelector('.cards')
const botaoAddData = document.querySelector('.add-data')
const dropdown = document.querySelector('.cronograma-dropdown')
const botaoFechar = document.querySelector('.fechar-btn')
const botaoCriar = document.querySelector('.criar-btn')

const inputData = document.querySelector('#data')
const inputMateria = document.querySelector('#materia')
const inputConteudo = document.querySelector('#conteudo')
const contador = document.querySelector('.contador')

const LABEL_PRIORIDADE = {
    alta: 'alta',
    media: 'média',
    baixa: 'baixa'
}

// ===== Modal =====

function abrirDropdown() {
    dropdown.classList.add('open')
}

function fecharDropdown() {
    dropdown.classList.remove('open')
    limparFormulario()
}

botaoAddData.addEventListener('click', function (event) {
    event.preventDefault() // evita que o link recarregue a página (href="")
    dropdown.classList.toggle('open')
})

if (botaoFechar) {
    botaoFechar.addEventListener('click', function (event) {
        event.preventDefault()
        fecharDropdown()
    })
}

document.addEventListener('click', function (event) {
    const cliqueForaDoDropdown = !dropdown.contains(event.target)
    const cliqueForaDoBotao = !botaoAddData.contains(event.target)

    if (cliqueForaDoDropdown && cliqueForaDoBotao) {
        fecharDropdown()
    }
})

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        fecharDropdown()
    }
})

// ===== Contador de caracteres =====

inputConteudo.addEventListener('input', function () {
    contador.textContent = `${inputConteudo.value.length}/500 caracteres`
})

function limparFormulario() {
    inputData.value = ''
    inputMateria.value = ''
    inputConteudo.value = ''
    contador.textContent = '0/500 caracteres'
}

// ===== Formatação =====

function formatarDataExibicao(dataISO) {
    // dataISO vem como "aaaa-mm-dd" ou timestamp do banco
    const data = new Date(dataISO)
    const dia = String(data.getUTCDate()).padStart(2, '0')
    const mes = String(data.getUTCMonth() + 1).padStart(2, '0')
    return `${dia}/${mes}`
}

// ===== Renderização =====

function criarElementoCard(cronograma) {
    const card = document.createElement('div')
    card.className = 'card'
    card.dataset.id = cronograma.id

    card.innerHTML = `
        <div class="card-icone">
            <i data-lucide="chart-spline"></i>
        </div>

        <div class="Info-materia">
            <span class="nome"></span>
            <span class="descricao"></span>
        </div>

        <div class="card-prioridade">
            <p>Prioridade</p>
            <span class="prioridade ${cronograma.prioridade}"></span>
        </div>

        <div class="card-data">
            <p>Entregar</p>
            <span class="data"></span>
        </div>

        <button class="botao-concluir">Concluir</button>
    `

    // texto via textContent para evitar problemas de HTML injection vindo do banco
    card.querySelector('.nome').textContent = cronograma.materia
    card.querySelector('.descricao').textContent = cronograma.conteudo || ''
    card.querySelector('.prioridade').textContent = LABEL_PRIORIDADE[cronograma.prioridade]
    card.querySelector('.data').textContent = formatarDataExibicao(cronograma.data)

    card.querySelector('.botao-concluir').addEventListener('click', () => concluirCronograma(cronograma.id, card))

    return card
}

function renderizarCards(cronogramas) {
    listaCards.innerHTML = ''

    if (cronogramas.length === 0) {
        listaCards.innerHTML = `<p style="color:#9ca3af;">Nenhuma data cadastrada ainda.</p>`
        return
    }

    cronogramas.forEach((cronograma) => {
        listaCards.appendChild(criarElementoCard(cronograma))
    })

    if (window.lucide) {
        lucide.createIcons()
    }
}

// ===== API =====

async function carregarCronogramas() {
    try {
        const resposta = await fetch(`${API_URL}/cronogramas`, {
            method: 'GET',
            credentials: 'include'
        })

        if (!resposta.ok) {
            throw new Error('Falha ao carregar o cronograma')
        }

        const cronogramas = await resposta.json()
        renderizarCards(cronogramas)
    } catch (erro) {
        console.error(erro)
        listaCards.innerHTML = `<p style="color:#ff2f2f;">Não foi possível carregar o cronograma.</p>`
    }
}

async function criarCronograma() {
    const materia = inputMateria.value.trim()
    const conteudo = inputConteudo.value.trim()
    const data = inputData.value

    if (!materia) {
        alert('Informe a matéria (trabalho ou prova).')
        return
    }
    if (!data) {
        alert('Informe a data.')
        return
    }

    try {
        botaoCriar.disabled = true

        const resposta = await fetch(`${API_URL}/cronogramas`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ materia, conteudo, data })
        })

        if (!resposta.ok) {
            const erro = await resposta.json().catch(() => ({}))
            throw new Error(erro.message || 'Falha ao criar o cronograma')
        }

        fecharDropdown()
        await carregarCronogramas()
    } catch (erro) {
        console.error(erro)
        alert(erro.message || 'Não foi possível criar o cronograma.')
    } finally {
        botaoCriar.disabled = false
    }
}

async function concluirCronograma(id, card) {
    const botao = card.querySelector('.botao-concluir')
    botao.disabled = true

    const minutos = Number(prompt('Quantos minutos você estudou nesta atividade?', '60'))
    if (!Number.isInteger(minutos) || minutos < 0) {
        alert('Informe um número inteiro de minutos maior ou igual a zero.')
        botao.disabled = false
        return
    }

    const acertos = Number(prompt('Quantas questões você acertou? (se não houver questões, informe 0)', '0'))
    const erros = Number(prompt('Quantas questões você errou? (se não houver questões, informe 0)', '0'))
    if (!Number.isInteger(acertos) || acertos < 0 || !Number.isInteger(erros) || erros < 0) {
        alert('Acertos e erros precisam ser números inteiros maiores ou iguais a zero.')
        botao.disabled = false
        return
    }

    try {
        const resposta = await fetch(`${API_URL}/cronogramas/${id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ concluido: true, registrarDesempenho: true, minutos_estudados: minutos, acertos, erros })
        })

        if (!resposta.ok) {
            throw new Error('Falha ao concluir o cronograma')
        }

        removerCardComAnimacao(card)
        mostrarToast('Concluído!')
    } catch (erro) {
        console.error(erro)
        alert('Não foi possível marcar como concluído.')
        botao.disabled = false
    }
}

function removerCardComAnimacao(card) {
    card.style.transition = 'opacity 0.25s ease, transform 0.25s ease'
    card.style.opacity = '0'
    card.style.transform = 'translateX(12px)'

    setTimeout(() => {
        card.remove()

        if (!listaCards.querySelector('.card')) {
            listaCards.innerHTML = `<p style="color:#9ca3af;">Nenhuma data cadastrada ainda.</p>`
        }
    }, 250)
}

let toastTimeout = null

function mostrarToast(mensagem) {
    let toast = document.querySelector('.toast-notificacao')

    if (!toast) {
        toast = document.createElement('div')
        toast.className = 'toast-notificacao'
        document.body.appendChild(toast)
    }

    toast.textContent = mensagem
    toast.classList.add('visivel')

    clearTimeout(toastTimeout)
    toastTimeout = setTimeout(() => {
        toast.classList.remove('visivel')
    }, 2500)
}

botaoCriar.addEventListener('click', function (event) {
    event.preventDefault()
    criarCronograma()
})

// ===== Inicialização =====
carregarCronogramas()