import init, { route_score } from '../../wasm/pkg/route_score.js';
await init();
console.log(route_score(12.5, 2));
