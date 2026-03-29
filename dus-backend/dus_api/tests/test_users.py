"""
User management API Tests
Covers: CRUD, suspend/activate, grant_free_period, permissions
"""
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from dus_api.models import User, Subscription
from django.utils import timezone
from datetime import timedelta


def create_user(email, role='customer', **kwargs):
    return User.objects.create_user(
        email=email, password='pass1234',
        first_name='Test', last_name='User',
        role=role, **kwargs
    )


def get_token(client, email, password='pass1234'):
    res = client.post('/api/v1/auth/login/', {'email': email, 'password': password})
    return res.data.get('access')


class UserListPermissionsTests(TestCase):
    def setUp(self):
        self.client  = APIClient()
        self.admin   = create_user('admin@x.com', role='admin')
        self.support = create_user('support@x.com', role='support')
        self.trainer = create_user('trainer@x.com', role='trainer')
        self.customer = create_user('customer@x.com', role='customer')

    def _auth(self, user):
        token = get_token(self.client, user.email)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_admin_can_list_users(self):
        self._auth(self.admin)
        res = self.client.get('/api/v1/users/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_support_can_list_users(self):
        self._auth(self.support)
        res = self.client.get('/api/v1/users/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_trainer_cannot_list_users(self):
        self._auth(self.trainer)
        res = self.client.get('/api/v1/users/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_customer_cannot_list_users(self):
        self._auth(self.customer)
        res = self.client.get('/api/v1/users/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_list_users(self):
        res = self.client.get('/api/v1/users/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class UserCreateTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin  = create_user('admin@x.com', role='admin')
        token = get_token(self.client, 'admin@x.com')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_admin_can_create_user(self):
        res = self.client.post('/api/v1/users/', {
            'first_name': 'Yeni', 'last_name': 'User',
            'email': 'yeni@x.com', 'role': 'customer',
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='yeni@x.com').exists())

    def test_duplicate_email_rejected(self):
        create_user('existing@x.com')
        res = self.client.post('/api/v1/users/', {
            'first_name': 'A', 'last_name': 'B',
            'email': 'existing@x.com', 'role': 'customer',
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class UserSuspendActivateTests(TestCase):
    def setUp(self):
        self.client  = APIClient()
        self.admin   = create_user('admin@x.com', role='admin')
        self.target  = create_user('target@x.com', role='customer')
        token = get_token(self.client, 'admin@x.com')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_suspend_user(self):
        res = self.client.post(f'/api/v1/users/{self.target.id}/suspend/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.target.refresh_from_db()
        self.assertFalse(self.target.is_active)

    def test_activate_user(self):
        self.target.is_active = False
        self.target.save()
        res = self.client.post(f'/api/v1/users/{self.target.id}/activate/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.target.refresh_from_db()
        self.assertTrue(self.target.is_active)


class GrantFreePeriodTests(TestCase):
    def setUp(self):
        self.client  = APIClient()
        self.admin   = create_user('admin@x.com', role='admin')
        self.target  = create_user('target@x.com', role='customer')
        token = get_token(self.client, 'admin@x.com')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_grant_creates_subscription_when_none_exists(self):
        res = self.client.post(f'/api/v1/users/{self.target.id}/grant_free_period/', {
            'days': 7, 'plan': 'pro'
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(Subscription.objects.filter(user=self.target, plan='pro').exists())

    def test_grant_extends_existing_same_plan(self):
        sub = Subscription.objects.create(
            user=self.target, plan='pro', status='active',
            starts_at=timezone.now(),
            ends_at=timezone.now() + timedelta(days=10),
            price_paid=0,
        )
        original_ends = sub.ends_at
        res = self.client.post(f'/api/v1/users/{self.target.id}/grant_free_period/', {
            'days': 7, 'plan': 'pro'
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        sub.refresh_from_db()
        self.assertGreater(sub.ends_at, original_ends)

    def test_grant_different_plan_cancels_old(self):
        Subscription.objects.create(
            user=self.target, plan='standart', status='active',
            starts_at=timezone.now(),
            ends_at=timezone.now() + timedelta(days=10),
            price_paid=0,
        )
        self.client.post(f'/api/v1/users/{self.target.id}/grant_free_period/', {
            'days': 7, 'plan': 'pro'
        })
        self.assertTrue(Subscription.objects.filter(user=self.target, plan='pro', status='active').exists())
        self.assertTrue(Subscription.objects.filter(user=self.target, plan='standart', status='cancelled').exists())

    def test_grant_invalid_days(self):
        res = self.client.post(f'/api/v1/users/{self.target.id}/grant_free_period/', {
            'days': 999, 'plan': 'pro'
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_non_admin_cannot_grant(self):
        support = create_user('support@x.com', role='support')
        token = get_token(APIClient(), 'support@x.com')
        c = APIClient()
        c.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        res = c.post(f'/api/v1/users/{self.target.id}/grant_free_period/', {
            'days': 7, 'plan': 'pro'
        })
        self.assertIn(res.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_401_UNAUTHORIZED])
