import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ThemeToggle, LogoSVG } from '../../components/shared'
import toast from 'react-hot-toast'
import styles from './auth.module.css'

export default function RegisterPage() {
  const [form, setForm]     = useState({ first_name:'', last_name:'', email:'', password:'', password2:'' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password2) return toast.error('Şifreler eşleşmiyor.')
    if (form.password.length < 8) return toast.error('Şifre en az 8 karakter olmalı.')
    setLoading(true)
    try {
      await register(form)
      toast.success('Hesap oluşturuldu! 3 günlük deneme başladı 🎉')
      navigate('/app', { replace: true })
    } catch (err) {
      const msg = err.response?.data
      if (typeof msg === 'object') {
        const first = Object.values(msg)[0]
        toast.error(Array.isArray(first) ? first[0] : String(first))
      } else toast.error('Kayıt başarısız.')
    } finally { setLoading(false) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.blob1} /><div className={styles.blob2} />
      <div className={styles.themeBtn}><ThemeToggle /></div>
      <div className={styles.wrap}>
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}><LogoSVG size={32} /></div>
          <div className={styles.brandName}>dusakademisi<span className={styles.com}>.com</span></div>
          <div className={styles.brandTag}>DUS · TUS · Yandal Hazırlık Platformu</div>
        </div>
        <div className={styles.loginCard}>
          <div className={styles.cardTitle}>Hesap Oluştur 🚀</div>
          <div className={styles.cardSub}>3 günlük ücretsiz deneme — kredi kartı gerekmez</div>
          <div style={{borderRadius:12,padding:'10px 14px',marginBottom:18,
            background:'linear-gradient(90deg,rgba(245,200,66,.15),rgba(245,160,20,.1))',
            border:'1px solid rgba(245,200,66,.25)',display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:18}}>🎁</span>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:'var(--t1)'}}>3 Gün Ücretsiz — Pro Paket</div>
              <div style={{fontSize:10,color:'var(--t3)'}}>AI kart üretimi dahil tüm özellikler açık</div>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
              <div>
                <label className={styles.inputLabel}>Ad</label>
                <input className={styles.inp} style={{paddingLeft:12}} placeholder="Adınız"
                  value={form.first_name} onChange={e => update('first_name',e.target.value)} required />
              </div>
              <div>
                <label className={styles.inputLabel}>Soyad</label>
                <input className={styles.inp} style={{paddingLeft:12}} placeholder="Soyadınız"
                  value={form.last_name} onChange={e => update('last_name',e.target.value)} required />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>E-posta</label>
              <div className={styles.inputWrap}>
                <svg className={styles.inputIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input className={styles.inp} type="email" placeholder="ornek@gmail.com"
                  value={form.email} onChange={e => update('email',e.target.value)} required />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Şifre (min. 8 karakter)</label>
              <div className={styles.inputWrap}>
                <svg className={styles.inputIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input className={styles.inp} type={showPw ? 'text' : 'password'}
                  placeholder="••••••••" minLength={8}
                  value={form.password} onChange={e => update('password',e.target.value)} required />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(p => !p)}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Şifre Tekrar</label>
              <div className={styles.inputWrap}>
                <svg className={styles.inputIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input className={styles.inp} type="password" placeholder="••••••••"
                  value={form.password2} onChange={e => update('password2',e.target.value)} required />
              </div>
            </div>
            <button type="submit" className={styles.loginBtn} disabled={loading}>
              {loading ? 'Hesap oluşturuluyor...' : 'Kayıt Ol & Denemeyi Başlat →'}
            </button>
          </form>
          <p style={{fontSize:10,color:'var(--t3)',textAlign:'center',marginTop:14,lineHeight:1.6}}>
            Kayıt olarak <span style={{color:'#00AADD'}}>Kullanım Koşulları</span>'nı kabul etmiş olursunuz.
          </p>
        </div>
        <div className={styles.registerLink}>
          Zaten hesabın var mı? <Link to="/login" className={styles.registerA}>Giriş Yap</Link>
        </div>
      </div>
    </div>
  )
}
