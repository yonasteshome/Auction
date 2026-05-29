from django.urls import reverse

from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from .models import User


class AdminUserSuspendViewTests(APITestCase):
	def setUp(self):
		self.client = APIClient()
		self.admin = User.objects.create_user(
			email='admin@example.com',
			password='adminpass123',
			full_name='Admin User',
			role='admin',
			is_staff=True,
		)
		self.target = User.objects.create_user(
			email='target@example.com',
			password='userpass123',
			full_name='Target User',
		)

	def test_admin_can_suspend_user_account(self):
		self.client.force_authenticate(user=self.admin)

		response = self.client.post(
			reverse('users:admin-user-suspend', kwargs={'pk': self.target.pk}),
			{'reason': 'Policy violation'},
			format='json',
		)

		self.target.refresh_from_db()

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertFalse(self.target.is_active)
		self.assertEqual(response.data['detail'], 'User account suspended.')

	def test_admin_cannot_suspend_their_own_account(self):
		self.client.force_authenticate(user=self.admin)

		response = self.client.post(
			reverse('users:admin-user-suspend', kwargs={'pk': self.admin.pk}),
			{'reason': 'Self suspend'},
			format='json',
		)

		self.admin.refresh_from_db()

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertTrue(self.admin.is_active)

	def test_admin_can_restore_user_account(self):
		self.client.force_authenticate(user=self.admin)
		self.target.is_active = False
		self.target.save(update_fields=['is_active'])

		response = self.client.post(
			reverse('users:admin-user-restore', kwargs={'pk': self.target.pk}),
			{'reason': 'Issue resolved'},
			format='json',
		)

		self.target.refresh_from_db()

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(self.target.is_active)
		self.assertEqual(response.data['detail'], 'User account restored.')

	def test_admin_user_stats_endpoint_returns_counts(self):
		self.client.force_authenticate(user=self.admin)
		User.objects.create_user(
			email='active-shopper@example.com',
			password='userpass123',
			full_name='Active Shopper',
			role='user',
		)
		User.objects.create_user(
			email='active-vendor@example.com',
			password='vendorpass123',
			full_name='Active Vendor',
			role='vendor',
		)
		User.objects.create_user(
			email='suspended-user@example.com',
			password='suspendpass123',
			full_name='Suspended User',
			role='user',
			is_active=False,
		)

		response = self.client.get(reverse('users:admin-user-stats'))

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['total_users'], 5)
		self.assertEqual(response.data['active_shoppers'], 1)
		self.assertEqual(response.data['active_vendors'], 1)
		self.assertEqual(response.data['suspended_users'], 1)
