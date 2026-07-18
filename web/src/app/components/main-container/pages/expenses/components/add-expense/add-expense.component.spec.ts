import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

import { AddExpenseComponent } from './add-expense.component';

describe('AddExpenseComponent', () => {
  let component: AddExpenseComponent;
  let fixture: ComponentFixture<AddExpenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddExpenseComponent],
      providers: [provideExperimentalZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
