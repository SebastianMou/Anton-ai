// Function to get CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

var activateItem = null;

function buildList(categoryId) {
    var wrapper = document.getElementById('list-wrapper');
    var categoryHeader = document.getElementById('category-header');
    var categoryCreatedAt = document.getElementById('category-created-at');
    var url = `http://127.0.0.1:7000/api/task-list/${categoryId}/`;

    fetch(url)
        .then((resp) => resp.json())
        .then(function(data) {
            console.log('Fetched data:', data); // Check the full data response

            if (wrapper) {
                categoryHeader.innerHTML = data.category.name;

                let createdAt = new Date(data.category.created_at);
                let formattedDate = createdAt.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                categoryCreatedAt.innerHTML = `Created at: ${formattedDate}`;
                wrapper.innerHTML = ''; // Clear existing items

                if (data.tasks && data.tasks.length > 0) {
                    console.log('Tasks:', data.tasks); // Check if tasks are present

                    data.tasks.forEach(function(task) {
                        console.log('Rendering task:', task); // Check each task

                        let updatedAt = new Date(task.updated_at);
                        let formattedUpdatedDate = updatedAt.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });

                        const completionDate = task.completion_date ? formatDateTime(task.completion_date) : 'none';
                        const completionTime = task.completion_time ? formatDateTime(task.completion_time) : 'none';

                        var checked = task.completed ? 'checked' : '';

                        var taskDescription = task.description.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                        var titleLimit = isMobile() ? 27 : 60;
                        var truncatedTitle = truncateText(task.title, titleLimit);

                        let subtasksHtml = '';
                        if (task.subtasks && task.subtasks.length > 0) {
                            task.subtasks.forEach(function(subtask) { // Reverse subtasks
                                subtasksHtml += `
                                    <div class="subtask-item d-flex align-items-center p-2" style="margin-left: 35px;" data-subtask-id="${subtask.id}">
                                        <input type="checkbox" class="me-2 checkmark subtask-checkbox" id="subtaskCheckbox${subtask.id}" ${subtask.completed ? 'checked' : ''}>
                                        <span>${subtask.title}</span>
                                        <div class="dropdown ms-auto" style="padding-right: 15px;">
                                            <button class="btn btn-link dropdown-toggle" type="button" id="dropdownMenuButton${subtask.id}" data-bs-toggle="dropdown" aria-expanded="false"></button>
                                            <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton${subtask.id}">
                                                <li><button class="dropdown-item edit-subtask-btn" data-subtask-id="${subtask.id}" data-subtask-title="${subtask.title}">Edit</button></li>
                                                <li><button class="dropdown-item delete-subtask-btn" data-subtask-id="${subtask.id}">Delete</button></li>
                                            </ul>
                                        </div>
                                    </div>
                                `;
                            });
                        }

                        let hideButtonHtml = '';
                        if (task.subtasks && task.subtasks.length > 0) {
                            hideButtonHtml = `
                                <button class="btn btn-link toggle-subtasks" type="button" data-task-id="${task.id}">
                                    <i class="align-middle me-2 fas fa-fw fa-angle-up"></i>
                                </button>
                            `;
                        }

                        var item = `
                            <ul class="list-group" id="data-row-${task.id}">
                                <li class="list-group-item d-flex justify-content-between align-items-center underline-border" data-task-id="${task.id}">
                                    <div class="d-flex align-items-center">
                                        <input type="checkbox" class="me-4 checkmark confetti-checkbox" id="confettiCheckbox${task.id}" ${checked}>

                                        <span class="me-2 edit" data-task-title="${task.title}" data-task-completion-date="${task.completion_date}" data-task-completion-time="${task.completion_time}" data-task-description="${taskDescription}" data-task-completed="${task.completed}" data-bs-toggle="offcanvas" data-bs-target="#sidebarRight" aria-controls="sidebarRight">${truncatedTitle}</span>
                                        
                                        <span class="ms-4 mobile-hide">${completionDate}</span>
                                        <span class="ms-4 mobile-hide">${completionTime}</span>
                                        <span class="ms-4 mobile-hide">${formattedUpdatedDate}</span>
                                    </div>
                                    <div class="d-flex align-items-center">
                                        ${hideButtonHtml}
                                        <button class="btn btn-link" type="button" id="dropdownMenuButton${task.id}" data-bs-toggle="dropdown" aria-expanded="false">
                                            <i class="align-middle" data-feather="more-horizontal"></i>
                                        </button>
                                        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton${task.id}">
                                            <li>
                                                <button class="btn btn-wand dropdown-item" data-task-id="${task.id}" id="magicWand${task.id}">
                                                    <i class="align-middle me-2 fab fa-fw fa-buromobelexperte"></i> Break Down
                                                </button>
                                            </li>
                                            <li>
                                                <button class="dropdown-item edit" data-task-id="${task.id}" data-task-title="${task.title}" data-task-completion-date="${task.completion_date}" data-task-completion-time="${task.completion_time}" data-task-description="${taskDescription}" data-task-completed="${task.completed}" data-bs-toggle="offcanvas" data-bs-target="#sidebarRight" aria-controls="sidebarRight">
                                                    <i class="align-middle me-2" data-feather="edit"></i> Edit
                                                </button>
                                            </li>
                                            <li>
                                                <button class="dropdown-item delete" data-task-id="${task.id}">
                                                    <i class="align-middle me-2" data-feather="delete"></i> Delete
                                                </button>
                                            </li>
                                            <li>
                                                <button class="dropdown-item task-title" data-task-id="${task.id}" data-bs-toggle="offcanvas" data-bs-target="#sidebarRight1" aria-controls="sidebarRight1">
                                                    <i class="align-middle me-2" data-feather="book-open"></i> Read
                                                </button>
                                            </li>
                                            <li>
                                                <button class="dropdown-item" data-bs-toggle="modal" data-bs-target="#createSubtaskModal" onclick="setTaskIdForSubtask(${task.id})">
                                                    <i class="align-middle me-2" data-feather="plus-circle"></i> Add Subtask
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </li>
                                <div class="subtasks" id="subtasks-${task.id}">
                                    ${subtasksHtml}
                                </div>
                            </ul>
                        `;

                        wrapper.innerHTML = item + wrapper.innerHTML;
                    });

                    feather.replace();
                    attachEventListeners();
                    attachSubtaskDeleteListeners();
                    attachMagicWandEventListeners();
                    attachSubtaskEditListeners();

                    document.querySelectorAll('.toggle-subtasks').forEach(function(button) {
                        button.addEventListener('click', function() {
                            var taskId = this.getAttribute('data-task-id');
                            var subtasksContainer = document.getElementById('subtasks-' + taskId);
                            if (subtasksContainer.style.display === 'none') {
                                subtasksContainer.style.display = 'block';
                                this.innerHTML = '<i class="align-middle me-2 fas fa-fw fa-angle-up"></i>';
                            } else {
                                subtasksContainer.style.display = 'none';
                                this.innerHTML = '<i class="align-middle me-2 fas fa-fw fa-angle-down"></i>';
                            }
                            feather.replace(); // Re-render feather icons after changing innerHTML
                        });
                    });
                } else {
                    console.log('No tasks found.');
                }
            }
        })
        .catch(function(error) {
            console.log('Error:', error);
        });
}



