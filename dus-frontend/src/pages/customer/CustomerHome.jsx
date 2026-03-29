import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ThemeToggle, LogoSVG } from '../../components/shared'
import styles from '../../styles/shared.module.css'
import { TEMEL_DERSLER, KLINIK_DERSLER, SRS_COLORS } from '../../data'
import { COURSE_ICON_MAP } from '../../data/courseIcons'

const SESSIONS = [
  { name:'Periodontoloji', score:90, conf:4.2, cards:20, when:'Bugün',    color:'#10B981' },
  { name:'Anatomi',        score:67, conf:2.8, cards:18, when:'Dün',      color:'#F5A020' },
  { name:'Farmakoloji',    score:42, conf:1.9, cards:12, when:'2 gün önce',color:'#E05070' },
]

const PLAN_ITEMS = [
  { label:'Anatomi — uzun süredir çalışılmadı',  cards:28, urgency:'Acil',  urgColor:'rgba(224,80,112,.15)', urgText:'#FF8090', dot:'#E05070' },
  { label:'Endodonti — tekrar zamanı geldi',      cards:15, urgency:'Bugün', urgColor:'rgba(245,200,66,.12)', urgText:'#F5C842', dot:'#F5C842' },
  { label:'Periodontoloji — iyi gidiyorsun',      cards:8,  urgency:'Kolay', urgColor:'rgba(16,185,129,.12)', urgText:'#10B981', dot:'#10B981' },
]

function DeckCard({ deck, type }) {
  const navigate = useNavigate()
  const Icon = COURSE_ICON_MAP[deck.slug]
  const accentColor = type === 'temel' ? '#4A90D0' : '#D0506A'
  const fillColor   = type === 'temel'
    ? 'linear-gradient(90deg,#4A90D0,#00AADD)'
    : 'linear-gradient(90deg,#C04060,#FF7090)'

  return (
    <div onClick={() => navigate('/app/quiz')}
      style={{
        borderRadius: 16, padding: '16px 12px 12px',
        cursor: 'pointer', transition: 'transform .18s, box-shadow .18s',
        background: 'var(--card)', border: '1px solid var(--border)',
        textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.12)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = ''
      }}>
      <div style={{ marginBottom: 8 }}>
        {Icon ? <Icon color={accentColor} size={40}/> : <span style={{ fontSize:28 }}>📚</span>}
      </div>
      <div style={{
        fontSize: 11, fontWeight: 800, color: 'var(--t1)', marginBottom: 2, lineHeight: 1.3,
        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: 28,
      }}>{deck.name}</div>
      <div style={{ fontSize: 9, color: 'var(--t3)', marginBottom: 8 }}>{deck.cards} kart</div>
      <div style={{ display:'flex', gap:3, justifyContent:'center', marginBottom:6, minHeight:8 }}>
        {deck.srs.filter(l => l > 0).map((l, i) => (
          <div key={i} style={{ width:7, height:7, borderRadius:'50%', background: SRS_COLORS[l-1] }}/>
        ))}
      </div>
      <div style={{ width:'100%', height:3, background:'var(--border)', borderRadius:99, overflow:'hidden', marginBottom:3 }}>
        <div style={{ width:`${deck.done}%`, height:'100%', borderRadius:99, background:fillColor }}/>
      </div>
      <div style={{ fontSize:9, color:'var(--t3)', fontWeight:600 }}>%{deck.done} · {deck.pending} bekliyor</div>
    </div>
  )
}

