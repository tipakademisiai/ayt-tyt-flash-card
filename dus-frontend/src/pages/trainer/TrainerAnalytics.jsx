import { PageTopbar, KpiCard } from '../../components/shared'
import styles from '../../styles/shared.module.css'
import toast from 'react-hot-toast'

const ERROR_CARDS = [
  { name:'Türkçe — Paragraf anlam soruları', pct:68, color:'#E05070' },
  { name:'Matematik (TYT) — Problemler',     pct:61, color:'#E05070' },
  { name:'Fen Bilimleri — Kimya denklemleri', pct:54, color:'#F5C842' },
  { name:'AYT Matematik — Türev uygulaması',  pct:48, color:'#F5C842' },
  { name:'Sosyal Bilimler — Felsefe',         pct:32, color:'#10B981' },
]

export default function TrainerAnalytics() {
  return (
    <div>
      <PageTopbar title="Branş Analitiği" subtitle="TYT/AYT — öğrenci performansı ve içerik istatistikleri">
        <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => toast('Rapor indiriliyor...')}>📥 Rapor</button>
      </PageTopbar>

      <div className={`${styles.kpiRow} ${styles.c3}`}>
        <KpiCard icon="👥" value="360"   label="Aktif Öğrencim"   change="+24"   changeType="up"/>
        <KpiCard icon="🃏" value="48.2K" label="Toplam Çalışma"   change="↑ %31" changeType="up"/>
        <KpiCard icon="📈" value="%78"   label="Ort. Başarı Oranı" change="↑ %8"  changeType="up"/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        <div className={styles.card}>
          <div style={{fontSize:13,fontWeight:800,color:'var(--t1)',marginBottom:14}}>En Çok Hata Yapılan Kartlar</div>
          {ERROR_CARDS.map((c,i) => (
            <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
              <div style={{flex:1,fontSize:11,fontWeight:600,color:'var(--t2)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name}</div>
              <span style={{fontWeight:700,color:c.color,flexShrink:0}}>%{c.pct}</span>
            </div>
          ))}
          <div style={{marginTop:8,padding:10,borderRadius:10,background:'rgba(224,80,112,.08)',border:'1px solid rgba(224,80,112,.15)'}}>
            <div style={{fontSize:11,fontWeight:600,color:'var(--t1)',marginBottom:4}}>💡 Öneri</div>
            <div style={{fontSize:10,color:'var(--t3)'}}>Türkçe paragraf anlam sorularını güncelle ve örnek açıklama ekle</div>
          </div>
        </div>

        <div className={styles.card}>
          <div style={{fontSize:13,fontWeight:800,color:'var(--t1)',marginBottom:14}}>Bu Ayki Komisyon</div>
          <div style={{fontSize:28,fontWeight:900,color:'#10B981',marginBottom:4}}>₺9.658</div>
          <div style={{fontSize:11,color:'var(--t3)',marginBottom:18}}>%20 komisyon oranı · Mart 2026</div>
          {[
            { label:'Başlangıç planı öğrencileri', amount:'₺5.240' },
            { label:'Pro planı öğrencileri',      amount:'₺3.180' },
            { label:'AYT/TYT Kombo',              amount:'₺1.238' },
          ].map((r,i) => (
            <div key={i} style={{display:'flex',justifyContent:'space-between',
              padding:'9px 0',borderBottom:i<2?'1px solid var(--border)':'none'}}>
              <span style={{fontSize:11,color:'var(--t2)'}}>{r.label}</span>
              <span style={{fontSize:11,fontWeight:700,color:'var(--t1)'}}>{r.amount}</span>
            </div>
          ))}
          <div style={{display:'flex',justifyContent:'space-between',padding:'9px 0',
            borderTop:'1px solid var(--border)',marginTop:4}}>
            <span style={{fontSize:12,fontWeight:700,color:'var(--t1)'}}>Toplam</span>
            <span style={{fontSize:13,fontWeight:800,color:'#10B981'}}>₺9.658</span>
          </div>
          <button className={`${styles.btn} ${styles.btnSuccess}`}
            style={{width:'100%',justifyContent:'center',marginTop:14}}
            onClick={() => toast('Ödeme talebi oluşturuldu')}>
            Ödeme Talep Et
          </button>
        </div>
      </div>
    </div>
  )
}
