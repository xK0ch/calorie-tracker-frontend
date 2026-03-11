import { Injectable, signal, computed } from '@angular/core';
import { Ingredient } from '../models/ingredient.model';

const STORAGE_KEY = 'ct_ingredients';

@Injectable({ providedIn: 'root' })
export class IngredientService {
  private readonly ingredientsSignal = signal<Ingredient[]>(this.load());

  readonly ingredients = this.ingredientsSignal.asReadonly();

  private load(): Ingredient[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.ingredientsSignal()));
  }

  getById(id: string): Ingredient | undefined {
    return this.ingredientsSignal().find(i => i.id === id);
  }

  add(ingredient: Omit<Ingredient, 'id'>): void {
    const newIngredient: Ingredient = { ...ingredient, id: crypto.randomUUID() };
    this.ingredientsSignal.update(list => [...list, newIngredient]);
    this.save();
  }

  update(ingredient: Ingredient): void {
    this.ingredientsSignal.update(list =>
      list.map(i => (i.id === ingredient.id ? ingredient : i))
    );
    this.save();
  }

  delete(id: string): void {
    this.ingredientsSignal.update(list => list.filter(i => i.id !== id));
    this.save();
  }
}
