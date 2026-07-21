import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, provideExperimentalZonelessChangeDetection } from '@angular/core';

import { StatTileComponent } from './stat-tile.component';

@Component({
  selector: 'app-host',
  imports: [StatTileComponent],
  template: `<app-stat-tile [label]="label" [value]="value" [tone]="tone" />`,
})
class HostComponent {
  label = 'Income';
  value = '$1,000';
  tone: 'default' | 'income' | 'expense' = 'default';
}

describe('StatTileComponent', () => {
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

  function valueEl(): HTMLElement {
    return fixture.nativeElement.querySelector('.stat-tile__value');
  }

  it('should create', () => {
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the label and value', () => {
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('.stat-tile__label');
    expect(label.textContent?.trim()).toBe('Income');
    expect(valueEl().textContent?.trim()).toBe('$1,000');
  });

  it('applies no tone class by default', () => {
    fixture.detectChanges();

    expect(valueEl().classList.contains('stat-tile__value--income')).toBeFalse();
    expect(valueEl().classList.contains('stat-tile__value--expense')).toBeFalse();
  });

  it('applies the income tone class', () => {
    host.tone = 'income';
    fixture.detectChanges();

    expect(valueEl().classList.contains('stat-tile__value--income')).toBeTrue();
  });

  it('applies the expense tone class', () => {
    host.tone = 'expense';
    fixture.detectChanges();

    expect(valueEl().classList.contains('stat-tile__value--expense')).toBeTrue();
  });
});
