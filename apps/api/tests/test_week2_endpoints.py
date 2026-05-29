from datetime import date

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from market.models import Item, PriceSubmission, VendorPrice
from users.models import User, Vendor


class Week2EndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='week2-user@example.com',
            password='pass12345',
            full_name='Week Two User',
            role='user',
        )
        self.admin = User.objects.create_user(
            email='week2-admin@example.com',
            password='pass12345',
            full_name='Week Two Admin',
            role='admin',
            is_staff=True,
        )
        self.item = Item.objects.create(name='Teff', category='Food', unit='kg')

    def test_items_list_and_detail(self):
        res = self.client.get('/api/market/items/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data[0]['name'], 'Teff')
        detail = self.client.get(f'/api/market/items/{self.item.id}/')
        self.assertEqual(detail.status_code, status.HTTP_200_OK)

    def test_register_login_me(self):
        reg = self.client.post(
            '/api/users/register/',
            {
                'full_name': 'New User',
                'email': 'new@example.com',
                'password': 'pass12345',
            },
            format='json',
        )
        self.assertEqual(reg.status_code, status.HTTP_201_CREATED)
        login = self.client.post(
            '/api/auth/token/',
            {'email': 'new@example.com', 'password': 'pass12345'},
            format='json',
        )
        self.assertEqual(login.status_code, status.HTTP_200_OK)
        token = login.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        me = self.client.get('/api/users/me/')
        self.assertEqual(me.status_code, status.HTTP_200_OK)
        self.client.credentials()

    def test_price_submit_and_averages(self):
        self.client.force_authenticate(user=self.user)
        s = self.client.post(
            '/api/market/prices/submit/',
            {
                'item_id': self.item.id,
                'price_value': '95.50',
                'market_location': 'Merkato',
                'city': 'Addis Ababa',
                'date_observed': date.today().isoformat(),
            },
            format='json',
        )
        self.assertEqual(s.status_code, status.HTTP_201_CREATED)
        PriceSubmission.objects.filter(id=s.data['id']).update(status='approved')
        avg = self.client.get('/api/market/prices/averages/', {'item_id': self.item.id})
        self.assertEqual(avg.status_code, status.HTTP_200_OK)
        self.assertTrue(len(avg.data) >= 1)

    def test_finance_budget_and_expense(self):
        self.client.force_authenticate(user=self.user)
        budget = self.client.post(
            '/api/finance/budgets/',
            {
                'month': 3,
                'year': 2026,
                'total_limit': '15000.00',
                'categories': [{'category_name': 'Food', 'limit_amount': '9000.00'}],
            },
            format='json',
        )
        self.assertEqual(budget.status_code, status.HTTP_201_CREATED)
        exp = self.client.post(
            '/api/finance/expenses/',
            {'category': 'Food', 'amount': '500.00', 'date': date.today().isoformat()},
            format='json',
        )
        self.assertEqual(exp.status_code, status.HTTP_201_CREATED)
        summary = self.client.get(f"/api/finance/budgets/{budget.data['id']}/summary/")
        self.assertEqual(summary.status_code, status.HTTP_200_OK)

    def test_ecommerce_recommendations_and_purchase(self):
        vendor_owner = User.objects.create_user(
            email='vendor-owner@example.com',
            password='pass12345',
            full_name='Vendor Owner',
            role='vendor',
        )
        vendor = Vendor.objects.create(owner=vendor_owner, shop_name='Shop A', city='Addis', is_verified=True)
        vp = VendorPrice.objects.create(vendor=vendor, item=self.item, price='100.00', is_verified=True)
        self.client.force_authenticate(user=self.user)
        rec = self.client.get('/api/ecommerce/recommendations/', {'item_id': self.item.id})
        self.assertEqual(rec.status_code, status.HTTP_200_OK)
        buy = self.client.post(
            '/api/ecommerce/purchases/',
            {'vendor_id': str(vendor.id), 'listing_id': vp.id, 'quantity': 2},
            format='json',
        )
        self.assertEqual(buy.status_code, status.HTTP_201_CREATED)

    def test_admin_submissions_requires_admin(self):
        self.client.force_authenticate(user=self.user)
        forbidden = self.client.get('/api/market/admin/submissions/')
        self.assertEqual(forbidden.status_code, status.HTTP_403_FORBIDDEN)
        self.client.force_authenticate(user=self.admin)
        ok = self.client.get('/api/market/admin/submissions/')
        self.assertEqual(ok.status_code, status.HTTP_200_OK)

    def test_admin_can_create_item(self):
        self.client.force_authenticate(user=self.user)
        forbidden = self.client.post(
            '/api/market/admin/items/',
            {'name': 'Sugar', 'category': 'Food', 'unit': 'kg'},
            format='json',
        )
        self.assertEqual(forbidden.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.admin)
        created = self.client.post(
            '/api/market/admin/items/',
            {'name': 'Sugar', 'category': 'Food', 'unit': 'kg'},
            format='json',
        )
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)
        self.assertEqual(created.data['name'], 'Sugar')

    def test_trends_forecasts_inflation(self):
        PriceSubmission.objects.create(
            user=self.user,
            item=self.item,
            price_value='88.00',
            market_location='Megenagna',
            city='Addis',
            date_observed=date.today(),
            status='approved',
        )
        t = self.client.get('/api/market/trends/', {'item_id': self.item.id})
        self.assertEqual(t.status_code, status.HTTP_200_OK)
        f = self.client.get('/api/market/forecasts/', {'item_id': self.item.id})
        self.assertEqual(f.status_code, status.HTTP_200_OK)
        i = self.client.get('/api/market/inflation/', {'item_id': self.item.id})
        self.assertEqual(i.status_code, status.HTTP_200_OK)

    def test_admin_users_list(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get('/api/users/admin/users/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
