import { useState } from 'react'
import { PageTopbar } from '../../components/shared'
import { notificationsAPI } from '../../api/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import styles from '../../styles/shared.module.css'
import toast from 'react-hot-toast'

export default function AdminNotifications() {
  const qc = useQueryClient()
  const [title,  setTitle]  = useState('YKS\'ye 127 gün kaldı! 🔥')
  const [body,   setBody]   = useState('Bugün çalışmadın! Hedefine ulaşmak için hemen başla.')
  const [target, setTarget] = useState('all')
  const [type,   setType]   = useState('push')

  const { data: history = [] } = useQuery({
    queryKey: ['notification-history'],
    queryFn: () => notificationsAPI.list().then(r => r.data?.results ?? r.data),
  })

  const sendMut = useMutation({
    mutationFn: (data) => notificationsAPI.send(data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['notification-history'] })
      const targetLabel = { all:'tüm', customer:'müşteri', trainer:'eğitmen', trial:'trial' }
      toast.success(`📣 Bildirim ${targetLabel[vars.target] || vars.target} kullanıcılara gönderildi!`)
      setTitle('')
      setBody('')
    },
    onError: () => toast.error('Gönderme başarısız.'),
  })

  const handleSend = () => {
    if (!title.trim() || !body.trim()) return toast.error('Başlık ve mesaj gerekli')
    sendMut.mutate({ title, body, target, notification_type: type })
  }

  return (
    <div>
      <PageTopbar title="Bildirim & Duyuru" subtitle="Kullanıcılara bildirim ve duyuru gönder"/>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        {/* Compose */}
        <div className={styles.card}>
          <div style={{ fontSize:13, fontWeight:800, color:'var(--t1)', marginBottom:16 }}>📣 Yeni Bildirim Oluştur</div>

          <div style={{ marginBottom:14 }}>
            <label className={styles.formLabel}>Hedef Kitle</label>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {[['all','Tüm Kullanıcılar'],['customer','Müşteriler'],['trainer','Eğitmenler'],['trial','Trial']].map(([v,l]) => (
                <div key={v} onClick={() => setTarget(v)}
                  style={{ padding:'6px 12px', borderRadius:8, cursor:'pointer', fontSize:11, fontWeight:700, transition:'all .15s',
                    background: target === v ? 'linear-gradient(135deg,#0088BB,#00AADD)' : 'var(--input)',
                    border: target === v ? 'none' : '1px solid var(--border)',
                    color: target === v ? 'white' : 'var(--t2)' }}>
                  {l}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom:14 }}>
            <label className={styles.formLabel}>Bildirim Türü</label>
            <div style={{ display:'flex', gap:8 }}>
              {[['push','📱 Push'],['email','✉️ E-posta'],['inapp','💬 In-App']].map(([v,l]) => (
                <div key={v} onClick={() => setType(v)}
                  style={{ flex:1, padding:8, borderRadius:8, cursor:'pointer', fontSize:11, fontWeight:700,
                    textAlign:'center',
                    background: type === v ? 'linear-gradient(135deg,#7C3AED,#A78BFA)' : 'var(--input)',
                    border: type === v ? 'none' : '1px solid var(--border)',
                    color: type === v ? 'white' : 'var(--t2)' }}>
                  {l}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom:12 }}>
            <label className={styles.formLabel}>Başlık</label>
            <input className={styles.formInput} value={title}
              onChange={e => setTitle(e.target.value)} placeholder="Bildirim başlığı..."/>
          </div>

          <div style={{ marginBottom:18 }}>
            <label className={styles.formLabel}>Mesaj</label>
            <textarea className={styles.formInput} rows={4} value={body}
              onChange={e => setBody(e.target.value)} style={{ resize:'none' }}
              placeholder="Mesaj içeriği..."/>
          </div>

          <button className={`${styles.btn} ${styles.btnPrimary}`}
            style={{ width:'100%', justifyContent:'center', padding:12, fontSize:13 }}
            onClick={handleSend} disabled={sendMut.isPending}>
            {sendMut.isPending ? '📤 Gönderiliyor...' : 'Gönder →'}
          </button>
        </div>

        {/* History */}
        <div className={styles.card}>
          <div style={{ fontSize:13, fontWeight:800, color:'var(--t1)', marginBottom:16 }}>📋 Gönderim Geçmişi</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {history.length === 0 ? (
              <div style={{ textAlign:'center', padding:20, color:'var(--t3)', fontSize:12 }}>Henüz bildirim gönderilmedi</div>
            ) : history.map((h, i) => (
              <div key={h.id ?? i} style={{ padding:12, borderRadius:12, background:'var(--hover)', border:'1px solid var(--border)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:'var(--t1)' }}>{h.title}</span>
                  <span style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:6,
                    background: h.status === 'sent' ? 'rgba(16,185,129,.15)' : 'rgba(245,200,66,.15)',
                    color: h.status === 'sent' ? '#10B981' : '#F5C842' }}>
                    {h.status === 'sent' ? 'Başarılı' : 'Bekliyor'}
                  </span>
                </div>
                <div style={{ fontSize:10, color:'var(--t3)', marginBottom:6 }}>
                  {h.target} · {h.notification_type ?? h.type} ·{' '}
                  {h.created_at ? new Date(h.created_at).toLocaleString('tr-TR') : ''}
                </div>
                {h.sent_count != null && (
                  <div style={{ display:'flex', gap:12, fontSize:10, fontWeight:600 }}>
                    <span style={{ color:'#00AADD' }}>📤 {h.sent_count} gönderildi</span>
                    {h.read_rate != null && <span style={{ color:'#10B981' }}>✅ %{h.read_rate} okundu</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
