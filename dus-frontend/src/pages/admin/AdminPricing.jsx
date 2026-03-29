import { useState } from 'react'
import { PageTopbar, Modal, ConfirmModal, KpiCard } from '../../components/shared'
import { usersAPI, subscriptionsAPI } from '../../api/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import styles from '../../styles/shared.module.css'
import toast from 'react-hot-toast'

// ── Statik paket tanımları (DB'ye taşınana kadar) ──────────────────────────
const INITIAL_PACKAGES = [
  { id:1, name:'Başlangıç', monthly:149, yearly:1290, color:'#10B981',
    features:['Tüm bölümler','SRS kartlar','Quiz modu','Eğitmene soru sor'] },
  { id:2, name:'Standart',  monthly:449, yearly:3990, color:'#00AADD',
    features:['Başlangıç + AI günlük plan','Gelişmiş analitik'] },
  { id:3, name:'Pro',       monthly:499, yearly:4490, color:'#A78BFA',
    features:['Standart + AI kart üretimi','Bilgi kartları','Öncelikli destek'] },
]

const PAYMENTS = [
  { user:'Zeynep Şahin', plan:'Başlangıç', amount:'₺149', method:'Kredi Kartı', date:'28 Mar', status:'Başarılı', sc:'#10B981' },
  { user:'Mehmet Kılıç', plan:'Pro',       amount:'₺499', method:'Havale',      date:'27 Mar', status:'Bekliyor',  sc:'#F5C842' },
  { user:'Hakan Çelik',  plan:'Başlangıç', amount:'₺149', method:'Kredi Kartı', date:'25 Mar', status:'Başarılı', sc:'#10B981' },
  { user:'Selin Erdoğan',plan:'Pro',       amount:'₺499', method:'Kredi Kartı', date:'20 Mar', status:'İade',      sc:'#E05070' },
]

