from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView as SpectacularSwaggerUIView

from dus_api.views.views import (
    LoginView, RegisterView, LogoutView, MeView,
    PasswordResetRequestView, PasswordResetConfirmView,
    UserViewSet, TrainerViewSet,
    SubscriptionViewSet,
    CourseViewSet,
    FlashcardViewSet, UserCardProgressView,
    QuizViewSet,
    QuestionViewSet,
    NotificationViewSet,
    GenerateCardsView, GenerateQuestionView,
    ReportView,
    LibraryDocumentViewSet,
    DUSExamQuestionViewSet,
    ImageCardViewSet,
    UserActivityViewSet,
    TrainerCommissionViewSet,
)

# ── Router ────────────────────────────────────────────────────
router = DefaultRouter()
router.register(r'users',         UserViewSet,         basename='user')
router.register(r'trainers',      TrainerViewSet,      basename='trainer')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')
router.register(r'books',         CourseViewSet,       basename='course')
router.register(r'cards',         FlashcardViewSet,    basename='flashcard')
router.register(r'quiz',          QuizViewSet,         basename='quiz')
router.register(r'questions',     QuestionViewSet,     basename='question')
router.register(r'notifications',  NotificationViewSet,    basename='notification')
router.register(r'library',        LibraryDocumentViewSet, basename='library')
router.register(r'exam-questions', DUSExamQuestionViewSet, basename='exam-question')
router.register(r'image-cards',    ImageCardViewSet,       basename='image-card')
router.register(r'activities',     UserActivityViewSet,    basename='activity')
router.register(r'commissions',    TrainerCommissionViewSet, basename='commission')

# ── Auth URL'leri ─────────────────────────────────────────────
auth_patterns = [
    path('login/',                   LoginView.as_view(),                name='auth-login'),
    path('register/',                RegisterView.as_view(),             name='auth-register'),
    path('logout/',                  LogoutView.as_view(),               name='auth-logout'),
    path('me/',                      MeView.as_view(),                   name='auth-me'),
    path('token/refresh/',           TokenRefreshView.as_view(),         name='token-refresh'),
    path('password-reset/',          PasswordResetRequestView.as_view(), name='password-reset'),
    path('password-reset-confirm/',  PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]

# ── Card progress URL'leri ────────────────────────────────────
card_extra_patterns = [
    path('progress/', UserCardProgressView.as_view(), name='card-progress'),
]

urlpatterns = [
    path('django-admin/', admin.site.urls),

    # Auth
    path('api/v1/auth/', include(auth_patterns)),

    # Router (users, books, cards, quiz, questions, subscriptions, notifications, trainers)
    path('api/v1/', include(router.urls)),

    # Card extras (progress & rate — router'a ek)
    path('api/v1/cards/', include(card_extra_patterns)),

    # AI
    path('api/v1/ai/generate-cards/',    GenerateCardsView.as_view(),    name='generate-cards'),
    path('api/v1/ai/generate-question/', GenerateQuestionView.as_view(), name='generate-question'),

    # Reports
    path('api/v1/reports/', ReportView.as_view(), name='reports'),

    # API Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/',   SpectacularSwaggerUIView.as_view(url_name='schema'), name='swagger-ui'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
