const HOME_DESEMPENHO_API = 'http://localhost:3000/desempenho'

function formatarHorasHome(horas) {
    const totalMinutos = Math.round(Number(horas || 0) * 60)
    const h = Math.floor(totalMinutos / 60)
    const min = totalMinutos % 60
    return `${h}h ${String(min).padStart(2, '0')}min`
}

async function carregarResumoDesempenhoHome() {
    try {
        const resposta = await fetch(HOME_DESEMPENHO_API, { credentials: 'include' })
        if (!resposta.ok) throw new Error('Não foi possível carregar o desempenho.')

        const dados = await resposta.json()

        const horas = document.querySelector('#home-horas-estudadas')
        const acertos = document.querySelector('#home-taxa-acertos')
        const progresso = document.querySelector('#home-desempenho-progresso')

        if (horas) horas.textContent = formatarHorasHome(dados.horas_semana)

        const taxaAcertos = Math.max(0, Math.min(100, Number(dados.taxa_acertos || 0)))
        if (acertos) acertos.textContent = `${taxaAcertos}%`
        if (progresso) progresso.style.width = `${taxaAcertos}%`
    } catch (erro) {
        console.error('[home] Erro ao carregar desempenho:', erro)
    }
}

document.addEventListener('DOMContentLoaded', carregarResumoDesempenhoHome)
