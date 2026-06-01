import firebase_admin
from firebase_admin import credentials, messaging
from django.conf import settings
import logging
import os

logger = logging.getLogger(__name__)


class NotificationService:
    """
    Service pour envoyer des notifications push via Firebase Cloud Messaging
    """

    def __init__(self):
        try:
            if os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
                cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
                firebase_admin.initialize_app(cred)
                self.enabled = True
                logger.info("Firebase initialized successfully")
            else:
                logger.warning(f"Firebase credentials not found at {settings.FIREBASE_CREDENTIALS_PATH}")
                self.enabled = False
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {str(e)}")
            self.enabled = False

    def send_push(self, user, title: str, body: str, data: dict = None) -> bool:
        """
        Envoyer une notification push à un utilisateur

        Args:
            user: Instance User avec fcm_token
            title: Titre de la notification
            body: Corps de la notification
            data: Données supplémentaires (dict)

        Returns:
            bool: True si envoyé avec succès
        """
        if not self.enabled:
            logger.warning(f"Push notifications disabled. Would send to {user.username}: {title}")
            return False

        if not user.fcm_token:
            logger.info(f"User {user.username} has no FCM token")
            return False

        try:
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body
                ),
                data=data or {},
                token=user.fcm_token
            )

            response = messaging.send(message)
            logger.info(f"Push notification sent successfully to {user.username}. Response: {response}")
            return True

        except Exception as e:
            logger.error(f"Failed to send push notification to {user.username}: {str(e)}")
            return False

    def send_multicast(self, users, title: str, body: str, data: dict = None) -> dict:
        """
        Envoyer une notification push à plusieurs utilisateurs

        Args:
            users: Liste d'instances User avec fcm_token
            title: Titre de la notification
            body: Corps de la notification
            data: Données supplémentaires

        Returns:
            dict: {'success_count': int, 'failure_count': int}
        """
        if not self.enabled:
            logger.warning(f"Push notifications disabled. Would send to {len(users)} users: {title}")
            return {'success_count': 0, 'failure_count': len(users)}

        tokens = [user.fcm_token for user in users if user.fcm_token]

        if not tokens:
            logger.info("No valid FCM tokens found in user list")
            return {'success_count': 0, 'failure_count': 0}

        try:
            message = messaging.MulticastMessage(
                notification=messaging.Notification(
                    title=title,
                    body=body
                ),
                data=data or {},
                tokens=tokens
            )

            response = messaging.send_multicast(message)
            logger.info(f"Multicast sent: {response.success_count} success, {response.failure_count} failures")

            return {
                'success_count': response.success_count,
                'failure_count': response.failure_count
            }

        except Exception as e:
            logger.error(f"Failed to send multicast notification: {str(e)}")
            return {'success_count': 0, 'failure_count': len(tokens)}

    def send_missing_report_notification(self, user, clinic_name: str, date: str) -> bool:
        """Notification de rapport manquant"""
        return self.send_push(
            user,
            title="Rapport Manquant",
            body=f"Le rapport journalier du {date} n'a pas été soumis pour {clinic_name}",
            data={'type': 'missing_report', 'date': date}
        )

    def send_debt_reminder(self, user, debtor_name: str, amount: str) -> bool:
        """Notification de rappel de dette"""
        return self.send_push(
            user,
            title="Rappel Dette Patient",
            body=f"{debtor_name} doit {amount} HTG",
            data={'type': 'debt_reminder'}
        )

    def send_low_cash_alert(self, user, clinic_name: str, balance: str) -> bool:
        """Notification de trésorerie faible"""
        return self.send_push(
            user,
            title="Alerte Trésorerie",
            body=f"Trésorerie faible pour {clinic_name}: {balance} HTG",
            data={'type': 'low_cash'}
        )


# Instance globale
notification_service = NotificationService()
