// Vérifie que l'utilisateur est connecté
const token = localStorage.getItem("token")
const orgId = localStorage.getItem("org_id")

let currentFilter = "tous" // Filtre actuel pour les chats
let allCatsCache = [] // Cache pour tous les chats
let currentUser = null //Stocke les infos de l'utilisateur connecté
let allApplicationsCache = []
let currentAppFilter = "actifs"
let currentMedicalCatid = null


if (!token || !orgId) {
    window.location.href = "login.html"
}

// Gestion des onglets
function showTab(tab) {
    document.getElementById("tab-cats").style.display = tab === "cats" ? "block" : "none"
    document.getElementById("tab-applications").style.display = tab === "applications" ? "block" : "none"
    document.getElementById("tab-users").style.display = tab === "users" ? "block" : "none"

    document.querySelectorAll(".tab").forEach((t, i) => {
        t.classList.toggle("active",
            (i === 0 && tab === "cats") || 
            (i === 1 && tab === "applications") ||
            (i === 2 && tab === "users")
        )
    })

    if (tab === "applications") loadApplications()
    if (tab === "users") loadUsers()
}

// Déconnexion
function logout() {
    localStorage.clear()
    window.location.href = "login.html"
}

// Modal
function openModal() { document.getElementById("modal").classList.add("open") }
function closeModal() { document.getElementById("modal").classList.remove("open") }


//Chargement des infos de l'utilisateur connecté 
async function init(){
    try {
        currentUser = await api.getMe()

        //Affiche l'onglet bénévoles uniquement pour les admins
        if (currentUser.is_admin) {
            document.getElementById("tab-btn-users").style.display = "block"
        }
    } catch (e) {
        alert("Impossible de charger votre session. Veuillez vous reconnecter.")
        logout()
        return
    }

    // Prévisualisation photo ajout
    const catPhotoInput = document.getElementById("cat-photo")
    if (catPhotoInput) {
        catPhotoInput.addEventListener("change", function() {
            const file = this.files[0]
            if (file) {
                const preview = document.getElementById("cat-photo-preview")
                preview.src = URL.createObjectURL(file)
                preview.style.display = "block"
            }
        })
    }

    // Prévisualisation photo modification
    const editCatPhotoInput = document.getElementById("edit-cat-photo")
    if (editCatPhotoInput) {
        editCatPhotoInput.addEventListener("change", function() {
            const file = this.files[0]
            if (file) {
                const preview = document.getElementById("edit-cat-photo-preview")
                preview.src = URL.createObjectURL(file)
                preview.style.display = "block"
            }
        })
    }

    loadCats()
}

// Modal bénévoles
function openUserModal() {
    document.getElementById("modal-user").classList.add("open")
}
function closeUserModal() {
    document.getElementById("modal-user").classList.remove("open")
}

// Charger les bénévoles
async function loadUsers() {
    try {
        const users = await api.getUsers(orgId)
        const tbody = document.getElementById("users-list")
        if (users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3">Aucun bénévole pour l'instant</td></tr>`
            return
        }
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.email}</td>
                <td>${user.is_admin ? "👑 Admin" : "🙋 Bénévole"}</td>
                <td>
                    ${user.id !== currentUser.id ? `
                        <button class="action-btn danger" onclick="handleDeleteUser('${user.id}')">
                            Supprimer
                        </button>
                    ` : "—"}
                </td>
            </tr>
        `).join("")
    } catch (e) {
        console.error("Erreur chargement bénévoles", e)
        const tbody = document.getElementById("users-list")
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="3">Impossible de charger les bénévoles.</td></tr>`
        }
    }
}

// Créer un bénévole
async function handleCreateUser() {
    const user = {
        email: document.getElementById("user-email").value,
        password: document.getElementById("user-password").value,
        is_admin: document.getElementById("user-is-admin").checked
    }
    if (!user.email || !user.password) {
        alert("Merci de remplir tous les champs.")
        return
    }
    try {
        await api.createUser(orgId, user)
        closeUserModal()
        loadUsers()
    } catch(e) {
        alert("Erreur lors de la création du bénévole.")
    }
}

// Supprimer un bénévole
async function handleDeleteUser(userId) {
    if (!confirm("Supprimer ce bénévole ?")) return
    try {
        await api.deleteUser(orgId, userId)
        loadUsers()
    } catch(e) {
        alert("Erreur lors de la suppression.")
    }
}

