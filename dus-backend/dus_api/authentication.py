"""
Cihaz kilitli JWT doğrulama.

Her giriş (login) işleminde kullanıcıya özgü bir device_token üretilir.
Bu token hem veritabanına kaydedilir hem JWT claim'lerine eklenir.

Her API isteğinde JWT'nin device_token'ı DB'dekiyle karşılaştırılır.
Farklıysa → başka cihazda oturum açılmıştır → 401 device_conflict döner.
"""

import secrets
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed


def generate_device_token() -> str:
    """
    Kriptografik olarak güvenli 64 karakterlik hex device token üretir.

    Her başarılı giriş işleminde çağrılır; üretilen token hem veritabanına
    (user.device_token) hem de JWT claim'lerine eklenir. Bu sayede yalnızca
    en son giriş yapılan cihazın token'ı geçerli olur.
    """
    return secrets.token_hex(32)


class DeviceLockedJWTAuthentication(JWTAuthentication):
    """
    Standart JWTAuthentication + tek-cihaz kontrolü.

    Akış:
      Login  → yeni device_token üretilir, DB'ye kaydedilir, JWT'ye eklenir.
      İstek  → JWT'deki device_token ile DB'deki karşılaştırılır.
               Farklıysa → başka cihazda giriş yapılmış → 401 device_conflict.
      Logout → DB'deki device_token temizlenir (null).
    """

    def get_user(self, validated_token):
        user = super().get_user(validated_token)

        token_device = validated_token.get('device_token')
        user_device  = user.device_token

        # İkisi de doluysa ve eşleşmiyorsa: başka cihaz var.
        #
        # NEDEN bu mantık doğrudur:
        #   - Logout sonrası user.device_token = None olarak sıfırlanır.
        #     Bu durumda user_device = None olacağından koşul False kalır ve
        #     kullanıcı herhangi bir cihazdan yeniden giriş yapabilir.
        #   - Yalnızca her iki taraf da dolu (non-null) ama farklıysa çakışma
        #     tespiti yapılır; bu, cihaz geçişlerini (logout + login) engel olmadan
        #     sağlar ve sadece aktif oturumların çakışmasını yakalar.
        if token_device and user_device and token_device != user_device:
            raise AuthenticationFailed(
                detail={
                    'detail': 'Bu hesap başka bir cihazda oturum açtı. '
                              'Lütfen tekrar giriş yapın.',
                    'code': 'device_conflict',
                }
            )

        return user