function attachSubtaskCheckboxListeners() {
    document.querySelectorAll('.subtask-checkbox').forEach(function(checkbox) {
        checkbox.addEventListener('change', function() {
            const subtaskId = this.getAttribute('id').replace('subtaskCheckbox-', '');
            const completed = this.checked;

            // Update the backend with the new completed status
            fetch(`/api/update-subtask-completion-status/${subtaskId}/`, {
                method: 'POST',  // or 'PUT' depending on your backend setup
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')  // Ensure CSRF token is included
                },
                body: JSON.stringify({ completed: completed })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update subtask status');
                }
                return response.json();
            })
            .then(data => {
                console.log('Subtask status updated:', data);
            })
            .catch(error => {
                console.error('Error updating subtask status:', error);
            });
        });
    });
}

// #####################################################################

document.addEventListener('DOMContentLoaded', (event) => {
    const listWrapper = document.getElementById('list-wrapper');
    const categoryId = document.getElementById('category-id').value;
    const loadingSpinner = document.getElementById('loadingSpinner');
    const subtaskVisibility = {}; // Object to store visibility state of subtasks

    // Function to track the visibility state of subtasks before drag and drop
    function updateSubtaskVisibility() {
        document.querySelectorAll('.toggle-subtasks').forEach(function(button) {
            const taskId = button.getAttribute('data-task-id');
            const subtasksContainer = document.getElementById('subtasks-' + taskId);
            subtaskVisibility[taskId] = subtasksContainer.style.display === 'block';
        });
    }

    // Function to reapply the visibility state after tasks are re-rendered
    function reapplySubtaskVisibility() {
        Object.keys(subtaskVisibility).forEach(taskId => {
            const subtasksContainer = document.getElementById('subtasks-' + taskId);
            if (subtaskVisibility[taskId]) {
                subtasksContainer.style.display = 'block';
            } else {
                subtasksContainer.style.display = 'none';
            }
        });
    }

    function showLoadingSpinner() {
        loadingSpinner.style.display = 'block';
    }

    function hideLoadingSpinner() {
        loadingSpinner.style.display = 'none';
    }

    function formatDateTime(dateString) {
        const dateObj = new Date(dateString);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        return formattedDate;
    }

    function setTaskIdForSubtask(taskId) {
        const taskIdInput = document.getElementById('task-id');
        if (taskIdInput) {
            taskIdInput.value = taskId;
        } else {
            console.error('task-id input not found in the DOM.');
        }
    }

    // Function to attach the magic wand functionality to buttons
    function attachMagicWandEventListeners() {
        document.querySelectorAll('.btn-wand').forEach(function(button) {
            button.addEventListener('click', function() {
                const taskId = this.getAttribute('data-task-id');

                // Make an API call to break down the task into subtasks
                fetch(`/api/breakdown-task/${taskId}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')  // Ensure CSRF token is included
                    }
                })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Failed to break down task');
                    }
                })
                .then(data => {
                    console.log('Subtasks generated by AI:', data.subtasks);

                    // Now, save each subtask to the backend to get real IDs
                    const saveSubtasksPromises = data.subtasks.map(subtask => {
                        return fetch('/api/subtask-create/', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': getCookie('csrftoken')  // Ensure CSRF token is included
                            },
                            body: JSON.stringify({
                                'title': subtask,  // Send the subtask title to the backend
                                'task': taskId  // Associate the subtask with the parent task
                            })
                        }).then(response => response.json());
                    });

                    // Once all subtasks are saved, handle them
                    Promise.all(saveSubtasksPromises)
                    .then(savedSubtasks => {
                        console.log('Subtasks saved to backend:', savedSubtasks);

                        const subtasksContainer = document.getElementById(`subtasks-${taskId}`);
                        subtasksContainer.innerHTML = '';

                        // Append each saved subtask with its actual ID from the backend
                        savedSubtasks.forEach((savedSubtask) => {
                            let newSubtaskHtml = `
                                <div class="subtask-item d-flex align-items-center p-2" style="margin-left: 35px;" data-subtask-id="${savedSubtask.id}">
                                    <input type="checkbox" class="me-2 checkmark subtask-checkbox" id="subtaskCheckbox-${savedSubtask.id}" ${savedSubtask.completed ? 'checked' : ''}>
                                    <span>${savedSubtask.title}</span>
                                    <div class="dropdown ms-auto" style="padding-right: 15px;">
                                        <button class="btn btn-link dropdown-toggle" type="button" id="dropdownMenuButton-${savedSubtask.id}" data-bs-toggle="dropdown" aria-expanded="false"></button>
                                        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton-${savedSubtask.id}">
                                            <li><button class="dropdown-item edit-subtask-btn" data-subtask-id="${savedSubtask.id}" data-subtask-title="${savedSubtask.title}">Edit</button></li>
                                            <li><button class="dropdown-item delete-subtask-btn" data-subtask-id="${savedSubtask.id}">Delete</button></li>
                                        </ul>
                                    </div>
                                </div>
                            `;

                            subtasksContainer.innerHTML += newSubtaskHtml;
                        });

                        // Reattach event listeners for the new subtasks (edit, delete, etc.)
                        attachSubtaskEditListeners();
                        attachSubtaskDeleteListeners();
                        attachSubtaskCheckboxListeners();  // Add this to handle the checkbox toggle

                    })
                    .catch(error => {
                        console.error('Error saving subtasks to backend:', error);
                    });

                })
                .catch(error => {
                    console.error('Error creating subtasks:', error);
                });
            });
        });
    }

    // Function to fetch and render tasks, including magic wand functionality
    function fetchAndRenderTasks() {
        fetch(`/api/task-list/${categoryId}/`)
            .then(response => response.json())
            .then(data => {
                console.log('Fetched data:', data);
                listWrapper.innerHTML = '';

                data.tasks.sort((a, b) => a.position - b.position);

                data.tasks.forEach(task => {
                    // Format the completion date, time, and updated_at fields
                    const completionDate = task.completion_date ? formatDateTime(task.completion_date) : 'none';
                    const completionTime = task.completion_time ? formatDateTime(task.completion_time) : 'none';
                    const updatedAt = formatDateTime(task.updated_at);

                    // Escape special characters in the task description
                    var taskDescription = task.description.replace(/"/g, '&quot;').replace(/'/g, '&#39;');

                    // Create HTML for subtasks with an onclick event to open the modal
                    let subtasksHtml = '';  // Initialize subtasksHtml

                    // Check if task has subtasks and reverse the order before rendering
                    if (task.subtasks && task.subtasks.length > 0) {
                        task.subtasks.forEach(function(subtask) {
                            subtasksHtml += `
                                <div class="subtask-item d-flex align-items-center p-2" style="margin-left: 35px;" data-subtask-id="${subtask.id}">
                                    <input type="checkbox" class="me-2 checkmark subtask-checkbox" id="subtaskCheckbox${subtask.id}" ${subtask.completed ? 'checked' : ''}>
                                    <span>${subtask.title}</span>
                                    <div class="dropdown ms-auto" style="padding-right: 15px;">
                                        <button class="btn btn-link dropdown-toggle" type="button" id="dropdownMenuButton${subtask.id}" data-bs-toggle="dropdown" aria-expanded="false">
                                        </button>
                                        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton${subtask.id}">
                                            <li><button class="dropdown-item edit-subtask-btn" data-subtask-id="${subtask.id}" data-subtask-title="${subtask.title}">Edit</button></li>
                                            <li><button class="dropdown-item delete-subtask-btn" data-subtask-id="${subtask.id}">Delete</button></li>
                                        </ul>
                                    </div>
                                </div>
                            `;
                        });
                    }

                    // Conditionally add the "Hide" button if there are subtasks
                    let hideButtonHtml = '';
                    if (task.subtasks && task.subtasks.length > 0) {
                        hideButtonHtml = `
                            <button class="btn btn-link toggle-subtasks" type="button" data-task-id="${task.id}">
                            <i class="align-middle me-2 fas fa-fw fa-angle-up"></i>
                            </button>
                        `;
                    }

                    const item = `
                        <ul class="list-group" id="data-row-${task.id}" data-difficulty="${task.difficulty}">
                            <li class="list-group-item d-flex justify-content-between align-items-center underline-border">
                                <div class="d-flex align-items-center">
                                    <input type="checkbox" class="me-4 checkmark confetti-checkbox" id="confettiCheckbox${task.id}" ${task.completed ? 'checked' : ''}>
                                    <span class="me-2 edit" data-task-id="${task.id}" data-task-title="${task.title}" data-task-completion-date="${task.completion_date}" data-task-completion-time="${task.completion_time}" data-task-description="${taskDescription}" data-task-completed="${task.completed}" data-bs-toggle="offcanvas" data-bs-target="#sidebarRight" aria-controls="sidebarRight">${task.title}</span>
                                    <span class="ms-4 mobile-hide">${completionDate}</span>
                                    <span class="ms-4 mobile-hide">${completionTime}</span>
                                    <span class="ms-4 mobile-hide">${updatedAt}</span>
                                </div>
                                <div class="d-flex align-items-center">
                                    ${hideButtonHtml} <!-- Only add this if there are subtasks -->
                                    <button class="btn btn-link" type="button" id="dropdownMenuButton${task.id}" data-bs-toggle="dropdown" aria-expanded="false">
                                        <i class="align-middle" data-feather="more-horizontal"></i>
                                    </button>
                                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton${task.id}">
                                        <li>
                                            <button class="btn btn-wand dropdown-item" data-task-id="${task.id}" id="magicWand${task.id}">
                                                <i class="align-middle me-2 fab fa-fw fa-buromobelexperte"></i> Break Down
                                            </button>
                                        </li>
                                        <li>
                                            <button class="dropdown-item edit" data-task-id="${task.id}" data-task-title="${task.title}" data-task-completion-date="${task.completion_date}" data-task-completion-time="${task.completion_time}" data-task-description="${taskDescription}" data-task-completed="${task.completed}" data-bs-toggle="offcanvas" data-bs-target="#sidebarRight" aria-controls="sidebarRight">
                                                <i class="align-middle me-2" data-feather="edit"></i> Edit
                                            </button>
                                        </li>
                                        <li>
                                            <button class="dropdown-item delete" data-task-id="${task.id}">
                                                <i class="align-middle me-2" data-feather="delete"></i> Delete
                                            </button>
                                        </li>
                                        <li>
                                            <button class="dropdown-item task-title" data-task-id="${task.id}" data-bs-toggle="offcanvas" data-bs-target="#sidebarRight1" aria-controls="sidebarRight1">
                                                <i class="align-middle me-2" data-feather="book-open"></i> Read
                                            </button>
                                        </li>
                                        <li>
                                            <button class="dropdown-item" data-bs-toggle="modal" data-bs-target="#createSubtaskModal" onclick="setTaskIdForSubtask(${task.id})">
                                                <i class="align-middle me-2" data-feather="plus-circle"></i> Add Subtask
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                            <div class="subtasks" id="subtasks-${task.id}" style="display: ${subtaskVisibility[task.id] === 'none' ? 'none' : 'block'};">
                                ${subtasksHtml} <!-- Insert the generated subtasks HTML -->
                            </div>
                        </ul>
                    `;

                    listWrapper.innerHTML += item;
                });

                feather.replace();
                attachEventListeners(); 
                attachSubtaskDeleteListeners(); 
                attachSubtaskEditListeners();
                attachMagicWandEventListeners();
                attachSubtaskCheckboxListeners();
                reapplySubtaskVisibility();

                // Add event listeners to subtask checkboxes for updating completion status
                document.querySelectorAll('.subtask-checkbox').forEach(function (checkbox) {
                    checkbox.addEventListener('change', function () {
                        var subtaskId = this.id.replace('subtaskCheckbox', '');
                        var completed = this.checked;
                        updateSubtaskCompletionStatus(subtaskId, completed); // Call the function to handle subtask completion update
                    });
                });

                // Add event listeners for the hide buttons
                document.querySelectorAll('.toggle-subtasks').forEach(function (button) {
                    button.addEventListener('click', function () {
                        var taskId = this.getAttribute('data-task-id');
                        var subtasksContainer = document.getElementById('subtasks-' + taskId);
                        if (subtasksContainer.style.display === 'none') {
                            subtasksContainer.style.display = 'block';
                            this.innerHTML = '<i class="align-middle me-2 fas fa-fw fa-angle-up"></i>';
                            subtaskVisibility[taskId] = 'block'; // Save state as 'block'
                        } else {
                            subtasksContainer.style.display = 'none';
                            this.innerHTML = '<i class="align-middle me-2 fas fa-fw fa-angle-down"></i>';
                            subtaskVisibility[taskId] = 'none'; // Save state as 'none'
                        }
                        feather.replace(); // Re-render feather icons after changing innerHTML
                    });
                });

                // Reinitialize Sortable after rendering tasks
                new Sortable(listWrapper, {
                    animation: 150,
                    onStart: function () {
                        updateSubtaskVisibility(); // Update the visibility state before dragging starts
                    },
                    onEnd: function (evt) {
                        const items = evt.to.children;
                        const updatedTasks = [];

                        for (let i = 0; i < items.length; i++) {
                            const itemId = items[i].id.split('-')[2];
                            updatedTasks.push({ id: itemId, position: i });
                        }

                        fetch('http://127.0.0.1:7000/api/update-task-positions/', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': csrftoken,
                            },
                            body: JSON.stringify(updatedTasks)
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                console.log('Task positions updated successfully');
                                fetchAndRenderTasks(); 
                            } else {
                                console.error('Failed to update task positions');
                            }
                        })
                        .catch(error => console.error('Error:', error));
                    }
                });

                
            })
            .catch(error => console.error('Error fetching task list:', error));
    }
    fetchAndRenderTasks();
});

// ########################################################
// #              A.I FUNCTIONALITY                       #
// ########################################################
// Magic wand event listener
function attachMagicWandEventListeners() {
    document.querySelectorAll('.btn-wand').forEach(function(button) {
        button.addEventListener('click', function() {
            const taskId = this.getAttribute('data-task-id');

            // Make an API call to break down the task into subtasks
            fetch(`/api/breakdown-task/${taskId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')  // Ensure CSRF token is included
                }
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Failed to break down task');
                }
            })
            .then(data => {
                console.log('Subtasks generated by AI:', data.subtasks);

                // Now, save each subtask to the backend to get real IDs
                const saveSubtasksPromises = data.subtasks.map(subtask => {
                    return fetch('/api/subtask-create/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCookie('csrftoken')  // Ensure CSRF token is included
                        },
                        body: JSON.stringify({
                            'title': subtask,  // Send the subtask title to the backend
                            'task': taskId  // Associate the subtask with the parent task
                        })
                    }).then(response => response.json());
                });

                // Save each subtask to the backend
                Promise.all(saveSubtasksPromises)
                .then(savedSubtasks => {
                    console.log('Subtasks saved to backend:', savedSubtasks);

                    const subtasksContainer = document.getElementById(`subtasks-${taskId}`);
                    subtasksContainer.innerHTML = '';  // Clear previous subtasks

                    // Append each saved subtask with its actual ID from the backend
                    savedSubtasks.forEach((savedSubtask) => {
                        if (!savedSubtask.title) {
                            console.error('Subtask title is undefined:', savedSubtask);
                            return;
                        }

                        let newSubtaskHtml = `
                            <div class="subtask-item d-flex align-items-center p-2" style="margin-left: 35px;" data-subtask-id="${savedSubtask.id}">
                                <input type="checkbox" class="me-2 checkmark subtask-checkbox" id="subtaskCheckbox-${savedSubtask.id}" ${savedSubtask.completed ? 'checked' : ''}>
                                <span>${savedSubtask.title}</span>
                                <div class="dropdown ms-auto" style="padding-right: 15px;">
                                    <button class="btn btn-link dropdown-toggle" type="button" id="dropdownMenuButton-${savedSubtask.id}" data-bs-toggle="dropdown" aria-expanded="false"></button>
                                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton-${savedSubtask.id}">
                                        <li><button class="dropdown-item edit-subtask-btn" data-subtask-id="${savedSubtask.id}" data-subtask-title="${savedSubtask.title}">Edit</button></li>
                                        <li><button class="dropdown-item delete-subtask-btn" data-subtask-id="${savedSubtask.id}">Delete</button></li>
                                    </ul>
                                </div>
                            </div>
                        `;

                        subtasksContainer.innerHTML += newSubtaskHtml;
                    });

                    // Reattach event listeners for the new subtasks (edit, delete, etc.)
                    attachSubtaskEditListeners();
                    attachSubtaskDeleteListeners();
                    attachSubtaskCheckboxListeners();  // Add this to handle the checkbox toggle
                })
                .catch(error => {
                    console.error('Error saving subtasks to backend:', error);
                });


            })
            .catch(error => {
                console.error('Error creating subtasks:', error);
            });
        });
    });
}








