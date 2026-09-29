document.addEventListener("DOMContentLoaded", () => {

    const btnSairConta = document.querySelector('.botao-sair-conta')

    if (btnSairConta) {

        btnSairConta.addEventListener('click', async () => {

            const res = await fetch(`${baseApi}/logoff`, {
                method: 'POST',
                credentials: "include"
            })

            const data = await res.json()

            console.log(data)

            if (data.success) {
                window.location.href = '../pages/login.html'
            } else {
                alert(`Algo deu errado: ${data.message}`)
            }
        })
    }
})

