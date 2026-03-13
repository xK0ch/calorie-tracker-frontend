import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { ProfileService } from '../../services/profile.service';
import { Profile } from '../../models/profile.model';

@Component({
  selector: 'app-profiles',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatChipsModule,
  ],
  templateUrl: './profiles.html',
  styleUrl: './profiles.scss',
})
export class Profiles {
  readonly profileService = inject(ProfileService);
  readonly profiles = this.profileService.profiles;
  readonly activeProfileId = this.profileService.activeProfileId;

  readonly newName = signal('');
  readonly editingId = signal<number | null>(null);
  readonly editName = signal('');

  createProfile(): void {
    const name = this.newName().trim();
    if (!name) return;
    this.profileService.create(name);
    this.newName.set('');
  }

  selectProfile(id: number): void {
    this.profileService.setActiveProfile(id);
  }

  startEdit(profile: Profile): void {
    this.editingId.set(profile.id);
    this.editName.set(profile.name);
  }

  saveEdit(): void {
    const id = this.editingId();
    const name = this.editName().trim();
    if (!id || !name) return;
    this.profileService.update(id, name);
    this.editingId.set(null);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  deleteProfile(id: number): void {
    this.profileService.delete(id);
  }
}