document.addEventListener('DOMContentLoaded', () => {
    initAntonOptimizeButton();
    fetchAndRenderTasks();  // Initially fetch and render tasks on page load
});

// Function to initialize Anton Optimize Button
function initAntonOptimizeButton() {
    const antonOptimizeBtn = document.getElementById('openPopupBtn');

    if (antonOptimizeBtn) {
        antonOptimizeBtn.addEventListener('click', () => {
            console.log('Anton Optimize button clicked!');
            fetchTaskAnalysisAndUpdate();  // Call this function when Anton Optimize is clicked
        });
    } else {
        console.error('Anton Optimize button not found in the DOM.');
    }
}

// Function to fetch task analysis, update the difficulty, and then re-fetch and render tasks
function fetchTaskAnalysisAndUpdate() {
    const categoryId = document.getElementById('category-id').value;  // Get category ID dynamically

    console.log('Fetching task analysis for category:', categoryId);  // Log the categoryId for debugging

    // Show a loading spinner (optional)
    showLoadingSpinner();

    // Fetch analysis data from the backend and update tasks
    fetch(`/api/task-analysis/${categoryId}/`)  // Adjust the URL as necessary
        .then(response => response.json())
        .then(data => {
            console.log('Task Analysis Data:', data);  // Log the data to the console

            // Now that the analysis is done, we need to fetch and re-render the updated tasks
            fetchAndRenderTasks();  // Call this to re-fetch and re-render the updated tasks
        })
        .catch(error => {
            console.error('Error fetching task analysis:', error);  // Log any errors
        })
        .finally(() => {
            hideLoadingSpinner();  // Hide spinner once the tasks are rendered
        });
}

