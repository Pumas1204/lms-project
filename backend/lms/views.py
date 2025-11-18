from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from .permissions import IsInstructor, IsStudent
from .models import Course, Chapter, Notification
from .serializers import (
    RegisterSerializer,
    CourseSerializer,
    ChapterSerializer,
    NotificationSerializer,
)
from rest_framework.exceptions import PermissionDenied


def _resolve_course_id(kwargs):
    return kwargs.get("course_id") or kwargs.get("courseId") or kwargs.get("id")


# ==========================================
# AUTH
# ==========================================

from rest_framework import generics, permissions
from .serializers import UserSerializer

class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


# ==========================================
# INSTRUCTOR COURSE CRUD
# ==========================================

class InstructorCourseListCreateView(generics.ListCreateAPIView):
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructor]

    def get_queryset(self):
      
        user = getattr(self.request, "user", None)
        if user and user.is_authenticated:
            return Course.objects.filter(instructor=user).order_by("-created_at")
       
        return Course.objects.none()

    def perform_create(self, serializer):
      
        if not self.request.user or not self.request.user.is_authenticated:
            raise PermissionDenied("Authentication required to create a course.")
        serializer.save(instructor=self.request.user)


class InstructorCourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructor]

    def get_queryset(self):

        return Course.objects.filter(instructor=self.request.user)

    def retrieve(self, request, *args, **kwargs):
      
        course = self.get_object()
   
        if getattr(course, "instructor", None) != request.user:
            raise PermissionDenied("You are not the instructor of this course.")

        base = self.get_serializer(course).data

        students_data = []
        through = getattr(course.students, "through", None)
        
        grade_fields = ("grade", "score", "final_grade", "progress")

        for student in course.students.all():
            s = {
                "id": student.id,
                "username": getattr(student, "username", None),
                "email": getattr(student, "email", None),
                "first_name": getattr(student, "first_name", None),
                "last_name": getattr(student, "last_name", None),
            }


            student_grade = None
            try:
                if through:
                 
                    user_field = None
                    course_field = None
                    for f in through._meta.fields:
          
                        rel_model = getattr(f, "related_model", None)
                        if rel_model is not None:
                            if rel_model == type(student):
                                user_field = f.name
                            if rel_model == type(course):
                                course_field = f.name
                   
                    user_field = user_field or "user" if "user" in [f.name for f in through._meta.fields] else user_field
                    course_field = course_field or "course" if "course" in [f.name for f in through._meta.fields] else course_field

                    if user_field and course_field:
                        rel = through.objects.filter(**{user_field: student, course_field: course}).first()
                        if rel:
                            for gf in grade_fields:
                                if hasattr(rel, gf):
                                    student_grade = getattr(rel, gf)
                                    break
            except Exception:
                student_grade = None

            s["grade"] = student_grade
            students_data.append(s)

        base["students_detail"] = students_data
        return Response(base)


class InstructorChapterListCreateView(generics.ListCreateAPIView):
    serializer_class = ChapterSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructor]

    def get_queryset(self):
        course_id = _resolve_course_id(self.kwargs)
        return Chapter.objects.filter(course__id=course_id, course__instructor=self.request.user)

    def perform_create(self, serializer):
        course_id = _resolve_course_id(self.kwargs)
        course = Course.objects.get(id=course_id, instructor=self.request.user)
        chapter = serializer.save(course=course)

        # Notify all students
        for student in course.students.all():
            Notification.objects.create(
                user=student,
                title=f"New Chapter: {chapter.title}",
                message=f"A new chapter was added to {course.title}."
            )


class InstructorChapterDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ChapterSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructor]

    def get_queryset(self):
        return Chapter.objects.filter(course__instructor=self.request.user)




# ==========================================
# STUDENT COURSE VIEWS
# ==========================================

class StudentChapterListView(generics.ListAPIView):
    serializer_class = ChapterSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        course_id = _resolve_course_id(self.kwargs)
        return Chapter.objects.filter(
            course_id=course_id,
            is_public=True
        ).order_by("order")
    
class StudentChapterDetailView(generics.RetrieveAPIView):
    serializer_class = ChapterSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Chapter.objects.filter(is_public=True)



class StudentCourseListView(generics.ListAPIView):
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Course.objects.all()
    
from rest_framework.response import Response
from rest_framework import status

class StudentJoinCourseView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, course_id=None):

        cid = course_id or _resolve_course_id(self.kwargs)
        try:
            course = Course.objects.get(id=cid)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=404)

  
        course.students.add(request.user)

  
        Notification.objects.create(
            user=request.user,
            title=f"Joined {course.title}",
            message=f"You have successfully joined {course.title}!"
        )

        return Response({"message": "Course joined successfully"})



class StudentMyCoursesView(generics.ListAPIView):
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.enrolled_courses.all()


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def join_course(request, course_id):
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=404)

    course.students.add(request.user)

 
    Notification.objects.create(
        user=request.user,
        title=f"Joined {course.title}",
        message=f"You have successfully joined {course.title}!"
    )

    return Response({"message": "Joined course"})



# ==========================================
# CHAPTER CRUD
# ==========================================

class ChapterListCreateView(generics.ListCreateAPIView):
    serializer_class = ChapterSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        course_id = _resolve_course_id(self.kwargs)
        return Chapter.objects.filter(course_id=course_id)

    def perform_create(self, serializer):
        course_id = _resolve_course_id(self.kwargs)
        serializer.save(course_id=course_id)


class ChapterDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ChapterSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Chapter.objects.all()


# ==========================================
# NOTIFICATIONS
# ==========================================

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def send_course_notification(request, course_id=None):
    cid = course_id or _resolve_course_id(request.resolver_match.kwargs if hasattr(request, "resolver_match") and request.resolver_match else {})
    try:
        course = Course.objects.get(id=cid)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=404)

    if course.instructor != request.user:
        return Response({"error": "Not allowed"}, status=403)

    title = request.data.get("title")
    message = request.data.get("message")

    if not title or not message:
        return Response({"error": "Title and message required"}, status=400)


    for student in course.students.all():
        Notification.objects.create(
            user=student,
            title=title,
            message=message,
        )

    return Response({"message": "Notification sent"})

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by("-created_at")

