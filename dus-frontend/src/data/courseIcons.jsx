// SVG course icons for AYT TYT Flash — TYT/AYT bölümleri

const BASE = {
  width: 48, height: 48, viewBox: '0 0 48 48',
  fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round',
}

// ── TYT Bölümleri ──────────────────────────────────────────────

export function AnatomyIcon({ color = 'currentColor', size = 48 }) {
  // Scissors: two rings top-left & top-right, crossing blades
  return (
    <svg {...BASE} width={size} height={size} stroke={color} strokeWidth="1.8">
      <circle cx="14" cy="15" r="6"/>
      <circle cx="34" cy="15" r="6"/>
      <line x1="19" y1="19" x2="14" y2="39"/>
      <line x1="29" y1="19" x2="34" y2="39"/>
      <line x1="22" y1="27" x2="26" y2="27"/>
    </svg>
  )
}

export function PhysioIcon({ color = 'currentColor', size = 48 }) {
  // Heart with ECG pulse line
  return (
    <svg {...BASE} width={size} height={size} stroke={color} strokeWidth="1.8">
      <path d="M24 34 C11 27 7 17 13 11 C17 7 24 13 24 13 C24 13 31 7 35 11 C41 17 37 27 24 34Z"/>
      <polyline points="7,24 13,24 16,18 19,30 22,22 24,24 33,24"/>
    </svg>
  )
}

export function BiochemIcon({ color = 'currentColor', size = 48 }) {
  // DNA double helix
  return (
    <svg {...BASE} width={size} height={size} stroke={color} strokeWidth="1.8">
      <path d="M16 8 C28 14 20 22 14 26 C8 30 14 38 24 42"/>
      <path d="M32 8 C20 14 28 22 34 26 C40 30 34 38 24 42"/>
      <line x1="18" y1="13" x2="30" y2="13"/>
      <line x1="15" y1="24" x2="33" y2="24"/>
      <line x1="18" y1="35" x2="30" y2="35"/>
    </svg>
  )
}

export function MicroIcon({ color = 'currentColor', size = 48 }) {
  // Bacteria cell with radiating spikes (sun/cell shape)
  return (
    <svg {...BASE} width={size} height={size} stroke={color} strokeWidth="1.8">
      <circle cx="24" cy="24" r="9"/>
      <circle cx="24" cy="24" r="4" strokeWidth="1.2"/>
      <line x1="24" y1="11" x2="24" y2="7"/>
      <line x1="31" y1="13" x2="34" y2="10"/>
      <line x1="37" y1="24" x2="41" y2="24"/>
      <line x1="31" y1="35" x2="34" y2="38"/>
      <line x1="24" y1="37" x2="24" y2="41"/>
      <line x1="17" y1="35" x2="14" y2="38"/>
      <line x1="11" y1="24" x2="7" y2="24"/>
      <line x1="17" y1="13" x2="14" y2="10"/>
    </svg>
  )
}

export function PathoIcon({ color = 'currentColor', size = 48 }) {
  // Microscope
  return (
    <svg {...BASE} width={size} height={size} stroke={color} strokeWidth="1.8">
      {/* Eyepiece */}
      <rect x="20" y="6" width="8" height="5" rx="2"/>
      {/* Arm */}
      <line x1="24" y1="11" x2="24" y2="28"/>
      {/* Stage */}
      <line x1="17" y1="28" x2="31" y2="28"/>
      {/* Objective lens */}
      <circle cx="24" cy="22" r="4"/>
      {/* Base arm */}
      <path d="M18 30 L16 38 L32 38 L30 30"/>
      {/* Base */}
      <line x1="12" y1="38" x2="36" y2="38"/>
      {/* Light */}
      <line x1="20" y1="34" x2="28" y2="34"/>
    </svg>
  )
}

