import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

import { MovementCardComponent } from './movement-card.component';
import { IMovement, TypeCategory, TypeMovement } from '../../../../core';

/** Resolves a CSS custom property to its computed color value via a throwaway probe element. */
function resolveToken(cssVar: string): string {
  const probe = document.createElement('div');
  probe.style.backgroundColor = `var(${cssVar})`;
  document.body.appendChild(probe);
  const value = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return value;
}

describe('MovementCardComponent', () => {
  let component: MovementCardComponent;
  let fixture: ComponentFixture<MovementCardComponent>;

  const mockMovement: IMovement = {
    _id: '1',
    Amount: 100,
    Category: { Name: 'Comida', Type: TypeCategory.VARIABLE, Icon: 'restaurant' },
    Date: new Date('2026-01-15'),
    Type: TypeMovement.EGRESO,
    Description: 'Almuerzo',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovementCardComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MovementCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('movement', mockMovement);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not use the hardcoded cadetblue background — resolves via the --surface-2 token instead', () => {
    const cardEl = fixture.nativeElement.querySelector('.movement-card') as HTMLElement;
    const backgroundColor = getComputedStyle(cardEl).backgroundColor;

    expect(backgroundColor).not.toBe('rgb(95, 158, 160)');
    expect(backgroundColor).toBe(resolveToken('--surface-2'));
  });
});
