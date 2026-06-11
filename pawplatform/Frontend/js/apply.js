const params = new URLSearchParams(window.location.search)
const catId = params.get("cat")
const orgId = params.get("org")

if (!catId || !orgId) {
    window.location.href = "login.html"
}

// Charge les infos du chat
async function loadCatInfo() {
    try {
        const cats = await api.getCats(orgId)
        const cat = cats.find(c => c.id === catId)
        if (!cat) {
            document.getElementById("cat-info").innerHTML = "Chat introuvable."
            return
        }
        document.getElementById("cat-info").innerHTML = `
            <h3>🐱 ${cat.name}</h3>
            <p>${cat.age} ans — ${cat.race || "Race non précisée"}</p>
            <p>${cat.description || ""}</p>
        `
    } catch(e) {
        document.getElementById("cat-info").innerHTML = "Erreur de chargement."
    }
}

// Soumettre le dossier
async function handleSubmit() {
    const application = {
        first_name: document.getElementById("first-name").value,
        last_name: document.getElementById("last-name").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        address: document.getElementById("address").value,
        housing_type: document.getElementById("housing-type").value,
        has_garden: document.getElementById("has-garden").checked,
        has_children: document.getElementById("has-children").checked,
        has_other_pets: document.getElementById("has-other-pets").checked,
        first_cat: document.getElementById("first-cat").checked,
        motivation: document.getElementById("motivation").value || null
    }

    // Validation simple
    if (!application.first_name || !application.last_name ||
        !application.email || !application.phone || !application.address) {
        alert("Merci de remplir tous les champs obligatoires.")
        return
    }

    try {
        await api.applyForCat(catId, application)
        document.getElementById("form-section").style.display = "none"
        document.getElementById("success").style.display = "block"
    } catch(e) {
        alert("Erreur lors de l'envoi du dossier. Veuillez réessayer.")
    }
}

loadCatInfo()