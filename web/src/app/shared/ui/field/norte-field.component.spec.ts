import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, provideExperimentalZonelessChangeDetection } from '@angular/core';

import { NorteFieldComponent } from './norte-field.component';

@Component({
  selector: 'app-host',
  imports: [NorteFieldComponent],
  template: `
    <app-norte-field [label]="label" [errorMessage]="errorMessage">
      <input class="norte-field__control" type="text" />
    </app-norte-field>
  `,
})
class HostComponent {
  label = 'Amount';
  errorMessage: string | null = null;
}

describe('NorteFieldComponent', () => {
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

  it('should create', () => {
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the label', () => {
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('.norte-field__label');
    expect(label.textContent?.trim()).toBe('Amount');
  });

  it('renders the projected control', () => {
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input.norte-field__control');
    expect(input).toBeTruthy();
  });

  it('does not render an error message by default', () => {
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('.norte-field__error');
    expect(error).toBeNull();
  });

  it('renders the error message when present', () => {
    host.errorMessage = 'Required';
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('.norte-field__error');
    expect(error.textContent?.trim()).toBe('Required');
  });
});
