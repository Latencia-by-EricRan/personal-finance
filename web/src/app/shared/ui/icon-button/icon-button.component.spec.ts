import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, provideExperimentalZonelessChangeDetection } from '@angular/core';

import { IconButtonComponent } from './icon-button.component';

@Component({
  selector: 'app-host',
  imports: [IconButtonComponent],
  template: `
    <app-icon-button [ariaLabel]="ariaLabel" [disabled]="disabled" (pressed)="onPressed()">
      <span>icon</span>
    </app-icon-button>
  `,
})
class HostComponent {
  ariaLabel = 'Close';
  disabled = false;
  pressedCount = 0;

  onPressed(): void {
    this.pressedCount++;
  }
}

describe('IconButtonComponent', () => {
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

  function nativeButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button');
  }

  it('should create', () => {
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('sets the aria-label attribute', () => {
    fixture.detectChanges();

    expect(nativeButton().getAttribute('aria-label')).toBe('Close');
  });

  it('renders the projected icon', () => {
    fixture.detectChanges();

    expect(nativeButton().textContent?.trim()).toBe('icon');
  });

  it('emits pressed on click when enabled', () => {
    fixture.detectChanges();
    nativeButton().click();

    expect(host.pressedCount).toBe(1);
  });

  it('does not emit pressed when disabled', () => {
    host.disabled = true;
    fixture.detectChanges();

    nativeButton().click();

    expect(host.pressedCount).toBe(0);
  });
});
