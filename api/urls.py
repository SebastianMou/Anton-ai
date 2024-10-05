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
    path('toggle-task-completion/<str:pk>/', views.toggle_task_completion, name='toggle-task-completionv'),
    path('task-update/<str:pk>/', views.task_update, name='task-update'),
    path('task-delete/<str:pk>/', views.task_delete, name='task-delete'),
    path('delete-all-tasks-in-category/<int:category_id>/', views.delete_all_tasks_in_category, name='delete-all-tasks-in-category'),
    path('category-details/<str:pk>/', views.category_details_api, name='category_details_api'),
    ## SUBTASK C.R.U.D 
    path('subtask-create/', views.subtask_create, name='subtask-create'),
    path('subtask-delete/<int:subtask_id>/', views.subtask_delete, name='subtask-delete'),
    path('update-subtask-completion-status/<int:pk>/', views.update_subtask_completion_status, name='update-subtask-completion-status'),
    path('delete-all-subtasks/<int:task_id>/', views.delete_all_subtasks, name='delete-all-subtasks'),
    path('subtask-update/<int:subtask_id>/', views.subtask_update, name='subtask-update'),
    ## JURNAL C.R.U.D
    path('jurnal-list/', views.jurnal_list, name='jurnal-list'),
    path('jurnal-detail/<str:pk>/', views.jurnal_detail, name='jurnal-detail'),
    path('jurnal-create/', views.jurnal_create, name='jurnal-create'),
    path('jurnal-update/<str:pk>/', views.jurnal_update, name='jurnal-update'),
    path('jurnal-delete/<str:pk>', views.jurnal_delete, name='jurnal-delete'),
    ## SORTABLEJS 
    path('update-task-order/<int:category_id>/', views.update_task_order, name='update-task-order'),

    path('jurnal-update-order/', views.update_jurnal_order, name='jurnal-update-order'),
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