// Chargement des chats
async function loadCats() {
    try {
        allCatsCache = await api.getCats(orgId)
        renderCats(allCatsCache)
    } catch (e) {
        console.error("Erreur chargement chats", e)
        const tbody = document.getElementById("cats-list")
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="8">Impossible de charger les chats.</td></tr>`
        }
    }
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
        tbody.innerHTML = `<tr><td colspan="8">Aucun chat pour ce filtre</td></tr>`
        return
    }
    tbody.innerHTML = filtered.map(cat => `
        <tr>
            <td>${cat.photo_url ? `<img src="${cat.photo_url}" style="width:50px; height:50px; object-fit:cover; border-radius:8px; cursor:pointer;" onclick="openPhotoModal('${cat.photo_url}')">` : "—"}</td>
            <td>${cat.name}</td>
            <td>${cat.age} ans</td>
            <td>${cat.race || "—"}</td>
            <td>${cat.description || "—"}</td>
            <td><span class="badge ${cat.status}">${cat.status}</span></td>
            <td>
                <button class="action-btn" onclick="openMedicalModal('${cat.id}', '${cat.name.replace(/'/g, "\\'")}')">
                    🩺 Voir
                </button>
            </td>
            <td class="actions-cell">
                <button class="action-btn" onclick="openEditModal('${cat.id}')">
                    Modifier
                </button>
                <button class="action-btn" onclick="shareCat('${cat.id}', '${cat.name}')">
                    Partager
                </button>
                <button class="action-btn danger" onclick="handleDeleteCat('${cat.id}')">
                    Supprimer
                </button>
            </td>
        </tr>
    `).join("")
}

function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text)
    }

    const textarea = document.createElement("textarea")
    textarea.value = text
    textarea.style.position = "fixed"
    textarea.style.opacity = "0"
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()

    const copied = document.execCommand("copy")
    document.body.removeChild(textarea)

    if (!copied) {
        return Promise.reject()
    }

    return Promise.resolve()
}

function shareCat(catId, catName) {
    const link = `${window.location.origin}/apply.html?cat=${catId}&org=${orgId}`

    copyToClipboard(link).then(() => {
        alert(`Lien copié pour ${catName} !\n\n${link}`)
    }).catch(() => {
        prompt(`Lien pour ${catName} (Ctrl+C pour copier) :`, link)
    })
}

function shareAllCats() {
    const link = `${window.location.origin}/cats.html?org=${orgId}`

    copyToClipboard(link).then(() => {
        alert(`Lien copié !\n\n${link}`)
    }).catch(() => {
        prompt(`Lien (Ctrl+C pour copier) :`, link)
    })
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
    let photo_url = null
    const photoFile = document.getElementById("cat-photo").files[0]
   
    if (photoFile) {
        try {
            photo_url = await api.uploadPhoto(photoFile)
        } catch(e) {
            alert("Erreur lors de l'upload de la photo.")
            return
        }
    }

    const cat = {
        name: document.getElementById("cat-name").value,
        age: parseInt(document.getElementById("cat-age").value),
        race: document.getElementById("cat-race").value || null,
        description: document.getElementById("cat-description").value || null,
        status: "disponible",
        is_sterilized: document.getElementById("cat-sterilized").checked,
        is_vaccinated: document.getElementById("cat-vaccinated").checked,
        is_chipped: document.getElementById("cat-chipped").checked,
        photo_url: photo_url
    }
    try {
        await api.createCat(orgId, cat)
        closeModal()
        loadCats()
    } catch (e) {
        alert("Erreur lors de la création")
    }
}

// Ouvrir la photo en grand et la fermer
function openPhotoModal(url) { 
    document.getElementById("photo-modal-img").src = url 
    document.getElementById("modal-photo").classList.add("open") 
} 

function closePhotoModal() { 
    document.getElementById("modal-photo").classList.remove("open") 
}




// Ouvrir modal de modification
async function openEditModal(catId) {
    const allCats = await api.getCats(orgId)
    const foundCat = allCats.find(c => c.id === catId)

    const editId = document.getElementById("edit-cat-id")
    editId.value = foundCat.id
    editId.dataset.currentPhoto = foundCat.photo_url || ""

    document.getElementById("edit-cat-name").value = foundCat.name
    document.getElementById("edit-cat-age").value = foundCat.age
    document.getElementById("edit-cat-race").value = foundCat.race || ""
    document.getElementById("edit-cat-description").value = foundCat.description || ""
    document.getElementById("edit-cat-status").value = foundCat.status
    document.getElementById("edit-cat-sterilized").checked = foundCat.is_sterilized
    document.getElementById("edit-cat-vaccinated").checked = foundCat.is_vaccinated
    document.getElementById("edit-cat-chipped").checked= foundCat.is_chipped

    // Affiche la photo actuelle si elle existe
    const preview = document.getElementById("edit-cat-photo-preview")
    if (foundCat.photo_url) {
        preview.src = foundCat.photo_url
        preview.style.display = "block"
    } else {
        preview.style.display = "none"
    }

    document.getElementById("modal-edit").classList.add("open")
}

function closeEditModal() {
    document.getElementById("modal-edit").classList.remove("open") 
}

// Enregistrer les modifications d'un chat
async function handleUpdateCat() {
    let photo_url = document.getElementById("edit-cat-id").dataset.currentPhoto || null
    const photoFile = document.getElementById("edit-cat-photo").files[0]

    if (photoFile) {
        try {
            photo_url = await api.uploadPhoto(photoFile)
        } catch(e) {
            alert("Erreur lors de l'upload de la photo.")
            return
        }
    }

    const catId = document.getElementById("edit-cat-id").value
    const cat = {
        name: document.getElementById("edit-cat-name").value,
        age: parseInt(document.getElementById("edit-cat-age").value),
        race: document.getElementById("edit-cat-race").value || null,
        description: document.getElementById("edit-cat-description").value || null,
        status: document.getElementById("edit-cat-status").value,
        is_sterilized: document.getElementById("edit-cat-sterilized").checked,
        is_vaccinated: document.getElementById("edit-cat-vaccinated").checked,
        is_chipped: document.getElementById("edit-cat-chipped").checked,
        photo_url: photo_url
    }
    try {
        await api.UpdateCat(orgId, catId, cat)
        closeEditModal()
        loadCats()
    } catch(e) {
        alert("Erreur lors de la modification")
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
    try {
        allApplicationsCache = await api.getApplications(orgId)
        renderApplications(allApplicationsCache)
    } catch (e) {
        console.error("Erreur chargement dossiers", e)
        const tbody = document.getElementById("applications-list")
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="6">Impossible de charger les dossiers.</td></tr>`
        }
    }
}

