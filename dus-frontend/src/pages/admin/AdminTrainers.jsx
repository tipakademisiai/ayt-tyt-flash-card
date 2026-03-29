import { useState } from 'react'
import { PageTopbar, KpiCard, Badge, Modal, ConfirmModal } from '../../components/shared'
import { usersAPI } from '../../api/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import styles from '../../styles/shared.module.css'
import toast from 'react-hot-toast'

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#10B981,#059669)',
  'linear-gradient(135deg,#A78BFA,#7C3AED)',
  'linear-gradient(135deg,#F5C842,#D97706)',
  'linear-gradient(135deg,#E05070,#9D174D)',
  'linear-gradient(135deg,#00AADD,#0055AA)',
]
function avatarGrad(id) { return AVATAR_GRADIENTS[(id || 0) % AVATAR_GRADIENTS.length] }
function initials(name = '') { return name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase() }

export default function AdminTrainers() {
  const qc = useQueryClient()

  const [search, setSearch]         = useState('')
  const [editTrainer,  setEditTrainer]  = useState(null)
  const [commTrainer,  setCommTrainer]  = useState(null)
  const [inviteOpen,   setInviteOpen]   = useState(false)
  const [deleteTrainer, setDeleteTrainer] = useState(null)
  const [editForm,     setEditForm]     = useState({ first_name:'', last_name:'', email:'', branch:'', bio:'' })
  const [commForm,     setCommForm]     = useState({ commission_rate:'' })
  const [inviteForm,   setInviteForm]   = useState({ email:'', first_name:'', last_name:'' })

  // ── DATA ──────────────────────────────────────────────────────
  const { data: rawTrainers = [], isLoading } = useQuery({
    queryKey: ['admin-trainers'],
    queryFn: () => usersAPI.trainers().then(r => r.data?.results ?? r.data),
  })

  const trainers = rawTrainers.filter(t => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (t.full_name || '').toLowerCase().includes(q) ||
      (t.email     || '').toLowerCase().includes(q) ||
      (t.branch    || '').toLowerCase().includes(q)
    )
  })

  // ── MUTATIONS ─────────────────────────────────────────────────
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => usersAPI.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-trainers'] })
      toast.success('Eğitmen güncellendi.')
      setEditTrainer(null)
    },
    onError: () => toast.error('Güncelleme başarısız.'),
  })

  const commMut = useMutation({
    mutationFn: ({ id, data }) => usersAPI.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-trainers'] })
      toast.success('Komisyon oranı güncellendi.')
      setCommTrainer(null)
    },
    onError: () => toast.error('Güncelleme başarısız.'),
  })

  const suspendMut = useMutation({
    mutationFn: (id) => usersAPI.suspend(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-trainers'] })
      toast.success('Eğitmen askıya alındı.')
      setDeleteTrainer(null)
    },
    onError: () => toast.error('İşlem başarısız.'),
  })

  const inviteMut = useMutation({
    mutationFn: (data) => usersAPI.update('invite', data),
    onSuccess: () => {
      toast.success('Davet e-postası gönderildi.')
      setInviteOpen(false)
      setInviteForm({ email:'', first_name:'', last_name:'' })
    },
    onError: () => toast.error('Davet gönderilemedi.'),
  })

  // ── HANDLERS ──────────────────────────────────────────────────
  const openEdit = (t) => {
    setEditForm({
      first_name: t.first_name || '',
      last_name:  t.last_name  || '',
      email:      t.email      || '',
      branch:     t.branch     || '',
      bio:        t.bio        || '',
    })
    setEditTrainer(t)
  }

  const openComm = (t) => {
    setCommForm({ commission_rate: t.commission_rate ?? '20' })
    setCommTrainer(t)
  }

  return (
    <div>
      <PageTopbar title="Eğitmen Yönetimi" subtitle="Eğitmenleri, branşlarını ve performanslarını yönet">
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setInviteOpen(true)}>
          + Eğitmen Davet Et
        </button>
      </PageTopbar>

      <div className={`${styles.kpiRow} ${styles.c3}`}>
        <KpiCard icon="🎓" value={rawTrainers.length}                                      label="Aktif Eğitmen" />
        <KpiCard icon="🃏" value={rawTrainers.reduce((s,t) => s+(t.card_count||0), 0)}     label="Toplam Kart" />
        <KpiCard icon="⭐" value="4.6"                                                      label="Ort. Değerlendirme" />
      </div>

      {/* Search */}
      <div style={{ marginBottom:14 }}>
        <input className={styles.formInput}
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Ad, e-posta veya branş ara..."
          style={{ maxWidth:360 }} />
      </div>

      <div className={styles.card} style={{ padding:0, overflow:'hidden' }}>
        <table className={styles.tbl}>
          <thead>
            <tr>
              <th>Eğitmen</th><th>Branş</th><th>Kart</th><th>Quiz</th>
              <th>Bekleyen</th><th>Puan</th><th>Komisyon</th><th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} style={{ textAlign:'center', padding:32, color:'var(--t3)' }}>Yükleniyor...</td></tr>
            ) : trainers.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign:'center', padding:32, color:'var(--t3)' }}>
                {search ? 'Eşleşen eğitmen bulunamadı' : 'Henüz eğitmen yok'}
              </td></tr>
            ) : trainers.map(t => (
              <tr key={t.id}>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:30, height:30, borderRadius:'50%', background:avatarGrad(t.id),
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:10, fontWeight:800, color:'white', flexShrink:0 }}>
                      {initials(t.full_name || `${t.first_name} ${t.last_name}`)}
                    </div>
                    <div>
                      <div className={styles.t1}>{t.full_name || `${t.first_name} ${t.last_name}`}</div>
                      <div style={{ fontSize:10, color:'var(--t3)' }}>{t.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  {t.branch
                    ? <Badge color="red">{t.branch}</Badge>
                    : <span style={{ color:'var(--t3)', fontSize:11 }}>—</span>}
                </td>
                <td className={styles.t1}>{t.card_count ?? '—'}</td>
                <td className={styles.t1}>{t.quiz_count ?? '—'}</td>
                <td>
                  {t.pending_questions != null ? (
                    <Badge color={t.pending_questions > 15 ? 'red' : t.pending_questions > 5 ? 'yellow' : 'green'}>
                      {t.pending_questions}
                    </Badge>
                  ) : <span style={{ color:'var(--t3)', fontSize:11 }}>—</span>}
                </td>
                <td style={{ fontSize:11, color:'var(--t2)' }}>
                  {t.avg_rating ? `⭐ ${t.avg_rating}` : '—'}
                </td>
                <td className={styles.t1}>
                  {t.commission_rate != null ? `%${t.commission_rate}` : '%20'}
                </td>
                <td>
                  <div className={styles.rowActions}>
                    <button className={styles.ra} title="Profil Düzenle"    onClick={() => openEdit(t)}>✏️</button>
                    <button className={styles.ra} title="Komisyon Güncelle" onClick={() => openComm(t)}>💰</button>
                    <button className={styles.ra} title="Askıya Al" style={{ color:'#FF8090' }}
                      onClick={() => setDeleteTrainer(t)}>🚫</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── INVITE MODAL ── */}
      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Eğitmen Davet Et" width={440}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Ad</label>
          <input className={styles.formInput} value={inviteForm.first_name}
            onChange={e => setInviteForm(f=>({...f, first_name:e.target.value}))} placeholder="Ad" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Soyad</label>
          <input className={styles.formInput} value={inviteForm.last_name}
            onChange={e => setInviteForm(f=>({...f, last_name:e.target.value}))} placeholder="Soyad" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>E-posta *</label>
          <input className={styles.formInput} type="email" value={inviteForm.email}
            onChange={e => setInviteForm(f=>({...f, email:e.target.value}))}
            placeholder="eğitmen@example.com" />
        </div>
        <div style={{ display:'flex', gap:10, marginTop:4 }}>
          <button className={`${styles.btn} ${styles.btnOutline}`} style={{ flex:1 }}
            onClick={() => setInviteOpen(false)}>İptal</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ flex:1 }}
            onClick={() => {
              if (!inviteForm.email.trim()) return toast.error('E-posta zorunludur.')
              inviteMut.mutate({ ...inviteForm, role:'trainer' })
            }}
            disabled={inviteMut.isPending}>
            {inviteMut.isPending ? 'Gönderiliyor...' : 'Davet Gönder'}
          </button>
        </div>
      </Modal>

      {/* ── EDIT TRAINER MODAL ── */}
      <Modal open={!!editTrainer} onClose={() => setEditTrainer(null)} title="Eğitmen Düzenle" width={440}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
          <div className={styles.formGroup} style={{ marginBottom:0 }}>
            <label className={styles.formLabel}>Ad</label>
            <input className={styles.formInput} value={editForm.first_name}
              onChange={e => setEditForm(f=>({...f, first_name:e.target.value}))} />
          </div>
          <div className={styles.formGroup} style={{ marginBottom:0 }}>
            <label className={styles.formLabel}>Soyad</label>
            <input className={styles.formInput} value={editForm.last_name}
              onChange={e => setEditForm(f=>({...f, last_name:e.target.value}))} />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>E-posta</label>
          <input className={styles.formInput} type="email" value={editForm.email}
            onChange={e => setEditForm(f=>({...f, email:e.target.value}))} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Branş / Uzmanlık</label>
          <input className={styles.formInput} value={editForm.branch}
            onChange={e => setEditForm(f=>({...f, branch:e.target.value}))}
            placeholder="Ör: Periodontoloji, Endodonti..." />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Biyografi</label>
          <textarea className={styles.formInput} rows={3} value={editForm.bio}
            onChange={e => setEditForm(f=>({...f, bio:e.target.value}))}
            placeholder="Eğitmen hakkında kısa açıklama..." />
        </div>
        <div style={{ display:'flex', gap:10, marginTop:4 }}>
          <button className={`${styles.btn} ${styles.btnOutline}`} style={{ flex:1 }}
            onClick={() => setEditTrainer(null)}>İptal</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ flex:1 }}
            onClick={() => updateMut.mutate({ id:editTrainer.id, data:editForm })}
            disabled={updateMut.isPending}>
            {updateMut.isPending ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </Modal>

      {/* ── COMMISSION MODAL ── */}
      <Modal open={!!commTrainer} onClose={() => setCommTrainer(null)} title="Komisyon Güncelle" width={360}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16,
          padding:'10px 14px', background:'var(--input)', borderRadius:10 }}>
          <div style={{ width:32, height:32, borderRadius:'50%',
            background: commTrainer ? avatarGrad(commTrainer.id) : '#ccc',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:11, fontWeight:800, color:'white' }}>
            {commTrainer ? initials(commTrainer.full_name || '') : ''}
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--t1)' }}>
              {commTrainer?.full_name}
            </div>
            <div style={{ fontSize:10, color:'var(--t3)' }}>Mevcut oran: %{commTrainer?.commission_rate ?? 20}</div>
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Yeni Komisyon Oranı (%)</label>
          <input className={styles.formInput} type="number" min={0} max={100}
            value={commForm.commission_rate}
            onChange={e => setCommForm({ commission_rate: e.target.value })}
            placeholder="Örn: 20" />
        </div>
        <div style={{ display:'flex', gap:10, marginTop:4 }}>
          <button className={`${styles.btn} ${styles.btnOutline}`} style={{ flex:1 }}
            onClick={() => setCommTrainer(null)}>İptal</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ flex:1 }}
            onClick={() => commMut.mutate({ id:commTrainer.id, data:{ commission_rate: Number(commForm.commission_rate) } })}
            disabled={commMut.isPending}>
            {commMut.isPending ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </Modal>

      {/* ── SUSPEND CONFIRM ── */}
      <ConfirmModal
        open={!!deleteTrainer}
        onClose={() => setDeleteTrainer(null)}
        onConfirm={() => suspendMut.mutate(deleteTrainer.id)}
        title="Eğitmeni Askıya Al"
        message={`${deleteTrainer?.full_name} hesabı askıya alınacak. Eğitmen platforma erişemez hale gelecek. Onaylıyor musunuz?`}
        confirmLabel="Askıya Al"
        danger
      />
    </div>
  )
}
