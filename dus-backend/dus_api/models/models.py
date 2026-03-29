"""
AYT TYT Flash veri modelleri.

Bu dosya uygulamanın tüm Django modellerini tanımlar:
- User / UserManager: E-posta tabanlı kimlik doğrulama ile özel kullanıcı modeli
- Subscription: Abonelik planları ve yaşam döngüsü yönetimi
- Course / Chapter: TYT/AYT bölümleri ve dersleri
- Flashcard / UserCardProgress: Kart sistemi ve SM-2 tabanlı SRS algoritması
- Quiz / QuizSession: Quiz yönetimi ve oturum takibi
- Question: Eğitmen-öğrenci soru-cevap sistemi
- Notification: Push / e-posta / uygulama içi bildirimler
- TrainerCommission: Eğitmen komisyon hesaplaması
- LibraryDocument: PDF referans belgesi kütüphanesi
- ImageCard: Pro kullanıcılara yönelik görsel hafıza kartları
- UserActivity: Analitik amaçlı tüm kullanıcı eylem kaydı
- DUSExamQuestion: Geçmiş yıl YKS sınavı soruları
"""

import logging
from datetime import timedelta

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone

logger = logging.getLogger(__name__)


# ── USER ─────────────────────────────────────────────────────────────────────

class UserManager(BaseUserManager):
    """Kullanıcı oluşturma için özel manager — e-posta alanı zorunludur."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('E-posta zorunludur')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Özel kullanıcı modeli — e-posta ile kimlik doğrulama.

    Roller: admin, trainer (eğitmen), support (müşteri hizmetleri), customer.
    Her giriş işleminde device_token yenilenir; bu sayede aynı anda yalnızca
    bir cihazdan oturum açılabilir (cihaz kilidi).
    """

    ROLE_CHOICES = [
        ('admin',    'Admin'),
        ('trainer',  'Eğitmen'),
        ('support',  'Müşteri Hizmetleri'),
        ('customer', 'Müşteri'),
    ]

    email        = models.EmailField(unique=True)
    first_name   = models.CharField(max_length=100)
    last_name    = models.CharField(max_length=100)
    role         = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    branch       = models.CharField(max_length=100, blank=True, null=True)  # Eğitmen branşı
    bio          = models.TextField(blank=True, null=True)
    avatar       = models.ImageField(upload_to='avatars/', blank=True, null=True)
    is_active    = models.BooleanField(default=True)
    is_staff     = models.BooleanField(default=False)
    date_joined  = models.DateTimeField(default=timezone.now)
    last_login   = models.DateTimeField(blank=True, null=True)

    # Eğitmen alanı
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=20.00, blank=True, null=True)

    # Cihaz kilidi — her login'de yeni token, birden fazla cihaz engellenir
    device_token = models.CharField(max_length=64, blank=True, null=True)

    # Müşteri alanları
    subscription = models.CharField(max_length=20, blank=True, null=True)  # pro, standart, baslangic
    trial_ends_at = models.DateTimeField(blank=True, null=True)
    streak_days  = models.IntegerField(default=0)
    last_study_date = models.DateField(blank=True, null=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        db_table = 'users'
        verbose_name = 'Kullanıcı'

    def __str__(self):
        return f'{self.first_name} {self.last_name} ({self.role})'

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'


# ── SUBSCRIPTION ─────────────────────────────────────────────────────────────

class Subscription(models.Model):
    """
    Kullanıcı abonelik kaydı.

    Her kullanıcının birden fazla abonelik kaydı olabilir (tarihsel).
    Aktif abonelik status='active' veya status='trial' olanıdır.
    auto_renew=True ise check_renewals yönetim komutu aboneliği otomatik yeniler.
    """

    PLAN_CHOICES = [
        ('pro',       'Pro — ₺499/ay'),
        ('standart',  'Standart — ₺449/ay'),
        ('baslangic', 'Başlangıç — ₺149/ay'),
        ('trial',     '3 Günlük Deneme'),
    ]
    STATUS_CHOICES = [
        ('active',    'Aktif'),
        ('cancelled', 'İptal Edildi'),
        ('expired',   'Süresi Doldu'),
        ('trial',     'Deneme'),
    ]

    user         = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    plan         = models.CharField(max_length=20, choices=PLAN_CHOICES)
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    starts_at    = models.DateTimeField(default=timezone.now)
    ends_at      = models.DateTimeField()
    price_paid   = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_yearly    = models.BooleanField(default=False)
    auto_renew   = models.BooleanField(default=True)   # Otomatik yenileme
    renewed_from = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='renewals')
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'subscriptions'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} — {self.plan} ({self.status})'

    @property
    def features(self):
        """Plana göre özellik listesi döndür"""
        base = {
            'all_courses': True,
            'unlimited_cards': True,
            'spaced_repetition': True,
            'quiz_mode': True,
            'ask_trainer': True,
        }
        if self.plan == 'pro':
            return {**base, 'ai_card_generation': True, 'ai_daily_plan': True, 'advanced_analytics': True, 'priority_support': True, 'knowledge_cards': True}
        elif self.plan == 'standart':
            return {**base, 'ai_card_generation': False, 'ai_daily_plan': True, 'advanced_analytics': True, 'priority_support': False, 'knowledge_cards': False}
        else:  # baslangic / trial
            return {**base, 'ai_card_generation': False, 'ai_daily_plan': False, 'advanced_analytics': False, 'priority_support': False, 'knowledge_cards': False}


