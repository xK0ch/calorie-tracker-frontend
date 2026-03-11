import { Injectable, signal, inject } from '@angular/core';
import { DayEntry } from '../models/day-entry.model';
import { Macros } from '../models/macros.model';
import { MealService } from './meal.service';

const STORAGE_KEY = 'ct_calendar';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly mealService = inject(MealService);
  private readonly entriesSignal = signal<DayEntry[]>(this.load());

  readonly entries = this.entriesSignal.asReadonly();

  private load(): DayEntry[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entriesSignal()));
  }

  getEntry(date: string): DayEntry {
    return this.entriesSignal().find(e => e.date === date) ?? { date, mealIds: [] };
  }

  addMealToDay(date: string, mealId: string): void {
    this.entriesSignal.update(entries => {
      const existing = entries.find(e => e.date === date);
      if (existing) {
        return entries.map(e =>
          e.date === date ? { ...e, mealIds: [...e.mealIds, mealId] } : e
        );
      }
      return [...entries, { date, mealIds: [mealId] }];
    });
    this.save();
  }

  removeMealFromDay(date: string, index: number): void {
    this.entriesSignal.update(entries =>
      entries.map(e => {
        if (e.date !== date) return e;
        const mealIds = [...e.mealIds];
        mealIds.splice(index, 1);
        return { ...e, mealIds };
      }).filter(e => e.mealIds.length > 0)
    );
    this.save();
  }

  getDayMacros(date: string): Macros {
    const entry = this.getEntry(date);
    const macros: Macros = { calories: 0, fat: 0, protein: 0, carbs: 0 };
    for (const mealId of entry.mealIds) {
      const meal = this.mealService.getById(mealId);
      if (meal) {
        const mealMacros = this.mealService.calculateMealMacros(meal);
        macros.calories += mealMacros.calories;
        macros.fat += mealMacros.fat;
        macros.protein += mealMacros.protein;
        macros.carbs += mealMacros.carbs;
      }
    }
    return macros;
  }
}
