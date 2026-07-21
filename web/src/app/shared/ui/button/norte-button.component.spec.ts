import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, provideExperimentalZonelessChangeDetection } from '@angular/core';

import { NorteButtonComponent } from './norte-button.component';

@Component({
  selector: 'app-host',
  imports: [NorteButtonComponent],
  template: `
    <app-norte-button
      [variant]="variant"
      [type]="type"
      [disabled]="disabled"
      [fullWidth]="fullWidth"
      (pressed)="onPressed()"
    >Save</app-norte-button>
  `,
})
class HostComponent {
  variant: 'primary' | 'outline' = 'primary';
  type: 'button' | 'submit' = 'button';
  disabled = false;
  fullWidth = true;
  pressedCount = 0;

  onPressed(): void {
    this.pressedCount++;
  }
}

describe('NorteButtonComponent', () => {
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

  it('renders the projected label', () => {
    fixture.detectChanges();

    expect(nativeButton().textContent?.trim()).toBe('Save');
  });

  it('applies the primary variant class by default', () => {
    fixture.detectChanges();

    expect(nativeButton().classList.contains('norte-button--primary')).toBeTrue();
  });

  it('applies the outline variant class when requested', () => {
    host.variant = 'outline';
    fixture.detectChanges();

    expect(nativeButton().classList.contains('norte-button--outline')).toBeTrue();
  });

  it('forwards the type attribute', () => {
    host.type = 'submit';
    fixture.detectChanges();

    expect(nativeButton().type).toBe('submit');
  });

  it('forwards the disabled attribute', () => {
    host.disabled = true;
    fixture.detectChanges();

    expect(nativeButton().disabled).toBeTrue();
  });

  it('emits pressed on click when enabled', () => {
    fixture.detectChanges();
    nativeButton().click();

    expect(host.pressedCount).toBe(1);
  });

  it('does not emit pressed on click when disabled', () => {
    host.disabled = true;
    fixture.detectChanges();

    nativeButton().click();

    expect(host.pressedCount).toBe(0);
  });
});