# ── BOOK / DECK ───────────────────────────────────────────────────────────────

class Course(models.Model):
    """TYT/AYT bölümleri"""
    BRANCH_CHOICES = [
        ('tyt', 'TYT'),
        ('ayt', 'AYT'),
    ]

    name         = models.CharField(max_length=200)
    slug         = models.SlugField(unique=True)
    branch_type  = models.CharField(max_length=10, choices=BRANCH_CHOICES)
    description  = models.TextField(blank=True)
    order        = models.IntegerField(default=0)
    is_active    = models.BooleanField(default=True)
    icon_svg     = models.TextField(blank=True)  # SVG path data
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'courses'
        ordering = ['order']

    def __str__(self):
        return self.name


class Chapter(models.Model):
    """Ders bölümleri"""
    course       = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='chapters')
    name         = models.CharField(max_length=200)
    order        = models.IntegerField(default=0)
    is_active    = models.BooleanField(default=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chapters'
        ordering = ['order']

    def __str__(self):
        return f'{self.course.name} — {self.name}'


# ── FLASHCARD ─────────────────────────────────────────────────────────────────

class Flashcard(models.Model):
    """
    Çalışma kartı (flashcard).

    Eğitmenler tarafından oluşturulur, admin onayının ardından yayınlanır.
    ai_generated=True ise Claude API tarafından otomatik üretilmiştir.
    """

    TYPE_CHOICES = [
        ('qa',  'Soru — Cevap'),
        ('def', 'Tanım'),
    ]
    STATUS_CHOICES = [
        ('draft',    'Taslak'),
        ('pending',  'Onay Bekliyor'),
        ('published','Yayında'),
        ('rejected', 'Reddedildi'),
    ]

    course       = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='flashcards')
    chapter      = models.ForeignKey(Chapter, on_delete=models.SET_NULL, null=True, blank=True, related_name='flashcards')
    created_by   = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_cards')
    card_type    = models.CharField(max_length=5, choices=TYPE_CHOICES, default='qa')
    question     = models.TextField()
    answer       = models.TextField()
    status       = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    ai_generated = models.BooleanField(default=False)
    usage_count  = models.IntegerField(default=0)
    error_count  = models.IntegerField(default=0)  # Kaç kez yanlış yanıtlandı
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'flashcards'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.course.name} — {self.question[:50]}'


