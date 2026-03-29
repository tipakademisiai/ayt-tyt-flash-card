import { useState, useCallback } from 'react'
import { ThemeToggle } from '../../components/shared'
import { TEMEL_DERSLER, KLINIK_DERSLER, DECK_CARDS, MIX_ALL, MIX_TEMEL, MIX_KLINIK, SRS_COLORS } from '../../data'
import { COURSE_ICON_MAP } from '../../data/courseIcons'

// ── Kurs seçim kartı ──────────────────────────────────────────
function CourseCard({ deck, type, onSelect }) {
  const Icon = COURSE_ICON_MAP[deck.slug]
  const accentColor = type === 'temel' ? '#4A90D0' : '#D0506A'
  const fillColor   = type === 'temel'
    ? 'linear-gradient(90deg,#4A90D0,#00AADD)'
    : 'linear-gradient(90deg,#C04060,#FF7090)'

  return (
    <div
      onClick={onSelect}
      style={{
        borderRadius: 18, padding: '18px 14px 14px', cursor: 'pointer',
        transition: 'transform .18s, box-shadow .18s',
        background: 'var(--card)', border: '1px solid var(--border)',
        textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.12)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
      <div style={{ marginBottom: 10 }}>
        {Icon ? <Icon color={accentColor} size={46} /> : <span style={{ fontSize: 32 }}>📚</span>}
      </div>
      <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--t1)', marginBottom: 3, lineHeight: 1.3,
        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: 30 }}>
        {deck.name}
      </div>
      <div style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 10 }}>{deck.cards} kart</div>
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 8, minHeight: 10 }}>
        {deck.srs.filter(l => l > 0).map((l, i) => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: SRS_COLORS[l - 1] }}/>
        ))}
      </div>
      <div style={{ width: '100%', height: 3, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 5 }}>
        <div style={{ width: `${deck.done}%`, height: '100%', borderRadius: 99, background: fillColor }}/>
      </div>
      <div style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 600 }}>%{deck.done} · {deck.pending} bekliyor</div>
    </div>
  )
}

// ── MIX kartı ────────────────────────────────────────────────
function MixCard({ icon, label, sub, gradient, border, count, onSelect }) {
  return (
    <div onClick={onSelect}
      style={{ borderRadius: 16, padding: '16px 14px', cursor: 'pointer',
        background: gradient, border: `1px solid ${border}`,
        transition: 'transform .18s, box-shadow .18s', marginBottom: 10 }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.15)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 26, flexShrink: 0 }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>{label}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>{sub}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>{count}</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.5)' }}>kart</div>
        </div>
      </div>
    </div>
  )
}