function renderApplications(apps) {
    const tbody = document.getElementById("applications-list")

    let filtered
    if (currentAppFilter === "tous") {
        filtered = apps
    } else if (currentAppFilter === "actifs") {
        filtered = apps.filter(a => a.status !== "rejeté")
    } else {
        filtered = apps.filter(a => a.status === currentAppFilter)
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">Aucun dossier pour ce filtre</td></tr>`
        return
    }

    // On a besoin des chats pour afficher le nom/race/photo
    api.getCats(orgId).then(cats => {
        tbody.innerHTML = filtered.map(app => {
            const cat = cats.find(c => c.id === app.cat_id)
            const catCell = cat ? `
                <div style="display:flex; align-items:center; gap:0.5rem;">
                    ${cat.photo_url
                        ? `<img src="${cat.photo_url}" style="width:36px; height:36px; object-fit:cover; border-radius:6px;">`
                        : `<span style="font-size:1.5rem;">🐱</span>`
                    }
                    <div>
                        <div style="font-weight:500;">${cat.name}</div>
                        <div style="font-size:0.75rem; color:#666;">${cat.race || "Race inconnue"}, ${cat.age} ans</div>   
                    </div>
                </div>
            ` : "Chat introuvable"

            return `
            <tr>
                <td>${catCell}</td>
                <td>${app.first_name} ${app.last_name}</td>
                <td>${app.email}</td>
                <td>${app.housing_type}</td>
                <td><span class="badge ${app.status}">${app.status}</span></td>
                <td>
                    <button class="action-btn" onclick="openDetailModal('${app.id}')">Voir</button>
                    ${app.status === "en attente" ? `
                        <button class="action-btn success" onclick="handleUpdateStatus('${app.id}', 'approuvé')">Valider</button>
                        <button class="action-btn danger" onclick="handleUpdateStatus('${app.id}', 'rejeté')">Refuser</button>
                    ` : "—"}
                </td>
            </tr>
        `}).join("")
    })
}

