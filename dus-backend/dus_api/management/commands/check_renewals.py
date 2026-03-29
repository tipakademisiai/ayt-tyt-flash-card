"""
Management command: Süresi dolan abonelikleri otomatik yenile.

Çalıştırma:
    python manage.py check_renewals            # Bugün sona eren + 1 gün içinde bitenler
    python manage.py check_renewals --dry-run  # Sadece rapor, değişiklik yapma

Cron örneği (her gün 02:00'de):
    0 2 * * * /path/to/venv/bin/python manage.py check_renewals >> /var/log/renewals.log 2>&1

Celery Beat örneği (settings.py'de):
    CELERY_BEAT_SCHEDULE = {
        'check-renewals': {
            'task': 'dus_api.tasks.check_renewals',
            'schedule': crontab(hour=2, minute=0),
        }
    }

TODO: Gerçek ödeme alımı için İyzico/Stripe entegrasyonu ekle.
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from dus_api.models import Subscription


PLAN_PRICES = {
    'pro':       {'monthly': 499, 'yearly': 4490},
    'standart':  {'monthly': 449, 'yearly': 3990},
    'baslangic': {'monthly': 149, 'yearly': 1290},
    'trial':     {'monthly': 0,   'yearly': 0},
}


class Command(BaseCommand):
    help = 'Süresi dolan ve auto_renew=True olan abonelikleri yenile'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            dest='dry_run',
            help='Değişiklik yapmadan sadece rapor göster',
        )
        parser.add_argument(
            '--days-ahead',
            type=int,
            default=1,
            dest='days_ahead',
            help='Kaç gün önceden kontrol edilsin (varsayılan: 1)',
        )

    def handle(self, *args, **options):
        dry_run    = options['dry_run']
        days_ahead = options['days_ahead']
        now        = timezone.now()
        window_end = now + timedelta(days=days_ahead)

        # Yenilenmesi gereken abonelikler:
        # - Aktif ve bitiş tarihi pencere içinde
        # - auto_renew=True
        # - trial dışı (ücretsiz deneme yenilenmez)
        expiring = Subscription.objects.filter(
            status='active',
            auto_renew=True,
            ends_at__lte=window_end,
            ends_at__gte=now,
        ).exclude(plan='trial').select_related('user')

        self.stdout.write(
            f'[check_renewals] {now.strftime("%Y-%m-%d %H:%M")} — '
            f'{expiring.count()} abonelik yenileme adayı bulundu'
            + (' (DRY RUN)' if dry_run else '')
        )

        renewed = 0
        errors  = 0

        for sub in expiring:
            user = sub.user
            try:
                # ── ÖDEME AŞAMASI (TODO: gerçek entegrasyon) ──────────
                prices    = PLAN_PRICES.get(sub.plan, {})
                price     = prices.get('yearly' if sub.is_yearly else 'monthly', 0)
                duration  = timedelta(days=365 if sub.is_yearly else 30)

                # TODO: payment_gateway.charge(user, price)
                # Eğer ödeme başarısız olursa: sub.status = 'expired'; sub.save(); continue

                if not dry_run:
                    # Eski aboneliği kapat
                    sub.status = 'cancelled'
                    sub.save()

                    # Yeni abonelik oluştur (eski aboneliğin bitiş tarihinden itibaren)
                    new_sub = Subscription.objects.create(
                        user=user,
                        plan=sub.plan,
                        status='active',
                        starts_at=sub.ends_at,
                        ends_at=sub.ends_at + duration,
                        price_paid=price,
                        is_yearly=sub.is_yearly,
                        auto_renew=True,
                        renewed_from=sub,
                    )
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'  ✓ {user.email} — {sub.plan} yenilendi '
                            f'→ {new_sub.ends_at.strftime("%Y-%m-%d")} '
                            f'(₺{price})'
                        )
                    )
                else:
                    self.stdout.write(
                        f'  [DRY] {user.email} — {sub.plan} — '
                        f'bitiş {sub.ends_at.strftime("%Y-%m-%d")} — ₺{price}'
                    )

                renewed += 1

            except Exception as exc:
                errors += 1
                self.stderr.write(
                    self.style.ERROR(
                        f'  ✗ {user.email} — HATA: {exc}'
                    )
                )

        self.stdout.write(
            f'[check_renewals] Tamamlandı — '
            f'{renewed} yenileme{"" if dry_run else " yapıldı"}, '
            f'{errors} hata'
        )
