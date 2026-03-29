import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { imageCardsAPI, activityAPI } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { TYT_BOLUMLER, AYT_BOLUMLER } from '../../data'
import { COURSE_ICON_MAP } from '../../data/courseIcons'
import { ThemeToggle } from '../../components/shared'
import styles from '../../styles/shared.module.css'

const MOCK_IMAGE_CARDS = [
  { id:1, title:'Türkçe — Cümle Yapısı', description:'Özne, yüklem, nesne ilişkisi', course_name:'Türkçe (TYT)', chapter_name:'Paragraf', status:'published', image_url:null },
  { id:2, title:'Matematik — Kareler Farkı', description:'(a+b)(a-b) = a²-b²', course_name:'Matematik (TYT)', chapter_name:'Temel Matematik', status:'published', image_url:null },
  { id:3, title:'Fizik — Newton Yasaları', description:'F=ma, Eylemsizlik', course_name:'Fen Bilimleri (TYT)', chapter_name:'Fizik', status:'published', image_url:null },
  { id:4, title:'Biyoloji — Hücre', description:'Mitoz ve Mayoz farkları', course_name:'Fen Bilimleri (TYT)', chapter_name:'Biyoloji', status:'published', image_url:null },
  { id:5, title:'AYT Türev', description:'Türev tanımı ve kuralları', course_name:'Matematik (AYT)', chapter_name:'Matematik', status:'published', image_url:null },
  { id:6, title:'AYT Edebiyat', description:'Tanzimat dönemi özellikleri', course_name:'Edebiyat – Sosyal Bil. 1', chapter_name:'Türk Dili ve Edebiyatı', status:'published', image_url:null },
]

// ── Pro Gate ─────────────────────────────────────────────────────────────────
function ProGate() {
  const navigate = useNavigate()
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh', padding: 24, textAlign: 'center',
    }}>
      <div style={{
        width: 88, height: 88, borderRadius: 28,
        background: 'linear-gradient(135deg,#7C3AED22,#A78BFA22)',
        border: '1.5px solid #A78BFA44',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 38, marginBottom: 20,
      }}>🔒</div>
      <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--t1)', marginBottom: 8 }}>
        Pro Özelliği
      </div>
      <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6, marginBottom: 24, maxWidth: 300 }}>
        Bilgi Kartları görsel hafıza güçlendirme sistemi <strong>Pro</strong> planına özeldir.
        Görseller ile öğrenme hızını 3x artır.
      </div>
      <button
        className={`${styles.btn} ${styles.btnPrimary}`}
        style={{ background: 'linear-gradient(135deg,#7C3AED,#A78BFA)', minWidth: 180 }}
        onClick={() => navigate('/app/shop')}
      >
        Pro'ya Geç
      </button>
    </div>
  )
}

