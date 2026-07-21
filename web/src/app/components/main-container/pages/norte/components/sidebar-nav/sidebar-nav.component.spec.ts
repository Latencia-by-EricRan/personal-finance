import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';

import { SidebarNavComponent } from './sidebar-nav.component';

@Component({ selector: 'app-stub', template: '', standalone: true })
class StubComponent {}

/** Resolves a CSS custom property to its computed color value via a throwaway probe element. */
function resolveToken(property: 'backgroundColor' | 'color', cssVar: string): string {
  const probe = document.createElement('div');
  probe.style[property] = `var(${cssVar})`;
  document.body.appendChild(probe);
  const value = getComputedStyle(probe)[property];
  probe.remove();
  return value;
}

describe('SidebarNavComponent', () => {
  let component: SidebarNavComponent;
  let fixture: ComponentFixture<SidebarNavComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarNavComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideRouter([
          { path: 'norte/overview', component: StubComponent },
          { path: 'norte/reports', component: StubComponent },
          { path: 'norte/budgets', component: StubComponent },
        ]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(SidebarNavComponent);
    component = fixture.componentInstance;
  });

  /**
   * RouterLinkActive recomputes its active class inside a `queueMicrotask`
   * (see @angular/router's RouterLinkActive#update). A single
   * `detectChanges()` right after navigation renders before that microtask
   * flushes, so classes lag one tick behind the URL. Flush microtasks, then
   * re-run change detection to observe the settled state.
   */
  async function navigateAndSettle(url: string): Promise<void> {
    await router.navigateByUrl(url);
    fixture.detectChanges();
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    fixture.detectChanges();
  }

  it('should create', async () => {
    await navigateAndSettle('/norte/overview');

    expect(component).toBeTruthy();
  });

  it('marks only the Reports link active, with the --gold token, when routed to /norte/reports', async () => {
    await navigateAndSettle('/norte/reports');

    const activeLinks = fixture.nativeElement.querySelectorAll('.sidebar-nav__link--active') as NodeListOf<HTMLElement>;
    expect(activeLinks.length).toBe(1);
    expect(activeLinks[0].textContent?.trim()).toBe('Reports');
    expect(getComputedStyle(activeLinks[0]).color).toBe(resolveToken('color', '--gold'));
  });

  it('renders inactive links with the --text-dim token, not a hardcoded color', async () => {
    await navigateAndSettle('/norte/budgets');

    const allLinks = fixture.nativeElement.querySelectorAll('.sidebar-nav__link') as NodeListOf<HTMLElement>;
    const inactiveLinks = Array.from(allLinks).filter((link) => !link.classList.contains('sidebar-nav__link--active'));

    expect(inactiveLinks.length).toBe(2);
    inactiveLinks.forEach((link) => {
      expect(getComputedStyle(link).color).toBe(resolveToken('color', '--text-dim'));
    });
  });

  it('links to /norte/overview, /norte/reports, /norte/budgets', async () => {
    await navigateAndSettle('/norte/overview');

    const hrefs = Array.from(
      fixture.nativeElement.querySelectorAll('.sidebar-nav__link') as NodeListOf<HTMLAnchorElement>,
    ).map((a) => a.getAttribute('href'));

    expect(hrefs).toEqual(['/norte/overview', '/norte/reports', '/norte/budgets']);
  });
});
