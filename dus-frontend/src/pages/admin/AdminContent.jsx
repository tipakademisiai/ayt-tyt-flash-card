import { useState } from 'react'
import { PageTopbar, KpiCard, Badge, FilterBar, Modal, ConfirmModal } from '../../components/shared'
import { cardsAPI, coursesAPI } from '../../api/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import styles from '../../styles/shared.module.css'
import toast from 'react-hot-toast'

// ── MOCK VERİ (backend olmadan) ───────────────────────────────
const MOCK_COURSES = [
  { id:1, name:'Türkçe (TYT)',            branch_type:'tyt', chapters:[{id:1,name:'Paragraf'},{id:2,name:'Dil Bilgisi'},{id:3,name:'Anlam Bilgisi'}] },
  { id:2, name:'Matematik (TYT)',          branch_type:'tyt', chapters:[{id:4,name:'Temel Matematik'},{id:5,name:'Problemler'},{id:6,name:'Geometri'}] },
  { id:3, name:'Fen Bilimleri (TYT)',      branch_type:'tyt', chapters:[{id:7,name:'Fizik'},{id:8,name:'Kimya'},{id:9,name:'Biyoloji'}] },
  { id:4, name:'Sosyal Bilimler (TYT)',    branch_type:'tyt', chapters:[{id:10,name:'Tarih'},{id:11,name:'Coğrafya'},{id:12,name:'Felsefe'},{id:13,name:'Din Kültürü'}] },
  { id:5, name:'Fen Bilimleri (AYT)',      branch_type:'ayt', chapters:[{id:14,name:'Fizik'},{id:15,name:'Kimya'},{id:16,name:'Biyoloji'}] },
  { id:6, name:'Matematik (AYT)',          branch_type:'ayt', chapters:[{id:17,name:'Matematik'},{id:18,name:'Geometri'}] },
  { id:7, name:'Edebiyat – Sosyal Bil. 1', branch_type:'ayt', chapters:[{id:19,name:'Türk Dili ve Edebiyatı'},{id:20,name:'Tarih-1'},{id:21,name:'Coğrafya-1'}] },
  { id:8, name:'Sosyal Bilimler 2 (AYT)',  branch_type:'ayt', chapters:[{id:22,name:'Tarih-2'},{id:23,name:'Coğrafya-2'},{id:24,name:'Felsefe'},{id:25,name:'Psikoloji'},{id:26,name:'Sosyoloji'},{id:27,name:'Mantık'},{id:28,name:'Din Kültürü'}] },
]
const MOCK_CARDS = [
  { id:1,  question:'Paragrafta ana fikir nerede bulunur?',          answer:'Genellikle başta veya sonda; bazen tümüne yayılır.',                  card_type:'qa',  status:'published', course:1, chapter:1, created_at:'2026-01-01' },
  { id:2,  question:'Fiilimsi türleri nelerdir?',                     answer:'İsim-fiil, sıfat-fiil, zarf-fiil.',                                   card_type:'qa',  status:'published', course:1, chapter:2, created_at:'2026-01-02' },
  { id:3,  question:'Mecaz anlam nedir?',                             answer:'Sözcüğün gerçek anlamı dışında kullanılmasıdır.',                     card_type:'def', status:'published', course:1, chapter:3, created_at:'2026-01-03' },
  { id:4,  question:'Kareler farkı formülü?',                         answer:'a² - b² = (a+b)(a-b)',                                               card_type:'qa',  status:'published', course:2, chapter:4, created_at:'2026-01-04' },
  { id:5,  question:'Hız-Zaman-Mesafe formülü?',                      answer:'M = H × Z',                                                          card_type:'qa',  status:'published', course:2, chapter:5, created_at:'2026-01-05' },
  { id:6,  question:'Üçgende iç açılar toplamı?',                     answer:'180°',                                                               card_type:'qa',  status:'published', course:2, chapter:6, created_at:'2026-01-06' },
  { id:7,  question:"Newton'un 1. Yasası?",                           answer:'Net kuvvet sıfırsa cisim durur ya da sabit hızla hareket eder.',      card_type:'qa',  status:'published', course:3, chapter:7, created_at:'2026-01-07' },
  { id:8,  question:'Atom numarası neyi gösterir?',                   answer:'Proton sayısını.',                                                    card_type:'def', status:'published', course:3, chapter:8, created_at:'2026-01-08' },
  { id:9,  question:'Fotosentez denklemi?',                           answer:'6CO₂ + 6H₂O + ışık → C₆H₁₂O₆ + 6O₂',                              card_type:'qa',  status:'published', course:3, chapter:9, created_at:'2026-01-09' },
  { id:10, question:"Osmanlı'nın kuruluş yılı?",                      answer:'1299.',                                                              card_type:'qa',  status:'pending',   course:4, chapter:10,created_at:'2026-01-10' },
  { id:11, question:"Türkiye'nin en uzun nehri?",                     answer:'Kızılırmak (1355 km).',                                              card_type:'qa',  status:'pending',   course:4, chapter:11,created_at:'2026-01-11' },
  { id:12, question:'Empirizm nedir?',                                answer:'Bilginin kaynağının deney ve gözlem olduğunu savunan akım.',         card_type:'def', status:'draft',     course:4, chapter:12,created_at:'2026-01-12' },
  { id:13, question:'Faraday İndüksiyon Yasası?',                     answer:'Değişen manyetik akı EMK indükler: EMK = -dΦ/dt.',                   card_type:'qa',  status:'published', course:5, chapter:14,created_at:'2026-01-13' },
  { id:14, question:'Türev tanımı?',                                  answer:"f'(x) = lim(h→0)[f(x+h)-f(x)]/h",                                   card_type:'def', status:'published', course:6, chapter:17,created_at:'2026-01-14' },
  { id:15, question:'Tanzimat Edebiyatı başlangıç tarihi?',           answer:'1839 (Tanzimat Fermanı).',                                           card_type:'qa',  status:'published', course:7, chapter:19,created_at:'2026-01-15' },
]

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
  const { data: rawCards, isLoading, isError: cardsErr } = useQuery({
    queryKey: ['admin-cards', search, filterType, filterStat],
    queryFn: () => cardsAPI.list({
      search:    search    || undefined,
      card_type: filterType || undefined,
      status:    filterStat || undefined,
    }).then(r => r.data?.results ?? r.data),
    retry: 1,
  })
  const { data: rawCourses, isError: coursesErr } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesAPI.list().then(r => r.data?.results ?? r.data),
    retry: 1,
  })

  const allCards = (cardsErr  || !rawCards)   ? MOCK_CARDS   : rawCards
  const courses  = (coursesErr || !rawCourses) ? MOCK_COURSES : rawCourses

  // Arama + filtre (mock ve gerçek veri için)
  const cards = allCards.filter(c => {
    if (search     && !c.question?.toLowerCase().includes(search.toLowerCase())) return false
    if (filterType && c.card_type !== filterType) return false
    if (filterStat && c.status    !== filterStat) return false
    return true
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
