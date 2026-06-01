from twilio.rest import Client
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class WhatsAppService:
    """
    Service pour envoyer des messages WhatsApp via Twilio
    """

    def __init__(self):
        if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
            logger.warning("Twilio credentials not configured. WhatsApp service disabled.")
            self.client = None
        else:
            self.client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

    def send_message(self, to: str, message: str) -> bool:
        """
        Envoyer un message WhatsApp

        Args:
            to: Numéro de téléphone avec format +50937123456
            message: Texte du message

        Returns:
            bool: True si envoyé avec succès, False sinon
        """
        if not self.client:
            logger.warning(f"WhatsApp service disabled. Would send to {to}: {message}")
            return False

        try:
            # S'assurer que le numéro commence par +
            if not to.startswith('+'):
                to = f'+{to}'

            message_obj = self.client.messages.create(
                body=message,
                from_=settings.TWILIO_WHATSAPP_FROM,
                to=f'whatsapp:{to}'
            )

            logger.info(f"WhatsApp message sent successfully to {to}. SID: {message_obj.sid}")
            return True

        except Exception as e:
            logger.error(f"Failed to send WhatsApp message to {to}: {str(e)}")
            return False

    def send_missing_report_alert(self, phone: str, clinic_name: str, date: str) -> bool:
        """
        Envoyer une alerte de rapport manquant

        Args:
            phone: Numéro de téléphone du manager
            clinic_name: Nom de la clinique
            date: Date du rapport manquant

        Returns:
            bool: True si envoyé
        """
        message = (
            f"⚠️ *VIDMED - Alerte Rapport Manquant*\n\n"
            f"Clinique: {clinic_name}\n"
            f"Date: {date}\n\n"
            f"Le rapport journalier n'a pas été soumis.\n"
            f"Veuillez le soumettre dès que possible."
        )
        return self.send_message(phone, message)

    def send_overdue_debt_alert(self, phone: str, debtor_name: str, amount: str, days_overdue: int) -> bool:
        """
        Envoyer une alerte de dette en retard

        Args:
            phone: Numéro de téléphone
            debtor_name: Nom du débiteur
            amount: Montant de la dette
            days_overdue: Nombre de jours de retard

        Returns:
            bool: True si envoyé
        """
        message = (
            f"⚠️ *VIDMED - Dette en Retard*\n\n"
            f"Débiteur: {debtor_name}\n"
            f"Montant: {amount} HTG\n"
            f"Retard: {days_overdue} jour(s)\n\n"
            f"Veuillez effectuer un suivi."
        )
        return self.send_message(phone, message)

    def send_low_cash_alert(self, phone: str, clinic_name: str, cash_balance: str) -> bool:
        """
        Envoyer une alerte de trésorerie faible

        Args:
            phone: Numéro de téléphone
            clinic_name: Nom de la clinique
            cash_balance: Solde actuel

        Returns:
            bool: True si envoyé
        """
        message = (
            f"⚠️ *VIDMED - Trésorerie Faible*\n\n"
            f"Clinique: {clinic_name}\n"
            f"Solde actuel: {cash_balance} HTG\n\n"
            f"Attention: La trésorerie est en dessous du seuil minimum."
        )
        return self.send_message(phone, message)

    def send_monthly_summary(self, phone: str, clinic_name: str, summary_data: dict) -> bool:
        """
        Envoyer un résumé mensuel

        Args:
            phone: Numéro de téléphone
            clinic_name: Nom de la clinique
            summary_data: Données du résumé (revenus, dépenses, solde)

        Returns:
            bool: True si envoyé
        """
        message = (
            f"📊 *VIDMED - Résumé Mensuel*\n\n"
            f"Clinique: {clinic_name}\n"
            f"Période: {summary_data.get('period', 'N/A')}\n\n"
            f"💰 Revenus: {summary_data.get('total_revenue', 0):,.0f} HTG\n"
            f"💸 Dépenses: {summary_data.get('total_expenses', 0):,.0f} HTG\n"
            f"📈 Résultat: {summary_data.get('net_result', 0):,.0f} HTG\n\n"
            f"Consultez l'application pour plus de détails."
        )
        return self.send_message(phone, message)


# Instance globale
whatsapp_service = WhatsAppService()
