import { useState } from 'react'
import { PageTopbar } from '../../components/shared'
import styles from '../../styles/shared.module.css'
import toast from 'react-hot-toast'

const HISTORY = [
  { title:'Teknik bakım tamamlandı', target:'1.284 kişi', type:'Push', time:'1 sa önce', read:74 },
  { title:'Trial süreniz bitiyor ⚠️', target:'156 kişi', type:'E-posta', time:'Dün', read:81 },
  { title:'Yeni Periodontoloji kartları', target:'360 kişi', type:'Push', time:'2 gün', read:82 },
]

export default function SupportNotifications() {
  const [title, setTitle]   = useState('Teknik bakım tamamlandı 🔧')
  const [body,  setBody]    = useState('Platform güncellemesi tamamlandı. Tüm içeriklerinize sorunsuz erişebilirsiniz.')
  const [target,setTarget]  = useState('all')
  const [type,  setType]    = useState('push')
  const [sending,setSending] = useState(false)

  const send = async () => {
    setSending(true)
    await new Promise(r => setTimeout(r, 1000))
    setSending(false)
    toast.success('📣 Bildirim gönderildi!')
  }

  return (
    <div>
      <PageTopbar title="Bildirim Gönder" subtitle="Kullanıcılara toplu veya bireysel bildirim"/>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        <div className={styles.card}>
          <div style={{fontSize:13,fontWeight:800,color:'var(--t1)',marginBottom:16}}>📣 Yeni Bildirim</div>

          <div style={{marginBottom:12}}>
            <label className={styles.formLabel}>Hedef</label>
            <select className={styles.formInput} value={target} onChange={e => setTarget(e.target.value)}>
              <option value="all">Tüm Kullanıcılar (1.284)</option>
              <option value="pro">Pro Kullanıcılar</option>
              <option value="trial">Trial Kullanıcılar</option>
            </select>
          </div>

          <div style={{marginBottom:14}}>
            <label className={styles.formLabel}>Tür</label>
            <div style={{display:'flex',gap:8}}>
              {[['push','📱 Push'],['email','✉️ E-posta'],['inapp','💬 In-App']].map(([v,l]) => (
                <div key={v} onClick={() => setType(v)} style={{flex:1,padding:9,borderRadius:10,
                  cursor:'pointer',fontSize:11,fontWeight:700,textAlign:'center',
                  background: type===v ? 'linear-gradient(135deg,#0088BB,#00AADD)' : 'var(--input)',
                  border: type===v ? 'none' : '1px solid var(--border)',
                  color: type===v ? 'white' : 'var(--t2)'}}>
                  {l}
                </div>
              ))}
            </div>
          </div>

          <div style={{marginBottom:12}}>
            <label className={styles.formLabel}>Başlık</label>
            <input className={styles.formInput} value={title} onChange={e => setTitle(e.target.value)}/>
          </div>
          <div style={{marginBottom:18}}>
            <label className={styles.formLabel}>Mesaj</label>
            <textarea className={styles.formInput} rows={4} value={body}
              onChange={e => setBody(e.target.value)} style={{resize:'none'}}/>
          </div>

          <button className={`${styles.btn} ${styles.btnYellow}`}
            style={{width:'100%',justifyContent:'center',padding:12,fontSize:13}}
            disabled={sending} onClick={send}>
            {sending ? '📤 Gönderiliyor...' : 'Gönder →'}
          </button>
        </div>

        <div className={styles.card}>
          <div style={{fontSize:13,fontWeight:800,color:'var(--t1)',marginBottom:16}}>📋 Son Gönderimler</div>
          {HISTORY.map((h,i) => (
            <div key={i} style={{padding:12,borderRadius:12,background:'var(--hover)',border:'1px solid var(--border)',marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                <span style={{fontSize:11,fontWeight:700,color:'var(--t1)'}}>{h.title}</span>
                <span style={{fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:6,background:'rgba(16,185,129,.15)',color:'#10B981'}}>Başarılı</span>
              </div>
              <div style={{fontSize:10,color:'var(--t3)',marginBottom:6}}>{h.target} · {h.type} · {h.time}</div>
              <div style={{display:'flex',gap:12,fontSize:10,fontWeight:600}}>
                <span style={{color:'#00AADD'}}>📤 {h.target} gönderildi</span>
                <span style={{color:'#10B981'}}>✅ %{h.read} okundu</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