class UserCardProgress(models.Model):
    """
    Kullanıcının kart bazlı ilerleme ve SRS verisi.

    SM-2 Uzaylaştırılmış Tekrar algoritmasını uygular:
    - ease_factor: Kartın ne kadar kolay olduğunu gösterir (1.3–2.5 arası kalır).
    - interval: Bir sonraki tekrara kadar geçecek gün sayısı.
    - next_review: Sonraki tekrar zamanı.
    """
    user         = models.ForeignKey(User, on_delete=models.CASCADE, related_name='card_progress')
    card         = models.ForeignKey(Flashcard, on_delete=models.CASCADE, related_name='user_progress')
    confidence   = models.IntegerField(default=0)   # 1-5 Brainscape yöntemi
    correct      = models.IntegerField(default=0)    # Doğru sayısı
    wrong        = models.IntegerField(default=0)    # Yanlış sayısı
    next_review  = models.DateTimeField(default=timezone.now)  # SRS — bir sonraki tekrar
    interval     = models.IntegerField(default=1)    # SRS — gün cinsinden aralık
    ease_factor  = models.FloatField(default=2.5)    # SRS — SM2 algoritması
    last_reviewed = models.DateTimeField(blank=True, null=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_card_progress'
        unique_together = ('user', 'card')

    def __str__(self):
        return f'{self.user.email} — {self.card.id} (conf:{self.confidence})'

    def update_srs(self, confidence: int):
        """
        SM-2 algoritmasına göre kart aralığını ve kolaylık faktörünü günceller.

        Args:
            confidence: 1-5 arasında güven puanı (1=hiç bilmiyorum, 5=çok iyi biliyorum).

        Raises:
            ValueError: confidence 1-5 aralığı dışındaysa.
        """
        if not (1 <= confidence <= 5):
            raise ValueError(f'Confidence must be 1-5, got {confidence}')

        self.confidence = confidence
        if confidence >= 3:
            if self.interval == 1:
                self.interval = 6
                self.interval = min(self.interval, 365)
            elif self.interval == 6:
                self.interval = 1
                self.interval = min(self.interval, 365)
            else:
                self.interval = round(self.interval * self.ease_factor)
                self.interval = min(self.interval, 365)
            self.ease_factor = max(1.3, self.ease_factor + 0.1 - (5 - confidence) * 0.08)
        else:
            self.interval = 1
        self.next_review = timezone.now() + timedelta(days=self.interval)
        self.last_reviewed = timezone.now()
        self.save()


# ── QUIZ ─────────────────────────────────────────────────────────────────────

class Quiz(models.Model):
    """Quiz tanımı — bir veya daha fazla flashcard'dan oluşan sınav."""

    STATUS_CHOICES = [
        ('draft',    'Taslak'),
        ('published','Yayında'),
    ]

    course       = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quizzes')
    chapter      = models.ForeignKey(Chapter, on_delete=models.SET_NULL, null=True, blank=True)
    created_by   = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_quizzes')
    name         = models.CharField(max_length=200)
    description  = models.TextField(blank=True)
    cards        = models.ManyToManyField(Flashcard, blank=True)
    card_count   = models.IntegerField(default=20)
    time_limit   = models.IntegerField(default=30)  # Dakika
    status       = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    play_count   = models.IntegerField(default=0)
    avg_score    = models.FloatField(default=0)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'quizzes'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.course.name} — {self.name}'


class QuizSession(models.Model):
    """Kullanıcının quiz oturumu"""
    user         = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_sessions')
    quiz         = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='sessions', null=True, blank=True)
    course       = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True)
    total_cards  = models.IntegerField(default=0)
    correct      = models.IntegerField(default=0)
    wrong        = models.IntegerField(default=0)
    score_pct    = models.FloatField(default=0)
    avg_confidence = models.FloatField(default=0)
    duration_sec = models.IntegerField(default=0)
    completed    = models.BooleanField(default=False)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'quiz_sessions'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} — %{self.score_pct} ({self.created_at.date()})'


# ── QUESTION ─────────────────────────────────────────────────────────────────

class Question(models.Model):
    """Müşterilerin eğitmenlere sorduğu sorular ve cevapları."""

    STATUS_CHOICES = [
        ('pending',   'Bekliyor'),
        ('answered',  'Cevaplandı'),
        ('forwarded', 'Yönlendirildi'),
    ]

    user         = models.ForeignKey(User, on_delete=models.CASCADE, related_name='questions')
    course       = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True)
    card         = models.ForeignKey(Flashcard, on_delete=models.SET_NULL, null=True, blank=True, related_name='related_questions')
    question_text = models.TextField()
    answer_text  = models.TextField(blank=True, null=True)
    answered_by  = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='answered_questions')
    status       = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    created_at   = models.DateTimeField(auto_now_add=True)
    answered_at  = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'questions'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} → {self.question_text[:50]}'


