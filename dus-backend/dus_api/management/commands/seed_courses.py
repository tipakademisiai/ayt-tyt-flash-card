from django.core.management.base import BaseCommand
from dus_api.models import Course, Chapter

COURSES = [
    # ── Temel Bilimler ──────────────────────────────────────────
    {
        'name': 'Anatomi',
        'slug': 'anatomi',
        'branch_type': 'temel',
        'description': 'Baş-boyun anatomisi, sinir sistemi, damar sistemi',
        'order': 1,
        'chapters': [
            'Baş-Boyun Anatomisi',
            'Kranial Sinirler',
            'Temporomandibular Eklem',
            'Diş Anatomisi',
            'Tükürük Bezleri',
        ]
    },
    {
        'name': 'Fizyoloji',
        'slug': 'fizyoloji',
        'branch_type': 'temel',
        'description': 'Vücut sistemlerinin işleyişi, homeostaz',
        'order': 2,
        'chapters': [
            'Sinir Fizyolojisi',
            'Kas Fizyolojisi',
            'Kardiyovasküler Fizyoloji',
            'Tükürük Fizyolojisi',
            'Ağrı Fizyolojisi',
        ]
    },
    {
        'name': 'Biyokimya & Genetik',
        'slug': 'biyokimya-genetik',
        'branch_type': 'temel',
        'description': 'Temel biyokimya, moleküler biyoloji, genetik',
        'order': 3,
        'chapters': [
            'Karbonhidrat Metabolizması',
            'Protein Yapısı ve Fonksiyonu',
            'Nükleik Asitler',
            'Enzimler',
            'Temel Genetik',
        ]
    },
    {
        'name': 'Mikrobiyoloji',
        'slug': 'mikrobiyoloji',
        'branch_type': 'temel',
        'description': 'Oral mikrobiyota, enfeksiyon hastalıkları',
        'order': 4,
        'chapters': [
            'Oral Mikrobiyota',
            'Bakteriyoloji',
            'Viroloji',
            'Mantar Enfeksiyonları',
            'Sterilizasyon ve Dezenfeksiyon',
        ]
    },
    {
        'name': 'Patoloji',
        'slug': 'patoloji',
        'branch_type': 'temel',
        'description': 'Genel patoloji, oral patoloji',
        'order': 5,
        'chapters': [
            'Hücre Hasarı ve Ölümü',
            'İnflamasyon',
            'Neoplazi',
            'Oral Mukoza Hastalıkları',
            'Tükürük Bezi Patolojisi',
        ]
    },
    {
        'name': 'Farmakoloji',
        'slug': 'farmakoloji',
        'branch_type': 'temel',
        'description': 'Diş hekimliğinde ilaç kullanımı',
        'order': 6,
        'chapters': [
            'Antibiyotikler',
            'Analjezikler',
            'Lokal Anestezikler',
            'Antiseptikler',
            'Ağız Kuruluğu İlaçları',
        ]
    },
    # ── Klinik Bilimler ─────────────────────────────────────────
    {
        'name': 'Protetik Diş Tedavisi',
        'slug': 'protetik-dis-tedavisi',
        'branch_type': 'klinik',
        'description': 'Sabit, hareketli ve implant üstü protezler',
        'order': 7,
        'chapters': [
            'Sabit Protez Prensipleri',
            'Tam Protez',
            'Parsiyel Protez',
            'İmplant Üstü Protez',
            'Estetik Diş Hekimliği',
        ]
    },
    {
        'name': 'Ağız Diş Çene Cerrahisi',
        'slug': 'agiz-dis-cene-cerrahisi',
        'branch_type': 'klinik',
        'description': 'Diş çekimi, implant, ortognatik cerrahi',
        'order': 8,
        'chapters': [
            'Diş Çekimi Prensipleri',
            'Gömük Diş Cerrahisi',
            'İmplant Cerrahisi',
            'Kist ve Tümör Cerrahisi',
            'Ortognatik Cerrahi',
        ]
    },
    {
        'name': 'Ortodonti',
        'slug': 'ortodonti',
        'branch_type': 'klinik',
        'description': 'Maloklüzyon sınıflaması, tedavi prensipleri',
        'order': 9,
        'chapters': [
            'Büyüme ve Gelişim',
            'Maloklüzyon Sınıflaması',
            'Sefalometri',
            'Sabit Ortodontik Tedavi',
            'Hareketli Apareyler',
        ]
    },
    {
        'name': 'Endodonti',
        'slug': 'endodonti',
        'branch_type': 'klinik',
        'description': 'Kök kanal tedavisi, pulpa patolojisi',
        'order': 10,
        'chapters': [
            'Pulpa Anatomisi',
            'Pulpa Patolojisi',
            'Kök Kanal Tedavisi',
            'Endodontik Aciller',
            'Retreatment',
        ]
    },
    {
        'name': 'Restoratif Diş Tedavisi',
        'slug': 'restoratif-dis-tedavisi',
        'branch_type': 'klinik',
        'description': 'Çürük tedavisi, restorasyon materyalleri',
        'order': 11,
        'chapters': [
            'Diş Çürüğü',
            'Kavite Preparasyonu',
            'Kompozit Rezin',
            'Amalgam',
            'Dental Materyaller',
        ]
    },
    {
        'name': 'Pedodonti',
        'slug': 'pedodonti',
        'branch_type': 'klinik',
        'description': 'Çocuk diş hekimliği, süt dişi tedavileri',
        'order': 12,
        'chapters': [
            'Süt Dişleri Anatomisi',
            'Çocuk Hasta Yönetimi',
            'Pulpa Tedavileri',
            'Yer Tutucular',
            'Çocuklarda Travma',
        ]
    },
    {
        'name': 'Ağız Diş Çene Radyolojisi',
        'slug': 'agiz-dis-cene-radyolojisi',
        'branch_type': 'klinik',
        'description': 'Dental radyografi, CBCT, radyolojik yorumlama',
        'order': 13,
        'chapters': [
            'Radyasyon Fiziği',
            'Periapikal Radyografi',
            'Panoramik Radyografi',
            'CBCT',
            'Radyolojik Yorumlama',
        ]
    },
    {
        'name': 'Periodontoloji',
        'slug': 'periodontoloji',
        'branch_type': 'klinik',
        'description': 'Periodontal hastalıklar, tedavi protokolleri',
        'order': 14,
        'chapters': [
            'Periodonsiyum Anatomisi',
            'Hastalık Sınıflaması (2017)',
            'Periodontitis — Klinik Bulgular',
            'Tedavi Protokolleri',
            'Destekleyici Periodontal Tedavi',
        ]
    },
]


class Command(BaseCommand):
    help = '14 DUS dersini ve chapter\'larını veritabanına yükler'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('DUS dersleri yükleniyor...'))
        
        created_count = 0
        updated_count = 0

        for course_data in COURSES:
            chapters_data = course_data.pop('chapters', [])
            
            course, created = Course.objects.update_or_create(
                slug=course_data['slug'],
                defaults=course_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(f'  ✅ Oluşturuldu: {course.name}')
            else:
                updated_count += 1
                self.stdout.write(f'  🔄 Güncellendi: {course.name}')
            
            # Chapter'ları yükle
            for i, chapter_name in enumerate(chapters_data):
                Chapter.objects.get_or_create(
                    course=course,
                    name=chapter_name,
                    defaults={'order': i + 1}
                )
            
            self.stdout.write(f'     → {len(chapters_data)} bölüm yüklendi')

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(
            f'✅ Tamamlandı! {created_count} yeni, {updated_count} güncellendi. '
            f'Toplam {len(COURSES)} ders, {sum(len(COURSES[i].get("chapters", [])) for i in range(len(COURSES)))} bölüm.'
        ))
