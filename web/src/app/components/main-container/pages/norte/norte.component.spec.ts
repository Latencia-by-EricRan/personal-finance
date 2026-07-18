import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { NorteComponent } from './norte.component';

/** Resolves a CSS custom property to its computed color value via a throwaway probe element. */
function resolveToken(property: 'backgroundColor' | 'color', cssVar: string): string {
  const probe = document.createElement('div');
  probe.style[property] = `var(${cssVar})`;
  document.body.appendChild(probe);
  const value = getComputedStyle(probe)[property];
  probe.remove();
  return value;
}

describe('NorteComponent', () => {
  let component: NorteComponent;
  let fixture: ComponentFixture<NorteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NorteComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideRouter([]),
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(NorteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the root container with --bg/--text tokens, not hardcoded colors', () => {
    const rootEl = fixture.nativeElement.querySelector('.norte') as HTMLElement;
    const style = getComputedStyle(rootEl);

    expect(style.backgroundColor).toBe(resolveToken('backgroundColor', '--bg'));
    expect(style.color).toBe(resolveToken('color', '--text'));
  });

  it('renders the sidebar nav', () => {
    const sidebar = fixture.nativeElement.querySelector('app-sidebar-nav');

    expect(sidebar).toBeTruthy();
  });

  it('renders a router-outlet for child routes', () => {
    const outlet = fixture.nativeElement.querySelector('router-outlet');

    expect(outlet).toBeTruthy();
  });
});
