export function mountDeliveryButton(button: HTMLButtonElement, feedback: HTMLElement,
  confirmDelivery: () => Promise<void>) {
  const onClick = async () => {
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    feedback.textContent = 'Confirmando entrega…';
    try {
      await confirmDelivery();
      feedback.textContent = 'Entrega confirmada';
    } catch { feedback.textContent = 'No se pudo confirmar. Intenta nuevamente.'; }
    finally { button.disabled = false; button.removeAttribute('aria-busy'); }
  };
  button.addEventListener('click', onClick);
  return () => button.removeEventListener('click', onClick);
}
