import { TestBed } from '@angular/core/testing';
import { MealService } from './meal.service';
import { IngredientService } from './ingredient.service';

describe('MealService', () => {
  let mealService: MealService;
  let ingredientService: IngredientService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    ingredientService = TestBed.inject(IngredientService);
    mealService = TestBed.inject(MealService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(mealService).toBeTruthy();
  });

  it('should add a meal', () => {
    mealService.add({ name: 'Frühstück', ingredients: [] });
    expect(mealService.meals().length).toBe(1);
    expect(mealService.meals()[0].name).toBe('Frühstück');
  });

  it('should calculate meal macros correctly', () => {
    ingredientService.add({
      name: 'Milch',
      referenceAmount: 100,
      calories: 58,
      fat: 3.5,
      protein: 3.4,
      carbs: 4.7,
    });
    const milchId = ingredientService.ingredients()[0].id;

    ingredientService.add({
      name: 'Haferflocken',
      referenceAmount: 100,
      calories: 372,
      fat: 7,
      protein: 13.5,
      carbs: 58.7,
    });
    const haferId = ingredientService.ingredients()[1].id;

    mealService.add({
      name: 'Porridge',
      ingredients: [
        { ingredientId: milchId, amount: 200 },
        { ingredientId: haferId, amount: 50 },
      ],
    });

    const meal = mealService.meals()[0];
    const macros = mealService.calculateMealMacros(meal);

    // Milch: 200/100 * 58 = 116 kcal, Haferflocken: 50/100 * 372 = 186 kcal
    expect(macros.calories).toBeCloseTo(302, 0);
    // Milch: 200/100 * 3.5 = 7g, Haferflocken: 50/100 * 7 = 3.5g
    expect(macros.fat).toBeCloseTo(10.5, 1);
    // Milch: 200/100 * 3.4 = 6.8g, Haferflocken: 50/100 * 13.5 = 6.75g
    expect(macros.protein).toBeCloseTo(13.55, 1);
    // Milch: 200/100 * 4.7 = 9.4g, Haferflocken: 50/100 * 58.7 = 29.35g
    expect(macros.carbs).toBeCloseTo(38.75, 1);
  });

  it('should delete a meal', () => {
    mealService.add({ name: 'Test', ingredients: [] });
    const id = mealService.meals()[0].id;
    mealService.delete(id);
    expect(mealService.meals().length).toBe(0);
  });

  it('should update a meal', () => {
    mealService.add({ name: 'Alt', ingredients: [] });
    const id = mealService.meals()[0].id;
    mealService.update({ id, name: 'Neu', ingredients: [] });
    expect(mealService.meals()[0].name).toBe('Neu');
  });
});
