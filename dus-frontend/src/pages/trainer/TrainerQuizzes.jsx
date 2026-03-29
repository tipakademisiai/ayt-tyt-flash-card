import { useState } from 'react'
import { PageTopbar, Badge, FilterBar, Modal, ConfirmModal } from '../../components/shared'
import { quizAPI, coursesAPI } from '../../api/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import styles from '../../styles/shared.module.css'
import toast from 'react-hot-toast'

const EMPTY_FORM = { name:'', description:'', course:'', chapter:'', time_limit:'' }

export default function TrainerQuizzes() {
  const qc = useQueryClient()

  const [search,      setSearch]      = useState('')
  const [newOpen,     setNewOpen]     = useState(false)
  const [editQuiz,    setEditQuiz]    = useState(null)
  const [deleteQuiz,  setDeleteQuiz]  = useState(null)
  const [form,        setForm]        = useState(EMPTY_FORM)

  // ── DATA ──────────────────────────────────────────────────────
  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ['trainer-quizzes', search],
    queryFn: () => quizAPI.list({ search: search || undefined })
      .then(r => r.data?.results ?? r.data),
  })

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesAPI.list().then(r => r.data?.results ?? r.data),
  })

  const selectedCourse = courses.find(c => String(c.id) === String(form.course))
  const chapters = selectedCourse?.chapters ?? []

  // ── MUTATIONS ─────────────────────────────────────────────────
  const createMut = useMutation({
    mutationFn: (d) => quizAPI.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trainer-quizzes'] })
      toast.success('Quiz oluşturuldu.')
      setNewOpen(false)
      setForm(EMPTY_FORM)
    },
    onError: () => toast.error('Oluşturma başarısız.'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => quizAPI.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trainer-quizzes'] })
      toast.success('Quiz güncellendi.')
      setEditQuiz(null)
    },
    onError: () => toast.error('Güncelleme başarısız.'),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => quizAPI.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trainer-quizzes'] })
      toast.success('Quiz silindi.')
      setDeleteQuiz(null)
    },
    onError: () => toast.error('Silme başarısız.'),
  })

  const publishMut = useMutation({
    mutationFn: (id) => quizAPI.update(id, { status: 'published' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trainer-quizzes'] })
      toast.success('Quiz yayınlandı.')
    },
    onError: () => toast.error('Yayınlama başarısız.'),
  })

  // ── HANDLERS ──────────────────────────────────────────────────
  const handleCreate = () => {
    if (!form.name.trim() || !form.course)
      return toast.error('Quiz adı ve ders zorunludur.')
    const payload = { name: form.name, course: form.course, status: 'draft' }
    if (form.description) payload.description = form.description
    if (form.chapter)     payload.chapter = form.chapter
    if (form.time_limit)  payload.time_limit = Number(form.time_limit)
    createMut.mutate(payload)
  }

  const handleUpdate = () => {
    if (!form.name.trim()) return toast.error('Quiz adı zorunludur.')
    const payload = { name: form.name }
    if (form.description !== undefined) payload.description = form.description
    if (form.time_limit)  payload.time_limit = Number(form.time_limit)
    updateMut.mutate({ id: editQuiz.id, data: payload })
  }

  const openEdit = (q) => {
    setForm({
      name:       q.name        || '',
      description:q.description || '',
      course:     q.course      ? String(q.course)   : '',
      chapter:    q.chapter     ? String(q.chapter)  : '',
      time_limit: q.time_limit  ? String(q.time_limit) : '',
    })
    setEditQuiz(q)
  }

  // ── FORM ──────────────────────────────────────────────────────
  const QuizForm = () => (
    <>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Quiz Adı *</label>
        <input className={styles.formInput} value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Quiz başlığı" />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Açıklama</label>
        <textarea className={styles.formInput} rows={2} value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Opsiyonel açıklama" />
      </div>
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
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Süre Sınırı (dakika)</label>
        <input className={styles.formInput} type="number" min={0} value={form.time_limit}
          onChange={e => setForm(f => ({ ...f, time_limit: e.target.value }))}
          placeholder="Boş bırakılırsa sınır yok" />
      </div>
    </>
  )

  return (
    <div>
      <PageTopbar title="Quizlerim" subtitle={`${quizzes.length} quiz`}>
        <button className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => { setForm(EMPTY_FORM); setNewOpen(true) }}>
          + Yeni Quiz
        </button>
      </PageTopbar>

      <FilterBar searchPlaceholder="Quiz ara..." onSearch={setSearch} />

      <div className={styles.card} style={{ padding:0, overflow:'hidden' }}>
        <table className={styles.tbl}>
          <thead>
            <tr>
              <th>Quiz Adı</th>
              <th>Ders</th>
              <th>Çözülme</th>
              <th>Ort. Başarı</th>
              <th>Durum</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} style={{ textAlign:'center', padding:32, color:'var(--t3)' }}>Yükleniyor...</td></tr>
            ) : quizzes.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign:'center', padding:32, color:'var(--t3)' }}>Henüz quiz yok</td></tr>
            ) : quizzes.map(q => (
              <tr key={q.id}>
                <td>
                  <div style={{ fontWeight:700, color:'var(--t1)', fontSize:12 }}>{q.name}</div>
                  {q.description && <div style={{ fontSize:10, color:'var(--t3)' }}>{q.description}</div>}
                </td>
                <td style={{ fontSize:11, color:'var(--t2)' }}>{q.course_name || '—'}</td>
                <td style={{ fontSize:11, color:'var(--t2)' }}>{q.play_count || '—'}</td>
                <td>
                  {q.avg_score > 0 ? (
                    <span style={{ fontWeight:700, fontSize:12,
                      color: q.avg_score >= 75 ? '#10B981' : q.avg_score >= 60 ? '#F5C842' : '#E05070' }}>
                      %{Math.round(q.avg_score)}
                    </span>
                  ) : <span style={{ color:'var(--t3)', fontSize:11 }}>—</span>}
                </td>
                <td>
                  <Badge color={q.status === 'published' ? 'green' : 'gray'}>
                    {q.status === 'published' ? 'Yayında' : 'Taslak'}
                  </Badge>
                </td>
                <td>
                  <div className={styles.rowActions}>
                    <button className={styles.ra} title="Düzenle" onClick={() => openEdit(q)}>✏️</button>
                    {q.status === 'draft' && (
                      <button className={styles.ra} title="Yayınla"
                        onClick={() => publishMut.mutate(q.id)}
                        disabled={publishMut.isPending}>🚀</button>
                    )}
                    <button className={styles.ra} title="Sil" style={{ color:'#FF8090' }}
                      onClick={() => setDeleteQuiz(q)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── NEW MODAL ── */}
      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="Yeni Quiz" width={500}>
        <QuizForm />
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
      <Modal open={!!editQuiz} onClose={() => setEditQuiz(null)} title="Quiz Düzenle" width={500}>
        <QuizForm />
        <div style={{ display:'flex', gap:10, marginTop:4 }}>
          <button className={`${styles.btn} ${styles.btnOutline}`} style={{ flex:1 }}
            onClick={() => setEditQuiz(null)}>İptal</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ flex:1 }}
            onClick={handleUpdate} disabled={updateMut.isPending}>
            {updateMut.isPending ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </Modal>

      {/* ── DELETE CONFIRM ── */}
      <ConfirmModal
        open={!!deleteQuiz}
        onClose={() => setDeleteQuiz(null)}
        onConfirm={() => deleteMut.mutate(deleteQuiz.id)}
        title="Quizi Sil"
        message={`"${deleteQuiz?.name}" quizini kalıcı olarak silmek istediğinize emin misiniz?`}
        confirmLabel="Evet, Sil"
        danger
      />
    </div>
  )
}
