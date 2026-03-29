import { useState, useRef, useEffect } from 'react'
import { PageTopbar, Badge } from '../../components/shared'
import { questionsAPI } from '../../api/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import styles from '../../styles/shared.module.css'
import toast from 'react-hot-toast'

const TAG_COLOR = { Acil:'red', Teknik:'blue', İade:'yellow', İçerik:'blue', Çözüldü:'green' }

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#00AADD,#0055AA)',
  'linear-gradient(135deg,#A78BFA,#7C3AED)',
  'linear-gradient(135deg,#10B981,#059669)',
  'linear-gradient(135deg,#F5C842,#D97706)',
  'linear-gradient(135deg,#E05070,#9D174D)',
]

function initials(name = '') { return name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase() }
function avatarGrad(i) { return AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length] }

export default function SupportMessages() {
  const qc = useQueryClient()
  const [activeId, setActiveId] = useState(null)
  const [text,     setText]     = useState('')
  const [localMsgs, setLocalMsgs] = useState({})
  const bottomRef = useRef(null)

  // Fetch open questions as conversations
  const { data: questions = [] } = useQuery({
    queryKey: ['support-questions'],
    queryFn: () => questionsAPI.list().then(r => r.data?.results ?? r.data),
  })

  const active = questions.find(q => q.id === activeId) ?? questions[0]

  useEffect(() => {
    if (questions.length && !activeId) setActiveId(questions[0]?.id)
  }, [questions])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [localMsgs, activeId])

  const answerMut = useMutation({
    mutationFn: ({ id, answer_text }) => questionsAPI.answer(id, { answer_text }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['support-questions'] })
      toast.success('Cevap gönderildi.')
    },
    onError: () => toast.error('Gönderilemedi.'),
  })

  const resolveMut = useMutation({
    mutationFn: (id) => questionsAPI.answer(id, { status: 'resolved' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['support-questions'] })
      toast.success('Çözüldü olarak işaretlendi.')
    },
    onError: () => toast.error('İşlem başarısız.'),
  })

  const forwardMut = useMutation({
    mutationFn: (id) => questionsAPI.answer(id, { forwarded: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['support-questions'] })
      toast.success('Admin\'e iletildi.')
    },
    onError: () => toast.error('İşlem başarısız.'),
  })

  const send = () => {
    if (!text.trim() || !active) return
    const newMsg = { from:'me', text, time:'Şimdi' }
    setLocalMsgs(m => ({ ...m, [active.id]: [...(m[active.id] ?? []), newMsg] }))
    answerMut.mutate({ id: active.id, answer_text: text })
    setText('')
  }

  // If no real questions, show placeholder
  const hasQuestions = questions.length > 0

  return (
    <div>
      <PageTopbar title="Mesajlar & Sorular" subtitle={`${questions.filter(q => q.status !== 'answered').length} açık soru`}/>
      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:0,
        height:'calc(100vh - 140px)', borderRadius:16, overflow:'hidden', border:'1px solid var(--border)' }}>

        {/* Conversation list */}
        <div style={{ borderRight:'1px solid var(--border)', overflowY:'auto', background:'var(--card)' }}>
          <div style={{ padding:'12px 14px', borderBottom:'1px solid var(--border)',
            display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontSize:13, fontWeight:800, color:'var(--t1)' }}>Sorular</div>
          </div>
          {!hasQuestions ? (
            <div style={{ padding:20, textAlign:'center', color:'var(--t3)', fontSize:12 }}>
              Bekleyen soru yok
            </div>
          ) : questions.map((q, i) => {
            const name = q.asked_by_name || q.user_name || 'Kullanıcı'
            const isActive = active?.id === q.id
            return (
              <div key={q.id} onClick={() => setActiveId(q.id)}
                style={{ padding:'12px 14px', cursor:'pointer', borderBottom:'1px solid var(--border)',
                  background: isActive ? 'rgba(245,200,66,.07)' : 'transparent',
                  borderLeft: isActive ? '3px solid #F5C842' : '3px solid transparent',
                  transition:'all .15s' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
                  <div style={{ width:30, height:30, borderRadius:'50%', background:avatarGrad(i),
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:10, fontWeight:800, color:'white', flexShrink:0 }}>
                    {initials(name)}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight: q.status !== 'answered' ? 700 : 600,
                      color:'var(--t1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {name}
                    </div>
                    <div style={{ fontSize:9, color:'var(--t3)', marginTop:2 }}>
                      {q.status === 'answered' ? 'Cevaplandı' :
                       q.status === 'resolved' ? 'Çözüldü' : 'Bekliyor'}
                    </div>
                  </div>
                  <div style={{ fontSize:9, color:'var(--t3)', flexShrink:0 }}>
                    {q.created_at ? new Date(q.created_at).toLocaleDateString('tr-TR') : ''}
                  </div>
                  {q.status === 'new' && (
                    <div style={{ width:7, height:7, borderRadius:'50%', background:'#00AADD', flexShrink:0 }}/>
                  )}
                </div>
                <div style={{ fontSize:11, color:'var(--t3)', overflow:'hidden',
                  textOverflow:'ellipsis', whiteSpace:'nowrap', paddingLeft:38 }}>
                  {q.question_text || q.text || q.body || '(soru)'}
                </div>
              </div>
            )
          })}
        </div>

        {/* Chat panel */}
        <div style={{ display:'flex', flexDirection:'column', background:'var(--bg)' }}>
          {!active ? (
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center',
              color:'var(--t3)', fontSize:13 }}>
              Bir soru seçin
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)',
                display:'flex', alignItems:'center', gap:12, background:'var(--card)' }}>
                <div style={{ width:34, height:34, borderRadius:'50%',
                  background:avatarGrad(questions.indexOf(active)),
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:11, fontWeight:800, color:'white' }}>
                  {initials(active.asked_by_name || active.user_name || 'K')}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--t1)' }}>
                    {active.asked_by_name || active.user_name || 'Kullanıcı'}
                  </div>
                  <div style={{ fontSize:10, color:'var(--t3)' }}>
                    {active.course_name || 'Soru'}
                  </div>
                </div>
                <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
                  <button className={styles.ra} title="Admin'e İlet"
                    onClick={() => forwardMut.mutate(active.id)}
                    disabled={forwardMut.isPending}>📤</button>
                  <button className={`${styles.btn} ${styles.btnSuccess}`}
                    style={{ padding:'6px 12px' }}
                    onClick={() => resolveMut.mutate(active.id)}
                    disabled={resolveMut.isPending || active.status === 'resolved'}>
                    ✓ Çözüldü
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex:1, overflowY:'auto', padding:16,
                display:'flex', flexDirection:'column', gap:10 }}>
                {/* Original question */}
                <div style={{ alignSelf:'flex-start', maxWidth:'75%' }}>
                  <div style={{ padding:'10px 14px', borderRadius:'4px 14px 14px 14px',
                    fontSize:12, fontWeight:500, lineHeight:1.6,
                    background:'var(--card)', border:'1px solid var(--border)', color:'var(--t1)' }}>
                    {active.question_text || active.text || active.body || '(soru metni)'}
                  </div>
                  <div style={{ fontSize:9, color:'var(--t3)', marginTop:3 }}>
                    {active.created_at ? new Date(active.created_at).toLocaleString('tr-TR') : ''}
                  </div>
                </div>
                {/* Answer if exists */}
                {active.answer_text && (
                  <div style={{ alignSelf:'flex-end', maxWidth:'75%' }}>
                    <div style={{ padding:'10px 14px', borderRadius:'14px 4px 14px 14px',
                      fontSize:12, fontWeight:500, lineHeight:1.6,
                      background:'linear-gradient(135deg,#0088BB,#00AADD)', color:'white' }}>
                      {active.answer_text}
                    </div>
                  </div>
                )}
                {/* Local sent messages */}
                {(localMsgs[active.id] ?? []).map((m, i) => (
                  <div key={i} style={{ alignSelf:'flex-end', maxWidth:'75%' }}>
                    <div style={{ padding:'10px 14px', borderRadius:'14px 4px 14px 14px',
                      fontSize:12, fontWeight:500, lineHeight:1.6,
                      background:'linear-gradient(135deg,#0088BB,#00AADD)', color:'white' }}>
                      {m.text}
                    </div>
                    <div style={{ fontSize:9, color:'var(--t3)', marginTop:3, textAlign:'right' }}>{m.time}</div>
                  </div>
                ))}
                <div ref={bottomRef}/>
              </div>

              {/* Input */}
              <div style={{ padding:'12px 14px', borderTop:'1px solid var(--border)',
                display:'flex', gap:10, alignItems:'flex-end', background:'var(--card)' }}>
                <textarea value={text} onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                  style={{ flex:1, padding:'10px 12px', borderRadius:12, fontFamily:'Montserrat',
                    fontSize:12, fontWeight:500, color:'var(--t1)', outline:'none',
                    background:'var(--input)', border:'1px solid var(--inputborder)', resize:'none', maxHeight:100 }}
                  rows={1} placeholder="Cevap yazın... (Enter ile gönder)" />
                <button onClick={send} disabled={answerMut.isPending}
                  style={{ width:38, height:38, borderRadius:'50%',
                    background:'linear-gradient(135deg,#0088BB,#00AADD)', border:'none', cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center', color:'white', flexShrink:0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
