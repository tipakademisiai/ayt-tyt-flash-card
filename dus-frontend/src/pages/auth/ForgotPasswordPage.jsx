import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authAPI } from '../../api/client'
import { ThemeToggle, LogoSVG } from '../../components/shared'
import toast from 'react-hot-toast'
import styles from './auth.module.css'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return toast.error('E-posta adresi gereklidir.')
    setLoading(true)
    try {
      await authAPI.forgotPassword({ email })
      setSent(true)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Bir hata oluştu. Lütfen tekrar deneyin.')
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
          <div className={styles.brandName}>ayttytflash<span className={styles.com}>.com</span></div>
          <div className={styles.brandTag}>AYT · TYT · YKS Hazırlık Platformu</div>
        </div>

        {/* Form */}
        <div className={styles.loginCard}>
          {sent ? (
            /* Success state */
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📧</div>
              <div className={styles.cardTitle} style={{ fontSize: 18 }}>E-posta Gönderildi</div>
              <div className={styles.cardSub} style={{ marginTop: 8, marginBottom: 24 }}>
                Şifre sıfırlama talimatları <strong>{email}</strong> adresine gönderildi.
                Gelen kutunuzu kontrol edin.
              </div>
              <Link to="/login" className={styles.loginBtn} style={{
                display: 'block', textAlign: 'center', textDecoration: 'none',
                padding: '12px 0', borderRadius: 10, fontSize: 13,
              }}>
                ← Giriş Sayfasına Dön
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <div className={styles.cardTitle}>Şifremi Unuttum</div>
              <div className={styles.cardSub}>
                E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.
              </div>

              <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>E-posta</label>
                  <div className={styles.inputWrap}>
                    <svg className={styles.inputIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <input
                      className={styles.inp}
                      type="email"
                      placeholder="ornek@gmail.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className={styles.loginBtn} disabled={loading}>
                  {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder →'}
                </button>
              </form>
            </>
          )}
        </div>

        <div className={styles.registerLink}>
          <Link to="/login" className={styles.registerA}>← Geri dön</Link>
        </div>
      </div>
    </div>
  )
}
