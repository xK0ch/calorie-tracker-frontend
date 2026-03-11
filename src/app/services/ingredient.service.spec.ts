import { TestBed } from '@angular/core/testing';
import { IngredientService } from './ingredient.service';

describe('IngredientService', () => {
  let service: IngredientService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(IngredientService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty ingredients', () => {
    expect(service.ingredients()).toEqual([]);
  });

  it('should add an ingredient', () => {
    service.add({
      name: 'Milch',
      referenceAmount: 100,
      calories: 58,
      fat: 3.5,
      protein: 3.4,
      carbs: 4.7,
    });

    expect(service.ingredients().length).toBe(1);
    expect(service.ingredients()[0].name).toBe('Milch');
    expect(service.ingredients()[0].calories).toBe(58);
  });

  it('should update an ingredient', () => {
    service.add({
      name: 'Milch',
      referenceAmount: 100,
      calories: 58,
      fat: 3.5,
      protein: 3.4,
      carbs: 4.7,
    });

    const id = service.ingredients()[0].id;
    service.update({ id, name: 'Vollmilch', referenceAmount: 100, calories: 64, fat: 3.5, protein: 3.3, carbs: 4.8 });

    expect(service.ingredients()[0].name).toBe('Vollmilch');
    expect(service.ingredients()[0].calories).toBe(64);
  });

  it('should delete an ingredient', () => {
    service.add({ name: 'Milch', referenceAmount: 100, calories: 58, fat: 3.5, protein: 3.4, carbs: 4.7 });
    const id = service.ingredients()[0].id;
    service.delete(id);
    expect(service.ingredients().length).toBe(0);
  });

  it('should get ingredient by id', () => {
    service.add({ name: 'Ei', referenceAmount: 60, calories: 93, fat: 6.7, protein: 7.8, carbs: 0.5 });
    const id = service.ingredients()[0].id;
    const ingredient = service.getById(id);
    expect(ingredient?.name).toBe('Ei');
  });

  it('should persist to localStorage', () => {
    service.add({ name: 'Reis', referenceAmount: 100, calories: 130, fat: 0.3, protein: 2.7, carbs: 28 });
    const stored = JSON.parse(localStorage.getItem('ct_ingredients')!);
    expect(stored.length).toBe(1);
    expect(stored[0].name).toBe('Reis');
  });
});
