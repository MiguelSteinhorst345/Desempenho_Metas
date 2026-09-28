const DESEMPENHO_API = 'http://localhost:3000/desempenho'

function formatarHoras(horas) {
    const totalMinutos = Math.round(Number(horas || 0) * 60)
    const h = Math.floor(totalMinutos / 60)
    const min = totalMinutos % 60
    return `${h}h ${String(min).padStart(2, '0')}min`
}

function escaparHtml(texto) {
    const div = document.createElement('div')
    div.textContent = texto ?? ''
    return div.innerHTML
}

function corMateria(nome) {
    const cores = ['#2F6BFF', '#16A34A', '#1D4ED8', '#F59E0B', '#9333EA', '#0891B2']
    let soma = 0
    for (let i = 0; i < nome.length; i++) soma += nome.charCodeAt(i)
    return cores[soma % cores.length]
}

function iniciais(nome) {
    return nome.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

async function carregarDesempenho() {
    try {
        const resposta = await fetch(DESEMPENHO_API, { credentials: 'include' })
        if (!resposta.ok) throw new Error('Não foi possível carregar o desempenho.')
        atualizarTela(await resposta.json())
    } catch (erro) {
        console.error(erro)
        const erroTela = document.querySelector('#erro-desempenho')
        if (erroTela) erroTela.textContent = 'Não foi possível carregar os dados de desempenho.'
    }
}

function atualizarTela(dados) {
    document.querySelector('#horas-estudadas').textContent = formatarHoras(dados.horas_semana)
    document.querySelector('#taxa-acertos').textContent = `${dados.taxa_acertos}%`
    document.querySelector('#taxa-erros').textContent = `${dados.taxa_erros}%`

    const grafico = document.querySelector('.grafico-barras')
    grafico.querySelectorAll('.barra-coluna').forEach(el => el.remove())
    const maximo = Math.max(60, ...dados.dias.map(d => Number(d.minutos)))
    dados.dias.forEach(dia => {
        const coluna = document.createElement('div')
        coluna.className = 'barra-coluna'
        const barra = document.createElement('div')
        barra.className = 'barra'
        barra.title = `${dia.label}: ${formatarHoras(Number(dia.minutos) / 60)}`
        barra.style.height = `${Number(dia.minutos) ? Math.max(4, Number(dia.minutos) / maximo * 100) : 0}%`
        coluna.appendChild(barra)
        grafico.appendChild(coluna)
    })

    document.querySelector('.dias-semana').innerHTML = dados.dias.map(d => `<span>${escaparHtml(d.label)}</span>`).join('')

    const tbody = document.querySelector('#tabela-desempenho tbody')
    if (!dados.materias.length) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#9ca3af;padding:24px;">Nenhum desempenho registrado ainda. Conclua uma atividade no cronograma para começar.</td></tr>'
        return
    }

    tbody.innerHTML = dados.materias.map(materia => {
        const cor = corMateria(materia.materia)
        const atividades = `${materia.atividades}/${materia.atividades_total}`
        return `<tr>
            <td><div class="materia-nome"><span class="icone-materia" style="background:${cor};">${escaparHtml(iniciais(materia.materia))}</span>${escaparHtml(materia.materia)}</div></td>
            <td class="col-progresso"><div class="progresso-linha"><div class="meta-barra"><div class="meta-progresso" style="width:${materia.percentual}%;background:${cor};"></div></div><span class="valor-porc">${materia.percentual}%</span></div></td>
            <td>${atividades}</td>
        </tr>`
    }).join('')
}

document.addEventListener('DOMContentLoaded', () => {
    carregarDesempenho()
})