// Reusable function to render individual tasks
function renderTask(task) {
    let updatedAt = new Date(task.updated_at);
    let formattedUpdatedDate = updatedAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const completionDate = task.completion_date ? formatDateTime(task.completion_date) : 'none';
    const completionTime = task.completion_time ? formatDateTime(task.completion_time) : 'none';
    var checked = task.completed ? 'checked' : '';

    // Escape special characters in the task description
    var taskDescription = task.description.replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    // Truncate title based on screen size
    var titleLimit = isMobile() ? 27 : 60;
    var truncatedTitle = truncateText(task.title, titleLimit);

    // Create HTML for subtasks with delete button
    let subtasksHtml = '';
    if (task.subtasks && task.subtasks.length > 0) {
        task.subtasks.forEach(function(subtask) { 
            subtasksHtml += `
                <div class="subtask-item d-flex align-items-center p-2" style="margin-left: 35px;" data-subtask-id="${subtask.id}">
                    <input type="checkbox" class="me-2 checkmark subtask-checkbox" id="subtaskCheckbox${subtask.id}" ${subtask.completed ? 'checked' : ''}>
                    <span>${subtask.title}</span>
                    <div class="dropdown ms-auto" style="padding-right: 15px;">
                        <button class="btn btn-link dropdown-toggle" type="button" id="dropdownMenuButton${subtask.id}" data-bs-toggle="dropdown" aria-expanded="false"></button>
                        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton${subtask.id}">
                            <li><button class="dropdown-item edit-subtask-btn" data-subtask-id="${subtask.id}" data-subtask-title="${subtask.title}">Edit</button></li>
                            <li><button class="dropdown-item delete-subtask-btn" data-subtask-id="${subtask.id}">Delete</button></li>
                        </ul>
                    </div>
                </div>
            `;
        });
    }

    // Conditionally add the "Hide" button if there are subtasks
    let hideButtonHtml = '';
    if (task.subtasks && task.subtasks.length > 0) {
        hideButtonHtml = `
            <button class="btn btn-link toggle-subtasks" type="button" data-task-id="${task.id}">
                <i class="align-middle me-2 fas fa-fw fa-angle-up"></i>
            </button>
        `;
    }

    // Add a button to set task ID for subtask creation inside the dropdown
    return `
        <ul class="list-group" id="data-row-${task.id}">
            <li class="list-group-item d-flex justify-content-between align-items-center underline-border">
                <div class="d-flex align-items-center">
                    <input type="checkbox" class="me-4 checkmark confetti-checkbox" id="confettiCheckbox${task.id}" ${checked}>
                    <span class="me-2 edit" data-task-id="${task.id}" data-task-title="${task.title}" data-task-completion-date="${task.completion_date}" data-task-completion-time="${task.completion_time}" data-task-description="${taskDescription}" data-task-completed="${task.completed}" data-bs-toggle="offcanvas" data-bs-target="#sidebarRight" aria-controls="sidebarRight">${truncatedTitle}</span>
                    <span class="ms-4 mobile-hide">${completionDate}</span>
                    <span class="ms-4 mobile-hide">${completionTime}</span>
                    <span class="ms-4 mobile-hide">${formattedUpdatedDate}</span>
                </div>
                <div class="d-flex align-items-center">
                    ${hideButtonHtml}
                    <button class="btn btn-link" type="button" id="dropdownMenuButton${task.id}" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="align-middle" data-feather="more-horizontal"></i>
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton${task.id}">
                        <li>
                            <button class="btn btn-wand dropdown-item" data-task-id="${task.id}" id="magicWand${task.id}">
                                <i class="align-middle me-2 fab fa-fw fa-buromobelexperte"></i> Break Down
                            </button>
                        </li>
                        <li>
                            <button class="dropdown-item edit" data-task-id="${task.id}" data-task-title="${task.title}" data-task-completion-date="${task.completion_date}" data-task-completion-time="${task.completion_time}" data-task-description="${taskDescription}" data-task-completed="${task.completed}" data-bs-toggle="offcanvas" data-bs-target="#sidebarRight" aria-controls="sidebarRight">
                                <i class="align-middle me-2" data-feather="edit"></i> Edit
                            </button>
                        </li>
                        <li>
                            <button class="dropdown-item delete" data-task-id="${task.id}">
                                <i class="align-middle me-2" data-feather="delete"></i> Delete
                            </button>
                        </li>
                        <li>
                            <button class="dropdown-item task-title" data-task-id="${task.id}" data-bs-toggle="offcanvas" data-bs-target="#sidebarRight1" aria-controls="sidebarRight1">
                                <i class="align-middle me-2" data-feather="book-open"></i> Read
                            </button>
                        </li>
                        <li>
                            <button class="dropdown-item" data-bs-toggle="modal" data-bs-target="#createSubtaskModal" onclick="setTaskIdForSubtask(${task.id})">
                                <i class="align-middle me-2" data-feather="plus-circle"></i> Add Subtask
                            </button>
                        </li>
                    </ul>
                </div>
            </li>
            <div class="subtasks" id="subtasks-${task.id}">
                ${subtasksHtml}
            </div>
        </ul>
    `;
}

