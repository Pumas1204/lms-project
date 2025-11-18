from django.urls import path
from .views import (
    RegisterView,
    UserProfileView,

    # Courses
    InstructorCourseListCreateView,
    InstructorCourseDetailView,
    StudentCourseListView,
    StudentMyCoursesView,
    StudentJoinCourseView,

    # Chapters
    InstructorChapterListCreateView,
    InstructorChapterDetailView,
    StudentChapterListView,
    StudentChapterDetailView,

    # Notifications
    NotificationListView,
    send_course_notification,
)

urlpatterns = [
    # ---------------- AUTH ----------------
    path("register/", RegisterView.as_view()),
    path("user/", UserProfileView.as_view()),
    path("me/", UserProfileView.as_view()),

    # ---------------- INSTRUCTOR COURSES ----------------
    path("courses/instructor/", InstructorCourseListCreateView.as_view()),
    path("courses/instructor/<int:pk>/", InstructorCourseDetailView.as_view()),

    # ---------------- STUDENT COURSES ----------------
    path("courses/", StudentCourseListView.as_view()),
    path("courses/my/", StudentMyCoursesView.as_view()),
    path("courses/<int:course_id>/join/", StudentJoinCourseView.as_view()),

    # ========== CHAPTERS ==========

    # Instructor create/list chapters
    # THIS MATCHES YOUR FRONTEND: /api/courses/instructor/<id>/chapters/
    path(
        "courses/instructor/<int:course_id>/chapters/",
        InstructorChapterListCreateView.as_view(),
        name="instructor-chapters"
    ),

    # Instructor edit/delete chapter
    path(
        "chapters/instructor/<int:pk>/",
        InstructorChapterDetailView.as_view(),
        name="instructor-chapter-detail"
    ),

    # Student list chapters
    path(
        "courses/<int:course_id>/chapters/",
        StudentChapterListView.as_view(),
        name="student-chapters"
    ),

    # Student read chapter
    path(
        "chapters/<int:pk>/",
        StudentChapterDetailView.as_view(),
        name="student-chapter-detail"
    ),

    # ---------------- NOTIFICATIONS ----------------
    path("notifications/", NotificationListView.as_view()),
    path("courses/<int:course_id>/notify/", send_course_notification),
]
