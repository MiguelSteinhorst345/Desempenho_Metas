// ====== CONFIGURAÇÃO ======
const API_URL = 'http://localhost:3000' 

// ====== FUNÇÃO PRINCIPAL ======
async function carregarCronogramas() {
    // pega o container sempre na hora da execução (evita problema de ordem no DOM)
    const listaCards = document.querySelector('.cronograma-lista')

    if (!listaCards) {
        console.warn('[miniCronograma] .cronograma-lista não encontrado nesta página.')
        return
    }

    try {
        const resposta = await fetch(`${API_URL}/cronogramas`, {
            method: 'GET',
            credentials: 'include'
        })

        if (!resposta.ok) {
            throw new Error('Falha ao carregar o cronograma')
        }

        const cronogramas = await resposta.json()
        renderizarCards(cronogramas, listaCards)
    } catch (erro) {
        console.error(erro)
        listaCards.innerHTML = `<p style="color:#ff2f2f;">Não foi possível carregar o cronograma.</p>`
    }
}

// ====== RENDERIZAÇÃO ======
function renderizarCards(cronogramas, listaCards) {
    listaCards.innerHTML = ''

    if (!cronogramas || cronogramas.length === 0) {
        listaCards.innerHTML = `<p style="color:#9aa4b2; font-size: 14px; ">Nenhum cronograma encontrado.</p>`
        return
    }

    // ordena por data (mais próximas primeiro)
    cronogramas.sort((a, b) => new Date(a.data) - new Date(b.data))

    // limite de itens na home (evita poluir a sidebar)
    const LIMITE = 5
    const recortado = cronogramas.slice(0, LIMITE)

    recortado.forEach(item => {
        const card = document.createElement('div')
        card.classList.add('item-cronograma')

        // campo `concluido` é 0/1 (bit do MySQL) — aceita também true/false
        const concluido = item.concluido === 1 || item.concluido === true
        if (concluido) {
            card.classList.add('item-concluido')
        }

        const { dia, mes } = formatarData(item.data)
        const { classeBadge, textoBadge } = definirBadge(item, concluido)

        card.innerHTML = `
            <div class="item-cabeca">
                <div class="item-hora">${dia} / ${mes}</div>
                <span class="badge ${classeBadge}">${textoBadge}</span>
            </div>
            <span class="item-nome">${item.materia || ''}</span>
            <div class="item-topico">${item.conteudo || ''}</div>
        `

        listaCards.appendChild(card)
    })
}

// ====== HELPERS ======

/**
 * Recebe "2026-09-16" ou Date/ISO e devolve { dia, mes }
 * Usa UTC pra evitar problema de fuso (a data no banco é só YYYY-MM-DD).
 */
function formatarData(data) {
    if (!data) return { dia: '--', mes: '--' }

    // se vier "2026-09-16" (só data), parseia manualmente pra evitar fuso
    if (typeof data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data)) {
        const [, mes, dia] = data.split('-')
        return { dia, mes }
    }

    const d = new Date(data)
    if (isNaN(d.getTime())) return { dia: '--', mes: '--' }

    const dia = String(d.getUTCDate()).padStart(2, '0')
    const mes = String(d.getUTCMonth() + 1).padStart(2, '0')
    return { dia, mes }
}

/**
 * Deriva o badge a partir de `concluido` e `data`.
 */
function definirBadge(item, concluido) {
    if (concluido) {
        return { classeBadge: 'badge-concluido', textoBadge: 'Concluído' }
    }

    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const dataItem = new Date(item.data)
    dataItem.setHours(0, 0, 0, 0)

    const diffDias = Math.round((dataItem - hoje) / (1000 * 60 * 60 * 24))

    if (diffDias < 0)   return { classeBadge: 'badge-atrasado', textoBadge: 'Atrasado' }
    if (diffDias === 0) return { classeBadge: 'badge-alta',     textoBadge: 'Hoje' }
    if (diffDias <= 3)  return { classeBadge: 'badge-alta',     textoBadge: 'Alta' }
    if (diffDias <= 7)  return { classeBadge: 'badge-media',    textoBadge: 'Média' }
    return { classeBadge: 'badge-baixa', textoBadge: 'Baixa' }
}

// ====== INICIALIZAÇÃO ======
document.addEventListener('DOMContentLoaded', carregarCronogramas)