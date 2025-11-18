from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = "Create mock student and instructor users (username/password shown)."

    def handle(self, *args, **options):
        users = [
            {
                "username": "student1",
                "email": "student1@example.com",
                "password": "studentpass",
                "role": "STUDENT",
                "full_name": "Student One",
            },
            {
                "username": "instructor1",
                "email": "instructor1@example.com",
                "password": "instructorpass",
                "role": "INSTRUCTOR",
                "full_name": "Instructor One",
            },
        ]

        for u in users:
            user, created = User.objects.get_or_create(
                username=u["username"], defaults={"email": u["email"]}
            )
            if created:
                user.set_password(u["password"])
                user.save()
                # create_profile signal should have created Profile
                try:
                    user.profile.role = u["role"]
                    user.profile.full_name = u["full_name"]
                    user.profile.save()
                except Exception:
                    pass
                self.stdout.write(self.style.SUCCESS(f"Created {u['username']} with password {u['password']}"))
            else:
                updated = False
                if not user.check_password(u["password"]):
                    user.set_password(u["password"])
                    updated = True
                if user.email != u["email"]:
                    user.email = u["email"]
                    updated = True
                if updated:
                    user.save()
                try:
                    user.profile.role = u["role"]
                    user.profile.full_name = u["full_name"]
                    user.profile.save()
                except Exception:
                    pass
                self.stdout.write(self.style.WARNING(f"Updated {u['username']} (password/email/profile set/updated)"))
