from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from api.models import Profile, Interest, Goal


class RegisterForm(UserCreationForm):
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter your email'
        })
    )

    username = forms.CharField(
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Username'
        })
    )

    first_name = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'First Name'
        })
    )

    last_name = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Last Name'
        })
    )

    phone_number = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Phone Number'
        })
    )

    password1 = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter a password'
        })
    )

    password2 = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Confirm your password'
        })
    )

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'phone_number', 'password1', 'password2']

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        user.first_name = self.cleaned_data['first_name']
        user.last_name = self.cleaned_data['last_name']
        if commit:
            user.save()
            profile, created = Profile.objects.get_or_create(user=user)
            profile.phone_number = self.cleaned_data['phone_number']
            profile.save()
        return user

class ProfileForm(forms.ModelForm):
    INTEREST_CHOICES = [
        ('Build resilience', 'Build resilience'),
        ('Develop confidence', 'Develop confidence'),
        ('Cultivate endurance', 'Cultivate endurance'),
        ('Stoicism', 'Stoicism'),
        ('Enhance adaptability', 'Enhance adaptability'),
        ('Develop a growth mindset', 'Develop a growth mindset'),
        ('Improve emotional regulation', 'Improve emotional regulation'),
        ('Foster self-discipline', 'Foster self-discipline'),
        ('Strengthen focus and concentration', 'Strengthen focus and concentration'),
        ('Cultivate patience', 'Cultivate patience'),
        ('Enhance creativity', 'Enhance creativity'),
        ('Develop mindfulness', 'Develop mindfulness'),
        ('Practice gratitude', 'Practice gratitude'),
        ('Improve self-awareness', 'Improve self-awareness'),
        ('Strengthen willpower', 'Strengthen willpower'),
        ('Enhance perseverance', 'Enhance perseverance'),
        ('Build mental toughness', 'Build mental toughness'),
        ('Cultivate optimism', 'Cultivate optimism'),
        ('Enhance self-reliance', 'Enhance self-reliance'),
        ('Develop empathy', 'Develop empathy'),
        ('Practice assertiveness', 'Practice assertiveness'),
        ('Strengthen critical thinking', 'Strengthen critical thinking'),
        ('Enhance problem-solving skills', 'Enhance problem-solving skills'),
        ('Improve decision-making', 'Improve decision-making'),
        ('Develop strategic thinking', 'Develop strategic thinking'),
        ('Cultivate humility', 'Cultivate humility'),
        ('Foster curiosity', 'Foster curiosity'),
        ('Enhance self-motivation', 'Enhance self-motivation'),
        ('Cultivate emotional resilience', 'Cultivate emotional resilience'),
        ('Practice mindfulness under stress', 'Practice mindfulness under stress'),
        ('Enhance mental agility', 'Enhance mental agility'),
        ('Develop self-compassion', 'Develop self-compassion'),
        ('Strengthen perseverance in adversity', 'Strengthen perseverance in adversity'),
        ('Cultivate gratitude in daily life', 'Cultivate gratitude in daily life'),
        ('Foster a sense of purpose', 'Foster a sense of purpose'),
        ('Improve adaptability to change', 'Improve adaptability to change'),
    ]


    interests = forms.MultipleChoiceField(
        choices=INTEREST_CHOICES,
        widget=forms.CheckboxSelectMultiple(attrs={'class': 'checkmark'}),
        required=False
    )

    class Meta:
        model = Profile
        fields = ['phone_number', 'interests']

    def save(self, commit=True):
        profile = super().save(commit=False)
        if commit:
            profile.save()
            profile.interests.clear()
            for interest in self.cleaned_data['interests']:
                interest_obj, created = Interest.objects.get_or_create(name=interest)
                profile.interests.add(interest_obj)
        return profile
    
class GoalForm(forms.ModelForm):
    class Meta:
        model = Goal
        fields = '__all__'  # or list specific fields if needed
