import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { SettingsService } from './settings.service';
import { ProfileService } from './profile.service';
import { environment } from '../../environments/environment';

describe('SettingsService', () => {
  let service: SettingsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);

    const profileService = TestBed.inject(ProfileService);
    const profileReq = httpMock.expectOne(`${environment.apiUrl}/profiles`);
    profileReq.flush([{ id: 1, name: 'Test', calorieGoal: 2000 }]);

    profileService.setActiveProfile(1);
    TestBed.flushEffects();

    service = TestBed.inject(SettingsService);
    TestBed.flushEffects();

    // Flush settings load and any other pending requests
    httpMock.match(() => true).forEach(r => r.flush({ calorieGoal: 2000 }));
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have default calorie goal of 2000', () => {
    expect(service.settings().calorieGoal).toBe(2000);
  });

  it('should update calorie goal', () => {
    service.update({ calorieGoal: 1800 });
    const req = httpMock.expectOne(`${environment.apiUrl}/profiles/1/settings`);
    expect(req.request.method).toBe('PUT');
    req.flush({ calorieGoal: 1800 });

    expect(service.settings().calorieGoal).toBe(1800);
  });
});
