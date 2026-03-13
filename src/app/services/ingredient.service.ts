import { Injectable, signal, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Ingredient } from '../models/ingredient.model';
import { ProfileService } from './profile.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class IngredientService {
  private readonly http = inject(HttpClient);
  private readonly profileService = inject(ProfileService);
  private readonly ingredientsSignal = signal<Ingredient[]>([]);

  readonly ingredients = this.ingredientsSignal.asReadonly();

  constructor() {
    effect(() => {
      const profileId = this.profileService.activeProfileId();
      if (profileId) {
        this.loadAll(profileId);
      } else {
        this.ingredientsSignal.set([]);
      }
    });
  }

  private loadAll(profileId: number): void {
    this.http.get<Ingredient[]>(`${environment.apiUrl}/profiles/${profileId}/ingredients`)
      .subscribe(list => this.ingredientsSignal.set(list));
  }

  getById(id: number): Ingredient | undefined {
    return this.ingredientsSignal().find(i => i.id === id);
  }

  add(ingredient: Omit<Ingredient, 'id'>): void {
    const profileId = this.profileService.activeProfileId();
    if (!profileId) return;
    this.http.post<Ingredient>(`${environment.apiUrl}/profiles/${profileId}/ingredients`, ingredient)
      .subscribe(saved => this.ingredientsSignal.update(list => [...list, saved]));
  }

  update(ingredient: Ingredient): void {
    const profileId = this.profileService.activeProfileId();
    if (!profileId) return;
    this.http.put<Ingredient>(`${environment.apiUrl}/profiles/${profileId}/ingredients/${ingredient.id}`, ingredient)
      .subscribe(saved => this.ingredientsSignal.update(list =>
        list.map(i => i.id === saved.id ? saved : i)
      ));
  }

  delete(id: number): void {
    const profileId = this.profileService.activeProfileId();
    if (!profileId) return;
    this.http.delete<void>(`${environment.apiUrl}/profiles/${profileId}/ingredients/${id}`)
      .subscribe(() => this.ingredientsSignal.update(list => list.filter(i => i.id !== id)));
  }
}
