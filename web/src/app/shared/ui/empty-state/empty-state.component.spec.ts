import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, provideExperimentalZonelessChangeDetection } from '@angular/core';

import { EmptyStateComponent } from './empty-state.component';

@Component({
  selector: 'app-host',
  imports: [EmptyStateComponent],
  template: `
    <app-empty-state [title]="title" [message]="message">
      <button type="button">Add movement</button>
    </app-empty-state>
  `,
})
class HostComponent {
  title = 'No movements yet';
  message: string | null = 'Add your first movement this month.';
}

describe('EmptyStateComponent', () => {
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

  it('renders the title', () => {
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.empty-state__title');
    expect(title.textContent?.trim()).toBe('No movements yet');
  });

  it('renders the message when present', () => {
    fixture.detectChanges();

    const message = fixture.nativeElement.querySelector('.empty-state__message');
    expect(message.textContent?.trim()).toBe('Add your first movement this month.');
  });

  it('omits the message when null', () => {
    host.message = null;
    fixture.detectChanges();

    const message = fixture.nativeElement.querySelector('.empty-state__message');
    expect(message).toBeNull();
  });

  it('renders the projected action', () => {
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.textContent?.trim()).toBe('Add movement');
  });
});
