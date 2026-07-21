import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, provideExperimentalZonelessChangeDetection } from '@angular/core';

import { SpinnerComponent } from './spinner.component';

@Component({
  selector: 'app-host',
  imports: [SpinnerComponent],
  template: `<app-spinner [size]="size" />`,
})
class HostComponent {
  size = 24;
}

describe('SpinnerComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });

  function spinnerEl(): HTMLElement {
    return fixture.nativeElement.querySelector('.spinner');
  }

  it('should create', () => {
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('sizes itself from the size input by default (24px)', () => {
    fixture.detectChanges();

    expect(spinnerEl().style.width).toBe('24px');
    expect(spinnerEl().style.height).toBe('24px');
  });

  it('resizes when the size input changes', () => {
    host.size = 48;
    fixture.detectChanges();

    expect(spinnerEl().style.width).toBe('48px');
    expect(spinnerEl().style.height).toBe('48px');
  });
});