export function PharmaIcon({ color = 'currentColor', size = 48 }) {
  // Capsule pill rotated 45 degrees
  return (
    <svg {...BASE} width={size} height={size} stroke={color} strokeWidth="1.8">
      {/* Capsule outline */}
      <path d="M14 34 C9 29 9 19 14 14 C19 9 29 9 34 14 C39 19 39 29 34 34 C29 39 19 39 14 34Z"/>
      {/* Dividing line */}
      <line x1="14" y1="34" x2="34" y2="14"/>
    </svg>
  )
}

// ── AYT Bölümleri ──────────────────────────────────────────────

export function ProstheticIcon({ color = 'currentColor', size = 48 }) {
  // Tooth with crown (jagged top, smooth body)
  return (
    <svg {...BASE} width={size} height={size} stroke={color} strokeWidth="1.8">
      {/* Crown */}
      <path d="M14 24 L16 14 L20 18 L24 12 L28 18 L32 14 L34 24"/>
      {/* Tooth body */}
      <path d="M14 24 L14 36 C14 40 18 42 20 40 L22 32 L26 32 L28 40 C30 42 34 40 34 36 L34 24"/>
    </svg>
  )
}

export function SurgeryIcon({ color = 'currentColor', size = 48 }) {
  // Scalpel
  return (
    <svg {...BASE} width={size} height={size} stroke={color} strokeWidth="1.8">
      {/* Handle */}
      <path d="M12 36 L30 12 C32 8 38 8 38 12 L32 14"/>
      {/* Blade edge */}
      <path d="M32 14 C34 20 30 24 24 28 L12 36"/>
      {/* Guard */}
      <line x1="30" y1="12" x2="32" y2="18"/>
    </svg>
  )
}

export function OrthoIcon({ color = 'currentColor', size = 48 }) {
  // Braces: three brackets with wire
  return (
    <svg {...BASE} width={size} height={size} stroke={color} strokeWidth="1.8">
      {/* Wire */}
      <path d="M8 24 Q16 22 24 24 Q32 26 40 24"/>
      {/* Bracket 1 */}
      <rect x="8" y="20" width="8" height="8" rx="1.5"/>
      {/* Bracket 2 */}
      <rect x="20" y="20" width="8" height="8" rx="1.5"/>
      {/* Bracket 3 */}
      <rect x="32" y="20" width="8" height="8" rx="1.5"/>
    </svg>
  )
}

export function EndoIcon({ color = 'currentColor', size = 48 }) {
  // Endodontic file: T-handle + tapered file with serrations
  return (
    <svg {...BASE} width={size} height={size} stroke={color} strokeWidth="1.8">
      {/* T-handle */}
      <line x1="14" y1="9" x2="34" y2="9"/>
      <line x1="24" y1="9" x2="24" y2="42"/>
      {/* Serrations on file (taper toward tip) */}
      <line x1="21" y1="16" x2="27" y2="16"/>
      <line x1="21" y1="21" x2="27" y2="21"/>
      <line x1="22" y1="26" x2="26" y2="26"/>
      <line x1="22" y1="31" x2="26" y2="31"/>
      <line x1="23" y1="36" x2="25" y2="36"/>
    </svg>
  )
}

export function RestorativeIcon({ color = 'currentColor', size = 48 }) {
  // Simple tooth shape
  return (
    <svg {...BASE} width={size} height={size} stroke={color} strokeWidth="1.8">
      {/* Tooth */}
      <path d="M14 20 C12 14 14 8 18 8 L30 8 C34 8 36 14 34 20 L32 40 C31 43 28 43 26 40 L24 34 L22 40 C20 43 17 43 16 40 Z"/>
      {/* Filling area */}
      <path d="M18 16 L30 16 L28 26 L20 26 Z" strokeDasharray="2 2"/>
    </svg>
  )
}

