import { Injectable, signal, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Meal } from '../models/meal.model';
import { Macros } from '../models/macros.model';
import { IngredientService } from './ingredient.service';
import { ProfileService } from './profile.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MealService {
  private readonly http = inject(HttpClient);
  private readonly ingredientService = inject(IngredientService);
  private readonly profileService = inject(ProfileService);
  private readonly mealsSignal = signal<Meal[]>([]);

  readonly meals = this.mealsSignal.asReadonly();

  constructor() {
    effect(() => {
      const profileId = this.profileService.activeProfileId();
      if (profileId) {
        this.loadAll(profileId);
      } else {
        this.mealsSignal.set([]);
      }
    });
  }

  private loadAll(profileId: number): void {
    this.http.get<Meal[]>(`${environment.apiUrl}/profiles/${profileId}/meals`)
      .subscribe(list => this.mealsSignal.set(list));
  }

  getById(id: number): Meal | undefined {
    return this.mealsSignal().find(m => m.id === id);
  }

  add(meal: Omit<Meal, 'id'>): void {
    const profileId = this.profileService.activeProfileId();
    if (!profileId) return;
    this.http.post<Meal>(`${environment.apiUrl}/profiles/${profileId}/meals`, meal)
      .subscribe(saved => this.mealsSignal.update(list => [...list, saved]));
  }

  update(meal: Meal): void {
    const profileId = this.profileService.activeProfileId();
    if (!profileId) return;
    this.http.put<Meal>(`${environment.apiUrl}/profiles/${profileId}/meals/${meal.id}`, meal)
      .subscribe(saved => this.mealsSignal.update(list =>
        list.map(m => m.id === saved.id ? saved : m)
      ));
  }

  delete(id: number): void {
    const profileId = this.profileService.activeProfileId();
    if (!profileId) return;
    this.http.delete<void>(`${environment.apiUrl}/profiles/${profileId}/meals/${id}`)
      .subscribe(() => this.mealsSignal.update(list => list.filter(m => m.id !== id)));
  }

  calculateMealMacros(meal: Meal): Macros {
    const macros: Macros = { calories: 0, fat: 0, protein: 0, carbs: 0 };
    for (const mi of meal.ingredients) {
      const ingredient = this.ingredientService.getById(mi.ingredientId);
      if (ingredient) {
        const factor = mi.amount / ingredient.referenceAmount;
        macros.calories += ingredient.calories * factor;
        macros.fat += ingredient.fat * factor;
        macros.protein += ingredient.protein * factor;
        macros.carbs += ingredient.carbs * factor;
      }
    }
    return macros;
  }
}
