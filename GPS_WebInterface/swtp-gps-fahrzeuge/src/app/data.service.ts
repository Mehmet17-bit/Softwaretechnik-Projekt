import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {DataSet} from "./models/DataSet";
import {Router} from "@angular/router";
import {User} from "./models/User";
import {Zone} from "./models/Zone";
import {Subject} from "rxjs";
import {Alert} from "./models/Alert";
import {AlertType} from "./models/AlertType";
import LatLng = google.maps.LatLng;

@Injectable({
  providedIn: 'root'
})
export class DataService {


  //httpclient for http request to api, router for routing back to login page, if user is not authenticated
  constructor(public http : HttpClient, private router: Router) {}

  //global variables
  currentLocations: DataSet[] = [];
  history: DataSet[] = [];
  users : User[] = [];
  moved: number[] = [];
  zones: Zone[] = [];
  offline: boolean;

  // Event handlers for own implemented watcher pattern
  //once an action is called it is transmitted through the dataservice as communication layer and then the listeners will execute the changes
  private alertAction = new Subject<Alert>();
  alertTriggeredObservable$ = this.alertAction.asObservable();

  private locationUpdate = new Subject<number>();
  locationUpdateObservable$ = this.locationUpdate.asObservable();

  private zoneUpdate = new Subject<Zone[]>();
  zoneUpdateObservable$ = this.zoneUpdate.asObservable();

  private zoneShow = new Subject<string>();
  zoneShowObservable$ = this.zoneShow.asObservable();

  private zoneDelete = new Subject<string>();
  zoneDeleteObservable$ = this.zoneDelete.asObservable();

  private userUpdate = new Subject<number>();
  userUpdateObservable$ = this.userUpdate.asObservable();

  private userShow = new Subject<number>();
  userShowObservable$ = this.userShow.asObservable();

  alertAdmin(alert: Alert) {
    this.alertAction.next(alert);
  }

  onLocationUpdateEvent(id: number) {
    this.locationUpdate.next(id);
    console.log('location update fired for id ', id);
    this.getUsers();
  }

  onZoneUpdateEvent() {
    this.zoneUpdate.next(this.zones);
  }

  onZoneEditEvent(zone: Zone) {
    this.addZone(zone)
    this.onZoneUpdateEvent();
  }

  onZoneCreateEvent(zone: Zone){
    this.addZone(zone);
    this.onZoneUpdateEvent();
  }
  onZoneShowEvent(zone: string) {
    this.zoneShow.next(zone);
  }
  onZoneDeleteEvent(zone: string) {
    this.removeZone(zone);
    this.zoneDelete.next(zone);
    this.onZoneUpdateEvent();
  }

  onUserShowEvent(id: number){
    this.userShow.next(id);
  }

  onUserUpdateEvent(id: number){
    this.userUpdate.next(id);
    this.users.splice(this.users.findIndex(u => u.id === id), 1);
    this.users = [];
    this.getUsers().then(res => this.users = res);
  }

  getLoginStatus() : boolean {
    return JSON.parse(localStorage.getItem('loggedIn')!);
  }

  setLoginStatus(value: boolean) {
    localStorage.setItem('loggedIn', String(value));
  }

  getAuthkey(): string {
    return localStorage.getItem('token')!;
  }

  setAuthkey(value: string) {
    localStorage.setItem('token', value);
  }

  public logout(){
    if(this.getLoginStatus()){
      this.router.navigate(['']);
      this.setLoginStatus(false);
      localStorage.removeItem('token')
      this.alertAdmin(new Alert('Successfully logged out!', 3, AlertType.SUCCESS));
    }
  }

  public auth(form_input_username : string, form_input_password: string): Promise<boolean> {
    const headers = new HttpHeaders({'username':`${form_input_username}`, 'password': `${form_input_password}`, observe: 'response'});
    return new Promise<boolean>(resolve => {
      this.http.get<any>('http://seg-swtp-ubuntu.mni.thm.de:4001/auth', {headers}).subscribe(response => {
        localStorage.setItem('token', response.token+'')
        this.setAuthkey(JSON.parse(localStorage.getItem('token')!));
        resolve(true);
        this.offline = false;
      }, error => {
        if (error.status === 0) this.offline = true;
        resolve(false);
      });
    });
  }

