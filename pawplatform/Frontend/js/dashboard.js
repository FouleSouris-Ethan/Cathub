// Vérifie que l'utilisateur est connecté
const token = localStorage.getItem("token")
const orgId = localStorage.getItem("org_id")

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
    const cats = await api.getCats(orgId)
    const tbody = document.getElementById("cats-list")
    if (cats.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">Aucun chat pour l'instant</td></tr>`
        return
    }
    tbody.innerHTML = cats.map(cat => `
        <tr>
            <td>${cat.name}</td>
            <td>${cat.age} ans</td>
            <td>${cat.breed || "—"}</td>
            <td><span class="badge ${cat.status}">${cat.status}</span></td>
            <td>
                <button class="action-btn danger" onclick="handleDeleteCat('${cat.id}')">
                    Supprimer
                </button>
            </td>
        </tr>
    `).join("")
}

// Créer un chat
async function handleCreateCat() {
    const cat = {
        name: document.getElementById("cat-name").value,
        age: parseInt(document.getElementById("cat-age").value),
        breed: document.getElementById("cat-breed").value,
        description: document.getElementById("cat-description").value,
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
                ${app.status === "en_attente" ? `
                    <button class="action-btn success" onclick="handleUpdateStatus('${app.id}', 'validé')">
                        Valider
                    </button>
                    <button class="action-btn danger" onclick="handleUpdateStatus('${app.id}', 'refusé')">
                        Refuser
                    </button>
                ` : "—"}
            </td>
        </tr>
    `).join("")
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

// Chargement initial
loadCats()