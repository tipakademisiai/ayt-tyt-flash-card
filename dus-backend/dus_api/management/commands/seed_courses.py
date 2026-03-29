from django.core.management.base import BaseCommand
from dus_api.models import Course, Chapter

COURSES = [
    # TYT
    {
        'name': 'Türkçe',
        'slug': 'turkce',
        'branch_type': 'tyt',
        'description': 'Paragraf, dil bilgisi, anlam bilgisi',
        'order': 1,
        'chapters': ['Paragraf', 'Dil Bilgisi', 'Anlam Bilgisi']
    },
    {
        'name': 'Matematik',
        'slug': 'tyt-matematik',
        'branch_type': 'tyt',
        'description': 'Temel matematik, problemler, geometri',
        'order': 2,
        'chapters': ['Temel Matematik', 'Problemler', 'Geometri']
    },
    {
        'name': 'Fen Bilimleri',
        'slug': 'tyt-fen',
        'branch_type': 'tyt',
        'description': 'Fizik, kimya, biyoloji',
        'order': 3,
        'chapters': ['Fizik', 'Kimya', 'Biyoloji']
    },
    {
        'name': 'Sosyal Bilimler',
        'slug': 'tyt-sosyal',
        'branch_type': 'tyt',
        'description': 'Tarih, coğrafya, felsefe, din kültürü',
        'order': 4,
        'chapters': ['Tarih', 'Coğrafya', 'Felsefe', 'Din Kültürü ve Ahlak Bilgisi']
    },
    # AYT
    {
        'name': 'Fen Bilimleri',
        'slug': 'ayt-fen',
        'branch_type': 'ayt',
        'description': 'Fizik, kimya, biyoloji',
        'order': 5,
        'chapters': ['Fizik', 'Kimya', 'Biyoloji']
    },
    {
        'name': 'Matematik',
        'slug': 'ayt-matematik',
        'branch_type': 'ayt',
        'description': 'Matematik, geometri',
        'order': 6,
        'chapters': ['Matematik', 'Geometri']
    },
    {
        'name': 'Edebiyat – Sosyal Bilimler 1',
        'slug': 'ayt-edebiyat-sosyal1',
        'branch_type': 'ayt',
        'description': 'Türk dili ve edebiyatı, tarih-1, coğrafya-1',
        'order': 7,
        'chapters': ['Türk Dili ve Edebiyatı', 'Tarih-1', 'Coğrafya-1']
    },
    {
        'name': 'Sosyal Bilimler 2',
        'slug': 'ayt-sosyal2',
        'branch_type': 'ayt',
        'description': 'Tarih-2, coğrafya-2, felsefe grubu, din kültürü',
        'order': 8,
        'chapters': ['Tarih-2', 'Coğrafya-2', 'Felsefe', 'Psikoloji', 'Sosyoloji', 'Mantık', 'Din Kültürü ve Ahlak Bilgisi']
    },
]


class Command(BaseCommand):
    help = 'TYT ve AYT bölümlerini ve derslerini veritabanına yükler'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('TYT/AYT bölümleri yükleniyor...'))

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

            self.stdout.write(f'     → {len(chapters_data)} ders yüklendi')

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(
            f'✅ Tamamlandı! {created_count} yeni, {updated_count} güncellendi. '
            f'Toplam {len(COURSES)} bölüm.'
        ))
