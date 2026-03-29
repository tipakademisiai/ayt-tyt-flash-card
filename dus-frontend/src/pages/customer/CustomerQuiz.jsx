import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { quizAPI, cardExtrasAPI } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { ThemeToggle } from '../../components/shared'
import { QUIZ_CARDS, DECK_CARDS, TEMEL_DERSLER, KLINIK_DERSLER, MIX_ALL, MIX_TEMEL, MIX_KLINIK, calcSM2 } from '../../data'
import { COURSE_ICON_MAP } from '../../data/courseIcons'
import toast from 'react-hot-toast'

const CONF_LABELS = ['', 'Hiç', 'Az', 'Orta', 'İyi', 'Tam']
const CONF_COLORS = ['', '#E05070', '#F5821E', '#F5C842', '#4BC880', '#10B981']

// ── AI SORU MODAL ─────────────────────────────────────────────
function AIQuestionModal({ question, onClose }) {
  const [selected, setSelected] = useState(null)
  const answered = selected !== null
  const isCorrect = answered && selected === question.correct

  const optionKeys = Object.keys(question.options || {})

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', zIndex:200,
      display:'flex', alignItems:'flex-end', justifyContent:'center', padding:'0 0 0 0' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background:'var(--card)', borderRadius:'20px 20px 0 0',
        border:'1px solid var(--border)', padding:24, width:'100%', maxWidth:480,
        maxHeight:'85vh', overflowY:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase',
              color:'rgba(160,139,250,.8)', marginBottom:2 }}>AI SORU</div>
            <div style={{ fontSize:13, fontWeight:800, color:'var(--t1)' }}>Kendini Test Et</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer',
            fontSize:18, color:'var(--t3)', padding:4 }}>✕</button>
        </div>

        <div style={{ fontSize:13, fontWeight:600, color:'var(--t1)', lineHeight:1.6, marginBottom:16,
          padding:14, borderRadius:12, background:'rgba(160,139,250,.08)', border:'1px solid rgba(160,139,250,.2)' }}>
          {question.question}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
          {optionKeys.map(key => {
            const val = question.options[key]
            const isThis = selected === key
            const isRight = key === question.correct
            let bg = 'var(--input)', border = 'var(--inputborder)', color = 'var(--t2)'
            if (answered) {
              if (isRight) { bg = 'rgba(16,185,129,.15)'; border = 'rgba(16,185,129,.4)'; color = '#10B981' }
              else if (isThis && !isRight) { bg = 'rgba(224,80,112,.15)'; border = 'rgba(224,80,112,.4)'; color = '#FF8090' }
            } else if (isThis) {
              bg = 'rgba(160,139,250,.15)'; border = 'rgba(160,139,250,.4)'; color = '#A78BFA'
            }
            return (
              <button key={key} onClick={() => !answered && setSelected(key)}
                style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
                  borderRadius:12, border:`1px solid ${border}`, background:bg, color,
                  fontFamily:'Montserrat', fontSize:12, fontWeight:600, cursor:answered?'default':'pointer',
                  textAlign:'left', transition:'all .18s' }}>
                <span style={{ width:22, height:22, borderRadius:'50%', display:'flex',
                  alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800,
                  background: answered && isRight ? '#10B981' : answered && isThis ? '#FF8090' : 'rgba(255,255,255,.1)',
                  color: answered ? 'white' : color, flexShrink:0 }}>{key}</span>
                {val}
              </button>
            )
          })}
        </div>

        {answered && (
          <div style={{ padding:14, borderRadius:12, marginBottom:12,
            background: isCorrect ? 'rgba(16,185,129,.1)' : 'rgba(224,80,112,.1)',
            border: `1px solid ${isCorrect ? 'rgba(16,185,129,.3)' : 'rgba(224,80,112,.3)'}` }}>
            <div style={{ fontSize:13, fontWeight:800, color: isCorrect ? '#10B981' : '#FF8090', marginBottom:6 }}>
              {isCorrect ? '✅ Doğru!' : '❌ Yanlış'}
            </div>
            {question.explanation && (
              <div style={{ fontSize:11, color:'var(--t2)', lineHeight:1.6 }}>{question.explanation}</div>
            )}
          </div>
        )}

        <button onClick={onClose} style={{ width:'100%', padding:13, borderRadius:12,
          border:'none', background:'linear-gradient(135deg,rgba(160,139,250,.3),rgba(139,92,246,.4))',
          color:'#A78BFA', fontFamily:'Montserrat', fontSize:12, fontWeight:700, cursor:'pointer' }}>
          Karta Dön
        </button>
      </div>
    </div>
  )
}

