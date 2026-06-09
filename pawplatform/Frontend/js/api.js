const API_URL = "http://161.35.198.201"

// Récupère le token stocké
const getToken = () => localStorage.getItem("token")

// Headers avec authentification
const authHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getToken()}`
})

// Auth
const api = {
    async login(email, password) {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ username: email, password })
        })
        if (!response.ok) throw new Error("Identifiants incorrects")
        return response.json()
    },

    async getMe() {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: authHeaders()
        })
        if (!response.ok) throw new Error("Non autorisé")
        return response.json()
    },

    // Chats
    async getCats(orgId) {
        const response = await fetch(`${API_URL}/organizations/${orgId}/cats`, {
            headers: authHeaders()
        })
        return response.json()
    },

    async createCat(orgId, cat) {
        const response = await fetch(`${API_URL}/organizations/${orgId}/cats`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(cat)
        })
        if (!response.ok) throw new Error("Erreur création chat")
        return response.json()
    },

    async deleteCat(orgId, catId) {
        const response = await fetch(`${API_URL}/organizations/${orgId}/cats/${catId}`, {
            method: "DELETE",
            headers: authHeaders()
        })
        if (!response.ok) throw new Error("Erreur suppression")
        return response.json()
    },

    // Dossiers
    async getApplications(orgId) {
        const response = await fetch(`${API_URL}/organizations/${orgId}/applications`, {
            headers: authHeaders()
        })
        return response.json()
    },

    async updateApplicationStatus(orgId, appId, status) {
        const response = await fetch(`${API_URL}/organizations/${orgId}/applications/${appId}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify({ status })
        })
        if (!response.ok) throw new Error("Erreur mise à jour")
        return response.json()
    }
}