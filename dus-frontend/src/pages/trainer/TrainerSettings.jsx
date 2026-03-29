import { useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { PageTopbar } from '../../components/shared'
import { authAPI } from '../../api/client'
import { useMutation } from '@tanstack/react-query'
import styles from '../../styles/shared.module.css'
import toast from 'react-hot-toast'

function Toggle({ on, onToggle }) {
  return (
    <div onClick={onToggle} style={{ width:36, height:20, borderRadius:99, position:'relative',
      cursor:'pointer', background:on ? '#10B981' : 'rgba(255,255,255,.15)', transition:'background .2s', flexShrink:0 }}>
      <div style={{ width:14, height:14, borderRadius:'50%', background:'white', position:'absolute',
        top:3, left:on ? 19 : 3, transition:'left .2s' }}/>
    </div>
  )
}

export default function TrainerSettings() {
  const { user, logout, updateUser } = useAuth()
  const avatarRef = useRef()

  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name:  user?.last_name  || '',
    email:      user?.email      || '',
    bio:        user?.bio        || '',
    password:   '',
  })
  const [notifs, setNotifs] = useState({
    newQuestion:  true,
    email:        true,
    cardApproval: false,
    payment:      true,
  })

  const tog = (k) => setNotifs(n => ({ ...n, [k]: !n[k] }))

  // ── MUTATIONS ──────────────────────────────────────────────
  const saveMut = useMutation({
    mutationFn: (data) => authAPI.updateMe(data),
    onSuccess: (res) => {
      updateUser?.(res.data)
      toast.success('Ayarlar kaydedildi.')
    },
    onError: () => toast.error('Kaydetme başarısız.'),
  })

  const avatarMut = useMutation({
    mutationFn: (fd) => authAPI.updateMe(fd),
    onSuccess: (res) => {
      updateUser?.(res.data)
      toast.success('Fotoğraf güncellendi.')
    },
    onError: () => toast.error('Fotoğraf yükleme başarısız.'),
  })

  const handleSave = () => {
    const payload = {
      first_name: form.first_name,
      last_name:  form.last_name,
      email:      form.email,
    }
    if (form.bio)      payload.bio = form.bio
    if (form.password) payload.password = form.password
    saveMut.mutate(payload)
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('avatar', file)
    avatarMut.mutate(fd)
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div>
      <PageTopbar title="Profil & Ayarlar" subtitle="Hesap bilgileri ve tercihler">
        <button className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={handleSave} disabled={saveMut.isPending}>
          {saveMut.isPending ? 'Kaydediliyor...' : '💾 Kaydet'}
        </button>
      </PageTopbar>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        {/* Profile Card */}
        <div className={styles.card}>
          <div style={{ fontSize:13, fontWeight:800, color:'var(--t1)', marginBottom:16 }}>👤 Profil</div>
          <div style={{ textAlign:'center', marginBottom:18 }}>
            <div style={{ width:68, height:68, borderRadius:'50%',
              background:'linear-gradient(135deg,#10B981,#059669)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:20, fontWeight:800, color:'white', margin:'0 auto 10px' }}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <input ref={avatarRef} type="file" style={{ display:'none' }}
              accept="image/*" onChange={handleAvatarChange} />
            <button className={`${styles.btn} ${styles.btnOutline}`}
              style={{ fontSize:10, padding:'4px 10px' }}
              onClick={() => avatarRef.current.click()}>
              Fotoğraf Değiştir
            </button>
          </div>

          <div style={{ marginBottom:12 }}>
            <label className={styles.formLabel}>Ad</label>
            <input className={styles.formInput} value={form.first_name}
              onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
          </div>
          <div style={{ marginBottom:12 }}>
            <label className={styles.formLabel}>Soyad</label>
            <input className={styles.formInput} value={form.last_name}
              onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
          </div>
          <div style={{ marginBottom:12 }}>
            <label className={styles.formLabel}>E-posta</label>
            <input className={styles.formInput} type="email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className={styles.formLabel}>Biyografi</label>
            <textarea className={styles.formInput} rows={3} style={{ resize:'none' }}
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
          </div>
        </div>

        {/* Notifications & Security */}
        <div className={styles.card}>
          <div style={{ fontSize:13, fontWeight:800, color:'var(--t1)', marginBottom:16 }}>🔔 Bildirim Tercihleri</div>
          {[
            { key:'newQuestion',  label:'Yeni soru bildirimi',  sub:'Öğrenci soru sorduğunda bildir' },
            { key:'email',        label:'E-posta bildirimleri', sub:'Haftalık performans özeti' },
            { key:'cardApproval', label:'Kart onay bildirimi',  sub:'Admin kartı onayladığında bildir' },
            { key:'payment',      label:'Komisyon ödeme',       sub:'Ödeme yapıldığında bildir' },
          ].map(r => (
            <div key={r.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'11px 0', borderBottom:'1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--t1)' }}>{r.label}</div>
                <div style={{ fontSize:10, color:'var(--t3)' }}>{r.sub}</div>
              </div>
              <Toggle on={notifs[r.key]} onToggle={() => tog(r.key)} />
            </div>
          ))}

          <div style={{ marginTop:16 }}>
            <label className={styles.formLabel}>Yeni Şifre</label>
            <input className={styles.formInput} type="password"
              placeholder="Değiştirmek istemiyorsanız boş bırakın"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>

          <button className={`${styles.btn} ${styles.btnDanger}`}
            style={{ width:'100%', justifyContent:'center', marginTop:14 }}
            onClick={handleLogout}>
            🚪 Çıkış Yap
          </button>
        </div>
      </div>
    </div>
  )
}
