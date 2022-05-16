import {Component, OnInit} from '@angular/core';
import {DataService} from "../data.service";
import {}  from "googlemaps";
import {interval, Subscription} from 'rxjs';
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {ZonemodalComponent} from "../zonemodal/zonemodal.component";
import {Zone} from "../models/Zone";
import {DataSet} from "../models/DataSet";
import {UsermodalComponent} from "../usermodal/usermodal.component";
import {Alert} from "../models/Alert";
import {AlertType} from "../models/AlertType";
import Marker = google.maps.Marker;
import LatLng = google.maps.LatLng;
import Polyline = google.maps.Polyline;
import Circle = google.maps.Circle;
import MapTypeId = google.maps.MapTypeId;
import MapOptions = google.maps.MapOptions;
import LatLngLiteral = google.maps.LatLngLiteral;
import {LogbookComponent} from "../logbook/logbook.component";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent implements OnInit{

  //frontend
  focused : number = 0
  routeDrawn: boolean;
  follow: boolean = true;
  route: boolean;
  avgVelocity: number = 0;
  totalDistance: number = 0;
  notifyOnMove: boolean = false;
  notifyOnInactivity: boolean = true;
  notifyOnZoneLeave: boolean = true;
  notInZone: Set<number> = new Set<number>();


  //backend
  subscription: Subscription;
  markersArray : Map<Number, Marker> = new Map<Number, Marker>();
  routeArray : Map<Number, Polyline> = new Map<Number, Polyline>();
  moveSet: Set<Number> = new Set<Number>();
  map: google.maps.Map;
  center: LatLngLiteral = {
    lat: 50.587039105795235,
    lng: 8.682371511691501
  };
  options: MapOptions = {
    mapTypeId: MapTypeId.ROADMAP,
    disableDefaultUI: true,
    disableDoubleClickZoom: true,
    zoom: 17
  };

  zones: Map<string, Circle> = new Map<string, Circle>();

  constructor(public dataService: DataService, private router: Router, private dialog: MatDialog) {

    this.dataService.refreshData();
    const source = interval(1000);
    this.subscription = source.subscribe(val => this.loop());

    dataService.locationUpdateObservable$.subscribe(
      id => {
        this.dataService.refreshData().then(res => {
          this.dataService.getLocations().then(datasets => {
            this.displayNewData(id, datasets);
          });
        });


      });

    dataService.zoneShowObservable$.subscribe(
      zone => {
        this.focusOnZone(zone);
      });

    dataService.zoneDeleteObservable$.subscribe(
      zone => {
        this.dataService.getZones().then(done => {
          this.removeZone(zone);
        });
      });

    dataService.zoneUpdateObservable$.subscribe(
      res => {
        this.dataService.getZones().then(zones => {
          if(this.zones.size > 0){
            this.zones.forEach((value, key) => this.removeZone(key));
          }
          this.showZones(zones);
        });
      });

    dataService.userShowObservable$.subscribe(uid => {
        this.focus(uid, this.dataService.getDataSetbyID(uid).latitude, this.dataService.getDataSetbyID(uid).longitude);
      });

    dataService.userUpdateObservable$.subscribe(uid => {
      this.dataService.getUsers().then(nxt => {
        this.checkIfInZone(uid);
      })
    });
  }

  public loop(){
    if(this.dataService.getAuthkey() == null || this.dataService.getLoginStatus() == false){
      this.router.navigate(['']);
      this.dataService.setLoginStatus(false);
      this.dataService.alertAdmin(new Alert('Your session expired', 10, AlertType.WARNING));
      this.subscription.unsubscribe();
    } else {
      this.dataService.refreshData();
    }
  }



  ngOnInit(): void {

    if(!this.dataService.getLoginStatus()){
      this.router.navigate(['']);
    }

    this.initMap();
  }

  initMap(){
    this.map = new google.maps.Map(document.getElementById('map-display') as HTMLElement, {
      ...this.options,
      center: this.center
    });


    if(localStorage.getItem('focused') != null && localStorage.getItem('focused') != '0'){
      this.focus(JSON.parse(<string>localStorage.getItem('focused')), JSON.parse(<string>localStorage.getItem('focuslat')), JSON.parse(<string>localStorage.getItem('focuslng')))
    }
  }

  async displayNewData(id: number, data: DataSet[]) {

    this.moveSet.clear();
    if(this.markersArray.has(id)){
      this.markersArray.get(id)!.setMap(null);
    }

    const dataset = this.dataService.getDataSetbyID(id);
    this.drawNewMarker(dataset!.id, dataset!.latitude, dataset!.longitude);
    this.moveSet.add(id);
  }

  async drawRoute(id : number){
    if(this.routeDrawn) {
      this.routeArray.get(id)!.setMap(null);
      this.routeDrawn = false;
      this.routeArray.delete(id);
    } else {
      this.routeDrawn = true;
      this.dataService.getPath(id).then(result => {
        var line = new google.maps.Polyline({
          path: result,
          strokeOpacity: 1,
          map: this.map
        });
        this.routeArray.set(id, line);
      });
      this.map.setCenter(new LatLng({
        lat: this.markersArray.get(id)!.getPosition()!.lat(), lng: this.markersArray.get(id)!.getPosition()!.lng(),
      }));
      this.map.setZoom(14);
    }
  }

  focus(id: number, lat: number, long: number) {
      if(this.focused != id){
        this.follow = true;
        if(this.routeDrawn){
          for(let poly of this.routeArray.values()){
            poly.setMap(null);
          }
          this.routeArray.clear();
          this.routeDrawn = false;
        }
      }
    this.map.setCenter(new LatLng({
      lat: lat, lng: long,
    }));
    this.map.setZoom(18);
    this.focused = id;


    localStorage.setItem('focused', id+'');
    localStorage.setItem('focuslat', lat+'');
    localStorage.setItem('focuslng', long+'');

    this.dataService.getHistory(id).then(withTime => {
      this.dataService.getPath(id).then(latLng => {
        this.totalDistance = 0;
        for(let i = 0; i < latLng.length-1; i++){
          this.totalDistance += google.maps.geometry.spherical.computeDistanceBetween(latLng[i], latLng[i+1]) / 1000;
        }
        this.avgVelocity = this.totalDistance / ((withTime[0].timestamp.getTime() - withTime[withTime.length-1].timestamp.getTime()) * 0.00000027777777777778 * (-1))
      })
    })
  }

  drawNewMarker(id: number, latitude: number, longitude: number) {
    let marker = new google.maps.Marker({
      position: {
        lat: latitude,
        lng: longitude
      },
      icon: {
        url: './assets/animated_pin.svg',
        anchor: new google.maps.Point(35, 10),
        scaledSize: new google.maps.Size(60, 60),
        labelOrigin: new google.maps.Point(30, 60)
      },
      label: {
        text: "Vehicle " + id,
        color: "#c44343",
        fontWeight: "bold"
      },
      map: this.map
    });

    marker.addListener("click", () => {
      this.focus(id, latitude, longitude);
    });


    if(this.notifyOnMove){
      this.dataService.alertAdmin(new Alert('Vehicle '+id+' moved!', 2, AlertType.CHANGE));
    }

    this.markersArray.set(id, marker);
    if(this.follow){
      if (id == this.focused) {
        this.focus(id, latitude, longitude);
      }
    }

    if (this.routeArray.has(id) && this.routeDrawn) {
      this.drawRoute(id); //undraw and remove old route
      this.drawRoute(id); //draw new route to new position
    }

    this.checkIfInZone(id);
  }

  showZones(zones: Zone[]){
    for(let zone of zones){
      this.addZone(zone);
    }
  }
  resetView() {
    this.dataService.resetHistory(this.focused);
    this.dataService.onUserUpdateEvent(this.focused);
    this.focus(0, this.center.lat, this.center.lng);
  }

  addZone(zone: Zone){
    const zoneCircle = new google.maps.Circle({
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillOpacity: 0.0,
      map: this.map,
      center: new LatLng(zone.latitude, zone.longitude),
      radius: zone.radius * 1000
    });

    this.zones.set(zone.name, zoneCircle);
  }

  focusOnZone(zonename: string){
    this.dialog.closeAll();
    this.map.setCenter(this.zones.get(zonename)!.getCenter());
    this.map.setZoom(10);
  }

  removeZone(zonename: string){
    this.zones.get(zonename)!.setMap(null);
    this.zones.delete(zonename);
  }

  isInZone(id: number) : boolean {
    const zonename = this.dataService.getUserbyID(id).zone;
    const marker = this.markersArray.get(id)!;

    if(zonename != null){
      var circle = this.zones.get(zonename)!;

      //line taken from https://stackoverflow.com/a/8775194/16395132 (Detect if marker is within circle overlay on Google Maps) last accessed: 27.12.2021
      // @ts-ignore
      return circle.getBounds().contains(marker.getPosition()) && google.maps.geometry.spherical.computeDistanceBetween(circle.getCenter(), <LatLng>marker.getPosition()) <= circle.getRadius();

    } else {
      return true;
    }
  }

  checkIfInZone(id: number){
    if(this.notifyOnZoneLeave){
      if(this.isInZone(id)) {
        this.notInZone.delete(id);
        return true;
      } else {
        this.dataService.alertAdmin(new Alert('Vehicle '+id+' moving outside zone!', 10, AlertType.WARNING));
        this.notInZone.add(id);
        return false;
      }
    } else {
      return false;
    }
  }

  openZoneModal(){
    this.dialog.open(ZonemodalComponent);
  }

  openUserModal(){
    this.dialog.open(UsermodalComponent);
  }

  openLogBookModal() {
    this.dataService.getHistory(this.focused).then(res => {
      this.dialog.open(LogbookComponent);
    })
  }
}
