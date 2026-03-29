import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersAPI } from '../../api/client'
import { KpiCard, Badge, PageTopbar, FilterBar, Modal, ConfirmModal } from '../../components/shared'
import styles from '../../styles/shared.module.css'
import toast from 'react-hot-toast'

const MOCK_USERS = [
  { id:1, first_name:'Admin',  last_name:'Kullanıcı', email:'admin@ayttyt.com',    role:'admin',    subscription:'pro',      status:'active', date_joined:'2025-01-01', is_active:true,
    active_sub:{ plan:'pro', status:'active', ends_at:'2026-12-31', price_paid:'499', is_yearly:false } },
  { id:2, first_name:'Ahmet',  last_name:'Eğitmen',   email:'egitmen@ayttyt.com',  role:'trainer',  subscription:'pro',      status:'active', date_joined:'2025-01-15', is_active:true, commission_rate:20,
    active_sub:{ plan:'pro', status:'active', ends_at:'2026-12-31', price_paid:'0', is_yearly:false } },
  { id:3, first_name:'Ayşe',   last_name:'Destek',    email:'destek@ayttyt.com',   role:'support',  subscription:'pro',      status:'active', date_joined:'2025-02-01', is_active:true,
    active_sub:{ plan:'pro', status:'active', ends_at:'2026-12-31', price_paid:'0', is_yearly:false } },
  { id:4, first_name:'Mehmet', last_name:'Öğrenci',   email:'ogrenci@ayttyt.com',  role:'customer', subscription:'pro',      status:'active', date_joined:'2025-03-01', is_active:true,
    active_sub:{ plan:'pro', status:'active', ends_at:'2026-06-01', price_paid:'499', is_yearly:false } },
  { id:5, first_name:'Zeynep', last_name:'Yılmaz',    email:'zeynep@gmail.com',    role:'customer', subscription:'standart', status:'active', date_joined:'2025-03-10', is_active:true,
    active_sub:{ plan:'standart', status:'active', ends_at:'2026-04-10', price_paid:'449', is_yearly:false } },
  { id:6, first_name:'Ali',    last_name:'Kaya',      email:'ali@gmail.com',       role:'customer', subscription:'baslangic',status:'active', date_joined:'2025-03-20', is_active:true,
    active_sub:{ plan:'baslangic', status:'active', ends_at:'2026-04-20', price_paid:'149', is_yearly:false } },
  { id:7, first_name:'Fatma',  last_name:'Demir',     email:'fatma@gmail.com',     role:'customer', subscription:'trial',    status:'trial',  date_joined:'2026-03-25', is_active:true,
    active_sub:{ plan:'trial', status:'trial', ends_at:'2026-03-28', price_paid:'0', is_yearly:false } },
  { id:8, first_name:'Can',    last_name:'Çelik',     email:'can@gmail.com',       role:'customer', subscription:null,       status:'passive',date_joined:'2025-02-15', is_active:false,
    active_sub:null },
]

const STATUS_BADGE = { active:'green', trial:'yellow', passive:'gray', suspended:'red' }
const STATUS_LABEL = { active:'Aktif', trial:'Trial', passive:'Pasif', suspended:'Askıda' }
const ROLE_BADGE   = { customer:'blue', trainer:'purple', support:'yellow', admin:'red' }
const ROLE_LABEL   = { customer:'Müşteri', trainer:'Eğitmen', support:'Müş. Hiz.', admin:'Admin' }
const PLAN_LABEL   = { pro:'Pro', standart:'Standart', baslangic:'Başlangıç', trial:'Deneme' }
const PLAN_COLOR   = { pro:'#A78BFA', standart:'#00AADD', baslangic:'#10B981', trial:'#F5C842' }

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#00AADD,#0055AA)',
  'linear-gradient(135deg,#A78BFA,#7C3AED)',
  'linear-gradient(135deg,#10B981,#059669)',
  'linear-gradient(135deg,#F5C842,#D97706)',
  'linear-gradient(135deg,#E05070,#9D174D)',
]

function avatarGrad(id) { return AVATAR_GRADIENTS[(id || 0) % AVATAR_GRADIENTS.length] }
function initials(name = '') { return name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase() }

