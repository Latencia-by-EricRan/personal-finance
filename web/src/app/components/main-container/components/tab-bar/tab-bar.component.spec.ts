import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';

import { TabBarComponent } from './tab-bar.component';

@Component({ selector: 'app-stub', template: '', standalone: true })
class StubComponent {}

describe('TabBarComponent', () => {
  let component: TabBarComponent;
  let fixture: ComponentFixture<TabBarComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabBarComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideRouter([
          { path: 'records', component: StubComponent },
          { path: 'cuentas', component: StubComponent },
          { path: 'expenses', component: StubComponent },
        ]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(TabBarComponent);
    component = fixture.componentInstance;
  });

  async function navigateAndSettle(url: string): Promise<void> {
    await router.navigateByUrl(url);
    fixture.detectChanges();
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    fixture.detectChanges();
  }

  it('should create', async () => {
    await navigateAndSettle('/records');

    expect(component).toBeTruthy();
  });

  it('renders links to /records, /cuentas, /expenses', async () => {
    await navigateAndSettle('/records');

    const hrefs = Array.from(
      fixture.nativeElement.querySelectorAll('.tab-bar__tab') as NodeListOf<HTMLAnchorElement>,
    ).map((a) => a.getAttribute('href'));

    expect(hrefs).toEqual(['/records', '/cuentas', '/expenses']);
  });

  it('marks only the active tab, styled with the --gold token', async () => {
    await navigateAndSettle('/cuentas');

    const activeTabs = fixture.nativeElement.querySelectorAll('.tab-bar__tab--active');
    expect(activeTabs.length).toBe(1);
    expect(activeTabs[0].textContent?.trim()).toContain('Accounts');
  });
});
