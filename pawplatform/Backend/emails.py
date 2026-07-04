import os

try:
    import resend
except ImportError:  # pragma: no cover - dépendance optionnelle
    resend = None

resend_api_key = os.getenv("RESEND_API_KEY")
if resend is not None:
    resend.api_key = resend_api_key


def send_application_status_email(to_email: str, cat_name: str, status: str, first_name: str):
    if status == "approuvé":
        subject = f"Bonne nouvelle pour l'adoption de {cat_name} 🎉"
        body = f"""
        <h2>Bonjour {first_name},</h2>
        <p>Nous avons le plaisir de vous informer que votre dossier d'adoption pour <strong>{cat_name}</strong> a été <strong>approuvé</strong> !</p>
        <p>L'association va vous recontacter prochainement pour organiser la suite (visite, paperasse, etc.).</p>
        <p>Merci pour votre engagement envers l'adoption animale 🐾</p>
        """
    else:
        subject = f"Réponse concernant votre dossier pour {cat_name}"
        body = f"""
        <h2>Bonjour {first_name},</h2>
        <p>Nous vous remercions pour votre intérêt envers <strong>{cat_name}</strong>.</p>
        <p>Après étude de votre dossier, nous ne pouvons malheureusement pas donner suite à votre candidature pour cette adoption.</p>
        <p>N'hésitez pas à consulter nos autres chats disponibles à l'adoption.</p>
        """

    if resend is None or not resend_api_key:
        print("Email non envoyé : dépendance resend indisponible ou clé absente")
        return False

    try:
        resend.Emails.send({
            "from": "PawPlatform <onboarding@resend.dev>",
            "to": [to_email],
            "subject": subject,
            "html": body
        })
        return True
    except Exception as e:
        print(f"Erreur envoi email: {e}")
        return False