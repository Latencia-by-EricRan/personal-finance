import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SegmentedControlComponent } from './segmented-control.component';

@Component({
  selector: 'app-host',
  imports: [SegmentedControlComponent, FormsModule],
  template: `<app-segmented-control [options]="options" [(value)]="value" />`,
})
class HostComponent {
  options = [
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
  ];
  value = 'income';
}

describe('SegmentedControlComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function segments(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.segmented-control__segment'));
  }

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders one segment per option', () => {
    expect(segments().length).toBe(2);
    expect(segments().map((s) => s.textContent?.trim())).toEqual(['Income', 'Expense']);
  });

  it('marks the segment matching value as active', () => {
    expect(segments()[0].classList.contains('segmented-control__segment--active')).toBeTrue();
    expect(segments()[1].classList.contains('segmented-control__segment--active')).toBeFalse();
  });

  it('updates value and the active segment when a different segment is clicked', () => {
    segments()[1].click();
    fixture.detectChanges();

    expect(host.value).toBe('expense');
    expect(segments()[1].classList.contains('segmented-control__segment--active')).toBeTrue();
  });
});