# ── NOTIFICATION ─────────────────────────────────────────────────────────────

class Notification(models.Model):
    """Platform genelinde gönderilen push / e-posta / uygulama içi bildirimler."""

    TYPE_CHOICES = [
        ('push',   'Push Bildirimi'),
        ('email',  'E-posta'),
        ('inapp',  'Uygulama İçi'),
    ]
    TARGET_CHOICES = [
        ('all',      'Tüm Kullanıcılar'),
        ('pro',      'Pro Kullanıcılar'),
        ('standart', 'Standart Kullanıcılar'),
        ('trial',    'Trial Kullanıcılar'),
        ('specific', 'Belirli Kullanıcı'),
    ]

    title        = models.CharField(max_length=200)
    body         = models.TextField()
    notif_type   = models.CharField(max_length=10, choices=TYPE_CHOICES)
    target       = models.CharField(max_length=10, choices=TARGET_CHOICES, default='all')
    target_user  = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    sent_by      = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sent_notifications')
    sent_count   = models.IntegerField(default=0)
    read_count   = models.IntegerField(default=0)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} — {self.target}'


# ── TRAINER COMMISSION ────────────────────────────────────────────────────────

class TrainerCommission(models.Model):
    """Eğitmen komisyon kaydı — aylık brüt gelir ve komisyon tutarı."""

    trainer      = models.ForeignKey(User, on_delete=models.CASCADE, related_name='commissions')
    rate         = models.DecimalField(max_digits=5, decimal_places=2, default=20.00)  # %20
    month        = models.DateField()  # Yıl-ay bazlı
    gross_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    commission_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    paid         = models.BooleanField(default=False)
    paid_at      = models.DateTimeField(blank=True, null=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'trainer_commissions'
        unique_together = ('trainer', 'month')

    def __str__(self):
        return f'{self.trainer.full_name} — {self.month} — ₺{self.commission_amount}'


# ── LIBRARY ───────────────────────────────────────────────────────────────────

class LibraryDocument(models.Model):
    """Kaynak kütüphanesi — kart/quiz/soru oluşturmak için referans belgeler"""
    FILE_TYPE_CHOICES = [
        ('pdf',   'PDF'),
        ('excel', 'Excel'),
        ('image', 'Görsel'),
        ('word',  'Word'),
        ('other', 'Diğer'),
    ]

    PROCESSING_STATUS_CHOICES = [
        ('pending',    'Bekliyor'),
        ('processing', 'İşleniyor'),
        ('done',       'Tamamlandı'),
        ('error',      'Hata'),
    ]

    title             = models.CharField(max_length=300)
    description       = models.TextField(blank=True)
    file              = models.FileField(upload_to='library/')
    file_type         = models.CharField(max_length=10, choices=FILE_TYPE_CHOICES, default='other')
    file_size         = models.IntegerField(default=0)  # bytes
    page_count        = models.IntegerField(default=0)
    text_content      = models.TextField(blank=True)   # extracted PDF text
    processing_status = models.CharField(max_length=20, choices=PROCESSING_STATUS_CHOICES, default='pending')
    course      = models.ForeignKey(Course,  on_delete=models.SET_NULL, null=True, blank=True, related_name='library_docs')
    chapter     = models.ForeignKey(Chapter, on_delete=models.SET_NULL, null=True, blank=True, related_name='library_docs')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='library_docs')
    is_public   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'library_documents'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} ({self.file_type})'

    def save(self, *args, **kwargs):
        if self.file and hasattr(self.file, 'name'):
            name = self.file.name.lower()
            if name.endswith('.pdf'):
                self.file_type = 'pdf'
            elif name.endswith(('.xls', '.xlsx', '.csv')):
                self.file_type = 'excel'
            elif name.endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
                self.file_type = 'image'
            elif name.endswith(('.doc', '.docx')):
                self.file_type = 'word'
            try:
                self.file_size = self.file.size
            except Exception:
                pass
        super().save(*args, **kwargs)
        # Extract text from PDF after initial save (file is now written to disk)
        if self.file_type == 'pdf' and not self.text_content and self.processing_status == 'pending':
            self._extract_pdf_text()

    def _extract_pdf_text(self):
        """Extract text content from PDF using pymupdf (fitz)."""
        try:
            import fitz  # pymupdf
            self.__class__.objects.filter(pk=self.pk).update(processing_status='processing')
            with self.file.open('rb') as f:
                pdf_bytes = f.read()
            doc = fitz.open(stream=pdf_bytes, filetype='pdf')
            pages = []
            for page in doc:
                pages.append(page.get_text())
            doc.close()
            text = '\n\n'.join(pages)
            self.__class__.objects.filter(pk=self.pk).update(
                text_content=text,
                page_count=len(pages),
                processing_status='done',
            )
        except Exception as e:
            logger.error(f'PDF extraction failed for doc {self.pk}: {e}')
            self.__class__.objects.filter(pk=self.pk).update(processing_status='error')


