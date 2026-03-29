import { useState } from 'react'
import { PageTopbar, KpiCard, Badge, FilterBar, Modal, ConfirmModal } from '../../components/shared'
import { cardsAPI, coursesAPI } from '../../api/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import styles from '../../styles/shared.module.css'
import toast from 'react-hot-toast'

const STATUS_BADGE = { published:'green', pending:'yellow', draft:'gray', rejected:'red' }
const STATUS_LABEL = { published:'Yayında', pending:'Onay Bekliyor', draft:'Taslak', rejected:'Reddedildi' }

const EMPTY_FORM = { question:'', answer:'', card_type:'qa', course:'', chapter:'', status:'draft' }

export default function AdminContent() {
  const qc = useQueryClient()

  const [search,      setSearch]      = useState('')
  const [filterType,  setFilterType]  = useState('')
  const [filterStat,  setFilterStat]  = useState('')
  const [newOpen,     setNewOpen]     = useState(false)
  const [editCard,    setEditCard]    = useState(null)
  const [deleteCard,  setDeleteCard]  = useState(null)
  const [form,        setForm]        = useState(EMPTY_FORM)

  // ── DATA ──────────────────────────────────────────────────────
  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['admin-cards', search, filterType, filterStat],
    queryFn: () => cardsAPI.list({
      search:    search    || undefined,
      card_type: filterType || undefined,
      status:    filterStat || undefined,
    }).then(r => r.data?.results ?? r.data),
  })

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesAPI.list().then(r => r.data?.results ?? r.data),
  })

  const selectedCourse = courses.find(c => String(c.id) === String(form.course))
  const chapters = selectedCourse?.chapters ?? []

  // ── KPI ───────────────────────────────────────────────────────
  const total     = cards.length
  const published = cards.filter(c => c.status === 'published').length
  const pending   = cards.filter(c => c.status === 'pending').length

  // ── MUTATIONS ─────────────────────────────────────────────────
  const approveMut = useMutation({
    mutationFn: (id) => cardsAPI.approve(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-cards'] }); toast.success('Kart onaylandı.') },
    onError: () => toast.error('Onaylama başarısız.'),
  })

  const rejectMut = useMutation({
    mutationFn: (id) => cardsAPI.reject(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-cards'] }); toast.success('Kart reddedildi.') },
    onError: () => toast.error('Reddetme başarısız.'),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => cardsAPI.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-cards'] }); toast.success('Kart silindi.') },
    onError: () => toast.error('Silme başarısız.'),
  })

  const createMut = useMutation({
    mutationFn: (d) => cardsAPI.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-cards'] })
      toast.success('Kart oluşturuldu.')
      setNewOpen(false)
      setForm(EMPTY_FORM)
    },
    onError: () => toast.error('Oluşturma başarısız.'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => cardsAPI.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-cards'] })
      toast.success('Kart güncellendi.')
      setEditCard(null)
    },
    onError: () => toast.error('Güncelleme başarısız.'),
  })

  // ── HANDLERS ──────────────────────────────────────────────────
  const openEdit = (card) => {
    setForm({
      question:  card.question,
      answer:    card.answer,
      card_type: card.card_type,
      course:    card.course  ? String(card.course)  : '',
      chapter:   card.chapter ? String(card.chapter) : '',
      status:    card.status,
    })
    setEditCard(card)
  }

  const buildPayload = () => ({
    question:  form.question,
    answer:    form.answer,
    card_type: form.card_type,
    status:    form.status,
    ...(form.course  && { course:  form.course }),
    ...(form.chapter && { chapter: form.chapter }),
  })

  const handleCreate = () => {
    if (!form.question.trim() || !form.answer.trim() || !form.course)
      return toast.error('Soru, cevap ve ders zorunludur.')
    createMut.mutate(buildPayload())
  }

  const handleUpdate = () => {
    if (!form.question.trim() || !form.answer.trim())
      return toast.error('Soru ve cevap zorunludur.')
    updateMut.mutate({ id: editCard.id, data: buildPayload() })
  }

  // ── SHARED FORM ───────────────────────────────────────────────
  const CardForm = () => (
    <>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
        <div className={styles.formGroup} style={{ marginBottom:0 }}>
          <label className={styles.formLabel}>Ders *</label>
          <select className={styles.formInput} value={form.course}
            onChange={e => setForm(f => ({ ...f, course: e.target.value, chapter:'' }))}>
            <option value="">Seçiniz</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className={styles.formGroup} style={{ marginBottom:0 }}>
          <label className={styles.formLabel}>Bölüm</label>
          <select className={styles.formInput} value={form.chapter}
            onChange={e => setForm(f => ({ ...f, chapter: e.target.value }))}
            disabled={!chapters.length}>
            <option value="">Seçiniz</option>
            {chapters.map(ch => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
        <div className={styles.formGroup} style={{ marginBottom:0 }}>
          <label className={styles.formLabel}>Tür</label>
          <select className={styles.formInput} value={form.card_type}
            onChange={e => setForm(f => ({ ...f, card_type: e.target.value }))}>
            <option value="qa">Soru — Cevap</option>
            <option value="def">Tanım</option>
          </select>
        </div>
        <div className={styles.formGroup} style={{ marginBottom:0 }}>
          <label className={styles.formLabel}>Durum</label>
          <select className={styles.formInput} value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option value="draft">Taslak</option>
            <option value="pending">Onay Bekliyor</option>
            <option value="published">Yayınla</option>
          </select>
        </div>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Soru *</label>
        <textarea className={styles.formInput} rows={3} value={form.question}
          onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
          placeholder="Flashcard sorusu..." />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Cevap *</label>
        <textarea className={styles.formInput} rows={4} value={form.answer}
          onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
          placeholder="Flashcard cevabı..." />
      </div>
    </>
  )

  return (
    <div>
      <PageTopbar title="İçerik Yönetimi" subtitle="Tüm flashcard ve quizleri yönet">
        <button className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => { setForm(EMPTY_FORM); setNewOpen(true) }}>
          + Yeni İçerik
        </button>
      </PageTopbar>

      <div className={`${styles.kpiRow} ${styles.c4}`}>
        <KpiCard icon="🃏" value={total}     label="Toplam Kart" />
        <KpiCard icon="✅" value={published} label="Yayında" />
        <KpiCard icon="⏳" value={pending}   label="Onay Bekleyen" />
        <KpiCard icon="📚" value={courses.length} label="Ders" />
      </div>

      <div className={styles.card}>
        <FilterBar
          searchPlaceholder="Kart ara..."
          onSearch={setSearch}
          selects={[
            {
              options: [
                { value:'',    label:'Tüm Tipler' },
                { value:'qa',  label:'Soru-Cevap' },
                { value:'def', label:'Tanım' },
              ],
              onChange: setFilterType,
            },
            {
              options: [
                { value:'',          label:'Tüm Durumlar' },
                { value:'published', label:'Yayında' },
                { value:'pending',   label:'Onay Bekliyor' },
                { value:'draft',     label:'Taslak' },
                { value:'rejected',  label:'Reddedildi' },
              ],
              onChange: setFilterStat,
            },
          ]}
        />
        <table className={styles.tbl}>
          <thead>
            <tr>
              <th>İçerik</th><th>Ders</th><th>Tip</th><th>Eğitmen</th>
              <th>Durum</th><th>Kullanım</th><th>Tarih</th><th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} style={{ textAlign:'center', padding:32, color:'var(--t3)' }}>Yükleniyor...</td></tr>
            ) : cards.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign:'center', padding:32, color:'var(--t3)' }}>İçerik bulunamadı</td></tr>
            ) : cards.map(c => (
              <tr key={c.id}>
                <td>
                  <div className={styles.t1}
                    style={{ maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {c.question}
                  </div>
                </td>
                <td style={{ fontSize:11, color:'var(--t2)' }}>{c.course_name || '—'}</td>
                <td>
                  <Badge color={c.card_type === 'qa' ? 'blue' : 'purple'}>
                    {c.card_type === 'qa' ? 'S-C' : 'Tanım'}
                  </Badge>
                </td>
                <td style={{ fontSize:11, color:'var(--t2)' }}>{c.created_by_name || '—'}</td>
                <td><Badge color={STATUS_BADGE[c.status] || 'gray'}>{STATUS_LABEL[c.status] || c.status}</Badge></td>
                <td style={{ fontSize:11, color:'var(--t2)' }}>{c.usage_count || '—'}</td>
                <td style={{ fontSize:10, color:'var(--t3)' }}>
                  {c.created_at ? new Date(c.created_at).toLocaleDateString('tr-TR') : '—'}
                </td>
                <td>
                  <div className={styles.rowActions}>
                    {c.status === 'pending' ? (
                      <>
                        <button className={styles.ra} title="Onayla"
                          onClick={() => approveMut.mutate(c.id)}
                          disabled={approveMut.isPending}>✅</button>
                        <button className={styles.ra} title="Reddet"
                          onClick={() => rejectMut.mutate(c.id)}
                          disabled={rejectMut.isPending}>❌</button>
                      </>
                    ) : (
                      <button className={styles.ra} title="Düzenle"
                        onClick={() => openEdit(c)}>✏️</button>
                    )}
                    <button className={styles.ra} title="Sil" style={{ color:'#FF8090' }}
                      onClick={() => setDeleteCard(c)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── NEW MODAL ── */}
      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="Yeni Kart" width={520}>
        <CardForm />
        <div style={{ display:'flex', gap:10, marginTop:4 }}>
          <button className={`${styles.btn} ${styles.btnOutline}`} style={{ flex:1 }}
            onClick={() => setNewOpen(false)}>İptal</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ flex:1 }}
            onClick={handleCreate} disabled={createMut.isPending}>
            {createMut.isPending ? 'Kaydediliyor...' : 'Oluştur'}
          </button>
        </div>
      </Modal>

      {/* ── EDIT MODAL ── */}
      <Modal open={!!editCard} onClose={() => setEditCard(null)} title="Kartı Düzenle" width={520}>
        <CardForm />
        <div style={{ display:'flex', gap:10, marginTop:4 }}>
          <button className={`${styles.btn} ${styles.btnOutline}`} style={{ flex:1 }}
            onClick={() => setEditCard(null)}>İptal</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ flex:1 }}
            onClick={handleUpdate} disabled={updateMut.isPending}>
            {updateMut.isPending ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </Modal>

      {/* ── DELETE CONFIRM ── */}
      <ConfirmModal
        open={!!deleteCard}
        onClose={() => setDeleteCard(null)}
        onConfirm={() => deleteMut.mutate(deleteCard.id)}
        title="Kartı Sil"
        message={`"${deleteCard?.question?.slice(0, 60)}..." kartını kalıcı olarak silmek istediğinize emin misiniz?`}
        confirmLabel="Evet, Sil"
        danger
      />
    </div>
  )
}
