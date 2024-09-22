from rest_framework import serializers
from django.contrib.auth.models import User
from .models import TaskCategory, Task, SubTask, Profile, Notifications, Interest

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name']

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(partial=True)

    class Meta:
        model = Profile
        fields = ['user', 'phone_number']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user

        # Update phone number if provided
        if 'phone_number' in validated_data:
            instance.phone_number = validated_data['phone_number']
        instance.save()

        # Update user fields if provided
        if user_data:
            if 'username' in user_data:
                user.username = user_data['username']
            if 'first_name' in user_data:
                user.first_name = user_data['first_name']
            if 'last_name' in user_data:
                user.last_name = user_data['last_name']
            user.save()

        return instance
    
class TaskCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskCategory
        fields = '__all__'

class SubTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubTask
        fields = '__all__'

class TaskSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_due_date = serializers.DateField(source='category.due_date', read_only=True)
    category_id = serializers.IntegerField(source='category.id', read_only=True)
    subtasks = SubTaskSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = '__all__'
        extra_fields = ['category_name', 'category_due_date', 'category_id', 'subtasks']

    def get_field_names(self, declared_fields, info):
        expanded_fields = super().get_field_names(declared_fields, info)
        if hasattr(self.Meta, 'extra_fields'):
            return expanded_fields + self.Meta.extra_fields
        else:
            return expanded_fields

class NotificationsSerializer(serializers.ModelSerializer):
    class Meta:
            model = Notifications  
            fields = '__all__'

class UserInterest(serializers.ModelSerializer):
    class Meta:
        model = Interest  
        fields = '__all__'