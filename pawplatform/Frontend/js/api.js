const API_URL = ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "http://localhost:8000"
    : ""

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

    async getUsers(orgId) {
        const response = await fetch(`${API_URL}/organizations/${orgId}/users`, {
            headers: authHeaders()
    })
        if (!response.ok) throw new Error("Erreur chargement bénévoles")
    return response.json()
    },

    async createUser(orgId, user) {
        const response = await fetch(`${API_URL}/organizations/${orgId}/users`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(user)
    })
        if (!response.ok) throw new Error("Erreur création bénévole")
        return response.json()
    },

    async deleteUser(orgId, userId) {
        const response = await fetch(`${API_URL}/organizations/${orgId}/users/${userId}`, {
            method: "DELETE",
            headers: authHeaders()
    })
        if (!response.ok) throw new Error("Erreur suppression bénévole")
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

    async uploadPhoto(file) {
        const formData = new FormData()
            formData.append("file", file)
            formData.append("upload_preset", "pawplatform_preset")

        const response = await fetch("https://api.cloudinary.com/v1_1/ddmrhqj8u/image/upload", {
            method: "POST",
            body: formData
        })
        if (!response.ok) throw new Error("Erreur upload photo")
        const data = await response.json()
        return data.secure_url
    },

    // Dossiers
    async getApplications(orgId) {
        const response = await fetch(`${API_URL}/organizations/${orgId}/applications`, {
            headers: authHeaders()
        })
        return response.json()
    },

    async UpdateCat(orgId, catId, cat) {
        const response = await fetch(`${API_URL}/organizations/${orgId}/cats/${catId}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(cat)
        })
        if (!response.ok) throw new Error("Erreur mise à jour")
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
    },

    async applyForCat(catId, application) {
        const response = await fetch(`${API_URL}/cats/${catId}/apply`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(application)
        })
        if (!response.ok) throw new Error("Erreur envoi dossier")
            return response.json()
    },

    async getMedicalRecords(orgId, catId) {
        const response = await fetch(`${API_URL}/organizations/${orgId}/cats/${catId}/medical-records`, {
            headers: authHeaders()
        })
        if (!response.ok) throw new Error("Erreur chargement historique médical")
        return response.json()
    },

    async createMedicalRecord(orgId, catId, record) {
        const response = await fetch(`${API_URL}/organizations/${orgId}/cats/${catId}/medical-records`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(record)
        })
        if (!response.ok) throw new Error("Erreur ajout événement médical")
        return response.json()
    },

    async deleteMedicalRecord(orgId, catId, recordId) {
        const response = await fetch(`${API_URL}/organizations/${orgId}/cats/${catId}/medical-records/${recordId}`, {
            method: "DELETE",
            headers: authHeaders()
        })
        if (!response.ok) throw new Error("Erreur suppression événement médical")
        return response.json()
    },
}

    