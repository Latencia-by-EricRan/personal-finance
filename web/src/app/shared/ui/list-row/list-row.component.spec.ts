import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, provideExperimentalZonelessChangeDetection } from '@angular/core';

import { ListRowComponent } from './list-row.component';

@Component({
  selector: 'app-host',
  imports: [ListRowComponent],
  template: `<app-list-row [label]="label" [value]="value" />`,
})
class HostComponent {
  label = 'Category';
  value = 'Salary';
}

describe('ListRowComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the label as a caption', () => {
    const label = fixture.nativeElement.querySelector('.list-row__label');
    expect(label.textContent?.trim()).toBe('Category');
  });

  it('renders the value', () => {
    const value = fixture.nativeElement.querySelector('.list-row__value');
    expect(value.textContent?.trim()).toBe('Salary');
  });
});
