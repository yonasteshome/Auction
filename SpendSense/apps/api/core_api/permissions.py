from rest_framework import permissions


class IsAdminRole(permissions.BasePermission):
    """Allow if user is authenticated and role is admin or Django staff/superuser."""

    def has_permission(self, request, view):
        u = request.user
        if not u or not u.is_authenticated:
            return False
        return getattr(u, 'role', None) == 'admin' or u.is_staff
