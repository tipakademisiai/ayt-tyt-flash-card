import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { KpiCard, PageTopbar } from '../../components/shared'
import styles from '../../styles/shared.module.css'

const URGENT = [
  { initials:'ZŞ', name:'Dr. Zeynep Şahin', text:'Satın aldığım paketi göremiyorum!', time:'2 dk', tag:'Acil',    tagColor:'#E05070', bg:'linear-gradient(135deg,#00AADD,#0055AA)' },
  { initials:'MK', name:'Mehmet Kılıç',     text:'İade talebim var, ödeme iptali nasıl?', time:'45 dk', tag:'İade', tagColor:'#F5C842', bg:'linear-gradient(135deg,#A78BFA,#7C3AED)' },
  { initials:'AY', name:'Ayşe Yıldırım',    text:'Anatomi kartında hatalı bilgi var.', time:'3 sa', tag:'İçerik',  tagColor:'#00AADD', bg:'linear-gradient(135deg,#10B981,#059669)' },
]

const CATS = [
  { label:'Teknik sorun',   pct:42, color:'linear-gradient(90deg,#E05070,#FF8090)' },
  { label:'İçerik sorusu', pct:28, color:'linear-gradient(90deg,#0088BB,#00AADD)' },
  { label:'İade talebi',   pct:18, color:'linear-gradient(90deg,#D97706,#F5C842)' },
  { label:'Diğer',         pct:12, color:'linear-gradient(90deg,#7C3AED,#A78BFA)' },
]

export default function SupportDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div>
      <PageTopbar
        title={`Merhaba, ${user?.first_name || 'Büşra'} 👋`}
        subtitle="Bugün 34 açık mesaj var — hadi başlayalım">
        <button className={`${styles.btn} ${styles.btnYellow}`} onClick={() => navigate('/support/messages')}>
          📨 Mesajlara Git
        </button>
      </PageTopbar>

      <div className={`${styles.kpiRow} ${styles.c4}`}>
        <KpiCard icon="💬" value="34"  label="Açık Mesaj"      change="+8 bugün" changeType="dn"/>
        <KpiCard icon="🗨️" value="12"  label="Bekleyen Yorum"  change="+3 bugün" changeType="dn"/>
        <KpiCard icon="⚡" value="2.4s" label="Ort. Yanıt Süresi" change="↑ %12" changeType="up"/>
        <KpiCard icon="👥" value="1.284" label="Toplam Kullanıcı" change="↑ %5" changeType="up"/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        <div className={styles.card}>
          <div style={{fontSize:13,fontWeight:800,color:'var(--t1)',marginBottom:14}}>🔴 Acil Mesajlar</div>
          {URGENT.map((u,i) => (
            <div key={i} style={{padding:11,borderRadius:12,marginBottom:8,cursor:'pointer',
              background: i===0 ? 'rgba(224,80,112,.08)' : 'var(--hover)',
              border: i===0 ? '1px solid rgba(224,80,112,.2)' : '1px solid var(--border)'}}
              onClick={() => navigate('/support/messages')}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                <div style={{width:26,height:26,borderRadius:'50%',background:u.bg,display:'flex',
                  alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:800,color:'white'}}>
                  {u.initials}
                </div>
                <div style={{fontSize:11,fontWeight:700,color:'var(--t1)'}}>{u.name}</div>
                <span style={{marginLeft:'auto',fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:6,
                  background:`${u.tagColor}22`,color:u.tagColor}}>{u.tag}</span>
              </div>
              <div style={{fontSize:11,color:'var(--t2)'}}>{u.text}</div>
              <div style={{fontSize:10,color:'var(--t3)',marginTop:4}}>{u.time} önce</div>
            </div>
          ))}
          <button className={`${styles.btn} ${styles.btnYellow}`}
            style={{width:'100%',justifyContent:'center',marginTop:4}}
            onClick={() => navigate('/support/messages')}>
            Tüm Mesajları Gör (34)
          </button>
        </div>

        <div className={styles.card}>
          <div style={{fontSize:13,fontWeight:800,color:'var(--t1)',marginBottom:14}}>📊 Bugünün Özeti</div>
          {[
            { label:'Cevaplanmış mesaj', value:28, color:'#10B981' },
            { label:'Çözülen teknik sorun', value:7, color:'#00AADD' },
            { label:'İşlenen iade talebi', value:3, color:'#F5C842' },
            { label:'Düzeltilen içerik', value:5, color:'#A78BFA' },
          ].map((s,i) => (
            <div key={i} style={{display:'flex',justifyContent:'space-between',
              padding:'9px 0',borderBottom:i<3?'1px solid var(--border)':'none'}}>
              <span style={{fontSize:12,fontWeight:600,color:'var(--t2)'}}>{s.label}</span>
              <span style={{fontSize:14,fontWeight:800,color:s.color}}>{s.value}</span>
            </div>
          ))}
          <div style={{marginTop:16,fontSize:12,fontWeight:700,color:'var(--t1)',marginBottom:10}}>Mesaj Kategorileri</div>
          {CATS.map(c => (
            <div key={c.label} style={{display:'flex',alignItems:'center',gap:10,marginBottom:9}}>
              <div style={{fontSize:11,fontWeight:600,color:'var(--t2)',width:110,flexShrink:0}}>{c.label}</div>
              <div style={{flex:1,height:6,background:'var(--border)',borderRadius:99,overflow:'hidden'}}>
                <div style={{width:`${c.pct}%`,height:'100%',background:c.color,borderRadius:99}}/>
              </div>
              <div style={{fontSize:11,fontWeight:700,color:'var(--t1)',width:36,textAlign:'right'}}>%{c.pct}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
