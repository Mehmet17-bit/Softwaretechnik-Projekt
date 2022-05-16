import {Component, OnInit} from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";
import {Alert} from "../models/Alert";
import {DataService} from "../data.service";
import {AlertType} from "../models/AlertType";

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {

  constructor(private dataService: DataService, private alertbox: MatSnackBar) {
    this.dataService.alertTriggeredObservable$.subscribe(
      alert => {
        this.open(alert);
      });
  }

  ngOnInit(): void {
  }

  open(alert: Alert){
    if(alert.type == AlertType.WARNING){
      this.alertbox.open(alert.message, 'x', {
        duration: alert.duration * 1000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
        panelClass: ['mat-toolbar', 'mat-warn']
      });
    } else if(alert.type == AlertType.SUCCESS){
      this.alertbox.open(alert.message, 'x', {
        duration: alert.duration * 1000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
        panelClass: ['mat-toolbar', 'mat-primary']
      });
    } else {
      this.alertbox.open(alert.message, 'x', {
        duration: alert.duration * 1000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom'
      });
    }

  }
}
