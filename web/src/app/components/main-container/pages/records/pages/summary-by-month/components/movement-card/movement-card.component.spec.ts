import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

import { MovementCardComponent } from './movement-card.component';
import { IMovement, TypeCategory, TypeMovement } from '../../../../core';

/** Resolves a CSS custom property to its computed color value via a throwaway probe element. */
function resolveToken(property: 'backgroundColor' | 'color', cssVar: string): string {
  const probe = document.createElement('div');
  probe.style[property] = `var(${cssVar})`;
  document.body.appendChild(probe);
  const value = getComputedStyle(probe)[property];
  probe.remove();
  return value;
}

describe('MovementCardComponent', () => {
  let component: MovementCardComponent;
  let fixture: ComponentFixture<MovementCardComponent>;

  const expenseMovement: IMovement = {
    _id: '1',
    Amount: 100,
    Category: { Name: 'Comida', Type: TypeCategory.VARIABLE, Icon: 'restaurant' },
    Date: new Date('2026-01-15'),
    Type: TypeMovement.EGRESO,
    Description: 'Almuerzo',
  };

  /** Creates a fresh fixture against the already-configured testing module. */
  function createFixture(movement: IMovement): void {
    fixture = TestBed.createComponent(MovementCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('movement', movement);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovementCardComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
    })
    .compileComponents();

    createFixture(expenseMovement);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders on the --surface token background, not a hardcoded color', () => {
    const cardEl = fixture.nativeElement.querySelector('.movement-card') as HTMLElement;
    const backgroundColor = getComputedStyle(cardEl).backgroundColor;

    expect(backgroundColor).not.toBe('rgb(95, 158, 160)');
    expect(backgroundColor).toBe(resolveToken('backgroundColor', '--surface'));
  });

  it('shows the description as the title when present', () => {
    const titleEl = fixture.nativeElement.querySelector('.movement-card__title') as HTMLElement;
    expect(titleEl.textContent?.trim()).toBe('Almuerzo');
  });

  it('falls back to the category name as the title when Description is absent', () => {
    createFixture({ ...expenseMovement, Description: undefined });

    const titleEl = fixture.nativeElement.querySelector('.movement-card__title') as HTMLElement;
    expect(titleEl.textContent?.trim()).toBe('Comida');
  });

  it('renders an expense amount with a "-" prefix and the --expense tone', () => {
    const amountEl = fixture.nativeElement.querySelector('.movement-card__amount') as HTMLElement;

    expect(amountEl.textContent?.trim().startsWith('-')).toBeTrue();
    expect(getComputedStyle(amountEl).color).toBe(resolveToken('color', '--expense'));
  });

  it('renders the down glyph for an expense movement', () => {
    const glyphEl = fixture.nativeElement.querySelector('.movement-card__icon-glyph') as HTMLElement;
    expect(glyphEl.textContent?.trim()).toBe('↓');
  });

  it('shows the formatted date alone when Card is absent', () => {
    const subtitleEl = fixture.nativeElement.querySelector('.movement-card__subtitle') as HTMLElement;
    expect(subtitleEl.textContent?.trim()).not.toContain('—');
  });

  describe('with an income movement that has a Card label', () => {
    const incomeMovement: IMovement = {
      _id: '2',
      Amount: 3200,
      Category: { Name: 'Salario', Type: TypeCategory.FIJO, Icon: 'work' },
      Date: new Date('2026-07-01'),
      Type: TypeMovement.INGRESO,
      Card: 'Main • Checking',
    };

    beforeEach(() => createFixture(incomeMovement));

    it('renders an income amount with a "+" prefix and the --income tone', () => {
      const amountEl = fixture.nativeElement.querySelector('.movement-card__amount') as HTMLElement;

      expect(amountEl.textContent?.trim().startsWith('+')).toBeTrue();
      expect(getComputedStyle(amountEl).color).toBe(resolveToken('color', '--income'));
    });

    it('renders the up glyph for an income movement', () => {
      const glyphEl = fixture.nativeElement.querySelector('.movement-card__icon-glyph') as HTMLElement;
      expect(glyphEl.textContent?.trim()).toBe('↑');
    });

    it('composes the subtitle from Card + formatted date when Card is present', () => {
      const subtitleEl = fixture.nativeElement.querySelector('.movement-card__subtitle') as HTMLElement;
      expect(subtitleEl.textContent?.trim()).toContain('Main • Checking');
      expect(subtitleEl.textContent?.trim()).toContain('—');
    });
  });
});
