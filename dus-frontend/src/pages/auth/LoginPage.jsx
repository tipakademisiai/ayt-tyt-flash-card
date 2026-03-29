import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ThemeToggle, LogoSVG } from '../../components/shared'
import toast from 'react-hot-toast'
import styles from './auth.module.css'

export default function LoginPage() {
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [showPw, setShowPw]           = useState(false)
  const [remember, setRemember]       = useState(false)
  const [loading, setLoading]         = useState(false)
  const [deviceKicked, setDeviceKicked] = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  // Cihaz çakışması nedeniyle yönlendirildiyse uyarı göster
  useEffect(() => {
    if (sessionStorage.getItem('logout_reason') === 'device_conflict') {
      setDeviceKicked(true)
      sessionStorage.removeItem('logout_reason')
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return toast.error('E-posta ve şifre gereklidir.')
    setLoading(true)
    try {
      const user = await login(email, password)
      toast.success(`Hoş geldin, ${user.first_name}!`)
      // Rol bazlı yönlendir
      const routes = { admin: '/admin', trainer: '/trainer', support: '/support', customer: '/app' }
      navigate(routes[user.role] || '/app', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Giriş başarısız.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.blob1} /><div className={styles.blob2} />
      <div className={styles.themeBtn}><ThemeToggle /></div>

      <div className={styles.wrap}>
        {/* Logo */}
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}><LogoSVG size={32} /></div>
          <div className={styles.brandName}>dusakademisi<span className={styles.com}>.com</span></div>
          <div className={styles.brandTag}>DUS · TUS · Yandal Hazırlık Platformu</div>
        </div>

        {/* Form */}
        <div className={styles.loginCard}>

          {/* Cihaz çakışması uyarısı */}
          {deviceKicked && (
            <div style={{
              padding: '12px 14px',
              borderRadius: 10,
              background: 'rgba(224,80,112,.12)',
              border: '1px solid rgba(224,80,112,.3)',
              marginBottom: 18,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🔒</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#FF8090', marginBottom: 2 }}>
                  Oturum sonlandırıldı
                </div>
                <div style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.5 }}>
                  Bu hesap başka bir cihazda oturum açtı. Devam etmek için tekrar giriş yapın.
                </div>
              </div>
            </div>
          )}

          <div className={styles.cardTitle}>Hoş geldin 👋</div>
          <div className={styles.cardSub}>Hesabına giriş yap</div>

          <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>E-posta</label>
              <div className={styles.inputWrap}>
                <svg className={styles.inputIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input className={styles.inp} type="email" placeholder="ornek@gmail.com"
                  value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                <label className={styles.inputLabel} style={{margin:0}}>Şifre</label>
                <Link to="/forgot-password" className={styles.forgotLink}>Şifremi unuttum</Link>
              </div>
              <div className={styles.inputWrap}>
                <svg className={styles.inputIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input className={styles.inp} type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(p => !p)}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className={styles.rememberRow} onClick={() => setRemember(r => !r)}>
              <div className={`${styles.checkbox} ${remember ? styles.checked : ''}`}>
                {remember && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}
              </div>
              <span className={styles.rememberText}>Beni hatırla</span>
            </div>

            <button type="submit" className={styles.loginBtn} disabled={loading}>
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap →'}
            </button>
          </form>

          <div className={styles.divider}>
            <div className={styles.divLine} /><span className={styles.divText}>veya</span><div className={styles.divLine} />
          </div>

          <div className={styles.ssoRow}>
            <button className={styles.ssoBtn} onClick={() => toast('Google SSO yakında!')}>
              <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google ile Giriş
            </button>
            <button className={styles.ssoBtn} onClick={() => toast('Apple SSO yakında!')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11"/></svg>
              Apple ile Giriş
            </button>
          </div>
        </div>

        <div className={styles.registerLink}>
          Hesabın yok mu? <Link to="/register" className={styles.registerA}>Kayıt Ol</Link>
        </div>
      </div>
    </div>
  )
}
