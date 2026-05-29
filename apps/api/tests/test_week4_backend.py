from datetime import date

from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient

from ecommerce.models import Transaction
from market.models import Forecast, Item, PriceSubmission, VendorPrice
from users.models import AuditLog, Notification, User, Vendor


@override_settings(PAYMENT_WEBHOOK_SECRET='test-secret')
class Week4BackendTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            email='admin@example.com',
            password='pass12345',
            full_name='Admin',
            role='admin',
            is_staff=True,
        )
        self.user = User.objects.create_user(
            email='user@example.com',
            password='pass12345',
            full_name='User',
            role='user',
        )
        self.vendor_user = User.objects.create_user(
            email='vendor@example.com',
            password='pass12345',
            full_name='Vendor',
            role='vendor',
        )
        self.vendor = Vendor.objects.create(
            owner=self.vendor_user,
            shop_name='Vendor Shop',
            city='Addis',
            is_verified=True,
        )
        self.item = Item.objects.create(name='Oil', category='Food', unit='L')
        self.vendor_price = VendorPrice.objects.create(
            vendor=self.vendor,
            item=self.item,
            price='180.00',
            is_verified=True,
        )

    def test_purchase_webhook_and_status_flow(self):
        self.client.force_authenticate(user=self.user)
        buy = self.client.post(
            '/api/ecommerce/purchases/',
            {'vendor_id': str(self.vendor.id), 'listing_id': self.vendor_price.id, 'quantity': 1},
            format='json',
        )
        self.assertEqual(buy.status_code, status.HTTP_201_CREATED)
        tx_id = buy.data['id']
        ref = buy.data['reference']
        self.assertIn('/shop/payment/return', buy.data['payment_url'])

        webhook = self.client.post(
            '/api/ecommerce/webhooks/payment/',
            {'reference': ref, 'status': 'success', 'gateway_reference': 'gw-123'},
            format='json',
            HTTP_X_WEBHOOK_SECRET='test-secret',
        )
        self.assertEqual(webhook.status_code, status.HTTP_200_OK)
        tx = Transaction.objects.get(id=tx_id)
        self.assertEqual(tx.status, 'paid')
        self.assertEqual(tx.payment_reference, 'gw-123')

        self.client.force_authenticate(user=self.vendor_user)
        shipped = self.client.patch(
            f'/api/ecommerce/purchases/{tx_id}/status/',
            {'status': 'shipped'},
            format='json',
        )
        self.assertEqual(shipped.status_code, status.HTTP_200_OK)
        delivered = self.client.patch(
            f'/api/ecommerce/purchases/{tx_id}/status/',
            {'status': 'delivered'},
            format='json',
        )
        self.assertEqual(delivered.status_code, status.HTTP_200_OK)
        tx.refresh_from_db()
        self.assertEqual(tx.status, 'delivered')
        self.assertTrue(Notification.objects.filter(user=self.user, type='delivery_update').exists())

    def test_admin_settings_and_audit(self):
        self.client.force_authenticate(user=self.admin)
        patch = self.client.patch(
            '/api/admin/settings/',
            {'key': 'alert_thresholds', 'value': {'price_spike': 20}},
            format='json',
        )
        self.assertEqual(patch.status_code, status.HTTP_200_OK)
        get_settings = self.client.get('/api/admin/settings/')
        self.assertEqual(get_settings.status_code, status.HTTP_200_OK)
        self.assertTrue(len(get_settings.data) >= 1)
        audit = self.client.get('/api/admin/audit/')
        self.assertEqual(audit.status_code, status.HTTP_200_OK)
        self.assertTrue(AuditLog.objects.filter(action='admin_setting_patch').exists())

    def test_admin_ml_retrain_and_status(self):
        PriceSubmission.objects.create(
            user=self.user,
            item=self.item,
            price_value='170.00',
            market_location='Merkato',
            city='Addis',
            date_observed=date.today(),
            status='approved',
        )
        self.client.force_authenticate(user=self.admin)
        retrain = self.client.post('/api/admin/ml/retrain/', {'forecast_weeks': 3}, format='json')
        self.assertEqual(retrain.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(Forecast.objects.filter(item=self.item).count(), 3)
        status_res = self.client.get('/api/admin/ml/status/')
        self.assertEqual(status_res.status_code, status.HTTP_200_OK)
        self.assertIn('model_used', status_res.data)

    def test_pdf_export_and_budget_warning_notification(self):
        self.client.force_authenticate(user=self.user)
        budget = self.client.post(
            '/api/finance/budgets/',
            {
                'month': date.today().month,
                'year': date.today().year,
                'total_limit': '1000.00',
                'categories': [{'category_name': 'Food', 'limit_amount': '500.00'}],
            },
            format='json',
        )
        self.assertEqual(budget.status_code, status.HTTP_201_CREATED)
        exp = self.client.post(
            '/api/finance/expenses/',
            {'category': 'Food', 'amount': '450.00', 'date': date.today().isoformat()},
            format='json',
        )
        self.assertEqual(exp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Notification.objects.filter(user=self.user, type='budget_warning').exists())
        pdf = self.client.get('/api/finance/export/', {'format': 'pdf'})
        self.assertEqual(pdf.status_code, status.HTTP_200_OK)
        self.assertEqual(pdf['Content-Type'], 'application/pdf')