// Function to fetch and render tasks
function fetchAndRenderTasks() {
    const categoryId = document.getElementById('category-id').value;  // Get category ID dynamically
    const listWrapper = document.getElementById('list-wrapper');  // The wrapper where tasks are rendered

    fetch(`/api/task-list/${categoryId}/`)
        .then(response => response.json())
        .then(data => {
            console.log('Fetched task data:', data);

            // Clear the current task list
            listWrapper.innerHTML = '';

            // Sort tasks by their position or difficulty to render in order
            data.tasks.sort((a, b) => a.difficulty - b.difficulty);  // Sort tasks from least to most difficult

            // Render each task using the reusable renderTask function
            data.tasks.forEach(task => {
                const taskHtml = renderTask(task);
                listWrapper.innerHTML += taskHtml;  // Append each task to the list wrapper
            });

            // Reinitialize necessary elements like event listeners or icons after rendering
            feather.replace();  // Re-render feather icons or any other UI elements
            attachEventListeners();  // Re-attach any event listeners

            // Initialize sortable for drag-and-drop functionality
            initSortable(listWrapper);  // Attach drag-and-drop
        })
        .catch(error => {
            console.error('Error fetching task list:', error);
        });
}

// Function to initialize SortableJS
function initSortable(listWrapper) {
    new Sortable(listWrapper, {
        animation: 150,
        onEnd: function (evt) {
            const items = evt.to.children;
            const updatedTasks = [];

            // Update task positions based on the new order after drag-and-drop
            for (let i = 0; i < items.length; i++) {
                const itemId = items[i].id.split('-')[2]; // Assuming id format is data-row-{task.id}
                updatedTasks.push({ id: itemId, position: i });
            }

            // Save the updated order back to the server
            fetch('/api/update-task-positions/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: JSON.stringify(updatedTasks)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Task positions updated successfully');
                } else {
                    console.error('Failed to update task positions');
                }
            })
            .catch(error => {
                console.error('Error updating task positions:', error);
            });
        }
    });
}

// Optional functions to show and hide a loading spinner
function showLoadingSpinner() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) {
        loadingSpinner.style.display = 'block';
    }
}

function hideLoadingSpinner() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
}

















// ####################################################################
// #                     EVENT LISTENERS                              #
// ####################################################################

document.addEventListener('DOMContentLoaded', (event) => {
    const antonTaskDetailContainer = document.getElementById('anton-task-detail-container');
    const fetchButton = document.getElementById('fetch-data-button');

    // Listen for the "shown" event of the offcanvas (when the offcanvas is fully visible)
    document.getElementById('sidebarRight2').addEventListener('shown.bs.offcanvas', function () {
        // Get the category ID from the button's data attribute
        const categoryId = fetchButton.getAttribute('data-category-id');

        console.log('Fetching history for category ID:', categoryId); // Debugging line

        // Fetch the history from the server
        fetch(`http://127.0.0.1:7000/api/get-task-analyses/${categoryId}/`)
            .then(response => {
                console.log('Response status:', response.status); // Debugging line
                return response.json();
            })
            .then(data => {
                console.log('History data received:', data); // Debugging line

                // Clear any existing content in the container
                antonTaskDetailContainer.innerHTML = '';

                if (data.analyses && data.analyses.length > 0) {
                    // Loop through each analysis and display it
                    data.analyses.forEach((analysisItem, index) => {
                        // Create a paragraph element for each analysis
                        const paragraph = document.createElement('p');
                        paragraph.innerHTML = `<strong>Task ${index + 1}:</strong> ${analysisItem.analysis}`;
                        antonTaskDetailContainer.appendChild(paragraph);
                    });
                } else {
                    antonTaskDetailContainer.innerHTML = '<p>No analysis history found.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching task analysis history:', error);
                antonTaskDetailContainer.innerHTML = '<p>Error fetching analysis history. Please try again later.</p>';
            });
    });
});

