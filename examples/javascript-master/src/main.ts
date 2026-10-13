import { startRoute } from './route-client';
import { mountDeliveryButton } from './ui/delivery-button';
import { iniciarUbicacion } from './location/watch-location.js';
import { loadDraft, saveDraft } from './storage/delivery-draft.js';
import { connectTracking } from './realtime/tracking-socket.js';
import './pwa/register-service-worker.js';
const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const route = startRoute((message) => { element('distance').textContent = message; });
const unmountButton = mountDeliveryButton(element<HTMLButtonElement>('confirm-delivery'), element('delivery-feedback'),
  () => new Promise<void>((resolve) => setTimeout(resolve, 300)));
element('map').onclick = async () => {
  await import('maplibre-gl'); element('map-state').textContent = 'Biblioteca cargada';
};
let stopLocation = () => {};
element('locate').onclick = () => {
  stopLocation();
  stopLocation = iniciarUbicacion({
    onPosition: (position: unknown) => { element('location').textContent = JSON.stringify(position); },
    onError: (error: GeolocationPositionError) => { element('location').textContent = `No disponible: ${error.message}. Usa entrada manual.`; }
  });
};
const draft = element<HTMLInputElement>('draft');
draft.value = loadDraft()?.text ?? '';
element('save').onclick = () => saveDraft({ text: draft.value });
let disconnect = () => {};
element('socket').onclick = () => {
  disconnect();
  disconnect = connectTracking('ws://127.0.0.1:8080', {
    onEvent: (event: unknown) => { element('events').textContent = JSON.stringify(event); },
    onState: (state: string) => { element('events').textContent = state; }
  });
};
element('disconnect').onclick = () => disconnect();
window.addEventListener('pagehide', () => { route.destroy(); unmountButton(); stopLocation(); disconnect(); });
