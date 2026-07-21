import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, provideExperimentalZonelessChangeDetection } from '@angular/core';

import { NorteCardComponent } from './norte-card.component';

@Component({
  selector: 'app-host',
  imports: [NorteCardComponent],
  template: `
    <app-norte-card [padded]="padded">
      <p>Card content</p>
    </app-norte-card>
  `,
})
class HostComponent {
  padded = true;
}

describe('NorteCardComponent', () => {
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

  function cardEl(): HTMLElement {
    return fixture.nativeElement.querySelector('.norte-card');
  }

  it('should create', () => {
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders projected content', () => {
    fixture.detectChanges();

    expect(cardEl().textContent?.trim()).toBe('Card content');
  });

  it('applies the padded class by default', () => {
    fixture.detectChanges();

    expect(cardEl().classList.contains('norte-card--padded')).toBeTrue();
  });

  it('omits the padded class when padded is false', () => {
    host.padded = false;
    fixture.detectChanges();

    expect(cardEl().classList.contains('norte-card--padded')).toBeFalse();
  });
});