// Ensure that buildList is called after the DOM is fully loaded with the correct category ID
document.addEventListener('DOMContentLoaded', function() {
    var categoryId = document.getElementById('category-id').value;
    buildList(categoryId);
});

// makeing the text boxes be empty
document.addEventListener("DOMContentLoaded", function() {
    const addButton = document.querySelector('.btn.btn-primary.top_add_button.ms-auto');
    const addSecButton = document.querySelector('.btn.btn-primary.bottom_add_button');

    function prepareForNewTask() {
        activateItem = null;
        clearFormInputs();
    }

    function clearFormInputs() {
        document.getElementById('title').value = '';
        document.getElementById('completion_date').value = '';
        document.getElementById('completion_time').value = '';
        tinymce.get('description').setContent(''); // Clear TinyMCE content
    }

    addButton && addButton.addEventListener('click', prepareForNewTask);
    addSecButton && addSecButton.addEventListener('click', prepareForNewTask);
});

function attachSubtaskEditListeners() {
    document.querySelectorAll('.edit-subtask-btn').forEach(function(button) {
        button.addEventListener('click', function() {
            var subtaskId = button.getAttribute('data-subtask-id');
            var subtaskTitle = button.getAttribute('data-subtask-title');

            // Populate the modal with subtask data
            document.getElementById('edit-subtask-id').value = subtaskId;
            document.getElementById('edit-subtask-title').value = subtaskTitle;

            // Show the modal
            var editModal = new bootstrap.Modal(document.getElementById('editSubtaskModal'), {
                keyboard: false
            });
            editModal.show();
        });
    });
}

function attachSubtaskDeleteListeners() {
    document.querySelectorAll('.delete-subtask-btn').forEach(function(button) {
        button.addEventListener('click', function() {
            var subtaskId = this.getAttribute('data-subtask-id');
            deleteSubtask(subtaskId);  // Implement delete functionality
        });
    });
}

function attachEventListeners() {
    // Attach event listeners to task titles
    document.querySelectorAll('.task-title').forEach(function(taskTitle) {
        taskTitle.addEventListener('click', function() {
            var taskId = this.getAttribute('data-task-id');
            displayTaskDetail(taskId);
        });
    });

    // Edit button click event
    document.querySelectorAll('.edit').forEach(function(button) {
        button.addEventListener('click', function() {
            var taskId = button.getAttribute('data-task-id');
            var taskTitle = button.getAttribute('data-task-title');
            var taskCompletionDate = button.getAttribute('data-task-completion-date');
            var taskCompletionTime = button.getAttribute('data-task-completion-time');
            var taskDescription = button.getAttribute('data-task-description');

            // Call editItem function with correct parameters
            editItem(taskId, taskTitle, taskCompletionDate, taskCompletionTime, taskDescription);
        });
    });
    
    // Delete button click event
    document.querySelectorAll('.delete').forEach(function(button) {
        button.addEventListener('click', function() {
            var taskId = button.getAttribute('data-task-id');
            deleteItem(taskId);  // Corrected function name
        });
    });

    // Attach event listeners to subtask checkboxes for updating completion status
    document.querySelectorAll('.subtask-checkbox').forEach(function(checkbox) {
        checkbox.addEventListener('change', function() {
            var subtaskId = this.id.replace('subtaskCheckbox', '');  // Use the correct prefix here
            var completed = this.checked;
            updateSubtaskCompletionStatus(subtaskId, completed); // Function to handle subtask completion update
        });
    });

    // Attach event listeners to main task checkboxes for updating completion status
    document.querySelectorAll('.confetti-checkbox').forEach(function(checkbox) {
        checkbox.addEventListener('change', function() {
            var taskId = this.id.replace('confettiCheckbox', '');
            var completed = this.checked;
            updateTaskCompletionStatus(taskId, completed); // Function to handle task completion update

            if (this.checked) {
                playPopSound();
                for (let i = 0; i < 30; i++) {
                    createConfettiParticle(this);
                }
            }
        });
    });
}

// #####################################################
// #               MAIN TASKS C.R.U.D                  #
// #####################################################
// Create a task
var form = document.getElementById('form-wrapper');
form.addEventListener('submit', function(e){
    e.preventDefault();
    console.log('form submitted');

    var url = 'http://127.0.0.1:7000/api/task-create/';
    var method = 'POST';

    var title = document.getElementById('title').value;
    var completion_date = document.getElementById('completion_date').value;
    var completion_time = document.getElementById('completion_time').value;
    var description = tinymce.get('description').getContent(); // Get TinyMCE content
    var category_id = document.getElementById('category-id').value;
    var owner_id = document.getElementById('user-id').value;

    var data = {
        'title': title,
        'category': category_id,
        'owner': owner_id,
        'description': description // Include TinyMCE content
    };

    if (completion_date) {
        data['completion_date'] = completion_date;
    }

    if (completion_time) {
        data['completion_time'] = completion_time;
    }

    if (activateItem != null) {
        url = `http://127.0.0.1:7000/api/task-update/${activateItem.id}/`;
        method = 'POST'; // Use POST if your server expects POST for update
        data.id = activateItem.id; // Include task ID for the update
    }

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {throw err});
        }
        return response.json();
    })
    .then(function(responseData){
        console.log('Response:', responseData);
        buildList(category_id);
        if (activateItem == null) { // Only reset the form if a new task was created
            form.reset();
            tinymce.get('description').setContent(''); // Reset TinyMCE content
        }
        activateItem = null; // Reset activateItem after update
    })
    .catch(function(error) {
        console.log('Error:', error);
    });
});

