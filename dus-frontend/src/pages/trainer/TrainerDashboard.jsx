import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { KpiCard, PageTopbar } from '../../components/shared'
import styles from '../../styles/shared.module.css'
import toast from 'react-hot-toast'

const STATS = [
  { name:'Türkçe (TYT)',             pct:82, color:'linear-gradient(90deg,#0088BB,#00AADD)' },
  { name:'Matematik (TYT)',          pct:74, color:'linear-gradient(90deg,#0088BB,#00AADD)' },
  { name:'Fen Bilimleri (TYT)',      pct:65, color:'linear-gradient(90deg,#7C3AED,#A78BFA)' },
  { name:'AYT Matematik',            pct:58, color:'linear-gradient(90deg,#F5A020,#F5C842)' },
  { name:'Fen Bilimleri (AYT)',      pct:44, color:'linear-gradient(90deg,#E05070,#FF8090)' },
]

const QUESTIONS = [
  { initials:'ZŞ', name:'Zeynep Şahin',  text:'TYT Matematik — Problemler konusunda nereden başlamalıyım?', time:'2 dk', unread:true, bg:'linear-gradient(135deg,#00AADD,#0055AA)' },
  { initials:'MK', name:'Mehmet Kılıç',  text:'AYT Fizik — Elektrik ve manyetizma arasındaki fark nedir?',  time:'45 dk', unread:true, bg:'linear-gradient(135deg,#A78BFA,#7C3AED)' },
  { initials:'AY', name:'Ayşe Yıldırım', text:'Türkçe paragraf sorularında zaman yönetimi nasıl olmalı?',   time:'3 sa', unread:false, bg:'linear-gradient(135deg,#10B981,#059669)' },
]

export default function TrainerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div>
      <PageTopbar
        title={`Merhaba, ${user?.first_name || 'Dr.'} 👋`}
        subtitle={`${user?.branch || 'TYT/AYT'} — bugünkü durum`}>
        <button className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => navigate('/trainer/cards')}>+ Yeni Kart</button>
      </PageTopbar>

      <div className={`${styles.kpiRow} ${styles.c4}`}>
        <KpiCard icon="🃏" value="124"    label="Toplam Kartım"       change="+12"   changeType="up"/>
        <KpiCard icon="💬" value="18"     label="Bekleyen Soru"       change="18 yeni" changeType="dn"/>
        <KpiCard icon="⭐" value="4.8 ⭐" label="Değerlendirme"       change="↑ 0.2" changeType="up"/>
        <KpiCard icon="💰" value="₺9.658" label="Bu Ay Kazandım"      change="↑ %8"  changeType="up"/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        <div className={styles.card}>
          <div style={{fontSize:13,fontWeight:800,color:'var(--t1)',marginBottom:4}}>Bölüm Bazlı Başarı</div>
          <div style={{fontSize:10,color:'var(--t3)',marginBottom:14}}>Öğrenci quiz başarı oranları</div>
          {STATS.map(s => (
            <div key={s.name} style={{display:'flex',alignItems:'center',gap:10,marginBottom:9}}>
              <div style={{fontSize:11,fontWeight:600,color:'var(--t2)',width:150,flexShrink:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.name}</div>
              <div style={{flex:1,height:5,background:'var(--border)',borderRadius:99,overflow:'hidden'}}>
                <div style={{width:`${s.pct}%`,height:'100%',background:s.color,borderRadius:99}}/>
              </div>
              <div style={{fontSize:11,fontWeight:700,color:'var(--t1)',width:32,textAlign:'right'}}>%{s.pct}</div>
            </div>
          ))}
        </div>

        <div className={styles.card}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:800,color:'var(--t1)'}}>Bekleyen Sorular</div>
            <span style={{fontSize:10,fontWeight:700,color:'#00AADD',cursor:'pointer'}}
              onClick={() => navigate('/trainer/questions')}>Tümünü gör</span>
          </div>
          {QUESTIONS.map((q,i) => (
            <div key={i} style={{
              display:'flex',alignItems:'flex-start',gap:10,padding:11,borderRadius:12,
              marginBottom:8,cursor:'pointer',
              background: q.unread ? 'rgba(0,170,221,.05)' : 'var(--hover)',
              border: q.unread ? '1px solid rgba(0,170,221,.2)' : '1px solid var(--border)',
              transition:'transform .15s'
            }} onClick={() => navigate('/trainer/questions')}>
              <div style={{width:28,height:28,borderRadius:'50%',background:q.bg,display:'flex',
                alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:800,color:'white',flexShrink:0}}>
                {q.initials}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:11,fontWeight:700,color:'var(--t1)',marginBottom:2}}>{q.name}</div>
                <div style={{fontSize:11,color:'var(--t2)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{q.text}</div>
                <div style={{fontSize:9,color:'var(--t3)',marginTop:3}}>{q.time} önce</div>
              </div>
              {q.unread && <div style={{width:7,height:7,borderRadius:'50%',background:'#00AADD',flexShrink:0,marginTop:4}}/>}
            </div>
          ))}
          <button className={`${styles.btn} ${styles.btnPrimary}`}
            style={{width:'100%',justifyContent:'center',marginTop:4}}
            onClick={() => navigate('/trainer/questions')}>
            Tüm Soruları Gör (18)
          </button>
        </div>
      </div>
    </div>
  )
}
