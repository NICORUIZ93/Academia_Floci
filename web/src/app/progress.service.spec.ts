import { TestBed } from '@angular/core/testing';
import { ProgressService } from './progress.service';

describe('ProgressService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('stores module, exercise and quiz completion without duplicate entries', () => {
    const service = TestBed.inject(ProgressService);

    service.toggleModuleComplete('java', 0);
    service.completeExercise('java', 0, 'variables-1');
    service.completeExercise('java', 0, 'variables-1');
    expect(service.isModuleComplete('java', 0)).toBe(true);
    expect(service.isExerciseComplete('java', 0, 'variables-1')).toBe(true);
    expect(service.trackProgress('java').completedExercises).toEqual(['0:variables-1']);
    expect(service.percentComplete('java', 15)).toBe(7);
  });
});
