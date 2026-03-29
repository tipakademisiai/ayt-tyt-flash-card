import { useState, useCallback } from 'react'
import { PageTopbar } from '../../components/shared'
import { TYT_BOLUMLER, AYT_BOLUMLER, DECK_CARDS } from '../../data'
import { COURSE_ICON_MAP } from '../../data/courseIcons'
import styles from '../../styles/shared.module.css'

const FALLBACK_CARDS = [
  { q:'Paragrafta ana fikir nerede bulunur?', a:'Genellikle paragrafın başında veya sonunda yer alır; bazen tümüne yayılabilir.' },
  { q:'Newton\'un 2. Hareket Yasası nedir?', a:'F = m × a; Net kuvvet, kütle ile ivmenin çarpımına eşittir.' },
  { q:'Mitoz bölünmenin sonucunda kaç hücre oluşur?', a:'2 adet, genetik olarak özdeş diploid (2n) hücre.' },
  { q:'Türkçede fiil çekiminde şahıs ekleri hangi sıraya göre eklenir?', a:'Kip eki + zaman eki + şahıs eki sıralaması izlenir.' },
  { q:'Kimyasal bağ türleri nelerdir?', a:'İyonik bağ, kovalent bağ ve metalik bağ olmak üzere üç temel tür vardır.' },
]