  public refreshData() : Promise<any>{
    return new Promise<any>(resolve => {
      this.getLocations().then(nxt => {
        this.getUsers().then(res => {
          this.getZones().then(next => {
            resolve(true);
          });
        });
      });
    });
  }


  //get current location of each vehicle
  public getLocations() : Promise<DataSet[]> {
    const headers = {'token': this.getAuthkey()};
    return new Promise<DataSet[]>(resolve => {
      this.http.get<any>('http://seg-swtp-ubuntu.mni.thm.de:4001/current', { headers }).subscribe(data => {
        for(let dataset of data){
          const next = new DataSet(dataset.id, parseFloat(dataset.latitude), parseFloat(dataset.longitude), this.formatDate(dataset.timestamp));
          if(this.currentLocations.filter(n => n.id === dataset.id).length > 0){
            var old = this.currentLocations[this.currentLocations.findIndex(n => n.id === dataset.id)];
            if(JSON.stringify(next) != JSON.stringify(old)) {
              this.onLocationUpdateEvent(dataset.id);
            }

            this.currentLocations.splice(0, 1);

          } else {
            this.onLocationUpdateEvent(dataset.id);
          }
          this.currentLocations.push(next);
        }

        if(this.zones.length == 0){
          this.getZones();
        }

        if(this.users.length == 0){
          this.getUsers();
        }
        this.offline = false;
        resolve(this.currentLocations);
      }, error => {
        if(error.status === 0) this.offline = true;
      });
    });
  }

  public getPath(id: number): Promise<LatLng[]> {
    return new Promise<LatLng[]>(resolve => {
      const headers = {'token': this.getAuthkey()};
      let history: LatLng[] = [];
      this.http.get<any>('http://seg-swtp-ubuntu.mni.thm.de:4001/history/'+id, {headers}).subscribe(data => {
        for (let dataset of data) {
          history.push(new google.maps.LatLng(parseFloat(dataset.latitude), parseFloat(dataset.longitude)));
        }
        resolve(history);
      });
    });

  }

  public getHistory(id: number): Promise<DataSet[]> {
    this.history = [];
    return new Promise<DataSet[]>(resolve => {
      const headers = {'token': this.getAuthkey()};
      this.http.get<any>('http://seg-swtp-ubuntu.mni.thm.de:4001/history/'+id, {headers}).subscribe(data => {
        for (let dataset of data) {
          this.history.push(new DataSet(dataset.id, parseFloat(dataset.latitude), parseFloat(dataset.longitude), this.formatDate(dataset.timestamp)));
        }
        resolve(this.history);
      });
    });

  }

  public resetHistory(id: number) {
    const headers = {'token': this.getAuthkey()};
    this.http.delete<any>('http://seg-swtp-ubuntu.mni.thm.de:4001/reset/'+id, {headers}).subscribe(res => {
    });
  }

  public getUsers(): Promise<User[]> {
    return new Promise<User[]>(resolve => {
      const headers = {'token': this.getAuthkey()};
      this.http.get<any>('http://seg-swtp-ubuntu.mni.thm.de:4001/users/', {headers}).subscribe(data => {
        for (let user of data) {
          if(!this.users.some(s => s.name == user.name && s.imei == user.imei && s.id == user.id && s.zone == user.zone)){
            this.users.push(new User(user.id, user.imei, user.name, user.datasets, user.zone));
          }
        }
        this.users = this.users.sort((u1, u2) => u1.id - u2.id);
        resolve(this.users);
      });
    });
  }

  public createUser(imei: number, name: string, zone: string){
    const headers = {'token': this.getAuthkey(), 'Content-Type': 'application/json'};
    this.http.post<any>('http://seg-swtp-ubuntu.mni.thm.de:4001/register/',
      {
        "imei": imei+"",
        "name": name+""
      }, {headers}).subscribe(end => {
      this.alertAdmin(new Alert('Successfully created vehicle!', 3, AlertType.CHANGE));
        this.getUsers().then(res => {
          var user = res.find(u => u.imei == imei && u.name == name)!;
          this.updateUser(user, user.imei, user.name, zone);
          this.getUsers().then(res => this.users = res);
        })
    });
  }

