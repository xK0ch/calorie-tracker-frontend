import { Injectable, signal, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DayEntry } from '../models/day-entry.model';
import { Macros } from '../models/macros.model';
import { MealService } from './meal.service';
import { ProfileService } from './profile.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly http = inject(HttpClient);
  private readonly mealService = inject(MealService);
  private readonly profileService = inject(ProfileService);
  private readonly entriesSignal = signal<DayEntry[]>([]);

  readonly entries = this.entriesSignal.asReadonly();

  constructor() {
    effect(() => {
      const profileId = this.profileService.activeProfileId();
      if (profileId) {
        this.loadCurrentMonth();
      } else {
        this.entriesSignal.set([]);
      }
    });
  }

  loadCurrentMonth(): void {
    const profileId = this.profileService.activeProfileId();
    if (!profileId) return;
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.loadDateRange(profileId, this.formatDate(from), this.formatDate(to));
  }

  loadMonth(year: number, month: number): void {
    const profileId = this.profileService.activeProfileId();
    if (!profileId) return;
    const from = new Date(year, month, 1);
    const to = new Date(year, month + 1, 0);
    this.loadDateRange(profileId, this.formatDate(from), this.formatDate(to));
  }

  private loadDateRange(profileId: number, from: string, to: string): void {
    this.http.get<DayEntry[]>(`${environment.apiUrl}/profiles/${profileId}/days`, {
      params: { from, to }
    }).subscribe(entries => this.entriesSignal.set(entries));
  }

  getEntry(date: string): DayEntry {
    return this.entriesSignal().find(e => e.date === date) ?? { date, mealIds: [] };
  }

  addMealToDay(date: string, mealId: number): void {
    const profileId = this.profileService.activeProfileId();
    if (!profileId) return;
    this.http.post<DayEntry>(`${environment.apiUrl}/profiles/${profileId}/days/${date}/meals`, { mealId })
      .subscribe(entry => {
        this.entriesSignal.update(entries => {
          const existing = entries.find(e => e.date === date);
          if (existing) {
            return entries.map(e => e.date === date ? entry : e);
          }
          return [...entries, entry];
        });
      });
  }

  removeMealFromDay(date: string, index: number): void {
    const profileId = this.profileService.activeProfileId();
    if (!profileId) return;
    this.http.delete<void>(`${environment.apiUrl}/profiles/${profileId}/days/${date}/meals/${index}`)
      .subscribe(() => {
        this.entriesSignal.update(entries => {
          const entry = entries.find(e => e.date === date);
          if (!entry) return entries;
          const mealIds = [...entry.mealIds];
          mealIds.splice(index, 1);
          if (mealIds.length === 0) {
            return entries.filter(e => e.date !== date);
          }
          return entries.map(e => e.date === date ? { ...e, mealIds } : e);
        });
      });
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

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
