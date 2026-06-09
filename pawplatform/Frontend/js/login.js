// Si déjà connecté, redirige vers le dashboard
if (localStorage.getItem("token")) {
    window.location.href = "dashboard.html"
}

async function handleLogin() {
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const error = document.getElementById("error")

    try {
        const data = await api.login(email, password)
        localStorage.setItem("token", data.access_token)

        // Récupère les infos de l'utilisateur pour avoir l'org_id
        const me = await api.getMe()
        localStorage.setItem("org_id", me.organization_id)

        window.location.href = "dashboard.html"
    } catch (e) {
        error.style.display = "block"
    }
}