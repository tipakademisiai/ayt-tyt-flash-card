"""
DUS Akademisi API view katmanı.

ViewSet / View sınıflarına genel bakış:
- LoginView, RegisterView, LogoutView, MeView: JWT kimlik doğrulama akışı
- PasswordResetRequestView, PasswordResetConfirmView: Şifre sıfırlama
- UserViewSet: Kullanıcı CRUD, askıya alma/aktive etme, ücretsiz süre tanımlama
- TrainerViewSet: Salt okunur eğitmen listesi
- SubscriptionViewSet: Abonelik oluşturma ve iptal
- CourseViewSet: Salt okunur ders (kitap) listesi
- FlashcardViewSet: Kart CRUD, onay/red, SRS puanlama, AI soru üretimi
- UserCardProgressView: Kullanıcı kart ilerleme durumu
- QuizViewSet: Quiz yönetimi ve sonuç gönderme
- QuestionViewSet: Eğitmen-öğrenci soru-cevap sistemi
- NotificationViewSet: Bildirim gönderme
- GenerateCardsView: AI destekli kart üretimi (Pro)
- LibraryDocumentViewSet: PDF kütüphanesi ve belgeden kart üretimi
- DUSExamQuestionViewSet: Geçmiş DUS sınav soruları
- ImageCardViewSet: Görsel hafıza kartları (Pro)
- UserActivityViewSet: Kullanıcı eylem kaydı ve özeti
- ReportView: Platform geneli raporlar
"""

import logging
import json

from rest_framework import generics, status, viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.conf import settings
from django.db import transaction
from datetime import timedelta
import anthropic

logger = logging.getLogger(__name__)

from dus_api.authentication import generate_device_token

from dus_api.models import (
    User, Subscription, Course, Chapter,
    Flashcard, UserCardProgress,
    Quiz, QuizSession, Question,
    Notification, TrainerCommission,
    LibraryDocument, DUSExamQuestion,
    ImageCard, UserActivity,
)
from dus_api.serializers.serializers import (
    LoginSerializer, RegisterSerializer,
    UserSerializer, UserListSerializer, UserCreateSerializer, TrainerSerializer,
    SubscriptionSerializer, CreateSubscriptionSerializer,
    CourseSerializer, ChapterSerializer,
    FlashcardSerializer, FlashcardListSerializer, UserCardProgressSerializer,
    QuizSerializer, QuizSessionSerializer, QuizSubmitSerializer,
    QuestionSerializer, AnswerQuestionSerializer,
    NotificationSerializer,
    TrainerCommissionSerializer,
    GenerateCardsSerializer,
    LibraryDocumentSerializer,
    DUSExamQuestionSerializer,
    ImageCardSerializer,
    UserActivitySerializer,
)
from dus_api.permissions.permissions import (
    IsAdmin, IsTrainer, IsSupport, IsCustomer,
    IsAdminOrSupport, IsAdminOrTrainer, IsStaff,
    IsOwnerOrAdmin, IsTrainerOwnerOrAdmin,
    HasActiveSubscription, HasAIAccess,
)


# ── AUTH VIEWS ────────────────────────────────────────────────────────────────

class LoginView(generics.GenericAPIView):
    """
    POST /api/v1/auth/login/
    Body: {email, password}
    Response: {access, refresh, user: {id, email, role, ...}}
    """
    permission_classes = [AllowAny]
    serializer_class   = LoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        # Yeni cihaz token'ı oluştur — önceki cihazı geçersiz kılar
        device_token = generate_device_token()
        user.device_token = device_token
        user.last_login   = timezone.now()
        user.save(update_fields=['last_login', 'device_token'])

        refresh = RefreshToken.for_user(user)
        refresh['role']         = user.role
        refresh['branch']       = user.branch or ''
        refresh['device_token'] = device_token  # JWT'ye gömülür

        return Response({
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
            'user':    UserSerializer(user, context={'request': request}).data,
        })


class RegisterView(generics.CreateAPIView):
    """POST /api/v1/auth/register/"""
    permission_classes = [AllowAny]
    serializer_class   = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # 3 günlük trial başlat
        Subscription.objects.create(
            user=user,
            plan='trial',
            status='trial',
            starts_at=timezone.now(),
            ends_at=timezone.now() + timedelta(days=3),
            price_paid=0,
        )
        user.subscription = 'trial'
        user.trial_ends_at = timezone.now() + timedelta(days=3)
        user.save()

        device_token = generate_device_token()
        user.device_token = device_token
        user.save(update_fields=['device_token'])

        refresh = RefreshToken.for_user(user)
        refresh['role']         = user.role
        refresh['branch']       = user.branch or ''
        refresh['device_token'] = device_token

        return Response({
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
            'user':    UserSerializer(user, context={'request': request}).data,
            'message': '3 günlük deneme başlatıldı!',
        }, status=status.HTTP_201_CREATED)


class LogoutView(generics.GenericAPIView):
    """POST /api/v1/auth/logout/ — refresh token'ı blacklist'e al"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            pass  # Token zaten geçersizse sorun değil

        # Cihaz tokenını temizle — bu cihazdan çıkış yapıldı
        request.user.device_token = None
        request.user.save(update_fields=['device_token'])

        return Response({'message': 'Çıkış başarılı.'})


class MeView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/v1/auth/me/ — mevcut kullanıcı"""
    permission_classes = [IsAuthenticated]
    serializer_class   = UserSerializer

    def get_object(self):
        return self.request.user


