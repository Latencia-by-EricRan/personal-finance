import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { FabComponent } from './fab.component';

@Component({ selector: 'app-stub', template: '', standalone: true })
class StubComponent {}

describe('FabComponent', () => {
  let component: FabComponent;
  let fixture: ComponentFixture<FabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FabComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideRouter([{ path: 'records/movement/add', component: StubComponent }]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('links to /records/movement/add', () => {
    const link = fixture.nativeElement.querySelector('a.fab');
    expect(link.getAttribute('href')).toBe('/records/movement/add');
  });
});
