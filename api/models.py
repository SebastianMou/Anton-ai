from django.db import models
from django.contrib.auth.models import User
from tinymce.models import HTMLField
from django.utils import timezone

# Create your models here.
class Goal(models.Model):
    # Current Situation
    current_working_on = models.TextField(blank=True)
    progress_towards_goals = models.TextField(blank=True)
    challenges = models.TextField(blank=True)

    # Desired Outcomes
    one_year_goal = models.TextField(blank=True)
    five_year_goal = models.TextField(blank=True)
    achievements_feel_successful = models.TextField(blank=True)


    def __str__(self):
        # Find the profile that has this goal
        profile = Profile.objects.filter(goal=self).first()
        if profile:
            return f"Goal Form - {self.pk} - {profile.user.username}"
        return f"Goal Form - {self.pk}"

class Interest(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=15, blank=True)
    interests = models.ManyToManyField(Interest, blank=True)  # No change needed here
    goal = models.OneToOneField('Goal', blank=True, null=True, on_delete=models.SET_NULL)

    def __str__(self):
        return self.user.username

class TaskCategory(models.Model):
    name = models.CharField(max_length=100, null=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task_categories', null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    due_date = models.DateField('due date', null=True, blank=True)

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = 'taskcategories'
        ordering = ('-created_at',)

class Task(models.Model):
    category = models.ForeignKey(TaskCategory, on_delete=models.CASCADE, related_name='tasks', null=True)
    title = models.CharField(max_length=255)
    completed = models.BooleanField(default=False, blank=True)
    completion_date = models.DateField(null=True, blank=True)
    completion_time = models.TimeField(null=True, blank=True)
    description = HTMLField(blank=True, null=True)
    created_at = models.DateTimeField('due created', auto_now_add=True)
    due_date = models.DateField('due date', null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    position = models.PositiveIntegerField(default=0, blank=False, null=False)
    difficulty = models.PositiveIntegerField(default=0, blank=False, null=False)  # New field for difficulty
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')

    def __str__(self) -> str:
        return f'{self.title} - {self.owner} - {self.created_at} -- {self.position}'

    class Meta:
        verbose_name_plural = 'tasks'
        ordering = ('difficulty', 'position', 'created_at')

class SubTask(models.Model):
    # A reference to the parent task
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='subtasks')
    
    # Basic subtask fields
    title = models.CharField(max_length=255)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self) -> str:
        return f"{self.title} - Complete: {'Yes' if self.completed else 'No'}"

    class Meta:
        verbose_name_plural = 'subtasks'
        ordering = ('created_at',)

class Notifications(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = HTMLField(blank=True, null=True)
    NOTIFICATION_TYPE_CHOICES = (
        ('info', 'Information'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('success', 'Success'),
    )
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.title} - {self.user.username}"

    class Meta:
        verbose_name_plural = 'notifications'
        ordering = ('-created_at',)

class TaskAnalysis(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    analysis = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Analysis for {self.task.title}"