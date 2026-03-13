import { Injectable, signal, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserSettings } from '../models/user-settings.model';
import { ProfileService } from './profile.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly http = inject(HttpClient);
  private readonly profileService = inject(ProfileService);
  private readonly settingsSignal = signal<UserSettings>({ calorieGoal: 2000 });

  readonly settings = this.settingsSignal.asReadonly();

  constructor() {
    effect(() => {
      const profileId = this.profileService.activeProfileId();
      if (profileId) {
        this.loadSettings(profileId);
      }
    });
  }

  private loadSettings(profileId: number): void {
    this.http.get<UserSettings>(`${environment.apiUrl}/profiles/${profileId}/settings`)
      .subscribe(settings => this.settingsSignal.set(settings));
  }

  update(settings: UserSettings): void {
    const profileId = this.profileService.activeProfileId();
    if (!profileId) return;
    this.http.put<UserSettings>(`${environment.apiUrl}/profiles/${profileId}/settings`, settings)
      .subscribe(saved => this.settingsSignal.set(saved));
  }
}
