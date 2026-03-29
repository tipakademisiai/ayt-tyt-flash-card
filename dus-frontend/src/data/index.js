// ── TYT / AYT Bölümleri ─────────────────────────────────────
export const TYT_BOLUMLER = [
  { id: 1, slug: 'turkce',      name: 'Türkçe',         cards: 120, done: 0, pending: 0, srs: [0,0,0,0,0] },
  { id: 2, slug: 'tyt-matematik', name: 'Matematik',    cards: 100, done: 0, pending: 0, srs: [0,0,0,0,0] },
  { id: 3, slug: 'tyt-fen',     name: 'Fen Bilimleri',  cards: 90,  done: 0, pending: 0, srs: [0,0,0,0,0] },
  { id: 4, slug: 'tyt-sosyal',  name: 'Sosyal Bilimler',cards: 80,  done: 0, pending: 0, srs: [0,0,0,0,0] },
]

export const AYT_BOLUMLER = [
  { id: 5, slug: 'ayt-fen',             name: 'Fen Bilimleri',               cards: 110, done: 0, pending: 0, srs: [0,0,0,0,0] },
  { id: 6, slug: 'ayt-matematik',       name: 'Matematik',                   cards: 95,  done: 0, pending: 0, srs: [0,0,0,0,0] },
  { id: 7, slug: 'ayt-edebiyat-sosyal1',name: 'Edebiyat – Sosyal Bil. 1',    cards: 85,  done: 0, pending: 0, srs: [0,0,0,0,0] },
  { id: 8, slug: 'ayt-sosyal2',         name: 'Sosyal Bilimler 2',           cards: 100, done: 0, pending: 0, srs: [0,0,0,0,0] },
]

export const ALL_DERSLER = [...TYT_BOLUMLER, ...AYT_BOLUMLER]

export const SRS_COLORS = ['#E05070','#E05070','#F5A020','#10B981','#4A90D0']

// ── Abonelik Planları ─────────────────────────────────────────
export const PLANS = {
  pro: {
    key: 'pro', name: 'Pro', price: 499, annual: 4490, discount: 25,
    color: '#00AADD',
    gradient: 'linear-gradient(145deg,rgba(0,80,140,.7),rgba(0,140,200,.5))',
    border: 'rgba(0,170,221,.4)',
    popular: 'EN KAPSAMLI',
    features: [
      { text: 'Tüm TYT ve AYT bölümleri',           yes: true  },
      { text: 'Sınırsız flashcard çalışma',           yes: true  },
      { text: 'Spaced repetition algoritması',        yes: true  },
      { text: 'Quiz modu — tüm modlar',               yes: true  },
      { text: 'AI kart üretimi (nottan)',              yes: true  },
      { text: 'AI günlük çalışma planı',              yes: true  },
      { text: 'Detaylı ilerleme analizi',             yes: true  },
      { text: 'Eğitmene soru sorma',                  yes: true  },
      { text: 'Öncelikli destek',                     yes: true  },
    ],
  },
  standart: {
    key: 'standart', name: 'Standart', price: 449, annual: 3990, discount: 26,
    color: '#A78BFA',
    gradient: 'linear-gradient(145deg,rgba(80,40,140,.6),rgba(120,80,200,.4))',
    border: 'rgba(160,139,250,.35)',
    popular: 'POPÜLER',
    features: [
      { text: 'Tüm TYT ve AYT bölümleri',           yes: true  },
      { text: 'Sınırsız flashcard çalışma',           yes: true  },
      { text: 'Spaced repetition algoritması',        yes: true  },
      { text: 'Quiz modu — tüm modlar',               yes: true  },
      { text: 'AI kart üretimi',                      yes: false },
      { text: 'AI günlük çalışma planı',              yes: true  },
      { text: 'Detaylı ilerleme analizi',             yes: true  },
      { text: 'Eğitmene soru sorma',                  yes: true  },
      { text: 'Standart destek',                      yes: true  },
    ],
  },
  baslangic: {
    key: 'baslangic', name: 'Başlangıç', price: 149, annual: 1290, discount: 28,
    color: '#10B981',
    gradient: 'linear-gradient(145deg,rgba(10,70,40,.6),rgba(16,120,70,.4))',
    border: 'rgba(16,185,129,.25)',
    popular: null,
    features: [
      { text: 'Tüm TYT ve AYT bölümleri',           yes: true  },
      { text: 'Sınırsız flashcard çalışma',           yes: true  },
      { text: 'Spaced repetition algoritması',        yes: true  },
      { text: 'Quiz modu — temel',                    yes: true  },
      { text: 'AI kart üretimi',                      yes: false },
      { text: 'AI günlük çalışma planı',              yes: false },
      { text: 'Temel ilerleme takibi',                yes: true  },
      { text: 'Eğitmene soru sorma',                  yes: true  },
      { text: 'Öncelikli destek',                     yes: false },
    ],
  },
}