function PackageModal({ pkg, onClose, onSave }) {
  const [form, setForm] = useState(pkg
    ? { name: pkg.name, monthly: pkg.monthly, yearly: pkg.yearly, features: (pkg.features||[]).join('\n') }
    : { name:'', monthly:'', yearly:'', features:'' }
  )

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:100,
      display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={e => { if (e.target===e.currentTarget) onClose() }}>
      <div style={{ background:'var(--card)', border:'1px solid var(--border)',
        borderRadius:20, padding:28, width:460, maxWidth:'95vw' }}>
        <div style={{ fontSize:15, fontWeight:800, color:'var(--t1)', marginBottom:20 }}>
          {pkg ? 'Paketi Düzenle' : 'Yeni Paket Oluştur'}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Paket Adı *</label>
          <input className={styles.formInput} value={form.name}
            onChange={e => setForm(f=>({...f, name:e.target.value}))} placeholder="Pro" />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
          <div className={styles.formGroup} style={{ marginBottom:0 }}>
            <label className={styles.formLabel}>Aylık Fiyat (₺) *</label>
            <input className={styles.formInput} type="number" value={form.monthly}
              onChange={e => setForm(f=>({...f, monthly:Number(e.target.value)}))} placeholder="499" />
          </div>
          <div className={styles.formGroup} style={{ marginBottom:0 }}>
            <label className={styles.formLabel}>Yıllık Fiyat (₺)</label>
            <input className={styles.formInput} type="number" value={form.yearly}
              onChange={e => setForm(f=>({...f, yearly:Number(e.target.value)}))} placeholder="4490" />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Özellikler (her satır bir özellik)</label>
          <textarea className={styles.formInput} rows={4} value={form.features}
            onChange={e => setForm(f=>({...f, features:e.target.value}))}
            placeholder="SRS kartlar&#10;Quiz modu&#10;AI kart üretimi" />
        </div>

        <div style={{ display:'flex', gap:10, marginTop:20 }}>
          <button className={`${styles.btn} ${styles.btnOutline}`} style={{ flex:1 }} onClick={onClose}>İptal</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ flex:1 }}
            onClick={() => {
              if (!form.name || !form.monthly) return toast.error('Paket adı ve aylık fiyat zorunludur.')
              onSave({ ...form, features: form.features.split('\n').filter(Boolean) })
            }}>
            {pkg ? 'Güncelle' : 'Oluştur'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Komisyon Ekle Modal ──────────────────────────────────────
function CommissionAddModal({ trainers, onClose, onSave, isPending }) {
  const [trainerId, setTrainerId] = useState('')
  const [rate,      setRate]      = useState('20')

  const handleSave = () => {
    if (!trainerId) return toast.error('Eğitmen seçiniz.')
    if (!rate || isNaN(Number(rate))) return toast.error('Geçerli bir oran giriniz.')
    onSave({ id: Number(trainerId), rate: Number(rate) })
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:100,
      display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={e => { if (e.target===e.currentTarget) onClose() }}>
      <div style={{ background:'var(--card)', border:'1px solid var(--border)',
        borderRadius:20, padding:28, width:400, maxWidth:'95vw' }}>
        <div style={{ fontSize:15, fontWeight:800, color:'var(--t1)', marginBottom:20 }}>
          💰 Komisyon Oranı Ekle
        </div>

        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:11, fontWeight:700, color:'var(--t3)',
            letterSpacing:'.06em', textTransform:'uppercase', display:'block', marginBottom:6 }}>
            Eğitmen *
          </label>
          <select style={{ width:'100%', padding:'9px 12px', borderRadius:10,
            background:'var(--input)', border:'1px solid var(--inputborder)',
            color:'var(--t1)', fontFamily:'Montserrat', fontSize:12, fontWeight:600 }}
            value={trainerId} onChange={e => setTrainerId(e.target.value)}>
            <option value="">— Eğitmen Seç —</option>
            {trainers.map(t => (
              <option key={t.id} value={t.id}>
                {t.full_name || `${t.first_name} ${t.last_name}`} ({t.email})
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:11, fontWeight:700, color:'var(--t3)',
            letterSpacing:'.06em', textTransform:'uppercase', display:'block', marginBottom:6 }}>
            Komisyon Oranı (%) *
          </label>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <input type="number" min={0} max={100} value={rate}
              onChange={e => setRate(e.target.value)}
              style={{ width:80, padding:'9px 12px', borderRadius:10,
                background:'var(--input)', border:'1px solid var(--inputborder)',
                color:'var(--t1)', fontFamily:'Montserrat', fontSize:13, fontWeight:700 }} />
            <span style={{ fontSize:13, fontWeight:700, color:'var(--t2)' }}>%</span>
            <span style={{ fontSize:11, color:'var(--t3)' }}>varsayılan: %20</span>
          </div>
        </div>

        <div style={{ display:'flex', gap:10 }}>
          <button style={{ flex:1, padding:'10px 14px', borderRadius:10, cursor:'pointer',
            border:'1px solid var(--border)', background:'var(--input)', color:'var(--t2)',
            fontFamily:'Montserrat', fontSize:12, fontWeight:700 }}
            onClick={onClose}>İptal</button>
          <button style={{ flex:1, padding:'10px 14px', borderRadius:10, cursor:'pointer',
            border:'none', background:'linear-gradient(135deg,#0088BB,#00AADD)', color:'white',
            fontFamily:'Montserrat', fontSize:12, fontWeight:700 }}
            onClick={handleSave} disabled={isPending}>
            {isPending ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPricing() {
  const qc = useQueryClient()
  const [packages, setPackages]   = useState(INITIAL_PACKAGES)
  const [editPkg, setEditPkg]     = useState(null)   // null = closed, pkg obj = edit, 'new' = create
  const [deletePkg, setDeletePkg] = useState(null)
  const [commAddOpen, setCommAddOpen] = useState(false)

  // ── Real trainers for commission ──────────────────────────────
  const { data: trainers = [] } = useQuery({
    queryKey: ['admin-trainers'],
    queryFn: () => usersAPI.trainers().then(r => r.data?.results ?? r.data),
  })

  // ── Real subscription counts ──────────────────────────────────
  const { data: subStats } = useQuery({
    queryKey: ['sub-stats'],
    queryFn: () => subscriptionsAPI.list({ status:'active' }).then(r => {
      const subs = r.data?.results ?? r.data ?? []
      const counts = { pro:0, standart:0, baslangic:0 }
      subs.forEach(s => { if (counts[s.plan] != null) counts[s.plan]++ })
      return counts
    }),
  })

  const commMut = useMutation({
    mutationFn: ({ id, rate }) => usersAPI.update(id, { commission_rate: Number(rate) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-trainers'] }); toast.success('Komisyon oranı güncellendi.') },
    onError:   () => toast.error('Güncelleme başarısız.'),
  })

  const commAddMut = useMutation({
    mutationFn: ({ id, rate }) => usersAPI.update(id, { commission_rate: Number(rate) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-trainers'] })
      toast.success('Komisyon oranı eklendi.')
      setCommAddOpen(false)
    },
    onError: () => toast.error('Güncelleme başarısız.'),
  })

  const [localRates, setLocalRates] = useState({})
  const getRate = (t) => localRates[t.id] !== undefined ? localRates[t.id] : (t.commission_rate ?? 20)
  const setRate = (id, val) => setLocalRates(r => ({ ...r, [id]: val }))

  const handleSavePkg = (saved) => {
    if (editPkg === 'new') {
      setPackages(p => [...p, { ...saved, id: Date.now() }])
      toast.success('Paket oluşturuldu.')
    } else {
      setPackages(p => p.map(pkg => pkg.id === editPkg.id ? { ...pkg, ...saved } : pkg))
      toast.success('Paket güncellendi.')
    }
    setEditPkg(null)
  }

  const totalRevenue = packages.reduce((s, pkg) => {
    const active = subStats?.[pkg.name.toLowerCase().replace('dus ','').replace(' ','').replace('ç','c')] ?? 0
    return s + active * pkg.monthly
  }, 0)

  return (
    <div>
      <PageTopbar title="Ücret & Komisyon" subtitle="Fiyatlandırma, paketler ve eğitmen komisyonları">
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => toast.success('Değişiklikler kaydedildi ✅')}>
          💾 Kaydet
        </button>
      </PageTopbar>

      {/* KPI */}
      <div className={`${styles.kpiRow} ${styles.c3}`} style={{ marginBottom:16 }}>
        <KpiCard icon="📦" value={packages.length} label="Aktif Paket" />
        <KpiCard icon="💰" value={`₺${totalRevenue.toLocaleString('tr-TR')}`} label="Tahmini Aylık Gelir" />
        <KpiCard icon="🎓" value={trainers.length} label="Komisyon Alan Eğitmen" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:20 }}>
        {/* Paketler */}
        <div className={styles.card}>
          <div style={{ fontSize:13, fontWeight:800, color:'var(--t1)', marginBottom:16 }}>📦 Abonelik Paketleri</div>
          <table className={styles.tbl}>
            <thead>
              <tr><th>Paket</th><th>Aylık</th><th>Yıllık</th><th>Aktif</th><th></th></tr>
            </thead>
            <tbody>
              {packages.map(pkg => (
                <tr key={pkg.id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background: pkg.color, flexShrink:0 }} />
                      <span style={{ fontWeight:700, fontSize:12, color:'var(--t1)' }}>{pkg.name}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight:700, color:'var(--t1)' }}>₺{pkg.monthly}</td>
                  <td style={{ color:'var(--t2)' }}>₺{pkg.yearly}</td>
                  <td style={{ color:'#10B981', fontWeight:700 }}>
                    {subStats ? (subStats[pkg.name.toLowerCase().replace('dus ','').replace(' ','').replace('ç','c')] ?? '—') : '—'}
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button className={styles.ra} title="Düzenle" onClick={() => setEditPkg(pkg)}>✏️</button>
                      <button className={styles.ra} title="Sil" style={{ color:'#FF8090' }}
                        onClick={() => setDeletePkg(pkg)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className={`${styles.btn} ${styles.btnPrimary}`}
            style={{ width:'100%', justifyContent:'center', marginTop:14 }}
            onClick={() => setEditPkg('new')}>
            + Yeni Paket
          </button>
        </div>

        {/* Komisyon */}
        <div className={styles.card}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:800, color:'var(--t1)' }}>💰 Komisyon Oranları</div>
            <button className={`${styles.btn} ${styles.btnPrimary}`}
              style={{ padding:'5px 12px', fontSize:11 }}
              onClick={() => setCommAddOpen(true)}>
              + Yeni Ekle
            </button>
          </div>
          <div style={{ marginBottom:14 }}>
            <label className={styles.formLabel}>Varsayılan Oran</label>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <input className={styles.formInput} value="20" type="number" style={{ width:80 }} readOnly />
              <span style={{ fontSize:13, fontWeight:700, color:'var(--t2)' }}>%</span>
              <span style={{ fontSize:11, color:'var(--t3)' }}>tüm eğitmenler</span>
            </div>
          </div>

          {trainers.length === 0 ? (
            <div style={{ textAlign:'center', padding:24, color:'var(--t3)', fontSize:11 }}>
              Henüz eğitmen yok
            </div>
          ) : (
            <table className={styles.tbl}>
              <thead><tr><th>Eğitmen</th><th>Oran</th><th></th></tr></thead>
              <tbody>
                {trainers.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight:700, color:'var(--t1)', fontSize:11 }}>
                        {t.full_name || `${t.first_name} ${t.last_name}`}
                      </div>
                      <div style={{ fontSize:9, color:'var(--t3)' }}>{t.email}</div>
                    </td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <input className={styles.formInput} type="number" min={0} max={100}
                          value={getRate(t)} style={{ width:60, padding:'4px 8px' }}
                          onChange={e => setRate(t.id, e.target.value)} />
                        <span style={{ color:'var(--t3)', fontSize:11 }}>%</span>
                      </div>
                    </td>
                    <td>
                      <button className={`${styles.btn} ${styles.btnPrimary}`}
                        style={{ padding:'4px 10px', fontSize:10 }}
                        onClick={() => commMut.mutate({ id:t.id, rate:getRate(t) })}>
                        Kaydet
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Son Ödemeler */}
      <div className={styles.card}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:800, color:'var(--t1)' }}>💳 Son Ödemeler</div>
          <button className={`${styles.btn} ${styles.btnOutline}`}
            onClick={() => toast('Ödeme raporu indiriliyor...')}>📥 Rapor</button>
        </div>
        <table className={styles.tbl}>
          <thead>
            <tr><th>Kullanıcı</th><th>Paket</th><th>Tutar</th><th>Yöntem</th><th>Tarih</th><th>Durum</th></tr>
          </thead>
          <tbody>
            {PAYMENTS.map((p,i) => (
              <tr key={i}>
                <td style={{ fontWeight:700, color:'var(--t1)', fontSize:12 }}>{p.user}</td>
                <td style={{ fontSize:11, color:'var(--t2)' }}>{p.plan}</td>
                <td style={{ fontWeight:700, color:'var(--t1)' }}>{p.amount}</td>
                <td style={{ fontSize:11, color:'var(--t2)' }}>{p.method}</td>
                <td style={{ fontSize:10, color:'var(--t3)' }}>{p.date}</td>
                <td><span style={{ fontSize:10, fontWeight:700, color:p.sc }}>{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Komisyon Ekle Modal */}
      {commAddOpen && (
        <CommissionAddModal
          trainers={trainers}
          isPending={commAddMut.isPending}
          onClose={() => setCommAddOpen(false)}
          onSave={({ id, rate }) => commAddMut.mutate({ id, rate })}
        />
      )}

      {/* Package Modal */}
      {editPkg !== null && (
        <PackageModal
          pkg={editPkg === 'new' ? null : editPkg}
          onClose={() => setEditPkg(null)}
          onSave={handleSavePkg}
        />
      )}

      {/* Delete Package Confirm */}
      <ConfirmModal
        open={!!deletePkg}
        onClose={() => setDeletePkg(null)}
        onConfirm={() => {
          setPackages(p => p.filter(pkg => pkg.id !== deletePkg.id))
          toast.success(`${deletePkg.name} paketi silindi.`)
          setDeletePkg(null)
        }}
        title="Paketi Sil"
        message={`"${deletePkg?.name}" paketini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        confirmLabel="Evet, Sil"
        danger
      />
    </div>
  )
}
