import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { IngredientService } from './ingredient.service';
import { ProfileService } from './profile.service';
import { Ingredient } from '../models/ingredient.model';
import { environment } from '../../environments/environment';

describe('IngredientService', () => {
  let service: IngredientService;
  let httpMock: HttpTestingController;
  let profileService: ProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    profileService = TestBed.inject(ProfileService);

    // Mock profiles load
    const profileReq = httpMock.expectOne(`${environment.apiUrl}/profiles`);
    profileReq.flush([{ id: 1, name: 'Test', calorieGoal: 2000 }]);

    profileService.setActiveProfile(1);
    TestBed.flushEffects();

    service = TestBed.inject(IngredientService);
    TestBed.flushEffects();

    // Flush the ingredients load triggered by effect
    const ingredientReqs = httpMock.match(`${environment.apiUrl}/profiles/1/ingredients`);
    ingredientReqs.forEach(r => r.flush([]));
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty ingredients', () => {
    expect(service.ingredients()).toEqual([]);
  });

  it('should add an ingredient', () => {
    const newIngredient: Omit<Ingredient, 'id'> = {
      name: 'Milch', referenceAmount: 100, calories: 58, fat: 3.5, protein: 3.4, carbs: 4.7,
    };
    const saved: Ingredient = { id: 1, ...newIngredient };

    service.add(newIngredient);
    const req = httpMock.expectOne(`${environment.apiUrl}/profiles/1/ingredients`);
    expect(req.request.method).toBe('POST');
    req.flush(saved);

    expect(service.ingredients().length).toBe(1);
    expect(service.ingredients()[0].name).toBe('Milch');
  });

  it('should delete an ingredient', () => {
    service['ingredientsSignal'].set([{ id: 1, name: 'Milch', referenceAmount: 100, calories: 58, fat: 3.5, protein: 3.4, carbs: 4.7 }]);

    service.delete(1);
    const req = httpMock.expectOne(`${environment.apiUrl}/profiles/1/ingredients/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(service.ingredients().length).toBe(0);
  });

  it('should get ingredient by id', () => {
    service['ingredientsSignal'].set([{ id: 5, name: 'Ei', referenceAmount: 60, calories: 93, fat: 6.7, protein: 7.8, carbs: 0.5 }]);
    const ingredient = service.getById(5);
    expect(ingredient?.name).toBe('Ei');
  });
});