function filterApplications(status) {
    currentAppFilter = status

    document.querySelectorAll(".app-filter").forEach(btn => {
        btn.classList.remove("active")
    })
    event.target.classList.add("active")

    renderApplications(allApplicationsCache)
}

// Voir le detail d'un dossier
async function openDetailModal(appId) {
    const apps= await api.getApplications(orgId)
    const app = apps.find(a => a.id == appId)
    const cats = await api.getCats(orgId)
    const cat = cats.find(c => c.id === app.cat_id)

    const content = document.getElementById("detail-content")
    content.innerHTML = `
        <div class="detail-section" style="display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem;">
            ${cat && cat.photo_url
                ? `<img src="${cat.photo_url}" style="width:60px; height:60px; object-fit:cover; border-radius:8px;">`
                : `<span style="font-size:2.5rem;">🐱</span>`
            }
            <div>
                <h4 style="margin-bottom:0.2rem;">Chat concerné</h4>
                <p>${cat ? `${cat.name} — ${cat.race || "Race inconnue"}, ${cat.age} ans` : "Chat introuvable"}</p>
            </div>
        </div>
            
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

async function init() {
    currentUser = await api.getMe()
    if (currentUser.is_admin) {
        document.getElementById("tab-btn-users").style.display = "block"
    }
    loadCats()
}

// Ouvrir la modal historique médical
async function openMedicalModal(catId, catName) {
    currentMedicalCatId = catId
    document.getElementById("medical-modal-title").textContent = `Historique médical — ${catName}`
    document.getElementById("modal-medical").classList.add("open")
    await loadMedicalRecords()
}

function closeMedicalModal() {
    document.getElementById("modal-medical").classList.remove("open")
    currentMedicalCatId = null
}

// Charger les événements
async function loadMedicalRecords() {
    const list = document.getElementById("medical-records-list")
    list.innerHTML = "Chargement..."

    const records = await api.getMedicalRecords(orgId, currentMedicalCatId)

    if (records.length === 0) {
        list.innerHTML = `<p style="color:#666; font-size:0.9rem;">Aucun événement enregistré.</p>`
        return
}

    const typeLabels = {
    vaccin: "💉 Vaccin",
    vermifuge: "🪱 Vermifuge",
    visite: "🩺 Visite vétérinaire",
    traitement: "💊 Traitement",
    autre: "📋 Autre"
    }

    list.innerHTML = records.map(r => `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; padding:0.6rem 0; border-bottom:1px solid #f0f0f0;">
            <div>
                <div style="font-weight:500; font-size:0.9rem;">${typeLabels[r.record_type] || r.record_type}</div>
                <div style="font-size:0.8rem; color:#666;">${new Date(r.record_date).toLocaleDateString("fr-FR")}</div>
                ${r.description ? `<div style="font-size:0.85rem; margin-top:0.2rem;">${r.description}</div>` : ""}
            </div>
            <button class="action-btn danger" onclick="handleDeleteMedicalRecord('${r.id}')">Suppr.</button>
        </div>
    `).join("")
}

// Ajouter un événement
async function handleAddMedicalRecord() {
    const record = {
        record_type: document.getElementById("medical-type").value,
        description: document.getElementById("medical-description").value || null,
        record_date: document.getElementById("medical-date").value
    }

    if (!record.record_date) {
        alert("Merci de choisir une date.")
        return
    }

    try {
        await api.createMedicalRecord(orgId, currentMedicalCatId, record)
        document.getElementById("medical-description").value = ""
        document.getElementById("medical-date").value = ""
        await loadMedicalRecords()
    } catch(e) {
        alert("Erreur lors de l'ajout de l'événement")
    }
}

// Supprimer un événement
async function handleDeleteMedicalRecord(recordId) {
    if (!confirm("Supprimer cet événement ?")) return
    try {
        await api.deleteMedicalRecord(orgId, currentMedicalCatId, recordId)
        await loadMedicalRecords()
    } catch(e) {
        alert("Erreur lors de la suppression")
    }
}

document.addEventListener("DOMContentLoaded", () => {
    init()
})