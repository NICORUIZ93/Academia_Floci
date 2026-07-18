import { TestBed } from '@angular/core/testing';
import { ProgressService } from './progress.service';

describe('ProgressService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('stores simple module completion without gamification', () => {
    const service = TestBed.inject(ProgressService);

    service.toggleModuleComplete('java', 0);
    expect(service.isModuleComplete('java', 0)).toBe(true);
    expect(service.percentComplete('java', 15)).toBe(7);
  });
});
