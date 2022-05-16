import {Component, ElementRef, ViewChild} from '@angular/core';
import {DataService} from "../data.service";
import {MatDialogRef} from "@angular/material/dialog";
import {MatSelect} from "@angular/material/select";
import {User} from "../models/User";
import {Alert} from "../models/Alert";
import {AlertType} from "../models/AlertType";

@Component({
  selector: 'app-usermodal',
  templateUrl: './usermodal.component.html',
  styleUrls: ['./usermodal.component.css']
})
export class UsermodalComponent {

  @ViewChild('imei') imeiField: ElementRef;
  @ViewChild('name') nameField: ElementRef;
  @ViewChild('zone') zoneSelect: MatSelect;
  edit: boolean = false;
  old: User;

  constructor(public dataService: DataService, private dialogRef: MatDialogRef<any>) { }

  add(){
    if(this.imeiField.nativeElement.value != '' && this.nameField.nativeElement.value != ""){
      this.dataService.createUser(this.imeiField.nativeElement.valueAsNumber, this.nameField.nativeElement.value, this.zoneSelect.value);
      this.nameField.nativeElement.value = "";
      this.imeiField.nativeElement.value = "";
      this.zoneSelect.value = "";
    } else {
      this.dataService.alertAdmin(new Alert('Unable to add user!', 3, AlertType.WARNING));
    }

  }

  toggleEdit(id: number){
    this.old = this.dataService.getUserbyID(id);
    if(this.old != undefined){
      this.edit = true;
      this.nameField.nativeElement.value = this.old.name;
      this.imeiField.nativeElement.value = this.old.imei;
      this.zoneSelect.value = this.old.zone;
    }
  }

  update(id: number){
    if(this.imeiField.nativeElement.valueAsNumber != 0 && this.nameField.nativeElement.value != ""){
      this.dataService.updateUser(this.old, this.imeiField.nativeElement.valueAsNumber, this.nameField.nativeElement.value, this.zoneSelect.value);
      this.nameField.nativeElement.value = "";
      this.imeiField.nativeElement.value = "";
      this.zoneSelect.value = "";
      this.edit = false;
      this.dataService.onUserUpdateEvent(id);
    } else {
      this.dataService.alertAdmin(new Alert('Unable to update user!', 3, AlertType.WARNING));
    }
  }

  delete(id: number){
    this.dataService.deleteUser(id);
  }

  show(id: number){
    this.dialogRef.close();
    this.dataService.onUserShowEvent(id);
  }

}
