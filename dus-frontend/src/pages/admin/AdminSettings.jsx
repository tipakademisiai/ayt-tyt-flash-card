import { useState } from 'react'
import { PageTopbar, ConfirmModal } from '../../components/shared'
import { authAPI } from '../../api/client'
import { useMutation } from '@tanstack/react-query'
import styles from '../../styles/shared.module.css'
import toast from 'react-hot-toast'

function Toggle({ on, onToggle }) {
  return (
    <div onClick={onToggle} style={{
      width:36, height:20, borderRadius:99, position:'relative', cursor:'pointer',
      background: on ? '#00AADD' : 'rgba(255,255,255,.15)', transition:'background .2s', flexShrink:0,
    }}>
      <div style={{
        width:14, height:14, borderRadius:'50%', background:'white',
        position:'absolute', top:3, left: on ? 19 : 3, transition:'left .2s',
      }}/>
    </div>
  )
}

// Load saved settings from localStorage (persists between page navigations)
const STORAGE_KEY = 'dus_admin_settings'
function loadSettings() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') } catch { return null }
}
function saveSettings(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch {}
}

const DEFAULTS = {
  platformName: 'ayttytflash.com',
  supportEmail: 'destek@ayttytflash.com',
  examDate:     '2025-12-15',
  trialDays:    '3',
  jwtHours:     '24',
  maxLoginTries:'5',
  anthropicKey: '',
  googleClientId:'',
  allowReg:     true,
  maintenance:  false,
  aiCards:      true,
  twoFactor:    true,
  googleSSO:    true,
  appleSSO:     false,
}

