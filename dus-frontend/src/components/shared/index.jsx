import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import styles from '../../styles/shared.module.css'
import { useState, useRef, useEffect } from 'react'
import {
  NavHomeIcon, NavDecksIcon, NavQuizIcon, NavProgressIcon, NavProfileIcon, NavImageCardsIcon,
} from '../../data/courseIcons'

// ── MODAL ─────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.65)', zIndex:300,
      display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background:'var(--card)', border:'1px solid var(--border)',
        borderRadius:20, padding:28, width, maxWidth:'95vw', maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div style={{ fontSize:15, fontWeight:800, color:'var(--t1)' }}>{title}</div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer',
            fontSize:18, color:'var(--t3)', lineHeight:1, padding:2 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── DROPDOWN MENU ─────────────────────────────────────────────
export function DropdownMenu({ items, children }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} style={{ position:'relative', display:'inline-block' }}>
      <div onClick={e => { e.stopPropagation(); setOpen(o => !o) }}>{children}</div>
      {open && (
        <div style={{ position:'absolute', right:0, top:'calc(100% + 6px)', zIndex:200,
          background:'var(--card)', border:'1px solid var(--border)', borderRadius:12,
          boxShadow:'0 8px 32px rgba(0,0,0,.25)', minWidth:160, overflow:'hidden' }}>
          {items.map((item, i) => item === 'divider' ? (
            <div key={i} style={{ height:1, background:'var(--border)', margin:'3px 0' }}/>
          ) : (
            <div key={i} onClick={e => { e.stopPropagation(); setOpen(false); item.onClick?.() }}
              style={{ display:'flex', alignItems:'center', gap:9, padding:'10px 14px',
                cursor: item.disabled ? 'default' : 'pointer', fontSize:12, fontWeight:600,
                color: item.danger ? '#FF8090' : item.disabled ? 'var(--t3)' : 'var(--t2)',
                transition:'background .12s' }}
              onMouseEnter={e => { if (!item.disabled) e.currentTarget.style.background = 'var(--hover)' }}
              onMouseLeave={e => e.currentTarget.style.background = ''}>
              {item.icon && <span style={{ fontSize:14 }}>{item.icon}</span>}
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── CONFIRM MODAL ─────────────────────────────────────────────
export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Onayla', danger = false }) {
  if (!open) return null
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.65)', zIndex:300,
      display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background:'var(--card)', border:'1px solid var(--border)',
        borderRadius:18, padding:24, width:360, maxWidth:'95vw' }}>
        <div style={{ fontSize:14, fontWeight:800, color:'var(--t1)', marginBottom:8 }}>{title}</div>
        <div style={{ fontSize:12, color:'var(--t2)', marginBottom:22, lineHeight:1.6 }}>{message}</div>
        <div style={{ display:'flex', gap:10 }}>
          <button className={`${styles.btn} ${styles.btnOutline}`} style={{ flex:1 }} onClick={onClose}>İptal</button>
          <button className={`${styles.btn} ${danger ? styles.btnDanger : styles.btnPrimary}`}
            style={{ flex:1 }} onClick={() => { onConfirm(); onClose() }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

// ── LOGO SVG
export function LogoSVG({ size = 22 }) {
  return (
    <svg width={size} height={size * 0.82} viewBox="0 0 24 20" fill="none">
      <path d="M1 4Q1 1 4.5 1L11 2.5V17L4.5 15.5Q1 15.5 1 13Z" fill="#00AADD"/>
      <path d="M13 2.5L19.5 1Q23 1 23 4V13Q23 15.5 19.5 15.5L13 17Z" fill="#00AADD"/>
      <path d="M1 13Q1 18 5 18L11 17L12 19L13 17L19 18Q23 18 23 13"
        stroke="#0077AA" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <polygon points="5,7 5,12 10,9.5" fill="white" opacity="0.95"/>
    </svg>
  )
}

// ── THEME TOGGLE
export function ThemeToggle() {
  const { dark, toggleTheme } = useTheme()
  return (
    <button onClick={toggleTheme} className={styles.iconBtn} title="Tema değiştir">
      {dark ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="4"/>
          <line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/>
          <line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/>
          <line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/>
          <line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/>
          <line x1="19.07" y1="4.93" x2="17.66" y2="6.34"/>
          <line x1="6.34" y1="17.66" x2="4.93" y2="19.07"/>
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  )
}

// ── BADGE
export function Badge({ color = 'blue', children }) {
  return <span className={`${styles.badge} ${styles['badge_' + color]}`}>{children}</span>
}

// ── KPI CARD
export function KpiCard({ icon, value, label, change, changeType = 'up', onClick }) {
  return (
    <div className={styles.kpi} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className={styles.kpiTop}>
        <div className={styles.kpiIcon}>{icon}</div>
        {change && (
          <span className={`${styles.kpiChange} ${styles[changeType]}`}>{change}</span>
        )}
      </div>
      <div className={styles.kpiVal}>{value}</div>
      <div className={styles.kpiLbl}>{label}</div>
    </div>
  )
}

// ── LOADING SPINNER
export function LoadingSpinner({ height = '200px' }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height }}>
      <div className={styles.spinner} />
    </div>
  )
}

// ── EMPTY STATE
export function EmptyState({ icon = '📭', title, subtitle, action }) {
  return (
    <div style={{ textAlign:'center', padding:'40px 20px' }}>
      <div style={{ fontSize:40, marginBottom:12 }}>{icon}</div>
      {title    && <div style={{ fontSize:14, fontWeight:700, color:'var(--t1)', marginBottom:6 }}>{title}</div>}
      {subtitle && <div style={{ fontSize:12, color:'var(--t3)', marginBottom:16 }}>{subtitle}</div>}
      {action}
    </div>
  )
}

// ── PAGE TOPBAR
export function PageTopbar({ title, subtitle, children }) {
  return (
    <div className={styles.topbar}>
      <div>
        <div className={styles.pageTitle}>{title}</div>
        {subtitle && <div className={styles.pageSub}>{subtitle}</div>}
      </div>
      <div className={styles.topbarRight}>
        {children}
        <ThemeToggle />
      </div>
    </div>
  )
}

// ── FILTER BAR
export function FilterBar({ searchPlaceholder = 'Ara...', onSearch, selects = [] }) {
  return (
    <div className={styles.filterBar}>
      <div className={styles.searchWrap}>
        <svg className={styles.searchIcon} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          className={styles.searchInp}
          type="text"
          placeholder={searchPlaceholder}
          onChange={e => onSearch?.(e.target.value)}
        />
      </div>
      {selects.map((sel, i) => (
        <select key={i} className={styles.fsel} onChange={e => sel.onChange?.(e.target.value)}>
          {sel.options.map((opt, j) => {
            const value = typeof opt === 'string' ? opt : opt.value
            const label = typeof opt === 'string' ? opt : opt.label
            return <option key={j} value={value}>{label}</option>
          })}
        </select>
      ))}
    </div>
  )
}

// ── SIDEBAR SECTION
export function SidebarSection({ children }) {
  return <div className={styles.sbSection}>{children}</div>
}

// ── SIDEBAR ITEM
export function SidebarItem({ to, icon, label, badge, accentColor = '#00AADD' }) {
  return (
    <NavLink
      to={to}
      end={to.split('/').length <= 2}
      className={({ isActive }) => `${styles.sbItem} ${isActive ? styles.sbItemActive : ''}`}
      style={({ isActive }) => isActive ? { color: accentColor } : {}}
    >
      <span className={styles.sbIcon}>{icon}</span>
      <span style={{ flex:1 }}>{label}</span>
      {badge && <span className={styles.sbBadge}>{badge}</span>}
    </NavLink>
  )
}

// ── SIDEBAR WRAPPER (shared by all 3 staff layouts)
function SidebarWrapper({ children, logoSubtitle, logoBoxStyle, tagText, tagStyle, userBg, bottomExtra }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className={styles.appLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sbLogo}>
          <div className={styles.sbLogoBox} style={logoBoxStyle}><LogoSVG /></div>
          <div className={styles.sbLogoText}>
            ayttytflash<br/>
            <span className={styles.sbLogoSub}>{logoSubtitle}</span>
          </div>
        </div>

        {tagText && (
          <div style={{ padding:'0 18px', marginBottom:12 }}>
            <span className={styles.panelTag} style={tagStyle}>{tagText}</span>
          </div>
        )}

        <nav style={{ flex:1 }}>{children}</nav>

        {bottomExtra}

        <div className={styles.sbBottom}>
          <div className={styles.sbUser}>
            <div className={styles.sbAvatar} style={{ background: userBg }}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div className={styles.sbUserName}
                style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {user?.full_name || user?.email}
              </div>
              <div style={{ fontSize:9, color:'var(--t3)' }}>{user?.branch || user?.role}</div>
              <button onClick={handleLogout} className={styles.sbLogout}>Çıkış Yap</button>
            </div>
          </div>
        </div>
      </aside>
      <main className={styles.mainContent}><Outlet /></main>
    </div>
  )
}

