# DUSakademisi — Frontend (React + Vite)

## Kurulum

```bash
cd dus-frontend
npm install
cp .env.example .env
npm run dev
# → http://localhost:5173
```

## .env

```
VITE_API_URL=http://localhost:8000/api/v1
```

## Klasör Yapısı

```
src/
├── api/
│   └── client.js          ← Axios instance + tüm API fonksiyonları
├── context/
│   ├── AuthContext.jsx     ← JWT auth, rol kontrolü
│   └── ThemeContext.jsx    ← Dark/Light tema
├── components/
│   └── shared/
│       └── index.jsx       ← LogoSVG, ThemeToggle, Layout'lar, KpiCard, Badge
├── pages/
│   ├── auth/
│   │   ├── LoginPage.jsx   ← Tüm roller için tek giriş
│   │   └── RegisterPage.jsx
│   ├── admin/              ← 8 sayfa (Dashboard, Users, Trainers, Content, Pricing, Reports, Notifications, Settings)
│   ├── trainer/            ← 7 sayfa
│   ├── support/            ← 7 sayfa
│   └── customer/           ← 6 sayfa (Home, Decks, Quiz, Progress, Shop, Profile)
├── styles/
│   ├── index.css           ← Global CSS değişkenleri, body
│   └── shared.module.css   ← Ortak CSS modülü
├── data/
│   └── index.js            ← 14 DUS dersi, abonelik planları, quiz kartları, SM-2
├── hooks/                  ← Custom hooks (eklenecek)
├── App.jsx                 ← Router + route guards
└── main.jsx                ← Entry point
```

## Rol Bazlı Routing

```
/login        → Tüm roller
/register     → Yeni kullanıcı (3 gün trial otomatik)
/admin        → Sadece admin
/trainer      → Sadece trainer
/support      → Sadece support
/app          → Sadece customer
```

## Auth Flow

1. `POST /auth/login/` → JWT access + refresh token
2. Token localStorage'a kaydedilir
3. Her request'te `Authorization: Bearer {token}` header'ı eklenir
4. Token süresi dolunca refresh token ile yenilenir
5. Refresh de geçersizse `/login`'e yönlendirilir

## Abonelik Kontrolü

```jsx
const { hasPro, hasStandart, hasTrial, hasAI } = useAuth()

// AI özelliği — sadece Pro
{hasAI && <button>AI Kart Üret</button>}
```

## Quiz Modu

- Flashcard çevirme animasyonu (CSS 3D perspective)
- Brainscape güven puanı (1-5)
- SM-2 SRS algoritması (calcSM2 fonksiyonu)
- Sonuç ekranı (skor, doğru/yanlış, ort. güven)
- Backend'e otomatik gönderim
