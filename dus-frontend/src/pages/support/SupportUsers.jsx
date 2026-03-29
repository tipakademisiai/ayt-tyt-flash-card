import { useState } from 'react'
import { KpiCard, PageTopbar, Badge, FilterBar, Modal, ConfirmModal } from '../../components/shared'
import { usersAPI, subscriptionsAPI } from '../../api/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import styles from '../../styles/shared.module.css'
import toast from 'react-hot-toast'

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#00AADD,#0055AA)',
  'linear-gradient(135deg,#A78BFA,#7C3AED)',
  'linear-gradient(135deg,#10B981,#059669)',
  'linear-gradient(135deg,#E05070,#9D174D)',
  'linear-gradient(135deg,#F5C842,#D97706)',
]
function avatarGrad(id) { return AVATAR_GRADIENTS[(id || 0) % AVATAR_GRADIENTS.length] }
function initials(name = '') { return name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase() }

export default function SupportUsers() {
  const qc = useQueryClient()
  const [search,      setSearch]      = useState('')
  const [editUser,    setEditUser]    = useState(null)
  const [suspendUser, setSuspendUser] = useState(null)
  const [resetUser,   setResetUser]   = useState(null)
  const [subUser,     setSubUser]     = useState(null)
  const [editForm,    setEditForm]    = useState({ first_name:'', last_name:'', email:'' })
  const [subForm,     setSubForm]     = useState({ plan:'', expires_at:'' })

  const { data: usersData = {}, isLoading } = useQuery({
    queryKey: ['support-users', search],
    queryFn: () => usersAPI.list({ search: search || undefined }).then(r => r.data),
  })
  const users = usersData?.results ?? (Array.isArray(usersData) ? usersData : [])
  const total  = usersData?.count ?? users.length
  const active = users.filter(u => u.is_active).length

  const suspendMut = useMutation({
    mutationFn: (id) => usersAPI.suspend(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['support-users'] }); toast.success('Kullanıcı askıya alındı.') },
    onError: () => toast.error('İşlem başarısız.'),
  })
  const activateMut = useMutation({
    mutationFn: (id) => usersAPI.activate(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['support-users'] }); toast.success('Kullanıcı aktive edildi.') },
    onError: () => toast.error('İşlem başarısız.'),
  })
  const resetMut = useMutation({
    mutationFn: (id) => usersAPI.resetPassword(id),
    onSuccess: () => toast.success('Şifre sıfırlama maili gönderildi.'),
    onError: () => toast.error('Mail gönderilemedi.'),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => usersAPI.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['support-users'] })
      toast.success('Kullanıcı güncellendi.')
      setEditUser(null)
    },
    onError: () => toast.error('Güncelleme başarısız.'),
  })

  const openEdit = (u) => {
    setEditForm({ first_name: u.first_name || '', last_name: u.last_name || '', email: u.email || '' })
    setEditUser(u)
  }
  const isSuspended = (u) => u.is_suspended || !u.is_active

  return (
    <div>
      <PageTopbar title="Kullanıcı Yönetimi" subtitle="Tüm kullanıcılar">
      </PageTopbar>

      <div className={`${styles.kpiRow} ${styles.c3}`}>
        <KpiCard icon="👥" value={total}  label="Toplam Kullanıcı" />
        <KpiCard icon="✅" value={active} label="Aktif" />
        <KpiCard icon="⏸️" value={total - active} label="Pasif / Askıda" />
      </div>

      <div className={styles.card}>
        <FilterBar searchPlaceholder="İsim veya e-posta ara..." onSearch={setSearch} />
        <table className={styles.tbl}>
          <thead>
            <tr><th>Kullanıcı</th><th>Durum</th><th>Kayıt</th><th>Son Giriş</th><th></th></tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} style={{ textAlign:'center', padding:32, color:'var(--t3)' }}>Yükleniyor...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign:'center', padding:32, color:'var(--t3)' }}>Kullanıcı bulunamadı</td></tr>
            ) : users.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:30, height:30, borderRadius:'50%', background:avatarGrad(u.id),
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:10, fontWeight:800, color:'white' }}>
                      {initials(u.full_name || `${u.first_name} ${u.last_name}`)}
                    </div>
                    <div>
                      <div className={styles.t1}>{u.full_name || `${u.first_name} ${u.last_name}`}</div>
                      <div style={{ fontSize:10, color:'var(--t3)' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <Badge color={isSuspended(u) ? 'red' : 'green'}>
                    {isSuspended(u) ? 'Askıda' : 'Aktif'}
                  </Badge>
                </td>
                <td style={{ fontSize:10, color:'var(--t3)' }}>
                  {u.date_joined ? new Date(u.date_joined).toLocaleDateString('tr-TR') : '—'}
                </td>
                <td style={{ fontSize:10, color:'var(--t3)' }}>
                  {u.last_login ? new Date(u.last_login).toLocaleString('tr-TR') : '—'}
                </td>
                <td>
                  <div className={styles.rowActions}>
                    <button className={styles.ra} title="Düzenle" onClick={() => openEdit(u)}>✏️</button>
                    <button className={styles.ra} title="Şifre Sıfırla" onClick={() => setResetUser(u)}>🔑</button>
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

      {/* Edit Modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Kullanıcıyı Düzenle" width={420}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Ad</label>
          <input className={styles.formInput} value={editForm.first_name}
            onChange={e => setEditForm(f => ({ ...f, first_name: e.target.value }))} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Soyad</label>
          <input className={styles.formInput} value={editForm.last_name}
            onChange={e => setEditForm(f => ({ ...f, last_name: e.target.value }))} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>E-posta</label>
          <input className={styles.formInput} type="email" value={editForm.email}
            onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
        </div>
        <div style={{ display:'flex', gap:10, marginTop:4 }}>
          <button className={`${styles.btn} ${styles.btnOutline}`} style={{ flex:1 }}
            onClick={() => setEditUser(null)}>İptal</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ flex:1 }}
            onClick={() => updateMut.mutate({ id: editUser.id, data: editForm })}
            disabled={updateMut.isPending}>
            {updateMut.isPending ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </Modal>

      {/* Suspend Confirm */}
      <ConfirmModal
        open={!!suspendUser}
        onClose={() => setSuspendUser(null)}
        onConfirm={() => isSuspended(suspendUser)
          ? activateMut.mutate(suspendUser.id)
          : suspendMut.mutate(suspendUser.id)
        }
        title={isSuspended(suspendUser) ? 'Kullanıcıyı Aktive Et' : 'Kullanıcıyı Askıya Al'}
        message={`${suspendUser?.email} ${isSuspended(suspendUser) ? 'aktive edilecek' : 'askıya alınacak'}.`}
        confirmLabel={isSuspended(suspendUser) ? 'Aktive Et' : 'Askıya Al'}
        danger={!isSuspended(suspendUser)}
      />

      {/* Reset Password Confirm */}
      <ConfirmModal
        open={!!resetUser}
        onClose={() => setResetUser(null)}
        onConfirm={() => resetMut.mutate(resetUser.id)}
        title="Şifre Sıfırlama"
        message={`${resetUser?.email} adresine şifre sıfırlama maili gönderilecek.`}
        confirmLabel="Gönder"
      />
    </div>
  )
}
