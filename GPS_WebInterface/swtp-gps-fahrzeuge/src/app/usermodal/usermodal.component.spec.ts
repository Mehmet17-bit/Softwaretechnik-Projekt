import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsermodalComponent } from './usermodal.component';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {ElementRef} from "@angular/core";
import anything = jasmine.anything;

describe('UsermodalComponent', () => {
  let component: UsermodalComponent;
  let fixture: ComponentFixture<UsermodalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ],
      imports: [HttpClientTestingModule, RouterTestingModule, MatDialogModule ],
      declarations: [ UsermodalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UsermodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add user', () => {
    component.add();
    expect(component.edit).toBeFalse();
    component.dataService.getZones().then(res => {
      expect(res).toBeDefined();
    });
  });

  it('should toggle edit user', () => {
    component.nameField = new ElementRef<any>(anything());
    component.toggleEdit(9999);
    expect(component.edit).toBeFalse();
  });
});
