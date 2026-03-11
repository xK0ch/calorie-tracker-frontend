import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { IngredientService } from '../../services/ingredient.service';
import { Ingredient } from '../../models/ingredient.model';

@Component({
  selector: 'app-ingredients',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
  ],
  templateUrl: './ingredients.html',
  styleUrl: './ingredients.scss',
})
export class Ingredients {
  private readonly ingredientService = inject(IngredientService);
  readonly ingredients = this.ingredientService.ingredients;

  readonly showForm = signal(false);
  readonly editingId = signal<string | null>(null);

  readonly formData = signal({
    name: '',
    referenceAmount: 100,
    calories: 0,
    fat: 0,
    protein: 0,
    carbs: 0,
  });

  readonly displayedColumns = ['name', 'referenceAmount', 'calories', 'fat', 'protein', 'carbs', 'actions'];

  openAddForm(): void {
    this.editingId.set(null);
    this.formData.set({ name: '', referenceAmount: 100, calories: 0, fat: 0, protein: 0, carbs: 0 });
    this.showForm.set(true);
  }

  openEditForm(ingredient: Ingredient): void {
    this.editingId.set(ingredient.id);
    this.formData.set({
      name: ingredient.name,
      referenceAmount: ingredient.referenceAmount,
      calories: ingredient.calories,
      fat: ingredient.fat,
      protein: ingredient.protein,
      carbs: ingredient.carbs,
    });
    this.showForm.set(true);
  }

  save(): void {
    const data = this.formData();
    if (!data.name.trim()) return;

    const editId = this.editingId();
    if (editId) {
      this.ingredientService.update({ id: editId, ...data });
    } else {
      this.ingredientService.add(data);
    }
    this.showForm.set(false);
  }

  cancel(): void {
    this.showForm.set(false);
  }

  delete(id: string): void {
    this.ingredientService.delete(id);
  }

  updateField(field: string, value: string): void {
    const current = this.formData();
    if (field === 'name') {
      this.formData.set({ ...current, [field]: value });
    } else {
      this.formData.set({ ...current, [field]: Number(value) || 0 });
    }
  }
}
