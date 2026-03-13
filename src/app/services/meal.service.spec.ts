import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MealService } from './meal.service';
import { IngredientService } from './ingredient.service';
import { ProfileService } from './profile.service';
import { environment } from '../../environments/environment';

describe('MealService', () => {
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
    TestBed.flushEffects();

    // Flush loads triggered by effects
    httpMock.match(() => true).forEach(r => r.flush([]));
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(mealService).toBeTruthy();
  });

  it('should add a meal', () => {
    mealService.add({ name: 'Frühstück', ingredients: [] });
    const req = httpMock.expectOne(`${environment.apiUrl}/profiles/1/meals`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: 1, name: 'Frühstück', ingredients: [] });

    expect(mealService.meals().length).toBe(1);
    expect(mealService.meals()[0].name).toBe('Frühstück');
  });

  it('should calculate meal macros correctly', () => {
    ingredientService['ingredientsSignal'].set([
      { id: 1, name: 'Milch', referenceAmount: 100, calories: 58, fat: 3.5, protein: 3.4, carbs: 4.7 },
      { id: 2, name: 'Haferflocken', referenceAmount: 100, calories: 372, fat: 7, protein: 13.5, carbs: 58.7 },
    ]);

    const meal = {
      id: 1,
      name: 'Porridge',
      ingredients: [
        { ingredientId: 1, amount: 200 },
        { ingredientId: 2, amount: 50 },
      ],
    };

    const macros = mealService.calculateMealMacros(meal);
    expect(macros.calories).toBeCloseTo(302, 0);
    expect(macros.fat).toBeCloseTo(10.5, 1);
    expect(macros.protein).toBeCloseTo(13.55, 1);
    expect(macros.carbs).toBeCloseTo(38.75, 1);
  });

  it('should delete a meal', () => {
    mealService['mealsSignal'].set([{ id: 1, name: 'Test', ingredients: [] }]);

    mealService.delete(1);
    const req = httpMock.expectOne(`${environment.apiUrl}/profiles/1/meals/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(mealService.meals().length).toBe(0);
  });
});