// ── Flash kart çalışma görünümü ───────────────────────────────
function StudyView({ cards, deckName, onFinish }) {
  const [idx, setIdx]       = useState(0)
  const [flipped, setFlip]  = useState(false)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong]     = useState(0)
  const [confSum, setConfSum] = useState(0)

  const CONF_LABELS = ['', 'Hiç', 'Az', 'Orta', 'İyi', 'Tam']
  const CONF_COLORS = ['', '#E05070', '#F5821E', '#F5C842', '#4BC880', '#10B981']

  const current = cards[idx]

  const rate = useCallback((confidence) => {
    const isOk = confidence >= 3
    if (isOk) setCorrect(c => c + 1)
    else setWrong(w => w + 1)
    setConfSum(s => s + confidence)

    if (idx + 1 >= cards.length) {
      onFinish({ correct: correct + (isOk ? 1 : 0), wrong: wrong + (isOk ? 0 : 1), total: cards.length })
    } else {
      setIdx(i => i + 1)
      setFlip(false)
    }
  }, [idx, correct, wrong, cards.length, onFinish])

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)', maxWidth: 200,
          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{deckName}</div>
        <ThemeToggle />
      </div>

      {/* İlerleme çubuğu */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700,
        color: 'var(--t3)', marginBottom: 8 }}>
        <span>Kart {idx + 1} / {cards.length}</span>
        <span>✅ {correct} · ❌ {wrong}</span>
      </div>
      <div style={{ height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ width: `${(idx / cards.length) * 100}%`, height: '100%',
          background: 'linear-gradient(90deg,#0088BB,#00AADD)', borderRadius: 99, transition: 'width .4s ease' }}/>
      </div>

      {/* Flash kart */}
      <div style={{ perspective: 1000, width: '100%', height: 230, marginBottom: 20, cursor: 'pointer' }}
        onClick={() => setFlip(f => !f)}>
        <div style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d',
          transition: 'transform .5s ease', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0)' }}>
          {/* Ön yüz */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: 20, padding: 24,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            background: 'linear-gradient(145deg,rgba(0,80,140,.6),rgba(0,140,200,.4))',
            border: '1px solid rgba(0,170,221,.3)' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,.45)', marginBottom: 12 }}>SORU</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white', lineHeight: 1.55 }}>{current?.q}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 14 }}>Cevabı görmek için tıkla</div>
          </div>
          {/* Arka yüz */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: 20, padding: 24,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(145deg,rgba(10,70,40,.6),rgba(16,140,80,.4))',
            border: '1px solid rgba(16,185,129,.3)' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,.45)', marginBottom: 12 }}>CEVAP</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white', lineHeight: 1.55 }}>{current?.a}</div>
          </div>
        </div>
      </div>

      {/* Güven puanı (kart çevrildikten sonra) */}
      {flipped && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', letterSpacing: '.07em',
            textTransform: 'uppercase', textAlign: 'center', marginBottom: 10 }}>
            Kartı ne kadar biliyordun?
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1, 2, 3, 4, 5].map(c => (
              <button key={c} onClick={() => rate(c)} style={{
                flex: 1, padding: '10px 4px', borderRadius: 10,
                border: `1px solid ${CONF_COLORS[c]}44`,
                background: `${CONF_COLORS[c]}18`,
                color: CONF_COLORS[c], fontFamily: 'Montserrat',
                fontSize: 11, fontWeight: 800, cursor: 'pointer', textAlign: 'center', transition: 'all .18s',
              }}>
                <div>{c}</div>
                <div style={{ fontSize: 8, marginTop: 2 }}>{CONF_LABELS[c]}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Biliyorum / Bilmiyorum */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => rate(1)} style={{ flex: 1, padding: 13, borderRadius: 14,
          border: '1px solid rgba(224,80,112,.3)', background: 'rgba(224,80,112,.1)', color: '#FF8090',
          fontFamily: 'Montserrat', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .2s' }}>
          ✗ Bilmiyorum
        </button>
        <button onClick={() => rate(5)} style={{ flex: 1, padding: 13, borderRadius: 14,
          border: '1px solid rgba(16,185,129,.3)', background: 'rgba(16,185,129,.1)', color: '#10B981',
          fontFamily: 'Montserrat', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .2s' }}>
          ✓ Biliyorum
        </button>
      </div>
    </div>
  )
}

// ── Sonuç ekranı ──────────────────────────────────────────────
function ResultView({ result, deckName, onRestart, onBack }) {
  const pct = result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 18 }}>
        <div style={{ fontSize: 19, fontWeight: 900, color: 'var(--t1)' }}>Sonuç</div>
        <ThemeToggle />
      </div>

      <div style={{ borderRadius: 20, padding: 28, background: 'var(--card)', border: '1px solid var(--border)', textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 8 }}>{pct >= 80 ? '🎉' : pct >= 60 ? '💪' : '📚'}</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--t1)', marginBottom: 4 }}>%{pct}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t2)', marginBottom: 4 }}>
          {pct >= 80 ? 'Harika gidiyorsun!' : pct >= 60 ? 'İyi iş, devam et!' : 'Biraz daha çalışalım!'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 24 }}>
          {result.total} karttan <strong style={{ color: 'var(--t1)' }}>{result.correct}</strong>'ini doğru yanıtladın
        </div>

        {[
          { label: 'Doğru',  val: result.correct, total: result.total, color: '#10B981' },
          { label: 'Yanlış', val: result.wrong,   total: result.total, color: '#E05070' },
        ].map(b => (
          <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, textAlign: 'left' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t2)', width: 60, flexShrink: 0 }}>{b.label}</div>
            <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: `${(b.val / b.total) * 100}%`, height: '100%', background: b.color,
                borderRadius: 99, transition: 'width 1s ease' }}/>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t1)', width: 24, textAlign: 'right' }}>{b.val}</div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onRestart} style={{ flex: 1, padding: 12, borderRadius: 12,
            border: '1px solid var(--border)', background: 'var(--input)', color: 'var(--t2)',
            fontFamily: 'Montserrat', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            🔄 Tekrar
          </button>
          <button onClick={onBack} style={{ flex: 1, padding: 12, borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg,#0088BB,#00AADD)', color: 'white',
            fontFamily: 'Montserrat', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            ← Desteler
          </button>
        </div>
      </div>
    </div>
  )
}

