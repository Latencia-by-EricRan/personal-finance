import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

import { ToastComponent } from './toast.component';
import { ToastService } from './toast.service';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    toastService = TestBed.inject(ToastService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders nothing when there is no active toast', () => {
    expect(fixture.nativeElement.querySelector('.toast')).toBeNull();
  });

  it('renders the message when a toast is shown', () => {
    toastService.show('Saved successfully', 'success');
    fixture.detectChanges();

    const toastEl = fixture.nativeElement.querySelector('.toast');
    expect(toastEl.textContent?.trim()).toBe('Saved successfully');
    expect(toastEl.classList.contains('toast--success')).toBeTrue();
  });

  it('applies the error tone class', () => {
    toastService.show('Something failed', 'error');
    fixture.detectChanges();

    const toastEl = fixture.nativeElement.querySelector('.toast');
    expect(toastEl.classList.contains('toast--error')).toBeTrue();
  });
});