# ── IMAGE CARD (BİLGİ KARTI) ──────────────────────────────────────────────────

class ImageCard(models.Model):
    """Görsel hafıza kartları — Pro kullanıcıya özel"""
    STATUS_CHOICES = [
        ('draft',    'Taslak'),
        ('pending',  'Onay Bekliyor'),
        ('published','Yayında'),
        ('rejected', 'Reddedildi'),
    ]

    title       = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    image       = models.ImageField(upload_to='image_cards/')
    course      = models.ForeignKey(Course,  on_delete=models.CASCADE,  related_name='image_cards')
    chapter     = models.ForeignKey(Chapter, on_delete=models.SET_NULL, null=True, blank=True, related_name='image_cards')
    created_by  = models.ForeignKey(User,    on_delete=models.SET_NULL, null=True, related_name='created_image_cards')
    status      = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    usage_count = models.IntegerField(default=0)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'image_cards'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.course.name} — {self.title}'


# ── USER ACTIVITY LOG ─────────────────────────────────────────────────────────

class UserActivity(models.Model):
    """Tüm kullanıcı eylemlerini loglar — analitik, AI feedback ve marketing için"""

    user        = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    action      = models.CharField(max_length=50)
    # Örnek action değerleri:
    # card_viewed, card_rated, card_skipped
    # image_card_viewed, image_card_known, image_card_review, image_card_skipped
    # quiz_started, quiz_completed, deck_opened, page_visited
    entity_type = models.CharField(max_length=30, blank=True)   # card, quiz, image_card, deck...
    entity_id   = models.IntegerField(null=True, blank=True)
    metadata    = models.JSONField(default=dict, blank=True)     # ek veri (score, confidence...)
    session_id  = models.CharField(max_length=100, blank=True)  # frontend oturum ID'si
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_activities'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'action']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['entity_type', 'entity_id']),
        ]

    def __str__(self):
        return f'{self.user.email} — {self.action} ({self.entity_type}:{self.entity_id})'


# ── DUS SINAV SORULARI ────────────────────────────────────────────────────────

class DUSExamQuestion(models.Model):
    """
    Gerçek DUS sınav soruları — bölüm bazlı.

    Geçmiş yıl sorular admin tarafından sisteme eklenir;
    müşteriler kart çalışırken bu sorulara erişebilir.
    """
    OPTION_CHOICES = [('A','A'),('B','B'),('C','C'),('D','D'),('E','E')]

    course          = models.ForeignKey(Course,  on_delete=models.CASCADE, related_name='exam_questions')
    chapter         = models.ForeignKey(Chapter, on_delete=models.SET_NULL, null=True, blank=True, related_name='exam_questions')
    year            = models.IntegerField()
    question_text   = models.TextField()
    option_a        = models.CharField(max_length=500)
    option_b        = models.CharField(max_length=500)
    option_c        = models.CharField(max_length=500)
    option_d        = models.CharField(max_length=500)
    option_e        = models.CharField(max_length=500, blank=True)
    correct_option  = models.CharField(max_length=1, choices=OPTION_CHOICES)
    explanation     = models.TextField(blank=True)
    source          = models.CharField(max_length=200, blank=True)  # ör: "DUS 2023 Ekim"
    added_by        = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='added_exam_questions')
    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'dus_exam_questions'
        ordering = ['-year', '-created_at']

    def __str__(self):
        return f'{self.course.name} — {self.year} — {self.question_text[:50]}'
