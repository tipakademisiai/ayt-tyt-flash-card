import { useNavigate } from 'react-router-dom'
import { ThemeToggle } from '../../components/shared'
import { PLANS } from '../../data'
import toast from 'react-hot-toast'

export default function CustomerShop() {
  const navigate = useNavigate()

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingBottom:18}}>
        <div style={{fontSize:19,fontWeight:900,color:'var(--t1)'}}>Abonelik Planları</div>
        <ThemeToggle/>
      </div>

      {/* Trial banner */}
      <div style={{borderRadius:16,padding:'14px 18px',display:'flex',alignItems:'center',gap:12,marginBottom:18,
        background:'linear-gradient(135deg,rgba(245,200,66,.15),rgba(245,160,20,.1))',border:'1px solid rgba(245,200,66,.25)'}}>
        <div style={{fontSize:26}}>🎁</div>
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:800,color:'var(--t1)',marginBottom:2}}>3 Gün Ücretsiz Deneme</div>
          <div style={{fontSize:10,color:'var(--t3)'}}>Kredi kartı gerekmez · İstediğin zaman iptal et</div>
        </div>
        <button style={{padding:'8px 16px',borderRadius:10,background:'rgba(245,200,66,.2)',border:'1px solid rgba(245,200,66,.3)',
          color:'#F5C842',fontSize:11,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',fontFamily:'Montserrat'}}
          onClick={() => toast('3 günlük deneme başlatıldı! 🎉')}>
          Dene →
        </button>
      </div>

      {/* Mevcut plan */}
      <div style={{borderRadius:14,padding:'14px 16px',display:'flex',alignItems:'center',gap:12,marginBottom:18,
        background:'rgba(16,185,129,.1)',border:'1.5px solid rgba(16,185,129,.3)'}}>
        <div style={{fontSize:22}}>✅</div>
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:800,color:'#10B981',marginBottom:1}}>Mevcut Plan: Pro</div>
          <div style={{fontSize:10,color:'var(--t3)'}}>₺499/ay · 28 Nisan 2026 yenilenir</div>
        </div>
        <div style={{fontSize:10,fontWeight:700,color:'#E05070',cursor:'pointer'}} onClick={() => toast('İptal işlemi...')}>İptal Et</div>
      </div>

      {/* Plan kartları */}
      {Object.values(PLANS).map(plan => (
        <div key={plan.key}
          style={{borderRadius:20,padding:'22px 18px',marginBottom:14,cursor:'pointer',
            position:'relative',overflow:'hidden',transition:'transform .2s',
            background:plan.gradient, border:`1.5px solid ${plan.border}`}}
          onMouseEnter={e => e.currentTarget.style.transform='translateY(-3px)'}
          onMouseLeave={e => e.currentTarget.style.transform=''}>

          {/* Highlight line */}
          <div style={{position:'absolute',top:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent)'}}/>

          {plan.popular && (
            <div style={{position:'absolute',top:14,right:14,fontSize:9,fontWeight:800,padding:'3px 10px',
              borderRadius:99,letterSpacing:'.06em',textTransform:'uppercase',
              background:`${plan.color}33`,color:plan.color,border:`1px solid ${plan.color}55`}}>
              {plan.popular}
            </div>
          )}

          <div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,.6)',letterSpacing:'.06em',textTransform:'uppercase',marginBottom:5}}>
            {plan.name}
          </div>
          <div style={{fontSize:28,fontWeight:900,color:'white',marginBottom:3}}>
            ₺{plan.price}<span style={{fontSize:13,fontWeight:500,color:'rgba(255,255,255,.45)'}}>/ay</span>
          </div>
          <div style={{fontSize:10,color:'rgba(255,255,255,.4)',marginBottom:14}}>
            ₺{plan.annual}/yıl — %{plan.discount} indirim
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:7,marginBottom:16}}>
            {plan.features.map((f,i) => (
              <div key={i} style={{fontSize:11,fontWeight:600,display:'flex',alignItems:'center',gap:8,
                color: f.yes ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.3)'}}>
                <span>{f.yes ? '✅' : '❌'}</span>
                {f.text}
              </div>
            ))}
          </div>

          <button style={{width:'100%',padding:11,borderRadius:12,border:'none',
            fontFamily:'Montserrat',fontSize:12,fontWeight:800,cursor:'pointer',transition:'all .2s',
            background: plan.key==='pro' ? 'rgba(0,170,221,.9)' : plan.key==='standart' ? 'rgba(160,139,250,.85)' : 'rgba(16,185,129,.8)',
            color:'white'}}
            onClick={() => {
              if (plan.key === 'pro') toast('Zaten Pro planındasınız! ✅')
              else toast(`${plan.name} plana geçiş yapılıyor...`)
            }}>
            {plan.key === 'pro' ? 'Aktif Plan ✓' : `${plan.name} - Seç`}
          </button>
        </div>
      ))}
    </div>
  )
}
