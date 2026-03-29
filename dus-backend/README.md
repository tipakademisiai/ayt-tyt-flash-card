# DUSakademisi — Backend (Django + MongoDB)

## Kurulum

```bash
cd dus-backend

# Virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Bağımlılıklar
pip install -r requirements.txt

# .env dosyası
cp .env.example .env
# .env dosyasını düzenle (SECRET_KEY, MONGODB_URI, ANTHROPIC_API_KEY)

# MongoDB'nin çalıştığından emin ol
mongod --dbpath /data/db

# Migration
python manage.py makemigrations
python manage.py migrate

# Superuser (Admin)
python manage.py createsuperuser

# Seed data (14 DUS dersi)
python manage.py seed_courses

# Sunucuyu başlat
python manage.py runserver
```

## API Endpoint'leri

### Auth
| Method | URL | Açıklama | Auth |
|--------|-----|----------|------|
| POST | `/api/v1/auth/login/` | Giriş | ✗ |
| POST | `/api/v1/auth/register/` | Kayıt + 3 gün trial | ✗ |
| POST | `/api/v1/auth/logout/` | Çıkış | ✓ |
| GET/PATCH | `/api/v1/auth/me/` | Mevcut kullanıcı | ✓ |

### Kullanıcılar
| Method | URL | Açıklama | Rol |
|--------|-----|----------|-----|
| GET | `/api/v1/users/` | Liste | admin/support |
| GET | `/api/v1/users/{id}/` | Detay | admin/support |
| PATCH | `/api/v1/users/{id}/` | Güncelle | admin/support |
| POST | `/api/v1/users/{id}/suspend/` | Askıya al | admin/support |
| POST | `/api/v1/users/{id}/activate/` | Aktive et | admin/support |

### Dersler
| Method | URL | Açıklama |
|--------|-----|----------|
| GET | `/api/v1/books/` | 14 DUS dersi |
| GET | `/api/v1/books/{id}/` | Ders detayı + bölümler |

### Flashcardlar
| Method | URL | Açıklama | Rol |
|--------|-----|----------|-----|
| GET | `/api/v1/cards/` | Liste | tüm roller |
| POST | `/api/v1/cards/` | Yeni kart | trainer/admin/support |
| GET | `/api/v1/cards/due/` | Bugün çalışılacak (SRS) | customer |
| POST | `/api/v1/cards/{id}/approve/` | Onayla | admin/support |
| POST | `/api/v1/cards/{id}/reject/` | Reddet | admin/support |
| POST | `/api/v1/cards/{id}/rate/` | Güven puanı (1-5) | customer |

### Quiz
| Method | URL | Açıklama |
|--------|-----|----------|
| GET | `/api/v1/quiz/` | Quizler |
| POST | `/api/v1/quiz/submit/` | Sonuç gönder + SRS güncelle |

### Sorular
| Method | URL | Açıklama | Rol |
|--------|-----|----------|-----|
| GET | `/api/v1/questions/` | Liste | |
| POST | `/api/v1/questions/` | Soru sor | customer |
| POST | `/api/v1/questions/{id}/answer/` | Cevapla | trainer/admin/support |

### AI
| Method | URL | Açıklama | Rol |
|--------|-----|----------|-----|
| POST | `/api/v1/ai/generate-cards/` | Claude ile kart üret | pro plan |

### Abonelik
| Method | URL | Açıklama |
|--------|-----|----------|
| GET | `/api/v1/subscriptions/` | Abonelikler |
| POST | `/api/v1/subscriptions/` | Yeni abonelik |
| POST | `/api/v1/subscriptions/{id}/cancel/` | İptal et |

### Bildirimler
| Method | URL | Açıklama | Rol |
|--------|-----|----------|-----|
| POST | `/api/v1/notifications/send/` | Bildirim gönder | admin/support |

### Raporlar
| Method | URL | Açıklama | Rol |
|--------|-----|----------|-----|
| GET | `/api/v1/reports/` | Platform raporu | admin/support |

## API Docs
Sunucu çalışırken: http://localhost:8000/api/docs/

## Roller ve Yetkiler

```
admin    → Her şey
trainer  → Kendi kartları/quizleri, soruları cevapla
support  → admin'e yakın, ücret/komisyon hariç
customer → Çalış, quiz çöz, soru sor (plan'a göre AI erişimi)
```

## Abonelik Planları

```python
PLANS = {
    'pro':       {'price': 499, 'ai_cards': True,  'ai_plan': True},
    'standart':  {'price': 449, 'ai_cards': False, 'ai_plan': True},
    'baslangic': {'price': 149, 'ai_cards': False, 'ai_plan': False},
    'trial':     {'price': 0,   'duration': 3},  # 3 gün
}
```

## SRS Algoritması (SM-2)

```python
# Her kart için güven puanı (1-5) alınır
# Brainscape yöntemi ile SRS hesaplanır
# Sonraki tekrar günü otomatik hesaplanır
UserCardProgress.update_srs(confidence=4)
```
