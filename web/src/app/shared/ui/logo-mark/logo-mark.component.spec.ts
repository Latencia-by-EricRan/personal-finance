import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, provideExperimentalZonelessChangeDetection } from '@angular/core';

import { LogoMarkComponent } from './logo-mark.component';

@Component({
  selector: 'app-host',
  imports: [LogoMarkComponent],
  template: `<app-logo-mark [size]="size" />`,
})
class HostComponent {
  size = 64;
}

describe('LogoMarkComponent', () => {
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

  function root(): HTMLElement {
    return fixture.nativeElement.querySelector('.logo-mark');
  }

  it('should create', () => {
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('sizes the mark from the size input by default (64px)', () => {
    fixture.detectChanges();

    expect(root().style.width).toBe('64px');
    expect(root().style.height).toBe('64px');
  });

  it('resizes when the size input changes', () => {
    host.size = 32;
    fixture.detectChanges();

    expect(root().style.width).toBe('32px');
    expect(root().style.height).toBe('32px');
  });

  it('renders the "N" letter inside the inner ring', () => {
    fixture.detectChanges();

    const letter: HTMLElement = fixture.nativeElement.querySelector('.logo-mark__letter');
    expect(letter.textContent?.trim()).toBe('N');
  });

  it('renders the "↑" compass-needle glyph', () => {
    fixture.detectChanges();

    const needle: HTMLElement = fixture.nativeElement.querySelector('.logo-mark__needle');
    expect(needle.textContent?.trim()).toBe('↑');
  });
});
