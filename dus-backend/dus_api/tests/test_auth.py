"""
Authentication API Tests
Covers: login, register, logout, device lock, password reset
"""
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from dus_api.models import User, Subscription
from django.utils import timezone
from datetime import timedelta


class AuthLoginTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            role='customer',
        )
        self.url = '/api/v1/auth/login/'

    def test_login_success(self):
        res = self.client.post(self.url, {'email': 'test@example.com', 'password': 'testpass123'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)
        self.assertIn('user', res.data)

    def test_login_wrong_password(self):
        res = self.client.post(self.url, {'email': 'test@example.com', 'password': 'wrong'})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_nonexistent_email(self):
        res = self.client.post(self.url, {'email': 'none@example.com', 'password': 'pass'})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_sets_device_token(self):
        self.client.post(self.url, {'email': 'test@example.com', 'password': 'testpass123'})
        self.user.refresh_from_db()
        self.assertIsNotNone(self.user.device_token)
        self.assertEqual(len(self.user.device_token), 64)

    def test_login_twice_changes_device_token(self):
        self.client.post(self.url, {'email': 'test@example.com', 'password': 'testpass123'})
        self.user.refresh_from_db()
        token1 = self.user.device_token
        self.client.post(self.url, {'email': 'test@example.com', 'password': 'testpass123'})
        self.user.refresh_from_db()
        token2 = self.user.device_token
        self.assertNotEqual(token1, token2)

    def test_login_inactive_user(self):
        self.user.is_active = False
        self.user.save()
        res = self.client.post(self.url, {'email': 'test@example.com', 'password': 'testpass123'})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class AuthRegisterTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = '/api/v1/auth/register/'

    def test_register_success(self):
        res = self.client.post(self.url, {
            'email': 'new@example.com',
            'first_name': 'Ahmet',
            'last_name': 'Yilmaz',
            'password': 'secure123',
            'password2': 'secure123',
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', res.data)
        self.assertTrue(User.objects.filter(email='new@example.com').exists())

    def test_register_creates_trial_subscription(self):
        self.client.post(self.url, {
            'email': 'new2@example.com',
            'first_name': 'Ali',
            'last_name': 'Veli',
            'password': 'secure123',
            'password2': 'secure123',
        })
        user = User.objects.get(email='new2@example.com')
        self.assertTrue(Subscription.objects.filter(user=user, plan='trial').exists())

    def test_register_duplicate_email(self):
        User.objects.create_user(email='dup@example.com', password='pass', first_name='X', last_name='Y')
        res = self.client.post(self.url, {
            'email': 'dup@example.com',
            'first_name': 'Z',
            'last_name': 'W',
            'password': 'secure123',
            'password2': 'secure123',
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_password_mismatch(self):
        res = self.client.post(self.url, {
            'email': 'mm@example.com',
            'first_name': 'A',
            'last_name': 'B',
            'password': 'secure123',
            'password2': 'different',
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_short_password(self):
        res = self.client.post(self.url, {
            'email': 'short@example.com',
            'first_name': 'A',
            'last_name': 'B',
            'password': '123',
            'password2': '123',
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class DeviceLockTests(TestCase):
    def setUp(self):
        self.client  = APIClient()
        self.client2 = APIClient()
        self.user = User.objects.create_user(
            email='device@example.com',
            password='pass1234',
            first_name='D',
            last_name='Lock',
            role='customer',
        )

    def _login(self, client):
        res = client.post('/api/v1/auth/login/', {
            'email': 'device@example.com', 'password': 'pass1234'
        })
        return res.data.get('access')

    def test_second_login_blocks_first_device(self):
        token1 = self._login(self.client)
        token2 = self._login(self.client2)  # noqa — second device

        # First device's token should now be rejected
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token1}')
        res = self.client.get('/api/v1/auth/me/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(res.data.get('code'), 'device_conflict')

    def test_current_device_still_works_after_second_login(self):
        self._login(self.client)
        token2 = self._login(self.client2)

        self.client2.credentials(HTTP_AUTHORIZATION=f'Bearer {token2}')
        res = self.client2.get('/api/v1/auth/me/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_logout_clears_device_token(self):
        # Log in and get a fresh token
        login_res = self.client.post('/api/v1/auth/login/', {
            'email': 'device@example.com', 'password': 'pass1234'
        })
        access_token  = login_res.data.get('access')
        refresh_token = login_res.data.get('refresh')

        # Use the same access token for logout
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        self.client.post('/api/v1/auth/logout/', {'refresh': refresh_token})
        self.user.refresh_from_db()
        self.assertIsNone(self.user.device_token)


class PasswordResetTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='reset@example.com', password='oldpass123',
            first_name='R', last_name='User'
        )

    def test_reset_request_always_returns_200(self):
        """Should not reveal whether email exists."""
        res = self.client.post('/api/v1/auth/password-reset/', {'email': 'nonexistent@x.com'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_reset_request_sets_token(self):
        self.client.post('/api/v1/auth/password-reset/', {'email': 'reset@example.com'})
        self.user.refresh_from_db()
        self.assertIsNotNone(self.user.device_token)
        self.assertTrue(self.user.device_token.startswith('reset:'))

    def test_reset_confirm_success(self):
        self.client.post('/api/v1/auth/password-reset/', {'email': 'reset@example.com'})
        self.user.refresh_from_db()
        token = self.user.device_token.replace('reset:', '')
        res = self.client.post('/api/v1/auth/password-reset-confirm/', {
            'email': 'reset@example.com',
            'token': token,
            'new_password': 'newpassword123',
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_reset_confirm_wrong_token(self):
        res = self.client.post('/api/v1/auth/password-reset-confirm/', {
            'email': 'reset@example.com',
            'token': 'wrongtoken',
            'new_password': 'newpassword123',
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