  public updateUser(user: User, imei: number, name: string, zone: string){
    const headers = {'token': this.getAuthkey(), 'Content-Type': 'application/json'};
    this.http.put<any>('http://seg-swtp-ubuntu.mni.thm.de:4001/users/'+user.id,
      {
        "imei": imei+"",
        "name": name+"",
        "zone": zone+""
      }, {headers}).subscribe(end => {
        this.users.splice(this.users.findIndex(u => u.id == user.id), 1);
        this.getUsers().then(res => this.users = res);
        this.alertAdmin(new Alert('Successfully updated vehicle!', 3, AlertType.CHANGE));
    });
  }

  public deleteUser(id: number) {
    const headers = {'token': this.getAuthkey()};
    this.http.delete<any>('http://seg-swtp-ubuntu.mni.thm.de:4001/users/'+id, {headers}).subscribe(res => {
      this.users.splice(this.users.findIndex(u => u.id == id), 1);
      this.getUsers();
      this.alertAdmin(new Alert('Successfully deleted vehicle!', 3, AlertType.CHANGE));
    });
  }




  public getDataSetbyID(id: number) : DataSet {
    return <DataSet>this.currentLocations.find(dataset => dataset.id === id);
  }

  public getUserbyID(id: number) : User {
    return <User>this.users.find(user => user.id === id);
  }


  public getZones() : Promise<Zone[]> {
    return new Promise<Zone[]>(resolve => {
      const headers = {'token': this.getAuthkey()};
      this.http.get<any>('http://seg-swtp-ubuntu.mni.thm.de:4001/zones/', {headers}).subscribe(data => {
        for(let zone of data){
          if(!this.zones.some(s => s.name == zone.name && s.latitude == zone.latitude && s.longitude == zone.longitude && s.radius == zone.radius)){
            this.zones.push(new Zone(zone.name, zone.latitude, zone.longitude, zone.radius));
            this.onZoneUpdateEvent();
          }
        }
        resolve(this.zones);
      });
    });
  }

  public addZone(zone: Zone){
    const headers = {'token': this.getAuthkey(), 'Content-Type': 'application/json'}
    var exists = false;
    if(this.zones.some(z => z.name === zone.name)){
      exists = true;
    }
    this.http.post<any>('http://seg-swtp-ubuntu.mni.thm.de:4001/zone/',
      {
        "name": zone.name+"",
        "latitude": zone.latitude+"",
        "longitude": zone.longitude+"",
        "radius": zone.radius+""
      }, {headers}).subscribe(end => {
      this.zones = [];
      this.getZones();
      if(exists){
        this.alertAdmin(new Alert('Successfully updated zone!', 3, AlertType.CHANGE));
      } else {
        this.alertAdmin(new Alert('Successfully added zone!', 3, AlertType.CHANGE));
      }
    });
  }

  public removeZone(value: string){
    const headers = {'token': this.getAuthkey(), 'name': value};
    this.http.delete<any>('http://seg-swtp-ubuntu.mni.thm.de:4001/zone/', {headers}).subscribe(res => {
      this.zones = [];
      this.getZones();
      this.alertAdmin(new Alert('Successfully removed zone!', 3, AlertType.CHANGE));
    });
  }

  formatDate(timestamp: Date): Date{ //needs to be done due to the fact that typescript cant convert timestamp from mysql table directly into a valid object
    const whole = timestamp.toString().split('T', 2);
    const date = whole[0].split('-', 3);
    const time = whole[1].split(':', 3);
    const last = time[2].split('.', 2)[0];
    return new Date(parseInt(date[0]), parseInt(date[1])-1, parseInt(date[2]), parseInt(time[0]), parseInt(time[1]), parseInt(last), 0);
  }
}
