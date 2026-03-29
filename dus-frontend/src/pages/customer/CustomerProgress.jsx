import { ThemeToggle } from '../../components/shared'

const COURSE_STATS = [
  { name:'Periodontoloji', pct:78, color:'linear-gradient(90deg,#0088BB,#00AADD)' },
  { name:'Endodonti',      pct:60, color:'linear-gradient(90deg,#0088BB,#00AADD)' },
  { name:'Anatomi',        pct:65, color:'linear-gradient(90deg,#7C3AED,#A78BFA)' },
  { name:'Ortodonti',      pct:38, color:'linear-gradient(90deg,#D97706,#F5C842)' },
  { name:'Farmakoloji',    pct:20, color:'linear-gradient(90deg,#9D174D,#E05070)' },
  { name:'Mikrobiyoloji',  pct:30, color:'linear-gradient(90deg,#E05070,#FF8090)' },
]

const QUIZ_HISTORY = [
  { name:'Periodontoloji', score:90, conf:4.2, cards:20, when:'Bugün',      scoreC:'#10B981' },
  { name:'Anatomi',        score:67, conf:2.8, cards:18, when:'Dün',         scoreC:'#F5A020' },
  { name:'Farmakoloji',    score:42, conf:1.9, cards:12, when:'2 gün önce',  scoreC:'#E05070' },
]

export default function CustomerProgress() {
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingBottom:18}}>
        <div style={{fontSize:19,fontWeight:900,color:'var(--t1)'}}>İlerleme & İstatistik</div>
        <ThemeToggle/>
      </div>

      {/* KPI grid */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
        {[{v:'847',l:'Toplam Kart',c:'#00AADD'},{v:'%61',l:'Genel Başarı',c:'#10B981'},{v:'12 🔥',l:'Günlük Seri',c:'#F5C842'},{v:'48.2K',l:'Toplam Çalışma',c:'#A78BFA'}].map((k,i) => (
          <div key={i} style={{borderRadius:14,padding:16,background:'var(--card)',border:'1px solid var(--border)',textAlign:'center'}}>
            <div style={{fontSize:24,fontWeight:900,color:k.c,marginBottom:4}}>{k.v}</div>
            <div style={{fontSize:10,fontWeight:600,color:'var(--t3)'}}>{k.l}</div>
          </div>
        ))}
      </div>

      {/* Sınav geri sayım */}
      <div style={{borderRadius:16,padding:'13px 16px',display:'flex',alignItems:'center',gap:12,marginBottom:14,
        background:'rgba(245,200,66,.08)',border:'1px solid rgba(245,200,66,.18)'}}>
        <div style={{fontSize:22}}>📅</div>
        <div style={{flex:1}}>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:'.09em',textTransform:'uppercase',color:'#F5C842',marginBottom:2}}>DUS 2025 — Aralık</div>
          <div style={{fontSize:15,fontWeight:800,color:'var(--t1)'}}>127 gün kaldı</div>
          <div style={{fontSize:10,color:'var(--t3)',marginTop:2}}>Hedefe ulaşmak için günde 50 kart yeterli</div>
        </div>
      </div>

      {/* Haftalık aktivite grafiği */}
      <div style={{borderRadius:16,padding:18,background:'var(--card)',border:'1px solid var(--border)',marginBottom:12}}>
        <div style={{fontSize:13,fontWeight:800,color:'var(--t1)',marginBottom:4}}>Haftalık Aktivite</div>
        <div style={{fontSize:10,color:'var(--t3)',marginBottom:14}}>Son 7 gün — çalışılan kart sayısı</div>
        <svg viewBox="0 0 300 80" style={{width:'100%',height:80}}>
          <defs><linearGradient id="wg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00AADD" stopOpacity=".3"/><stop offset="100%" stopColor="#00AADD" stopOpacity="0"/></linearGradient></defs>
          <line x1="0" y1="20" x2="300" y2="20" stroke="var(--border)" strokeWidth=".5"/>
          <line x1="0" y1="50" x2="300" y2="50" stroke="var(--border)" strokeWidth=".5"/>
          <path d="M15 60 L57 45 L99 55 L141 30 L183 20 L225 35 L267 15"
            fill="none" stroke="#00AADD" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15 60 L57 45 L99 55 L141 30 L183 20 L225 35 L267 15 L267 75 L15 75Z" fill="url(#wg2)"/>
          <circle cx="267" cy="15" r="3.5" fill="#00AADD"/>
          {['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'].map((d,i) => (
            <text key={d} x={15+i*42} y="75" fontSize="8" fill="var(--t3)" textAnchor="middle" fontFamily="Montserrat">{d}</text>
          ))}
        </svg>
      </div>

      {/* Ders bazlı başarı */}
      <div style={{borderRadius:16,padding:18,background:'var(--card)',border:'1px solid var(--border)',marginBottom:12}}>
        <div style={{fontSize:13,fontWeight:800,color:'var(--t1)',marginBottom:14}}>Ders Bazlı Başarı</div>
        {COURSE_STATS.map(c => (
          <div key={c.name} style={{display:'flex',alignItems:'center',gap:10,marginBottom:9}}>
            <div style={{fontSize:11,fontWeight:600,color:'var(--t2)',width:110,flexShrink:0}}>{c.name}</div>
            <div style={{flex:1,height:6,background:'var(--border)',borderRadius:99,overflow:'hidden'}}>
              <div style={{width:`${c.pct}%`,height:'100%',background:c.color,borderRadius:99}}/>
            </div>
            <div style={{fontSize:11,fontWeight:700,color:'var(--t1)',width:36,textAlign:'right'}}>%{c.pct}</div>
          </div>
        ))}
      </div>

      {/* Son quizler */}
      <div style={{borderRadius:16,padding:18,background:'var(--card)',border:'1px solid var(--border)'}}>
        <div style={{fontSize:13,fontWeight:800,color:'var(--t1)',marginBottom:14}}>Son Quizler</div>
        {QUIZ_HISTORY.map((q,i) => (
          <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',
            padding:'10px 12px',borderRadius:10,background:'var(--hover)',marginBottom:8}}>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:'var(--t1)'}}>{q.name}</div>
              <div style={{fontSize:10,color:'var(--t3)'}}>{q.when} · {q.cards} kart · Güven: {q.conf}/5</div>
            </div>
            <div style={{fontSize:14,fontWeight:900,color:q.scoreC}}>%{q.score}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
