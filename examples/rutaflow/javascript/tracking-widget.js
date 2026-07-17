export function renderTracking(container, shipment) {
  if (!(container instanceof HTMLElement)) throw new TypeError('container must be an HTMLElement');
  if (!shipment?.publicCode || !shipment?.statusLabel) throw new TypeError('invalid public shipment');

  const article = document.createElement('article');
  article.setAttribute('aria-live', 'polite');

  const heading = document.createElement('h2');
  heading.textContent = `Envío ${shipment.publicCode}`;

  const status = document.createElement('p');
  status.textContent = shipment.statusLabel;

  const updatedAt = document.createElement('time');
  updatedAt.dateTime = shipment.updatedAt;
  updatedAt.textContent = new Intl.DateTimeFormat('es', {
    dateStyle: 'medium', timeStyle: 'short',
  }).format(new Date(shipment.updatedAt));

  article.replaceChildren(heading, status, updatedAt);
  container.replaceChildren(article);
}
