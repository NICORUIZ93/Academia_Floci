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
    expect(service.isModuleComplete('java', 0)).toBe(true);
    expect(service.percentComplete('java', 15)).toBe(7);
    service.completeExercise('java', 'java-0-concept');
    service.completeExercise('java', 'java-0-concept');
    service.passQuiz('java', 0);
    service.passQuiz('java', 0);
    expect(service.isExerciseComplete('java', 'java-0-concept')).toBe(true);
    expect(service.hasPassedQuiz('java', 0)).toBe(true);
  });
});
