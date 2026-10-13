// @vitest-environment jsdom
import { expect, test } from 'vitest';
import { mountDeliveryButton } from './delivery-button';
test('deshabilita durante confirmación y comunica resultado', async () => {
 const button = document.createElement('button'); const feedback = document.createElement('p');
 let finish!: () => void;
 mountDeliveryButton(button, feedback, () => new Promise<void>((resolve) => { finish = resolve; }));
 button.click(); expect(button.disabled).toBe(true); expect(button.getAttribute('aria-busy')).toBe('true');
 finish(); await Promise.resolve();
 expect(button.disabled).toBe(false); expect(feedback.textContent).toBe('Entrega confirmada');
});
test('error recuperable y limpieza del listener', async () => {
 const button = document.createElement('button'); const feedback = document.createElement('p');
 const cleanup = mountDeliveryButton(button, feedback, async () => { throw new Error('sin red'); });
 button.click(); await Promise.resolve(); expect(feedback.textContent).toContain('No se pudo');
 cleanup(); feedback.textContent = ''; button.click(); expect(feedback.textContent).toBe('');
});
