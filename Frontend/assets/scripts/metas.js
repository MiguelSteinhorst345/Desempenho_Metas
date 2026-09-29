const API_URL = 'http://localhost:3000/metas'

document.addEventListener('DOMContentLoaded', () => {
    const corpoTabela = document.querySelector('.tabela-metas tbody')
    const modal = document.getElementById('modal-nova-meta')
    const botaoAdicionar = document.getElementById('botao-adicionar-meta')
    const botaoFechar = modal?.querySelector('.fechar-btn')
    const botaoConfirmar = document.getElementById('modal-confirmar-meta')

    const campoTitulo = document.getElementById('meta-titulo')
    const campoTipo = document.getElementById('meta-tipo')
    const campoPrazo = document.getElementById('meta-prazo')

    let metas = []
    const cores = ['#2F6BFF', '#16A34A', '#F59E0B', '#7C3AED', '#DC2626']

    function abrirModal() {
        if (modal) modal.classList.add('open')
        campoTitulo?.focus()
    }

    function fecharModal() {
        if (modal) modal.classList.remove('open')
    }

    function limparFormulario() {
        if (campoTitulo) campoTitulo.value = ''
        if (campoTipo) campoTipo.value = 'Meta semanal'
        if (campoPrazo) campoPrazo.value = ''
    }

    function formatarPrazo(prazo) {
        if (!prazo) return 'Sem prazo'
        const data = new Date(`${prazo}T00:00:00`)
        if (Number.isNaN(data.getTime())) return prazo
        return data.toLocaleDateString('pt-BR')
    }

    function textoStatus(status) {
        if (status === 'andamento') return 'Em andamento'
        if (status === 'concluida') return 'Concluída'
        return 'Não iniciada'
    }

    function classeStatus(status) {
        if (status === 'andamento') return 'status-andamento'
        if (status === 'concluida') return 'status-concluida'
        return 'status-naoiniciada'
    }

    function escapar(texto) {
        const div = document.createElement('div')
        div.textContent = texto ?? ''
        return div.innerHTML
    }

    async function requisicao(url, opcoes = {}) {
        const resposta = await fetch(url, {
            credentials: 'include',
            ...opcoes,
            headers: {
                'Content-Type': 'application/json',
                ...(opcoes.headers || {})
            }
        })

        if (resposta.status === 401) {
            alert('Sua sessão expirou. Faça login novamente.')
            window.location.href = '../pages/login.html'
            throw new Error('Sessão expirada')
        }

        if (!resposta.ok) {
            const erro = await resposta.json().catch(() => ({}))
            throw new Error(erro.message || 'Erro ao comunicar com o servidor')
        }

        if (resposta.status === 204) return null
        return resposta.json()
    }

    function atualizarObjetivoPrincipal() {
        const principal = metas.find(meta => Boolean(meta.principal))
        const titulo = document.querySelector('.titulo-obgp')
        const subtitulo = document.querySelector('.subtitulo-obgp')
        const dias = document.querySelector('.dias-numero')
        const diasSub = document.querySelector('.dias-sub')

        if (titulo) titulo.textContent = principal?.titulo || 'Nenhum objetivo principal'
        if (subtitulo) subtitulo.textContent = principal?.tipo || 'Escolha uma meta como principal'

        if (principal?.prazo) {
            const data = new Date(`${principal.prazo}T00:00:00`)
            const hoje = new Date()
            hoje.setHours(0, 0, 0, 0)
            const diferenca = Math.max(0, Math.ceil((data - hoje) / 86400000))

            if (dias) dias.innerHTML = `${diferenca} <span>dias</span>`
            if (diasSub) diasSub.textContent = `até ${formatarPrazo(principal.prazo)}`
        } else {
            if (dias) dias.innerHTML = '- <span>dias</span>'
            if (diasSub) diasSub.textContent = 'sem prazo definido'
        }
    }

    function atualizarResumo() {
        const andamento = metas.filter(meta => meta.status === 'andamento').length
        const principal = metas.filter(meta => Boolean(meta.principal)).length

        const valores = document.querySelectorAll('.card-stat .valor')
        if (valores[0]) valores[0].textContent = andamento
        if (valores[1]) valores[1].textContent = principal
    }

    function renderizar() {
        if (!corpoTabela) return

        if (metas.length === 0) {
            corpoTabela.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center;padding:30px;">
                        Nenhuma meta cadastrada ainda.
                    </td>
                </tr>`
            atualizarObjetivoPrincipal()
            atualizarResumo()
            return
        }

        corpoTabela.innerHTML = metas.map((meta, index) => `
            <tr data-id="${meta.id}">
                <td>
                    <div class="descricao-meta">
                        <span class="icone-meta" style="background:${cores[index % cores.length]};">
                            <i data-lucide="target"></i>
                        </span>
                        <div>
                            <p class="titulo-linha-meta">${escapar(meta.titulo)}</p>
                            <p class="descrito-sub">${escapar(meta.tipo)}</p>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="data-meta">
                        ${meta.prazo ? '<i data-lucide="calendar"></i>' : ''}
                        ${escapar(formatarPrazo(meta.prazo))}
                    </div>
                </td>
                <td>
                    <span class="status-badge ${classeStatus(meta.status)}">
                        ${textoStatus(meta.status)}
                    </span>
                </td>
                <td>
                    <div class="dropdown-ponto">
                        <button class="botao-menu-meta" type="button" aria-label="Opções da meta">
                            <i data-lucide="ellipsis-vertical"></i>
                        </button>
                        <div class="menu-ponto">
                            <button class="item-menu iniciar" type="button">
                                <i data-lucide="play"></i> Iniciar
                            </button>
                            <button class="item-menu concluir" type="button">
                                <i data-lucide="check"></i> Concluir
                            </button>
                            <button class="item-menu principal" type="button">
                                <i data-lucide="trophy"></i> Marcar como principal
                            </button>
                            <button class="item-menu excluir" type="button">
                                <i data-lucide="trash-2"></i> Excluir
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        `).join('')

        if (window.lucide) window.lucide.createIcons()
        atualizarObjetivoPrincipal()
        atualizarResumo()
    }

    async function carregarMetas() {
        try {
            metas = await requisicao(API_URL)
            renderizar()
        } catch (erro) {
            console.error('Erro ao carregar metas:', erro)
            if (corpoTabela) {
                corpoTabela.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align:center;padding:30px;color:#dc2626;">
                            Não foi possível carregar as metas.
                        </td>
                    </tr>`
            }
        }
    }

    async function criarMeta() {
        const titulo = campoTitulo?.value.trim() || ''
        const tipo = campoTipo?.value || 'Meta semanal'
        const prazo = campoPrazo?.value || null

        if (!titulo) {
            alert('Digite o título da meta.')
            campoTitulo?.focus()
            return
        }

        botaoConfirmar.disabled = true

        try {
            await requisicao(API_URL, {
                method: 'POST',
                body: JSON.stringify({ titulo, tipo, prazo })
            })

            limparFormulario()
            fecharModal()
            await carregarMetas()
        } catch (erro) {
            console.error(erro)
            alert(erro.message || 'Não foi possível criar a meta.')
        } finally {
            botaoConfirmar.disabled = false
        }
    }

    async function atualizarMeta(id, dados) {
        await requisicao(`${API_URL}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(dados)
        })
        await carregarMetas()
    }

    async function excluirMeta(id) {
        if (!confirm('Tem certeza que deseja excluir esta meta?')) return

        try {
            await requisicao(`${API_URL}/${id}`, { method: 'DELETE' })
            await carregarMetas()
        } catch (erro) {
            console.error(erro)
            alert(erro.message || 'Não foi possível excluir a meta.')
        }
    }

    botaoAdicionar?.addEventListener('click', event => {
        event.preventDefault()
        abrirModal()
    })

    botaoFechar?.addEventListener('click', event => {
        event.preventDefault()
        fecharModal()
    })

    botaoConfirmar?.addEventListener('click', event => {
        event.preventDefault()
        criarMeta()
    })

    modal?.addEventListener('click', event => {
        if (event.target === modal) fecharModal()
    })

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') fecharModal()
    })

    corpoTabela?.addEventListener('click', async event => {
        const botao = event.target.closest('button')
        const linha = event.target.closest('tr[data-id]')
        if (!botao || !linha) return

        const dropdown = botao.closest('.dropdown-ponto')
        if (botao.classList.contains('botao-menu-meta')) {
            document.querySelectorAll('.dropdown-ponto.aberto').forEach(item => {
                if (item !== dropdown) item.classList.remove('aberto')
            })
            dropdown.classList.toggle('aberto')
            return
        }

        dropdown?.classList.remove('aberto')
        const id = Number(linha.dataset.id)

        try {
            if (botao.classList.contains('iniciar')) {
                await atualizarMeta(id, { status: 'andamento' })
            } else if (botao.classList.contains('concluir')) {
                await atualizarMeta(id, { status: 'concluida' })
            } else if (botao.classList.contains('principal')) {
                await atualizarMeta(id, { principal: true })
            } else if (botao.classList.contains('excluir')) {
                await excluirMeta(id)
            }
        } catch (erro) {
            console.error(erro)
            alert(erro.message || 'Não foi possível atualizar a meta.')
        }
    })

    document.addEventListener('click', event => {
        if (!event.target.closest('.dropdown-ponto')) {
            document.querySelectorAll('.dropdown-ponto.aberto')
                .forEach(item => item.classList.remove('aberto'))
        }
    })

    carregarMetas()
})