// ── ADMIN LAYOUT
export function AdminLayout() {
  const items = [
    { section: 'Genel' },
    { to:'/admin',               label:'Dashboard',          icon:'▦' },
    { to:'/admin/reports',       label:'Raporlar & Analitik', icon:'📈' },
    { section: 'Yönetim' },
    { to:'/admin/users',         label:'Kullanıcı Yönetimi', icon:'👥', badge:'1.284' },
    { to:'/admin/trainers',      label:'Eğitmen Yönetimi',   icon:'🎓' },
    { to:'/admin/content',       label:'İçerik Yönetimi',    icon:'📚' },
    { section: 'Finans' },
    { to:'/admin/pricing',       label:'Ücret & Komisyon',   icon:'💰' },
    { section: 'Kütüphane' },
    { to:'/admin/library',       label:'Kaynak Kütüphanesi', icon:'📚' },
    { section: 'İletişim' },
    { to:'/admin/notifications', label:'Bildirim & Duyuru',  icon:'🔔', badge:'3' },
    { to:'/admin/settings',      label:'Sistem Ayarları',    icon:'⚙️' },
  ]
  return (
    <SidebarWrapper logoSubtitle="Admin Panel"
      logoBoxStyle={{ background:'rgba(0,170,221,.18)', borderColor:'rgba(0,170,221,.3)' }}
      userBg="linear-gradient(135deg,#00AADD,#0055AA)">
      {items.map((it,i) => it.section
        ? <SidebarSection key={i}>{it.section}</SidebarSection>
        : <SidebarItem key={it.to} {...it} accentColor="#00AADD" />
      )}
    </SidebarWrapper>
  )
}