// display task detail  
function displayTaskDetail(taskId) {
    var url = `http://127.0.0.1:7000/api/task-detail/${taskId}/`;

    fetch(url)
        .then((resp) => resp.json())
        .then(function(data){
            var taskDetailContainer = document.getElementById('task-detail-container');
            if (taskDetailContainer) {
                taskDetailContainer.innerHTML = `
                    <h2><b>${data.title}</b></h2>
                    <p>Created: ${data.created_at}</p>
                    <p>
                        <svg style="margin-right: 8px;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar-event" viewBox="0 0 16 16">
                            <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z"/>
                            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
                        </svg> ${data.completion_date}
                    </p>
                    <p>
                        <svg style="margin-right: 8px;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clock-history" viewBox="0 0 16 16">
                            <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022zm2.004.45a7 7 0 0 0-.985-.299l.219-.976q.576.129 1.126.342zm1.37.71a7 7 0 0 0-.439-.27l.493-.87a8 8 0 0 1 .979.654l-.615.789a7 7 0 0 0-.418-.302zm1.834 1.79a7 7 0 0 0-.653-.796l.724-.69q.406.429.747.91zm.744 1.352a7 7 0 0 0-.214-.468l.893-.45a8 8 0 0 1 .45 1.088l-.95.313a7 7 0 0 0-.179-.483m.53 2.507a7 7 0 0 0-.1-1.025l.985-.17q.1.58.116 1.17zm-.131 1.538q.05-.254.081-.51l.993.123a8 8 0 0 1-.23 1.155l-.964-.267q.069-.247.12-.501m-.952 2.379q.276-.436.486-.908l.914.405q-.24.54-.555 1.038zm-.964 1.205q.183-.183.35-.378l.758.653a8 8 0 0 1-.401.432z"/>
                            <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0z"/>
                            <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5"/>
                        </svg> ${data.completion_time}
                    </p>
                    <p>
                        <svg style="margin-right: 8px;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-up-square" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm8.5 9.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707z"/>
                        </svg> ${new Date(data.updated_at).toLocaleString()}
                    </p>
                    <p>Completed: ${data.completed ? '<svg style="color: green; width: 12px; height: 12px;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dot" viewBox="0 0 16 16"><path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/></svg>' : '<svg style="color: red;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dot" viewBox="0 0 16 16"><path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/></svg>'}</p>
                    <p>${data.description}</p>

                `;
                feather.replace();
            }
        })
        .catch(function(error) {
            console.log('Error:', error);
        });
}

// Edit tasks
function editItem(taskId, taskTitle, taskCompletionDate, taskCompletionTime, taskDescription) {
    console.log('Item clicked:', taskId, 'Title:', taskTitle, 'Completion Date:', taskCompletionDate, 'Completion Time:', taskCompletionTime, 'Description:', taskDescription);
    activateItem = { 
        id: taskId, 
        title: taskTitle, 
        completionDate: taskCompletionDate,  
        CompletionTime: taskCompletionTime,
        Description: taskDescription,
    };
    document.getElementById('title').value = taskTitle;
    document.getElementById('completion_date').value = taskCompletionDate;
    document.getElementById('completion_time').value = taskCompletionTime;
    tinymce.get('description').setContent(taskDescription);
}

// Function to update task completion status
function updateTaskCompletionStatus(taskId, completed) {
    var url = `http://127.0.0.1:7000/api/task-update/${taskId}/`;
    var data = {
        'completed': completed
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(function(responseData){
        console.log('Task updated:', responseData);
    })
    .catch(function(error) {
        console.log('Error updating task:', error);
    });
}

// Delete a task
// Consolidated delete function
function deleteItem(taskId) {
    console.log('Delete clicked for task:', taskId);  // Log task ID for debugging

    var url = `http://127.0.0.1:7000/api/task-delete/${taskId}/`;  // API endpoint for deletion

    fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,  // Ensure the CSRF token is included
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text(); // Return response data (can change to response.json() if API returns JSON)
    })
    .then(responseData => {
        console.log('Task deleted successfully:', responseData);  // Log the response data

        // Remove the task element from the DOM
        var taskElement = document.getElementById(`data-row-${taskId}`);
        if (taskElement) {
            taskElement.remove();
        }

        // Optionally, you can rebuild the list to ensure consistency
        buildList(document.getElementById('category-id').value);  // Rebuild task list after deletion
    })
    .catch(error => {
        console.error('Error deleting task:', error);  // Log any errors that occur during deletion
    });
}

// Delete all tasks in the category
function deleteAllTasksInCategory(categoryId) {
    console.log('Delete all tasks clicked for category:', categoryId);
    var url = `http://127.0.0.1:7000/api/delete-all-tasks-in-category/${categoryId}/`;

    fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text(); // Or response.json() if your API returns JSON
    })
    .then(function(responseData){
        console.log('Response:', responseData);
        
        // Remove all task elements from the DOM
        var taskElements = document.querySelectorAll('[id^="data-row-"]');
        taskElements.forEach(function(taskElement) {
            taskElement.parentNode.removeChild(taskElement);
        });

        // Optionally, clear the category header or other elements
        var categoryHeader = document.getElementById('category-header');
        var categoryCreatedAt = document.getElementById('category-created-at');
        if (categoryHeader) categoryHeader.innerHTML = '';
        if (categoryCreatedAt) categoryCreatedAt.innerHTML = '';
        
        // Optionally, show a message that all tasks have been deleted
        var wrapper = document.getElementById('list-wrapper');
        if (wrapper) wrapper.innerHTML = '<p>All tasks have been deleted.</p>';
    })
    .catch(function(error) {
        console.log('Error:', error);
    });
}

function truncateText(text, limit) {
    if (text.length > limit) {
        return text.substring(0, limit) + '...';
    }
    return text;
}

function isMobile() {
    return window.innerWidth <= 768; // Adjust the width according to your mobile breakpoint
}


// ########################################################
// #                   SUBTASKS C.R.U.D                   #
// ########################################################

// Subtask creation form handling
var subtaskForm = document.getElementById('subtask-form');
subtaskForm.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('Subtask form submitted');

    var title = document.getElementById('subtask-title').value;
    var taskId = document.getElementById('task-id').value;  // ID of the parent task

    if (!taskId) {
        alert('Please select a task to add a subtask.');
        return;
    }

    var url = 'http://127.0.0.1:7000/api/subtask-create/';
    var method = 'POST';
    var data = {
        'title': title,
        'task': taskId
    };

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),  // Ensure CSRF token is included
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err });
        }
        return response.json();
    })
    .then(function(responseData) {
        console.log('Subtask created:', responseData);

        // Dynamically add the new subtask to the UI without refreshing the entire task list
        var subtasksContainer = document.getElementById(`subtasks-${taskId}`);

        // Create the new subtask HTML dynamically
        let newSubtaskHtml = `
            <div class="subtask-item d-flex align-items-center p-2" style="margin-left: 35px;" data-subtask-id="${responseData.id}">
                <input type="checkbox" class="me-2 checkmark subtask-checkbox" id="subtaskCheckbox${responseData.id}">
                <span>${responseData.title}</span>
                <div class="dropdown ms-auto" style="padding-right: 15px;">
                    <button class="btn btn-link dropdown-toggle" type="button" id="dropdownMenuButton${responseData.id}" data-bs-toggle="dropdown" aria-expanded="false"></button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton${responseData.id}">
                        <li><button class="dropdown-item edit-subtask-btn" data-subtask-id="${responseData.id}" data-subtask-title="${responseData.title}">Edit</button></li>
                        <li><button class="dropdown-item delete-subtask-btn" data-subtask-id="${responseData.id}">Delete</button></li>
                    </ul>
                </div>
            </div>
        `;

        // Append the new subtask to the subtasks container
        subtasksContainer.innerHTML += newSubtaskHtml;

        // Reattach event listeners for the new subtask (edit, delete, etc.)
        attachSubtaskEditListeners();
        attachSubtaskDeleteListeners();

        // Reset the form after submission
        subtaskForm.reset();
        document.getElementById('task-id').value = taskId;  // Retain task ID for continuous subtask creation
        document.getElementById('subtask-title').focus();   // Keep focus on the title input for quicker subtask creation

    })
    .catch(function(error) {
        console.log('Error creating subtask:', error);
    });
});

