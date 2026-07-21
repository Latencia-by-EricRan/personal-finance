import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, provideExperimentalZonelessChangeDetection } from '@angular/core';

import { BottomSheetComponent } from './bottom-sheet.component';

@Component({
  selector: 'app-host',
  imports: [BottomSheetComponent],
  template: `
    <app-bottom-sheet [open]="open" (closed)="onClosed()">
      <p>Sheet content</p>
    </app-bottom-sheet>
  `,
})
class HostComponent {
  open = false;
  closedCount = 0;

  onClosed(): void {
    this.closedCount++;
  }
}

describe('BottomSheetComponent', () => {
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

  it('renders nothing when closed', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.bottom-sheet__panel')).toBeNull();
    expect(fixture.nativeElement.querySelector('.bottom-sheet__backdrop')).toBeNull();
  });

  it('renders the backdrop and panel with projected content when open', () => {
    host.open = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.bottom-sheet__backdrop')).toBeTruthy();
    const panel = fixture.nativeElement.querySelector('.bottom-sheet__panel');
    expect(panel.textContent?.trim()).toContain('Sheet content');
  });

  it('emits closed when the backdrop is clicked', () => {
    host.open = true;
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.bottom-sheet__backdrop').click();

    expect(host.closedCount).toBe(1);
  });
});
