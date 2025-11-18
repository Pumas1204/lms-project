from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Course, Chapter, Notification

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "profile"]
        depth = 1



# -----------------------------
# USER REGISTRATION SERIALIZER
# -----------------------------
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "role"]

    def create(self, validated_data):
        role = validated_data.pop("role")
        user = User.objects.create_user(**validated_data)
        user.profile.role = role
        user.profile.save()
        return user


# -----------------------------
# PROFILE SERIALIZER
# -----------------------------
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["full_name", "image", "role"]


# -----------------------------
# COURSE SERIALIZER
# -----------------------------
class CourseSerializer(serializers.ModelSerializer):
    instructor_name = serializers.CharField(
        source="instructor.username", read_only=True
    )
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "description",
            "instructor",
            "instructor_name",
            "students",
            "student_count",
            "created_at",
        ]
        read_only_fields = ["instructor", "students"]

    def get_student_count(self, obj):
        return obj.students.count()


# -----------------------------
# CHAPTER SERIALIZER
# -----------------------------
class ChapterSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.title", read_only=True)

    class Meta:
        model = Chapter
        fields = [
            "id",
            "course",
            "course_title",
            "title",
            "summary",       
            "content",
            "is_public",    
            "order",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


# -----------------------------
# NOTIFICATION SERIALIZER
# -----------------------------
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"