// ── Card Viewer ───────────────────────────────────────────────────────────────
function CardViewer({ cards, onDone }) {
  const [idx, setIdx] = useState(0)
  const [showDesc, setShowDesc] = useState(false)
  const [results, setResults] = useState([])

  const card = cards[idx]
  const progress = Math.round(((idx) / cards.length) * 100)

  const logAction = useCallback((action, card) => {
    activityAPI.log({
      action,
      entity_type: 'image_card',
      entity_id: card.id,
      metadata: { course: card.course, title: card.title },
    }).catch(() => {}) // sessiz fail — loglama asla UX'i engellemesin
  }, [])

  const next = (action) => {
    logAction(action, card)
    setShowDesc(false)
    if (idx + 1 >= cards.length) {
      onDone([...results, { id: card.id, action }])
    } else {
      setResults(prev => [...prev, { id: card.id, action }])
      setIdx(i => i + 1)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '80vh' }}>
      {/* Progress bar */}
      <div style={{ padding: '12px 0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600 }}>
            {idx + 1} / {cards.length}
          </span>
          <span style={{ fontSize: 11, color: 'var(--t3)' }}>{card.course_name}</span>
        </div>
        <div style={{ height: 4, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: 'linear-gradient(90deg,#00AADD,#A78BFA)',
            transition: 'width .3s ease', borderRadius: 4,
          }} />
        </div>
      </div>

      {/* Card */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Image */}
        <div
          style={{
            width: '100%', aspectRatio: '4/3', borderRadius: 20, overflow: 'hidden',
            background: 'var(--border)', marginTop: 12, cursor: 'pointer',
            position: 'relative',
          }}
          onClick={() => setShowDesc(v => !v)}
        >
          {card.image_url ? (
            <img
              src={card.image_url}
              alt={card.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,rgba(0,80,140,.4),rgba(0,170,221,.2))' }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🖼️</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>Görsel yükleniyor...</div>
            </div>
          )}
          {/* Tap hint overlay */}
          {!showDesc && (
            <div style={{
              position: 'absolute', bottom: 12, right: 12,
              background: 'rgba(0,0,0,.55)', borderRadius: 8, padding: '4px 10px',
              fontSize: 10, color: 'rgba(255,255,255,.85)', fontWeight: 600,
            }}>
              Açıklama için dokun
            </div>
          )}
        </div>

        {/* Title */}
        <div style={{
          fontSize: 15, fontWeight: 800, color: 'var(--t1)',
          marginTop: 14, lineHeight: 1.4, padding: '0 2px',
        }}>
          {card.title}
        </div>

        {/* Description (shown on tap) */}
        {showDesc && card.description && (
          <div style={{
            marginTop: 10, padding: '12px 14px',
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 14, fontSize: 12, color: 'var(--t2)', lineHeight: 1.6,
          }}>
            {card.description}
          </div>
        )}

        {/* Course / Chapter badges */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
          {card.course_name && (
            <span style={{
              padding: '3px 9px', borderRadius: 7, fontSize: 10, fontWeight: 700,
              background: 'rgba(0,170,221,.12)', color: '#00AADD',
            }}>{card.course_name}</span>
          )}
          {card.chapter_name && (
            <span style={{
              padding: '3px 9px', borderRadius: 7, fontSize: 10, fontWeight: 600,
              background: 'var(--border)', color: 'var(--t3)',
            }}>{card.chapter_name}</span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, paddingTop: 16 }}>
        <button
          onClick={() => next('image_card_review')}
          style={{
            padding: '14px 8px', borderRadius: 14, border: 'none', cursor: 'pointer',
            background: 'rgba(251,191,36,.12)', color: '#F59E0B',
            fontFamily: 'Montserrat', fontWeight: 800, fontSize: 11,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}
        >
          <span style={{ fontSize: 20 }}>🔄</span>
          Tekrar Bak
        </button>
        <button
          onClick={() => next('image_card_known')}
          style={{
            padding: '14px 8px', borderRadius: 14, border: 'none', cursor: 'pointer',
            background: 'rgba(16,185,129,.12)', color: '#10B981',
            fontFamily: 'Montserrat', fontWeight: 800, fontSize: 11,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}
        >
          <span style={{ fontSize: 20 }}>✓</span>
          Biliyorum
        </button>
        <button
          onClick={() => next('image_card_skipped')}
          style={{
            padding: '14px 8px', borderRadius: 14, border: 'none', cursor: 'pointer',
            background: 'var(--border)', color: 'var(--t3)',
            fontFamily: 'Montserrat', fontWeight: 800, fontSize: 11,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}
        >
          <span style={{ fontSize: 20 }}>→</span>
          Geç
        </button>
      </div>
    </div>
  )
}

// ── Results Screen ────────────────────────────────────────────────────────────
function ResultsScreen({ results, total, onRestart }) {
  const known   = results.filter(r => r.action === 'image_card_known').length
  const review  = results.filter(r => r.action === 'image_card_review').length
  const skipped = results.filter(r => r.action === 'image_card_skipped').length
  const pct     = Math.round((known / total) * 100)

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '70vh', padding: 24, textAlign: 'center',
    }}>
      <div style={{ fontSize: 52, marginBottom: 12 }}>
        {pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '📚'}
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--t1)', marginBottom: 6 }}>
        Tur Tamamlandı!
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color: '#00AADD', marginBottom: 20 }}>
        %{pct}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28, width: '100%',
      }}>
        {[
          { label: 'Biliyorum', count: known,   color: '#10B981', bg: 'rgba(16,185,129,.1)' },
          { label: 'Tekrar',    count: review,  color: '#F59E0B', bg: 'rgba(251,191,36,.1)' },
          { label: 'Geçtim',   count: skipped, color: 'var(--t3)', bg: 'var(--border)' },
        ].map(s => (
          <div key={s.label} style={{
            borderRadius: 14, padding: '14px 8px', background: s.bg,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.count}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: s.color }}>{s.label}</span>
          </div>
        ))}
      </div>

      <button
        className={`${styles.btn} ${styles.btnPrimary}`}
        onClick={onRestart}
        style={{ minWidth: 180 }}
      >
        Tekrar Başla
      </button>
    </div>
  )
}

