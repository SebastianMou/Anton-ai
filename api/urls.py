from django.urls import path

from . import views

urlpatterns = [
    path('', views.apiOverview, name='api-overview'),
    ## TASK PROJECT CATEGORY C.R.U.D
    path('task-project/', views.task_project, name='task-project'),
    path('task-project-detail/<str:pk>/', views.task_project_detail, name='task-project-detail'),
    path('task-project-create/', views.task_project_create, name='task-project-create'),
    path('task-project-update/<str:pk>/', views.task_project_update, name='task-project-update'),
    path('task-project-delete/<str:pk>/', views.task_project_delete, name='task-project-delete'),
    path('delete-all-tasks-in-category/<int:category_id>/', views.delete_all_tasks_in_category, name='delete-all-tasks-in-category'), 
    ## MAIN TASK C.R.U.D
    path('task-list/<int:category_id>/', views.task_list, name='task-list'),
    path('task-detail/<str:pk>/', views.task_detail, name='task-detail'),
    path('task-create/', views.task_create, name='task-create'),
    path('task-update/<str:pk>/', views.task_update, name='task-update'), 
    path('task-delete/<str:pk>/', views.task_delete, name='task-delete'),
    ## SUBTASK C.R.U.D 
    path('subtask-create/', views.subtask_create, name='subtask-create'),
    path('delete-subtask/<int:pk>/', views.delete_subtask, name='delete-subtask'),
    path('update-subtask-completion-status/<int:pk>/', views.update_subtask_completion_status, name='update-subtask-completion-status'),
    path('subtask-update/<int:subtask_id>/', views.subtask_update, name='subtask-update'),
    ## SORTABLEJS
    path('update-task-positions/', views.update_task_positions, name='update-task-positions'),
    ## SEARCH BAR
    path('tasks/search/', views.search_tasks, name='search-tasks'),
    path('categories/search/', views.search_categories, name='search-categories'),
    ## CALENDER
    path('calendar/', views.calendar_events, name='calendar-events'),
    ## PROFILE
    path('update-profile/', views.update_profile, name='update-profile'),
    path('user-interests-list/', views.user_interests_list, name='user-interests-list'),
    ## NOTIFICATIONS
    path('notifications/', views.notifications, name='notifications'),
    path('notification-detail/<str:pk>/', views.notification_detail, name='notification-detail'),
    path('unread-notifications-count/', views.unread_notifications_count, name='unread-notifications-count'),
    ## EVERYTHING AI
    path('task-analysis/<int:category_id>/', views.task_analysis, name='task-analysis'),
    path('get-task-analyses/<int:category_id>/', views.get_task_analyses, name='get_task_analyses'),
    path('breakdown-task/<int:task_id>/', views.breakdown_task, name='breakdown_task'),
] 