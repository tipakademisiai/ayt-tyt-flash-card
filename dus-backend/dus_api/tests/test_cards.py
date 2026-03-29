"""
Flashcard and SRS Tests
Covers: card CRUD, confidence rating, SRS algorithm, progress tracking
"""
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from dus_api.models import User, Course, Chapter, Flashcard, UserCardProgress, Subscription
from django.utils import timezone
from datetime import timedelta


def create_admin():
    return User.objects.create_user(
        email='admin@x.com', password='pass1234',
        first_name='Admin', last_name='User', role='admin', is_staff=True
    )


def create_customer(email='cust@x.com'):
    u = User.objects.create_user(
        email=email, password='pass1234',
        first_name='Cust', last_name='User', role='customer'
    )
    Subscription.objects.create(
        user=u, plan='pro', status='active',
        starts_at=timezone.now(),
        ends_at=timezone.now() + timedelta(days=30),
        price_paid=499,
    )
    return u


def create_course():
    return Course.objects.create(
        name='Test Dersi', slug='test-dersi',
        branch_type='temel', order=1
    )


def create_card(course, created_by, status='published'):
    return Flashcard.objects.create(
        course=course, created_by=created_by,
        question='Test sorusu?', answer='Test cevabı.',
        status=status
    )


def get_token(email, password='pass1234'):
    c = APIClient()
    res = c.post('/api/v1/auth/login/', {'email': email, 'password': password})
    return res.data.get('access')


class SRSAlgorithmTests(TestCase):
    """Unit tests for the SM-2 SRS algorithm in UserCardProgress."""

    def setUp(self):
        self.user   = create_customer()
        self.course = create_course()
        self.card   = create_card(self.course, self.user)
        self.progress = UserCardProgress.objects.create(
            user=self.user, card=self.card
        )

    def test_low_confidence_resets_interval(self):
        """Confidence 1-2 should reset interval to 1 day."""
        self.progress.interval = 10
        self.progress.save()
        self.progress.update_srs(1)
        self.progress.refresh_from_db()
        self.assertEqual(self.progress.interval, 1)

    def test_high_confidence_increases_interval(self):
        """Confidence 4-5 should increase interval."""
        self.progress.update_srs(5)
        self.progress.refresh_from_db()
        self.assertGreater(self.progress.interval, 1)

    def test_invalid_confidence_raises(self):
        """Confidence outside 1-5 should raise ValueError."""
        with self.assertRaises(ValueError):
            self.progress.update_srs(0)
        with self.assertRaises(ValueError):
            self.progress.update_srs(6)

    def test_interval_capped_at_365(self):
        """Interval should never exceed 365 days."""
        self.progress.interval = 360
        self.progress.ease_factor = 2.5
        self.progress.save()
        self.progress.update_srs(5)
        self.progress.refresh_from_db()
        self.assertLessEqual(self.progress.interval, 365)

    def test_ease_factor_minimum(self):
        """Ease factor should never go below 1.3."""
        self.progress.ease_factor = 1.35
        self.progress.save()
        for _ in range(10):
            self.progress.refresh_from_db()
            self.progress.update_srs(1)
        self.progress.refresh_from_db()
        self.assertGreaterEqual(self.progress.ease_factor, 1.3)

    def test_next_review_set_correctly(self):
        """next_review should be in the future after update."""
        self.progress.update_srs(4)
        self.progress.refresh_from_db()
        self.assertGreater(self.progress.next_review, timezone.now())

    def test_last_reviewed_set(self):
        """last_reviewed should be set after rating."""
        self.assertIsNone(self.progress.last_reviewed)
        self.progress.update_srs(3)
        self.progress.refresh_from_db()
        self.assertIsNotNone(self.progress.last_reviewed)


class CardRatingAPITests(TestCase):
    """API tests for card rating endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.admin  = create_admin()
        self.user   = create_customer()
        self.course = create_course()
        self.card   = create_card(self.course, self.admin)
        token = get_token('cust@x.com')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_rate_card_valid_confidence(self):
        res = self.client.post(f'/api/v1/cards/{self.card.id}/rate/', {'confidence': 4})
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_rate_card_invalid_confidence_below_range(self):
        res = self.client.post(f'/api/v1/cards/{self.card.id}/rate/', {'confidence': 0})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_rate_card_invalid_confidence_above_range(self):
        res = self.client.post(f'/api/v1/cards/{self.card.id}/rate/', {'confidence': 6})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_rate_card_creates_progress_record(self):
        self.client.post(f'/api/v1/cards/{self.card.id}/rate/', {'confidence': 3})
        self.assertTrue(
            UserCardProgress.objects.filter(user=self.user, card=self.card).exists()
        )

    def test_rate_card_updates_existing_progress(self):
        self.client.post(f'/api/v1/cards/{self.card.id}/rate/', {'confidence': 2})
        self.client.post(f'/api/v1/cards/{self.card.id}/rate/', {'confidence': 5})
        count = UserCardProgress.objects.filter(user=self.user, card=self.card).count()
        self.assertEqual(count, 1)


class CardCRUDPermissionTests(TestCase):
    """Ensures only trainers/admins can create cards; customers can only read."""

    def setUp(self):
        self.admin   = create_admin()
        self.trainer = User.objects.create_user(
            email='trainer@x.com', password='pass1234',
            first_name='T', last_name='R', role='trainer'
        )
        self.customer = create_customer()
        self.course   = create_course()

    def _client(self, email):
        c = APIClient()
        token = get_token(email)
        c.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        return c

    def _card_data(self):
        return {
            'course': self.course.id,
            'question': 'Soru?',
            'answer': 'Cevap.',
            'card_type': 'qa',
        }

    def test_trainer_can_create_card(self):
        c = self._client('trainer@x.com')
        res = c.post('/api/v1/cards/', self._card_data())
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_customer_cannot_create_card(self):
        c = self._client('cust@x.com')
        res = c.post('/api/v1/cards/', self._card_data())
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_approve_card(self):
        card = create_card(self.course, self.trainer, status='pending')
        c = self._client('admin@x.com')
        res = c.post(f'/api/v1/cards/{card.id}/approve/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        card.refresh_from_db()
        self.assertEqual(card.status, 'published')