// ── Filter Bar ────────────────────────────────────────────────────────────────
function CardFilterBar({ courses, selected, onSelect }) {
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
      <button
        onClick={() => onSelect('')}
        style={{
          flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
          fontFamily: 'Montserrat', fontWeight: 700, fontSize: 11,
          background: !selected ? '#00AADD' : 'var(--border)',
          color: !selected ? '#fff' : 'var(--t2)',
        }}
      >Tümü</button>
      {courses.map(c => (
        <button
          key={c.id}
          onClick={() => onSelect(String(c.id))}
          style={{
            flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
            fontFamily: 'Montserrat', fontWeight: 700, fontSize: 11,
            background: selected === String(c.id) ? '#00AADD' : 'var(--border)',
            color: selected === String(c.id) ? '#fff' : 'var(--t2)',
          }}
        >{c.name}</button>
      ))}
    </div>
  )
}

// ── Course Select Phase ───────────────────────────────────────────────────────
function CourseSelectScreen({ onSelect }) {
  const MixRow = ({ icon, label, sub, gradient, border, value }) => (
    <div onClick={() => onSelect(value)}
      style={{ borderRadius: 16, padding: '16px 14px', cursor: 'pointer', background: gradient,
        border: `1px solid ${border}`, transition: 'transform .18s', marginBottom: 10 }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = ''}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 26, flexShrink: 0 }}>{icon}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>{label}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>{sub}</div>
        </div>
      </div>
    </div>
  )

  const DeckRow = ({ deck, type }) => {
    const Icon = COURSE_ICON_MAP[deck.slug]
    const color = type === 'tyt' ? '#4A90D0' : '#D0506A'
    return (
      <div onClick={() => onSelect(String(deck.id))}
        style={{ borderRadius: 14, padding: '12px 14px', background: 'var(--card)',
          border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
          gap: 12, marginBottom: 8, cursor: 'pointer', transition: 'transform .15s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
        onMouseLeave={e => e.currentTarget.style.transform = ''}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {Icon ? <Icon color={color} size={18} /> : <span>🖼️</span>}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)' }}>{deck.name}</div>
          <div style={{ fontSize: 10, color: 'var(--t3)' }}>{type === 'tyt' ? 'TYT bölümü' : 'AYT bölümü'}</div>
        </div>
        <div style={{ fontSize: 16, color: 'var(--t3)' }}>›</div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 18 }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 900, color: 'var(--t1)' }}>Bilgi Kartları</div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>Görsel hafıza güçlendirme ✦ Pro</div>
        </div>
        <ThemeToggle />
      </div>

      <MixRow icon="🔀" label="Hepsini Karıştır" sub="Tüm bölümlerden bilgi kartları"
        gradient="linear-gradient(145deg,rgba(80,40,140,.55),rgba(120,80,200,.35))"
        border="rgba(160,139,250,.35)" value="" />
      <MixRow icon="📚" label="TYT Bölümleri" sub="Türkçe, Matematik, Fen..."
        gradient="linear-gradient(145deg,rgba(74,144,208,.55),rgba(0,170,221,.35))"
        border="rgba(74,144,208,.4)" value="tyt" />
      <MixRow icon="🎓" label="AYT Bölümleri" sub="Fen, Matematik, Edebiyat..."
        gradient="linear-gradient(145deg,rgba(192,64,96,.55),rgba(255,112,144,.3))"
        border="rgba(208,80,106,.4)" value="ayt" />

      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(74,144,208,.9)', letterSpacing: '.08em',
        textTransform: 'uppercase', marginBottom: 10, marginTop: 4,
        display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>TYT</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(74,144,208,.2)' }}/>
      </div>
      {TYT_BOLUMLER.map(d => <DeckRow key={d.id} deck={d} type="tyt" />)}

      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(208,80,106,.9)', letterSpacing: '.08em',
        textTransform: 'uppercase', marginBottom: 10, marginTop: 4,
        display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>AYT</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(208,80,106,.2)' }}/>
      </div>
      {AYT_BOLUMLER.map(d => <DeckRow key={d.id} deck={d} type="ayt" />)}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CustomerImageCards() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [phase, setPhase]               = useState('select')
  const [courseFilter, setCourseFilter] = useState('')
  const [sessionCards, setSessionCards] = useState(null)
  const [done, setDone] = useState(false)
  const [results, setResults] = useState([])

  // Log page visit
  useState(() => {
    activityAPI.log({ action: 'page_visited', entity_type: 'page', metadata: { page: 'image_cards' } }).catch(() => {})
  })

  const isPro = user?.subscription === 'pro'

  const { data: cardsResp, isLoading, error, isError } = useQuery({
    queryKey: ['image-cards', courseFilter],
    queryFn: () => imageCardsAPI.list({ course: courseFilter || undefined }).then(r => r.data),
    enabled: isPro && phase === 'browse',
    retry: 1,
  })

  const { data: coursesData } = useQuery({
    queryKey: ['image-cards-courses'],
    queryFn: () => imageCardsAPI.list().then(r => {
      const cards = r.data?.results ?? r.data ?? []
      const map = {}
      cards.forEach(c => { if (c.course) map[c.course] = { id: c.course, name: c.course_name } })
      return Object.values(map)
    }),
    enabled: isPro,
    retry: 1,
  })

  const rawCards = cardsResp?.results ?? cardsResp ?? []
  const filteredMock = courseFilter
    ? MOCK_IMAGE_CARDS.filter(c => c.course_name?.toLowerCase().includes(courseFilter === 'tyt' ? 'tyt' : courseFilter === 'ayt' ? 'ayt' : courseFilter))
    : MOCK_IMAGE_CARDS
  const cards = (isError || rawCards.length === 0) ? filteredMock : rawCards
  const courses = coursesData ?? []

  const startSession = () => {
    if (!cards.length) return
    setSessionCards([...cards].sort(() => Math.random() - 0.5))
    setDone(false)
    setResults([])
    activityAPI.log({ action: 'deck_opened', entity_type: 'image_cards', metadata: { course: courseFilter, count: cards.length } }).catch(() => {})
  }

  const handleDone = (res) => {
    setResults(res)
    setDone(true)
    setSessionCards(null)
  }

  if (!isPro) return (
    <div style={{ padding: '0 0 80px' }}>
      <div style={{ padding: '20px 0 12px', fontWeight: 900, fontSize: 18, color: 'var(--t1)' }}>
        Bilgi Kartları
      </div>
      <ProGate />
    </div>
  )

  // Ders seçim ekranı
  if (phase === 'select') return (
    <div style={{ padding: '0 0 80px' }}>
      <CourseSelectScreen onSelect={(filter) => {
        setCourseFilter(filter)
        setSessionCards(null)
        setDone(false)
        setResults([])
        setPhase('browse')
      }} />
    </div>
  )

  return (
    <div style={{ padding: '0 0 80px' }}>
      <div style={{ padding: '20px 0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => { setPhase('select'); setSessionCards(null); setDone(false) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)',
                fontSize: 18, padding: 0, lineHeight: 1 }}>←</button>
            <div style={{ fontWeight: 900, fontSize: 18, color: 'var(--t1)' }}>Bilgi Kartları</div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
            Görsel hafıza güçlendirme
          </div>
        </div>
        {!sessionCards && !done && (
          <span style={{
            padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700,
            background: 'rgba(160,139,250,.15)', color: '#A78BFA',
          }}>✦ PRO</span>
        )}
      </div>

      {/* Active session */}
      {sessionCards && (
        <CardViewer cards={sessionCards} onDone={handleDone} />
      )}

      {/* Results */}
      {done && (
        <ResultsScreen
          results={results}
          total={sessionCards?.length ?? results.length}
          onRestart={() => { setDone(false); setSessionCards(null); setPhase('select') }}
        />
      )}

      {/* Browse mode */}
      {!sessionCards && !done && (
        <>
          {courses.length > 0 && (
            <CardFilterBar courses={courses} selected={courseFilter} onSelect={setCourseFilter} />
          )}

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--t3)' }}>Yükleniyor...</div>
          ) : error?.response?.data?.pro_required ? (
            <ProGate />
          ) : cards.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🖼️</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>
                Henüz bilgi kartı yok
              </div>
              <div style={{ fontSize: 11, color: 'var(--t3)' }}>
                {courseFilter ? 'Bu ders için kart eklenmemiş.' : 'Yakında eklenecek.'}
              </div>
            </div>
          ) : (
            <>
              {/* Start session button */}
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                style={{
                  width: '100%', padding: '16px', marginBottom: 20, fontSize: 14,
                  background: 'linear-gradient(135deg,#00AADD,#0077AA)',
                }}
                onClick={startSession}
              >
                Çalışmaya Başla — {cards.length} Kart
              </button>

              {/* Card grid preview */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {cards.map(card => (
                  <div key={card.id} style={{
                    borderRadius: 14, overflow: 'hidden',
                    background: 'var(--card)', border: '1px solid var(--border)',
                  }}>
                    <div style={{ width: '100%', aspectRatio: '3/2', overflow: 'hidden', background: 'var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {card.image_url ? (
                        <img
                          src={card.image_url}
                          alt={card.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      ) : (
                        <div style={{ fontSize: 28, opacity: 0.4 }}>🖼️</div>
                      )}
                    </div>
                    <div style={{ padding: '8px 10px' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t1)', lineHeight: 1.3 }}>
                        {card.title}
                      </div>
                      {card.course_name && (
                        <div style={{ fontSize: 9, color: '#00AADD', marginTop: 3, fontWeight: 600 }}>
                          {card.course_name}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
