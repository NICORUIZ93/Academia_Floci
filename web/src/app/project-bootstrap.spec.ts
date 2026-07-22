import { TRACKS } from './course-data';
import { findProjectBootstrap } from './project-bootstrap';

describe('project bootstrap guides', () => {
  it('provides a complete from-zero guide for every visible track', () => {
    for (const track of TRACKS) {
      const guide = findProjectBootstrap(track.id);
      expect(guide, track.id).toBeTruthy();
      expect(guide!.prerequisites.length, track.id).toBeGreaterThanOrEqual(3);
      expect(guide!.createCommands.length, track.id).toBeGreaterThanOrEqual(3);
      expect(guide!.structure.length, track.id).toBeGreaterThanOrEqual(4);
      expect(guide!.runCommand.trim(), track.id).not.toBe('');
      expect(guide!.expected.trim(), track.id).not.toBe('');
      expect(guide!.recovery.length, track.id).toBeGreaterThanOrEqual(2);
    }
  });
});
