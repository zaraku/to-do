import './style.css';
import Sortable from 'sortablejs';

var taskList = document.getElementById('task-list');
Sortable.create(taskList, {
    animation: 150,
    ghostClass: 'blue-background-class'
});

class TaskManager {
    constructor() {
        this.tasks = [];
    }

    loadTasks(){
        var tasks = JSON.parse(window.localStorage.getItem("tasks"));
        if (!tasks) return;
        for (var task of tasks) {
          this.tasks.push(task);
          DOMManager.addTask(task);
        }
    }

    saveTasks(){
        window.localStorage.setItem("tasks",JSON.stringify(this.tasks));
    }

    createTask(project, title, description, date) {
        let task = new Task(project, this.tasks.length, title, description, date);
        this.tasks.push(task);
        this.saveTasks();
        return task;
    }

    updateTask(task, project, title, description, date) {
        task.project = project;
        task.title = title;
        task.description = description;
        task.date = date;
        this.saveTasks();
    }

    updateId(){
        for (var i = 0; i < this.tasks.length; i++){
            this.tasks[i].id = i;
        }
    }

    deleteTask(id){
        this.tasks.splice(id,1);
        this.updateId();
        this.saveTasks();
    }
}

class Task {
    constructor(project, id, title, description, date, checked) {
        this.id = id;
        this.project = project;
        this.title = title;
        this.description = description;
        this.date = date;
        this.checked = checked;
    }
}

class ProjectManager {
    constructor() {
        this.projects = [];
        this.currentProject = "";
    }

    loadProjects(){
        var projects = JSON.parse(window.localStorage.getItem("projects"));
        if (!projects) return;
        for (var proj of projects) {
          this.projects.push(proj);
          DOMManager.addProject(proj);
        }
    }

    saveProjects(){
        window.localStorage.setItem("projects",JSON.stringify(this.projects));
    }

    createProject(project) {
        this.projects.push(project);
        this.saveProjects();
    }

    deleteProject(index){
        this.projects.splice(index,1);
        this.saveProjects();
    }

    deleteCurrentProject() {
        let index = this.projects.indexOf(this.currentProject);
        this.projects.splice(index,1);
        this.saveProjects();
    }
}

let projectManager = new ProjectManager();
let taskManager = new TaskManager();

let DOMManager = (function(){
    let newProjectBtn = document.getElementById("new-project-btn");
    let projectList = document.getElementById("project-list");
    let newTaskBtn = document.getElementById("new-task-btn");
    let taskList = document.getElementById("task-list");
    let allTasks = document.getElementById("all-tasks");

    function filterTasks(project){
        let taskNodes = Array.from(taskList.childNodes);
        taskNodes.shift(); // remove empty node
        if (project) {
            for (var i = 0; i < taskManager.tasks.length; i++) {
                if (taskManager.tasks[i].project !== project) {
                    taskNodes[i].style.display = "none";
                } else {
                    taskNodes[i].style.display = "";
                }
                
            }
        } else {
            for (var node of taskNodes) {
                node.style.display = "";
            }
        }
    }

    let setCurrentProject = function(e){
        projectList.childNodes.forEach(proj => {
            if (proj.nodeName !== "LI") return;
            proj.classList.remove("current-project");
        });
        if(projectManager.projects.includes(e.target.textContent)) {
            projectManager.currentProject = e.target.textContent;
        } else {
            projectManager.currentProject = "";
        }
        e.target.classList.add("current-project");
        filterTasks(projectManager.currentProject);
    }

    function addProject(project) {
        let proj = document.createElement("li");
        proj.className = "project";
        proj.textContent = project;
        proj.addEventListener("click", setCurrentProject)
        projectList.appendChild(proj);
    }

    function addTask(task) {
        let div = document.createElement("div");
        div.id = task.id;
        div.className = "task";
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = false;
        checkbox.className = "checkbox";
        let title = document.createElement("span");
        title.className = "task-title";
        title.textContent = task.title;
        let actions = document.createElement("span");
        actions.className = "actions";
        actions.innerHTML = "<button id='edit-btn'><i class='fas fa-edit'></i></button><button id='del-btn'><i class='fas fa-trash-alt'></i></button>";
        actions.lastChild.addEventListener("click", function(e){
            let taskNode = e.target.parentNode.parentNode;
            taskManager.deleteTask(taskNode.id);
            removeTask(taskNode);
            updateTaskId();
        })
        div.append(checkbox,title,actions);
        taskList.appendChild(div);
    }

    function removeTask(node) {
        taskList.removeChild(node);
    }

    function updateTaskId() {
        let tasks = Array.from(taskList.childNodes);
        tasks.shift(); // remove empty node
        for (var i = 0; i < tasks.length; i++){
            tasks[i].id = `${i}`;
        }
    }

    newProjectBtn.addEventListener("click", () => {
        let project = prompt("Project name");
        projectManager.createProject(project);
        addProject(project);
    })
    
    newTaskBtn.addEventListener("click", () => {
        let task = taskManager.createTask(projectManager.currentProject,`draw hoshua sex ${taskManager.tasks.length}`,"","",false);
        addTask(task);
        console.log(taskManager.tasks);
    })

    allTasks.addEventListener("click", setCurrentProject);

    return { addProject, addTask };
})();

projectManager.loadProjects();
taskManager.loadTasks();
console.log(taskManager.tasks);