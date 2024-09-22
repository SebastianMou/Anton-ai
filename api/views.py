from django.shortcuts import render
from django.http import JsonResponse, HttpResponseRedirect
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Max

from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .serializer import TaskCategorySerializer, TaskSerializer, SubTaskSerializer, ProfileSerializer, NotificationsSerializer, UserInterest  
from .models import TaskCategory, Task, SubTask, Profile, Notifications, Interest, TaskAnalysis
import openai

openai.api_key = settings.OPENAI_API_KEY  # Replace with your actual OpenAI API key

# Create your views here.
@api_view(['GET'])
def apiOverview(request):
    api_urls = {
        ## Task cateogry projects
        'Task Project': '/task-project/',
        'Task Project Detail View': '/task-project-detail/<str:pk>/',
        'Task Project Create': '/task-project-create/',
        'Task Project Update': '/task-project-update/<str:pk>/',
        'Task Project Delete': '/task-project-delete/<str:pk>/',
        ## Main tasks
        'Task List': '/task-list/',
        'Task Detail': '/task-detail/<str:pk>/',
        'Task Create': '/task-create/',
        'Task Update': '/task-update/<str:pk>/',
        'Task Delete': '/task-delete/<str:pk>/',
        'Task Delete All': '/delete-all-tasks-in-category/<int:category_id>/',
        ## SubTasks
        'Subtask Create': '/subtask-create/',
        'Sbtask Update': '/subtask-update/<int:subtask_id>/',
        'Subtask Delete': '/delete-subtask/<int:pk>/',
        'Subtask Updatem Completion Status': '/update-subtask-completion-status/<int:pk>/',
        ## Calender
        'Calender': '/calendar/',
        ## Profile
        'Profile Update': '/update-profile/',
        'User Interests List': '/user-interests-list/',
        ## Notifications
        'Notification': '/notifications/',
        'Notification Detail': '/notification-detail/<str:pk>/',
        'Notification Unread Count': '/unread-notifications-count/',
        ## AI Functionality
        'Analysis': '/task-analysis/<int:category_id>/',
        'Get Task Analyses': '/get-task-analyses/<int:category_id>/',
        'Breakdown Task': '/breakdown-task/<int:task_id>/',
    }
    return Response(api_urls)

## TASK PROJECT CATEGORY C.R.U.D
@api_view(['GET'])
def task_project(request):
    categories = TaskCategory.objects.filter(owner=request.user)
    data = []
    for category in categories:
        tasks = Task.objects.filter(category=category)[:5]
        task_data = TaskSerializer(tasks, many=True).data
        category_data = TaskCategorySerializer(category).data
        category_data['tasks'] = task_data
        data.append(category_data)
    return Response(data)

@api_view(['GET'])
def task_project_detail(request, pk):
    tasks = TaskCategory.objects.get(id=pk)
    serializer = TaskCategorySerializer(tasks, many=False)
    return Response(serializer.data)

@api_view(['POST'])
def task_project_create(request):
    serializer = TaskCategorySerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(owner=request.user)

    return Response(serializer.data)

@api_view(['POST'])
def task_project_update(request, pk):
    task = TaskCategory.objects.get(id=pk)
    serializer = TaskCategorySerializer(instance=task, data=request.data)

    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)

@api_view(['DELETE'])
def task_project_delete(request, pk):
    try:
        task = TaskCategory.objects.get(id=pk, owner=request.user)
        task.delete()
        return Response({"message": "Item successfully deleted"})
    except TaskCategory.DoesNotExist:
        return Response({"error": "Item not found"}, status=404)

@api_view(['DELETE'])
def delete_all_tasks_in_category(request, category_id):
    tasks = Task.objects.filter(category_id=category_id)
    if not tasks.exists():
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    tasks.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

## MAIN TASK C.R.U.D 
@api_view(['GET'])
def task_list(request, category_id):
    # Get the category object to include in the response
    category = TaskCategory.objects.get(id=category_id, owner=request.user)
    
    # Fetch tasks for the category, initially ordered by 'position'
    tasks = Task.objects.filter(owner=request.user, category=category_id).order_by('-position')
    
    # Serialize the tasks and category data
    serializer = TaskSerializer(tasks, many=True)
    category_serializer = TaskCategorySerializer(category)
    
    # Return the sorted tasks along with the category data
    return Response({
        'tasks': serializer.data,
        'category': category_serializer.data
    })

@api_view(['GET'])
def task_detail(request, pk):
    tasks = Task.objects.get(id=pk)
    serializer = TaskSerializer(tasks, many=False)
    return Response(serializer.data)


@api_view(['POST'])
def task_create(request):
    data = request.data
    owner = request.user
    category = TaskCategory.objects.get(id=data['category'])

    # Get the highest current position in the category and add 1
    max_position = Task.objects.filter(category=category, owner=owner).aggregate(Max('position'))['position__max']
    new_position = (max_position or 0) + 1

    task = Task.objects.create(
        category=category,
        title=data['title'],
        completed=data.get('completed', False),
        completion_date=data.get('completion_date'),
        completion_time=data.get('completion_time'),
        description=data.get('description', ''),
        position=new_position,
        owner=owner
    )

    serializer = TaskSerializer(task, many=False)
    return Response(serializer.data)

