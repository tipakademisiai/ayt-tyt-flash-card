from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    """Sadece admin rolü"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsTrainer(BasePermission):
    """Sadece eğitmen rolü"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'trainer'


class IsSupport(BasePermission):
    """Sadece müşteri hizmetleri rolü"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'support'


class IsCustomer(BasePermission):
    """Sadece müşteri rolü"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'customer'


class IsAdminOrSupport(BasePermission):
    """Admin veya müşteri hizmetleri"""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role in ['admin', 'support']
        )


class IsAdminOrTrainer(BasePermission):
    """Admin veya eğitmen"""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role in ['admin', 'trainer']
        )


class IsStaff(BasePermission):
    """Admin, eğitmen veya müşteri hizmetleri (herhangi bir staff)"""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role in ['admin', 'trainer', 'support']
        )


class IsOwnerOrAdmin(BasePermission):
    """Kendi kaydı veya admin"""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        return obj == request.user or getattr(obj, 'user', None) == request.user


class IsTrainerOwnerOrAdmin(BasePermission):
    """İçeriğin sahibi eğitmen veya admin/destek"""
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['admin', 'support']:
            return True
        if request.user.role == 'trainer':
            return getattr(obj, 'created_by', None) == request.user
        return False


class HasActiveSubscription(BasePermission):
    """Aktif aboneliği olan müşteri"""
    message = 'Bu içeriğe erişmek için aktif abonelik gereklidir.'

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        # Admin, eğitmen, destek ekibi her zaman erişebilir
        if request.user.role in ['admin', 'trainer', 'support']:
            return True
        # Müşteri için abonelik kontrolü
        from django.utils import timezone
        active = request.user.subscriptions.filter(
            status__in=['active', 'trial'],
            ends_at__gt=timezone.now()
        ).exists()
        return active


class HasAIAccess(BasePermission):
    """AI özelliklerine erişim — sadece Pro plan"""
    message = 'AI kart üretimi Pro plan gerektirir.'

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.role in ['admin', 'trainer']:
            return True
        # Pro abonelik kontrolü
        from django.utils import timezone
        return request.user.subscriptions.filter(
            plan='pro',
            status='active',
            ends_at__gt=timezone.now()
        ).exists()
