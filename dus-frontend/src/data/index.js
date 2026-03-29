// ── TYT / AYT Bölümleri ─────────────────────────────────────
export const TYT_BOLUMLER = [
  { id: 1, slug: 'turkce', name: 'Türkçe', cards: 120, done: 0, pending: 0, srs: [0,0,0,0,0],
    dersler: [
      { slug: 'turkce-paragraf',      name: 'Paragraf',      cards: 40 },
      { slug: 'turkce-dilbilgisi',    name: 'Dil Bilgisi',   cards: 40 },
      { slug: 'turkce-anlambilgisi',  name: 'Anlam Bilgisi', cards: 40 },
    ]
  },
  { id: 2, slug: 'tyt-matematik', name: 'Matematik', cards: 100, done: 0, pending: 0, srs: [0,0,0,0,0],
    dersler: [
      { slug: 'tyt-mat-temel',    name: 'Temel Matematik', cards: 35 },
      { slug: 'tyt-mat-problem',  name: 'Problemler',      cards: 35 },
      { slug: 'tyt-mat-geometri', name: 'Geometri',        cards: 30 },
    ]
  },
  { id: 3, slug: 'tyt-fen', name: 'Fen Bilimleri', cards: 90, done: 0, pending: 0, srs: [0,0,0,0,0],
    dersler: [
      { slug: 'tyt-fizik',    name: 'Fizik',    cards: 30 },
      { slug: 'tyt-kimya',    name: 'Kimya',    cards: 30 },
      { slug: 'tyt-biyoloji', name: 'Biyoloji', cards: 30 },
    ]
  },
  { id: 4, slug: 'tyt-sosyal', name: 'Sosyal Bilimler', cards: 80, done: 0, pending: 0, srs: [0,0,0,0,0],
    dersler: [
      { slug: 'tyt-tarih',    name: 'Tarih',                          cards: 20 },
      { slug: 'tyt-cografya', name: 'Coğrafya',                       cards: 20 },
      { slug: 'tyt-felsefe',  name: 'Felsefe',                        cards: 20 },
      { slug: 'tyt-din',      name: 'Din Kültürü ve Ahlak Bilgisi',   cards: 20 },
    ]
  },
]

