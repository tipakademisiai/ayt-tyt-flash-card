from django.urls import path, include
from rest_framework.routers import DefaultRouter
from dus_api.views.views import (
    LoginView, RegisterView, LogoutView, MeView,
    UserViewSet, TrainerViewSet,
    SubscriptionViewSet,
    CourseViewSet,
    FlashcardViewSet, UserCardProgressView,
    QuizViewSet,
    QuestionViewSet,
    NotificationViewSet,
    GenerateCardsView,
    ReportView,
)

router = DefaultRouter()
router.register(r'users',         UserViewSet,        basename='user')
router.register(r'trainers',      TrainerViewSet,     basename='trainer')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')
router.register(r'books',         CourseViewSet,      basename='course')
router.register(r'cards',         FlashcardViewSet,   basename='flashcard')
router.register(r'quiz',          QuizViewSet,        basename='quiz')
router.register(r'questions',     QuestionViewSet,    basename='question')
router.register(r'notifications', NotificationViewSet, basename='notification')

# Auth URLs
auth_urlpatterns = [
    path('login/',    LoginView.as_view(),    name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('logout/',   LogoutView.as_view(),   name='logout'),
    path('me/',       MeView.as_view(),       name='me'),
]

# Card progress & rating
card_urlpatterns = [
    path('progress/', UserCardProgressView.as_view(), name='card-progress'),
    path('<int:pk>/rate/', UserCardProgressView.as_view(), name='card-rate'),
]

# AI
ai_urlpatterns = [
    path('generate-cards/', GenerateCardsView.as_view(), name='generate-cards'),
]

# Reports
report_urlpatterns = [
    path('', ReportView.as_view(), name='reports'),
]

# Main URL patterns (config/urls.py'de include edilir)
urlpatterns = router.urls + [
    path('auth/',    include(auth_urlpatterns)),
    path('cards/',   include(card_urlpatterns)),
    path('ai/',      include(ai_urlpatterns)),
    path('reports/', include(report_urlpatterns)),
]
