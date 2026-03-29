import { useState, useCallback } from 'react'
import { ThemeToggle } from '../../components/shared'
import { TYT_BOLUMLER, AYT_BOLUMLER, DECK_CARDS, MIX_ALL, MIX_TYT, MIX_AYT, SRS_COLORS } from '../../data'
import { COURSE_ICON_MAP } from '../../data/courseIcons'

// ── Flash kart çalışma görünümü ───────────────────────────────
function StudyView({ cards, deckName, onFinish }) {
  const [idx, setIdx]         = useState(0)
  const [flipped, setFlip]    = useState(false)
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

// ── Geri butonu ───────────────────────────────────────────────
function BackBtn({ onClick, label = 'Geri' }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
      cursor: 'pointer', color: 'var(--t3)', fontSize: 12, fontWeight: 700, padding: '0 0 14px 0'
    }}>
      <span>←</span> {label}
    </button>
  )
}

// ── MIX kartı ────────────────────────────────────────────────
function MixCard({ icon, label, sub, gradient, border, count, onSelect, compact }) {
  return (
    <div onClick={onSelect}
      style={{ borderRadius: 16, padding: compact ? '12px 12px' : '16px 14px', cursor: 'pointer',
        background: gradient, border: `1px solid ${border}`,
        transition: 'transform .18s, box-shadow .18s',
        marginBottom: compact ? 0 : 10,
        display: 'flex', alignItems: 'center', gap: compact ? 8 : 12 }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.15)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
      <div style={{ fontSize: compact ? 20 : 26, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: compact ? 11 : 13, fontWeight: 800, color: 'white',
          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{label}</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: compact ? 12 : 14, fontWeight: 800, color: 'white' }}>{count}</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,.5)' }}>kart</div>
      </div>
    </div>
  )
}

