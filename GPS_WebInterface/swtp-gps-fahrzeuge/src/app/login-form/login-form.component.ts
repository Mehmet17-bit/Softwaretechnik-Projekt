import {Component, OnInit} from '@angular/core';
import {DataService} from "../data.service";
import {Router} from "@angular/router";
import {Alert} from "../models/Alert";
import {AlertType} from "../models/AlertType";

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {

  username: string;
  password: string;
  invalid: boolean;
  offline: boolean;

  constructor(public dataService: DataService, private router: Router) { }

  ngOnInit(): void {
    if(this.dataService.getLoginStatus()){
      this.router.navigate(['panel']);
      this.dataService.refreshData();
    }
  }

  login(){
    this.invalid = false;
    this.offline = false;

    this.dataService.auth(this.username, this.password).then(result => {
      if(result){
        this.router.navigate(['panel']);
        this.dataService.setLoginStatus(true);
        localStorage.setItem('loggedIn', 'true');
        this.dataService.alertAdmin(new Alert('Sucessfully logged in!', 3, AlertType.SUCCESS));
      } else {
        if(this.dataService.offline){
          this.offline = true;
          this.dataService.alertAdmin(new Alert('Could not login, as the database is unreachable!', 10, AlertType.WARNING));
        } else {
          this.invalid = true;
          this.dataService.alertAdmin(new Alert('Invalid credentials! Please check your login data and try again.', 8, AlertType.WARNING));
        }
      }
    });

  }

}
