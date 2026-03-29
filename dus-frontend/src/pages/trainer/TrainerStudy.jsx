import { useState, useCallback } from 'react'
import { PageTopbar } from '../../components/shared'
import styles from '../../styles/shared.module.css'
import toast from 'react-hot-toast'

const STUDY_CARDS = [
  { q:'Periodontitis tedavisinde ilk basamak nedir?', a:'Başlangıç (Nedensel) Tedavi: SRP ve hasta motivasyonu.' },
  { q:'Gingivitis ile periodontitis arasındaki temel fark?', a:'Gingivitiste kemik kaybı yoktur; periodontitiste periodontal ligament ve kemik etkilenir.' },
  { q:'Periodontal cep nedir?', a:'Bağlantı epitelinin apikale migrasyonu ile oluşan sulkus derinleşmesidir (>3mm).' },
]

export default function TrainerStudy() {
  const [idx, setIdx]       = useState(0)
  const [flipped, setFlip]  = useState(false)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong]     = useState(0)
  const [done, setDone]       = useState(false)

  const total   = STUDY_CARDS.length
  const current = STUDY_CARDS[idx]

  const mark = useCallback((isRight) => {
    if (isRight) setCorrect(c => c + 1)
    else setWrong(w => w + 1)
    if (idx + 1 >= total) setDone(true)
    else { setIdx(i => i + 1); setFlip(false) }
  }, [idx, total])

  const restart = () => { setIdx(0); setFlip(false); setCorrect(0); setWrong(0); setDone(false) }

  return (
    <div>
      <PageTopbar title="Flashcard Çalış" subtitle="Kendi kartlarınla çalış ve test et"/>

      <div style={{maxWidth:480,margin:'0 auto'}}>
        {done ? (
          <div style={{borderRadius:20,padding:32,background:'var(--card)',border:'1px solid var(--border)',textAlign:'center'}}>
            <div style={{fontSize:48,marginBottom:12}}>🎉</div>
            <div style={{fontSize:28,fontWeight:900,color:'var(--t1)',marginBottom:8}}>
              %{Math.round(correct/total*100)}
            </div>
            <div style={{fontSize:14,fontWeight:700,color:'var(--t1)',marginBottom:4}}>Tamamlandı!</div>
            <div style={{fontSize:11,color:'var(--t3)',marginBottom:24}}>{correct} doğru / {wrong} yanlış</div>
            <button className={`${styles.btn} ${styles.btnPrimary}`}
              style={{width:'100%',justifyContent:'center'}} onClick={restart}>
              🔄 Tekrar Başla
            </button>
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
                  <div style={{fontSize:14,fontWeight:700,color:'white',lineHeight:1.5}}>{current.q}</div>
                  <div style={{fontSize:10,color:'rgba(255,255,255,.3)',marginTop:14}}>Cevabı görmek için tıkla</div>
                </div>
                <div style={{position:'absolute',inset:0,borderRadius:20,padding:24,display:'flex',
                  flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',
                  backfaceVisibility:'hidden',WebkitBackfaceVisibility:'hidden',transform:'rotateY(180deg)',
                  background:'linear-gradient(145deg,rgba(10,70,40,.6),rgba(16,140,80,.4))',
                  border:'1px solid rgba(16,185,129,.3)'}}>
                  <div style={{fontSize:9,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'rgba(255,255,255,.4)',marginBottom:12}}>CEVAP</div>
                  <div style={{fontSize:14,fontWeight:700,color:'white',lineHeight:1.5}}>{current.a}</div>
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
