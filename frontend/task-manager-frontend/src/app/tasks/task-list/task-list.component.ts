import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {

  tasks: Task[] = [];
  formTask: Task = { title: '', description: '', done: false };
  editingTaskId: number | null = null;
  errorMessage = '';

  constructor(
    private taskService: TaskService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.sortTasks();
      },
      error: () => {
        this.errorMessage = 'Erro ao carregar tarefas.';
      }
    });
  }

  startCreate(): void {
    this.editingTaskId = null;
    this.formTask = { title: '', description: '', done: false };
  }

  startEdit(task: Task): void {
    this.editingTaskId = task.id ?? null;
    this.formTask = { 
      id: task.id, 
      title: task.title, 
      description: task.description || '', 
      done: task.done 
    };
  }

  submitForm(): void {
    if (!this.formTask.title.trim()) {
      this.errorMessage = 'O título é obrigatório.';
      return;
    }

    if (this.editingTaskId === null) {
      this.taskService.createTask(this.formTask).subscribe({
        next: () => {
          this.startCreate();
          this.loadTasks();
        },
        error: () => this.errorMessage = 'Erro ao criar tarefa.'
      });
    } else {
      this.taskService.updateTask(this.editingTaskId, this.formTask).subscribe({
        next: () => {
          this.startCreate();
          this.loadTasks();
        },
        error: () => this.errorMessage = 'Erro ao atualizar tarefa.'
      });
    }
  }

  deleteTask(id: number | undefined): void {
    if (!id) return;

    this.taskService.deleteTask(id).subscribe({
      next: () => this.loadTasks(),
      error: () => this.errorMessage = 'Erro ao apagar tarefa.'
    });
  }

  toggleDone(task: Task): void {
    if (!task.id) return;

    const updated = { ...task, done: !task.done };

    this.taskService.updateTask(task.id, updated).subscribe({
      next: () => this.loadTasks(),
      error: () => this.errorMessage = 'Erro ao atualizar estado.'
    });
  }

  private sortTasks(): void {
    this.tasks = [...this.tasks].sort((a, b) => {
      if (a.done === b.done) {
        return (a.id ?? 0) - (b.id ?? 0);
      }
      return a.done ? 1 : -1;  
    });
  }

  onLogout(): void {
    this.authService.logout();
  }
}