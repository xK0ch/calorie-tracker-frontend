import { TestBed } from '@angular/core/testing';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(SettingsService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have default calorie goal of 2000', () => {
    expect(service.settings().calorieGoal).toBe(2000);
  });

  it('should update calorie goal', () => {
    service.update({ calorieGoal: 1800 });
    expect(service.settings().calorieGoal).toBe(1800);
  });

  it('should persist settings to localStorage', () => {
    service.update({ calorieGoal: 2500 });
    const stored = JSON.parse(localStorage.getItem('ct_settings')!);
    expect(stored.calorieGoal).toBe(2500);
  });
});
