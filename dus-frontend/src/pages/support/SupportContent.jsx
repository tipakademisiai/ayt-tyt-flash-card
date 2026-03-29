import { KpiCard, PageTopbar, Badge, FilterBar } from '../../components/shared'
import styles from '../../styles/shared.module.css'
import toast from 'react-hot-toast'

const CARDS = [
  { q:'Baş-boyun anatomisi — sinir çıkış delikleri', course:'Anatomi',  trainer:'Dr. A. Yıldırım', status:'error',     usage:412 },
  { q:'Periodontitis tedavisinde ilk basamak',       course:'Perio',    trainer:'Dr. M. Kaya',     status:'published', usage:847 },
  { q:'Antibiyotik endikasyonları — güncel kılavuz', course:'Farma',    trainer:'Dr. S. Bayraktar', status:'update',    usage:234 },
  { q:'Pulpa anatomisi — kök kanal sayısı',          course:'Endo',     trainer:'Dr. H. Coşkun',   status:'pending',   usage:0 },
]

const STATUS_INFO = {
  published:{ color:'green',  label:'Yayında'           },
  error:    { color:'red',    label:'Hata Bildirimi'     },
  update:   { color:'orange', label:'Güncelleme Gerekli' },
  pending:  { color:'yellow', label:'Onay Bekliyor'      },
}

export default function SupportContent() {
  return (
    <div>
      <PageTopbar title="İçerik Yönetimi" subtitle="Tüm kartlar ve quizler — oluştur, düzenle, sil">
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => toast('Yeni içerik')}>+ Yeni İçerik</button>
      </PageTopbar>

      <div className={`${styles.kpiRow} ${styles.c4}`}>
        <KpiCard icon="🃏" value="5.847" label="Toplam Kart"      change="↑ %24" changeType="up"/>
        <KpiCard icon="🎯" value="284"   label="Toplam Quiz"      change="↑ %11" changeType="up"/>
        <KpiCard icon="⏳" value="42"    label="Onay Bekleyen"   />
        <KpiCard icon="🚨" value="7"     label="Hata Bildirilen" />
      </div>

      <div className={styles.card}>
        <FilterBar
          searchPlaceholder="Kart ara..."
          onSearch={() => {}}
          selects={[
            { options:['Tüm Dersler','Periodontoloji','Endodonti','Anatomi'], onChange:()=>{} },
            { options:['Tüm Durumlar','Yayında','Onay Bekliyor','Hata Bildirilen'], onChange:()=>{} },
          ]}
        />
        <table className={styles.tbl}>
          <thead><tr><th>İçerik</th><th>Ders</th><th>Eğitmen</th><th>Durum</th><th>Kullanım</th><th>İşlem</th></tr></thead>
          <tbody>
            {CARDS.map((c,i) => {
              const s = STATUS_INFO[c.status]
              return (
                <tr key={i}>
                  <td className={styles.t1} style={{maxWidth:220,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.q}</td>
                  <td><Badge color="blue">{c.course}</Badge></td>
                  <td style={{fontSize:11,color:'var(--t2)'}}>{c.trainer}</td>
                  <td><Badge color={s.color}>{s.label}</Badge></td>
                  <td>{c.usage || '—'}</td>
                  <td>
                    <div className={styles.rowActions}>
                      <div className={styles.ra} onClick={() => toast('Düzenle')}>✏️</div>
                      {c.status === 'pending' && <div className={styles.ra} onClick={() => toast('Onayla ✅')}>✅</div>}
                      {c.status === 'error'   && <div className={styles.ra} onClick={() => toast('Eğitmene ilet')}>📤</div>}
                      <div className={styles.ra} onClick={() => toast('Sil')}>🗑️</div>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
