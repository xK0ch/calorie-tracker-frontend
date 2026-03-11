import { TestBed } from '@angular/core/testing';
import { CalendarService } from './calendar.service';
import { MealService } from './meal.service';
import { IngredientService } from './ingredient.service';

describe('CalendarService', () => {
  let calendarService: CalendarService;
  let mealService: MealService;
  let ingredientService: IngredientService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    ingredientService = TestBed.inject(IngredientService);
    mealService = TestBed.inject(MealService);
    calendarService = TestBed.inject(CalendarService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(calendarService).toBeTruthy();
  });

  it('should return empty entry for new date', () => {
    const entry = calendarService.getEntry('2026-03-11');
    expect(entry.mealIds).toEqual([]);
  });

  it('should add meal to day', () => {
    calendarService.addMealToDay('2026-03-11', 'meal-1');
    const entry = calendarService.getEntry('2026-03-11');
    expect(entry.mealIds).toEqual(['meal-1']);
  });

  it('should add multiple meals to same day', () => {
    calendarService.addMealToDay('2026-03-11', 'meal-1');
    calendarService.addMealToDay('2026-03-11', 'meal-2');
    const entry = calendarService.getEntry('2026-03-11');
    expect(entry.mealIds).toEqual(['meal-1', 'meal-2']);
  });

  it('should remove meal from day by index', () => {
    calendarService.addMealToDay('2026-03-11', 'meal-1');
    calendarService.addMealToDay('2026-03-11', 'meal-2');
    calendarService.removeMealFromDay('2026-03-11', 0);
    const entry = calendarService.getEntry('2026-03-11');
    expect(entry.mealIds).toEqual(['meal-2']);
  });

  it('should calculate day macros', () => {
    ingredientService.add({
      name: 'Reis',
      referenceAmount: 100,
      calories: 130,
      fat: 0.3,
      protein: 2.7,
      carbs: 28,
    });
    const reisId = ingredientService.ingredients()[0].id;

    mealService.add({
      name: 'Reis Portion',
      ingredients: [{ ingredientId: reisId, amount: 200 }],
    });
    const mealId = mealService.meals()[0].id;

    calendarService.addMealToDay('2026-03-11', mealId);
    calendarService.addMealToDay('2026-03-11', mealId);

    const macros = calendarService.getDayMacros('2026-03-11');
    // 2 * (200/100 * 130) = 520 kcal
    expect(macros.calories).toBeCloseTo(520, 0);
  });
});
