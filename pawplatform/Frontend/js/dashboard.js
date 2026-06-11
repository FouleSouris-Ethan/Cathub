// Vérifie que l'utilisateur est connecté
const token = localStorage.getItem("token")
const orgId = localStorage.getItem("org_id")

let currentFilter = "tous" // Filtre actuel pour les chats
let allCatsCache = [] // Cache pour tous les chats

if (!token || !orgId) {
    window.location.href = "login.html"
}

// Gestion des onglets
function showTab(tab) {
    document.getElementById("tab-cats").style.display = tab === "cats" ? "block" : "none"
    document.getElementById("tab-applications").style.display = tab === "applications" ? "block" : "none"
    document.querySelectorAll(".tab").forEach((t, i) => {
        t.classList.toggle("active", (i === 0 && tab === "cats") || (i === 1 && tab === "applications"))
    })
    if (tab === "applications") loadApplications()
}

// Déconnexion
function logout() {
    localStorage.clear()
    window.location.href = "login.html"
}

// Modal
function openModal() { document.getElementById("modal").classList.add("open") }
function closeModal() { document.getElementById("modal").classList.remove("open") }

// Chargement des chats
async function loadCats() {
    allCatsCache = await api.getCats(orgId) // Met à jour le cache
    renderCats(allCatsCache) // Affiche tous les chats
}

function renderCats(cats) {
    const tbody = document.getElementById("cats-list")
    if (!tbody) {
        console.log("tbody introuvable")
        return
    }
    const filtered = currentFilter === "tous"
        ? cats
        : cats.filter(c => c.status === currentFilter)

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">Aucun chat pour ce filtre</td></tr>`
        return
    }
    tbody.innerHTML = filtered.map(cat => `
        <tr>
            <td>${cat.name}</td>
            <td>${cat.age} ans</td>
            <td>${cat.race || "—"}</td>
            <td>${cat.description || "—"}</td>
            <td><span class="badge ${cat.status}">${cat.status}</span></td>
            <td>
                <button class="action-btn" onclick="openEditModal('${cat.id}')">
                    Modifier
                </button>
                <button class="action-btn danger" onclick="handleDeleteCat('${cat.id}')">
                    Supprimer
                </button>
            </td>
        </tr>
    `).join("")
}

function filterCats(status) {
    currentFilter = status

    // Met à jour le bouton actif
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.remove("active")
    })
    event.target.classList.add("active")

    renderCats(allCatsCache) // Affiche les chats filtrés à partir du cache
}

// Créer un chat
async function handleCreateCat() {
    const cat = {
        name: document.getElementById("cat-name").value,
        age: parseInt(document.getElementById("cat-age").value),
        race: document.getElementById("cat-race").value || null,
        description: document.getElementById("cat-description").value || null,
        status: "disponible"
    }
    try {
        await api.createCat(orgId, cat)
        closeModal()
        loadCats()
    } catch (e) {
        alert("Erreur lors de la création")
    }
}

// Ouvrir modal de modification
async function openEditModal(catId) {
    const allCats = await api.getCats(orgId)
    const foundCat = allCats.find(c => c.id === catId)

    document.getElementById("edit-cat-id").value = foundCat.id
    document.getElementById("edit-cat-name").value = foundCat.name
    document.getElementById("edit-cat-age").value = foundCat.age
    document.getElementById("edit-cat-race").value = foundCat.race || ""
    document.getElementById("edit-cat-description").value = foundCat.description || ""
    document.getElementById("edit-cat-status").value = foundCat.status
    document.getElementById("modal-edit").classList.add("open")
}

function closeEditModal() {
    document.getElementById("modal-edit").classList.remove("open")
}

// Enregistrer les modifications d'un chat
async function handleUpdateCat() {
    const catId = document.getElementById("edit-cat-id").value
    const cat = {
        name: document.getElementById("edit-cat-name").value,
        age: parseInt(document.getElementById("edit-cat-age").value),
        race: document.getElementById("edit-cat-race").value || null,
        description: document.getElementById("edit-cat-description").value || null,
        status: document.getElementById("edit-cat-status").value
    }
    try {
        await api.UpdateCat(orgId, catId, cat)
        closeEditModal()
        loadCats()
    } catch (e) {
        alert("Erreur lors de la mise à jour")
    }
}

