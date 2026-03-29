import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { reportsAPI, notificationsAPI, usersAPI } from '../../api/client'
import { KpiCard, ThemeToggle, Badge, DropdownMenu, Modal } from '../../components/shared'
import styles from '../../styles/shared.module.css'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [announcOpen, setAnnouncOpen] = useState(false)
  const [announcForm, setAnnouncForm] = useState({ title:'', body:'' })

  const { data: report } = useQuery({
    queryKey: ['reports'],
    queryFn: () => reportsAPI.get().then(r => r.data),
  })

  const { data: recentUsers = [] } = useQuery({
    queryKey: ['recent-users'],
    queryFn: () => usersAPI.list({ ordering:'-date_joined' }).then(r => {
      const list = r.data?.results ?? r.data ?? []
      return list.slice(0, 4)
    }),
  })

  const announcMut = useMutation({
    mutationFn: (data) => notificationsAPI.send(data),
    onSuccess: () => {
      toast.success('Duyuru gönderildi.')
      setAnnouncOpen(false)
      setAnnouncForm({ title:'', body:'' })
    },
    onError: () => toast.error('Gönderme başarısız.'),
  })

  const downloadReport = (format) => {
    toast.success(`${format.toUpperCase()} raporu hazırlanıyor...`)
    // Trigger download via backend endpoint when implemented
    reportsAPI.get({ format }).catch(() => {})
  }

  return (
    <div>
      <div className={styles.topbar}>
        <div>
          <div className={styles.pageTitle}>Dashboard</div>
          <div className={styles.pageSub}>Hoş geldin — işte bugünkü genel durum</div>
        </div>
        <div className={styles.topbarRight}>
          <DropdownMenu items={[
            { icon:'📄', label:'PDF İndir',   onClick: () => downloadReport('pdf') },
            { icon:'📊', label:'Excel İndir', onClick: () => downloadReport('excel') },
          ]}>
            <button className={`${styles.btn} ${styles.btnOutline}`}>📥 Rapor İndir</button>
          </DropdownMenu>
          <button className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => setAnnouncOpen(true)}>
            + Duyuru Ekle
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* KPI */}
      <div className={`${styles.kpiRow} ${styles.c4}`}>
        <KpiCard icon={<span>👥</span>} value={report?.total_users ?? '1.284'} label="Toplam Kullanıcı" change="↑ %12" changeType="up" />
        <KpiCard icon={<span>💰</span>} value="₺48.290" label="Aylık Gelir" change="↑ %8" changeType="up" />
        <KpiCard icon={<span>🃏</span>} value={report?.total_cards ?? '5.847'} label="Aktif Flashcard" change="↑ %24" changeType="up" />
        <KpiCard icon={<span>🎯</span>} value={`%${report?.avg_quiz_score ?? 68}`} label="Ort. Quiz Başarısı" change="↓ %3" changeType="dn" />
      </div>

      {/* Grafikler */}
      <div className={styles.grid2}>
        <div className={styles.card}>
          <div style={{ fontSize:13, fontWeight:800, color:'var(--t1)', marginBottom:4 }}>Aylık Gelir Trendi</div>
          <div style={{ fontSize:10, color:'var(--t3)', marginBottom:16 }}>Son 7 ay — TL cinsinden</div>
          <svg viewBox="0 0 400 120" style={{ width:'100%', height:120 }}>
            <defs>
              <linearGradient id="gr1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#00AADD" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#00AADD" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <line x1="0" y1="30"  x2="400" y2="30"  stroke="var(--border)" strokeWidth="0.5"/>
            <line x1="0" y1="70"  x2="400" y2="70"  stroke="var(--border)" strokeWidth="0.5"/>
            <line x1="0" y1="110" x2="400" y2="110" stroke="var(--border)" strokeWidth="0.5"/>
            <path d="M20 110 L83 95 L146 80 L209 65 L272 48 L335 35 L398 22"
              fill="none" stroke="#00AADD" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 110 L83 95 L146 80 L209 65 L272 48 L335 35 L398 22 L398 115 L20 115Z"
              fill="url(#gr1)"/>
            {['Eyl','Eki','Kas','Ara','Oca','Şub','Mar'].map((m, i) => (
              <text key={m} x={20 + i * 63} y="130" fontSize="9" fill="var(--t3)"
                textAnchor="middle" fontFamily="Montserrat">{m}</text>
            ))}
          </svg>
        </div>

        <div className={styles.card}>
          <div style={{ fontSize:13, fontWeight:800, color:'var(--t1)', marginBottom:14 }}>Ders Dağılımı</div>
          {[
            { name:'Periodontoloji', pct:28, color:'#00AADD' },
            { name:'Endodonti',      pct:22, color:'#A78BFA' },
            { name:'Anatomi',        pct:18, color:'#10B981' },
            { name:'Ortodonti',      pct:16, color:'#F5C842' },
            { name:'Diğer',          pct:16, color:'#E05070' },
          ].map(item => (
            <div key={item.name} className={styles.hbar}>
              <div className={styles.hbarLabel}>{item.name}</div>
              <div className={styles.hbarTrack}>
                <div className={styles.hbarFill} style={{ width:`${item.pct}%`, background:item.color }}/>
              </div>
              <div className={styles.hbarVal}>%{item.pct}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Son kayıtlar & aktivite */}
      <div className={styles.grid2}>
        <div className={styles.card}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:800, color:'var(--t1)' }}>Son Kayıtlar</div>
            <span style={{ fontSize:10, fontWeight:700, color:'#00AADD', cursor:'pointer' }}
              onClick={() => navigate('/admin/users')}>Tümünü gör →</span>
          </div>
          {recentUsers.length === 0 ? (
            <div style={{ textAlign:'center', padding:16, color:'var(--t3)', fontSize:11 }}>Yükleniyor...</div>
          ) : recentUsers.map((u, idx) => {
            const GRADS = [
              'linear-gradient(135deg,#00AADD,#0055AA)',
              'linear-gradient(135deg,#A78BFA,#7C3AED)',
              'linear-gradient(135deg,#10B981,#059669)',
              'linear-gradient(135deg,#F5C842,#D97706)',
            ]
            const name = u.full_name || `${u.first_name} ${u.last_name}`
            const initials = name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()
            const statusColor = u.subscription === 'pro' ? 'blue' : u.subscription === 'trial' ? 'yellow' : 'green'
            const statusText  = u.subscription === 'pro' ? 'Pro' : u.subscription === 'trial' ? 'Trial' : 'Aktif'
            const when = (() => {
              const d = new Date(u.date_joined)
              const diff = Date.now() - d.getTime()
              if (diff < 60000) return 'Az önce'
              if (diff < 3600000) return `${Math.floor(diff/60000)} dk`
              if (diff < 86400000) return `${Math.floor(diff/3600000)} sa`
              return `${Math.floor(diff/86400000)} gün`
            })()
            return (
              <div key={u.id} style={{ display:'flex', alignItems:'center', gap:10,
                padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                <div style={{ width:30, height:30, borderRadius:'50%', background:GRADS[idx%4],
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:10, fontWeight:800, color:'white', flexShrink:0 }}>{initials}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'var(--t1)' }}>{name}</div>
                  <div style={{ fontSize:10, color:'var(--t3)' }}>{u.email} · {when} önce</div>
                </div>
                <Badge color={statusColor}>{statusText}</Badge>
              </div>
            )
          })}
        </div>

        <div className={styles.card}>
          <div style={{ fontSize:13, fontWeight:800, color:'var(--t1)', marginBottom:14 }}>Son Aktiviteler</div>
          {[
            { icon:'✅', text:'Dr. Zeynep Şahin platforma kayıt oldu', time:'2 dk önce' },
            { icon:'✨', text:'Dr. Mehmet Kaya 24 yeni flashcard ekledi', time:'18 dk önce' },
            { icon:'💬', text:'Ayşe Yıldırım eğitmene soru sordu', time:'1 sa önce' },
            { icon:'📊', text:'Aylık gelir raporu oluşturuldu — ₺48.290', time:'3 sa önce' },
            { icon:'🔔', text:'DUS sınav hatırlatma bildirimi 847 kişiye gönderildi', time:'5 sa önce' },
          ].map((act, i) => (
            <div key={i} style={{ display:'flex', gap:10, padding:'9px 0',
              borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width:28, height:28, borderRadius:8, display:'flex', alignItems:'center',
                justifyContent:'center', background:'var(--input)', fontSize:13, flexShrink:0 }}>{act.icon}</div>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--t1)', lineHeight:1.5 }}>{act.text}</div>
                <div style={{ fontSize:9, color:'var(--t3)' }}>{act.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ANNOUNCEMENT MODAL ── */}
      <Modal open={announcOpen} onClose={() => setAnnouncOpen(false)} title="Duyuru Ekle" width={480}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Başlık *</label>
          <input className={styles.formInput} value={announcForm.title}
            onChange={e => setAnnouncForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Duyuru başlığı" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Mesaj *</label>
          <textarea className={styles.formInput} rows={4} value={announcForm.body}
            onChange={e => setAnnouncForm(f => ({ ...f, body: e.target.value }))}
            placeholder="Duyuru içeriği..." style={{ resize:'none' }} />
        </div>
        <div style={{ display:'flex', gap:10, marginTop:4 }}>
          <button className={`${styles.btn} ${styles.btnOutline}`} style={{ flex:1 }}
            onClick={() => setAnnouncOpen(false)}>İptal</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ flex:1 }}
            onClick={() => {
              if (!announcForm.title.trim() || !announcForm.body.trim())
                return toast.error('Başlık ve mesaj zorunludur.')
              announcMut.mutate({ ...announcForm, target:'all', notification_type:'inapp' })
            }}
            disabled={announcMut.isPending}>
            {announcMut.isPending ? 'Gönderiliyor...' : 'Duyuruyu Gönder'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