@api_view(['POST'])
def task_update(request, pk):
    try:
        task = Task.objects.get(id=pk)
    except Task.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    serializer = TaskSerializer(instance=task, data=request.data, partial=True)  # Allow partial updates
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def task_delete(request, pk):
    try:
        task = Task.objects.get(id=pk)
    except Task.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    task.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

## SUBTASK C.R.U.D 
@api_view(['POST'])
def subtask_create(request):
    data = request.data
    parent_task = Task.objects.get(id=data['task'])

    # Check if subtask with the same title and task already exists
    existing_subtask = SubTask.objects.filter(task=parent_task, title=data['title']).first()
    if existing_subtask:
        # Return the existing subtask instead of raising an error
        serializer = SubTaskSerializer(existing_subtask, many=False)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # Create the subtask if it doesn't already exist
    subtask = SubTask.objects.create(
        task=parent_task,
        title=data['title'],
        completed=data.get('completed', False)
    )

    serializer = SubTaskSerializer(subtask, many=False)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def update_subtask_completion_status(request, pk):
    try:
        subtask = SubTask.objects.get(id=pk)
    except SubTask.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    # Update the subtask's completion status
    subtask.completed = request.data.get('completed', subtask.completed)
    subtask.save()

    serializer = SubTaskSerializer(subtask, many=False)
    return Response(serializer.data)

@api_view(['DELETE'])
def delete_subtask(request, pk):
    try:
        subtask = SubTask.objects.get(id=pk)
    except SubTask.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    subtask.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['PUT'])
def subtask_update(request, subtask_id):
    try:
        subtask = SubTask.objects.get(id=subtask_id)
        data = request.data

        subtask.title = data.get('title', subtask.title)
        subtask.save()

        return Response({'status': 'success', 'message': 'Subtask updated successfully'}, status=200)
    except SubTask.DoesNotExist:
        return Response({'status': 'error', 'message': 'Subtask not found'}, status=404)

## SORTABLEJS - (https://sortablejs.github.io/Sortable/)
@api_view(['POST'])
def update_task_positions(request):
    data = request.data
    for task_data in data:
        task_id = task_data['id']
        new_position = task_data['position']
        # Assuming `owner` is tied to the user managing these tasks
        task = Task.objects.get(id=task_id, owner=request.user)
        task.position = new_position
        task.save()
    return Response({'success': True}, status=status.HTTP_200_OK)

## AI FUNCTIONALITY 
# Example using OpenAI to break down tasks
def breakdown_task(request, task_id):
    print("API called for task:", task_id)  # Debug line

    try:
        task = Task.objects.get(id=task_id)

        # Use AI to break down the task based on the title
        openai.api_key = settings.OPENAI_API_KEY
        messages = [
            {"role": "system", "content": "You are an expert assistant skilled in breaking down tasks into clear and actionable subtasks."},
            {"role": "user", "content": f"Given the task: '{task.title}', please break it down into a step-by-step list of subtasks that will help achieve the main goal. Be concise and consider the most efficient way to complete the task."}
        ]

        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",  # GPT-3.5 turbo ChatGPT model
            messages=messages,
            max_tokens=150
        )

        # Get the list of subtasks from the AI response
        subtasks_text = response.choices[0].message.content.strip().split('\n')

        # Filter out any empty or whitespace-only subtasks
        subtasks_text = [subtask.strip() for subtask in subtasks_text if subtask.strip()]

        # Save the subtasks in the SubTask model
        for subtask_description in subtasks_text:
            # Create and save each subtask associated with the parent task
            SubTask.objects.create(
                task=task,
                title=subtask_description,
                completed=False  # Set default to False (not completed)
            )
            print(f"Saved subtask: {subtask_description}")

        return JsonResponse({'status': 'success', 'subtasks': subtasks_text})

    except Task.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Task not found'}, status=404)
    
    except Exception as e:
        print(f"Unexpected error: {str(e)}")  # Log the error details
        return JsonResponse({'status': 'error', 'message': 'An unexpected error occurred'}, status=500)

def analyze_task_difficulty(task):
    # Prepare the task description for analysis
    task_description = (
        f"Task: {task['title']}\nDescription: {task.get('description', 'No description')}\nDue Date: {task.get('due_date', 'No due date')}\n"
    )

    # Define messages for the chat-based model
    messages = [
        {
            "role": "system",
            "content": (
                "You are a Productivity Assistant that helps users prioritize and complete their tasks efficiently. "
                "Your goal is to help users complete as many tasks as quickly as possible. If a task cannot realistically be completed within a day, suggest rescheduling it, and estimate how long a user will take to complete. "
                "Avoid using HTML or any special formatting. Provide plain text output with clear summaries."
            )
        },
        {
            "role": "user",
            "content": (
                f"Analyze the following task and suggest if it can be completed within a day, and if not, suggest a new due date:\n\n{task_description}"
            )
        }
    ]

    # Call the OpenAI API with chat-based completion
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo",  # or "gpt-4" if you have access
        messages=messages,
        max_tokens=250,
        temperature=0.1
    )

    # Extract the response text correctly
    analysis = response.choices[0].message.content.strip()
    return analysis

