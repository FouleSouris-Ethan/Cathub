// Cette page est publique — pas besoin de token
// Mais on a besoin de l'org_id dans l'URL
// Ex: cats.html?org=XXXX

const params = new URLSearchParams(window.location.search)
const orgId = params.get("org")

if (!orgId) {
    document.getElementById("cats-grid").innerHTML =
        `<p class="empty">Lien invalide — aucune association trouvée.</p>`
}

async function loadPublicCats() {
    try {
        const cats = await api.getCats(orgId)
        const available = cats.filter(c => c.status === "disponible")
        const grid = document.getElementById("cats-grid")

        if (available.length === 0) {
            grid.innerHTML = `<p class="empty">Aucun chat disponible pour le moment.</p>`
            return
        }

        grid.innerHTML = available.map(cat => `
            <div class="cat-card">
                <h3>🐱 ${cat.name}</h3>
                <span class="badge disponible">Disponible</span>
                <p><strong>Âge :</strong> ${cat.age} ans</p>
                <p><strong>Race :</strong> ${cat.race || "Non précisée"}</p>
                <p><strong>Description :</strong> ${cat.description || "Non précisée"}</p>
                <a class="btn-primary" href="apply.html?cat=${cat.id}&org=${orgId}">
                    Adopter ${cat.name}
                </a>
            </div>
        `).join("")
    } catch(e) {
        document.getElementById("cats-grid").innerHTML =
            `<p class="empty">Erreur de chargement.</p>`
    }
}

loadPublicCats()
