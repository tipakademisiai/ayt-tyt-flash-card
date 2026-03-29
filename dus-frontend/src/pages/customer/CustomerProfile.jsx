import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ThemeToggle } from '../../components/shared'
import toast from 'react-hot-toast'

export default function CustomerProfile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [question, setQuestion] = useState('')
  const [course,   setCourse]   = useState('Periodontoloji')

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const sendQuestion = () => {
    if (!question.trim()) return toast.error('Sorunuzu yazın')
    toast.success('✅ Sorunuz eğitmene iletildi! En kısa sürede yanıt alacaksınız.')
    setQuestion('')
  }

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingBottom:18}}>
        <div style={{fontSize:19,fontWeight:900,color:'var(--t1)'}}>Profil & Destek</div>
        <ThemeToggle/>
      </div>

      {/* Profil kartı */}
      <div style={{borderRadius:16,padding:18,background:'var(--card)',border:'1px solid var(--border)',marginBottom:14,textAlign:'center'}}>
        <div style={{width:68,height:68,borderRadius:'50%',background:'linear-gradient(135deg,#00AADD,#0055AA)',
          display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:800,color:'white',margin:'0 auto 12px'}}>
          {user?.first_name?.[0]}{user?.last_name?.[0]}
        </div>
        <div style={{fontSize:16,fontWeight:800,color:'var(--t1)',marginBottom:2}}>{user?.full_name || 'Dr. Zeynep Şahin'}</div>
        <div style={{fontSize:11,color:'var(--t3)',marginBottom:12}}>{user?.email} · DUS Pro</div>
        <div style={{display:'flex',justifyContent:'center',gap:20,marginBottom:14}}>
          {[{v:'847',l:'Kart',c:'#00AADD'},{v:'12🔥',l:'Seri',c:'#F5C842'},{v:'%61',l:'Başarı',c:'#10B981'}].map((s,i) => (
            <div key={i} style={{textAlign:'center'}}>
              <div style={{fontSize:18,fontWeight:900,color:s.c}}>{s.v}</div>
              <div style={{fontSize:10,color:'var(--t3)'}}>{s.l}</div>
            </div>
          ))}
        </div>
        <button style={{width:'100%',padding:'9px',borderRadius:10,border:'1px solid var(--border)',
          background:'var(--input)',color:'var(--t2)',fontFamily:'Montserrat',fontSize:11,fontWeight:700,cursor:'pointer'}}
          onClick={() => toast('Profil düzenleniyor...')}>
          ✏️ Profili Düzenle
        </button>
      </div>

      {/* Soru sor */}
      <div style={{borderRadius:16,padding:18,background:'var(--card)',border:'1px solid var(--border)',marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:800,color:'var(--t1)',marginBottom:4}}>💬 Eğitmene Soru Sor</div>
        <div style={{fontSize:10,color:'var(--t3)',marginBottom:14}}>Sorunuz eğitmene, admine ve müşteri hizmetlerine iletilir</div>
        <div style={{marginBottom:10}}>
          <label style={{fontSize:10,fontWeight:700,color:'var(--t3)',letterSpacing:'.08em',textTransform:'uppercase',display:'block',marginBottom:5}}>İlgili Ders</label>
          <select style={{width:'100%',padding:'10px 12px',borderRadius:10,fontFamily:'Montserrat',fontSize:12,
            fontWeight:500,color:'var(--t1)',outline:'none',background:'var(--input)',border:'1px solid var(--inputborder)'}}
            value={course} onChange={e => setCourse(e.target.value)}>
            {['Periodontoloji','Endodonti','Anatomi','Ortodonti','Farmakoloji'].map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div style={{marginBottom:10}}>
          <label style={{fontSize:10,fontWeight:700,color:'var(--t3)',letterSpacing:'.08em',textTransform:'uppercase',display:'block',marginBottom:5}}>Sorunuz</label>
          <textarea style={{width:'100%',padding:'10px 12px',borderRadius:10,fontFamily:'Montserrat',fontSize:12,
            fontWeight:500,color:'var(--t1)',outline:'none',background:'var(--input)',border:'1px solid var(--inputborder)',
            resize:'none'}}
            rows={4} placeholder="Sorunuzu detaylı yazın..."
            value={question} onChange={e => setQuestion(e.target.value)}/>
        </div>
        <button style={{width:'100%',padding:12,borderRadius:10,border:'none',
          background:'linear-gradient(135deg,#0088BB,#00AADD)',color:'white',
          fontFamily:'Montserrat',fontSize:12,fontWeight:700,cursor:'pointer'}}
          onClick={sendQuestion}>
          Gönder →
        </button>
      </div>

      {/* Geçmiş sorular */}
      <div style={{borderRadius:16,padding:18,background:'var(--card)',border:'1px solid var(--border)',marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:800,color:'var(--t1)',marginBottom:14}}>📨 Geçmiş Sorularım</div>
        <div style={{padding:11,borderRadius:12,background:'rgba(16,185,129,.08)',border:'1px solid rgba(16,185,129,.2)',marginBottom:8}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--t1)',marginBottom:3}}>Periodontitis tedavisinde SRP nasıl uygulanır?</div>
          <div style={{fontSize:10,color:'var(--t3)',marginBottom:5}}>Periodontoloji · 2 gün önce</div>
          <div style={{fontSize:11,color:'var(--t2)',lineHeight:1.6}}>Dr. Kaya: SRP, ultrasonik ve el aletleri ile subgingival plak ve taş uzaklaştırma işlemidir...</div>
          <div style={{display:'inline-flex',fontSize:9,fontWeight:700,padding:'2px 8px',borderRadius:6,background:'rgba(16,185,129,.15)',color:'#10B981',marginTop:6}}>Cevaplandı</div>
        </div>
        <div style={{padding:11,borderRadius:12,background:'var(--hover)',border:'1px solid var(--border)'}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--t1)',marginBottom:3}}>Furkasyon sınıflaması Hamp II ile III farkı?</div>
          <div style={{fontSize:10,color:'var(--t3)',marginBottom:5}}>Periodontoloji · 5 dk önce</div>
          <div style={{display:'inline-flex',fontSize:9,fontWeight:700,padding:'2px 8px',borderRadius:6,background:'rgba(245,200,66,.15)',color:'#F5C842'}}>Bekleniyor</div>
        </div>
      </div>

      {/* Ayarlar */}
      <div style={{borderRadius:16,padding:18,background:'var(--card)',border:'1px solid var(--border)'}}>
        <div style={{fontSize:13,fontWeight:800,color:'var(--t1)',marginBottom:14}}>⚙️ Hızlı Ayarlar</div>
        {[
          {icon:'🔔', label:'Bildirimler',       action:() => toast('Bildirim ayarları')},
          {icon:'💳', label:'Abonelik Yönet',    action:() => navigate('/app/shop')},
          {icon:'🔑', label:'Şifre Değiştir',    action:() => toast('Şifre sıfırlama maili gönderildi')},
        ].map((item,i) => (
          <div key={i} onClick={item.action}
            style={{display:'flex',alignItems:'center',justifyContent:'space-between',
              padding:'11px 0',borderBottom:'1px solid var(--border)',cursor:'pointer'}}>
            <div style={{fontSize:12,fontWeight:600,color:'var(--t1)'}}>{item.icon} {item.label}</div>
            <div style={{fontSize:12,color:'var(--t3)'}}>›</div>
          </div>
        ))}
        <div onClick={handleLogout}
          style={{display:'flex',alignItems:'center',justifyContent:'space-between',
            padding:'11px 0',cursor:'pointer'}}>
          <div style={{fontSize:12,fontWeight:600,color:'#E05070'}}>🚪 Çıkış Yap</div>
          <div style={{fontSize:12,color:'var(--t3)'}}>›</div>
        </div>
      </div>
    </div>
  )
}
