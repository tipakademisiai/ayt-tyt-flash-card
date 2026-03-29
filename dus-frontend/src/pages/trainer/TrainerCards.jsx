import { useState } from 'react'
import { PageTopbar, Badge, FilterBar, Modal, ConfirmModal } from '../../components/shared'
import { cardsAPI, coursesAPI, aiAPI } from '../../api/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import styles from '../../styles/shared.module.css'
import toast from 'react-hot-toast'

const STATUS_COLOR = { published:'green', pending:'yellow', draft:'gray', rejected:'red' }
const STATUS_LABEL = { published:'Yayında', pending:'Onay Bekliyor', draft:'Taslak', rejected:'Reddedildi' }

const EMPTY_FORM = { question:'', answer:'', card_type:'qa', course:'', chapter:'', status:'draft' }
const EMPTY_AI   = { course:'', chapter:'', count:5, topic:'' }

export default function TrainerCards() {
  const qc = useQueryClient()

  const [expanded,   setExpanded]   = useState(null)
  const [search,     setSearch]     = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStat, setFilterStat] = useState('')

  const [newOpen,     setNewOpen]     = useState(false)
  const [editCard,    setEditCard]    = useState(null)   // card object
  const [deleteCard,  setDeleteCard]  = useState(null)   // card object
  const [aiOpen,      setAiOpen]      = useState(false)

  const [form,   setForm]   = useState(EMPTY_FORM)
  const [aiForm, setAiForm] = useState(EMPTY_AI)

  // ── DATA ──────────────────────────────────────────────────────
  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['trainer-cards', search, filterType, filterStat],
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

  const selectedCourse  = courses.find(c => String(c.id) === String(form.course))
  const chapters        = selectedCourse?.chapters ?? []
  const aiCourse        = courses.find(c => String(c.id) === String(aiForm.course))
  const aiChapters      = aiCourse?.chapters ?? []

  // ── MUTATIONS ─────────────────────────────────────────────────
  const createMut = useMutation({
    mutationFn: (d) => cardsAPI.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trainer-cards'] })
      toast.success('Kart oluşturuldu.')
      setNewOpen(false)
      setForm(EMPTY_FORM)
    },
    onError: () => toast.error('Oluşturma başarısız.'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => cardsAPI.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trainer-cards'] })
      toast.success('Kart güncellendi.')
      setEditCard(null)
    },
    onError: () => toast.error('Güncelleme başarısız.'),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => cardsAPI.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trainer-cards'] })
      toast.success('Kart silindi.')
      setDeleteCard(null)
      setExpanded(null)
    },
    onError: () => toast.error('Silme başarısız.'),
  })

  const aiMut = useMutation({
    mutationFn: (d) => aiAPI.generateCards(d),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['trainer-cards'] })
      const count = res.data?.cards?.length ?? res.data?.count ?? '?'
      toast.success(`${count} kart üretildi.`)
      setAiOpen(false)
      setAiForm(EMPTY_AI)
    },
    onError: () => toast.error('AI üretimi başarısız.'),
  })

  // ── HANDLERS ──────────────────────────────────────────────────
  const handleCreate = () => {
    if (!form.question.trim() || !form.answer.trim() || !form.course)
      return toast.error('Soru, cevap ve ders zorunludur.')
    const payload = {
      question:  form.question,
      answer:    form.answer,
      card_type: form.card_type,
      course:    form.course,
      status:    form.status,
    }
    if (form.chapter) payload.chapter = form.chapter
    createMut.mutate(payload)
  }

  const handleUpdate = () => {
    if (!form.question.trim() || !form.answer.trim())
      return toast.error('Soru ve cevap zorunludur.')
    const payload = {
      question:  form.question,
      answer:    form.answer,
      card_type: form.card_type,
      status:    form.status,
    }
    if (form.course)  payload.course  = form.course
    if (form.chapter) payload.chapter = form.chapter
    updateMut.mutate({ id: editCard.id, data: payload })
  }

  const openEdit = (card, e) => {
    e.stopPropagation()
    setForm({
      question:  card.question,
      answer:    card.answer,
      card_type: card.card_type,
      course:    card.course   ? String(card.course)   : '',
      chapter:   card.chapter  ? String(card.chapter)  : '',
      status:    card.status,
    })
    setEditCard(card)
  }

  const handleCopy = (card, e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(`S: ${card.question}\nC: ${card.answer}`)
    toast.success('Panoya kopyalandı.')
  }

  const handleAiGenerate = () => {
    if (!aiForm.course) return toast.error('Ders seçimi zorunludur.')
    aiMut.mutate({
      course:   aiForm.course,
      chapter:  aiForm.chapter || undefined,
      count:    Number(aiForm.count) || 5,
      topic:    aiForm.topic   || undefined,
    })
  }

  // ── SHARED FORM ───────────────────────────────────────────────
  const CardForm = ({ formCourses, formChapters }) => (
    <>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
        <div className={styles.formGroup} style={{ marginBottom:0 }}>
          <label className={styles.formLabel}>Ders *</label>
          <select className={styles.formInput} value={form.course}
            onChange={e => setForm(f => ({ ...f, course: e.target.value, chapter:'' }))}>
            <option value="">Seçiniz</option>
            {formCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className={styles.formGroup} style={{ marginBottom:0 }}>
          <label className={styles.formLabel}>Bölüm</label>
          <select className={styles.formInput} value={form.chapter}
            onChange={e => setForm(f => ({ ...f, chapter: e.target.value }))}
            disabled={!formChapters.length}>
            <option value="">Seçiniz</option>
            {formChapters.map(ch => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
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
            <option value="pending">Onaya Gönder</option>
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
      <PageTopbar title="Kartlarım" subtitle={`${cards.length} flashcard`}>
        <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => setAiOpen(true)}>
          ✨ AI ile Üret
        </button>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => { setForm(EMPTY_FORM); setNewOpen(true) }}>
          + Yeni Kart
        </button>
      </PageTopbar>

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

      {/* Card List */}
      {isLoading ? (
        <div style={{ textAlign:'center', padding:40, color:'var(--t3)' }}>Yükleniyor...</div>
      ) : cards.length === 0 ? (
        <div style={{ textAlign:'center', padding:40 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🃏</div>
          <div style={{ fontSize:14, fontWeight:700, color:'var(--t1)', marginBottom:6 }}>Henüz kart yok</div>
          <div style={{ fontSize:11, color:'var(--t3)', marginBottom:20 }}>AI ile veya manuel olarak ilk kartını oluştur</div>
          <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
            <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => setAiOpen(true)}>✨ AI ile Üret</button>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => { setForm(EMPTY_FORM); setNewOpen(true) }}>+ Yeni Kart</button>
          </div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {cards.map(c => (
            <div key={c.id}
              style={{ borderRadius:14, padding:16, background:'var(--card)', border:'1px solid var(--border)',
                cursor:'pointer', transition:'transform .15s' }}
              onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom: expanded === c.id ? 10 : 0 }}>
                <Badge color={c.card_type === 'qa' ? 'blue' : 'purple'}>
                  {c.card_type === 'qa' ? 'S-C' : 'Tanım'}
                </Badge>
                <Badge color={STATUS_COLOR[c.status] || 'gray'}>{STATUS_LABEL[c.status] || c.status}</Badge>
                {c.ai_generated && <Badge color="blue">AI</Badge>}
                <span style={{ fontSize:10, color:'var(--t3)', marginLeft:'auto' }}>
                  {c.chapter_name || c.course_name || ''}
                  {c.usage_count > 0 ? ` · ${c.usage_count} kez çalışıldı` : ' · Yeni'}
                </span>
              </div>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--t1)',
                marginTop: expanded === c.id ? 0 : 8,
                overflow: expanded === c.id ? 'visible' : 'hidden',
                textOverflow: expanded === c.id ? 'clip' : 'ellipsis',
                whiteSpace: expanded === c.id ? 'normal' : 'nowrap' }}>
                {c.question}
              </div>
              {expanded === c.id && (
                <>
                  <div style={{ height:1, background:'var(--border)', margin:'10px 0' }}/>
                  <div style={{ fontSize:11, fontWeight:500, color:'var(--t2)', lineHeight:1.6 }}>{c.answer}</div>
                  <div style={{ display:'flex', gap:6, marginTop:10 }}>
                    <div className={styles.ra} title="Düzenle" onClick={e => openEdit(c, e)}>✏️</div>
                    <div className={styles.ra} title="Sil" style={{ color:'#FF8090' }}
                      onClick={e => { e.stopPropagation(); setDeleteCard(c) }}>🗑️</div>
                    <div className={styles.ra} title="Kopyala" onClick={e => handleCopy(c, e)}>📋</div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── NEW CARD MODAL ── */}
      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="Yeni Kart" width={520}>
        <CardForm formCourses={courses} formChapters={chapters} />
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
        <CardForm formCourses={courses} formChapters={chapters} />
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

      {/* ── AI GENERATE MODAL ── */}
      <Modal open={aiOpen} onClose={() => setAiOpen(false)} title="✨ AI ile Kart Üret" width={460}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
          <div className={styles.formGroup} style={{ marginBottom:0 }}>
            <label className={styles.formLabel}>Ders *</label>
            <select className={styles.formInput} value={aiForm.course}
              onChange={e => setAiForm(f => ({ ...f, course: e.target.value, chapter:'' }))}>
              <option value="">Seçiniz</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className={styles.formGroup} style={{ marginBottom:0 }}>
            <label className={styles.formLabel}>Bölüm</label>
            <select className={styles.formInput} value={aiForm.chapter}
              onChange={e => setAiForm(f => ({ ...f, chapter: e.target.value }))}
              disabled={!aiChapters.length}>
              <option value="">Seçiniz</option>
              {aiChapters.map(ch => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
            </select>
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Konu / Anahtar Kelimeler</label>
          <input className={styles.formInput} value={aiForm.topic}
            onChange={e => setAiForm(f => ({ ...f, topic: e.target.value }))}
            placeholder="Örn: periodontal hastalık sınıflaması" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Kart Sayısı</label>
          <input className={styles.formInput} type="number" min={1} max={20}
            value={aiForm.count}
            onChange={e => setAiForm(f => ({ ...f, count: e.target.value }))} />
        </div>
        <div style={{ display:'flex', gap:10, marginTop:4 }}>
          <button className={`${styles.btn} ${styles.btnOutline}`} style={{ flex:1 }}
            onClick={() => setAiOpen(false)}>İptal</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ flex:1 }}
            onClick={handleAiGenerate} disabled={aiMut.isPending}>
            {aiMut.isPending ? 'Üretiliyor...' : '✨ Üret'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