// ── TRAINER LAYOUT
export function TrainerLayout() {
  const items = [
    { section: 'Genel' },
    { to:'/trainer',           label:'Dashboard',       icon:'▦' },
    { to:'/trainer/analytics', label:'Analitik',        icon:'📊' },
    { section: 'İçerik' },
    { to:'/trainer/cards',     label:'Kartlarım',       icon:'🃏', badge:'124' },
    { to:'/trainer/quizzes',   label:'Quizlerim',       icon:'🎯' },
    { section: 'İletişim' },
    { to:'/trainer/questions', label:'Gelen Sorular',   icon:'💬', badge:'18' },
    { section: 'Çalışma' },
    { to:'/trainer/study',     label:'Flashcard Çalış', icon:'📖' },
    { section: 'Kütüphane' },
    { to:'/trainer/library',   label:'Kaynak Kütüphanem', icon:'📚' },
    { section: 'Hesap' },
    { to:'/trainer/settings',  label:'Ayarlar',         icon:'⚙️' },
  ]
  return (
    <SidebarWrapper logoSubtitle="Eğitmen Paneli"
      logoBoxStyle={{ background:'rgba(16,185,129,.18)', borderColor:'rgba(16,185,129,.3)' }}
      tagText="EĞİTMEN"
      tagStyle={{ background:'rgba(16,185,129,.15)', color:'#10B981', borderColor:'rgba(16,185,129,.2)' }}
      userBg="linear-gradient(135deg,#10B981,#059669)">
      {items.map((it,i) => it.section
        ? <SidebarSection key={i}>{it.section}</SidebarSection>
        : <SidebarItem key={it.to} {...it} accentColor="#10B981" />
      )}
    </SidebarWrapper>
  )
}

