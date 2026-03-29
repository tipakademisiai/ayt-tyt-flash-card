import { PageTopbar, Badge } from '../../components/shared'
import styles from '../../styles/shared.module.css'
import toast from 'react-hot-toast'

const COMMENTS = [
  { user:'Ayşe Yıldırım', initials:'AY', bg:'linear-gradient(135deg,#10B981,#059669)', card:'Anatomi — Baş Boyun', text:'Bu kartta sinir çıkış deliği yanlış yazılmış, foramen ovale...', type:'Hata', date:'Bugün' },
  { user:'Dr. Zeynep Şahin', initials:'ZŞ', bg:'linear-gradient(135deg,#00AADD,#0055AA)', card:'Periodontoloji — Tedavi', text:'Bu kart çok yararlı olmuş, teşekkürler eğitmene!', type:'Olumlu', date:'Bugün' },
  { user:'Mehmet Kılıç', initials:'MK', bg:'linear-gradient(135deg,#A78BFA,#7C3AED)', card:'Endodonti — Pulpa', text:'Cevap çok uzun ve karmaşık, daha sade olabilir.', type:'Öneri', date:'Dün' },
  { user:'Selin Erdoğan', initials:'SE', bg:'linear-gradient(135deg,#E05070,#9D174D)', card:'Farmakoloji — Antibiyotik', text:'Kart içeriği güncel değil, yeni kılavuz bilgileri eklenmeli.', type:'Güncelleme', date:'2 gün önce' },
]

const TYPE_COLOR = { Hata:'red', Olumlu:'green', Öneri:'yellow', Güncelleme:'orange' }

export default function SupportComments() {
  return (
    <div>
      <PageTopbar title="Yorum Yönetimi" subtitle="Kartlar hakkındaki kullanıcı yorumları">
        <select className={styles.fsel}>
          <option>Tüm Yorumlar</option><option>Bekleyen</option><option>Onaylandı</option>
        </select>
      </PageTopbar>

      <div className={styles.card}>
        <table className={styles.tbl}>
          <thead>
            <tr><th>Kullanıcı</th><th>Kart / İçerik</th><th>Yorum</th><th>Tip</th><th>Tarih</th><th>İşlem</th></tr>
          </thead>
          <tbody>
            {COMMENTS.map((c,i) => (
              <tr key={i}>
                <td>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div style={{width:28,height:28,borderRadius:'50%',background:c.bg,display:'flex',
                      alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:800,color:'white'}}>
                      {c.initials}
                    </div>
                    <span className={styles.t1}>{c.user}</span>
                  </div>
                </td>
                <td style={{fontSize:11,color:'var(--t2)'}}>{c.card}</td>
                <td style={{maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:11}}>{c.text}</td>
                <td><Badge color={TYPE_COLOR[c.type] || 'gray'}>{c.type}</Badge></td>
                <td style={{fontSize:11,color:'var(--t3)'}}>{c.date}</td>
                <td>
                  <div className={styles.rowActions}>
                    {c.type === 'Hata' && <div className={styles.ra} onClick={() => toast('İçerik düzenleniyor...')}>✏️</div>}
                    {c.type !== 'Olumlu' && <div className={styles.ra} onClick={() => toast('Eğitmene iletildi')}>📤</div>}
                    <div className={styles.ra} onClick={() => toast('Yorum onaylandı')}>✅</div>
                    <div className={styles.ra} onClick={() => toast('Yorum silindi')}>🗑️</div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