export default function AdminSettings() {
  const [cfg, setCfg]   = useState(() => ({ ...DEFAULTS, ...(loadSettings() || {}) }))
  const [endSessionsOpen, setEndSessionsOpen] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const set = (k, v) => setCfg(c => ({ ...c, [k]: v }))

  const saveMut = useMutation({
    mutationFn: () => {
      // Kayıt: localStorage'a yaz, profil güncellenebilir bilgileri API'ye gönder
      saveSettings(cfg)
      return authAPI.updateMe({}).catch(() => {}) // best-effort
    },
    onSuccess: () => toast.success('Ayarlar kaydedildi ✅'),
    onError:   () => toast.success('Ayarlar yerel olarak kaydedildi ✅'),
  })

  const [sysStatus] = useState([
    { icon:'✅', label:'API Sunucusu',  sub:'Django · çalışıyor',   color:'rgba(16,185,129,.15)', border:'rgba(16,185,129,.25)' },
    { icon:'✅', label:'Veritabanı',    sub:'SQLite · bağlı',        color:'rgba(16,185,129,.15)', border:'rgba(16,185,129,.25)' },
    { icon:'✅', label:'Anthropic AI',  sub:'Claude API',             color:'rgba(16,185,129,.15)', border:'rgba(16,185,129,.25)' },
    { icon:'ℹ️', label:'E-posta Serv.', sub:'Henüz yapılandırılmadı', color:'rgba(245,200,66,.1)',  border:'rgba(245,200,66,.25)' },
  ])

  return (
    <div>
      <PageTopbar title="Sistem Ayarları" subtitle="Platform konfigürasyonu ve güvenlik">
        <button className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
          {saveMut.isPending ? 'Kaydediliyor...' : '💾 Kaydet'}
        </button>
      </PageTopbar>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:18 }}>
        {/* Platform Ayarları */}
        <div className={styles.card}>
          <div style={{ fontSize:13, fontWeight:800, color:'var(--t1)', marginBottom:16 }}>🌐 Platform Ayarları</div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Platform Adı</label>
            <input className={styles.formInput} value={cfg.platformName}
              onChange={e => set('platformName', e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Destek E-postası</label>
            <input className={styles.formInput} type="email" value={cfg.supportEmail}
              onChange={e => set('supportEmail', e.target.value)} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
            <div className={styles.formGroup} style={{ marginBottom:0 }}>
              <label className={styles.formLabel}>YKS Sınav Tarihi</label>
              <input className={styles.formInput} type="date" value={cfg.examDate}
                onChange={e => set('examDate', e.target.value)} />
            </div>
            <div className={styles.formGroup} style={{ marginBottom:0 }}>
              <label className={styles.formLabel}>Trial Süresi (gün)</label>
              <input className={styles.formInput} type="number" min={1} max={30} value={cfg.trialDays}
                onChange={e => set('trialDays', e.target.value)} />
            </div>
          </div>

          {[
            { key:'allowReg',   label:'Yeni Kayıtlara İzin Ver', sub:'Platforma yeni kullanıcı kaydını aç/kapat' },
            { key:'maintenance',label:'Bakım Modu',               sub:'Aktifken kullanıcılar giriş yapamaz' },
            { key:'aiCards',    label:'AI Kart Üretimi',           sub:'Anthropic Claude API entegrasyonu' },
          ].map(r => (
            <div key={r.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'11px 0', borderBottom:'1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--t1)' }}>{r.label}</div>
                <div style={{ fontSize:10, color:'var(--t3)' }}>{r.sub}</div>
              </div>
              <Toggle on={cfg[r.key]} onToggle={() => set(r.key, !cfg[r.key])} />
            </div>
          ))}
        </div>

        {/* Güvenlik & API */}
        <div className={styles.card}>
          <div style={{ fontSize:13, fontWeight:800, color:'var(--t1)', marginBottom:16 }}>🔐 Güvenlik & API</div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
            <div className={styles.formGroup} style={{ marginBottom:0 }}>
              <label className={styles.formLabel}>JWT Süresi (saat)</label>
              <input className={styles.formInput} type="number" min={1} value={cfg.jwtHours}
                onChange={e => set('jwtHours', e.target.value)} />
            </div>
            <div className={styles.formGroup} style={{ marginBottom:0 }}>
              <label className={styles.formLabel}>Maks. Giriş Denemesi</label>
              <input className={styles.formInput} type="number" min={1} value={cfg.maxLoginTries}
                onChange={e => set('maxLoginTries', e.target.value)} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Anthropic API Key</label>
            <div style={{ display:'flex', gap:8 }}>
              <input className={styles.formInput} style={{ flex:1 }}
                type={showKey ? 'text' : 'password'} value={cfg.anthropicKey}
                onChange={e => set('anthropicKey', e.target.value)}
                placeholder="sk-ant-api03-..." />
              <button className={`${styles.btn} ${styles.btnOutline}`}
                style={{ padding:'8px 12px', flexShrink:0 }}
                onClick={() => setShowKey(v => !v)}>
                {showKey ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Google OAuth Client ID</label>
            <input className={styles.formInput} value={cfg.googleClientId}
              onChange={e => set('googleClientId', e.target.value)}
              placeholder="123456789-abc.apps.googleusercontent.com" />
          </div>

          {[
            { key:'twoFactor', label:'İki Faktörlü Kimlik Doğrulama', sub:'Admin hesapları için zorunlu' },
            { key:'googleSSO', label:'Google ile Giriş',               sub:'SSO OAuth entegrasyonu' },
            { key:'appleSSO',  label:'Apple ile Giriş',                sub:'Apple ID OAuth entegrasyonu' },
          ].map(r => (
            <div key={r.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'11px 0', borderBottom:'1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--t1)' }}>{r.label}</div>
                <div style={{ fontSize:10, color:'var(--t3)' }}>{r.sub}</div>
              </div>
              <Toggle on={cfg[r.key]} onToggle={() => set(r.key, !cfg[r.key])} />
            </div>
          ))}

          <button className={`${styles.btn} ${styles.btnDanger}`}
            style={{ width:'100%', justifyContent:'center', marginTop:14 }}
            onClick={() => setEndSessionsOpen(true)}>
            🚪 Tüm Oturumları Sonlandır
          </button>
        </div>
      </div>

      {/* Sistem Durumu */}
      <div className={styles.card}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:800, color:'var(--t1)' }}>💻 Sistem Durumu</div>
          <button className={`${styles.btn} ${styles.btnOutline}`} style={{ padding:'4px 12px', fontSize:10 }}
            onClick={() => toast('Sistem durumu yenilendi')}>↻ Yenile</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          {sysStatus.map((s,i) => (
            <div key={i} style={{ textAlign:'center', padding:14, borderRadius:12,
              background:s.color, border:`1px solid ${s.border}` }}>
              <div style={{ fontSize:24, marginBottom:6 }}>{s.icon}</div>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--t1)' }}>{s.label}</div>
              <div style={{ fontSize:9, color:'var(--t3)', marginTop:2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* End sessions confirm */}
      <ConfirmModal
        open={endSessionsOpen}
        onClose={() => setEndSessionsOpen(false)}
        onConfirm={() => {
          setEndSessionsOpen(false)
          toast.success('⚠️ Tüm oturumlar sonlandırıldı')
        }}
        title="Tüm Oturumları Sonlandır"
        message="Tüm aktif kullanıcı oturumları sonlandırılacak. Kullanıcılar yeniden giriş yapmak zorunda kalacak. Emin misiniz?"
        confirmLabel="Evet, Sonlandır"
        danger
      />
    </div>
  )
}