// ── SUPPORT LAYOUT
export function SupportLayout() {
  const { user } = useAuth()
  const items = [
    { section: 'Genel' },
    { to:'/support',               label:'Dashboard',          icon:'▦' },
    { section: 'Destek' },
    { to:'/support/messages',      label:'Mesajlar & Sorular', icon:'💬', badge:'34' },
    { to:'/support/comments',      label:'Yorum Yönetimi',     icon:'🗨️', badge:'12' },
    { section: 'Yönetim' },
    { to:'/support/users',         label:'Kullanıcı Yönetimi', icon:'👥' },
    { to:'/support/content',       label:'İçerik Yönetimi',    icon:'📚' },
    { to:'/support/notifications', label:'Bildirim Gönder',    icon:'🔔' },
    { to:'/support/settings',      label:'Ayarlar',            icon:'⚙️' },
  ]
  const bottomExtra = (
    <div style={{ padding:'0 18px 12px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        <div style={{ width:7, height:7, borderRadius:'50%', background:'#10B981', flexShrink:0 }} />
        <span style={{ fontSize:9, fontWeight:600, color:'#10B981' }}>
          {user?.first_name} çevrimiçi
        </span>
      </div>
    </div>
  )
  return (
    <SidebarWrapper logoSubtitle="Müşteri Hizmetleri"
      logoBoxStyle={{ background:'rgba(245,200,66,.18)', borderColor:'rgba(245,200,66,.3)' }}
      tagText="DESTEK EKİBİ"
      tagStyle={{ background:'rgba(245,200,66,.15)', color:'#F5C842', borderColor:'rgba(245,200,66,.2)' }}
      userBg="linear-gradient(135deg,#F5C842,#D97706)"
      bottomExtra={bottomExtra}>
      {items.map((it,i) => it.section
        ? <SidebarSection key={i}>{it.section}</SidebarSection>
        : <SidebarItem key={it.to} {...it} accentColor="#F5C842" />
      )}
    </SidebarWrapper>
  )
}

// ── CUSTOMER LAYOUT (mobile bottom nav)
export function CustomerLayout() {
  const navItems = [
    { to:'/app',               label:'Ana Sayfa',   Icon: NavHomeIcon },
    { to:'/app/decks',         label:'Desteler',    Icon: NavDecksIcon },
    { to:'/app/image-cards',   label:'Kartlarım',   Icon: NavImageCardsIcon },
    { to:'/app/quiz',          label:'Quiz',        Icon: NavQuizIcon },
    { to:'/app/progress',      label:'İlerleme',    Icon: NavProgressIcon },
    { to:'/app/profile',       label:'Profil',      Icon: NavProfileIcon },
  ]
  return (
    <div className={styles.customerApp}>
      <main className={styles.customerMain}>
        <Outlet />
      </main>
      <nav className={styles.bottomNav}>
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/app'}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}>
            <span className={styles.navIcon}>
              <item.Icon size={20} color="currentColor"/>
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