export function PedoIcon({ color = 'currentColor', size = 48 }) {
  // Child figure
  return (
    <svg {...BASE} width={size} height={size} stroke={color} strokeWidth="1.8">
      {/* Head */}
      <circle cx="24" cy="12" r="6"/>
      {/* Body */}
      <path d="M18 20 L24 18 L30 20 L28 34 L24 36 L20 34 Z"/>
      {/* Arms */}
      <line x1="18" y1="22" x2="12" y2="28"/>
      <line x1="30" y1="22" x2="36" y2="28"/>
      {/* Legs */}
      <line x1="20" y1="34" x2="16" y2="44"/>
      <line x1="28" y1="34" x2="32" y2="44"/>
    </svg>
  )
}

export function RadioIcon({ color = 'currentColor', size = 48 }) {
  // X-ray dental film frame with tooth silhouette inside
  return (
    <svg {...BASE} width={size} height={size} stroke={color} strokeWidth="1.8">
      {/* Film frame */}
      <rect x="8" y="6" width="32" height="36" rx="3"/>
      {/* Tooth outline inside */}
      <path d="M18 18 C17 14 18 12 21 12 L27 12 C30 12 31 14 30 18 L29 32 C28 34 26 34 25 32 L24 28 L23 32 C22 34 20 34 19 32 Z"/>
      {/* Dotted bone detail */}
      <line x1="13" y1="38" x2="35" y2="38" strokeDasharray="2 2" strokeWidth="1.2"/>
    </svg>
  )
}

export function PerioIcon({ color = 'currentColor', size = 48 }) {
  // Gum tissue around teeth: wave gum line + two teeth below
  return (
    <svg {...BASE} width={size} height={size} stroke={color} strokeWidth="1.8">
      {/* Gum line wave */}
      <path d="M6 20 C10 12 16 16 20 12 C22 10 26 10 28 12 C32 16 38 12 42 20"/>
      {/* Tooth 1 */}
      <path d="M14 20 L13 40 C13 42 15 43 16 41 L17 34 L19 34 L20 41 C21 43 23 42 23 40 L22 20"/>
      {/* Tooth 2 */}
      <path d="M26 20 L25 40 C25 42 27 43 28 41 L29 34 L31 34 L32 41 C33 43 35 42 35 40 L34 20"/>
    </svg>
  )
}

// ── Icon mapping by slug ───────────────────────────────────────
export const COURSE_ICON_MAP = {
  'turkce':               AnatomyIcon,
  'tyt-matematik':        PhysioIcon,
  'tyt-fen':              BiochemIcon,
  'tyt-sosyal':           MicroIcon,
  'ayt-fen':              ProstheticIcon,
  'ayt-matematik':        OrthoIcon,
  'ayt-edebiyat-sosyal1': EndoIcon,
  'ayt-sosyal2':          PerioIcon,
}

// ── Bottom nav SVG icons ───────────────────────────────────────
export function NavHomeIcon({ color = 'currentColor', size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9L12 2L21 9V20C21 21.1 20.1 22 19 22H5C3.9 22 3 21.1 3 20V9Z"/>
      <path d="M9 22V12H15V22"/>
    </svg>
  )
}

export function NavDecksIcon({ color = 'currentColor', size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 7V5C16 3.9 15.1 3 14 3H10C8.9 3 8 3.9 8 5V7"/>
      <line x1="12" y1="12" x2="12" y2="16"/>
      <line x1="10" y1="14" x2="14" y2="14"/>
    </svg>
  )
}

export function NavQuizIcon({ color = 'currentColor', size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
      <path d="M2 17L12 22L22 17"/>
      <path d="M2 12L12 17L22 12"/>
    </svg>
  )
}

export function NavProgressIcon({ color = 'currentColor', size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
      <line x1="3" y1="20" x2="21" y2="20"/>
    </svg>
  )
}

export function NavImageCardsIcon({ color = 'currentColor', size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2"/>
      <circle cx="8.5" cy="10" r="1.5"/>
      <path d="M21 15L16 10L8 18"/>
      <path d="M3 18L7 14"/>
    </svg>
  )
}

export function NavProfileIcon({ color = 'currentColor', size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20C4 16.7 7.6 14 12 14C16.4 14 20 16.7 20 20"/>
    </svg>
  )
}