export const AYT_BOLUMLER = [
  { id: 5, slug: 'ayt-fen', name: 'Fen Bilimleri', cards: 110, done: 0, pending: 0, srs: [0,0,0,0,0],
    dersler: [
      { slug: 'ayt-fizik',    name: 'Fizik',    cards: 37 },
      { slug: 'ayt-kimya',    name: 'Kimya',    cards: 37 },
      { slug: 'ayt-biyoloji', name: 'Biyoloji', cards: 36 },
    ]
  },
  { id: 6, slug: 'ayt-matematik', name: 'Matematik', cards: 95, done: 0, pending: 0, srs: [0,0,0,0,0],
    dersler: [
      { slug: 'ayt-mat-matematik', name: 'Matematik', cards: 50 },
      { slug: 'ayt-mat-geometri',  name: 'Geometri',  cards: 45 },
    ]
  },
  { id: 7, slug: 'ayt-edebiyat-sosyal1', name: 'Edebiyat – Sosyal Bil. 1', cards: 85, done: 0, pending: 0, srs: [0,0,0,0,0],
    dersler: [
      { slug: 'ayt-edebiyat',  name: 'Türk Dili ve Edebiyatı', cards: 30 },
      { slug: 'ayt-tarih1',    name: 'Tarih-1',                cards: 28 },
      { slug: 'ayt-cografya1', name: 'Coğrafya-1',             cards: 27 },
    ]
  },
  { id: 8, slug: 'ayt-sosyal2', name: 'Sosyal Bilimler 2', cards: 100, done: 0, pending: 0, srs: [0,0,0,0,0],
    dersler: [
      { slug: 'ayt-tarih2',    name: 'Tarih-2',                        cards: 16 },
      { slug: 'ayt-cografya2', name: 'Coğrafya-2',                     cards: 14 },
      { slug: 'ayt-felsefe',   name: 'Felsefe',                        cards: 14 },
      { slug: 'ayt-psikoloji', name: 'Psikoloji',                      cards: 14 },
      { slug: 'ayt-sosyoloji', name: 'Sosyoloji',                      cards: 14 },
      { slug: 'ayt-mantik',    name: 'Mantık',                         cards: 14 },
      { slug: 'ayt-din',       name: 'Din Kültürü ve Ahlak Bilgisi',   cards: 14 },
    ]
  },
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

// ── Flash Kartları (her ders için örnek kartlar) ───────────────────
export const DECK_CARDS = {
  // TYT Türkçe
  'turkce-paragraf': [
    { id:'tp1', q:'Paragrafta ana fikir nerede bulunur?', a:'Genellikle başta veya sonda; bazen tümüne yayılır.' },
    { id:'tp2', q:'Yardımcı fikir nedir?', a:'Ana fikri destekleyen, açıklayan veya örnekleyen cümlelerdir.' },
    { id:'tp3', q:'"Konu" ile "Ana fikir" farkı?', a:'Konu tek sözcük/öbek; ana fikir tam cümleyle ifade edilir.' },
  ],
  'turkce-dilbilgisi': [
    { id:'td1', q:'Fiilimsi türleri nelerdir?', a:'İsim-fiil, sıfat-fiil, zarf-fiil.' },
    { id:'td2', q:'Ad tamlaması türleri?', a:'Belirtili, belirtisiz, zincirleme.' },
    { id:'td3', q:'Anlatım bozukluğu türleri?', a:'Özne-yüklem uyumsuzluğu, gereksiz sözcük, anlam belirsizliği.' },
  ],
  'turkce-anlambilgisi': [
    { id:'ta1', q:'Mecaz anlam nedir?', a:'Sözcüğün gerçek anlamı dışında kullanılmasıdır.' },
    { id:'ta2', q:'Deyim nedir?', a:'En az iki sözcükten oluşan, gerçek anlamından uzaklaşmış kalıplaşmış söz.' },
    { id:'ta3', q:'Atasözü ile deyim farkı?', a:'Atasözü yargı bildirir; deyim yalnızca anlam aktarır.' },
  ],
  // TYT Matematik
  'tyt-mat-temel': [
    { id:'tm1', q:'Kareler farkı formülü?', a:'a² - b² = (a+b)(a-b)' },
    { id:'tm2', q:'EBOB × EKOK = ?', a:'İki sayının çarpımına eşittir.' },
    { id:'tm3', q:'Mutlak değer |x| tanımı?', a:'x≥0 ise x, x<0 ise -x.' },
  ],
  'tyt-mat-problem': [
    { id:'tp1', q:'Hız-Zaman-Mesafe formülü?', a:'M = H × Z' },
    { id:'tp2', q:'Yüzde artış formülü?', a:'Yeni değer = Eski × (1 + oran/100)' },
    { id:'tp3', q:'İşçi havuzu probleminde birlikte tamamlama?', a:'1/A + 1/B = 1/T (T = birlikte tamamlama süresi)' },
  ],
  'tyt-mat-geometri': [
    { id:'tg1', q:'Üçgende iç açılar toplamı?', a:'180°' },
    { id:'tg2', q:'Dörtgende iç açılar toplamı?', a:'360°' },
    { id:'tg3', q:'Dairenin alanı?', a:'A = π × r²' },
  ],
  // TYT Fen
  'tyt-fizik': [
    { id:'tf1', q:'Newton\'un 1. Yasası?', a:'Net kuvvet sıfırsa cisim durur ya da sabit hızla hareket eder.' },
    { id:'tf2', q:'Ohm Kanunu?', a:'V = I × R' },
    { id:'tf3', q:'Kinetik enerji formülü?', a:'Ek = ½mv²' },
  ],
  'tyt-kimya': [
    { id:'tk1', q:'Atom numarası neyi gösterir?', a:'Proton sayısını.' },
    { id:'tk2', q:'Mol nedir?', a:'6,022×10²³ tanecik (Avogadro sayısı).' },
    { id:'tk3', q:'Asit-baz indikatörü turnusol nasıl değişir?', a:'Asitte kırmızı, bazda mavi olur.' },
  ],
  'tyt-biyoloji': [
    { id:'tb1', q:'Fotosentez denklemi?', a:'6CO₂ + 6H₂O + ışık → C₆H₁₂O₆ + 6O₂' },
    { id:'tb2', q:'Mitoz sonucu kaç hücre?', a:'2 adet diploid (2n) hücre.' },
    { id:'tb3', q:'Mayoz sonucu kaç hücre?', a:'4 adet haploid (n) hücre.' },
  ],
  // TYT Sosyal
  'tyt-tarih': [
    { id:'ttar1', q:'Osmanlı\'nın kuruluş yılı?', a:'1299.' },
    { id:'ttar2', q:'Kurtuluş Savaşı hangi antlaşmayla bitti?', a:'Lozan Antlaşması (1923).' },
    { id:'ttar3', q:'İstanbul\'un fethi hangi yılda, kim tarafından gerçekleştirildi?', a:'1453 yılında Fatih Sultan Mehmet tarafından.' },
  ],
  'tyt-cografya': [
    { id:'tcog1', q:'Türkiye\'nin en uzun nehri?', a:'Kızılırmak (1355 km).' },
    { id:'tcog2', q:'Türkiye kaç iklim bölgesine sahiptir?', a:'Dört farklı iklim tipi vardır.' },
    { id:'tcog3', q:'Türkiye\'nin en büyük gölü hangisidir?', a:'Van Gölü (3713 km²).' },
  ],
  'tyt-felsefe': [
    { id:'tfel1', q:'Empirizm nedir?', a:'Bilginin kaynağının deney ve gözlem olduğunu savunan akım.' },
    { id:'tfel2', q:'Rasyonalizm nedir?', a:'Bilginin kaynağının akıl olduğunu savunan akım.' },
    { id:'tfel3', q:'Sokrates\'in "bilgelik" anlayışı nedir?', a:'"Tek bildiğim, hiçbir şey bilmediğimdir." — Bilgelik cahilliğin farkında olmaktır.' },
  ],
  'tyt-din': [
    { id:'tdin1', q:'İslam\'ın 5 şartı?', a:'Kelime-i şehadet, namaz, oruç, zekât, hac.' },
    { id:'tdin2', q:'İnanç esasları kaç tanedir?', a:'6 iman esası.' },
    { id:'tdin3', q:'Hristiyan inancında Kutsal Kitap\'ın bölümleri?', a:'Eski Ahit (Tevrat) ve Yeni Ahit (İncil) olmak üzere iki bölümden oluşur.' },
  ],
  // AYT Fen
  'ayt-fizik': [
    { id:'af1', q:'Faraday İndüksiyon Yasası?', a:'Değişen manyetik akı EMK indükler: EMK = -dΦ/dt.' },
    { id:'af2', q:'Coulomb Kanunu?', a:'F = k × q₁q₂ / r²' },
    { id:'af3', q:'İdeal gaz yasası?', a:'PV = nRT' },
  ],
  'ayt-kimya': [
    { id:'ak1', q:'Le Chatelier prensibi?', a:'Dengeye etki edildiğinde denge, etkiyi azaltacak yönde kayar.' },
    { id:'ak2', q:'pH = ?', a:'pH = -log[H⁺]' },
    { id:'ak3', q:'Organik kimyada izomer nedir?', a:'Aynı molekül formülüne sahip farklı yapıdaki bileşikler.' },
  ],
  'ayt-biyoloji': [
    { id:'ab1', q:'DNA replikasyonu neden semi-konservatiftir?', a:'Yeni molekülde bir eski bir yeni iplik bulunur.' },
    { id:'ab2', q:'Mendel\'in ayrılma yasası?', a:'Alleller gametlere ayrılır; her gamette birer alel bulunur.' },
    { id:'ab3', q:'Enzim aktivitesini etkileyen faktörler?', a:'Sıcaklık, pH, substrat konsantrasyonu, inhibitörler.' },
  ],
  // AYT Matematik
  'ayt-mat-matematik': [
    { id:'am1', q:'Türev tanımı?', a:'f\'(x) = lim(h→0)[f(x+h)-f(x)]/h' },
    { id:'am2', q:'∫xⁿ dx = ?', a:'xⁿ⁺¹/(n+1) + C' },
    { id:'am3', q:'Logaritma: log_a(xy) = ?', a:'log_a(x) + log_a(y)' },
  ],
  'ayt-mat-geometri': [
    { id:'ag1', q:'Çember denklemi?', a:'(x-a)² + (y-b)² = r²' },
    { id:'ag2', q:'sin²x + cos²x = ?', a:'1' },
    { id:'ag3', q:'Vektörde nokta çarpım?', a:'a·b = |a||b|cosθ' },
  ],
  // AYT Edebiyat-Sosyal 1
  'ayt-edebiyat': [
    { id:'ae1', q:'Tanzimat Edebiyatı başlangıç tarihi?', a:'1839 (Tanzimat Fermanı).' },
    { id:'ae2', q:'Servet-i Fünun önemli isimleri?', a:'Tevfik Fikret, Halit Ziya Uşaklıgil.' },
    { id:'ae3', q:'Gazel nedir?', a:'5-15 beyitten oluşan, aşk ve şarap temalarını işleyen nazım biçimi.' },
  ],
  'ayt-tarih1': [
    { id:'at1', q:'Lale Devri hangi yıllar arasındadır?', a:'1718-1730.' },
    { id:'at2', q:'Meşrutiyet kaç kez ilan edildi?', a:'2 kez (1876 ve 1908).' },
    { id:'at3', q:'Osmanlı\'da Tanzimat Fermanı hangi padişah döneminde, kaçıncı yılda ilan edildi?', a:'Sultan Abdülmecit döneminde, 1839\'da ilan edildi.' },
  ],
  'ayt-cografya1': [
    { id:'ac1', q:'Akdeniz ikliminin özellikleri?', a:'Yazlar sıcak-kuru, kışlar ılık-yağışlı.' },
    { id:'ac2', q:'Türkiye\'nin en yüksek dağı?', a:'Ağrı Dağı (5137 m).' },
    { id:'ac3', q:'Türkiye\'nin coğrafi bölge sayısı ve isimleri?', a:'7 coğrafi bölge: Marmara, Ege, Akdeniz, İç Anadolu, Karadeniz, Doğu Anadolu, Güneydoğu Anadolu.' },
  ],
  // AYT Sosyal 2
  'ayt-tarih2': [
    { id:'as1', q:'1. Dünya Savaşı\'nın başlangıç nedeni?', a:'Sarajevo suikastı (1914) ve ittifak sistemi.' },
    { id:'as2', q:'Soğuk Savaş hangi yıllarda yaşandı?', a:'1947-1991.' },
    { id:'as3', q:'Fransız Devrimi\'nin temel ilkeleri nelerdir?', a:'Özgürlük (Liberté), Eşitlik (Égalité), Kardeşlik (Fraternité).' },
  ],
  'ayt-cografya2': [
    { id:'aco1', q:'Karadeniz\'in özellikleri?', a:'Yarı kapalı deniz, tuzluluk düşük, Boğazlarla bağlı.' },
    { id:'aco2', q:'Türkiye\'de nüfus yoğunluğu en fazla bölge?', a:'Marmara Bölgesi.' },
    { id:'aco3', q:'Dünya\'nın en uzun nehri ve kıtası?', a:'Nil Nehri (Afrika) — yaklaşık 6650 km.' },
  ],
  'ayt-felsefe': [
    { id:'afel1', q:'Kant\'ın kategorik imperatifi?', a:'"Eyleminin ilkesi evrensel yasa olabilsin."' },
    { id:'afel2', q:'Varoluşçuluk kurucusu?', a:'Jean-Paul Sartre (Kierkegaard öncüsü kabul edilir).' },
    { id:'afel3', q:'Platon\'un "idealar" kuramı nedir?', a:'Gerçek dünyanın duyularla değil akılla kavranabilen değişmez "idea"lardan oluştuğunu savunur.' },
  ],
  'ayt-psikoloji': [
    { id:'apsi1', q:'Klasik koşullanma nedir?', a:'Pavlov: koşulsuz uyarıcıyla eşleşen koşullu uyarıcı zamanla aynı tepkiyi doğurur.' },
    { id:'apsi2', q:'Savunma mekanizmaları nedir?', a:'Bireyin kaygıya karşı bilinçdışı tepkileri; yansıtma, inkâr, bastırma örneklerdir.' },
    { id:'apsi3', q:'Maslow\'un ihtiyaçlar hiyerarşisi basamakları?', a:'Fizyolojik → Güvenlik → Ait olma → Saygı → Kendini gerçekleştirme.' },
  ],
  'ayt-sosyoloji': [
    { id:'asos1', q:'Sosyal tabakalaşma nedir?', a:'Toplumun gelir, statü ve güce göre hiyerarşik katmanlara ayrılmasıdır.' },
    { id:'asos2', q:'Sosyalizasyon nedir?', a:'Bireyin toplumun değer ve normlarını içselleştirme sürecidir.' },
    { id:'asos3', q:'Durkheim\'a göre "anomi" nedir?', a:'Toplumsal normların çöküşü/belirsizleşmesi sonucu bireyin yönelim kaybetmesidir.' },
  ],
  'ayt-mantik': [
    { id:'aman1', q:'Tümevarım nedir?', a:'Özelden genele ulaşan çıkarım.' },
    { id:'aman2', q:'Tümdengelim nedir?', a:'Genelden özele ulaşan çıkarım.' },
    { id:'aman3', q:'Kıyas (silogizm) nedir? Örnek ver.', a:'İki önermeden sonuç çıkarmak. Örnek: "Tüm insanlar ölümlüdür. Sokrates insandır. Öyleyse Sokrates ölümlüdür."' },
  ],
  'ayt-din': [
    { id:'adin1', q:'Dört büyük halife sırası?', a:'Hz. Ebubekir, Hz. Ömer, Hz. Osman, Hz. Ali.' },
    { id:'adin2', q:'Hicret nedir ve tarihi?', a:'Hz. Muhammed\'in Mekke\'den Medine\'ye göçü, 622 yılında gerçekleşmiştir.' },
    { id:'adin3', q:'İslam\'da "itikat" ile "amel" arasındaki fark?', a:'İtikat: kalple inanç (iman esasları). Amel: bedenle yapılan ibadetler ve davranışlar.' },
  ],
}

// ── Karıştırılmış desteler ────────────────────────────────────
export const MIX_TYT  = TYT_BOLUMLER.flatMap(b => b.dersler.flatMap(d => DECK_CARDS[d.slug] || []))
export const MIX_AYT  = AYT_BOLUMLER.flatMap(b => b.dersler.flatMap(d => DECK_CARDS[d.slug] || []))
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

// ── CSV İmport: Ders adı → slug eşleştirme ───────────────────
// Tüm key'ler normalize (büyük harf + Türkçe karakter normalize) olarak tutulur
export const DERS_SLUG_MAP = {
  // TYT Türkçe
  'TYT|PARAGRAF':                         'turkce-paragraf',
  'TYT|DIL BILGISI':                      'turkce-dilbilgisi',
  'TYT|ANLAM BILGISI':                    'turkce-anlambilgisi',
  'TYT|TURKCE':                           'turkce-paragraf',   // bölüm bazlı fallback
  // TYT Matematik
  'TYT|TEMEL MATEMATIK':                  'tyt-mat-temel',
  'TYT|PROBLEMLER':                       'tyt-mat-problem',
  'TYT|GEOMETRI':                         'tyt-mat-geometri',
  'TYT|MATEMATIK':                        'tyt-mat-temel',
  // TYT Fen
  'TYT|FIZIK':                            'tyt-fizik',
  'TYT|KIMYA':                            'tyt-kimya',
  'TYT|BIYOLOJI':                         'tyt-biyoloji',
  // TYT Sosyal
  'TYT|TARIH':                            'tyt-tarih',
  'TYT|COGRAFYA':                         'tyt-cografya',
  'TYT|FELSEFE':                          'tyt-felsefe',
  'TYT|DIN KULTURU VE AHLAK BILGISI':     'tyt-din',
  'TYT|DIN KULTURU':                      'tyt-din',
  'TYT|DIN':                              'tyt-din',
  // AYT Fen
  'AYT|FIZIK':                            'ayt-fizik',
  'AYT|KIMYA':                            'ayt-kimya',
  'AYT|BIYOLOJI':                         'ayt-biyoloji',
  // AYT Matematik
  'AYT|MATEMATIK':                        'ayt-mat-matematik',
  'AYT|GEOMETRI':                         'ayt-mat-geometri',
  // AYT Edebiyat-Sosyal 1
  'AYT|TURK DILI VE EDEBIYATI':           'ayt-edebiyat',
  'AYT|EDEBIYAT':                         'ayt-edebiyat',
  'AYT|TURKCE':                           'ayt-edebiyat',     // BÖLÜM=TÜRKÇE, KATEGORİ=AYT
  'AYT|PARAGRAF':                         'ayt-edebiyat',     // DERS=PARAGRAF, KATEGORİ=AYT
  'AYT|DIL BILGISI':                      'ayt-edebiyat',
  'AYT|ANLAM BILGISI':                    'ayt-edebiyat',
  'AYT|TARIH-1':                          'ayt-tarih1',
  'AYT|TARIH 1':                          'ayt-tarih1',
  'AYT|COGRAFYA-1':                       'ayt-cografya1',
  'AYT|COGRAFYA 1':                       'ayt-cografya1',
  // AYT Sosyal 2
  'AYT|TARIH-2':                          'ayt-tarih2',
  'AYT|TARIH 2':                          'ayt-tarih2',
  'AYT|COGRAFYA-2':                       'ayt-cografya2',
  'AYT|COGRAFYA 2':                       'ayt-cografya2',
  'AYT|FELSEFE':                          'ayt-felsefe',
  'AYT|PSIKOLOJI':                        'ayt-psikoloji',
  'AYT|SOSYOLOJI':                        'ayt-sosyoloji',
  'AYT|MANTIK':                           'ayt-mantik',
  'AYT|DIN KULTURU VE AHLAK BILGISI':     'ayt-din',
  'AYT|DIN KULTURU':                      'ayt-din',
  'AYT|DIN':                              'ayt-din',
}

// Türkçe karakterleri ASCII'ye normalize et: Ş→S, Ğ→G, İ→I, Ü→U, Ö→O, Ç→C
function normalizeTR(str) {
  return (str || '')
    .toUpperCase()
    .replace(/Ş/g, 'S').replace(/Ğ/g, 'G').replace(/İ/g, 'I').replace(/I/g, 'I')
    .replace(/Ü/g, 'U').replace(/Ö/g, 'O').replace(/Ç/g, 'C')
    .trim()
}

export function csvRowToSlug(kategori, ders, bolum) {
  // 1. Önce KATEGORİ|DERS ile dene
  const k = normalizeTR(kategori)
  const d = normalizeTR(ders)
  const b = normalizeTR(bolum)
  const key1 = `${k}|${d}`
  if (DERS_SLUG_MAP[key1]) return DERS_SLUG_MAP[key1]
  // 2. KATEGORİ|BÖLÜM ile fallback
  const key2 = `${k}|${b}`
  if (DERS_SLUG_MAP[key2]) return DERS_SLUG_MAP[key2]
  return null
}

// ── CSV Metni Parse Et ────────────────────────────────────────
// Sütunlar: A=BAŞLIK  B=SORU  C=AÇIKLAMA  D=KATEGORİ  E=BÖLÜM  F=DERS
export function parseFlashcardCSV(text) {
  const sep = text.indexOf(';') !== -1 ? ';' : ','
  const lines = text.trim().split(/\r?\n/)
  if (!lines.length) return []

  const HDRS = ['BAŞLIK','BASLIK','SORU','AÇIKLAMA','ACIKLAMA','KATEGORİ','KATEGORI','BÖLÜM','BOLUM','DERS']
  const firstCells = lines[0].split(sep).map(c => c.trim().replace(/^["']|["']$/g, '').toUpperCase())
  const hasHeader = firstCells.some(c => HDRS.includes(c))
  const dataLines = hasHeader ? lines.slice(1) : lines

  const ts = Date.now()
  const cards = []
  dataLines.forEach((line, i) => {
    if (!line.trim()) return
    const cols = []; let cur = '', inQ = false
    for (let ci = 0; ci < line.length; ci++) {
      const ch = line[ci]
      if ((ch === '"' || ch === "'") && !inQ) inQ = true
      else if ((ch === '"' || ch === "'") && inQ) inQ = false
      else if (ch === sep && !inQ) { cols.push(cur.trim()); cur = '' }
      else cur += ch
    }
    cols.push(cur.trim())

    const baslik   = cols[0] || ''
    const soru     = cols[1] || ''
    const aciklama = cols[2] || ''
    const kategori = (cols[3] || '').trim()
    const bolum    = (cols[4] || '').trim()
    const ders     = (cols[5] || '').trim()

    if (!soru) return
    cards.push({
      id: `csv_${ts}_${i}`, baslik, q: soru,
      a: aciklama || soru,
      kategori: kategori.toUpperCase(), bolum, ders,
      slug: csvRowToSlug(kategori, ders, bolum),
    })
  })
  return cards
}

// ── localStorage: Import edilmiş kartlar ─────────────────────
const LS_KEY = 'ayttyt_imported_v1'

export function getImportedCards(slug) {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}')[slug] || [] }
  catch { return [] }
}

export function saveImportedCards(cardsBySlug) {
  try {
    const merged = { ...JSON.parse(localStorage.getItem(LS_KEY) || '{}') }
    Object.entries(cardsBySlug).forEach(([slug, newCards]) => {
      merged[slug] = [...(merged[slug] || []), ...newCards]
    })
    localStorage.setItem(LS_KEY, JSON.stringify(merged))
    return Object.values(cardsBySlug).flat().length
  } catch { return 0 }
}

export function getAllImportedCards() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') }
  catch { return {} }
}

export function clearImportedCards() { localStorage.removeItem(LS_KEY) }
