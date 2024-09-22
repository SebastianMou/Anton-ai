from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate, logout, get_user_model
from django.contrib import messages
from django.conf import settings
from django.contrib.auth.models import User
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from .tokens import account_activation_token
from django.contrib.sites.shortcuts import get_current_site
from django.core.mail import EmailMessage
from django.core.paginator import Paginator
import openai

from .forms import RegisterForm, ProfileForm, GoalForm
from api.models import TaskCategory, Task, Profile, Goal

openai.api_key = settings.OPENAI_API_KEY

# Create your views here.
@login_required
def index(request):
    return render(request, 'index.html')

def hero(request):
    return render(request, 'hero.html')

def signup(request):
    if request.user.is_authenticated:
        return redirect('/')
    
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data.get('email')
            username = form.cleaned_data.get('username')
            if User.objects.filter(email=email).exists():
                messages.error(request, 'This email is already registered.')
                return redirect('signup')
            else:
                user = form.save(commit=False)
                user.is_active = False
                user.save()
                profile, created = Profile.objects.get_or_create(user=user)
                profile.phone_number = form.cleaned_data.get('phone_number')
                profile.save()
                activateEmail(request, user, email)
                return redirect('/')
    else:
        form = RegisterForm()
    
    context = {
        'form': form,
    }
    return render(request, 'authentication/signup.html', context)

def activate(request, uidb64, token):
    User = get_user_model()
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and account_activation_token.check_token(user, token):
        user.is_active = True
        user.save()

        # Log the user in
        login(request, user)
        request.session['interests'] = True

        messages.success(request, 'Thank you for confirming your email. You can now log in to your account.')
        return redirect('interests')
    else:
        messages.error(request, 'The activation link is not valid!')
    return render(request, 'index.html')


def activateEmail(request, user, to_email):
    mail_subject = 'Activate your user account.'
    message = render_to_string('authentication/template_activate_account.html', {
        'user': user.username,
        'domain': get_current_site(request).domain,
        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        'token': account_activation_token.make_token(user),
        'protocol': 'https' if request.is_secure() else 'http'
    })
    email = EmailMessage(mail_subject, message, to=[to_email])
    email.content_subtype = "html"
    if email.send():
        messages.success(request, f'Dear {user.username}, please check your email {to_email} and click on the activation link you have received to confirm and complete the registration. Note: Check your spam folder.')
    else:
        messages.error(request, f'Problem sending confirmation email to {to_email}, please check if you entered it correctly.')

def check_email(request):
    return render(request, 'authentication/check_email.html')

def user_login(request):
    if request.user.is_authenticated:
        return redirect('/')
    
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            if request.session.get('interests', False):
                return redirect('interests')
            else:
                return redirect('/')
        else:
            messages.error(request, 'Incorrect password or username')
            return redirect('login')
    return render(request, 'authentication/login.html')


def email_login(request):
    if request.method == 'POST':
        email = request.POST['email']
        password = request.POST['password']

        # Try to get a user with the provided email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            messages.error(request, 'Email not found')
            return redirect('email_login')

        # Authenticate the user
        user = authenticate(request, username=user.username, password=password)
        if user is not None:
            login(request, user)
            return redirect('/')
        else:
            messages.error(request, 'Invalid password')
            return redirect('email_login')

    return render(request, 'authentication/email_login.html')

@login_required
def interests(request):
    if request.method == 'POST':
        form = ProfileForm(request.POST, instance=request.user.profile)
        if form.is_valid():
            form.save()
            # Reset the session variable
            request.session['interests'] = False
            return redirect('goal_form')  # Redirect to a success page
    else:
        form = ProfileForm(instance=request.user.profile)
    
    return render(request, 'authentication/interests.html', {'form': form})

def profile(request):
    
    return render(request, 'authentication/profile.html')

def logout_view(request):
    logout(request)
    return redirect('login')

def delete_account(request):
    if request.method == 'POST':
        deleteUser = User.objects.get(username=request.user)
        deleteUser.delete()
        return redirect('/')

def task_list(request, pk):
    # category = TaskCategory.objects.get(id=pk, owner=request.user)
    category = get_object_or_404(TaskCategory, id=pk, owner=request.user)

    tasks = Task.objects.filter(owner=request.user, category=pk)
    
    context = {
        'tasks': tasks,
        'pk': pk,
        'category': category
    }
    return render(request, 'tasks/tasks-list.html', context)

def task_list_detail(request):
    return render(request, 'tasks/task_list_detail.html')

def pages(request):
    user_profile = Profile.objects.get(user=request.user)
    user_interests = user_profile.interests.all()
    
    context = {
        'user_profile': user_profile,
        'user_interests': user_interests,
        'phone_number': user_profile.phone_number,
    }

    return render(request, 'password-control/pages.html', context)

def search(request):
    searched = request.POST.get('searched') or request.GET.get('searched')
    tasks = Task.objects.filter(owner=request.user, title__icontains=searched) if searched else Task.objects.none()
    task_categories = TaskCategory.objects.filter(owner=request.user, name__icontains=searched) if searched else TaskCategory.objects.none()

    # Pagination for tasks
    task_paginator = Paginator(tasks, 100)  # Show 3 tasks per page
    task_page_number = request.GET.get('task_page')
    task_page_obj = task_paginator.get_page(task_page_number)

    # Pagination for task categories
    category_paginator = Paginator(task_categories, 100)  # Show 3 categories per page
    category_page_number = request.GET.get('category_page')
    category_page_obj = category_paginator.get_page(category_page_number)

    context = {
        'task_page_obj': task_page_obj,
        'searched': searched,
        'category_page_obj': category_page_obj,
    }
    return render(request, 'tasks/search.html', context)

def calender(request):
    return render(request, 'tasks/calender.html')

@login_required
def goal_form_view(request):
    profile = Profile.objects.get(user=request.user)
    
    if profile.goal:
        # User already has a goal, let's edit it
        form = GoalForm(request.POST or None, instance=profile.goal)
    else:
        # User does not have a goal, let's create a new one
        form = GoalForm(request.POST or None)

    if request.method == 'POST':
        if form.is_valid():
            goal_form = form.save()
            profile.goal = goal_form
            profile.save()
            return redirect('/')  # Redirect to home page or success page

    context = {
        'form': form,
    }

    return render(request, 'authentication/goal_form.html', context)


def chatgpt_tester(request):
    openai.api_key = settings.OPENAI_API_KEY

    # Create a chat completion
    completion = openai.chat.completions.create(
    model="gpt-4-turbo",
    messages=[
        {"role": "system", "content": "You are a poetic assistant, skilled in explaining complex programming concepts with creative flair."},
        {"role": "user", "content": "Compose a poem that explains the concept of recursion in programming. (but make it supper short)"}
    ]
    )

    # Print the response
    print(completion.choices[0].message.content)

    poem = completion.choices[0].message.content

    return render(request, 'AI/chatgpt_tester.html', {'poem': poem})

def invoice(request):
    return render(request, 'capital/invoice.html')

def error_404_page(request):
    return render(request, 'errors/error_404_page.html')

def error_500_page(request):
    return render(request, 'errors/error_500_page.html')

def notifications_list(request):
    return render(request, 'authentication/notificatoins_list.html')
