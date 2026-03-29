"""
Subscription API Tests
Covers: create, cancel, auto-renewal command
"""
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from dus_api.models import User, Subscription
from django.utils import timezone
from datetime import timedelta
from io import StringIO
from django.core.management import call_command


def create_user(email, role='customer', **kwargs):
    return User.objects.create_user(
        email=email, password='pass1234',
        first_name='Test', last_name='User',
        role=role, **kwargs
    )


class SubscriptionCreateTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user   = create_user('sub@x.com')
        res = self.client.post('/api/v1/auth/login/', {'email': 'sub@x.com', 'password': 'pass1234'})
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {res.data["access"]}')

    def test_create_monthly_pro(self):
        res = self.client.post('/api/v1/subscriptions/', {'plan': 'pro', 'is_yearly': False})
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['plan'], 'pro')
        self.assertEqual(res.data['status'], 'active')
        # Should be ~30 days from now
        from datetime import datetime
        ends = datetime.fromisoformat(res.data['ends_at'].replace('Z', '+00:00'))
        diff = ends - timezone.now()
        self.assertAlmostEqual(diff.days, 29, delta=1)

    def test_create_trial(self):
        res = self.client.post('/api/v1/subscriptions/', {'plan': 'trial', 'is_yearly': False})
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['status'], 'trial')

    def test_create_yearly_pro(self):
        res = self.client.post('/api/v1/subscriptions/', {'plan': 'pro', 'is_yearly': True})
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        from datetime import datetime
        ends = datetime.fromisoformat(res.data['ends_at'].replace('Z', '+00:00'))
        diff = ends - timezone.now()
        self.assertAlmostEqual(diff.days, 364, delta=2)


class SubscriptionCancelTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user   = create_user('cancel@x.com')
        res = self.client.post('/api/v1/auth/login/', {'email': 'cancel@x.com', 'password': 'pass1234'})
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {res.data["access"]}')
        sub_res = self.client.post('/api/v1/subscriptions/', {'plan': 'pro', 'is_yearly': False})
        self.sub_id = sub_res.data['id']

    def test_cancel_subscription(self):
        res = self.client.post(f'/api/v1/subscriptions/{self.sub_id}/cancel/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        sub = Subscription.objects.get(pk=self.sub_id)
        self.assertEqual(sub.status, 'cancelled')


class CheckRenewalsCommandTests(TestCase):
    def setUp(self):
        self.user = create_user('renew@x.com')

    def _create_expiring_sub(self, auto_renew=True, plan='pro', hours_from_now=12):
        return Subscription.objects.create(
            user=self.user, plan=plan, status='active',
            starts_at=timezone.now() - timedelta(days=30),
            ends_at=timezone.now() + timedelta(hours=hours_from_now),
            price_paid=499,
            auto_renew=auto_renew,
        )

    def test_dry_run_does_not_create_new_sub(self):
        self._create_expiring_sub()
        count_before = Subscription.objects.count()
        call_command('check_renewals', '--dry-run', stdout=StringIO())
        self.assertEqual(Subscription.objects.count(), count_before)

    def test_renewal_creates_new_subscription(self):
        sub = self._create_expiring_sub()
        call_command('check_renewals', stdout=StringIO())
        # Old sub should be cancelled
        sub.refresh_from_db()
        self.assertEqual(sub.status, 'cancelled')
        # New sub should exist
        self.assertTrue(
            Subscription.objects.filter(user=self.user, status='active', plan='pro').exists()
        )

    def test_no_renewal_when_auto_renew_false(self):
        self._create_expiring_sub(auto_renew=False)
        count_before = Subscription.objects.count()
        call_command('check_renewals', stdout=StringIO())
        self.assertEqual(Subscription.objects.count(), count_before)

    def test_trial_not_renewed(self):
        Subscription.objects.create(
            user=self.user, plan='trial', status='trial',
            starts_at=timezone.now() - timedelta(days=3),
            ends_at=timezone.now() + timedelta(hours=2),
            price_paid=0, auto_renew=True,
        )
        count_before = Subscription.objects.count()
        call_command('check_renewals', stdout=StringIO())
        self.assertEqual(Subscription.objects.count(), count_before)
