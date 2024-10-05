from django.urls import path, include
from django.contrib.auth.decorators import login_required
from django.contrib.auth import views as auth_views

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('hero/', views.hero, name='hero'),
    path('signup/', views.signup, name='signup'),
    path('login/', views.user_login, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('email-login/', views.email_login, name='email-login'),
    path('task-list/<str:pk>/', views.task_list, name='task_list'),
    path('task-all/<str:pk>/', views.task_all, name='task_all'),
    path('task-project-detail/', views.task_list_detail, name='task-project-detail'),
    path('check_email/', views.check_email, name='check_email'),

    path('pages/', views.pages, name='pages'),
    path('interests/', views.interests, name='interests'),
    path('calender/', views.calender, name='calender'),
    path('goal-form/', views.goal_form_view, name='goal_form'),

    path('delete_account/', views.delete_account, name='delete_account'),
    path('search/', views.search, name='search'),
    path('invoice/', views.invoice, name='invoice'),
    path('404/', views.error_404_page, name='error_404_page'),
    path('500/', views.error_500_page, name='error_500_page'),
    path('notifications_list/', views.notifications_list, name='notifications_list'),
    path('profile/', views.profile, name='profile'),
    path('jurnal/', views.jurnal, name='jurnal'),

    # activación de la cuenta de usuario por correo electrónico
    path('activate/<uidb64>/<token>', views.activate, name='activate'),

    # AI
    path('chatgpt_tester/', views.chatgpt_tester, name='chatgpt_tester'),

    # User change password from account 
    path('change_password/', login_required(auth_views.PasswordChangeView.as_view(template_name='password-control/password_change.html', success_url='/password_changed/')), name='password_change'),
    path('password_changed/', login_required(auth_views.PasswordChangeDoneView.as_view(template_name='password-control/password_changed.html')), name='password_changed'),  
    # Forgoten password
    path('password_reset/', auth_views.PasswordResetView.as_view(template_name='password-control/password_reset.html'), name="password_reset"),
    path('password_reset_sent/', auth_views.PasswordResetDoneView.as_view(template_name='password-control/password_reset_done.html'), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(template_name="password-control/password_reset_confirm.html"), name='password_reset_confirm'),
    path('reset_password_complete/', auth_views.PasswordResetCompleteView.as_view(template_name='password-control/password_reset_complete.html'), name='password_reset_complete'),
] 