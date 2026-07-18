import { TRACKS } from './course-data';
import { TRACK_PROJECTS, exercisesFor, quizFor } from './learning-activities';

describe('Learning activities', () => {
  it('creates three exercises and five valid quiz questions for every module', () => {
    let modules = 0;
    for (const track of TRACKS) {
      for (const module of track.modules) {
        modules += 1;
        const exercises = exercisesFor(track, module);
        const quiz = quizFor(track, module);
        expect(exercises).toHaveLength(3);
        expect(quiz).toHaveLength(5);
        expect(new Set(exercises.map(item => item.id)).size).toBe(3);
        expect(new Set(quiz.map(item => item.id)).size).toBe(5);
        for (const item of [...exercises, ...quiz]) {
          expect(item.options).toHaveLength(4);
          expect(item.correctIndex).toBeGreaterThanOrEqual(0);
          expect(item.correctIndex).toBeLessThan(item.options.length);
          expect(item.explanation.length).toBeGreaterThan(30);
        }
      }
    }
    expect(modules).toBe(224);
  });

  it('defines one complete project for each specialization track', () => {
    expect(TRACK_PROJECTS).toHaveLength(12);
    expect(new Set(TRACK_PROJECTS.map(project => project.trackId)).size).toBe(12);
    TRACK_PROJECTS.forEach(project => {
      expect(project.milestones).toHaveLength(4);
      expect(project.verification).toHaveLength(4);
      expect(project.deliverable.length).toBeGreaterThan(40);
    });
  });
});
