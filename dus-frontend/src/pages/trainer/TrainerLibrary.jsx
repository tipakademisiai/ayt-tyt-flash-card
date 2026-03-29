import { useState, useRef } from 'react'
import { PageTopbar, FilterBar } from '../../components/shared'
import { libraryAPI, imageCardsAPI, coursesAPI, cardsAPI } from '../../api/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import styles from '../../styles/shared.module.css'
import toast from 'react-hot-toast'
import { parseFlashcardCSV, saveImportedCards } from '../../data'

const FILE_TYPE_ICONS  = { pdf:'📄', excel:'📊', image:'🖼️', word:'📝', other:'📎' }
const FILE_TYPE_COLORS = {
  pdf:   { bg:'rgba(224,80,112,.12)', color:'#FF8090' },
  excel: { bg:'rgba(16,185,129,.12)', color:'#10B981' },
  image: { bg:'rgba(0,170,221,.12)',  color:'#00AADD' },
  word:  { bg:'rgba(160,139,250,.12)',color:'#A78BFA' },
  other: { bg:'rgba(255,255,255,.08)',color:'var(--t3)' },
}
const STATUS_COLORS = {
  draft:    { bg:'rgba(255,255,255,.06)', color:'var(--t3)' },
  pending:  { bg:'rgba(251,191,36,.12)',  color:'#F59E0B' },
  published:{ bg:'rgba(16,185,129,.12)',  color:'#10B981' },
  rejected: { bg:'rgba(224,80,112,.12)',  color:'#FF8090' },
}

function formatSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function SubTabs({ active, onChange }) {
  return (
    <div style={{ display:'flex', gap:4, padding:'0 0 20px' }}>
      {[
        { key:'docs',     label:'📄 Dökümanlar' },
        { key:'imgcards', label:'🖼️ Bilgi Kartları' },
      ].map(t => (
        <button key={t.key} onClick={() => onChange(t.key)}
          style={{
            padding:'8px 18px', borderRadius:12, border:'none', cursor:'pointer',
            fontFamily:'Montserrat', fontWeight:700, fontSize:12,
            background: active === t.key ? '#00AADD' : 'var(--border)',
            color: active === t.key ? '#fff' : 'var(--t2)',
            transition:'all .15s',
          }}>
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ── DOCUMENTS TAB ─────────────────────────────────────────────────────────────
function DocumentsTab({ courses }) {
  const qc = useQueryClient()
  const fileRef = useRef()
  const csvRef  = useRef()
  const [search, setSearch]         = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [form, setForm]             = useState({ title:'', description:'', course:'', chapter:'' })
  const [file, setFile]             = useState(null)
  const [genDoc, setGenDoc]         = useState(null)
  const [genForm, setGenForm]       = useState({ count:10, difficulty:'orta', focus:'' })
  const [genCards, setGenCards]     = useState(null)
  const [savingCards, setSavingCards] = useState(false)
  const [csvOpen,     setCsvOpen]     = useState(false)
  const [csvParsed,   setCsvParsed]   = useState([])
  const [csvFileName, setCsvFileName] = useState('')

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['library-trainer', search],
    queryFn: () => libraryAPI.list({ search: search || undefined }).then(r => r.data?.results ?? r.data),
  })

  const selectedCourse = courses.find(c => String(c.id) === String(form.course))
  const chapters = selectedCourse?.chapters ?? []

  const uploadMutation = useMutation({
    mutationFn: (fd) => libraryAPI.upload(fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['library-trainer'] }); toast.success('Belge yüklendi.')
      setUploadOpen(false); setForm({ title:'', description:'', course:'', chapter:'' }); setFile(null)
    },
    onError: () => toast.error('Yükleme başarısız.'),
  })
  const deleteMutation = useMutation({
    mutationFn: (id) => libraryAPI.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['library-trainer'] }); toast.success('Belge silindi.') },
  })
  const genMutation = useMutation({
    mutationFn: ({ id, params }) => libraryAPI.generateCards(id, params),
    onSuccess: (res) => setGenCards(res.data?.cards ?? []),
    onError: () => toast.error('Kart üretimi başarısız.'),
  })

  const openGen = (doc) => { setGenDoc(doc); setGenCards(null); setGenForm({ count:10, difficulty:'orta', focus:'' }) }
  const runGenerate = () => genMutation.mutate({ id:genDoc.id, params:genForm })
  const saveGeneratedCards = async () => {
    if (!genCards?.length) return
    setSavingCards(true)
    try {
      await Promise.all(genCards.map(c =>
        cardsAPI.create({ question:c.front, answer:c.back, hint:c.hint||'', course:genDoc.course, chapter:genDoc.chapter||null })
      ))
      toast.success(`${genCards.length} kart kaydedildi.`)
      setGenDoc(null)
    } catch { toast.error('Kartlar kaydedilemedi.') }
    finally { setSavingCards(false) }
  }

  const handleUpload = () => {
    if (!form.title || !file) return toast.error('Başlık ve dosya zorunludur.')
    const fd = new FormData()
    fd.append('title', form.title); fd.append('description', form.description); fd.append('file', file)
    if (form.course) fd.append('course', form.course)
    if (form.chapter) fd.append('chapter', form.chapter)
    uploadMutation.mutate(fd)
  }

  const handleCsvFile = (e) => {
    const f = e.target.files[0]; if (!f) return
    setCsvFileName(f.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const parsed = parseFlashcardCSV(ev.target.result)
      if (!parsed.length) { toast.error('CSV boş veya okunamadı.'); return }
      setCsvParsed(parsed); setCsvOpen(true)
    }
    reader.readAsText(f, 'UTF-8')
    e.target.value = ''
  }

  const handleCsvImport = () => {
    const matched = csvParsed.filter(c => c.slug)
    const unmatched = csvParsed.filter(c => !c.slug)
    if (!matched.length) { toast.error('Eşleşen ders bulunamadı.'); return }
    const bySlug = {}
    matched.forEach(c => { if (!bySlug[c.slug]) bySlug[c.slug] = []; bySlug[c.slug].push({ id:c.id, q:c.q, a:c.a, baslik:c.baslik }) })
    const saved = saveImportedCards(bySlug)
    toast.success(`${saved} kart import edildi!${unmatched.length ? ` (${unmatched.length} satır eşleşmedi)` : ''}`)
    setCsvOpen(false); setCsvParsed([])
  }

  return (
    <>
      <input ref={csvRef} type="file" accept=".csv,.txt" style={{ display:'none' }} onChange={handleCsvFile} />

      <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginBottom:12 }}>
        <button className={`${styles.btn} ${styles.btnOutline}`}
          onClick={() => csvRef.current.click()}
          style={{ display:'flex', alignItems:'center', gap:6 }}>
          📥 CSV İçe Aktar
        </button>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setUploadOpen(true)}>+ Belge Yükle</button>
      </div>

      {/* CSV Önizleme Modal */}
      {csvOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.65)', zIndex:200,
          display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={e => { if (e.target===e.currentTarget) setCsvOpen(false) }}>
          <div style={{ background:'var(--card)', border:'1px solid var(--border)',
            borderRadius:20, padding:28, width:680, maxWidth:'96vw', maxHeight:'90vh',
            display:'flex', flexDirection:'column' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div>
                <div style={{ fontSize:15, fontWeight:800, color:'var(--t1)' }}>📥 CSV Önizleme</div>
                <div style={{ fontSize:10, color:'var(--t3)', marginTop:2 }}>{csvFileName} — {csvParsed.length} satır</div>
              </div>
              <button onClick={() => setCsvOpen(false)} style={{ background:'none', border:'none', color:'var(--t3)', fontSize:18, cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ padding:'8px 12px', borderRadius:10, background:'rgba(0,170,221,.08)',
              border:'1px solid rgba(0,170,221,.2)', marginBottom:14, fontSize:10, color:'var(--t3)', lineHeight:1.7 }}>
              <strong style={{ color:'#00AADD' }}>CSV Formatı:</strong>
              &nbsp; A=BAŞLIK &nbsp;·&nbsp; B=SORU &nbsp;·&nbsp; C=AÇIKLAMA &nbsp;·&nbsp;
              D=KATEGORİ (TYT/AYT) &nbsp;·&nbsp; E=BÖLÜM &nbsp;·&nbsp; F=DERS
            </div>
            <div style={{ display:'flex', gap:10, marginBottom:14 }}>
              {[
                { label:'Toplam',    val:csvParsed.length,                    color:'var(--t2)' },
                { label:'Eşleşti',  val:csvParsed.filter(c=>c.slug).length,  color:'#10B981'   },
                { label:'Eşleşmedi',val:csvParsed.filter(c=>!c.slug).length, color:'#F5A020'   },
              ].map(s => (
                <div key={s.label} style={{ flex:1, padding:'8px 10px', borderRadius:10,
                  background:'var(--input)', border:'1px solid var(--border)', textAlign:'center' }}>
                  <div style={{ fontSize:18, fontWeight:900, color:s.color }}>{s.val}</div>
                  <div style={{ fontSize:9, color:'var(--t3)', fontWeight:600 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ flex:1, overflowY:'auto', marginBottom:16, maxHeight:280 }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
                <thead>
                  <tr style={{ background:'var(--input)' }}>
                    {['#','BAŞLIK','SORU','AÇIKLAMA','KATEGORİ','BÖLÜM','DERS','Slug'].map(h => (
                      <th key={h} style={{ padding:'6px 8px', textAlign:'left', fontWeight:700,
                        color:'var(--t3)', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvParsed.slice(0,50).map((c,i) => (
                    <tr key={c.id} style={{ borderBottom:'1px solid var(--border)' }}>
                      <td style={{ padding:'5px 8px', color:'var(--t3)' }}>{i+1}</td>
                      <td style={{ padding:'5px 8px', color:'var(--t2)', maxWidth:80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.baslik}</td>
                      <td style={{ padding:'5px 8px', color:'var(--t1)', maxWidth:130, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.q}</td>
                      <td style={{ padding:'5px 8px', color:'var(--t2)', maxWidth:110, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.a}</td>
                      <td style={{ padding:'5px 8px', fontWeight:700,
                        color:c.kategori==='TYT'?'#4A90D0':c.kategori==='AYT'?'#D0506A':'var(--t3)' }}>{c.kategori||'—'}</td>
                      <td style={{ padding:'5px 8px', color:'var(--t2)' }}>{c.bolum||'—'}</td>
                      <td style={{ padding:'5px 8px', color:'var(--t2)' }}>{c.ders||'—'}</td>
                      <td style={{ padding:'5px 8px' }}>
                        {c.slug
                          ? <span style={{ padding:'2px 6px', borderRadius:5, fontSize:9, fontWeight:700, background:'rgba(16,185,129,.12)', color:'#10B981' }}>✓</span>
                          : <span style={{ padding:'2px 6px', borderRadius:5, fontSize:9, fontWeight:700, background:'rgba(245,160,32,.12)', color:'#F5A020' }}>—</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button className={`${styles.btn} ${styles.btnOutline}`} style={{ flex:1 }} onClick={() => { setCsvOpen(false); setCsvParsed([]) }}>İptal</button>
              <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ flex:1 }}
                onClick={handleCsvImport} disabled={!csvParsed.filter(c=>c.slug).length}>
                {csvParsed.filter(c=>c.slug).length} Kartı Import Et
              </button>
            </div>
          </div>
        </div>
      )}

      <FilterBar searchPlaceholder="Belge ara..." onSearch={setSearch} />

      {/* Upload Modal */}
      {uploadOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:100,
          display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={e => { if (e.target===e.currentTarget) setUploadOpen(false) }}>
          <div style={{ background:'var(--card)', border:'1px solid var(--border)',
            borderRadius:20, padding:28, width:440, maxWidth:'95vw' }}>
            <div style={{ fontSize:15, fontWeight:800, color:'var(--t1)', marginBottom:20 }}>Belge Yükle</div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Başlık *</label>
              <input className={styles.formInput} value={form.title}
                onChange={e => setForm(f=>({...f,title:e.target.value}))} placeholder="Belge başlığı" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Açıklama</label>
              <textarea className={styles.formInput} rows={2} value={form.description}
                onChange={e => setForm(f=>({...f,description:e.target.value}))} placeholder="Opsiyonel açıklama" />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
              <div className={styles.formGroup} style={{ marginBottom:0 }}>
                <label className={styles.formLabel}>Ders</label>
                <select className={styles.formInput} value={form.course}
                  onChange={e => setForm(f=>({...f,course:e.target.value,chapter:''}))}>
                  <option value="">Seçiniz</option>
                  {courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className={styles.formGroup} style={{ marginBottom:0 }}>
                <label className={styles.formLabel}>Bölüm</label>
                <select className={styles.formInput} value={form.chapter}
                  onChange={e => setForm(f=>({...f,chapter:e.target.value}))} disabled={!chapters.length}>
                  <option value="">Seçiniz</option>
                  {chapters.map(ch=><option key={ch.id} value={ch.id}>{ch.name}</option>)}
                </select>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Dosya *</label>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <input ref={fileRef} type="file" style={{ display:'none' }}
                  accept=".pdf,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
                  onChange={e => setFile(e.target.files[0])} />
                <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => fileRef.current.click()}>📁 Dosya Seç</button>
                <span style={{ fontSize:11, color:'var(--t3)' }}>{file ? file.name : 'PDF, Excel, Görsel, Word'}</span>
              </div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button className={`${styles.btn} ${styles.btnOutline}`} style={{ flex:1 }} onClick={() => setUploadOpen(false)}>İptal</button>
              <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ flex:1 }}
                onClick={handleUpload} disabled={uploadMutation.isPending}>
                {uploadMutation.isPending ? 'Yükleniyor...' : 'Yükle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Cards */}
      {isLoading ? (
        <div style={{ textAlign:'center', padding:40, color:'var(--t3)' }}>Yükleniyor...</div>
      ) : docs.length === 0 ? (
        <div style={{ textAlign:'center', padding:40 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📚</div>
          <div style={{ fontSize:14, fontWeight:700, color:'var(--t1)', marginBottom:6 }}>Kütüphanen boş</div>
          <div style={{ fontSize:11, color:'var(--t3)', marginBottom:20 }}>
            Kart ve quiz oluştururken referans alacağın belgeleri buraya yükle
          </div>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setUploadOpen(true)}>+ İlk Belgeni Yükle</button>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:12 }}>
          {docs.map(doc => {
            const ts = FILE_TYPE_COLORS[doc.file_type] || FILE_TYPE_COLORS.other
            return (
              <div key={doc.id} className={styles.card}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:10 }}>
                  <div style={{ width:40, height:40, borderRadius:12, flexShrink:0,
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, background:ts.bg }}>
                    {FILE_TYPE_ICONS[doc.file_type]||'📎'}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'var(--t1)',
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{doc.title}</div>
                    {doc.description && (
                      <div style={{ fontSize:10, color:'var(--t3)', marginTop:2,
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{doc.description}</div>
                    )}
                  </div>
                </div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
                  <span style={{ padding:'2px 8px', borderRadius:6, fontSize:9, fontWeight:700, background:ts.bg, color:ts.color }}>
                    {doc.file_type?.toUpperCase()}
                  </span>
                  {doc.course_name && (
                    <span style={{ padding:'2px 8px', borderRadius:6, fontSize:9, fontWeight:700, background:'rgba(0,170,221,.1)', color:'#00AADD' }}>
                      {doc.course_name}
                    </span>
                  )}
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:10, color:'var(--t3)' }}>
                    {formatSize(doc.file_size)} · {new Date(doc.created_at).toLocaleDateString('tr-TR')}
                  </span>
                  <div style={{ display:'flex', gap:6 }}>
                    {doc.file_type === 'pdf' && (
                      <button className={styles.ra} title="Kartları Üret" style={{ color:'#A78BFA' }}
                        onClick={() => openGen(doc)}>🪄</button>
                    )}
                    {doc.file_url && (
                      <a href={doc.file_url} target="_blank" rel="noreferrer" className={styles.ra} title="İndir">⬇</a>
                    )}
                    <button className={styles.ra} title="Sil" style={{ color:'#FF8090' }}
                      onClick={() => { if (window.confirm('Sil?')) deleteMutation.mutate(doc.id) }}>✕</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Generate Modal */}
      {genDoc && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.65)', zIndex:200,
          display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={e => { if (e.target===e.currentTarget) setGenDoc(null) }}>
          <div style={{ background:'var(--card)', border:'1px solid var(--border)',
            borderRadius:20, padding:28, width:520, maxWidth:'95vw', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ fontSize:15, fontWeight:800, color:'var(--t1)', marginBottom:4 }}>🪄 Kartları Üret</div>
            <div style={{ fontSize:11, color:'var(--t3)', marginBottom:20 }}>
              {genDoc.title} — {genDoc.page_count ? `${genDoc.page_count} sayfa` : 'PDF'}
            </div>
            {!genCards ? (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Kaç kart?</label>
                  <input type="number" className={styles.formInput} min={1} max={50} value={genForm.count}
                    onChange={e => setGenForm(f=>({...f,count:Number(e.target.value)}))} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Zorluk</label>
                  <select className={styles.formInput} value={genForm.difficulty}
                    onChange={e => setGenForm(f=>({...f,difficulty:e.target.value}))}>
                    <option value="kolay">Kolay</option><option value="orta">Orta</option><option value="zor">Zor</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Odak (opsiyonel)</label>
                  <input className={styles.formInput} value={genForm.focus}
                    onChange={e => setGenForm(f=>({...f,focus:e.target.value}))} placeholder="Ör: anatomik yapılar..." />
                </div>
                <div style={{ display:'flex', gap:10, marginTop:20 }}>
                  <button className={`${styles.btn} ${styles.btnOutline}`} style={{ flex:1 }} onClick={() => setGenDoc(null)}>İptal</button>
                  <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ flex:1, background:'linear-gradient(135deg,#7C3AED,#A78BFA)' }}
                    onClick={runGenerate} disabled={genMutation.isPending}>
                    {genMutation.isPending ? 'Üretiliyor...' : 'Üret'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize:12, fontWeight:700, color:'#A78BFA', marginBottom:12 }}>{genCards.length} kart üretildi</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
                  {genCards.map((c,i) => (
                    <div key={i} style={{ borderRadius:10, padding:'10px 14px', background:'var(--input)', border:'1px solid var(--border)' }}>
                      <div style={{ fontSize:12, fontWeight:700, color:'var(--t1)', marginBottom:4 }}>{c.front}</div>
                      <div style={{ fontSize:11, color:'var(--t2)', lineHeight:1.5 }}>{c.back}</div>
                      {c.hint && <div style={{ fontSize:10, color:'var(--t3)', marginTop:4 }}>💡 {c.hint}</div>}
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button className={`${styles.btn} ${styles.btnOutline}`} style={{ flex:1 }} onClick={() => setGenCards(null)}>Tekrar</button>
                  <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ flex:1 }}
                    onClick={saveGeneratedCards} disabled={savingCards}>
                    {savingCards ? 'Kaydediliyor...' : `${genCards.length} Kartı Kaydet`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// ── IMAGE CARDS TAB ──────────────────────────────────────────────────────────
function ImageCardsTab({ courses }) {
  const qc = useQueryClient()
  const imgRef = useRef()
  const [search, setSearch]   = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [form, setForm]       = useState({ title:'', description:'', course:'', chapter:'' })
  const [imgFile, setImgFile] = useState(null)
  const [preview, setPreview] = useState(null)

  const { data: imgCards = [], isLoading } = useQuery({
    queryKey: ['image-cards-trainer', search],
    queryFn: () => imageCardsAPI.list({ search: search || undefined }).then(r => r.data?.results ?? r.data),
  })

  const selectedCourse = courses.find(c => String(c.id) === String(form.course))
  const chapters = selectedCourse?.chapters ?? []

  const uploadMutation = useMutation({
    mutationFn: (fd) => imageCardsAPI.upload(fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['image-cards-trainer'] })
      toast.success('Bilgi kartı yüklendi. Admin onayı bekleniyor.')
      setUploadOpen(false); setForm({ title:'', description:'', course:'', chapter:'' })
      setImgFile(null); setPreview(null)
    },
    onError: () => toast.error('Yükleme başarısız.'),
  })
  const deleteMutation = useMutation({
    mutationFn: (id) => imageCardsAPI.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['image-cards-trainer'] }); toast.success('Kart silindi.') },
  })

  const handleImgChange = (e) => {
    const f = e.target.files[0]; if (!f) return
    setImgFile(f); setPreview(URL.createObjectURL(f))
  }
  const handleUpload = () => {
    if (!form.title || !imgFile) return toast.error('Başlık ve görsel zorunludur.')
    const fd = new FormData()
    fd.append('title', form.title); fd.append('description', form.description); fd.append('image', imgFile)
    if (form.course) fd.append('course', form.course)
    if (form.chapter) fd.append('chapter', form.chapter)
    uploadMutation.mutate(fd)
  }

  const statusLabel = { draft:'Taslak', pending:'Bekliyor', published:'Yayında', rejected:'Reddedildi' }

  return (
    <>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:12 }}>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setUploadOpen(true)}>+ Bilgi Kartı Ekle</button>
      </div>
      <FilterBar searchPlaceholder="Kart ara..." onSearch={setSearch} />

      {/* Upload Modal */}
      {uploadOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:100,
          display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={e => { if (e.target===e.currentTarget) setUploadOpen(false) }}>
          <div style={{ background:'var(--card)', border:'1px solid var(--border)',
            borderRadius:20, padding:28, width:460, maxWidth:'95vw', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ fontSize:15, fontWeight:800, color:'var(--t1)', marginBottom:20 }}>🖼️ Bilgi Kartı Ekle</div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Başlık *</label>
              <input className={styles.formInput} value={form.title}
                onChange={e => setForm(f=>({...f,title:e.target.value}))} placeholder="Kart başlığı" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Açıklama</label>
              <textarea className={styles.formInput} rows={3} value={form.description}
                onChange={e => setForm(f=>({...f,description:e.target.value}))} placeholder="Görselin açıklaması / arka yüz bilgisi" />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
              <div className={styles.formGroup} style={{ marginBottom:0 }}>
                <label className={styles.formLabel}>Ders</label>
                <select className={styles.formInput} value={form.course}
                  onChange={e => setForm(f=>({...f,course:e.target.value,chapter:''}))}>
                  <option value="">Seçiniz</option>
                  {courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className={styles.formGroup} style={{ marginBottom:0 }}>
                <label className={styles.formLabel}>Bölüm</label>
                <select className={styles.formInput} value={form.chapter}
                  onChange={e => setForm(f=>({...f,chapter:e.target.value}))} disabled={!chapters.length}>
                  <option value="">Seçiniz</option>
                  {chapters.map(ch=><option key={ch.id} value={ch.id}>{ch.name}</option>)}
                </select>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Görsel *</label>
              <input ref={imgRef} type="file" style={{ display:'none' }}
                accept=".jpg,.jpeg,.png,.gif,.webp" onChange={handleImgChange} />
              <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => imgRef.current.click()}>🖼️ Görsel Seç</button>
                {imgFile && <span style={{ fontSize:11, color:'var(--t3)' }}>{imgFile.name}</span>}
              </div>
              {preview && (
                <div style={{ marginTop:12, borderRadius:12, overflow:'hidden', maxHeight:200 }}>
                  <img src={preview} alt="önizleme" style={{ width:'100%', height:200, objectFit:'cover', display:'block' }} />
                </div>
              )}
            </div>
            <div style={{ fontSize:10, color:'var(--t3)', marginTop:8, padding:'8px 10px',
              background:'rgba(251,191,36,.08)', borderRadius:8, border:'1px solid rgba(251,191,36,.2)' }}>
              ⚠️ Yüklediğin kartlar admin onayından sonra yayına alınacak.
            </div>
            <div style={{ display:'flex', gap:10, marginTop:16 }}>
              <button className={`${styles.btn} ${styles.btnOutline}`} style={{ flex:1 }}
                onClick={() => { setUploadOpen(false); setPreview(null) }}>İptal</button>
              <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ flex:1 }}
                onClick={handleUpload} disabled={uploadMutation.isPending}>
                {uploadMutation.isPending ? 'Yükleniyor...' : 'Gönder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div style={{ textAlign:'center', padding:40, color:'var(--t3)' }}>Yükleniyor...</div>
      ) : imgCards.length === 0 ? (
        <div style={{ textAlign:'center', padding:60 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🖼️</div>
          <div style={{ fontSize:14, fontWeight:700, color:'var(--t1)', marginBottom:6 }}>Henüz bilgi kartın yok</div>
          <div style={{ fontSize:11, color:'var(--t3)', marginBottom:20 }}>
            Görselli hafıza kartları ekleyerek öğrencilere yardımcı ol
          </div>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setUploadOpen(true)}>+ İlk Kartını Ekle</button>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:14 }}>
          {imgCards.map(card => {
            const sc = STATUS_COLORS[card.status] || STATUS_COLORS.draft
            return (
              <div key={card.id} className={styles.card} style={{ padding:0, overflow:'hidden' }}>
                <div style={{ width:'100%', aspectRatio:'4/3', overflow:'hidden', background:'var(--border)' }}>
                  {card.image_url
                    ? <img src={card.image_url} alt={card.title}
                        style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                    : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center',
                        justifyContent:'center', fontSize:36, color:'var(--t3)' }}>🖼️</div>
                  }
                </div>
                <div style={{ padding:'12px 12px 10px' }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'var(--t1)', lineHeight:1.3, marginBottom:6 }}>{card.title}</div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ padding:'2px 8px', borderRadius:6, fontSize:9, fontWeight:700,
                      background:sc.bg, color:sc.color }}>{statusLabel[card.status]}</span>
                    <button className={styles.ra} title="Sil" style={{ color:'#FF8090' }}
                      onClick={() => { if (window.confirm('Sil?')) deleteMutation.mutate(card.id) }}>🗑</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function TrainerLibrary() {
  const [activeTab, setActiveTab] = useState('docs')

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesAPI.list().then(r => r.data?.results ?? r.data),
  })

  return (
    <div>
      <PageTopbar title="Kaynak Kütüphanem" subtitle="Döküman ve bilgi kartlarını yönet" />
      <SubTabs active={activeTab} onChange={setActiveTab} />
      {activeTab === 'docs'
        ? <DocumentsTab courses={courses} />
        : <ImageCardsTab courses={courses} />
      }
    </div>
  )
}
