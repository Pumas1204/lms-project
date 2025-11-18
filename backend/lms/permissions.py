from rest_framework.permissions import BasePermission, SAFE_METHODS


def _get_role(request):
    try:
        role = request.user.profile.role
        if isinstance(role, str):
            return role.upper()
    except Exception:
        pass
    return None


class IsInstructor(BasePermission):
    def has_permission(self, request, view):
        role = _get_role(request)
        return role == "INSTRUCTOR"


class IsStudent(BasePermission):
    def has_permission(self, request, view):
        role = _get_role(request)
        return role == "STUDENT"


class IsCourseInstructorOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.instructor == request.user


class IsChapterInstructorOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.course.instructor == request.user
