import { TestBed } from '@angular/core/testing';
import { ProgressService } from './progress.service';

describe('ProgressService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('stores completion, awards XP once and unlocks badges', () => {
    const service = TestBed.inject(ProgressService);

    service.toggleModuleComplete('java', 0);
    expect(service.isModuleComplete('java', 0)).toBe(true);
    expect(service.percentComplete('java', 15)).toBe(7);
    expect(service.totalXp()).toBe(50);
    expect(service.badge()).toBe('Explorador');

    service.completeExercise('java', 'java-0-concept');
    service.completeExercise('java', 'java-0-concept');
    service.passQuiz('java', 0);
    service.passQuiz('java', 0);
    expect(service.totalXp()).toBe(70);
    expect(service.isExerciseComplete('java', 'java-0-concept')).toBe(true);
    expect(service.hasPassedQuiz('java', 0)).toBe(true);
  });
});