export default function CustomerHome() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div>
      {/* Topbar */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingBottom:18}}>
        <div style={{display:'flex',alignItems:'center',gap:9}}>
          <div style={{width:36,height:36,borderRadius:11,background:'rgba(0,170,221,.18)',border:'1px solid rgba(0,170,221,.3)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <LogoSVG size={22}/>
          </div>
          <div>
            <div style={{fontSize:14,fontWeight:800,color:'var(--t1)',letterSpacing:'-.02em'}}>dusakademisi<span style={{color:'var(--t3)',fontWeight:500,fontSize:11}}>.com</span></div>
          </div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <ThemeToggle/>
          <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,#00AADD,#0055AA)',border:'1.5px solid rgba(0,170,221,.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'white',cursor:'pointer'}}
            onClick={() => navigate('/app/profile')}>
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
        </div>
      </div>

      {/* Hero */}
      <div onClick={() => navigate('/app/quiz')}
        style={{borderRadius:22,padding:'20px 18px',marginBottom:12,cursor:'pointer',textAlign:'center',
          position:'relative',overflow:'hidden',transition:'transform .2s',
          background:'linear-gradient(135deg,rgba(0,100,160,.5),rgba(0,170,221,.35))',
          border:'1px solid rgba(0,170,221,.28)'}}
        onMouseEnter={e => e.currentTarget.style.transform='scale(1.01)'}
        onMouseLeave={e => e.currentTarget.style.transform=''}>
        <div style={{fontSize:10,fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:4,color:'rgba(255,255,255,.5)'}}>👋 Hoş geldin, Dr. Adayı</div>
        <div style={{fontSize:18,fontWeight:800,color:'white',lineHeight:1.3,marginBottom:16}}>DUS'a hazırlığında<br/>bugün ne çalışıyorsun?</div>
        <div style={{display:'flex',justifyContent:'center',marginBottom:16}}>
          {[{v:'847',l:'Toplam kart'},{v:'12 🔥',l:'Gün serisi'},{v:'%61',l:'Başarı'},{v:'234',l:'Bekliyor'}].map((s,i,a) => (
            <div key={i} style={{flex:1,textAlign:'center',padding:'0 8px',borderRight:i<a.length-1?'1px solid rgba(255,255,255,.12)':'none'}}>
              <div style={{fontSize:18,fontWeight:900,color:'white'}}>{s.v}</div>
              <div style={{fontSize:9,color:'rgba(255,255,255,.5)',marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>
        <button style={{borderRadius:12,padding:'10px 22px',fontSize:12,fontWeight:700,color:'white',cursor:'pointer',border:'none',background:'rgba(255,255,255,.18)',backdropFilter:'blur(10px)'}}>
          Çalışmaya başla →
        </button>
      </div>

      {/* Streak */}
      <div style={{borderRadius:16,padding:'13px 16px',display:'flex',alignItems:'center',gap:12,marginBottom:12,
        background:'linear-gradient(90deg,rgba(245,160,20,.18),rgba(245,200,66,.1))',border:'1px solid rgba(245,200,66,.22)'}}>
        <div style={{fontSize:24}}>🔥</div>
        <div style={{flex:1}}>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:'.09em',textTransform:'uppercase',color:'#F5C842',marginBottom:2}}>Günlük Seri</div>
          <div style={{fontSize:15,fontWeight:800,color:'var(--t1)'}}>12 gün — bu hafta mükemmel!</div>
        </div>
        <div style={{display:'flex',gap:4}}>
          {Array(7).fill(0).map((_,i) => <div key={i} style={{width:8,height:8,borderRadius:'50%',background:'#F5C842'}}/>)}
        </div>
      </div>

      {/* Sınav geri sayım */}
      <div style={{borderRadius:16,padding:'13px 16px',display:'flex',alignItems:'center',gap:12,marginBottom:14,
        background:'rgba(245,200,66,.08)',border:'1px solid rgba(245,200,66,.18)'}}>
        <div style={{fontSize:22}}>📅</div>
        <div style={{flex:1}}>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:'.09em',textTransform:'uppercase',color:'#F5C842',marginBottom:2}}>Sınava Kalan</div>
          <div style={{fontSize:15,fontWeight:800,color:'var(--t1)'}}>127 gün — Aralık 2025 DUS</div>
          <div style={{fontSize:10,color:'var(--t3)',marginTop:1}}>Günde 50 kart → 6.350 kart tamamlanır</div>
        </div>
      </div>

      {/* Aktif plan */}
      <div onClick={() => navigate('/app/shop')}
        style={{borderRadius:16,padding:'13px 16px',display:'flex',alignItems:'center',gap:12,marginBottom:16,cursor:'pointer',
          background:'rgba(0,100,160,.3)',border:'1px solid rgba(0,170,221,.25)'}}
        onMouseEnter={e => e.currentTarget.style.opacity='.9'}
        onMouseLeave={e => e.currentTarget.style.opacity='1'}>
        <div style={{fontSize:20}}>💙</div>
        <div style={{flex:1}}>
          <div style={{fontSize:11,fontWeight:800,color:'white',marginBottom:1}}>DUS Pro — Aktif Plan</div>
          <div style={{fontSize:10,color:'rgba(255,255,255,.5)'}}>₺499/ay · AI kart üretimi dahil · 28 Nis yenilenir</div>
        </div>
        <div style={{fontSize:11,color:'#00AADD',fontWeight:700}}>Yönet ›</div>
      </div>

      {/* AI Çalışma Planı */}
      <div style={{fontSize:12,fontWeight:700,color:'var(--t3)',letterSpacing:'.07em',textTransform:'uppercase',marginBottom:8}}>🤖 Bugünkü AI Planı</div>
      <div style={{borderRadius:16,padding:16,marginBottom:16,background:'rgba(160,139,250,.1)',border:'1px solid rgba(160,139,250,.22)'}}>
        <div style={{fontSize:12,fontWeight:700,color:'#A78BFA',marginBottom:10}}>🧠 Spaced repetition — bugün seni bekleyenler</div>
        {PLAN_ITEMS.map((p,i) => (
          <div key={i} onClick={() => navigate('/app/quiz')}
            style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',padding:'8px 10px',
              borderRadius:10,background:'var(--input)',border:'1px solid var(--border)',marginBottom:6,transition:'background .15s'}}
            onMouseEnter={e => e.currentTarget.style.background='var(--hover)'}
            onMouseLeave={e => e.currentTarget.style.background='var(--input)'}>
            <div style={{width:8,height:8,borderRadius:'50%',background:p.dot,flexShrink:0}}/>
            <div style={{flex:1,fontSize:11,fontWeight:600,color:'var(--t1)'}}>{p.label}</div>
            <div style={{fontSize:10,color:'var(--t3)'}}>{p.cards} kart</div>
            <div style={{fontSize:9,fontWeight:700,padding:'2px 8px',borderRadius:6,background:p.urgColor,color:p.urgText}}>{p.urgency}</div>
          </div>
        ))}
      </div>

      {/* Çalışma modları */}
      <div style={{fontSize:12,fontWeight:700,color:'var(--t3)',letterSpacing:'.07em',textTransform:'uppercase',marginBottom:8}}>Çalışma Modları</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:18}}>
        {[
          {icon:'🃏',name:'Kartlar',desc:'Çevir & öğren',to:'/app/decks'},
          {icon:'🎯',name:'Quiz',desc:'4 seçenekli',to:'/app/quiz'},
          {icon:'🖼️',name:'Bilgi Kartları',desc:'Görsel hafıza ✦Pro',to:'/app/image-cards'},
        ].map((m,i) => (
          <div key={i} onClick={() => navigate(m.to)}
            style={{borderRadius:14,padding:'12px 8px',display:'flex',flexDirection:'column',alignItems:'center',gap:6,cursor:'pointer',transition:'transform .15s',textAlign:'center',background:'var(--card)',border:'1px solid var(--border)'}}
            onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform=''}>
            <div style={{fontSize:22}}>{m.icon}</div>
            <div style={{fontSize:11,fontWeight:700,color:'var(--t1)'}}>{m.name}</div>
            <div style={{fontSize:9,color:'var(--t3)'}}>{m.desc}</div>
          </div>
        ))}
      </div>

      {/* Desteler */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:700,color:'var(--t3)',letterSpacing:'.07em',textTransform:'uppercase'}}>Deste Kütüphanem</div>
        <span style={{fontSize:12,color:'#00AADD',fontWeight:600,cursor:'pointer'}} onClick={() => navigate('/app/decks')}>Tümü →</span>
      </div>
      <div style={{display:'flex',gap:6,justifyContent:'center',marginBottom:10,flexWrap:'wrap'}}>
        {[{c:'#E05070',l:'Kritik'},{c:'#F5A020',l:'Orta'},{c:'#10B981',l:'İyi'},{c:'#4A90D0',l:'Uzman'}].map(s => (
          <div key={s.l} style={{display:'flex',alignItems:'center',gap:5,fontSize:9,fontWeight:600,color:'var(--t3)'}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:s.c}}/>{s.l}
          </div>
        ))}
      </div>
      <div style={{marginBottom:6,fontSize:10,fontWeight:700,color:'rgba(74,144,208,.9)',letterSpacing:'.08em',textTransform:'uppercase',display:'flex',alignItems:'center',gap:8}}>
        <span>Temel Bilimler</span>
        <div style={{flex:1,height:1,background:'rgba(74,144,208,.2)'}}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:14}}>
        {TEMEL_DERSLER.slice(0,4).map(d => <DeckCard key={d.id} deck={d} type="temel"/>)}
      </div>

      {/* Son çalışmalar */}
      <div style={{fontSize:12,fontWeight:700,color:'var(--t3)',letterSpacing:'.07em',textTransform:'uppercase',marginBottom:10}}>Son Çalışmalar</div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {SESSIONS.map((s,i) => (
          <div key={i} onClick={() => navigate('/app/progress')}
            style={{borderRadius:12,padding:'11px 13px',display:'flex',alignItems:'center',gap:11,cursor:'pointer',
              background:'var(--card)',border:'1px solid var(--border)',transition:'transform .15s'}}
            onMouseEnter={e => e.currentTarget.style.transform='translateX(4px)'}
            onMouseLeave={e => e.currentTarget.style.transform=''}>
            <div style={{width:34,height:34,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',background:'var(--input)',border:'1px solid var(--border)',fontSize:16,flexShrink:0}}>🃏</div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700,color:'var(--t1)'}}>{s.name}</div>
              <div style={{fontSize:10,color:'var(--t3)'}}>{s.when} · {s.cards} kart · Güven: {s.conf}/5</div>
            </div>
            <div style={{fontSize:14,fontWeight:900,padding:'3px 9px',borderRadius:8,background:'var(--input)',border:'1px solid var(--border)',color:s.color}}>%{s.score}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
