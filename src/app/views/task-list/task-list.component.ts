import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {TaskEntity} from '../../services/tasks/model/taskEntity';

import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskControllerService } from 'src/app/services/tasks';


@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {

  @ViewChild('dialog', {static: false})
  public dialog: TemplateRef<any>;
  taskStatusOpts = [
    {
      value: 'En progreso',
      label: 'In progress'
    },
    {
      value: 'Pendiente',
      label: 'Pending'
    },
    {
      value: 'Completada',
      label: 'Finished'
    }
  ];

  tasks: TaskEntity[];

  newTaskData = {
    show: false,
    control: new FormControl(''),
    controlname: new FormControl('')
  };

  deleteTaskData = {
    index: null,
    dialog: null
  };

  constructor(private matDialog: MatDialog, private _snackBar: MatSnackBar, private taskService: TaskControllerService) {}

  ngOnInit(): void {
    this.getTasks();
  }

  public getTasks() {
    this.tasks = [];
    this.taskService.listTasks().subscribe(data => {
      for (const d of (data as any)) {
        this.tasks.push({
          id: d.id,
          name: d.name,
          description: d.description,
          state: d.state
        });
      }
      console.log("getTasks()");
      console.log(this.tasks);
    });
  }

  public newTask() {
    this.newTaskData.show = true;
    this.newTaskData.control.setValue('');
  }

  public createTask() {
    const newTask = {
      state: 'Pendiente',
      name: this.newTaskData.controlname.value,
      description: this.newTaskData.control.value,
    }
    console.log('Creating task', newTask);
    this.taskService.addTask(newTask).subscribe((res) => { this.getTasks()});
    this.newTaskData.show = false;
    this.openSnackBar('Task created successfully', '');
  }

  public cancelNewTask() {
    this.newTaskData.show = false;
    this.newTaskData.control.setValue('');
  }

  public updateTask(idx) {
    const taskToUpdate = this.tasks[idx];
    if (taskToUpdate) {
      console.log('Updating task', taskToUpdate);
      this.taskService.updateTask(taskToUpdate.id, taskToUpdate).subscribe((res) => {console.log(res)});
      this.openSnackBar('Task with id ' + taskToUpdate.id + ' updated successfully','');
    }
  }

  public deleteTask(idx) {
    this.deleteTaskData.index = idx;
    this.deleteTaskData.dialog = this.matDialog.open(this.dialog);
  }

  public deleteConfirm() {
    const taskToDelete = this.tasks[this.deleteTaskData.index];
    if (taskToDelete) {
      console.log('Deleting task', taskToDelete);
      this.taskService.deleteTask(taskToDelete.id).subscribe((res) => { this.getTasks()});
      this.openSnackBar('Task with id ' + taskToDelete.id + ' removed successfully','');
    }
    this.deleteTaskData.dialog.close();
    this.deleteTaskData.index = null;
    this.deleteTaskData.dialog = null;
    this.getTasks();
  }

  public deleteCancel() {
    this.deleteTaskData.dialog.close();
    this.deleteTaskData.index = null;
    this.deleteTaskData.dialog = null;
  }

  public showFinished(){
    this.tasks = [];
    this.taskService.completedTasks().subscribe(data => {
      for (const d of (data as any)) {
        this.tasks.push({
          id: d.id,
          name: d.name,
          description: d.description,
          state: d.state
        });
      }
      console.log("getCompletedTasks()");
      console.log(this.tasks);
    });
  }

  public openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

}