var editSubtaskForm = document.getElementById('subtask-edit-form');
editSubtaskForm.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('Subtask edit form submitted');

    var subtaskId = document.getElementById('edit-subtask-id').value;
    var subtaskTitle = document.getElementById('edit-subtask-title').value;

    var url = `http://127.0.0.1:7000/api/subtask-update/${subtaskId}/`; // Endpoint for updating the subtask
    var method = 'PUT';

    var data = {
        'title': subtaskTitle
    };

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'), // Ensure CSRF token is included
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err });
        }
        return response.json();
    })
    .then(function(responseData) {
        console.log('Subtask updated:', responseData);

        // Dynamically update the subtask title in the UI
        var subtaskElement = document.querySelector(`[data-subtask-id="${subtaskId}"] span`);
        if (subtaskElement) {
            subtaskElement.textContent = subtaskTitle; // Update the title in the UI
        }

        // Hide the modal after updating
        var editModal = bootstrap.Modal.getInstance(document.getElementById('editSubtaskModal'));
        editModal.hide();
    })
    .catch(function(error) {
        console.log('Error updating subtask:', error);
    });
});

function updateSubtaskCompletionStatus(subtaskId, completed) {
    var url = `http://127.0.0.1:7000/api/update-subtask-completion-status/${subtaskId}/`;
    
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken') // Make sure CSRF token is correctly included
        },
        body: JSON.stringify({
            'completed': completed
        })
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(function(data) {
        console.log('Subtask updated:', data);
    })
    .catch(function(error) {
        console.error('Error updating subtask:', error);
    });
}

function deleteSubtask(subtaskId) {
    var url = `http://127.0.0.1:7000/api/delete-subtask/${subtaskId}/`;

    fetch(url, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': getCookie('csrftoken') // Ensure you handle CSRF token
        }
    })
    .then(response => {
        if (response.ok) {
            console.log('Subtask deleted successfully');
            // Remove the subtask from the DOM by targeting the parent container
            var subtaskElement = document.querySelector(`.subtask-item[data-subtask-id='${subtaskId}']`);
            if (subtaskElement) {
                subtaskElement.remove(); // Dynamically remove the subtask from the DOM
            } else {
                console.error(`Element with subtask ID ${subtaskId} not found`);
            }
        } else {
            console.error('Failed to delete subtask');
        }
    })
    .catch(error => console.error('Error deleting subtask:', error));
}

function openSubtaskModal(subtaskId, subtaskTitle) {
    console.log('Opening modal for subtask:', subtaskId, subtaskTitle); // Debugging line

    // Set subtask data in the modal
    document.getElementById('subtask-title').value = subtaskTitle;
    document.getElementById('task-id').value = subtaskId;

    // Initialize and show the modal using Bootstrap's modal method
    var exampleModal = new bootstrap.Modal(document.getElementById('exampleModal'), {
        keyboard: false
    });
    exampleModal.show();
}

// Function to set task ID for the subtask form
function setTaskIdForSubtask(taskId) {
    const taskIdInput = document.getElementById('task-id');
    if (taskIdInput) {
        taskIdInput.value = taskId;
    } else {
        console.error('task-id input not found in the DOM.');
    }
}

// ########################################################
// #           CONFETTI POPSOUND AND ANIMATION            #
// ########################################################
document.getElementById('confettiCheckbox').addEventListener('change', function() {
    if (this.checked) {
        playPopSound();
        for (let i = 0; i < 30; i++) {
            createConfettiParticle(this);
        }
    }
});

function createConfettiParticle(button) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    document.body.appendChild(confetti);

    const buttonRect = button.getBoundingClientRect();
    const x = Math.random() * 400 - 200; // Spread particles within a 400px range horizontally
    const y = Math.random() * 400 - 200; // Spread particles within a 400px range vertically

    confetti.style.left = `${buttonRect.left + buttonRect.width / 2 + scrollX}px`;
    confetti.style.top = `${buttonRect.top + buttonRect.height / 2 + scrollY}px`;
    confetti.style.backgroundColor = getRandomColor();
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    confetti.style.setProperty('--x', `${x}px`);
    confetti.style.setProperty('--y', `${y}px`);
    confetti.style.animationDuration = `${Math.random() * 1 + 0.5}s`;
    
    confetti.addEventListener('animationend', () => {
        confetti.remove();
    });
}

function getRandomColor() {
    const colors = ['#f2d74e', '#f28c8c', '#4ef2a3', '#4e7af2', '#e74ef2'];
    return colors[Math.floor(Math.random() * colors.length)];
}


const openPopupBtn = document.getElementById('openPopupBtn');
const popup = document.getElementById('popup');

// Function to open the popup and fetch AI analysis
openPopupBtn.addEventListener('click', function() {
    // Get the category ID from the hidden input field
    const categoryId = document.getElementById('category-id').value;

    console.log('Fetching analysis for category ID:', categoryId); // Debugging line


    // Fetch the analysis from the server
    fetch(`/api/task-analysis/${categoryId}/`)
        .then(response => {
            console.log('Response status:', response.status); // Debugging line
            return response.json();
        })
        .then(data => {
            console.log('Data received:', data); // Debugging line

            // Clear any existing content
            aiAnalysisContent.innerHTML = '';

            if (data.analyses && data.analyses.length > 0) {
                // Loop through each analysis and display it
                data.analyses.forEach((analysisItem, index) => {
                    // Create a paragraph element for each analysis
                    const paragraph = document.createElement('p');
                    paragraph.textContent = `${index + 1}. ${analysisItem.analysis}`;
                    aiAnalysisContent.appendChild(paragraph);

                    // Optionally, use typeWriterEffect for each paragraph
                    // typeWriterEffect(`${index + 1}. ${analysisItem.analysis}`, paragraph);
                });
            } else {
                aiAnalysisContent.textContent = 'No analysis found. Please try again later.';
            }

            // Open the popup
            popup.style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching AI analysis:', error);
            aiAnalysisContent.textContent = 'Error fetching analysis. Please try again later.';
            popup.style.display = 'block'; // Show error message in popup
        });
});

function playPopSound() {
    var audio = document.getElementById('pop-sound');
    console.log('Audio element:', audio);
    if (audio) {
        audio.play().catch(function(error) {
            console.log('Audio play error:', error);
        });
    }
}

