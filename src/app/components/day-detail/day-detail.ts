import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { DecimalPipe } from '@angular/common';
import { CalendarService } from '../../services/calendar.service';
import { MealService } from '../../services/meal.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-day-detail',
  imports: [
    DecimalPipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatListModule,
  ],
  templateUrl: './day-detail.html',
  styleUrl: './day-detail.scss',
})
export class DayDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly calendarService = inject(CalendarService);
  private readonly mealService = inject(MealService);
  private readonly settingsService = inject(SettingsService);

  readonly date = signal('');
  readonly availableMeals = this.mealService.meals;

  readonly dayEntry = computed(() => this.calendarService.getEntry(this.date()));
  readonly dayMacros = computed(() => this.calendarService.getDayMacros(this.date()));
  readonly calorieGoal = computed(() => this.settingsService.settings().calorieGoal);

  readonly isOverGoal = computed(() => {
    const macros = this.dayMacros();
    return macros.calories > 0 && macros.calories > this.calorieGoal();
  });

  readonly isUnderGoal = computed(() => {
    const macros = this.dayMacros();
    return macros.calories > 0 && macros.calories <= this.calorieGoal();
  });

  readonly formattedDate = computed(() => {
    const d = this.date();
    if (!d) return '';
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  });

  constructor() {
    this.route.paramMap.subscribe(params => {
      this.date.set(params.get('date') ?? '');
    });
  }

  getMealName(mealId: string): string {
    return this.mealService.getById(mealId)?.name ?? 'Unbekanntes Gericht';
  }

  getMealMacros(mealId: string) {
    const meal = this.mealService.getById(mealId);
    if (!meal) return { calories: 0, fat: 0, protein: 0, carbs: 0 };
    return this.mealService.calculateMealMacros(meal);
  }

  addMeal(mealId: string): void {
    if (!mealId) return;
    this.calendarService.addMealToDay(this.date(), mealId);
  }

  removeMeal(index: number): void {
    this.calendarService.removeMealFromDay(this.date(), index);
  }

  goBack(): void {
    this.router.navigate(['/calendar']);
  }
}