// ── Quiz Kartları (örnek veri) ────────────────────────────────
export const QUIZ_CARDS = [
  { id: 1, q: 'Paragrafta ana fikir nerede bulunur?', a: 'Genellikle paragrafın başında veya sonunda yer alır; bazen tümüne yayılabilir.' },
  { id: 2, q: 'Newton\'un 2. Hareket Yasası nedir?', a: 'F = m × a; Net kuvvet, kütle ile ivmenin çarpımına eşittir.' },
  { id: 3, q: 'Mitoz bölünmenin sonucunda kaç hücre oluşur?', a: '2 adet, genetik olarak özdeş diploid (2n) hücre.' },
  { id: 4, q: 'Türk Dili ve Edebiyatı\'nda Servet-i Fünun dönemi özellikleri?', a: 'Fransız etkisi, arı dil yerine Arapça-Farsça ağırlıklı dil, bireysel temalar.' },
  { id: 5, q: 'Limit nedir?', a: 'Bir fonksiyonun belirli bir noktaya yaklaşırken aldığı değere yaklaşan değerdir.' },
  { id: 6, q: 'Periyodik tabloda grup ve periyot farkı?', a: 'Grup: aynı sütun, aynı valans elektron sayısı. Periyot: aynı satır, aynı enerji seviyesi.' },
  { id: 7, q: 'Coğrafya\'da iklim ile hava durumu farkı?', a: 'Hava durumu kısa süreli atmosfer olayları; iklim uzun yıllar ortalamasıdır.' },
  { id: 8, q: 'Felsefede empirizm nedir?', a: 'Bilginin kaynağının deney ve gözlem olduğunu savunan felsefi akım (Locke, Hume).' },
  { id: 9, q: 'TYT Sosyal\'de Tarih konusundan İslamiyet öncesi Türk devletleri?', a: 'Hun, Göktürk, Uygur devletleri başlıca örneklerdir.' },
  { id: 10, q: 'Biyoloji\'de DNA replikasyonu neden semi-konservatiftir?', a: 'Çift sarmalın her ipliği kalıp olarak kullanılır; yeni molekülün biri eski biri yeni iplikten oluşur.' },
]

