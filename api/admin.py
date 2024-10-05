# admin.py
from django.contrib import admin
from .models import TaskCategory, Task, SubTask, Profile, Goal, Notifications, TaskAnalysis,  Jurnal
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User

# Define an inline admin descriptor for Profile model
# which acts a bit like a singleton
class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'profile'

# Define a new User admin
class UserAdmin(BaseUserAdmin):
    inlines = (ProfileInline,)

# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)
admin.site.register(TaskAnalysis)
admin.site.register(Jurnal)

@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ('id', '__str__', 'current_working_on', 'one_year_goal', 'five_year_goal')
    search_fields = ('current_working_on', 'one_year_goal', 'five_year_goal', 'motivation', 'values_principles')

# @admin.register(Interest)
# class InterestAdmin(admin.ModelAdmin):
#     list_display = ('id', 'name')
#     search_fields = ('name',)

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'phone_number', 'goal')
    search_fields = ('user__username', 'phone_number')
    list_filter = ('user', 'goal')

@admin.register(TaskCategory)
class TaskCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'owner', 'created_at', 'due_date')
    search_fields = ('name', 'owner__username')
    list_filter = ('owner', 'created_at')

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'owner', 'category', 'completed', 'created_at', 'due_date', 'position')
    search_fields = ('title', 'owner__username', 'category__name')
    list_filter = ('owner', 'category', 'completed', 'created_at')
    ordering = ('position', 'created_at')

@admin.register(SubTask)
class SubTaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'task', 'completed', 'created_at')
    search_fields = ('title', 'task__title')
    list_filter = ('completed', 'task')

@admin.register(Notifications)
class NotificationsAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'user', 'notification_type', 'created_at')
    search_fields = ('title', 'user__username', 'notification_type')
    list_filter = ('notification_type', 'created_at')

