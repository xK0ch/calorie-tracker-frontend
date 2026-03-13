import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Profile } from '../models/profile.model';
import { environment } from '../../environments/environment';

const ACTIVE_PROFILE_KEY = 'ct_active_profile';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly profilesSignal = signal<Profile[]>([]);
  private readonly activeProfileIdSignal = signal<number | null>(this.loadActiveId());

  readonly profiles = this.profilesSignal.asReadonly();
  readonly activeProfileId = this.activeProfileIdSignal.asReadonly();

  constructor() {
    this.loadProfiles();
  }

  private loadActiveId(): number | null {
    const stored = localStorage.getItem(ACTIVE_PROFILE_KEY);
    return stored ? Number(stored) : null;
  }

  loadProfiles(): void {
    this.http.get<Profile[]>(`${environment.apiUrl}/profiles`).subscribe(profiles => {
      this.profilesSignal.set(profiles);
      const activeId = this.activeProfileIdSignal();
      if (activeId && !profiles.find(p => p.id === activeId)) {
        this.setActiveProfile(profiles.length > 0 ? profiles[0].id : null);
      } else if (!activeId && profiles.length > 0) {
        this.setActiveProfile(profiles[0].id);
      }
    });
  }

  setActiveProfile(id: number | null): void {
    this.activeProfileIdSignal.set(id);
    if (id !== null) {
      localStorage.setItem(ACTIVE_PROFILE_KEY, String(id));
    } else {
      localStorage.removeItem(ACTIVE_PROFILE_KEY);
    }
  }

  getActiveProfile(): Profile | undefined {
    const id = this.activeProfileIdSignal();
    return this.profilesSignal().find(p => p.id === id);
  }

  create(name: string): void {
    this.http.post<Profile>(`${environment.apiUrl}/profiles`, { name }).subscribe(profile => {
      this.profilesSignal.update(list => [...list, profile]);
      if (!this.activeProfileIdSignal()) {
        this.setActiveProfile(profile.id);
      }
    });
  }

  update(id: number, name: string): void {
    this.http.put<Profile>(`${environment.apiUrl}/profiles/${id}`, { name }).subscribe(updated => {
      this.profilesSignal.update(list => list.map(p => p.id === id ? updated : p));
    });
  }

  delete(id: number): void {
    this.http.delete<void>(`${environment.apiUrl}/profiles/${id}`).subscribe(() => {
      this.profilesSignal.update(list => list.filter(p => p.id !== id));
      if (this.activeProfileIdSignal() === id) {
        const remaining = this.profilesSignal();
        this.setActiveProfile(remaining.length > 0 ? remaining[0].id : null);
      }
    });
  }
}