function fmtDate(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('tr-TR', { day:'2-digit', month:'2-digit', year:'numeric' })
}

function daysLeft(dt) {
  if (!dt) return null
  const diff = Math.ceil((new Date(dt) - Date.now()) / 86_400_000)
  return diff
}

function DaysLeftBadge({ endsAt }) {
  if (!endsAt) return <span style={{ color:'var(--t3)' }}>—</span>
  const d = daysLeft(endsAt)
  if (d < 0)  return <span style={{ color:'#E05070', fontWeight:700, fontSize:11 }}>Süresi Doldu</span>
  if (d === 0) return <span style={{ color:'#E05070', fontWeight:700, fontSize:11 }}>Bugün Bitiyor!</span>
  const color = d <= 3 ? '#E05070' : d <= 7 ? '#F5C842' : '#10B981'
  return (
    <span style={{ color, fontWeight:700, fontSize:11 }}>
      {fmtDate(endsAt)} <span style={{ opacity:.75 }}>({d} gün)</span>
    </span>
  )
}

// ── KULLANICI DETAY PANELİ ──────────────────────────────────
function UserDetailPanel({ user, onClose, onEdit, onSuspend, onReset, onGrant, isSuspendedFn }) {
  if (!user) return null
  const [grantHover, setGrantHover] = useState(false)
  const name     = user.full_name || `${user.first_name} ${user.last_name}`
  const suspended = isSuspendedFn(user)
  const sub      = user.active_sub

  const InfoRow = ({ label, value, valueStyle, valueNode }) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
      padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
      <span style={{ fontSize:11, color:'var(--t3)', fontWeight:600 }}>{label}</span>
      {valueNode
        ? valueNode
        : <span style={{ fontSize:11, fontWeight:700, color:'var(--t1)', ...valueStyle }}>{value ?? '—'}</span>
      }
    </div>
  )

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.4)',
        zIndex:200, cursor:'pointer' }} />

      {/* Drawer */}
      <div style={{ position:'fixed', top:0, right:0, height:'100vh', width:400, maxWidth:'95vw',
        background:'var(--card)', borderLeft:'1px solid var(--border)', zIndex:201,
        overflowY:'auto', display:'flex', flexDirection:'column' }}>

        {/* Header */}
        <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid var(--border)',
          display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div style={{ fontSize:14, fontWeight:800, color:'var(--t1)' }}>Kullanıcı Detayı</div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer',
            fontSize:20, color:'var(--t3)', lineHeight:1, padding:4 }}>✕</button>
        </div>

        <div style={{ padding:'20px 24px', flex:1 }}>

          {/* Avatar + isim */}
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:avatarGrad(user.id),
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:18, fontWeight:800, color:'white', flexShrink:0 }}>
              {initials(name)}
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:800, color:'var(--t1)', marginBottom:4 }}>{name}</div>
              <div style={{ fontSize:11, color:'var(--t3)' }}>{user.email}</div>
              <div style={{ display:'flex', gap:6, marginTop:6 }}>
                <Badge color={ROLE_BADGE[user.role] || 'gray'}>{ROLE_LABEL[user.role] || user.role}</Badge>
                <Badge color={suspended ? 'red' : STATUS_BADGE[user.status] || 'green'}>
                  {suspended ? 'Askıda' : STATUS_LABEL[user.status] || 'Aktif'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Hesap Bilgileri */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--t3)', letterSpacing:'.08em',
              textTransform:'uppercase', marginBottom:6 }}>Hesap Bilgileri</div>
            <InfoRow label="Kullanıcı ID" value={`#${user.id}`} />
            <InfoRow label="Rol" value={ROLE_LABEL[user.role] || user.role} />
            <InfoRow label="Üye Olma Tarihi"
              value={fmtDate(user.date_joined)} />
            <InfoRow label="Durum"
              value={suspended ? 'Askıda' : STATUS_LABEL[user.status] || 'Aktif'}
              valueStyle={{ color: suspended ? '#E05070' : '#10B981' }} />
            {user.commission_rate != null && (
              <InfoRow label="Komisyon Oranı" value={`%${user.commission_rate}`}
                valueStyle={{ color:'#A78BFA' }} />
            )}
            {user.branch && <InfoRow label="Branş" value={user.branch} />}
          </div>

          {/* Abonelik Bilgileri */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--t3)', letterSpacing:'.08em',
              textTransform:'uppercase', marginBottom:6 }}>Abonelik</div>

            {sub ? (
              <>
                {/* Plan kartı */}
                <div style={{ padding:'12px 14px', borderRadius:12, marginBottom:10,
                  background:`linear-gradient(135deg, ${PLAN_COLOR[sub.plan] || '#00AADD'}22, ${PLAN_COLOR[sub.plan] || '#00AADD'}08)`,
                  border:`1px solid ${PLAN_COLOR[sub.plan] || '#00AADD'}44` }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div>
                      <div style={{ fontSize:14, fontWeight:800, color: PLAN_COLOR[sub.plan] || '#00AADD' }}>
                        {PLAN_LABEL[sub.plan] || sub.plan} {sub.is_yearly ? '(Yıllık)' : '(Aylık)'}
                      </div>
                      <div style={{ fontSize:10, color:'var(--t3)', marginTop:2 }}>
                        {sub.status === 'trial' ? 'Deneme Süresi' : 'Aktif Paket'}
                        {sub.price_paid !== '0.00' && ` — ₺${sub.price_paid}`}
                      </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <Badge color={sub.status === 'trial' ? 'yellow' : 'green'}>
                        {sub.status === 'trial' ? 'Deneme' : 'Aktif'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <InfoRow label="Satın Alma Tarihi" value={fmtDate(sub.starts_at)} />
                <InfoRow label="Bitiş Tarihi"
                  valueNode={<DaysLeftBadge endsAt={sub.ends_at} />} />
                <InfoRow label="Otomatik Yenileme"
                  valueNode={
                    <span style={{
                      fontSize:11, fontWeight:700,
                      color: sub.auto_renew ? '#10B981' : '#E05070'
                    }}>
                      {sub.auto_renew ? '✓ Açık' : '✗ Kapalı'}
                    </span>
                  } />
              </>
            ) : (
              <div style={{ padding:'14px', borderRadius:12, textAlign:'center',
                background:'var(--input)', border:'1px dashed var(--border)', color:'var(--t3)',
                fontSize:11, fontWeight:600 }}>
                Aktif abonelik yok
              </div>
            )}
          </div>

          {/* Aktivite */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--t3)', letterSpacing:'.08em',
              textTransform:'uppercase', marginBottom:10 }}>Aktivite</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { icon:'🃏', label:'Kart',    value: user.card_count    ?? '—' },
                { icon:'📊', label:'Quiz',    value: user.quiz_count    ?? '—' },
                { icon:'❓', label:'Soru',    value: user.question_count ?? '—' },
                { icon:'⭐', label:'Puan',    value: user.avg_rating ? `${user.avg_rating}` : '—' },
              ].map(s => (
                <div key={s.label} style={{ padding:'10px 12px', borderRadius:10,
                  background:'var(--input)', border:'1px solid var(--border)',
                  display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:16 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:800, color:'var(--t1)' }}>{s.value}</div>
                    <div style={{ fontSize:9, color:'var(--t3)', fontWeight:600 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Aksiyon butonları */}
        <div style={{ padding:'16px 24px', borderTop:'1px solid var(--border)',
          display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
          <button className={`${styles.btn} ${styles.btnPrimary}`}
            style={{ justifyContent:'center' }} onClick={() => { onClose(); onEdit(user) }}>
            ✏️ Kullanıcıyı Düzenle
          </button>
          <button
            className={`${styles.btn}`}
            style={{ justifyContent:'center',
              background: grantHover ? 'rgba(16,185,129,.22)' : 'rgba(16,185,129,.12)',
              color:'#10B981', border:'1px solid rgba(16,185,129,.3)',
              transition:'background .15s' }}
            onMouseEnter={() => setGrantHover(true)}
            onMouseLeave={() => setGrantHover(false)}
            onClick={() => { onClose(); onGrant(user) }}>
            🎁 {grantHover ? 'Hediye Tanımla' : 'Ücretsiz Süre Ekle'}
          </button>
          <div style={{ display:'flex', gap:8 }}>
            <button className={`${styles.btn} ${styles.btnOutline}`}
              style={{ flex:1, justifyContent:'center' }} onClick={() => { onClose(); onReset(user) }}>
              ✉️ Şifre Sıfırla
            </button>
            <button
              className={`${styles.btn}`}
              style={{ flex:1, justifyContent:'center',
                background: suspended ? 'rgba(16,185,129,.12)' : 'rgba(224,80,112,.1)',
                color: suspended ? '#10B981' : '#FF8090',
                border: `1px solid ${suspended ? 'rgba(16,185,129,.3)' : 'rgba(224,80,112,.3)'}` }}
              onClick={() => { onClose(); onSuspend(user) }}>
              {suspended ? '🔓 Aktive Et' : '🔒 Askıya Al'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default function AdminUsers() {
  const qc = useQueryClient()
  const [search,      setSearch]      = useState('')
  const [roleF,       setRoleF]       = useState('')
  const [statusF,     setStatusF]     = useState('')
  const [viewUser,    setViewUser]    = useState(null)
  const [editUser,    setEditUser]    = useState(null)
  const [suspendUser, setSuspendUser] = useState(null)
  const [resetUser,   setResetUser]   = useState(null)
  const [grantUser,   setGrantUser]   = useState(null)
  const [addOpen,     setAddOpen]     = useState(false)
  const [form, setForm] = useState({ first_name:'', last_name:'', email:'', role:'customer' })
  const [grantForm, setGrantForm] = useState({ plan:'pro', days:7, customDays:'' })

  // ── DATA ──────────────────────────────────────────────────────
  const { data: apiData, isLoading, isError } = useQuery({
    queryKey: ['admin-users', search, roleF, statusF],
    queryFn: () => usersAPI.list({
      search:      search  || undefined,
      role:        roleF   || undefined,
      is_active:   statusF === 'active' ? true : statusF === 'suspended' ? false : undefined,
      subscription:statusF === 'trial'  ? 'trial' : undefined,
    }).then(r => r.data),
    retry: 1,
  })

  const usersData = (isError || !apiData) ? { results: MOCK_USERS, count: MOCK_USERS.length } : apiData
  const users  = usersData?.results ?? (Array.isArray(usersData) ? usersData : [])
  const total  = usersData?.count   ?? users.length
  const active = users.filter(u => u.is_active && !u.is_suspended).length
  const trial  = users.filter(u => u.subscription === 'trial' || u.active_sub?.status === 'trial').length

  // ── MUTATIONS ─────────────────────────────────────────────────
  const suspendMut = useMutation({
    mutationFn: (id) => usersAPI.suspend(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Kullanıcı askıya alındı.') },
    onError:   () => toast.error('Askıya alma başarısız.'),
  })

  const activateMut = useMutation({
    mutationFn: (id) => usersAPI.activate(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Kullanıcı aktive edildi.') },
    onError:   () => toast.error('Aktivasyon başarısız.'),
  })

  const resetMut = useMutation({
    mutationFn: (id) => usersAPI.resetPassword(id),
    onSuccess: () => toast.success('Şifre sıfırlama maili gönderildi.'),
    onError:   () => toast.error('Mail gönderilemedi.'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => usersAPI.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('Kullanıcı güncellendi.')
      setEditUser(null)
    },
    onError: () => toast.error('Güncelleme başarısız.'),
  })

  const grantMut = useMutation({
    mutationFn: ({ id, days, plan }) => usersAPI.grantFreePeriod(id, days, plan),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success(res.data?.message || 'Hediye tanımlandı.')
      setGrantUser(null)
    },
    onError: () => toast.error('Hediye tanımlanamadı.'),
  })

  const createMut = useMutation({
    mutationFn: (data) => usersAPI.create(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      const name = res.data?.full_name || form.first_name
      toast.success(`${name} eklendi. Aktivasyon maili gönderildi.`)
      setAddOpen(false)
      setForm({ first_name:'', last_name:'', email:'', role:'customer' })
    },
    onError: (err) => {
      const msg = err?.response?.data?.email?.[0]
             || err?.response?.data?.detail
             || 'Kullanıcı eklenemedi.'
      toast.error(msg)
    },
  })

  // ── HELPERS ───────────────────────────────────────────────────
  const isSuspended = (u) => {
    if (!u) return false
    return !!(u.is_suspended || u.status === 'suspended' || !u.is_active)
  }

  const openEdit = (u) => {
    setForm({
      first_name: u.first_name || '',
      last_name:  u.last_name  || '',
      email:      u.email      || '',
      role:       u.role       || 'customer',
    })
    setEditUser(u)
  }

  const handleUpdate = () => {
    if (!form.first_name.trim() || !form.email.trim())
      return toast.error('Ad ve e-posta zorunludur.')
    updateMut.mutate({ id: editUser.id, data: form })
  }

  // ── ACTIVE SUB HELPER ─────────────────────────────────────────
  const subLabel = (u) => {
    const sub = u.active_sub
    if (!sub) return <span style={{ color:'var(--t3)', fontSize:10 }}>Abonelik yok</span>
    const d = daysLeft(sub.ends_at)
    const color = d < 0 ? '#E05070' : d <= 3 ? '#F5C842' : PLAN_COLOR[sub.plan] || '#00AADD'
    return (
      <span style={{ fontSize:10, fontWeight:700, color }}>
        {PLAN_LABEL[sub.plan] || sub.plan}
        {d < 0 ? ' · Süresi Doldu' : d <= 7 ? ` · ${d}g kaldı` : ''}
      </span>
    )
  }

  return (
    <div>
      <PageTopbar title="Kullanıcı Yönetimi" subtitle="Tüm kayıtlı kullanıcıları yönet">
        <button className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => { setForm({ first_name:'', last_name:'', email:'', role:'customer' }); setAddOpen(true) }}>
          + Kullanıcı Ekle
        </button>
      </PageTopbar>

      <div className={`${styles.kpiRow} ${styles.c4}`}>
        <KpiCard icon="👥" value={total}  label="Toplam Kullanıcı" />
        <KpiCard icon="✅" value={active} label="Aktif" />
        <KpiCard icon="⏰" value={trial}  label="Deneme Süresi" />
        <KpiCard icon="📚" value={users.filter(u => u.role === 'trainer').length} label="Eğitmen" />
      </div>

      <div className={styles.card}>
        <FilterBar
          searchPlaceholder="İsim veya e-posta ara..."
          onSearch={setSearch}
          selects={[
            {
              options: [
                { value:'',         label:'Tüm Roller' },
                { value:'customer', label:'Müşteri' },
                { value:'trainer',  label:'Eğitmen' },
                { value:'support',  label:'Müş. Hiz.' },
              ],
              onChange: setRoleF,
            },
            {
              options: [
                { value:'',          label:'Tüm Durumlar' },
                { value:'active',    label:'Aktif' },
                { value:'trial',     label:'Trial' },
                { value:'suspended', label:'Askıda' },
              ],
              onChange: setStatusF,
            },
          ]}
        />

        <table className={styles.tbl}>
          <thead>
            <tr>
              <th>Kullanıcı</th><th>Rol</th><th>Paket</th><th>Kayıt</th><th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} style={{ textAlign:'center', padding:32, color:'var(--t3)' }}>Yükleniyor...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign:'center', padding:32, color:'var(--t3)' }}>Kullanıcı bulunamadı</td></tr>
            ) : users.map(u => (
              <tr key={u.id} style={{ cursor:'pointer' }}
                onClick={() => setViewUser(u)}>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:30, height:30, borderRadius:'50%', background:avatarGrad(u.id),
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:10, fontWeight:800, color:'white', flexShrink:0 }}>
                      {initials(u.full_name || `${u.first_name} ${u.last_name}`)}
                    </div>
                    <div>
                      <div className={styles.t1}>{u.full_name || `${u.first_name} ${u.last_name}`}</div>
                      <div style={{ fontSize:10, color:'var(--t3)' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td><Badge color={ROLE_BADGE[u.role] || 'gray'}>{ROLE_LABEL[u.role] || u.role}</Badge></td>
                <td>{subLabel(u)}</td>
                <td style={{ fontSize:10, color:'var(--t3)' }}>
                  {fmtDate(u.date_joined)}
                </td>
                <td onClick={e => e.stopPropagation()}>
                  <div className={styles.rowActions}>
                    <button className={styles.ra} title="Hediye Tanımla"
                      style={{ color:'#10B981' }}
                      onClick={() => {
                        setGrantForm({ plan: u.active_sub?.plan || 'pro', days:7, customDays:'' })
                        setGrantUser(u)
                      }}>🎁</button>
                    <button className={styles.ra} title="Düzenle"
                      onClick={() => openEdit(u)}>✏️</button>
                    <button className={styles.ra} title="Şifre Sıfırla"
                      onClick={() => setResetUser(u)}>✉️</button>
                    <button className={styles.ra}
                      title={isSuspended(u) ? 'Aktive Et' : 'Askıya Al'}
                      style={{ color: isSuspended(u) ? '#10B981' : undefined }}
                      onClick={() => setSuspendUser(u)}>
                      {isSuspended(u) ? '🔓' : '🔒'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── KULLANICI DETAY PANELI ── */}
      <UserDetailPanel
        user={viewUser}
        onClose={() => setViewUser(null)}
        onEdit={openEdit}
        onSuspend={setSuspendUser}
        onReset={setResetUser}
        onGrant={(u) => {
          setGrantForm({ plan: u.active_sub?.plan || 'pro', days:7, customDays:'' })
          setGrantUser(u)
        }}
        isSuspendedFn={isSuspended}
      />

      {/* ── HEDİYE TANIMLA MODAL ── */}
      <Modal open={!!grantUser} onClose={() => setGrantUser(null)} title="🎁 Hediye Tanımla" width={460}>
        {(() => {
          const PLANS = [
            { key:'pro',       label:'Pro',       price:'₺499/ay', icon:'✨', color:'#A78BFA', bg:'rgba(167,139,250,.12)', border:'rgba(167,139,250,.35)' },
            { key:'standart',  label:'Standart',  price:'₺449/ay', icon:'⭐', color:'#00AADD', bg:'rgba(0,170,221,.12)',   border:'rgba(0,170,221,.35)' },
            { key:'baslangic', label:'Başlangıç', price:'₺149/ay', icon:'🌱', color:'#10B981', bg:'rgba(16,185,129,.12)', border:'rgba(16,185,129,.35)' },
            { key:'trial',     label:'Deneme',    price:'Ücretsiz', icon:'🎯', color:'#F5C842', bg:'rgba(245,200,66,.12)', border:'rgba(245,200,66,.35)' },
          ]
          const selectedPlan = PLANS.find(p => p.key === grantForm.plan) || PLANS[0]
          const effectiveDays = grantForm.customDays !== ''
            ? Number(grantForm.customDays) : grantForm.days
          const isValid = effectiveDays >= 1 && effectiveDays <= 365

          return (
            <>
              {/* Kullanıcı bilgisi */}
              <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
                borderRadius:12, background:'var(--input)', border:'1px solid var(--border)', marginBottom:18 }}>
                <div style={{ width:36, height:36, borderRadius:'50%',
                  background: avatarGrad(grantUser?.id),
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:13, fontWeight:800, color:'white', flexShrink:0 }}>
                  {initials(grantUser?.full_name || grantUser?.email || '')}
                </div>
                <div>
                  <div style={{ fontSize:12, fontWeight:800, color:'var(--t1)' }}>
                    {grantUser?.full_name || grantUser?.email}
                  </div>
                  <div style={{ fontSize:10, color:'var(--t3)' }}>
                    {grantUser?.active_sub
                      ? `Mevcut paket: ${PLAN_LABEL[grantUser.active_sub.plan] || grantUser.active_sub.plan}`
                      : 'Aktif abonelik yok'}
                  </div>
                </div>
              </div>

              {/* Paket Seç */}
              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--t2)',
                  textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>
                  Hangi paketi hediye edelim?
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {PLANS.map(p => {
                    const active = grantForm.plan === p.key
                    return (
                      <button key={p.key}
                        onClick={() => setGrantForm(f => ({ ...f, plan: p.key }))}
                        style={{
                          padding:'12px 14px', borderRadius:12, cursor:'pointer',
                          border: `2px solid ${active ? p.border : 'var(--border)'}`,
                          background: active ? p.bg : 'var(--input)',
                          textAlign:'left', transition:'all .12s',
                          outline:'none',
                        }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                          <span style={{ fontSize:16 }}>{p.icon}</span>
                          <span style={{ fontSize:12, fontWeight:800,
                            color: active ? p.color : 'var(--t1)' }}>{p.label}</span>
                          {active && (
                            <span style={{ marginLeft:'auto', width:16, height:16, borderRadius:'50%',
                              background: p.color, display:'flex', alignItems:'center',
                              justifyContent:'center', fontSize:9, color:'white', fontWeight:900 }}>✓</span>
                          )}
                        </div>
                        <div style={{ fontSize:10, color: active ? p.color : 'var(--t3)',
                          fontWeight:600 }}>{p.price}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Süre Seç */}
              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--t2)',
                  textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>
                  Kaç gün hediye edelim?
                </div>
                <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                  {[3, 7, 14, 30, 90].map(d => {
                    const active = grantForm.customDays === '' && grantForm.days === d
                    return (
                      <button key={d}
                        onClick={() => setGrantForm(f => ({ ...f, days: d, customDays:'' }))}
                        style={{
                          flex:1, padding:'8px 4px', borderRadius:10, fontSize:11, fontWeight:700,
                          cursor:'pointer',
                          border:`1px solid ${active ? selectedPlan.border : 'var(--border)'}`,
                          background: active ? selectedPlan.bg : 'var(--input)',
                          color: active ? selectedPlan.color : 'var(--t2)',
                          transition:'all .12s',
                        }}>
                        {d}g
                      </button>
                    )
                  })}
                </div>
                <div style={{ position:'relative' }}>
                  <input
                    className={styles.formInput}
                    type="number" min={1} max={365}
                    value={grantForm.customDays}
                    onChange={e => setGrantForm(f => ({ ...f, customDays: e.target.value }))}
                    placeholder="Özel gün sayısı (1–365)"
                    style={{ paddingRight:42 }}
                  />
                  {grantForm.customDays !== '' && (
                    <button onClick={() => setGrantForm(f => ({ ...f, customDays:'' }))}
                      style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
                        background:'none', border:'none', cursor:'pointer', color:'var(--t3)', fontSize:14 }}>
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Özet */}
              {isValid && (
                <div style={{ padding:'12px 14px', borderRadius:12, marginBottom:16,
                  background: selectedPlan.bg, border:`1px solid ${selectedPlan.border}` }}>
                  <div style={{ fontSize:11, color:'var(--t2)', lineHeight:1.7 }}>
                    <span style={{ fontSize:14 }}>{selectedPlan.icon}</span>
                    {'  '}
                    <strong style={{ color: selectedPlan.color }}>
                      {grantUser?.full_name || grantUser?.email}
                    </strong>
                    {' '}adlı kullanıcıya{' '}
                    <strong style={{ color: selectedPlan.color }}>
                      {effectiveDays} gün {selectedPlan.label}
                    </strong>
                    {' '}paketi ücretsiz tanımlanacak.
                    {grantUser?.active_sub && grantUser.active_sub.plan !== grantForm.plan && (
                      <div style={{ marginTop:4, fontSize:10, color:'#F5C842' }}>
                        ⚠️ Mevcut {PLAN_LABEL[grantUser.active_sub.plan]} paketi iptal edilecek.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Butonlar */}
              <div style={{ display:'flex', gap:10 }}>
                <button className={`${styles.btn} ${styles.btnOutline}`} style={{ flex:1 }}
                  onClick={() => setGrantUser(null)}>İptal</button>
                <button
                  className={`${styles.btn}`}
                  style={{ flex:2, justifyContent:'center',
                    background: isValid ? selectedPlan.bg : 'var(--input)',
                    color: isValid ? selectedPlan.color : 'var(--t3)',
                    border:`1px solid ${isValid ? selectedPlan.border : 'var(--border)'}`,
                    transition:'all .12s' }}
                  onClick={() => grantMut.mutate({
                    id: grantUser.id,
                    days: effectiveDays,
                    plan: grantForm.plan,
                  })}
                  disabled={grantMut.isPending || !isValid}>
                  {grantMut.isPending
                    ? 'Tanımlanıyor...'
                    : `🎁 ${effectiveDays}g ${selectedPlan.label} Hediye Et`}
                </button>
              </div>
            </>
          )
        })()}
      </Modal>

      {/* ── EDIT MODAL ── */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Kullanıcıyı Düzenle" width={440}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Ad</label>
          <input className={styles.formInput} value={form.first_name}
            onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Soyad</label>
          <input className={styles.formInput} value={form.last_name}
            onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>E-posta *</label>
          <input className={styles.formInput} type="email" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Rol</label>
          <select className={styles.formInput} value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            <option value="customer">Müşteri</option>
            <option value="trainer">Eğitmen</option>
            <option value="support">Müş. Hizmetleri</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div style={{ display:'flex', gap:10, marginTop:4 }}>
          <button className={`${styles.btn} ${styles.btnOutline}`} style={{ flex:1 }}
            onClick={() => setEditUser(null)}>İptal</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ flex:1 }}
            onClick={handleUpdate} disabled={updateMut.isPending}>
            {updateMut.isPending ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </Modal>

      {/* ── YENİ KULLANICI EKLE MODAL ── */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Yeni Kullanıcı Ekle" width={440}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Ad *</label>
          <input className={styles.formInput} value={form.first_name}
            onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} placeholder="Ahmet" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Soyad</label>
          <input className={styles.formInput} value={form.last_name}
            onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} placeholder="Yılmaz" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>E-posta *</label>
          <input className={styles.formInput} type="email" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="kullanici@example.com" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Rol</label>
          <select className={styles.formInput} value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            <option value="customer">Müşteri</option>
            <option value="trainer">Eğitmen</option>
            <option value="support">Müş. Hizmetleri</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div style={{ padding:'10px 14px', background:'rgba(0,170,221,.08)',
          border:'1px solid rgba(0,170,221,.2)', borderRadius:10, fontSize:11,
          color:'var(--t2)', marginBottom:14, lineHeight:1.6 }}>
          💡 Kullanıcıya otomatik şifre belirleme e-postası gönderilecektir.
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className={`${styles.btn} ${styles.btnOutline}`} style={{ flex:1 }}
            onClick={() => setAddOpen(false)}>İptal</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ flex:1 }}
            disabled={createMut.isPending}
            onClick={() => {
              if (!form.first_name.trim() || !form.email.trim())
                return toast.error('Ad ve e-posta zorunludur.')
              createMut.mutate({
                first_name: form.first_name.trim(),
                last_name:  form.last_name.trim(),
                email:      form.email.trim(),
                role:       form.role,
              })
            }}>
            {createMut.isPending ? 'Ekleniyor...' : 'Ekle & Mail Gönder'}
          </button>
        </div>
      </Modal>

      {/* ── SUSPEND/ACTIVATE CONFIRM ── */}
      <ConfirmModal
        open={!!suspendUser}
        onClose={() => setSuspendUser(null)}
        onConfirm={() => isSuspended(suspendUser)
          ? activateMut.mutate(suspendUser.id)
          : suspendMut.mutate(suspendUser.id)
        }
        title={isSuspended(suspendUser) ? 'Kullanıcıyı Aktive Et' : 'Kullanıcıyı Askıya Al'}
        message={`${suspendUser?.full_name || suspendUser?.email} ${isSuspended(suspendUser) ? 'aktive edilecek' : 'askıya alınacak'}. Devam etmek istiyor musunuz?`}
        confirmLabel={isSuspended(suspendUser) ? 'Aktive Et' : 'Askıya Al'}
        danger={!isSuspended(suspendUser)}
      />

      {/* ── RESET PASSWORD CONFIRM ── */}
      <ConfirmModal
        open={!!resetUser}
        onClose={() => setResetUser(null)}
        onConfirm={() => resetMut.mutate(resetUser.id)}
        title="Şifre Sıfırlama Maili Gönder"
        message={`${resetUser?.email} adresine şifre sıfırlama maili gönderilecek.`}
        confirmLabel="Gönder"
      />
    </div>
  )
}