class PasswordResetRequestView(generics.GenericAPIView):
    """
    POST /api/v1/auth/password-reset/
    Body: { email }
    Sends password reset email with token link.
    Currently logs the token; TODO: integrate real email service.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """Kullanıcıya şifre sıfırlama token'ı üret ve e-posta gönder."""
        email = request.data.get('email', '').strip()
        if not email:
            return Response({'error': 'E-posta adresi gereklidir.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(email=email)
            # Generate a secure token
            import secrets
            token = secrets.token_urlsafe(48)
            # Store hashed token on user (reuse device_token field as temp store)
            # In production: use a dedicated PasswordResetToken model
            user.device_token = f'reset:{token}'
            user.save(update_fields=['device_token'])
            # TODO: Send actual email via Django email backend
            logger.info(f'Password reset token for {email}: {token}')
        except User.DoesNotExist:
            pass  # Don't reveal whether email exists
        # Always return success to prevent email enumeration
        return Response({'message': 'Şifre sıfırlama talimatları e-posta adresinize gönderildi.'})


class PasswordResetConfirmView(generics.GenericAPIView):
    """
    POST /api/v1/auth/password-reset-confirm/
    Body: { email, token, new_password }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """Verilen token ile şifreyi güncelle."""
        email        = request.data.get('email', '').strip()
        token        = request.data.get('token', '').strip()
        new_password = request.data.get('new_password', '')

        if not all([email, token, new_password]):
            return Response({'error': 'Tüm alanlar zorunludur.'}, status=status.HTTP_400_BAD_REQUEST)
        if len(new_password) < 8:
            return Response({'error': 'Şifre en az 8 karakter olmalı.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            if user.device_token != f'reset:{token}':
                return Response({'error': 'Geçersiz veya süresi dolmuş token.'}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(new_password)
            user.device_token = None  # Token single-use
            user.save(update_fields=['password', 'device_token'])
            return Response({'message': 'Şifreniz başarıyla güncellendi.'})
        except User.DoesNotExist:
            return Response({'error': 'Geçersiz istek.'}, status=status.HTTP_400_BAD_REQUEST)


# ── USER VIEWS ────────────────────────────────────────────────────────────────

class UserViewSet(viewsets.ModelViewSet):
    """
    GET    /api/v1/users/           — Liste (admin/support)
    GET    /api/v1/users/{id}/      — Detay
    PATCH  /api/v1/users/{id}/      — Güncelle
    DELETE /api/v1/users/{id}/      — Sil (admin only)
    POST   /api/v1/users/{id}/suspend/ — Askıya al
    POST   /api/v1/users/{id}/activate/ — Aktive et
    """
    queryset         = User.objects.all().order_by('-date_joined')
    filter_backends  = [filters.SearchFilter, filters.OrderingFilter]
    search_fields    = ['email', 'first_name', 'last_name']
    ordering_fields  = ['date_joined', 'last_login', 'role']

    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAdminOrSupport()]
        if self.action in ['destroy']:
            return [IsAdmin()]
        if self.action == 'create':
            return [IsAdminOrSupport()]
        if self.action in ['grant_free_period', 'reset_password']:
            return [IsAdmin()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        """Admin panelinden yeni kullanıcı oluştur, geçici şifre ata."""
        import secrets, string
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Güvenli geçici şifre üret
        alphabet = string.ascii_letters + string.digits
        tmp_password = ''.join(secrets.choice(alphabet) for _ in range(12))

        user = User.objects.create_user(
            email      = data['email'],
            password   = tmp_password,
            first_name = data['first_name'],
            last_name  = data.get('last_name', ''),
            role       = data.get('role', 'customer'),
        )
        # TODO: gerçek mail gönderimi — tmp_password ile aktivasyon linki

        return Response(UserListSerializer(user).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrSupport])
    def suspend(self, request, pk=None):
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({'message': f'{user.full_name} askıya alındı.'})

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrSupport])
    def activate(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({'message': f'{user.full_name} aktive edildi.'})

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def reset_password(self, request, pk=None):
        user = self.get_object()
        # TODO: email ile şifre sıfırlama linki gönder
        return Response({'message': f'{user.email} adresine şifre sıfırlama maili gönderildi.'})

    @action(detail=True, methods=['post'], url_path='grant_free_period', permission_classes=[IsAdmin])
    def grant_free_period(self, request, pk=None):
        """
        Kullanıcıya belirli bir paketi ücretsiz olarak hediye et.
        Body: { days: int, plan: 'pro'|'standart'|'baslangic'|'trial' }

        - Kullanıcının zaten aynı aktif planı varsa süresini uzatır.
        - Farklı plan seçildiyse mevcut aboneliği iptal edip yeni oluşturur.
        """
        user = self.get_object()

        VALID_PLANS = ['pro', 'standart', 'baslangic', 'trial']
        PLAN_LABELS = {'pro': 'Pro', 'standart': 'Standart',
                       'baslangic': 'Başlangıç', 'trial': 'Deneme'}

        try:
            days = int(request.data.get('days', 7))
        except (ValueError, TypeError):
            return Response({'error': 'Geçersiz gün sayısı.'}, status=status.HTTP_400_BAD_REQUEST)
        if days < 1 or days > 365:
            return Response({'error': 'Gün sayısı 1-365 arasında olmalı.'}, status=status.HTTP_400_BAD_REQUEST)

        plan = request.data.get('plan', 'trial')
        if plan not in VALID_PLANS:
            return Response({'error': f'Geçersiz plan: {plan}'}, status=status.HTTP_400_BAD_REQUEST)

        # Mevcut aktif aboneliği bul
        existing = (user.subscriptions
                    .filter(status__in=['active', 'trial'])
                    .order_by('-ends_at')
                    .first())

        if existing and existing.plan == plan:
            # Aynı plan → sadece süreyi uzat
            existing.ends_at = existing.ends_at + timedelta(days=days)
            existing.save()
            sub = existing
            msg = (f'{PLAN_LABELS[plan]} paketi {days} gün uzatıldı. '
                   f'Yeni bitiş: {sub.ends_at.strftime("%d.%m.%Y")}')
        else:
            # Farklı plan veya abonelik yok → mevcut aboneliği iptal et, yeni oluştur
            if existing:
                existing.status = 'cancelled'
                existing.save()

            sub = Subscription.objects.create(
                user=user,
                plan=plan,
                status='active' if plan != 'trial' else 'trial',
                starts_at=timezone.now(),
                ends_at=timezone.now() + timedelta(days=days),
                price_paid=0,
                auto_renew=False,
            )
            user.subscription = plan
            user.save(update_fields=['subscription'])
            msg = (f'{days} günlük {PLAN_LABELS[plan]} paketi tanımlandı. '
                   f'Bitiş: {sub.ends_at.strftime("%d.%m.%Y")}')

        from dus_api.serializers.serializers import SubscriptionSerializer
        return Response({'message': msg, 'subscription': SubscriptionSerializer(sub).data})


class TrainerViewSet(viewsets.ReadOnlyModelViewSet):
    """GET /api/v1/users/trainers/ — Eğitmen listesi"""
    queryset         = User.objects.filter(role='trainer', is_active=True)
    serializer_class = TrainerSerializer
    permission_classes = [IsAdminOrSupport]


# ── SUBSCRIPTION VIEWS ────────────────────────────────────────────────────────

class SubscriptionViewSet(viewsets.ModelViewSet):
    """
    GET  /api/v1/subscriptions/        — Tüm abonelikler (admin)
    POST /api/v1/subscriptions/        — Yeni abonelik başlat
    POST /api/v1/subscriptions/{id}/cancel/ — İptal et
    """
    serializer_class   = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'support']:
            return Subscription.objects.all().order_by('-created_at')
        return Subscription.objects.filter(user=user).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        serializer = CreateSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        plan = serializer.validated_data['plan']
        is_yearly = serializer.validated_data['is_yearly']

        PRICES = {
            'pro':       {'monthly': 499, 'yearly': 4490},
            'standart':  {'monthly': 449, 'yearly': 3990},
            'baslangic': {'monthly': 149, 'yearly': 1290},
            'trial':     {'monthly': 0,   'yearly': 0},
        }

        price = PRICES[plan]['yearly'] if is_yearly else PRICES[plan]['monthly']
        duration = timedelta(days=365 if is_yearly else 30)
        if plan == 'trial':
            duration = timedelta(days=3)

        sub = Subscription.objects.create(
            user=request.user,
            plan=plan,
            status='trial' if plan == 'trial' else 'active',
            starts_at=timezone.now(),
            ends_at=timezone.now() + duration,
            price_paid=price,
            is_yearly=is_yearly,
        )
        # Kullanıcı profilini güncelle
        request.user.subscription = plan
        request.user.save(update_fields=['subscription'])

        return Response(SubscriptionSerializer(sub).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        sub = self.get_object()
        sub.status = 'cancelled'
        sub.save()
        request.user.subscription = None
        request.user.save(update_fields=['subscription'])
        return Response({'message': 'Abonelik iptal edildi.'})


# ── COURSE / CHAPTER VIEWS ────────────────────────────────────────────────────

class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    """GET /api/v1/books/ — Tüm dersler (14 DUS dersi)"""
    queryset           = Course.objects.filter(is_active=True).prefetch_related('chapters')
    serializer_class   = CourseSerializer
    permission_classes = [IsAuthenticated]


# ── FLASHCARD VIEWS ───────────────────────────────────────────────────────────

class FlashcardViewSet(viewsets.ModelViewSet):
    """
    GET    /api/v1/cards/                — Liste
    POST   /api/v1/cards/                — Yeni kart (trainer/admin/support)
    GET    /api/v1/cards/{id}/           — Detay
    PATCH  /api/v1/cards/{id}/           — Güncelle
    DELETE /api/v1/cards/{id}/           — Sil
    POST   /api/v1/cards/{id}/approve/   — Onayla (admin/support)
    POST   /api/v1/cards/{id}/reject/    — Reddet (admin/support)
    GET    /api/v1/cards/due/            — Bugün çalışılacak kartlar (SRS)
    """
    filter_backends  = [filters.SearchFilter]
    search_fields    = ['question', 'answer']

    def get_queryset(self):
        user = self.request.user
        qs   = Flashcard.objects.select_related('course', 'chapter', 'created_by')

        if user.role == 'trainer':
            return qs.filter(created_by=user)
        if user.role in ['admin', 'support']:
            return qs.all()
        # Müşteri: sadece yayındakiler
        return qs.filter(status='published')

    def get_serializer_class(self):
        if self.action == 'list':
            return FlashcardListSerializer
        return FlashcardSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsStaff()]
        return [HasActiveSubscription()]

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrSupport])
    def approve(self, request, pk=None):
        card = self.get_object()
        card.status = 'published'
        card.published_at = timezone.now()
        card.save()
        return Response({'message': 'Kart onaylandı ve yayına alındı.'})

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrSupport])
    def reject(self, request, pk=None):
        card = self.get_object()
        card.status = 'rejected'
        card.save()
        return Response({'message': 'Kart reddedildi.'})

    @action(detail=True, methods=['post'], permission_classes=[HasActiveSubscription])
    def rate(self, request, pk=None):
        """POST /api/v1/cards/{id}/rate/ — Güven puanı ver (1-5)"""
        try:
            confidence = int(request.data.get('confidence', 3))
        except (ValueError, TypeError):
            return Response({'error': 'Güven puanı 1-5 arasında olmalı.'}, status=status.HTTP_400_BAD_REQUEST)
        if not (1 <= confidence <= 5):
            return Response({'error': 'Güven puanı 1-5 arasında olmalı.'}, status=status.HTTP_400_BAD_REQUEST)
        card = self.get_object()
        progress, _ = UserCardProgress.objects.get_or_create(
            user=request.user, card=card
        )
        progress.update_srs(confidence)
        return Response(UserCardProgressSerializer(progress).data)

    @action(detail=False, methods=['get'], permission_classes=[HasActiveSubscription])
    def due(self, request):
        """SRS algoritmasına göre bugün çalışılacak kartlar"""
        user = request.user
        due_progress = UserCardProgress.objects.filter(
            user=user,
            next_review__lte=timezone.now(),
        ).select_related('card', 'card__course')

        cards = [p.card for p in due_progress]
        serializer = FlashcardListSerializer(cards, many=True)
        return Response({
            'count': len(cards),
            'cards': serializer.data,
        })

    @action(detail=True, methods=['post'], permission_classes=[HasActiveSubscription])
    def generate_question(self, request, pk=None):
        """
        POST /api/v1/cards/{id}/generate_question/
        Kartın içeriğinden AI ile çoktan seçmeli soru üret
        """
        card = self.get_object()

        prompt = f"""Sen DUS (Dişhekimliği Uzmanlık Sınavı) hazırlık platformunun AI asistanısın.
Aşağıdaki flashcard bilgisinden DUS sınavı formatında çoktan seçmeli bir soru üret.

Flashcard:
Soru: {card.question}
Cevap: {card.answer}

Kural: Doğru cevap flashcard cevabına dayansın, 4 yanlış seçenek de mantıklı distractor olsun.

Lütfen yanıtı JSON formatında ver:
{{
  "question": "Soru metni burada",
  "options": {{"A": "...", "B": "...", "C": "...", "D": "...", "E": "..."}},
  "correct": "A",
  "explanation": "Açıklama burada"
}}

Sadece JSON döndür."""

        try:
            client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            message = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1000,
                messages=[{"role": "user", "content": prompt}]
            )
            text = message.content[0].text
            # Bazen markdown code block içinde gelir
            if '```json' in text:
                text = text.split('```json')[1].split('```')[0].strip()
            elif '```' in text:
                text = text.split('```')[1].split('```')[0].strip()
            try:
                data = json.loads(text)
            except json.JSONDecodeError as e:
                logger.error(f'AI response JSON parse error: {e}. Raw text: {text[:200]}')
                return Response({'error': 'AI yanıtı işlenemedi. Lütfen tekrar deneyin.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response(data)
        except Exception as e:
            return Response(
                {'error': f'Soru üretilemedi: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'], permission_classes=[HasActiveSubscription])
    def dus_question(self, request, pk=None):
        """
        GET /api/v1/cards/{id}/dus_question/
        Bu kartın bölümünden geçmiş DUS sorusu getir (rastgele)
        """
        import random
        card = self.get_object()

        qs = DUSExamQuestion.objects.filter(course=card.course)
        if card.chapter:
            chapter_qs = qs.filter(chapter=card.chapter)
            if chapter_qs.exists():
                qs = chapter_qs

        if not qs.exists():
            return Response(
                {'detail': 'Bu bölüm için henüz gerçek DUS sorusu eklenmemiş.'},
                status=status.HTTP_404_NOT_FOUND
            )

        question = random.choice(list(qs))
        return Response(DUSExamQuestionSerializer(question).data)


class UserCardProgressView(generics.ListCreateAPIView):
    """GET/POST /api/v1/cards/progress/ — Kart ilerleme"""
    serializer_class   = UserCardProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserCardProgress.objects.filter(user=self.request.user)


# ── QUIZ VIEWS ────────────────────────────────────────────────────────────────

class QuizViewSet(viewsets.ModelViewSet):
    """
    Quiz yönetimi ve sonuç gönderimi.

    GET  /api/v1/quiz/           — Yayınlanmış quizlerin listesi
    POST /api/v1/quiz/           — Yeni quiz oluştur (trainer/admin)
    POST /api/v1/quiz/submit/    — Quiz sonucu gönder; SRS günceller ve oturum kaydeder
    """

    serializer_class   = QuizSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'trainer':
            return Quiz.objects.filter(created_by=user)
        if user.role in ['admin', 'support']:
            return Quiz.objects.all()
        return Quiz.objects.filter(status='published')

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsStaff()]
        return [HasActiveSubscription()]

    @action(detail=False, methods=['post'], permission_classes=[HasActiveSubscription])
    def submit(self, request):
        """
        POST /api/v1/quiz/submit/
        Body: {course_id, quiz_id?, results:[{card_id, is_correct, confidence}], duration_sec}
        """
        serializer = QuizSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            course = Course.objects.get(pk=data['course_id'])
        except Course.DoesNotExist:
            return Response({'error': 'Geçersiz ders ID.'}, status=status.HTTP_400_BAD_REQUEST)

        results = data['results']
        correct = sum(1 for r in results if r.get('is_correct'))
        wrong   = len(results) - correct
        score   = round(correct / len(results) * 100) if results else 0
        avg_conf = sum(r.get('confidence', 3) for r in results) / len(results) if results else 0

        # Oturum kaydet
        session = QuizSession.objects.create(
            user=request.user,
            course=course,
            quiz_id=data.get('quiz_id'),
            total_cards=len(results),
            correct=correct,
            wrong=wrong,
            score_pct=score,
            avg_confidence=round(avg_conf, 1),
            duration_sec=data['duration_sec'],
            completed=True,
        )

        # Her kart için SRS güncelle — atomik işlem
        with transaction.atomic():
            for r in results:
                try:
                    card = Flashcard.objects.get(pk=r['card_id'])
                except Flashcard.DoesNotExist:
                    logger.warning(f'Quiz submit: card {r.get("card_id")} not found, skipping')
                    continue
                progress, _ = UserCardProgress.objects.get_or_create(
                    user=request.user, card=card
                )
                if r.get('is_correct'):
                    progress.correct += 1
                else:
                    progress.wrong += 1
                confidence = r.get('confidence', 3 if r.get('is_correct') else 1)
                # Clamp confidence to valid range before calling update_srs
                confidence = max(1, min(5, int(confidence)))
                progress.update_srs(confidence)

        # Streak güncelle
        today = timezone.now().date()
        user  = request.user
        if user.last_study_date != today:
            if user.last_study_date == today - timedelta(days=1):
                user.streak_days += 1
            else:
                user.streak_days = 1
            user.last_study_date = today
            user.save(update_fields=['streak_days', 'last_study_date'])

        return Response({
            'session_id':    session.id,
            'score':         score,
            'score_pct':     score,
            'correct':       correct,
            'wrong':         wrong,
            'avg_confidence': round(avg_conf, 1),
            'streak_days':   user.streak_days,
        })


# ── QUESTION VIEWS ────────────────────────────────────────────────────────────

class QuestionViewSet(viewsets.ModelViewSet):
    """
    GET  /api/v1/questions/            — Liste
    POST /api/v1/questions/            — Soru sor (müşteri)
    POST /api/v1/questions/{id}/answer/ — Cevapla (trainer/admin/support)
    """
    serializer_class   = QuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'customer':
            return Question.objects.filter(user=user)
        if user.role == 'trainer':
            # Yanıtlanmamış sorular + kendi yanıtladıkları
            return Question.objects.filter(answered_by=None) | Question.objects.filter(answered_by=user)
        return Question.objects.all()

    def get_permissions(self):
        if self.action == 'create':
            return [HasActiveSubscription()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['post'], permission_classes=[IsStaff])
    def answer(self, request, pk=None):
        question = self.get_object()
        serializer = AnswerQuestionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        question.answer_text  = serializer.validated_data['answer_text']
        question.answered_by  = request.user
        question.status       = 'answered'
        question.answered_at  = timezone.now()
        question.save()
        return Response(QuestionSerializer(question).data)


# ── NOTIFICATION VIEWS ────────────────────────────────────────────────────────

class NotificationViewSet(viewsets.ModelViewSet):
    """
    Bildirim yönetimi — yalnızca admin/support erişebilir.

    GET  /api/v1/notifications/       — Liste
    POST /api/v1/notifications/send/  — Hedef kitleye bildirim gönder
    """

    serializer_class   = NotificationSerializer
    permission_classes = [IsAdminOrSupport]
    queryset           = Notification.objects.all().order_by('-created_at')

    @action(detail=False, methods=['post'])
    def send(self, request):
        """POST /api/v1/notifications/send/ — Bildirim gönder"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        notif = serializer.save()

        # TODO: Firebase FCM / email servisi entegrasyonu
        target = notif.target
        if target == 'all':
            count = User.objects.filter(is_active=True).count()
        elif target == 'specific':
            count = 1
        else:
            count = User.objects.filter(subscription=target, is_active=True).count()

        notif.sent_count = count
        notif.save()

        return Response({
            'message':    f'Bildirim {count} kullanıcıya gönderildi.',
            'sent_count': count,
            'notif':      NotificationSerializer(notif).data,
        })


# ── AI VIEWS ──────────────────────────────────────────────────────────────────

class GenerateCardsView(generics.GenericAPIView):
    """
    POST /api/v1/ai/generate-cards/
    Anthropic Claude API ile metin veya bölümden kart üret
    """
    permission_classes = [HasAIAccess]
    serializer_class   = GenerateCardsSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        course = Course.objects.get(pk=data['course_id'])
        card_type = data['card_type']
        count     = data['count']
        text      = data.get('text', '')

        # Metin yoksa bölüm içeriğinden üret
        if not text and data.get('chapter_ids'):
            chapters = Chapter.objects.filter(id__in=data['chapter_ids'])
            text = f"Ders: {course.name}\nBölümler: {', '.join(c.name for c in chapters)}"

        # Prompt oluştur
        type_instruction = (
            "Soru-Cevap formatında (Soru: ..., Cevap: ...)" if card_type == 'qa'
            else "Terim-Tanım formatında (Terim: ..., Tanım: ...)"
        )

        prompt = f"""Sen DUS (Dişhekimliği Uzmanlık Sınavı) hazırlık platformunun AI asistanısın.
Aşağıdaki ders içeriğinden {count} adet flashcard üret.
Format: {type_instruction}

Ders: {course.name}
İçerik: {text}

Lütfen yanıtı JSON formatında ver:
{{
  "cards": [
    {{"question": "...", "answer": "..."}},
    ...
  ]
}}

Sadece JSON döndür, başka açıklama ekleme."""

        try:
            client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            message = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=4000,
                messages=[{"role": "user", "content": prompt}]
            )
            response_text = message.content[0].text
            # JSON parse
            try:
                cards_data = json.loads(response_text)['cards']
            except json.JSONDecodeError as e:
                logger.error(f'AI response JSON parse error: {e}. Raw text: {response_text[:200]}')
                return Response({'error': 'AI yanıtı işlenemedi. Lütfen tekrar deneyin.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Veritabanına kaydet (taslak olarak)
            created_cards = []
            for card_data in cards_data:
                card = Flashcard.objects.create(
                    course=course,
                    chapter_id=data.get('chapter_id'),
                    created_by=request.user,
                    card_type=card_type,
                    question=card_data['question'],
                    answer=card_data['answer'],
                    status='pending',  # Admin onayı bekleyecek
                    ai_generated=True,
                )
                created_cards.append(card)

            return Response({
                'message': f'{len(created_cards)} kart üretildi.',
                'cards':   FlashcardSerializer(created_cards, many=True).data,
            })

        except Exception as e:
            return Response(
                {'error': f'AI kart üretimi başarısız: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ── LIBRARY VIEWS ─────────────────────────────────────────────────────────────

class LibraryDocumentViewSet(viewsets.ModelViewSet):
    """
    GET    /api/v1/library/           — Liste (admin: hepsi, trainer: kendi)
    POST   /api/v1/library/           — Belge yükle
    GET    /api/v1/library/{id}/      — Detay
    DELETE /api/v1/library/{id}/      — Sil
    """
    serializer_class  = LibraryDocumentSerializer
    filter_backends   = [filters.SearchFilter]
    search_fields     = ['title', 'description']
    parser_classes_override = None  # multipart için

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return LibraryDocument.objects.select_related('course', 'chapter', 'uploaded_by').all()
        if user.role == 'trainer':
            return LibraryDocument.objects.select_related('course', 'chapter', 'uploaded_by').filter(uploaded_by=user)
        # support: herkese açık belgeler
        return LibraryDocument.objects.filter(is_public=True)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAdminOrTrainer()]
        if self.action in ['create']:
            return [IsAdminOrTrainer()]
        if self.action in ['destroy', 'update', 'partial_update']:
            return [IsAdminOrTrainer()]
        return [IsAuthenticated()]

    def perform_destroy(self, instance):
        user = self.request.user
        # Trainer sadece kendi belgelerini silebilir
        if user.role == 'trainer' and instance.uploaded_by != user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Bu belgeyi silme yetkiniz yok.')
        instance.file.delete(save=False)
        instance.delete()

    @action(detail=True, methods=['post'], url_path='generate-cards', permission_classes=[IsAdminOrTrainer])
    def generate_cards(self, request, pk=None):
        """
        POST /api/v1/library/{id}/generate-cards/
        Body: { count: 10, difficulty: "orta", focus: "..." }
        Uses extracted PDF text (or re-extracts) → Claude API → returns card list.
        """
        doc = self.get_object()

        if doc.file_type != 'pdf':
            return Response({'error': 'Yalnızca PDF belgelerinden kart üretilebilir.'}, status=400)

        # Re-extract if text is missing
        if not doc.text_content:
            doc._extract_pdf_text()
            doc.refresh_from_db()

        if doc.processing_status == 'error' or not doc.text_content:
            return Response({'error': 'PDF metni çıkarılamadı.'}, status=400)

        count      = int(request.data.get('count', 10))
        difficulty = request.data.get('difficulty', 'orta')
        focus      = request.data.get('focus', '')

        # Limit text to ~80k chars to stay within Claude context
        text_snippet = doc.text_content[:80000]

        prompt = (
            f"Sen bir DUS (Diş Hekimliği Uzmanlık Sınavı) soru hazırlama uzmanısın.\n"
            f"Aşağıdaki PDF içeriğinden {count} adet flash kart üret.\n"
            f"Zorluk: {difficulty}. {'Odak: ' + focus if focus else ''}\n\n"
            f"Her kart için JSON formatı:\n"
            f'{{ "front": "soru/terim", "back": "cevap/açıklama", "hint": "ipucu (opsiyonel)" }}\n\n'
            f"Yanıtı yalnızca geçerli bir JSON dizisi olarak ver: [{{}}, ...]\n\n"
            f"PDF İçeriği:\n{text_snippet}"
        )

        try:
            client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            message = client.messages.create(
                model='claude-sonnet-4-6',
                max_tokens=4096,
                messages=[{'role': 'user', 'content': prompt}],
            )
            import re
            raw = message.content[0].text
            # Extract JSON array from response
            match = re.search(r'\[.*\]', raw, re.DOTALL)
            if not match:
                return Response({'error': 'AI geçerli bir yanıt vermedi.'}, status=500)
            try:
                cards = json.loads(match.group())
            except json.JSONDecodeError as e:
                logger.error(f'AI response JSON parse error: {e}. Raw text: {raw[:200]}')
                return Response({'error': 'AI yanıtı işlenemedi. Lütfen tekrar deneyin.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response({'cards': cards, 'count': len(cards), 'document_id': doc.id})
        except Exception as e:
            return Response({'error': f'Kart üretimi başarısız: {str(e)}'}, status=500)


# ── DUS SINAV SORUSU VIEWS ────────────────────────────────────────────────────

class DUSExamQuestionViewSet(viewsets.ModelViewSet):
    """
    GET  /api/v1/exam-questions/           — Liste
    POST /api/v1/exam-questions/           — Ekle (admin)
    GET  /api/v1/exam-questions/{id}/      — Detay
    """
    serializer_class   = DUSExamQuestionSerializer
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['question_text', 'source']

    def get_queryset(self):
        qs = DUSExamQuestion.objects.select_related('course', 'chapter')
        course_id  = self.request.query_params.get('course')
        chapter_id = self.request.query_params.get('chapter')
        year       = self.request.query_params.get('year')
        if course_id:
            qs = qs.filter(course_id=course_id)
        if chapter_id:
            qs = qs.filter(chapter_id=chapter_id)
        if year:
            qs = qs.filter(year=year)
        return qs

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [IsAuthenticated()]


# ── IMAGE CARD VIEWS ──────────────────────────────────────────────────────────

class ImageCardViewSet(viewsets.ModelViewSet):
    """
    GET    /api/v1/image-cards/           — Liste
    POST   /api/v1/image-cards/           — Yükle (admin/trainer)
    PATCH  /api/v1/image-cards/{id}/      — Güncelle
    DELETE /api/v1/image-cards/{id}/      — Sil
    POST   /api/v1/image-cards/{id}/approve/ — Onayla (admin)
    POST   /api/v1/image-cards/{id}/reject/  — Reddet (admin)
    """
    serializer_class = ImageCardSerializer
    filter_backends  = [filters.SearchFilter]
    search_fields    = ['title', 'description']

    def get_queryset(self):
        user = self.request.user
        qs   = ImageCard.objects.select_related('course', 'chapter', 'created_by')
        if user.role == 'admin':
            return qs.all()
        if user.role == 'trainer':
            return qs.filter(created_by=user)
        # Müşteri: sadece yayındakiler (Pro kontrolü view'da yapılır)
        return qs.filter(status='published')

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrTrainer()]
        return [IsAuthenticated()]

    def list(self, request, *args, **kwargs):
        # Müşteri için Pro kontrolü
        if request.user.role == 'customer' and request.user.subscription != 'pro':
            return Response(
                {'detail': 'Bilgi Kartları Pro plana özgü bir özelliktir.', 'pro_required': True},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().list(request, *args, **kwargs)

    def perform_destroy(self, instance):
        user = self.request.user
        if user.role == 'trainer' and instance.created_by != user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Bu kartı silme yetkiniz yok.')
        if instance.image:
            instance.image.delete(save=False)
        instance.delete()

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def approve(self, request, pk=None):
        card = self.get_object()
        card.status = 'published'
        card.save()
        return Response({'message': 'Bilgi kartı onaylandı ve yayına alındı.'})

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def reject(self, request, pk=None):
        card = self.get_object()
        card.status = 'rejected'
        card.save()
        return Response({'message': 'Bilgi kartı reddedildi.'})


# ── USER ACTIVITY VIEWS ────────────────────────────────────────────────────────

class UserActivityViewSet(viewsets.ModelViewSet):
    """
    POST /api/v1/activities/         — Eylem logla (tüm giriş yapmış kullanıcılar)
    GET  /api/v1/activities/         — Liste (admin only)
    GET  /api/v1/activities/summary/ — Özet istatistikler (admin)
    """
    serializer_class = UserActivitySerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            qs = UserActivity.objects.select_related('user').all()
            # Filtrele
            action_filter = self.request.query_params.get('action')
            entity_type   = self.request.query_params.get('entity_type')
            user_id       = self.request.query_params.get('user_id')
            if action_filter:
                qs = qs.filter(action=action_filter)
            if entity_type:
                qs = qs.filter(entity_type=entity_type)
            if user_id:
                qs = qs.filter(user_id=user_id)
            return qs
        # Kullanıcı sadece kendi aktivitelerini görebilir
        return UserActivity.objects.filter(user=user)

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'summary']:
            # Admin herşeyi görür, diğerleri sadece kendi kayıtlarını
            return [IsAuthenticated()]
        if self.action == 'create':
            return [IsAuthenticated()]
        return [IsAdmin()]

    http_method_names = ['get', 'post', 'head', 'options']  # PUT/PATCH/DELETE yok

    @action(detail=False, methods=['get'], permission_classes=[IsAdmin])
    def summary(self, request):
        """GET /api/v1/activities/summary/ — Eylem bazlı özet"""
        from django.db.models import Count
        from django.utils import timezone
        from datetime import timedelta

        last_30 = timezone.now() - timedelta(days=30)
        summary = (
            UserActivity.objects
            .filter(created_at__gte=last_30)
            .values('action')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        total_users = UserActivity.objects.filter(
            created_at__gte=last_30
        ).values('user').distinct().count()

        return Response({
            'period_days': 30,
            'unique_users': total_users,
            'actions': list(summary),
        })


# ── REPORT VIEWS ──────────────────────────────────────────────────────────────

class ReportView(generics.GenericAPIView):
    """GET /api/v1/reports/ — Platform geneli raporlar (admin)"""
    permission_classes = [IsAdminOrSupport]

    def get(self, request):
        from django.db.models import Count, Avg, Sum

        total_users   = User.objects.count()
        active_users  = User.objects.filter(is_active=True).count()
        total_cards   = Flashcard.objects.filter(status='published').count()
        total_quizzes = Quiz.objects.filter(status='published').count()
        avg_score     = QuizSession.objects.filter(completed=True).aggregate(
            avg=Avg('score_pct')
        )['avg'] or 0

        # Aylık gelir (abonelikler)
        from django.db.models.functions import TruncMonth
        monthly_revenue = Subscription.objects.filter(
            status='active'
        ).values('plan').annotate(count=Count('id'))

        return Response({
            'total_users':    total_users,
            'active_users':   active_users,
            'total_cards':    total_cards,
            'total_quizzes':  total_quizzes,
            'avg_quiz_score': round(avg_score, 1),
            'plan_breakdown': list(monthly_revenue),
        })


# ── TRAINER COMMISSION VIEWS ───────────────────────────────────────────────────

class TrainerCommissionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Eğitmen komisyon kayıtları.

    GET /api/v1/commissions/       — Liste (admin: hepsi, trainer: kendi kayıtları)
    GET /api/v1/commissions/{id}/  — Detay
    """
    serializer_class   = TrainerCommissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return TrainerCommission.objects.select_related('trainer').all()
        if user.role == 'trainer':
            return TrainerCommission.objects.filter(trainer=user)
        return TrainerCommission.objects.none()


# ── GENERATE QUESTION VIEW ────────────────────────────────────────────────────

class GenerateQuestionView(generics.GenericAPIView):
    """
    POST /api/v1/ai/generate-question/
    Verilen metin veya bağlamdan AI ile çoktan seçmeli DUS sorusu üretir.
    Body: { text, course_id? }
    """
    permission_classes = [HasAIAccess]

    def post(self, request):
        """AI ile tek bir DUS sorusu üret."""
        text = request.data.get('text', '').strip()
        if not text:
            return Response({'error': 'Metin zorunludur.'}, status=status.HTTP_400_BAD_REQUEST)

        prompt = f"""Sen DUS sınavı hazırlık platformunun AI asistanısın.
Aşağıdaki içerikten DUS sınavı formatında çoktan seçmeli bir soru üret.

İçerik: {text}

Lütfen yanıtı JSON formatında ver:
{{
  "question": "Soru metni",
  "options": {{"A": "...", "B": "...", "C": "...", "D": "...", "E": "..."}},
  "correct": "A",
  "explanation": "Açıklama"
}}

Sadece JSON döndür."""

        try:
            client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            message = client.messages.create(
                model='claude-sonnet-4-6',
                max_tokens=1000,
                messages=[{'role': 'user', 'content': prompt}],
            )
            raw = message.content[0].text
            if '```json' in raw:
                raw = raw.split('```json')[1].split('```')[0].strip()
            elif '```' in raw:
                raw = raw.split('```')[1].split('```')[0].strip()
            try:
                data = json.loads(raw)
            except json.JSONDecodeError as e:
                logger.error(f'AI response JSON parse error: {e}. Raw text: {raw[:200]}')
                return Response({'error': 'AI yanıtı işlenemedi. Lütfen tekrar deneyin.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response(data)
        except Exception as e:
            logger.error(f'GenerateQuestionView error: {e}')
            return Response({'error': f'Soru üretilemedi: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
