import { Injectable, signal } from '@angular/core';
import { UserSettings } from '../models/user-settings.model';

const STORAGE_KEY = 'ct_settings';
const DEFAULT_SETTINGS: UserSettings = { calorieGoal: 2000 };

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly settingsSignal = signal<UserSettings>(this.load());

  readonly settings = this.settingsSignal.asReadonly();

  private load(): UserSettings {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { ...DEFAULT_SETTINGS };
  }

  update(settings: UserSettings): void {
    this.settingsSignal.set(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }
}