// Supprimer un chat
async function handleDeleteCat(catId) {
    if (!confirm("Supprimer ce chat ?")) return
    try {
        await api.deleteCat(orgId, catId)
        loadCats()
    } catch (e) {
        alert("Erreur lors de la suppression")
    }
}

// Chargement des dossiers
async function loadApplications() {
    const apps = await api.getApplications(orgId)
    const tbody = document.getElementById("applications-list")
    if (apps.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">Aucun dossier pour l'instant</td></tr>`
        return
    }
    tbody.innerHTML = apps.map(app => `
        <tr>
            <td>${app.first_name} ${app.last_name}</td>
            <td>${app.email}</td>
            <td>${app.housing_type}</td>
            <td><span class="badge ${app.status}">${app.status}</span></td>
            <td>
                <button class="action-btn" onclick="openDetailModal('${app.id}')">
                    Voir
                </button>
                ${app.status === "en attente" ? `
                    <button class="action-btn success" onclick="handleUpdateStatus('${app.id}', 'approuvé')">
                        Valider
                    </button>
                    <button class="action-btn danger" onclick="handleUpdateStatus('${app.id}', 'rejeté')">
                        Refuser
                    </button>
                ` : "-"}
            </td>
        </tr>
    `).join("")
}

// Voir le detail d'un dossier
async function openDetailModal(appId) {
    const apps= await api.getApplications(orgId)
    const app = apps.find(a => a.id == appId)

    const content = document.getElementById("detail-content")
    content.innerHTML = `
        <div class="detail-grid">
            <div class="detail-section">
                <h4>Prénom</h4>
                <p>${app.first_name}</p>
            </div>
            <div class="detail-section">
                <h4>Nom</h4>
                <p>${app.last_name}</p>
            </div>
            <div class="detail-section">
                <h4>Email</h4>
                <p>${app.email}</p>
            </div>
            <div class="detail-section">
                <h4>Téléphone</h4>
                <p>${app.phone}</p>
            </div>
        </div>

        <div class="detail-section">
            <h4>Adresse</h4>
            <p>${app.address}</p>
        </div>

        <div class="detail-grid">
            <div class="detail-section">
                <h4>Logement</h4>
                <p>${app.housing_type}</p>
            </div>
            <div class="detail-section">
                <h4>Statut</h4>
                <p><span class="badge ${app.status}">${app.status}</span></p>
            </div>
        </div>

        <div class="detail-section">
            <h4>Situation</h4>
            <p>
                ${app.has_garden ? "✅ Jardin" : "❌ Pas de jardin"} &nbsp;
                ${app.has_children ? "✅ Enfants" : "❌ Pas d'enfants"} &nbsp;
                ${app.has_other_pets ? "✅ Autres animaux" : "❌ Pas d'autres animaux"} &nbsp;
                ${app.first_cat ? "✅ Premier chat" : "❌ Pas son premier chat"}
            </p>
        </div>

        ${app.motivation ? `
        <div class="detail-section">
            <h4>Motivation</h4>
            <p>${app.motivation}</p>
        </div>
        ` : ""}

        <div class="detail-section">
            <h4>Date de candidature</h4>
            <p>${new Date(app.created_at).toLocaleDateString("fr-FR")}</p>
        </div>
    `
    document.getElementById("modal-detail").classList.add("open")
}

function closeDetailModal() {
    document.getElementById("modal-detail").classList.remove("open")
}

// Mettre à jour le statut d'un dossier
async function handleUpdateStatus(appId, status) {
    try {
        await api.updateApplicationStatus(orgId, appId, status)
        loadApplications()
    } catch (e) {
        alert("Erreur lors de la mise à jour")
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadCats()
})