import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CalendarService } from './calendar.service';
import { MealService } from './meal.service';
import { IngredientService } from './ingredient.service';
import { ProfileService } from './profile.service';
import { environment } from '../../environments/environment';

describe('CalendarService', () => {
  let calendarService: CalendarService;
  let mealService: MealService;
  let ingredientService: IngredientService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);

    const profileService = TestBed.inject(ProfileService);
    const profileReq = httpMock.expectOne(`${environment.apiUrl}/profiles`);
    profileReq.flush([{ id: 1, name: 'Test', calorieGoal: 2000 }]);

    profileService.setActiveProfile(1);
    TestBed.flushEffects();

    ingredientService = TestBed.inject(IngredientService);
    mealService = TestBed.inject(MealService);
    calendarService = TestBed.inject(CalendarService);
    TestBed.flushEffects();

    // Flush all effect-triggered loads
    httpMock.match(() => true).forEach(r => r.flush([]));
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(calendarService).toBeTruthy();
  });

  it('should return empty entry for new date', () => {
    const entry = calendarService.getEntry('2026-03-11');
    expect(entry.mealIds).toEqual([]);
  });

  it('should add meal to day', () => {
    calendarService.addMealToDay('2026-03-11', 1);
    const req = httpMock.expectOne(`${environment.apiUrl}/profiles/1/days/2026-03-11/meals`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ mealId: 1 });
    req.flush({ date: '2026-03-11', mealIds: [1] });

    const entry = calendarService.getEntry('2026-03-11');
    expect(entry.mealIds).toEqual([1]);
  });

  it('should remove meal from day by index', () => {
    calendarService['entriesSignal'].set([{ date: '2026-03-11', mealIds: [1, 2] }]);

    calendarService.removeMealFromDay('2026-03-11', 0);
    const req = httpMock.expectOne(`${environment.apiUrl}/profiles/1/days/2026-03-11/meals/0`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    const entry = calendarService.getEntry('2026-03-11');
    expect(entry.mealIds).toEqual([2]);
  });

  it('should calculate day macros', () => {
    ingredientService['ingredientsSignal'].set([
      { id: 1, name: 'Reis', referenceAmount: 100, calories: 130, fat: 0.3, protein: 2.7, carbs: 28 },
    ]);
    mealService['mealsSignal'].set([
      { id: 1, name: 'Reis Portion', ingredients: [{ ingredientId: 1, amount: 200 }] },
    ]);
    calendarService['entriesSignal'].set([{ date: '2026-03-11', mealIds: [1, 1] }]);

    const macros = calendarService.getDayMacros('2026-03-11');
    expect(macros.calories).toBeCloseTo(520, 0);
  });
});
