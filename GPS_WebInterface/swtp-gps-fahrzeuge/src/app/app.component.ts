import {Component} from '@angular/core';
import {DataService} from "./data.service";
import {MatDialog} from "@angular/material/dialog";
import {ImprintComponent} from "./imprint/imprint.component";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{

  title = 'webinterface';
  constructor(public dataservice: DataService, private dialog: MatDialog) {
  }

  openImprint() {
    this.dialog.open(ImprintComponent)
  }
}
