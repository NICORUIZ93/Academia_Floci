// Objetos, prototipos y clases (Módulo 3): la sintaxis `class` es azúcar sintáctico
// sobre el mismo mecanismo de prototype chain que existía antes de ES6.
// Ejecutar: node prototypes-classes.js

// --- Con prototypes directamente (cómo funciona `class` por debajo) ---
function AnimalPrototipo(nombre) {
  this.nombre = nombre;
}
AnimalPrototipo.prototype.saludar = function () {
  return `Soy ${this.nombre}`;
};

const perro = new AnimalPrototipo('Rex');
console.log(perro.saludar());
// perro no tiene su propio método saludar; JavaScript lo busca subiendo la
// cadena de prototipos: perro -> AnimalPrototipo.prototype -> Object.prototype.
console.log(Object.getPrototypeOf(perro) === AnimalPrototipo.prototype); // true

// --- Con class (mismo mecanismo, sintaxis más clara) ---
class Animal {
  #energia = 100; // campo privado — inaccesible desde fuera de la clase, ni con acceso directo

  constructor(nombre) {
    this.nombre = nombre;
  }

  saludar() {
    return `Soy ${this.nombre}, energía: ${this.#energia}`;
  }

  get estaCansado() {
    return this.#energia < 20;
  }
}

class Gato extends Animal {
  saludar() {
    // super.saludar() llama explícitamente al método de la clase padre —
    // sin esto, se sobrescribiría por completo en vez de extenderlo.
    return `${super.saludar()} (miau)`;
  }
}

const gato = new Gato('Michi');
console.log(gato.saludar());
console.log(gato instanceof Animal); // true — Gato hereda de Animal en la cadena de prototipos
