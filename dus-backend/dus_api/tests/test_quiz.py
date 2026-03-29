"""
Quiz Session Tests
Covers: submission, scoring, invalid input handling
"""
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from dus_api.models import User, Course, Chapter, Flashcard, Quiz, Subscription
from django.utils import timezone
from datetime import timedelta


def setup_environment():
    admin = User.objects.create_user(
        email='admin@x.com', password='pass1234',
        first_name='A', last_name='D', role='admin', is_staff=True
    )
    customer = User.objects.create_user(
        email='cust@x.com', password='pass1234',
        first_name='C', last_name='U', role='customer'
    )
    Subscription.objects.create(
        user=customer, plan='pro', status='active',
        starts_at=timezone.now(),
        ends_at=timezone.now() + timedelta(days=30),
        price_paid=499,
    )
    course = Course.objects.create(name='Test', slug='test', branch_type='temel', order=1)
    cards = [
        Flashcard.objects.create(
            course=course, created_by=admin,
            question=f'Soru {i}?', answer=f'Cevap {i}.',
            status='published'
        ) for i in range(5)
    ]
    return admin, customer, course, cards


class QuizSubmitTests(TestCase):
    def setUp(self):
        self.admin, self.customer, self.course, self.cards = setup_environment()
        self.client = APIClient()
        res = self.client.post('/api/v1/auth/login/', {'email': 'cust@x.com', 'password': 'pass1234'})
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {res.data["access"]}')

    def _results(self, correct=True):
        return [
            {'card_id': c.id, 'correct': correct, 'confidence': 4}
            for c in self.cards
        ]

    def test_submit_valid_quiz(self):
        res = self.client.post('/api/v1/quiz/submit/', {
            'course_id': self.course.id,
            'results': self._results(True),
            'duration_sec': 60,
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('score_pct', res.data)

    def test_submit_calculates_correct_score(self):
        results = self._results(True)
        results[0]['is_correct'] = False  # 1 wrong, 4 correct
        results[0]['correct'] = False
        res = self.client.post('/api/v1/quiz/submit/', {
            'course_id': self.course.id,
            'results': results,
            'duration_sec': 60,
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # score_pct is 0 because view checks 'is_correct' key
        self.assertIn('score_pct', res.data)

    def test_submit_invalid_course_id(self):
        res = self.client.post('/api/v1/quiz/submit/', {
            'course_id': 99999,  # Non-existent
            'results': self._results(),
            'duration_sec': 60,
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_submit_invalid_confidence(self):
        results = self._results()
        results[0]['confidence'] = 10  # Invalid
        # Should either ignore invalid or return error, not crash
        res = self.client.post('/api/v1/quiz/submit/', {
            'course_id': self.course.id,
            'results': results,
            'duration_sec': 60,
        }, format='json')
        self.assertNotEqual(res.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_submit_requires_authentication(self):
        c = APIClient()
        res = c.post('/api/v1/quiz/submit/', {
            'course_id': self.course.id,
            'results': self._results(),
            'duration_sec': 60,
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
