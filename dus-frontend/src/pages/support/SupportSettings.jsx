import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { PageTopbar } from '../../components/shared'
import styles from '../../styles/shared.module.css'
import toast from 'react-hot-toast'

function Toggle({ on, onToggle }) {
  return (
    <div onClick={onToggle} style={{width:36,height:20,borderRadius:99,position:'relative',cursor:'pointer',
      background:on?'#F5C842':'rgba(255,255,255,.15)',transition:'background .2s',flexShrink:0}}>
      <div style={{width:14,height:14,borderRadius:'50%',background:'white',position:'absolute',top:3,
        left:on?19:3,transition:'left .2s'}}/>
    </div>
  )
}

export default function SupportSettings() {
  const { user } = useAuth()
  const [notifs, setNotifs] = useState({ newMsg:true, urgent:true, contentError:true, dailySummary:false, online:true })
  const tog = k => setNotifs(n => ({...n, [k]:!n[k]}))

  return (
    <div>
      <PageTopbar title="Profil & Ayarlar" subtitle="Hesap bilgileri ve bildirim tercihleri">
        <button className={`${styles.btn} ${styles.btnYellow}`} onClick={() => toast('Ayarlar kaydedildi ✅')}>💾 Kaydet</button>
      </PageTopbar>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        <div className={styles.card}>
          <div style={{fontSize:13,fontWeight:800,color:'var(--t1)',marginBottom:16}}>👤 Profil</div>
          <div style={{textAlign:'center',marginBottom:18}}>
            <div style={{width:68,height:68,borderRadius:'50%',background:'linear-gradient(135deg,#F5C842,#D97706)',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:800,color:'white',margin:'0 auto 10px'}}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <button className={`${styles.btn} ${styles.btnOutline}`} style={{fontSize:10,padding:'4px 10px'}}>Fotoğraf Değiştir</button>
          </div>
          <div style={{marginBottom:12}}><label className={styles.formLabel}>Ad Soyad</label><input className={styles.formInput} defaultValue={user?.full_name || 'Büşra Demir'}/></div>
          <div style={{marginBottom:12}}><label className={styles.formLabel}>E-posta</label><input className={styles.formInput} defaultValue={user?.email || 'busra@dusakademisi.com'}/></div>
          <div style={{marginBottom:12}}><label className={styles.formLabel}>Rol</label><input className={styles.formInput} defaultValue="Müşteri Hizmetleri" readOnly style={{opacity:.6}}/></div>
        </div>

        <div className={styles.card}>
          <div style={{fontSize:13,fontWeight:800,color:'var(--t1)',marginBottom:16}}>🔔 Bildirim Tercihleri</div>
          {[
            {key:'newMsg',       label:'Yeni mesaj bildirimi',   sub:'Kullanıcı mesaj gönderdiğinde bildir'},
            {key:'urgent',       label:'Acil mesaj alarmı',      sub:'Acil etiketli mesajlarda sesli bildir'},
            {key:'contentError', label:'İçerik hata bildirimi',  sub:'Kullanıcı hata raporladığında bildir'},
            {key:'dailySummary', label:'Günlük özet maili',      sub:'Her sabah 09:00\'da istatistik özeti'},
            {key:'online',       label:'Çevrimiçi durumu',       sub:'Kullanıcılar seni çevrimiçi görsün'},
          ].map(r => (
            <div key={r.key} style={{display:'flex',alignItems:'center',justifyContent:'space-between',
              padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:'var(--t1)'}}>{r.label}</div>
                <div style={{fontSize:10,color:'var(--t3)'}}>{r.sub}</div>
              </div>
              <Toggle on={notifs[r.key]} onToggle={() => tog(r.key)}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
