// userDelete.js (SEM a linha do baseApi, já que o authGuard.js já declara ela antes)

document.addEventListener("DOMContentLoaded", () => {

    const btnExcluirConta = document.querySelector('.botao-excluir-conta')

    if (btnExcluirConta) {

        btnExcluirConta.addEventListener('click', async () => {

            const confirmado = confirm("Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.")
            if (!confirmado) return

            const meRes = await fetch(`${baseApi}/me`, {
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            })

            const me = await meRes.json()

            const res = await fetch(`${baseApi}/${me.user.id}`, {
                headers: {
                    "Content-Type": "application/json"
                },
                method: 'DELETE',
                credentials: "include"
            })

            const data = await res.json()

            console.log(data)

            if (!data.success) {
                alert(`Algo deu errado: ${data.message}`)
            } else {
                alert(data.message)
                window.location.href = '../pages/login.html'
            }
        })
    }
})