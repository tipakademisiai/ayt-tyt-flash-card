import { useState } from 'react'
import { PageTopbar, Badge } from '../../components/shared'
import { questionsAPI } from '../../api/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import styles from '../../styles/shared.module.css'
import toast from 'react-hot-toast'

const STATUS_FILTER = [
  { value:'',         label:'Tüm Durumlar' },
  { value:'pending',  label:'Bekliyor' },
  { value:'answered', label:'Cevaplandı' },
]

function initials(name = '') {
  return name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#00AADD,#0055AA)',
  'linear-gradient(135deg,#A78BFA,#7C3AED)',
  'linear-gradient(135deg,#10B981,#059669)',
  'linear-gradient(135deg,#F5C842,#F59E0B)',
  'linear-gradient(135deg,#E05070,#B91C4C)',
]

export default function TrainerQuestions() {
  const qc = useQueryClient()
  const [filterStatus, setFilterStatus] = useState('')
  const [answers, setAnswers] = useState({})

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['trainer-questions', filterStatus],
    queryFn: () => questionsAPI.list({ status: filterStatus || undefined })
      .then(r => r.data?.results ?? r.data),
  })

  const answerMut = useMutation({
    mutationFn: ({ id, answer_text }) => questionsAPI.answer(id, { answer_text }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['trainer-questions'] })
      setAnswers(a => { const n = { ...a }; delete n[vars.id]; return n })
      toast.success('Cevap gönderildi.')
    },
    onError: () => toast.error('Gönderme başarısız.'),
  })

  const forwardMut = useMutation({
    mutationFn: (id) => questionsAPI.answer(id, { forwarded: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trainer-questions'] })
      toast.success('Soru yönlendirildi.')
    },
    onError: () => toast.error('Yönlendirme başarısız.'),
  })

  const handleAnswer = (id) => {
    const text = (answers[id] || '').trim()
    if (!text) return toast.error('Cevap boş olamaz.')
    answerMut.mutate({ id, answer_text: text })
  }

  return (
    <div>
      <PageTopbar title="Gelen Sorular"
        subtitle={`${questions.filter(q => q.status !== 'answered').length} cevaplanmamış soru`}>
        <select className={styles.fsel} value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}>
          {STATUS_FILTER.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </PageTopbar>

      {isLoading ? (
        <div style={{ textAlign:'center', padding:40, color:'var(--t3)' }}>Yükleniyor...</div>
      ) : questions.length === 0 ? (
        <div style={{ textAlign:'center', padding:40, color:'var(--t3)', fontSize:13 }}>
          Bekleyen soru yok
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {questions.map((q, i) => {
            const grad = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]
            const name = q.asked_by_name || q.user_name || 'Öğrenci'
            const isAnswered = q.status === 'answered'
            return (
              <div key={q.id} style={{ borderRadius:16, padding:18,
                background:'var(--card)',
                border: q.status === 'new' ? '1.5px solid rgba(0,170,221,.3)' :
                        isAnswered       ? '1px solid rgba(16,185,129,.2)' :
                        '1px solid var(--border)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:grad,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:10, fontWeight:800, color:'white', flexShrink:0 }}>
                    {initials(name)}
                  </div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:'var(--t1)' }}>{name}</div>
                    <div style={{ fontSize:10, color:'var(--t3)' }}>
                      {q.created_at ? new Date(q.created_at).toLocaleString('tr-TR') : ''}
                      {q.course_name ? ` · ${q.course_name}` : ''}
                    </div>
                  </div>
                  <div style={{ marginLeft:'auto' }}>
                    <Badge color={q.status === 'new' ? 'blue' : isAnswered ? 'green' : 'yellow'}>
                      {q.status === 'new' ? 'Yeni' : isAnswered ? 'Cevaplandı' : 'Bekliyor'}
                    </Badge>
                  </div>
                </div>

                <div style={{ fontSize:12, fontWeight:600, color:'var(--t1)', padding:12, borderRadius:10,
                  background:'var(--hover)', borderLeft:`3px solid ${q.status === 'new' ? '#00AADD' : '#A78BFA'}`,
                  marginBottom:12 }}>
                  {q.question_text || q.text || q.body || '(soru metni yok)'}
                </div>

                {isAnswered ? (
                  <div style={{ fontSize:11, fontWeight:500, color:'var(--t2)', padding:'10px 12px',
                    borderRadius:10, background:'rgba(16,185,129,.08)', border:'1px solid rgba(16,185,129,.15)' }}>
                    ✅ <strong>Cevabınız:</strong> {q.answer_text || q.answer}
                  </div>
                ) : (
                  <>
                    <textarea
                      className={styles.formInput}
                      rows={3} style={{ resize:'none', marginBottom:10 }}
                      placeholder="Cevabınızı yazın..."
                      value={answers[q.id] || ''}
                      onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                    />
                    <div style={{ display:'flex', gap:8 }}>
                      <button className={`${styles.btn} ${styles.btnPrimary}`}
                        style={{ flex:1, justifyContent:'center' }}
                        onClick={() => handleAnswer(q.id)}
                        disabled={answerMut.isPending}>
                        {answerMut.isPending ? 'Gönderiliyor...' : 'Cevapla & Gönder'}
                      </button>
                      <button className={`${styles.btn} ${styles.btnOutline}`}
                        onClick={() => forwardMut.mutate(q.id)}
                        disabled={forwardMut.isPending}>
                        Yönlendir
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
