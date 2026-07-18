import { TestBed } from '@angular/core/testing';
import { ProgressService } from './progress.service';

describe('ProgressService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('awards XP once for demonstrated learning steps', () => {
    const service = TestBed.inject(ProgressService);

    service.recordLearningStep('javascript', 'topic', '0:0');
    service.recordLearningStep('javascript', 'practice', '0:0');
    service.recordLearningStep('javascript', 'lab', '0:0');
    service.recordLearningStep('javascript', 'topic', '0:0');

    expect(service.learningStats('javascript', 15).xp).toBe(60);
    expect(service.hasLearningStep('javascript', 'topic', '0:0')).toBe(true);
  });

  it('combines evidence, module and quiz XP without losing existing progress', () => {
    const service = TestBed.inject(ProgressService);

    service.recordLearningStep('java', 'topic', '0:0');
    service.recordLearningStep('java', 'practice', '0:0');
    service.toggleModuleComplete('java', 0);
    service.recordQuizScore('java', 8);

    const stats = service.learningStats('java', 15);
    expect(stats.xp).toBe(160);
    expect(stats.badge).toBe('Explorador');
    expect(stats.bestQuizScore).toBe(8);
  });
});
