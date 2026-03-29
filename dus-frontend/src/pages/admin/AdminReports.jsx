import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageTopbar, KpiCard } from '../../components/shared'
import { reportsAPI, activityAPI } from '../../api/client'
import styles from '../../styles/shared.module.css'
import toast from 'react-hot-toast'

const MONTHS = ['Eyl','Eki','Kas','Ara','Oca','Şub','Mar']

const COURSE_STATS = [
  { name:'Periodontoloji', pct:78, color:'linear-gradient(90deg,#0088BB,#00AADD)' },
  { name:'Endodonti',      pct:72, color:'linear-gradient(90deg,#7C3AED,#A78BFA)' },
  { name:'Anatomi',        pct:65, color:'linear-gradient(90deg,#059669,#10B981)' },
  { name:'Ortodonti',      pct:60, color:'linear-gradient(90deg,#D97706,#F5C842)' },
  { name:'Farmakoloji',    pct:52, color:'linear-gradient(90deg,#9D174D,#E05070)' },
  { name:'Mikrobiyoloji',  pct:48, color:'linear-gradient(90deg,#0055AA,#00AADD)' },
]

export default function AdminReports() {
  const [period, setPeriod] = useState('month')

  const { data: report } = useQuery({
    queryKey: ['reports', period],
    queryFn: () => reportsAPI.get({ period }).then(r => r.data),
  })

  const { data: actSummary } = useQuery({
    queryKey: ['activity-summary'],
    queryFn: () => activityAPI.summary().then(r => r.data),
  })

  // Plan breakdown from API
  const planBreakdown = report?.plan_breakdown ?? []
  const planMap = {}
  planBreakdown.forEach(p => { planMap[p.plan] = p.count })

  const REVENUE_PRICES = { pro:499, standart:449, baslangic:149 }
  const PLAN_LABELS    = { pro:'Pro', standart:'Standart', baslangic:'Başlangıç', trial:'Deneme' }
  const COMM_RATE      = 0.20

  const revenueRows = planBreakdown
    .filter(p => REVENUE_PRICES[p.plan])
    .map(p => {
      const price  = REVENUE_PRICES[p.plan] || 0
      const gross  = p.count * price
      const comm   = Math.round(gross * COMM_RATE)
      const net    = gross - comm
      return { plan: PLAN_LABELS[p.plan] || p.plan, count:p.count, gross, comm, net }
    })

  const totalGross = revenueRows.reduce((s,r) => s+r.gross, 0)
  const totalComm  = revenueRows.reduce((s,r) => s+r.comm, 0)
  const totalNet   = revenueRows.reduce((s,r) => s+r.net, 0)
  const totalCount = revenueRows.reduce((s,r) => s+r.count, 0)

  const fmtTL = (n) => n >= 1000 ? `₺${(n/1000).toFixed(1)}K` : `₺${n}`

  // Top actions from activity summary
  const topActions = actSummary?.actions?.slice(0,5) ?? []

  return (
    <div>
      <PageTopbar title="Raporlar & Analitik" subtitle="Platform geneli performans verileri">
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <select className={styles.formInput} style={{ padding:'6px 10px', fontSize:11, width:140 }}
            value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="week">Son 7 Gün</option>
            <option value="month">Son 30 Gün</option>
            <option value="quarter">Son 3 Ay</option>
          </select>
          <button className={`${styles.btn} ${styles.btnOutline}`}
            onClick={() => toast('PDF indiriliyor...')}>📥 PDF</button>
          <button className={`${styles.btn} ${styles.btnOutline}`}
            onClick={() => toast('Excel indiriliyor...')}>📊 Excel</button>
        </div>
      </PageTopbar>

      {/* KPI — Gerçek API verisi */}
      <div className={`${styles.kpiRow} ${styles.c5}`}>
        <KpiCard icon="👥" value={report?.total_users     ?? '—'} label="Toplam Kullanıcı"  change="↑ %12" changeType="up"/>
        <KpiCard icon="✅" value={report?.active_users    ?? '—'} label="Aktif Kullanıcı"   change="↑ %8"  changeType="up"/>
        <KpiCard icon="🃏" value={report?.total_cards     ?? '—'} label="Yayındaki Kart"    change="↑ %24" changeType="up"/>
        <KpiCard icon="🎯" value={`%${report?.avg_quiz_score ?? '—'}`} label="Quiz Başarısı" change="↑ %3"  changeType="up"/>
        <KpiCard icon="📊" value={report?.total_quizzes   ?? '—'} label="Toplam Quiz"       change="↑ %15" changeType="up"/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:18 }}>
        {/* Ders Başarı */}
        <div className={styles.card}>
          <div style={{ fontSize:13, fontWeight:800, color:'var(--t1)', marginBottom:4 }}>Ders Bazlı Başarı Oranı</div>
          <div style={{ fontSize:10, color:'var(--t3)', marginBottom:16 }}>Kullanıcıların ortalama quiz başarısı</div>
          {COURSE_STATS.map(c => (
            <div key={c.name} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:9 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--t2)', width:110, flexShrink:0 }}>{c.name}</div>
              <div style={{ flex:1, height:6, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
                <div style={{ width:`${c.pct}%`, height:'100%', background:c.color, borderRadius:99 }}/>
              </div>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--t1)', width:36, textAlign:'right' }}>%{c.pct}</div>
            </div>
          ))}
        </div>

        {/* Günlük Aktif Kullanıcı (görsel) */}
        <div className={styles.card}>
          <div style={{ fontSize:13, fontWeight:800, color:'var(--t1)', marginBottom:4 }}>Günlük Aktif Kullanıcı</div>
          <div style={{ fontSize:10, color:'var(--t3)', marginBottom:16 }}>Son 7 gün trendi</div>
          <svg viewBox="0 0 300 120" style={{ width:'100%', height:120 }}>
            <defs>
              <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00AADD" stopOpacity=".3"/>
                <stop offset="100%" stopColor="#00AADD" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <line x1="0" y1="20"  x2="300" y2="20"  stroke="var(--border)" strokeWidth=".5"/>
            <line x1="0" y1="60"  x2="300" y2="60"  stroke="var(--border)" strokeWidth=".5"/>
            <line x1="0" y1="100" x2="300" y2="100" stroke="var(--border)" strokeWidth=".5"/>
            <path d="M20 85 L63 70 L106 78 L149 55 L192 45 L235 30 L278 22"
              fill="none" stroke="#00AADD" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 85 L63 70 L106 78 L149 55 L192 45 L235 30 L278 22 L278 110 L20 110Z"
              fill="url(#g2)"/>
            <circle cx="278" cy="22" r="4" fill="#00AADD"/>
            {['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'].map((d,i) => (
              <text key={d} x={20+i*43} y="115" fontSize="8" fill="var(--t3)" textAnchor="middle" fontFamily="Montserrat">{d}</text>
            ))}
          </svg>
        </div>
      </div>

      {/* Eylem İstatistikleri — Gerçek activity log verisi */}
      {topActions.length > 0 && (
        <div className={styles.card} style={{ marginBottom:18 }}>
          <div style={{ fontSize:13, fontWeight:800, color:'var(--t1)', marginBottom:4 }}>
            🔥 Son 30 Gün — Kullanıcı Eylemleri
          </div>
          <div style={{ fontSize:10, color:'var(--t3)', marginBottom:14 }}>
            {actSummary?.unique_users ?? '—'} benzersiz kullanıcı · Son 30 gün
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:8 }}>
            {topActions.map((a, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10,
                padding:'10px 14px', background:'var(--input)', borderRadius:10,
                border:'1px solid var(--border)' }}>
                <div style={{ width:8, height:8, borderRadius:'50%',
                  background:`hsl(${i*60},65%,55%)`, flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:'var(--t1)' }}>{a.action}</div>
                </div>
                <div style={{ fontSize:13, fontWeight:800, color:'var(--t1)' }}>{a.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gelir Tablosu */}
      <div className={styles.card}>
        <div style={{ fontSize:13, fontWeight:800, color:'var(--t1)', marginBottom:16 }}>
          Gelir Detayı — {period === 'week' ? 'Son 7 Gün' : period === 'month' ? 'Son 30 Gün' : 'Son 3 Ay'}
        </div>
        {revenueRows.length === 0 ? (
          <div style={{ textAlign:'center', padding:24, color:'var(--t3)', fontSize:11 }}>
            Veri yükleniyor...
          </div>
        ) : (
          <table className={styles.tbl}>
            <thead>
              <tr><th>Paket</th><th>Abone</th><th>Brüt Gelir</th><th>Komisyon (%20)</th><th>Platform Geliri</th></tr>
            </thead>
            <tbody>
              {revenueRows.map((r,i) => (
                <tr key={i}>
                  <td style={{ fontWeight:700, color:'var(--t1)', fontSize:12 }}>{r.plan}</td>
                  <td>{r.count}</td>
                  <td style={{ fontWeight:700, color:'var(--t1)' }}>{fmtTL(r.gross)}</td>
                  <td style={{ color:'#A78BFA', fontWeight:700 }}>{fmtTL(r.comm)}</td>
                  <td style={{ color:'#10B981', fontWeight:700 }}>{fmtTL(r.net)}</td>
                </tr>
              ))}
              {revenueRows.length > 1 && (
                <tr style={{ fontWeight:800, background:'var(--input)' }}>
                  <td style={{ color:'var(--t1)', fontWeight:800 }}>TOPLAM</td>
                  <td style={{ fontWeight:800 }}>{totalCount}</td>
                  <td style={{ fontWeight:800, color:'var(--t1)' }}>{fmtTL(totalGross)}</td>
                  <td style={{ color:'#A78BFA', fontWeight:800 }}>{fmtTL(totalComm)}</td>
                  <td style={{ color:'#10B981', fontWeight:800 }}>{fmtTL(totalNet)}</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
