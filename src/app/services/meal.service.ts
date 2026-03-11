import { Injectable, signal, inject } from '@angular/core';
import { Meal } from '../models/meal.model';
import { Macros } from '../models/macros.model';
import { IngredientService } from './ingredient.service';

const STORAGE_KEY = 'ct_meals';

@Injectable({ providedIn: 'root' })
export class MealService {
  private readonly ingredientService = inject(IngredientService);
  private readonly mealsSignal = signal<Meal[]>(this.load());

  readonly meals = this.mealsSignal.asReadonly();

  private load(): Meal[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.mealsSignal()));
  }

  getById(id: string): Meal | undefined {
    return this.mealsSignal().find(m => m.id === id);
  }

  add(meal: Omit<Meal, 'id'>): void {
    const newMeal: Meal = { ...meal, id: crypto.randomUUID() };
    this.mealsSignal.update(list => [...list, newMeal]);
    this.save();
  }

  update(meal: Meal): void {
    this.mealsSignal.update(list =>
      list.map(m => (m.id === meal.id ? meal : m))
    );
    this.save();
  }

  delete(id: string): void {
    this.mealsSignal.update(list => list.filter(m => m.id !== id));
    this.save();
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
