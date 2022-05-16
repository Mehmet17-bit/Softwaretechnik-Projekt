import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ZonemodalComponent} from './zonemodal.component';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, MatDialogState} from "@angular/material/dialog";
import {ElementRef} from "@angular/core";
import anything = jasmine.anything;

describe('ZonemodalComponent', () => {
  let component: ZonemodalComponent;
  let fixture: ComponentFixture<ZonemodalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ],
      imports: [HttpClientTestingModule, RouterTestingModule, MatDialogModule ],
      declarations: [ ZonemodalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ZonemodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('component should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add zone', () => {
    component.add("Zone", 1, 1, 1);
    expect(component.edit).toBeFalse();
    component.dataService.getZones().then(res => {
      expect(res).toBeDefined();
    });
  });

  it('should toggle edit zone', () => {
    component.nameField = new ElementRef<any>(anything());
    component.toggleEdit("Zone");
    expect(component.edit).toBeTruthy();
  });

});
