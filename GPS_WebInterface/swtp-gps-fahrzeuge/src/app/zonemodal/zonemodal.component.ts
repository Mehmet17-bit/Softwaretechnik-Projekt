import {Component, ElementRef, ViewChild} from '@angular/core';
import {DataService} from "../data.service";
import {MatDialogRef} from "@angular/material/dialog";
import {Zone} from "../models/Zone";
import {Alert} from "../models/Alert";
import {AlertType} from "../models/AlertType";

@Component({
  selector: 'app-zonemodal',
  templateUrl: './zonemodal.component.html',
  styleUrls: ['./zonemodal.component.css']
})
export class ZonemodalComponent {

  @ViewChild('name') nameField:ElementRef;
  @ViewChild('latitude') latField:ElementRef;
  @ViewChild('longitude') lngField:ElementRef;
  @ViewChild('radius') radField:ElementRef;
  edit: boolean;
  toBeUpdated: Zone | undefined;


  constructor(public dataService: DataService, private dialogRef: MatDialogRef<any>) { }

  add(name: string, latitude: number, longitude: number, radius: number){
    if(name != ""){
      this.dataService.onZoneCreateEvent(new Zone(name, latitude, longitude, radius));
      this.nameField.nativeElement.value = "";
      this.latField.nativeElement.value = "";
      this.lngField.nativeElement.value = "";
      this.radField.nativeElement.value = "";
    } else {
      this.dataService.alertAdmin(new Alert('Unable to add zone!', 3, AlertType.WARNING));
    }
  }

  update(name: string, latitude: number, longitude: number, radius: number){
    if(name != "" && this.edit && this.dataService.zones.some(z => z.name === this.toBeUpdated!.name)){
      console.log("updated zone" + name);
      this.dataService.onZoneEditEvent(new Zone(this.toBeUpdated!.name, latitude, longitude, radius));
      this.nameField.nativeElement.value = "";
      this.latField.nativeElement.value = "";
      this.lngField.nativeElement.value = "";
      this.radField.nativeElement.value = "";
      this.edit = false;
      this.toBeUpdated = undefined;
    } else {
      this.dataService.alertAdmin(new Alert('Unable to update zone!', 3, AlertType.WARNING));
    }
  }

  toggleEdit(name: string){
    this.toBeUpdated = this.dataService.zones.find(s => s.name = name);
    if(this.toBeUpdated != undefined){
      this.edit = true;
      this.nameField.nativeElement.value = this.toBeUpdated.name;
      this.latField.nativeElement.value = this.toBeUpdated.latitude;
      this.lngField.nativeElement.value = this.toBeUpdated.longitude;
      this.radField.nativeElement.value = this.toBeUpdated.radius;
    }
  }

  delete(name: string){
    this.dataService.onZoneDeleteEvent(name);
  }

  show(name: string){
    this.dataService.onZoneShowEvent(name);
    this.dialogRef.close();
  }

}