export default function TrainerStudy() {
  const [phase, setPhase]     = useState('select')
  const [deckName, setDeckName] = useState('')
  const [cards, setCards]     = useState([])
  const [idx, setIdx]         = useState(0)
  const [flipped, setFlip]    = useState(false)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong]     = useState(0)
  const [done, setDone]       = useState(false)

  const startDeck = (deck, type) => {
    const deckCards = DECK_CARDS[deck.slug]
    const finalCards = (deckCards && deckCards.length > 0) ? deckCards : FALLBACK_CARDS
    setCards(finalCards)
    setDeckName(deck.name)
    setIdx(0); setFlip(false); setCorrect(0); setWrong(0); setDone(false)
    setPhase('study')
  }

  const total   = cards.length
  const current = cards[idx]

  const mark = useCallback((isRight) => {
    if (isRight) setCorrect(c => c + 1)
    else setWrong(w => w + 1)
    if (idx + 1 >= total) setDone(true)
    else { setIdx(i => i + 1); setFlip(false) }
  }, [idx, total])

  const restart = () => { setIdx(0); setFlip(false); setCorrect(0); setWrong(0); setDone(false) }

  // ── SELECT PHASE ─────────────────────────────────────────────
  if (phase === 'select') {
    const DeckRow = ({ deck, type }) => {
      const Icon = COURSE_ICON_MAP[deck.slug]
      const color = type === 'tyt' ? '#4A90D0' : '#D0506A'
      const deckCards = DECK_CARDS[deck.slug] || FALLBACK_CARDS
      return (
        <div onClick={() => startDeck(deck, type)}
          style={{ borderRadius:14, padding:'12px 14px', background:'var(--card)',
            border:'1px solid var(--border)', display:'flex', alignItems:'center',
            gap:12, marginBottom:8, cursor:'pointer', transition:'transform .15s' }}
          onMouseEnter={e => e.currentTarget.style.transform='translateX(4px)'}
          onMouseLeave={e => e.currentTarget.style.transform=''}>
          <div style={{ width:28, height:28, borderRadius:8, background:`${color}22`,
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            {Icon ? <Icon color={color} size={18}/> : <span style={{ fontSize:14 }}>📚</span>}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--t1)' }}>{deck.name}</div>
            <div style={{ fontSize:10, color:'var(--t3)' }}>{type === 'tyt' ? 'TYT bölümü' : 'AYT bölümü'}</div>
          </div>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--t3)' }}>{deckCards.length} kart</div>
          <div style={{ fontSize:16, color:'var(--t3)' }}>›</div>
        </div>
      )
    }

    return (
      <div>
        <PageTopbar title="Flashcard Çalış" subtitle="Ders seç ve kartlarla çalış"/>
        <div style={{ maxWidth:480, margin:'0 auto' }}>
          <div style={{ fontSize:10, fontWeight:700, color:'rgba(74,144,208,.9)', letterSpacing:'.08em',
            textTransform:'uppercase', marginBottom:10,
            display:'flex', alignItems:'center', gap:10 }}>
            <span>TYT</span>
            <div style={{ flex:1, height:1, background:'rgba(74,144,208,.2)' }}/>
          </div>
          {TYT_BOLUMLER.map(d => <DeckRow key={d.id} deck={d} type="tyt"/>)}

          <div style={{ fontSize:10, fontWeight:700, color:'rgba(208,80,106,.9)', letterSpacing:'.08em',
            textTransform:'uppercase', marginBottom:10, marginTop:4,
            display:'flex', alignItems:'center', gap:10 }}>
            <span>AYT</span>
            <div style={{ flex:1, height:1, background:'rgba(208,80,106,.2)' }}/>
          </div>
          {AYT_BOLUMLER.map(d => <DeckRow key={d.id} deck={d} type="ayt"/>)}
        </div>
      </div>
    )
  }

  // ── STUDY PHASE ───────────────────────────────────────────────
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
        <button onClick={() => setPhase('select')}
          style={{ background:'none', border:'none', cursor:'pointer', color:'var(--t3)',
            fontSize:18, padding:0, lineHeight:1 }}>←</button>
        <div>
          <div style={{ fontSize:16, fontWeight:800, color:'var(--t1)' }}>{deckName}</div>
          <div style={{ fontSize:10, color:'var(--t3)' }}>Flashcard Çalışması</div>
        </div>
      </div>

      <div style={{maxWidth:480,margin:'0 auto'}}>
        {done ? (
          <div style={{borderRadius:20,padding:32,background:'var(--card)',border:'1px solid var(--border)',textAlign:'center'}}>
            <div style={{fontSize:48,marginBottom:12}}>🎉</div>
            <div style={{fontSize:28,fontWeight:900,color:'var(--t1)',marginBottom:8}}>
              %{Math.round(correct/total*100)}
            </div>
            <div style={{fontSize:14,fontWeight:700,color:'var(--t1)',marginBottom:4}}>Tamamlandı!</div>
            <div style={{fontSize:11,color:'var(--t3)',marginBottom:24}}>{correct} doğru / {wrong} yanlış</div>
            <div style={{ display:'flex', gap:10 }}>
              <button className={`${styles.btn} ${styles.btnOutline}`}
                style={{flex:1,justifyContent:'center'}} onClick={() => setPhase('select')}>
                ← Ders Seç
              </button>
              <button className={`${styles.btn} ${styles.btnPrimary}`}
                style={{flex:1,justifyContent:'center'}} onClick={restart}>
                🔄 Tekrar Başla
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:11,fontWeight:700,color:'var(--t3)',marginBottom:8}}>
              <span>Kart {idx+1} / {total}</span>
              <span>✅ {correct} · ❌ {wrong}</span>
            </div>
            <div style={{height:4,background:'var(--border)',borderRadius:99,overflow:'hidden',marginBottom:20}}>
              <div style={{width:`${(idx/total)*100}%`,height:'100%',background:'linear-gradient(90deg,#0088BB,#00AADD)',borderRadius:99,transition:'width .4s'}}/>
            </div>

            {/* Kart */}
            <div style={{perspective:1000,width:'100%',height:220,marginBottom:20,cursor:'pointer'}}
              onClick={() => setFlip(f => !f)}>
              <div style={{width:'100%',height:'100%',position:'relative',transformStyle:'preserve-3d',
                transition:'transform .5s ease',transform:flipped ? 'rotateY(180deg)' : 'rotateY(0)'}}>
                <div style={{position:'absolute',inset:0,borderRadius:20,padding:24,display:'flex',
                  flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',
                  backfaceVisibility:'hidden',WebkitBackfaceVisibility:'hidden',
                  background:'linear-gradient(145deg,rgba(0,80,140,.6),rgba(0,140,200,.4))',
                  border:'1px solid rgba(0,170,221,.3)'}}>
                  <div style={{fontSize:9,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'rgba(255,255,255,.4)',marginBottom:12}}>SORU</div>
                  <div style={{fontSize:14,fontWeight:700,color:'white',lineHeight:1.5}}>{current?.q}</div>
                  <div style={{fontSize:10,color:'rgba(255,255,255,.3)',marginTop:14}}>Cevabı görmek için tıkla</div>
                </div>
                <div style={{position:'absolute',inset:0,borderRadius:20,padding:24,display:'flex',
                  flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',
                  backfaceVisibility:'hidden',WebkitBackfaceVisibility:'hidden',transform:'rotateY(180deg)',
                  background:'linear-gradient(145deg,rgba(10,70,40,.6),rgba(16,140,80,.4))',
                  border:'1px solid rgba(16,185,129,.3)'}}>
                  <div style={{fontSize:9,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'rgba(255,255,255,.4)',marginBottom:12}}>CEVAP</div>
                  <div style={{fontSize:14,fontWeight:700,color:'white',lineHeight:1.5}}>{current?.a}</div>
                </div>
              </div>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button onClick={() => mark(false)} style={{flex:1,padding:13,borderRadius:14,border:'1px solid rgba(224,80,112,.3)',background:'rgba(224,80,112,.1)',color:'#FF8090',fontFamily:'Montserrat',fontSize:12,fontWeight:700,cursor:'pointer'}}>✗ Bilmiyorum</button>
              <button onClick={() => mark(true)}  style={{flex:1,padding:13,borderRadius:14,border:'1px solid rgba(16,185,129,.3)', background:'rgba(16,185,129,.1)', color:'#10B981', fontFamily:'Montserrat',fontSize:12,fontWeight:700,cursor:'pointer'}}>✓ Biliyorum</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