def parse_difficulty_from_analysis(analysis):
    """
    Parse the difficulty score from the AI's analysis text.
    Adjust this function to better understand a range of AI outputs.
    """
    if "cannot realistically be completed within a day" in analysis:
        return 10  # Most difficult task
    elif "1-2 weeks" in analysis or "several days" in analysis:
        return 7
    elif "within a day" in analysis or "quick and essential" in analysis:
        return 1  # Easiest task
    elif "approximately 134 days" in analysis or "1-2 months" in analysis:
        return 9
    # Add more parsing rules based on your AI output patterns
    # Return a default value if no conditions match
    return 5

@login_required
def task_analysis(request, category_id):
    # Fetch tasks for the category
    tasks = Task.objects.filter(category_id=category_id, owner=request.user)
    task_list = tasks.values('id', 'title', 'description', 'due_date')

    # Variable to hold analysis data and tasks for sorting
    analysis_data = []
    tasks_with_difficulty = []

    for task in task_list:
        # Analyze task difficulty using OpenAI
        analysis = analyze_task_difficulty(task)

        # Parse difficulty score from AI analysis
        difficulty_score = parse_difficulty_from_analysis(analysis)

        # Get the task object and update difficulty
        task_obj = Task.objects.get(id=task['id'])
        task_obj.difficulty = difficulty_score
        task_obj.save()

        # Collect tasks to sort by difficulty
        tasks_with_difficulty.append(task_obj)

        # Save analysis for the specific task
        TaskAnalysis.objects.create(
            user=request.user,
            task_id=task['id'],
            analysis=analysis
        )

        # Append analysis to the data list for returning as JSON
        analysis_data.append({
            'task_id': task['id'],
            'analysis': analysis
        })

    # Sort tasks based on difficulty after updating all difficulties
    tasks_with_difficulty.sort(key=lambda x: x.difficulty)

    # Update positions based on sorted difficulty
    for index, task in enumerate(tasks_with_difficulty):
        task.position = index  # Set position based on sorted order
        task.save()

    # Return the JSON response with all task analyses and sorted tasks
    return JsonResponse({
        'analyses': analysis_data,
        'tasks': [
            {'id': task.id, 'title': task.title, 'difficulty': task.difficulty, 'completed': task.completed, 'position': task.position}
            for task in tasks_with_difficulty
        ],
        'status': 'Analysis completed'
    })


@login_required
def get_task_analyses(request, category_id):
    # Fetch all existing analyses for the given category and user
    analyses = TaskAnalysis.objects.filter(task__category_id=category_id, user=request.user).values('task_id', 'analysis')

    # Convert QuerySet to a list of dictionaries
    analysis_data = list(analyses)

    # Return the existing analyses as a JSON response
    return JsonResponse({'analyses': analysis_data, 'status': 'Analysis retrieved successfully'})

## SEARCH BAR
@api_view(['GET'])
def search_tasks(request):
    query = request.GET.get('q', None)
    if query:
        tasks = Task.objects.filter(title__icontains=query, owner=request.user)
        serialized_tasks = TaskSerializer(tasks, many=True)
        return Response(serialized_tasks.data)
    return Response({"message": "No query provided."}, status=400)

@api_view(['GET'])
def search_categories(request):
    query = request.GET.get('q', None)
    if query:
        categories = TaskCategory.objects.filter(name__icontains=query, owner=request.user)
        serialized_categories = TaskCategorySerializer(categories, many=True)
        return Response(serialized_categories.data)
    return Response({"message": "No query provided."}, status=400)

## CALENDER
@api_view(['GET'])
def calendar_events(request):
    tasks = Task.objects.all()
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data)

## PROFILE
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    try:
        profile = Profile.objects.get(user=request.user)
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = ProfileSerializer(profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_interests_list(request):
    """
    Retrieve a list of interests and user details for the authenticated user.
    """
    try:
        user_profile = Profile.objects.get(user=request.user)
        interests = user_profile.interests.all()  # Fetch interests through profile
    except Profile.DoesNotExist:
        interests = Interest.objects.none()  # Return empty if no profile found

    # Fetch user details
    user_details = {
        'username': request.user.username,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name
    }

    # Serialize interests
    serializer = UserInterest(interests, many=True)
    response_data = {
        'user': user_details,
        'interests': serializer.data
    }
    return Response(response_data)

## NOTIFICATIONS
@api_view(['GET'])
def notifications(request):
    notifications = Notifications.objects.all()
    serializer = NotificationsSerializer(notifications, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def notification_detail(request, pk):
    try:
        notification = Notifications.objects.get(id=pk)
        if not notification.read:
            notification.read = True
            notification.save()
        serializer = NotificationsSerializer(notification, many=False)
        return Response(serializer.data)
    except Notifications.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def unread_notifications_count(request):
    count = Notifications.objects.filter(read=False).count()
    return Response({'unread_count': count})