// ── ANA BİLEŞEN ───────────────────────────────────────────────
export default function CustomerDecks() {
  const [phase, setPhase]               = useState('select')
  const [selectedKategori, setSelectedKategori] = useState(null) // 'tyt' | 'ayt'
  const [selectedBolum, setSelectedBolum]       = useState(null)
  const [activeCards, setActiveCards]           = useState([])
  const [deckName, setDeckName]                 = useState('')
  const [result, setResult]                     = useState(null)

  const startDeck = useCallback((cards, name) => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5)
    setActiveCards(shuffled)
    setDeckName(name)
    setResult(null)
    setPhase('study')
  }, [])

  const handleFinish = useCallback((res) => {
    setResult(res)
    setPhase('result')
  }, [])

  // ── ÇALIŞMA EKRANI ────────────────────────────────────────────
  if (phase === 'study') {
    return <StudyView cards={activeCards} deckName={deckName} onFinish={handleFinish} />
  }

  // ── SONUÇ EKRANI ──────────────────────────────────────────────
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

  // ── DERS LİSTESİ (3. katman) ──────────────────────────────────
  if (phase === 'ders' && selectedBolum) {
    const color = selectedKategori === 'tyt' ? '#4A90D0' : '#D0506A'
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 4 }}>
          <div style={{ fontSize: 19, fontWeight: 900, color: 'var(--t1)' }}>{selectedBolum.name}</div>
          <ThemeToggle />
        </div>
        <BackBtn
          onClick={() => setPhase('bolum')}
          label={selectedKategori === 'tyt' ? 'TYT Bölümleri' : 'AYT Bölümleri'}
        />

        {/* Tüm bölümü karıştır */}
        <div
          onClick={() => startDeck(
            selectedBolum.dersler.flatMap(d => DECK_CARDS[d.slug] || []),
            `${selectedBolum.name} — Tümünü Karıştır`
          )}
          style={{ borderRadius: 14, padding: '14px 16px', marginBottom: 16, cursor: 'pointer',
            background: selectedKategori === 'tyt'
              ? 'linear-gradient(145deg,rgba(74,144,208,.45),rgba(0,170,221,.25))'
              : 'linear-gradient(145deg,rgba(192,64,96,.45),rgba(255,112,144,.2))',
            border: `1px solid ${color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            transition: 'transform .15s, box-shadow .15s' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,.12)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>🔀 Tüm {selectedBolum.name}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>
              {selectedBolum.dersler.length} ders — {selectedBolum.cards} kart
            </div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>→</div>
        </div>

        {/* Ders listesi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {selectedBolum.dersler.map(ders => (
            <div key={ders.slug}
              onClick={() => startDeck(DECK_CARDS[ders.slug] || [], ders.name)}
              style={{ borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
                background: 'var(--card)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = `${color}11` }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--card)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{ders.name}</div>
                <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>{ders.cards} kart</div>
              </div>
              <div style={{ fontSize: 18, color: color }}>›</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── BÖLÜM LİSTESİ (2. katman) ─────────────────────────────────
  if (phase === 'bolum' && selectedKategori) {
    const bolumler = selectedKategori === 'tyt' ? TYT_BOLUMLER : AYT_BOLUMLER
    const color    = selectedKategori === 'tyt' ? '#4A90D0' : '#D0506A'
    const label    = selectedKategori === 'tyt' ? 'TYT' : 'AYT'
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 4 }}>
          <div style={{ fontSize: 19, fontWeight: 900, color: 'var(--t1)' }}>{label} Bölümleri</div>
          <ThemeToggle />
        </div>
        <BackBtn onClick={() => setPhase('select')} label="Kategoriler" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {bolumler.map(bolum => {
            const Icon = COURSE_ICON_MAP[bolum.slug]
            return (
              <div key={bolum.id}
                onClick={() => { setSelectedBolum(bolum); setPhase('ders') }}
                style={{ borderRadius: 16, padding: '16px', cursor: 'pointer',
                  background: 'var(--card)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: 14,
                  transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateX(3px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = '' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {Icon ? <Icon color={color} size={24} /> : <span style={{ fontSize: 22 }}>📚</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)' }}>{bolum.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>
                    {bolum.dersler.length} ders · {bolum.cards} kart
                  </div>
                </div>
                <div style={{ fontSize: 18, color: 'var(--t3)' }}>›</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── KATEGORİ SEÇIM EKRANI (1. katman) ─────────────────────────
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 18 }}>
        <div style={{ fontSize: 19, fontWeight: 900, color: 'var(--t1)' }}>Deste Kütüphanem</div>
        <ThemeToggle />
      </div>

      {/* Karıştır başlığı */}
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', letterSpacing: '.08em',
        textTransform: 'uppercase', marginBottom: 10,
        display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>Karıştır</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
      </div>

      {/* Hepsini Karıştır */}
      <MixCard icon="🔀" label="Hepsini Karıştır"
        sub="TYT + AYT — tüm müfredat"
        gradient="linear-gradient(145deg,rgba(0,80,140,.65),rgba(0,140,200,.45))"
        border="rgba(0,170,221,.35)"
        count={MIX_ALL.length}
        onSelect={() => startDeck(MIX_ALL, 'Hepsini Karıştır')} />

      {/* TYT + AYT Karıştır (2'li grid) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        <MixCard icon="📚" label="TYT Karıştır"
          sub="4 bölüm"
          gradient="linear-gradient(145deg,rgba(74,144,208,.55),rgba(0,170,221,.35))"
          border="rgba(74,144,208,.4)"
          count={MIX_TYT.length}
          compact
          onSelect={() => startDeck(MIX_TYT, 'TYT Karıştır')} />
        <MixCard icon="🎓" label="AYT Karıştır"
          sub="4 bölüm"
          gradient="linear-gradient(145deg,rgba(192,64,96,.55),rgba(255,112,144,.3))"
          border="rgba(208,80,106,.4)"
          count={MIX_AYT.length}
          compact
          onSelect={() => startDeck(MIX_AYT, 'AYT Karıştır')} />
      </div>

      {/* Kategoriler başlığı */}
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', letterSpacing: '.08em',
        textTransform: 'uppercase', marginBottom: 10,
        display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>Kategoriler</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
      </div>

      {/* TYT / AYT kategori kartları */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* TYT */}
        <div
          onClick={() => { setSelectedKategori('tyt'); setPhase('bolum') }}
          style={{ borderRadius: 18, padding: '20px 14px', cursor: 'pointer',
            background: 'linear-gradient(145deg,rgba(74,144,208,.35),rgba(0,170,221,.2))',
            border: '1px solid rgba(74,144,208,.4)', textAlign: 'center',
            transition: 'all .18s' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(74,144,208,.2)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📘</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#4A90D0', marginBottom: 4 }}>TYT</div>
          <div style={{ fontSize: 10, color: 'rgba(74,144,208,.8)', marginBottom: 8 }}>Temel Yeterlilik</div>
          <div style={{ fontSize: 10, color: 'var(--t3)' }}>
            4 bölüm · {TYT_BOLUMLER.reduce((s, b) => s + b.cards, 0)} kart
          </div>
        </div>

        {/* AYT */}
        <div
          onClick={() => { setSelectedKategori('ayt'); setPhase('bolum') }}
          style={{ borderRadius: 18, padding: '20px 14px', cursor: 'pointer',
            background: 'linear-gradient(145deg,rgba(192,64,96,.35),rgba(255,112,144,.2))',
            border: '1px solid rgba(208,80,106,.4)', textAlign: 'center',
            transition: 'all .18s' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(208,80,106,.2)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎓</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#D0506A', marginBottom: 4 }}>AYT</div>
          <div style={{ fontSize: 10, color: 'rgba(208,80,106,.8)', marginBottom: 8 }}>Alan Yeterlilik</div>
          <div style={{ fontSize: 10, color: 'var(--t3)' }}>
            4 bölüm · {AYT_BOLUMLER.reduce((s, b) => s + b.cards, 0)} kart
          </div>
        </div>
      </div>
    </div>
  )
}