// ── ANA BİLEŞEN ───────────────────────────────────────────────
export default function CustomerDecks() {
  const [phase, setPhase]       = useState('select')
  const [activeCards, setActiveCards] = useState([])
  const [deckName, setDeckName] = useState('')
  const [result, setResult]     = useState(null)

  const startDeck = (cards, name) => {
    // Kartları karıştır
    const shuffled = [...cards].sort(() => Math.random() - 0.5)
    setActiveCards(shuffled)
    setDeckName(name)
    setResult(null)
    setPhase('study')
  }

  const handleFinish = (res) => {
    setResult(res)
    setPhase('result')
  }

  if (phase === 'study') {
    return <StudyView cards={activeCards} deckName={deckName} onFinish={handleFinish} />
  }

  if (phase === 'result') {
    return (
      <ResultView
        result={result}
        deckName={deckName}
        onRestart={() => startDeck(activeCards, deckName)}
        onBack={() => setPhase('select')}
      />
    )
  }

  // ── SEÇIM EKRANI ─────────────────────────────────────────────
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 18 }}>
        <div style={{ fontSize: 19, fontWeight: 900, color: 'var(--t1)' }}>Deste Kütüphanem</div>
        <ThemeToggle />
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        {[{c:'#E05070',l:'Kritik'},{c:'#F5A020',l:'Orta'},{c:'#10B981',l:'İyi'},{c:'#4A90D0',l:'Uzman'}].map(s => (
          <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, fontWeight: 600, color: 'var(--t3)' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.c }}/>{s.l}
          </div>
        ))}
      </div>

      {/* Karıştır seçenekleri */}
      <MixCard icon="🔀" label="Hepsini Karıştır"
        sub="14 ders — tüm müfredat"
        gradient="linear-gradient(145deg,rgba(0,80,140,.65),rgba(0,140,200,.45))"
        border="rgba(0,170,221,.35)"
        count={MIX_ALL.length}
        onSelect={() => startDeck(MIX_ALL, 'Hepsini Karıştır')} />
      <MixCard icon="🔬" label="Temel Dersleri Karıştır"
        sub="Anatomi, Fizyoloji, Biyokimya..."
        gradient="linear-gradient(145deg,rgba(74,144,208,.55),rgba(0,170,221,.35))"
        border="rgba(74,144,208,.4)"
        count={MIX_TEMEL.length}
        onSelect={() => startDeck(MIX_TEMEL, 'Temel Dersleri Karıştır')} />
      <MixCard icon="🦷" label="Klinik Dersleri Karıştır"
        sub="Protetik, Cerrahi, Endodonti..."
        gradient="linear-gradient(145deg,rgba(192,64,96,.55),rgba(255,112,144,.3))"
        border="rgba(208,80,106,.4)"
        count={MIX_KLINIK.length}
        onSelect={() => startDeck(MIX_KLINIK, 'Klinik Dersleri Karıştır')} />

      {/* Temel Bilimler */}
      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(74,144,208,.9)', letterSpacing: '.08em',
        textTransform: 'uppercase', marginBottom: 12, marginTop: 4,
        display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>Temel Bilimler</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(74,144,208,.2)' }}/>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {TEMEL_DERSLER.map(d => (
          <CourseCard key={d.id} deck={d} type="temel"
            onSelect={() => startDeck(DECK_CARDS[d.slug] || [], d.name)} />
        ))}
      </div>

      {/* Klinik Bilimler */}
      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(208,80,106,.9)', letterSpacing: '.08em',
        textTransform: 'uppercase', marginBottom: 12,
        display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>Klinik Bilimler</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(208,80,106,.2)' }}/>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {KLINIK_DERSLER.map(d => (
          <CourseCard key={d.id} deck={d} type="klinik"
            onSelect={() => startDeck(DECK_CARDS[d.slug] || [], d.name)} />
        ))}
      </div>
    </div>
  )
}