// ── DUS SORUSU MODAL ──────────────────────────────────────────
function DUSQuestionModal({ question, onClose }) {
  const [selected, setSelected] = useState(null)
  const answered = selected !== null
  const isCorrect = answered && selected === question.correct_option

  const opts = [
    { key:'A', val: question.option_a },
    { key:'B', val: question.option_b },
    { key:'C', val: question.option_c },
    { key:'D', val: question.option_d },
    ...(question.option_e ? [{ key:'E', val: question.option_e }] : []),
  ]

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', zIndex:200,
      display:'flex', alignItems:'flex-end', justifyContent:'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background:'var(--card)', borderRadius:'20px 20px 0 0',
        border:'1px solid var(--border)', padding:24, width:'100%', maxWidth:480,
        maxHeight:'85vh', overflowY:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase',
              color:'rgba(245,200,66,.8)', marginBottom:2 }}>
              GERÇEK DUS SORUSU · {question.year} {question.source && `· ${question.source}`}
            </div>
            <div style={{ fontSize:13, fontWeight:800, color:'var(--t1)' }}>Sınavdan Çıkmış</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer',
            fontSize:18, color:'var(--t3)', padding:4 }}>✕</button>
        </div>

        <div style={{ fontSize:13, fontWeight:600, color:'var(--t1)', lineHeight:1.6, marginBottom:16,
          padding:14, borderRadius:12, background:'rgba(245,200,66,.06)', border:'1px solid rgba(245,200,66,.2)' }}>
          {question.question_text}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
          {opts.map(({ key, val }) => {
            const isThis = selected === key
            const isRight = key === question.correct_option
            let bg = 'var(--input)', border = 'var(--inputborder)', color = 'var(--t2)'
            if (answered) {
              if (isRight) { bg = 'rgba(16,185,129,.15)'; border = 'rgba(16,185,129,.4)'; color = '#10B981' }
              else if (isThis && !isRight) { bg = 'rgba(224,80,112,.15)'; border = 'rgba(224,80,112,.4)'; color = '#FF8090' }
            } else if (isThis) {
              bg = 'rgba(245,200,66,.12)'; border = 'rgba(245,200,66,.4)'; color = '#F5C842'
            }
            return (
              <button key={key} onClick={() => !answered && setSelected(key)}
                style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
                  borderRadius:12, border:`1px solid ${border}`, background:bg, color,
                  fontFamily:'Montserrat', fontSize:12, fontWeight:600, cursor:answered?'default':'pointer',
                  textAlign:'left', transition:'all .18s' }}>
                <span style={{ width:22, height:22, borderRadius:'50%', display:'flex',
                  alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800,
                  background: answered && isRight ? '#10B981' : answered && isThis ? '#FF8090' : 'rgba(255,255,255,.1)',
                  color: answered ? 'white' : color, flexShrink:0 }}>{key}</span>
                {val}
              </button>
            )
          })}
        </div>

        {answered && (
          <div style={{ padding:14, borderRadius:12, marginBottom:12,
            background: isCorrect ? 'rgba(16,185,129,.1)' : 'rgba(224,80,112,.1)',
            border: `1px solid ${isCorrect ? 'rgba(16,185,129,.3)' : 'rgba(224,80,112,.3)'}` }}>
            <div style={{ fontSize:13, fontWeight:800, color: isCorrect ? '#10B981' : '#FF8090', marginBottom:6 }}>
              {isCorrect ? '✅ Doğru!' : `❌ Doğru cevap: ${question.correct_option}`}
            </div>
            {question.explanation && (
              <div style={{ fontSize:11, color:'var(--t2)', lineHeight:1.6 }}>{question.explanation}</div>
            )}
          </div>
        )}

        <button onClick={onClose} style={{ width:'100%', padding:13, borderRadius:12,
          border:'none', background:'linear-gradient(135deg,rgba(245,200,66,.2),rgba(217,119,6,.3))',
          color:'#F5C842', fontFamily:'Montserrat', fontSize:12, fontWeight:700, cursor:'pointer' }}>
          Karta Dön
        </button>
      </div>
    </div>
  )
}

