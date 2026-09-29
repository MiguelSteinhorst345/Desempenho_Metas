const baseApi = 'http://localhost:3000'

document.addEventListener("DOMContentLoaded", () => {

    const formLogin = document.getElementById('formLogin')
    const formRegister = document.getElementById('formCadastro')

    // LOGIN
    if (formLogin) {

        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault()

            const email = document.getElementById('email').value
            const password = document.getElementById('password').value

            const res = await fetch(`${baseApi}/login`, {
                headers: {
                    "Content-Type": "application/json"
                },
                method: 'POST',
                credentials: "include",
                body: JSON.stringify({
                    email,
                    password
                })
            })

            const data = await res.json()

            console.log(data)

            if (!data.success) {
                alert(`Algo deu errado: ${data.message}`)
            } else {
                alert(data.message)
                window.location.href = '../pages/home.html'
            }
        })
    }

    // CADASTRO
    if (formRegister) {

        formRegister.addEventListener('submit', async (e) => {
            e.preventDefault()

            const name = document.getElementById('name').value
            const email = document.getElementById('email').value
            const password = document.getElementById('password').value

            const res = await fetch(`${baseApi}/register`, {
                headers: {
                    "Content-Type": "application/json"
                },
                method: 'POST',
                credentials: "include",
                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            })

            const data = await res.json()

            console.log(data)

            alert(data.message)
        })
    }
})