import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LoginFormComponent } from './login-form/login-form.component';
import { MapComponent } from './map/map.component';
import { HttpClientModule } from '@angular/common/http';
import {FormsModule} from "@angular/forms";
import { AppRoutingModule } from './app-routing.module';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import {MatBadgeModule} from '@angular/material/badge';
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatDialogModule} from "@angular/material/dialog";
import { ZonemodalComponent } from './zonemodal/zonemodal.component';
import {MatTableModule} from "@angular/material/table";
import { ImprintComponent } from './imprint/imprint.component';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";
import { UsermodalComponent } from './usermodal/usermodal.component';
import {MatSnackBarModule} from "@angular/material/snack-bar";
import { AlertComponent } from './alert/alert.component';
import { LogbookComponent } from './logbook/logbook.component';

const routes: Routes = [
  { path: '', component: LoginFormComponent },
  { path: 'panel', component: MapComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginFormComponent,
    MapComponent,
    ZonemodalComponent,
    ImprintComponent,
    UsermodalComponent,
    AlertComponent,
    LogbookComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    FormsModule,
    HttpClientModule,
    FormsModule,
    RouterModule,
    AppRoutingModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
    MatBadgeModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})


export class AppModule {

}
