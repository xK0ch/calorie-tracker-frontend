import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { DecimalPipe } from '@angular/common';
import { MealService } from '../../services/meal.service';
import { IngredientService } from '../../services/ingredient.service';
import { Meal, MealIngredient } from '../../models/meal.model';
import { Macros } from '../../models/macros.model';

@Component({
  selector: 'app-meals',
  imports: [
    FormsModule,
    DecimalPipe,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
  ],
  templateUrl: './meals.html',
  styleUrl: './meals.scss',
})
export class Meals {
  private readonly mealService = inject(MealService);
  private readonly ingredientService = inject(IngredientService);

  readonly meals = this.mealService.meals;
  readonly ingredients = this.ingredientService.ingredients;

  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly mealName = signal('');
  readonly mealIngredients = signal<MealIngredient[]>([]);

  readonly currentMacros = computed<Macros>(() => {
    const macros: Macros = { calories: 0, fat: 0, protein: 0, carbs: 0 };
    for (const mi of this.mealIngredients()) {
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
  });

  getMealMacros(meal: Meal): Macros {
    return this.mealService.calculateMealMacros(meal);
  }

  getIngredientName(id: number): string {
    return this.ingredientService.getById(id)?.name ?? 'Unbekannt';
  }

  openAddForm(): void {
    this.editingId.set(null);
    this.mealName.set('');
    this.mealIngredients.set([]);
    this.showForm.set(true);
  }

  openEditForm(meal: Meal): void {
    this.editingId.set(meal.id);
    this.mealName.set(meal.name);
    this.mealIngredients.set([...meal.ingredients.map(i => ({ ...i }))]);
    this.showForm.set(true);
  }

  addIngredientToMeal(ingredientId: number): void {
    if (!ingredientId) return;
    this.mealIngredients.update(list => [...list, { ingredientId, amount: 100 }]);
  }

  removeIngredientFromMeal(index: number): void {
    this.mealIngredients.update(list => list.filter((_, i) => i !== index));
  }

  updateIngredientAmount(index: number, amount: string): void {
    this.mealIngredients.update(list =>
      list.map((item, i) => (i === index ? { ...item, amount: Number(amount) || 0 } : item))
    );
  }

  save(): void {
    const name = this.mealName();
    if (!name.trim() || this.mealIngredients().length === 0) return;

    const editId = this.editingId();
    if (editId) {
      this.mealService.update({ id: editId, name, ingredients: this.mealIngredients() });
    } else {
      this.mealService.add({ name, ingredients: this.mealIngredients() });
    }
    this.showForm.set(false);
  }

  cancel(): void {
    this.showForm.set(false);
  }

  delete(id: number): void {
    this.mealService.delete(id);
  }
}