// ── ANA COMPONENT ─────────────────────────────────────────────
export default function CustomerQuiz() {
  const { user } = useAuth()
  const navigate  = useNavigate()

  const [phase, setPhase]   = useState('select')
  const [selectedCards, setSelectedCards] = useState(QUIZ_CARDS)
  const [quizDeckName, setQuizDeckName]   = useState('SRS Çalışması')
  const cards = selectedCards
  const [idx, setIdx]       = useState(0)
  const [flipped, setFlip]  = useState(false)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong]     = useState(0)
  const [confSum, setConfSum] = useState(0)
  const [results, setResults] = useState([])
  const [startTime]           = useState(Date.now())

  // Extra modals
  const [aiLoading, setAiLoading]   = useState(false)
  const [aiQuestion, setAiQuestion] = useState(null)
  const [dusLoading, setDusLoading] = useState(false)
  const [dusQuestion, setDusQuestion] = useState(null)

  const current = cards[idx]

  const flip = () => setFlip(f => !f)

  const rate = useCallback((confidence) => {
    const isCorrect = confidence >= 3
    if (isCorrect) setCorrect(c => c + 1)
    else setWrong(w => w + 1)
    setConfSum(s => s + confidence)
    setResults(r => [...r, { card_id: current.id, is_correct: isCorrect, confidence }])

    if (idx + 1 >= cards.length) {
      const duration = Math.round((Date.now() - startTime) / 1000)
      submitQuiz(duration, [...results, { card_id: current.id, is_correct: isCorrect, confidence }])
      setPhase('result')
    } else {
      setIdx(i => i + 1)
      setFlip(false)
    }
  }, [idx, current, results, startTime, cards.length])

  const submitQuiz = async (duration, allResults) => {
    try {
      await quizAPI.submit({ course_id: 14, results: allResults, duration_sec: duration })
    } catch (e) { /* offline modda da çalışır */ }
  }

  const restart = () => {
    setIdx(0); setFlip(false)
    setCorrect(0); setWrong(0)
    setConfSum(0); setResults([])
    setPhase('quiz')
  }

  const startQuiz = (cards, name) => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5)
    setSelectedCards(shuffled)
    setQuizDeckName(name)
    setIdx(0); setFlip(false)
    setCorrect(0); setWrong(0)
    setConfSum(0); setResults([])
    setPhase('quiz')
  }

  const handleAIQuestion = async () => {
    if (!current?.id) return toast('Bu kart için AI soru üretilemedi.', { icon:'ℹ️' })
    setAiLoading(true)
    try {
      const { data } = await cardExtrasAPI.generateQuestion(current.id)
      setAiQuestion(data)
    } catch {
      toast.error('AI soru üretilemedi.')
    } finally {
      setAiLoading(false)
    }
  }

  const handleDUSQuestion = async () => {
    if (!current?.id) return toast('Bu kart için DUS sorusu bulunamadı.', { icon:'ℹ️' })
    setDusLoading(true)
    try {
      const { data } = await cardExtrasAPI.dusQuestion(current.id)
      setDusQuestion(data)
    } catch (e) {
      const msg = e?.response?.data?.detail || 'Bu bölüm için henüz DUS sorusu eklenmemiş.'
      toast(msg, { icon:'📚' })
    } finally {
      setDusLoading(false)
    }
  }

  const totalAnswered = correct + wrong
  const scorePct = totalAnswered > 0 ? Math.round((correct / totalAnswered) * 100) : 0
  const avgConf  = totalAnswered > 0 ? (confSum / totalAnswered).toFixed(1) : 0

  // ── SELECT PHASE ─────────────────────────────────────────────
  if (phase === 'select') {
    const MixRow = ({ icon, label, sub, gradient, border, cards: c, name }) => (
      <div onClick={() => startQuiz(c, name)}
        style={{ borderRadius: 16, padding: '16px 14px', cursor: 'pointer', background: gradient,
          border: `1px solid ${border}`, transition: 'transform .18s', marginBottom: 10 }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = ''}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 26, flexShrink: 0 }}>{icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>{label}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>{sub}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>{c.length}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.5)' }}>kart</div>
          </div>
        </div>
      </div>
    )

    const DeckRow = ({ deck, type }) => {
      const Icon = COURSE_ICON_MAP[deck.slug]
      const color = type === 'temel' ? '#4A90D0' : '#D0506A'
      const cards = DECK_CARDS[deck.slug] || QUIZ_CARDS
      return (
        <div onClick={() => startQuiz(cards, deck.name)}
          style={{ borderRadius: 14, padding: '12px 14px', background: 'var(--card)',
            border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
            gap: 12, marginBottom: 8, cursor: 'pointer', transition: 'transform .15s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
          onMouseLeave={e => e.currentTarget.style.transform = ''}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}22`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {Icon ? <Icon color={color} size={18} /> : <span style={{ fontSize: 14 }}>📚</span>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)' }}>{deck.name}</div>
            <div style={{ fontSize: 10, color: 'var(--t3)' }}>{type === 'temel' ? 'Temel ders' : 'Klinik ders'}</div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)' }}>{cards.length} kart</div>
          <div style={{ fontSize: 16, color: 'var(--t3)' }}>›</div>
        </div>
      )
    }

    return (
      <div style={{ padding: '0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 18 }}>
          <div style={{ fontSize: 19, fontWeight: 900, color: 'var(--t1)' }}>Quiz Modu</div>
          <ThemeToggle />
        </div>

        {/* SRS Önerisi */}
        <div style={{ borderRadius: 20, padding: 18, marginBottom: 14, cursor: 'pointer',
          background: 'linear-gradient(145deg,rgba(0,80,140,.6),rgba(0,140,200,.4))',
          border: '1px solid rgba(0,170,221,.3)' }}
          onClick={() => startQuiz(QUIZ_CARDS, 'Bugünkü SRS Çalışması')}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.5)',
            letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>ÖNERİLEN</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'white', marginBottom: 4 }}>🧠 Bugünkü SRS Çalışması</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>Spaced repetition — bugün tekrar edilmesi gereken kartlar</div>
        </div>

        {/* Karıştır */}
        <MixRow icon="🔀" label="Hepsini Karıştır" sub="14 ders — tüm müfredat"
          gradient="linear-gradient(145deg,rgba(80,40,140,.55),rgba(120,80,200,.35))"
          border="rgba(160,139,250,.35)" cards={MIX_ALL} name="Hepsini Karıştır" />
        <MixRow icon="🔬" label="Temel Dersleri Karıştır" sub="Anatomi, Fizyoloji, Biyokimya..."
          gradient="linear-gradient(145deg,rgba(74,144,208,.55),rgba(0,170,221,.35))"
          border="rgba(74,144,208,.4)" cards={MIX_TEMEL} name="Temel Dersleri Karıştır" />
        <MixRow icon="🦷" label="Klinik Dersleri Karıştır" sub="Protetik, Cerrahi, Endodonti..."
          gradient="linear-gradient(145deg,rgba(192,64,96,.55),rgba(255,112,144,.3))"
          border="rgba(208,80,106,.4)" cards={MIX_KLINIK} name="Klinik Dersleri Karıştır" />

        {/* Temel Bilimler */}
        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(74,144,208,.9)', letterSpacing: '.08em',
          textTransform: 'uppercase', marginBottom: 10, marginTop: 6,
          display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>Temel Bilimler</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(74,144,208,.2)' }}/>
        </div>
        {TEMEL_DERSLER.map(d => <DeckRow key={d.id} deck={d} type="temel" />)}

        {/* Klinik Bilimler */}
        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(208,80,106,.9)', letterSpacing: '.08em',
          textTransform: 'uppercase', marginBottom: 10, marginTop: 4,
          display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>Klinik Bilimler</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(208,80,106,.2)' }}/>
        </div>
        {KLINIK_DERSLER.map(d => <DeckRow key={d.id} deck={d} type="klinik" />)}
      </div>
    )
  }

  // ── RESULT PHASE ─────────────────────────────────────────────
  if (phase === 'result') return (
    <div style={{ padding: '0 4px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingBottom:18 }}>
        <div style={{ fontSize:19, fontWeight:900, color:'var(--t1)' }}>Sonuç</div>
        <ThemeToggle />
      </div>

      <div style={{ borderRadius:20, padding:28, background:'var(--card)', border:'1px solid var(--border)', textAlign:'center' }}>
        <div style={{ fontSize:52, marginBottom:8 }}>{scorePct >= 80 ? '🎉' : scorePct >= 60 ? '💪' : '📚'}</div>
        <div style={{ fontSize:36, fontWeight:900, color:'var(--t1)', marginBottom:4 }}>%{scorePct}</div>
        <div style={{ fontSize:14, fontWeight:700, color:'var(--t1)', marginBottom:4 }}>
          {scorePct >= 80 ? 'Harika gidiyorsun!' : scorePct >= 60 ? 'İyi iş, devam et!' : 'Biraz daha çalışalım!'}
        </div>
        <div style={{ fontSize:11, color:'var(--t3)', marginBottom:24 }}>{totalAnswered} karttan {correct}'ini doğru yanıtladın</div>

        {[
          { label:'Doğru',    val:correct,  total:totalAnswered, color:'#10B981', display:correct },
          { label:'Yanlış',   val:wrong,    total:totalAnswered, color:'#E05070', display:wrong },
          { label:'Ort. Güven', val:parseFloat(avgConf)*20, total:100, color:'#F5C842', display:`${avgConf}/5` },
        ].map(b => (
          <div key={b.label} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10, textAlign:'left' }}>
            <div style={{ fontSize:11, fontWeight:600, color:'var(--t2)', width:90, flexShrink:0 }}>{b.label}</div>
            <div style={{ flex:1, height:6, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
              <div style={{ width:`${(b.val/b.total)*100}%`, height:'100%', background:b.color, borderRadius:99, transition:'width 1s ease' }} />
            </div>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--t1)', width:32, textAlign:'right' }}>{b.display}</div>
          </div>
        ))}

        <div style={{ display:'flex', gap:10, marginTop:20 }}>
          <button onClick={restart}
            style={{ flex:1, padding:12, borderRadius:12, border:'1px solid var(--border)', background:'var(--input)', color:'var(--t2)', fontFamily:'Montserrat', fontSize:12, fontWeight:700, cursor:'pointer' }}>
            🔄 Tekrar
          </button>
          <button onClick={() => navigate('/app/progress')}
            style={{ flex:1, padding:12, borderRadius:12, border:'none', background:'linear-gradient(135deg,#0088BB,#00AADD)', color:'white', fontFamily:'Montserrat', fontSize:12, fontWeight:700, cursor:'pointer' }}>
            📊 İlerleme
          </button>
        </div>
      </div>
    </div>
  )

  // ── QUIZ PHASE ───────────────────────────────────────────────
  return (
    <div style={{ padding: '0 4px' }}>
      {/* Modals */}
      {aiQuestion  && <AIQuestionModal  question={aiQuestion}  onClose={() => setAiQuestion(null)} />}
      {dusQuestion && <DUSQuestionModal question={dusQuestion} onClose={() => setDusQuestion(null)} />}

      {/* Header — sağ üste 2 buton */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingBottom:14 }}>
        <div style={{ fontSize:15, fontWeight:800, color:'var(--t1)', maxWidth:200,
        overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{quizDeckName}</div>
        <div style={{ display:'flex', gap:7 }}>
          <button onClick={handleAIQuestion} disabled={aiLoading}
            title="Bu karttan AI soru üret"
            style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 11px',
              borderRadius:10, border:'1px solid rgba(160,139,250,.3)',
              background:'rgba(160,139,250,.1)', color:'#A78BFA',
              fontFamily:'Montserrat', fontSize:10, fontWeight:700, cursor:'pointer', transition:'all .18s' }}>
            {aiLoading ? '...' : '🤖 Soru Üret'}
          </button>
          <button onClick={handleDUSQuestion} disabled={dusLoading}
            title="Bu bölümden gerçek DUS sorusu"
            style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 11px',
              borderRadius:10, border:'1px solid rgba(245,200,66,.3)',
              background:'rgba(245,200,66,.1)', color:'#F5C842',
              fontFamily:'Montserrat', fontSize:10, fontWeight:700, cursor:'pointer', transition:'all .18s' }}>
            {dusLoading ? '...' : '📋 DUS Sorusu'}
          </button>
        </div>
      </div>

      {/* Progress */}
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, fontWeight:700, color:'var(--t3)', marginBottom:8 }}>
        <span>Kart {idx + 1} / {cards.length}</span>
        <span>✅ {correct} · ❌ {wrong}</span>
      </div>
      <div style={{ height:4, background:'var(--border)', borderRadius:99, overflow:'hidden', marginBottom:20 }}>
        <div style={{ width:`${((idx)/cards.length)*100}%`, height:'100%', background:'linear-gradient(90deg,#0088BB,#00AADD)', borderRadius:99, transition:'width .4s ease' }} />
      </div>

      {/* Flashcard */}
      <div style={{ perspective:1000, width:'100%', height:220, marginBottom:20, cursor:'pointer' }} onClick={flip}>
        <div style={{
          width:'100%', height:'100%', position:'relative', transformStyle:'preserve-3d',
          transition:'transform .5s ease', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0)',
        }}>
          <div style={{
            position:'absolute', inset:0, borderRadius:20, padding:24,
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            textAlign:'center', backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden',
            background:'linear-gradient(145deg,rgba(0,80,140,.6),rgba(0,140,200,.4))',
            border:'1px solid rgba(0,170,221,.3)',
          }}>
            <div style={{ fontSize:9, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(255,255,255,.45)', marginBottom:12 }}>SORU</div>
            <div style={{ fontSize:14, fontWeight:700, color:'white', lineHeight:1.5 }}>{current?.q}</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,.3)', marginTop:14 }}>Cevabı görmek için tıkla</div>
          </div>
          <div style={{
            position:'absolute', inset:0, borderRadius:20, padding:24,
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            textAlign:'center', backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden',
            transform:'rotateY(180deg)',
            background:'linear-gradient(145deg,rgba(10,70,40,.6),rgba(16,140,80,.4))',
            border:'1px solid rgba(16,185,129,.3)',
          }}>
            <div style={{ fontSize:9, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(255,255,255,.45)', marginBottom:12 }}>CEVAP</div>
            <div style={{ fontSize:14, fontWeight:700, color:'white', lineHeight:1.5 }}>{current?.a}</div>
          </div>
        </div>
      </div>

      {/* Güven puanı */}
      {flipped && (
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, fontWeight:700, color:'var(--t3)', letterSpacing:'.07em', textTransform:'uppercase', textAlign:'center', marginBottom:10 }}>
            Kartı ne kadar biliyordun?
          </div>
          <div style={{ display:'flex', gap:6 }}>
            {[1,2,3,4,5].map(c => (
              <button key={c} onClick={() => rate(c)} style={{
                flex:1, padding:'10px 4px', borderRadius:10,
                border:`1px solid ${CONF_COLORS[c]}44`,
                background:`${CONF_COLORS[c]}18`,
                color: CONF_COLORS[c],
                fontFamily:'Montserrat', fontSize:11, fontWeight:800,
                cursor:'pointer', textAlign:'center', transition:'all .18s',
              }}>
                <div>{c}</div>
                <div style={{ fontSize:8, marginTop:2 }}>{CONF_LABELS[c]}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Biliyorum / Bilmiyorum */}
      <div style={{ display:'flex', gap:10 }}>
        <button onClick={() => rate(1)} style={{
          flex:1, padding:13, borderRadius:14, border:'1px solid rgba(224,80,112,.3)',
          background:'rgba(224,80,112,.1)', color:'#FF8090',
          fontFamily:'Montserrat', fontSize:12, fontWeight:700, cursor:'pointer', transition:'all .2s',
        }}>✗ Bilmiyorum</button>
        <button onClick={() => rate(5)} style={{
          flex:1, padding:13, borderRadius:14, border:'1px solid rgba(16,185,129,.3)',
          background:'rgba(16,185,129,.1)', color:'#10B981',
          fontFamily:'Montserrat', fontSize:12, fontWeight:700, cursor:'pointer', transition:'all .2s',
        }}>✓ Biliyorum</button>
      </div>
    </div>
  )
}
