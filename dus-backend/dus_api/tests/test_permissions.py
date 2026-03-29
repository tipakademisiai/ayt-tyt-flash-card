"""
Permission and Role-Based Access Control Tests
"""
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from dus_api.models import User, Course, Subscription
from django.utils import timezone
from datetime import timedelta


def make_user(email, role, **kwargs):
    return User.objects.create_user(
        email=email, password='pass1234',
        first_name='T', last_name='U', role=role, **kwargs
    )


def auth_client(email, password='pass1234'):
    c = APIClient()
    res = c.post('/api/v1/auth/login/', {'email': email, 'password': password})
    c.credentials(HTTP_AUTHORIZATION=f'Bearer {res.data["access"]}')
    return c


class RoleAccessTests(TestCase):
    def setUp(self):
        self.admin    = make_user('admin@x.com',    'admin',    is_staff=True)
        self.trainer  = make_user('trainer@x.com',  'trainer')
        self.support  = make_user('support@x.com',  'support')
        self.customer = make_user('customer@x.com', 'customer')
        Subscription.objects.create(
            user=self.customer, plan='pro', status='active',
            starts_at=timezone.now(),
            ends_at=timezone.now() + timedelta(days=30),
            price_paid=499,
        )

    def test_only_admin_can_delete_user(self):
        target = make_user('target@x.com', 'customer')
        # Support cannot delete
        c = auth_client('support@x.com')
        res = c.delete(f'/api/v1/users/{target.id}/')
        self.assertIn(res.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_401_UNAUTHORIZED])

    def test_admin_can_delete_user(self):
        target = make_user('del@x.com', 'customer')
        c = auth_client('admin@x.com')
        res = c.delete(f'/api/v1/users/{target.id}/')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)

    def test_me_endpoint_returns_own_data(self):
        c = auth_client('customer@x.com')
        res = c.get('/api/v1/auth/me/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['email'], 'customer@x.com')

    def test_customer_subscription_in_own_list(self):
        c = auth_client('customer@x.com')
        res = c.get('/api/v1/subscriptions/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # Should only see own subscriptions
        emails = [s.get('user_email') for s in res.data.get('results', [])]
        for e in emails:
            self.assertEqual(e, 'customer@x.com')

    def test_admin_sees_all_subscriptions(self):
        c = auth_client('admin@x.com')
        res = c.get('/api/v1/subscriptions/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
