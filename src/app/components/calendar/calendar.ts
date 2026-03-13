import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DecimalPipe } from '@angular/common';
import { CalendarService } from '../../services/calendar.service';
import { SettingsService } from '../../services/settings.service';
import { Macros } from '../../models/macros.model';

@Component({
  selector: 'app-calendar',
  imports: [DecimalPipe, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class Calendar {
  private readonly calendarService = inject(CalendarService);
  private readonly settingsService = inject(SettingsService);
  private readonly router = inject(Router);

  readonly currentMonth = signal(new Date().getMonth());
  readonly currentYear = signal(new Date().getFullYear());

  readonly monthName = computed(() => {
    const date = new Date(this.currentYear(), this.currentMonth());
    return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  });

  readonly weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  readonly calendarDays = computed(() => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const days: (null | { date: string; day: number; macros: Macros; isToday: boolean })[] = [];

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    const today = this.formatDate(new Date());

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = this.formatDate(new Date(year, month, d));
      const macros = this.calendarService.getDayMacros(date);
      days.push({ date, day: d, macros, isToday: date === today });
    }

    return days;
  });

  readonly calorieGoal = computed(() => this.settingsService.settings().calorieGoal);

  getCalorieClass(calories: number): string {
    if (calories === 0) return '';
    return calories <= this.calorieGoal() ? 'under-goal' : 'over-goal';
  }

  previousMonth(): void {
    if (this.currentMonth() === 0) {
      this.currentMonth.set(11);
      this.currentYear.update(y => y - 1);
    } else {
      this.currentMonth.update(m => m - 1);
    }
    this.calendarService.loadMonth(this.currentYear(), this.currentMonth());
  }

  nextMonth(): void {
    if (this.currentMonth() === 11) {
      this.currentMonth.set(0);
      this.currentYear.update(y => y + 1);
    } else {
      this.currentMonth.update(m => m + 1);
    }
    this.calendarService.loadMonth(this.currentYear(), this.currentMonth());
  }

  openDay(date: string): void {
    this.router.navigate(['/day', date]);
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
