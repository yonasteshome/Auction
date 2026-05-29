import re

from django.core import mail
from django.test import TestCase, override_settings
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import status
from rest_framework.test import APIClient

from users.models import User


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    FRONTEND_URL='http://localhost:3000',
    PASSWORD_RESET_FRONTEND_PATH='/reset-password',
)
class Week3UserAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='shopper@example.com',
            password='oldpass123',
            full_name='Shopper',
        )

    def test_me_patch_notification_preferences_and_onboarding(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.patch(
            '/api/users/me/',
            {
                'city': 'Adama',
                'notification_preferences': {
                    'price_alerts': True,
                    'budget_alerts': False,
                },
                'onboarding_completed': True,
            },
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['city'], 'Adama')
        self.assertTrue(res.data['notification_preferences']['price_alerts'])
        self.assertFalse(res.data['notification_preferences']['budget_alerts'])
        self.assertTrue(res.data['onboarding_completed'])
        self.user.refresh_from_db()
        self.assertTrue(self.user.onboarding_completed)

    def test_password_reset_request_sends_email_with_link(self):
        mail.outbox.clear()
        res = self.client.post(
            '/api/users/password/reset/request/',
            {'email': self.user.email},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        body = mail.outbox[0].body
        m = re.search(r'uid=([^&\s]+)&token=([\w-]+)', body)
        self.assertIsNotNone(m, msg=body)
        uid, token = m.group(1), m.group(2)

        confirm = self.client.post(
            '/api/users/password/reset/confirm/',
            {'uid': uid, 'token': token, 'new_password': 'newpass999'},
            format='json',
        )
        self.assertEqual(confirm.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpass999'))

    def test_password_reset_request_unknown_email_same_response(self):
        res = self.client.post(
            '/api/users/password/reset/request/',
            {'email': 'nobody@example.com'},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('account exists', res.data['detail'].lower())

    def test_password_reset_confirm_invalid_token(self):
        uid = urlsafe_base64_encode(force_bytes(str(self.user.pk)))
        res = self.client.post(
            '/api/users/password/reset/confirm/',
            {'uid': uid, 'token': 'invalid', 'new_password': 'newpass999'},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
