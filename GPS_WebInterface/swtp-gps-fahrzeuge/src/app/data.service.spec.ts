import {inject, TestBed} from '@angular/core/testing';

import {DataService} from './data.service';
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {Zone} from "./models/Zone";
import {Alert} from "./models/Alert";
import {AlertType} from "./models/AlertType";
import anything = jasmine.anything;

describe('DataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataService],
      imports: [HttpClientTestingModule, RouterTestingModule]
    });
  });

  it('should get latest locations',inject([HttpTestingController, DataService],
    (httpMock: HttpTestingController, backend: DataService) => {

      backend.getLocations().then((event) => {
        expect(event).toBeDefined();
        for(let dataset of event){
          expect(dataset).toBeDefined();
        }
      });
    }));

  it('should get all users',inject([HttpTestingController, DataService],
    (httpMock: HttpTestingController, backend: DataService) => {

      backend.createUser(9999, "test", "");
      backend.getUsers().then((event) => {
        expect(event).toBeDefined();
        for(let user of event){
          expect(user).toBeDefined();
        }

        expect(event).toHaveSize(1);
      });
    }));


  it('should get all zones',inject([HttpTestingController, DataService],
    (httpMock: HttpTestingController, backend: DataService) => {

      backend.addZone(new Zone("Test", 1, 1, 1));
      backend.getZones().then((event) => {
        expect(event).toBeDefined();
        for(let zone of event){
          expect(zone).toBeDefined();
        }

        expect(event).toHaveSize(1);

      });
    }));

  it('should put alert event',inject([HttpTestingController, DataService],
    (httpMock: HttpTestingController, backend: DataService) => {

      backend.alertAdmin(new Alert("test", 3, AlertType.WARNING));
      expect(backend.alertTriggeredObservable$).toBeDefined();
    }));


  it('should login',inject([HttpTestingController, DataService],
    (httpMock: HttpTestingController, backend: DataService) => {

      backend.setLoginStatus(true);
      expect(backend.getLoginStatus).toBeTruthy();
    }));

  it('should logout',inject([HttpTestingController, DataService],
    (httpMock: HttpTestingController, backend: DataService) => {
      backend.setLoginStatus(true);
      backend.logout();
      expect(backend.getLoginStatus()).toBeFalse();
    }));


  it('should authenticate',inject([HttpTestingController, DataService],
    (httpMock: HttpTestingController, backend: DataService) => {
      backend.auth("admin", "12345").then(res => {
        expect(res).toBeTruthy();
        expect(backend.getLoginStatus()).toBeTruthy();
      });
    }));

  it('should refresh data',inject([HttpTestingController, DataService],
    (httpMock: HttpTestingController, backend: DataService) => {
      backend.refreshData().then(res => {
        expect(res).toBeTruthy();
      });
    }));

  it('should get path of id',inject([HttpTestingController, DataService],
    (httpMock: HttpTestingController, backend: DataService) => {
      backend.getPath(1).then(res => {
        expect(res).toBeDefined();
      });
    }));

  it('should get history of id',inject([HttpTestingController, DataService],
    (httpMock: HttpTestingController, backend: DataService) => {
      backend.getHistory(1).then(res => {
        expect(res).toBeDefined();
      });
    }));
});