// ── Flash Kartları (her bölüm için örnek kartlar) ───────────────────
export const DECK_CARDS = {
  'turkce': [
    { id:'tr1', q:'Paragrafta ana fikir ile yardımcı fikir arasındaki fark?', a:'Ana fikir paragrafın bütününü kapsayan temel düşüncedir; yardımcı fikirler onu destekler.' },
    { id:'tr2', q:'Öznel ve nesnel cümle arasındaki fark?', a:'Nesnel cümle kanıtlanabilir gerçekleri; öznel cümle kişisel görüş ve duyguları içerir.' },
    { id:'tr3', q:'Ad tamlaması türleri nelerdir?', a:'Belirtili (tamlayan ek alır), belirtisiz (tamlayan eksiz), zincirleme (üçlü+).' },
    { id:'tr4', q:'Fiilimsi türleri?', a:'İsim-fiil (-mak/-mek,-ma/-me,-iş), sıfat-fiil (-an,-dik,-ecek vs.), zarf-fiil (-arak,-ince,-ip vs.).' },
    { id:'tr5', q:'Anlatım bozukluğu türleri?', a:'Özne-yüklem uyumsuzluğu, gereksiz sözcük, çelişki, anlam belirsizliği başlıcalarıdır.' },
  ],
  'tyt-matematik': [
    { id:'tm1', q:'Asal sayı nedir? İlk 5 asal sayıyı say.', a:'Yalnızca 1 ve kendisine bölünebilen sayı. İlk 5: 2, 3, 5, 7, 11.' },
    { id:'tm2', q:'Kareler farkı formülü?', a:'a² - b² = (a+b)(a-b)' },
    { id:'tm3', q:'Üçgende iç açılar toplamı?', a:'180°' },
    { id:'tm4', q:'Yüzde hesabında: 200\'ün %35\'i kaçtır?', a:'70' },
    { id:'tm5', q:'Hız-zaman-mesafe ilişkisi?', a:'Mesafe = Hız × Zaman' },
  ],
  'tyt-fen': [
    { id:'tf1', q:'Newton\'un 1. Hareket Yasası (Eylemsizlik)?', a:'Üzerine net kuvvet etki etmeyen cisim duruyorsa durur, hareket ediyorsa sabit hızla hareket eder.' },
    { id:'tf2', q:'Atom numarası neyi ifade eder?', a:'Bir elementin çekirdeğindeki proton sayısını ifade eder.' },
    { id:'tf3', q:'Fotosentez denklemi?', a:'6CO₂ + 6H₂O + ışık enerjisi → C₆H₁₂O₆ + 6O₂' },
    { id:'tf4', q:'Ohm Kanunu nedir?', a:'V = I × R (Gerilim = Akım × Direnç)' },
    { id:'tf5', q:'pH değeri 7\'den küçük olan maddeler?', a:'Asidik maddelerdir (örn. limon suyu pH≈2).' },
  ],
  'tyt-sosyal': [
    { id:'ts1', q:'Osmanlı Devleti\'nin kuruluş tarihi?', a:'1299 — Osman Bey tarafından kurulmuştur.' },
    { id:'ts2', q:'Türkiye\'nin en uzun nehri?', a:'Kızılırmak (1355 km).' },
    { id:'ts3', q:'Felsefi şüphecilik (septisizm) nedir?', a:'Kesin bilgiye ulaşılamayacağını savunan felsefi tutum.' },
    { id:'ts4', q:'Din Kültürü: İslam\'ın 5 şartı nelerdir?', a:'Kelime-i şehadet, namaz, oruç, zekât, hac.' },
    { id:'ts5', q:'İkinci Dünya Savaşı\'nın bitiş yılı?', a:'1945.' },
  ],
  'ayt-fen': [
    { id:'af1', q:'Elektromanyetik indüksiyon yasası (Faraday)?', a:'Değişen manyetik akı, iletken devreden EMK indükler. EMK = -dΦ/dt.' },
    { id:'af2', q:'Kimyasal denge (Le Chatelier prensibi)?', a:'Sisteme dışarıdan etki edildiğinde denge, bu etkiyi azaltacak yönde kayar.' },
    { id:'af3', q:'Mendel\'in ayrılma yasası?', a:'Her bireyin, bir karakter için iki aleli vardır; gametler oluşurken bu alleller birbirinden ayrılır.' },
    { id:'af4', q:'İdeal gaz yasası?', a:'PV = nRT' },
    { id:'af5', q:'DNA\'nın yapısı: nükleotid bileşenleri?', a:'Fosfat grubu, deoksiriboz şekeri, azotlu baz (Adenin, Timin, Guanin, Sitozin).' },
  ],
  'ayt-matematik': [
    { id:'am1', q:'Türev tanımı?', a:'f\'(x) = lim(h→0) [f(x+h) - f(x)] / h' },
    { id:'am2', q:'Çember denklemi?', a:'(x-a)² + (y-b)² = r²  —  merkez (a,b), yarıçap r.' },
    { id:'am3', q:'Toplam sembolü Σ: Σk (k=1\'den n\'e) formülü?', a:'n(n+1)/2' },
    { id:'am4', q:'sin²x + cos²x = ?', a:'1 (Trigonometrik temel özdeşlik).' },
    { id:'am5', q:'Permütasyon ve Kombinasyon farkı?', a:'Permütasyonda sıra önemli: P(n,r)=n!/(n-r)!  Kombinasyonda önemsiz: C(n,r)=n!/(r!(n-r)!).' },
  ],
  'ayt-edebiyat-sosyal1': [
    { id:'ae1', q:'Tanzimat Edebiyatı\'nın başlangıç yılı ve simgesi?', a:'1839 — Tanzimat Fermanı\'nın ilanıyla başlar.' },
    { id:'ae2', q:'Kurtuluş Savaşı\'nda Sakarya Meydan Muharebesi tarihi?', a:'1921.' },
    { id:'ae3', q:'Türkiye\'de Marmara Bölgesi\'nin genel özellikleri?', a:'En kalabalık bölge, sanayisi en gelişmiş, iklim geçiş niteliğindedir.' },
    { id:'ae4', q:'Divan edebiyatında gazel nedir?', a:'5-15 beyitten oluşan, aşk ve şarap temalarını işleyen nazım biçimi.' },
    { id:'ae5', q:'Osmanlı\'da Lale Devri hangi dönemdir?', a:'1718-1730 — III. Ahmed döneminde Batı\'ya açılma politikaları.' },
  ],
  'ayt-sosyal2': [
    { id:'as1', q:'1. Dünya Savaşı\'nın nedenleri kısaca?', a:'Milliyetçilik, emperyalizm, ittifak sistemleri, Balkan krizi ve Sarajevo suikastı.' },
    { id:'as2', q:'Karadeniz\'in genel coğrafi özellikleri?', a:'Yarı kapalı deniz, tuzluluk oranı düşük, Türk Boğazları ile bağlantılıdır.' },
    { id:'as3', q:'Kant\'ın "kategorik imperatif" ilkesi?', a:'"Eyleminin ilkesinin evrensel yasa olmasını isteyebileceğin şekilde davran."' },
    { id:'as4', q:'Psikolojide "klasik koşullanma" nedir?', a:'Pavlov: Koşulsuz uyarıcıyla birleştirilen koşullu uyarıcı zamanla aynı tepkiyi doğurur.' },
    { id:'as5', q:'Sosyolojide "sosyal tabakalaşma" nedir?', a:'Toplumun sınıflara, tabakalara ayrılması; gelir, statü ve güce göre hiyerarşik yapı.' },
  ],
}

// ── Karıştırılmış desteler ────────────────────────────────────
export const MIX_TYT  = TYT_BOLUMLER.flatMap(d => (DECK_CARDS[d.slug] || []))
export const MIX_AYT  = AYT_BOLUMLER.flatMap(d => (DECK_CARDS[d.slug] || []))
export const MIX_ALL  = [...MIX_TYT, ...MIX_AYT]

// ── SM-2 SRS Algoritması ─────────────────────────────────────
export function calcSM2(card, confidence) {
  let { interval = 1, easeFactor = 2.5 } = card
  if (confidence >= 3) {
    if (interval === 1) interval = 6
    else interval = Math.round(interval * easeFactor)
    easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - confidence) * 0.08)
  } else {
    interval = 1
  }
  const nextReview = new Date(Date.now() + interval * 86400000)
  return { interval, easeFactor, nextReview }
}

// ── Rol config ────────────────────────────────────────────────
export const ROLE_REDIRECTS = {
  admin:    '/admin',
  trainer:  '/trainer',
  support:  '/support',
  customer: '/app',
}
