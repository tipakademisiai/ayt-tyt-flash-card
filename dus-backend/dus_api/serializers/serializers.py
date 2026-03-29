"""
DUS Akademisi serializer katmanı.

Mimariye genel bakış:
- Auth: LoginSerializer, RegisterSerializer — kimlik doğrulama ve kayıt
- User: UserSerializer (tam), UserListSerializer (liste), UserCreateSerializer (admin oluşturma),
  TrainerSerializer (eğitmen profili)
- Subscription: SubscriptionSerializer, CreateSubscriptionSerializer
- Course/Chapter: CourseSerializer (ilerleme verisiyle), ChapterSerializer
- Flashcard: FlashcardSerializer, FlashcardListSerializer, UserCardProgressSerializer
- Quiz: QuizSerializer, QuizSessionSerializer, QuizSubmitSerializer
- Question: QuestionSerializer, AnswerQuestionSerializer
- Notification: NotificationSerializer
- Commission: TrainerCommissionSerializer
- AI: GenerateCardsSerializer
- Library: LibraryDocumentSerializer
- ImageCard: ImageCardSerializer
- Activity: UserActivitySerializer
- DUSExam: DUSExamQuestionSerializer
"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from dus_api.models import (
    User, Subscription, Course, Chapter,
    Flashcard, UserCardProgress,
    Quiz, QuizSession, Question,
    Notification, TrainerCommission,
    LibraryDocument, DUSExamQuestion,
    ImageCard, UserActivity,
)


# ── AUTH ──────────────────────────────────────────────────────────────────────

class LoginSerializer(serializers.Serializer):
    """E-posta/şifre ile giriş için doğrulama; doğrulama başarılıysa 'user' nesnesini döndürür."""

    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError('E-posta veya şifre hatalı.')
        if not user.is_active:
            raise serializers.ValidationError('Hesap pasif durumda.')
        data['user'] = user
        return data


class RegisterSerializer(serializers.ModelSerializer):
    """Yeni kullanıcı kaydı — şifre doğrulama ve minimum uzunluk kontrolü içerir."""

    password  = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model  = User
        fields = ['email', 'first_name', 'last_name', 'password', 'password2']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password2': 'Şifreler eşleşmiyor.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        return User.objects.create_user(**validated_data)


# ── USER ──────────────────────────────────────────────────────────────────────

class UserSerializer(serializers.ModelSerializer):
    """Tam kullanıcı profili — ME endpoint ve detay görünümlerinde kullanılır."""

    full_name = serializers.ReadOnlyField()

    class Meta:
        model  = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'branch', 'bio', 'avatar',
            'subscription', 'trial_ends_at',
            'streak_days', 'last_study_date',
            'commission_rate',
            'is_active', 'date_joined', 'last_login',
        ]
        read_only_fields = ['id', 'date_joined', 'last_login', 'role']


class UserCreateSerializer(serializers.Serializer):
    """Admin panelinden yeni kullanıcı oluşturma"""
    first_name = serializers.CharField(max_length=100)
    last_name  = serializers.CharField(max_length=100, required=False, default='')
    email      = serializers.EmailField()
    role       = serializers.ChoiceField(choices=['customer', 'trainer', 'support', 'admin'],
                                         default='customer')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Bu e-posta adresi zaten kayıtlı.')
        return value


class UserListSerializer(serializers.ModelSerializer):
    """Kullanıcı listesi için kısa serializer"""
    full_name  = serializers.ReadOnlyField()
    active_sub = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = [
            'id', 'email', 'full_name', 'role', 'branch',
            'subscription', 'is_active', 'date_joined', 'active_sub',
        ]

    def get_active_sub(self, obj):
        sub = (obj.subscriptions
               .filter(status__in=['active', 'trial'])
               .order_by('-ends_at')
               .first())
        if sub:
            return {
                'id':         sub.id,
                'plan':       sub.plan,
                'status':     sub.status,
                'starts_at':  sub.starts_at,
                'ends_at':    sub.ends_at,
                'is_yearly':  sub.is_yearly,
                'auto_renew': sub.auto_renew,
                'price_paid': str(sub.price_paid),
            }
        return None


class TrainerSerializer(serializers.ModelSerializer):
    """Eğitmen herkese açık profili — kart/quiz sayısı ve ortalama puan dahil."""

    full_name     = serializers.ReadOnlyField()
    card_count    = serializers.SerializerMethodField()
    quiz_count    = serializers.SerializerMethodField()
    avg_rating    = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = ['id', 'email', 'first_name', 'last_name', 'full_name',
                  'branch', 'bio', 'avatar', 'commission_rate',
                  'is_active', 'card_count', 'quiz_count', 'avg_rating', 'date_joined']

    def get_card_count(self, obj):
        return obj.created_cards.filter(status='published').count()

    def get_quiz_count(self, obj):
        return obj.created_quizzes.filter(status='published').count()

    def get_avg_rating(self, obj):
        return 4.8  # TODO: Review modeli eklenince gerçek hesapla


# ── SUBSCRIPTION ─────────────────────────────────────────────────────────────

class SubscriptionSerializer(serializers.ModelSerializer):
    """Abonelik kaydının tam temsili — plan özellikleri ve kullanıcı e-postası dahil."""

    features   = serializers.ReadOnlyField()
    user_email = serializers.SerializerMethodField()

    class Meta:
        model  = Subscription
        fields = ['id', 'plan', 'status', 'starts_at', 'ends_at',
                  'price_paid', 'is_yearly', 'auto_renew', 'features',
                  'user_email', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_user_email(self, obj):
        return obj.user.email


class CreateSubscriptionSerializer(serializers.Serializer):
    plan      = serializers.ChoiceField(choices=['pro', 'standart', 'baslangic', 'trial'])
    is_yearly = serializers.BooleanField(default=False)


# ── COURSE / CHAPTER ─────────────────────────────────────────────────────────

class ChapterSerializer(serializers.ModelSerializer):
    """Ders bölümünü yayınlanmış kart sayısıyla birlikte döndürür."""

    card_count = serializers.SerializerMethodField()

    class Meta:
        model  = Chapter
        fields = ['id', 'name', 'order', 'card_count']

    def get_card_count(self, obj):
        return obj.flashcards.filter(status='published').count()


class CourseSerializer(serializers.ModelSerializer):
    """
    Ders detayı — bölümler ve kimliği doğrulanmış kullanıcı için ilerleme verisiyle birlikte.

    get_user_progress, serileştirici bağlamında geçerli bir 'request' bulunmasını gerektirir;
    bu bilgi yoksa None döndürür.
    """

    chapters   = ChapterSerializer(many=True, read_only=True)
    card_count = serializers.SerializerMethodField()
    user_progress = serializers.SerializerMethodField()

    class Meta:
        model  = Course
        fields = ['id', 'name', 'slug', 'branch_type', 'description',
                  'order', 'icon_svg', 'card_count', 'chapters', 'user_progress']

    def get_card_count(self, obj):
        return obj.flashcards.filter(status='published').count()

    def get_user_progress(self, obj):
        request = self.context.get('request')
        if not request or not hasattr(request, 'user') or not request.user.is_authenticated:
            return None
        user = request.user
        total = obj.flashcards.filter(status='published').count()
        if total == 0:
            return {'done': 0, 'total': 0, 'pct': 0, 'pending': 0}
        done = UserCardProgress.objects.filter(
            user=user, card__course=obj, confidence__gte=4
        ).count()
        pending = UserCardProgress.objects.filter(
            user=user, card__course=obj, next_review__lte=timezone.now()
        ).count()
        return {'done': done, 'total': total, 'pct': round(done/total*100), 'pending': pending}


# ── FLASHCARD ─────────────────────────────────────────────────────────────────

class FlashcardSerializer(serializers.ModelSerializer):
    """Flashcard'ın tam temsili — oluşturan ismi ve ders/bölüm adlarıyla birlikte."""

    created_by_name = serializers.ReadOnlyField(source='created_by.full_name')
    course_name     = serializers.ReadOnlyField(source='course.name')
    chapter_name    = serializers.ReadOnlyField(source='chapter.name')

    class Meta:
        model  = Flashcard
        fields = [
            'id', 'course', 'course_name', 'chapter', 'chapter_name',
            'created_by', 'created_by_name',
            'card_type', 'question', 'answer',
            'status', 'ai_generated', 'usage_count', 'error_count',
            'created_at', 'updated_at', 'published_at',
        ]
        read_only_fields = ['id', 'created_by', 'usage_count', 'error_count', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class FlashcardListSerializer(serializers.ModelSerializer):
    """Liste için kısa serializer"""
    class Meta:
        model  = Flashcard
        fields = ['id', 'card_type', 'question', 'answer', 'status', 'usage_count', 'created_at']


class UserCardProgressSerializer(serializers.ModelSerializer):
    """Bir kart için kullanıcının SRS ilerlemesini — aralık, kolaylık faktörü ve sonraki tekrar zamanını — gösterir."""

    class Meta:
        model  = UserCardProgress
        fields = ['id', 'card', 'confidence', 'correct', 'wrong',
                  'next_review', 'interval', 'ease_factor', 'last_reviewed']
        read_only_fields = ['id', 'next_review', 'interval', 'ease_factor']


# ── QUIZ ─────────────────────────────────────────────────────────────────────

class QuizSerializer(serializers.ModelSerializer):
    """Quiz tanımı — oluşturan ve ders adlarıyla birlikte."""

    created_by_name = serializers.ReadOnlyField(source='created_by.full_name')
    course_name     = serializers.ReadOnlyField(source='course.name')

    class Meta:
        model  = Quiz
        fields = [
            'id', 'course', 'course_name', 'chapter',
            'created_by', 'created_by_name',
            'name', 'description', 'card_count', 'time_limit',
            'status', 'play_count', 'avg_score',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'play_count', 'avg_score', 'created_at', 'updated_at']


class QuizSessionSerializer(serializers.ModelSerializer):
    """Tamamlanan bir quiz oturumunun sonuçları — skor, doğru/yanlış sayısı ve güven ortalaması."""

    course_name = serializers.ReadOnlyField(source='course.name')

    class Meta:
        model  = QuizSession
        fields = [
            'id', 'quiz', 'course', 'course_name',
            'total_cards', 'correct', 'wrong', 'score_pct',
            'avg_confidence', 'duration_sec', 'completed', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class QuizSubmitSerializer(serializers.Serializer):
    """Quiz sonucu göndermek için"""
    course_id     = serializers.IntegerField()
    quiz_id       = serializers.IntegerField(required=False)
    results       = serializers.ListField(
        child=serializers.DictField()  # [{card_id, is_correct, confidence}]
    )
    duration_sec  = serializers.IntegerField()


# ── QUESTION ─────────────────────────────────────────────────────────────────

class QuestionSerializer(serializers.ModelSerializer):
    """Müşteri sorusu — kullanıcı ve eğitmen adları, yanıt metni ve durum dahil."""

    user_name      = serializers.ReadOnlyField(source='user.full_name')
    answered_by_name = serializers.ReadOnlyField(source='answered_by.full_name')
    course_name    = serializers.ReadOnlyField(source='course.name')

    class Meta:
        model  = Question
        fields = [
            'id', 'user', 'user_name', 'course', 'course_name', 'card',
            'question_text', 'answer_text',
            'answered_by', 'answered_by_name',
            'status', 'created_at', 'answered_at',
        ]
        read_only_fields = ['id', 'user', 'answered_by', 'status', 'created_at', 'answered_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class AnswerQuestionSerializer(serializers.Serializer):
    answer_text = serializers.CharField()


# ── NOTIFICATION ─────────────────────────────────────────────────────────────

class NotificationSerializer(serializers.ModelSerializer):
    """Bildirim kaydı — gönderen adı ve gönderim/okunma sayıları dahil."""

    sent_by_name = serializers.ReadOnlyField(source='sent_by.full_name')

    class Meta:
        model  = Notification
        fields = [
            'id', 'title', 'body', 'notif_type', 'target',
            'target_user', 'sent_by', 'sent_by_name',
            'sent_count', 'read_count', 'created_at',
        ]
        read_only_fields = ['id', 'sent_by', 'sent_count', 'read_count', 'created_at']

    def create(self, validated_data):
        validated_data['sent_by'] = self.context['request'].user
        return super().create(validated_data)


# ── COMMISSION ────────────────────────────────────────────────────────────────

class TrainerCommissionSerializer(serializers.ModelSerializer):
    """Eğitmen komisyon kaydı — aylık gelir ve hesaplanan komisyon tutarı."""

    trainer_name = serializers.ReadOnlyField(source='trainer.full_name')

    class Meta:
        model  = TrainerCommission
        fields = [
            'id', 'trainer', 'trainer_name', 'rate', 'month',
            'gross_revenue', 'commission_amount',
            'paid', 'paid_at', 'created_at',
        ]
        read_only_fields = ['id', 'gross_revenue', 'commission_amount', 'paid_at', 'created_at']


# ── AI ────────────────────────────────────────────────────────────────────────

class GenerateCardsSerializer(serializers.Serializer):
    course_id   = serializers.IntegerField()
    chapter_id  = serializers.IntegerField(required=False)
    card_type   = serializers.ChoiceField(choices=['qa', 'def'], default='qa')
    count       = serializers.IntegerField(min_value=1, max_value=30, default=10)
    text        = serializers.CharField(required=False, allow_blank=True)  # Metin yapıştır
    chapter_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False
    )  # Kitaptan seç


# ── LIBRARY ───────────────────────────────────────────────────────────────────

class LibraryDocumentSerializer(serializers.ModelSerializer):
    """Kütüphane belgesi — dosya URL'si, işleme durumu ve çıkarılan metin içeriğiyle birlikte."""

    uploaded_by_name = serializers.ReadOnlyField(source='uploaded_by.full_name')
    course_name      = serializers.ReadOnlyField(source='course.name')
    chapter_name     = serializers.ReadOnlyField(source='chapter.name')
    file_url         = serializers.SerializerMethodField()

    class Meta:
        model  = LibraryDocument
        fields = [
            'id', 'title', 'description', 'file', 'file_url', 'file_type', 'file_size',
            'page_count', 'processing_status', 'text_content',
            'course', 'course_name', 'chapter', 'chapter_name',
            'uploaded_by', 'uploaded_by_name', 'is_public', 'created_at',
        ]
        read_only_fields = ['id', 'uploaded_by', 'file_type', 'file_size', 'page_count', 'processing_status', 'text_content', 'created_at']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None

    def create(self, validated_data):
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)


# ── IMAGE CARD ────────────────────────────────────────────────────────────────

class ImageCardSerializer(serializers.ModelSerializer):
    """Görsel hafıza kartı (bilgi kartı) — Pro plana özgü."""

    created_by_name = serializers.ReadOnlyField(source='created_by.full_name')
    course_name     = serializers.ReadOnlyField(source='course.name')
    chapter_name    = serializers.ReadOnlyField(source='chapter.name')
    image_url       = serializers.SerializerMethodField()

    class Meta:
        model  = ImageCard
        fields = [
            'id', 'title', 'description', 'image', 'image_url',
            'course', 'course_name', 'chapter', 'chapter_name',
            'created_by', 'created_by_name',
            'status', 'usage_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'usage_count', 'created_at', 'updated_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


# ── USER ACTIVITY ──────────────────────────────────────────────────────────────

class UserActivitySerializer(serializers.ModelSerializer):
    """Kullanıcı eylem kaydı — analitik ve AI geri bildirimi için."""

    class Meta:
        model  = UserActivity
        fields = [
            'id', 'action', 'entity_type', 'entity_id',
            'metadata', 'session_id', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


# ── DUS SINAV SORULARI ────────────────────────────────────────────────────────

class DUSExamQuestionSerializer(serializers.ModelSerializer):
    """Geçmiş DUS sınav sorusu — beş seçenek, doğru cevap ve açıklama."""

    course_name  = serializers.ReadOnlyField(source='course.name')
    chapter_name = serializers.ReadOnlyField(source='chapter.name')

    class Meta:
        model  = DUSExamQuestion
        fields = [
            'id', 'course', 'course_name', 'chapter', 'chapter_name',
            'year', 'question_text',
            'option_a', 'option_b', 'option_c', 'option_d', 'option_e',
            'correct_option', 'explanation', 'source', 'created_at',
        ]
        read_only_fields = ['id', 'added_by', 'created_at']

    def create(self, validated_data):
        validated_data['added_by'] = self.context['request'].user
        return super().create(validated_data)
