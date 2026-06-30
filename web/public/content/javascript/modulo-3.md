## Prototipos: la base real de los objetos

Cada objeto en JavaScript tiene un enlace interno a otro objeto, su prototipo, del que hereda propiedades y métodos. `class` es azúcar sintáctica sobre este mecanismo.

```js
const animalProto = { hablar() { return `${this.nombre} hace un sonido`; } };
const perro = Object.create(animalProto);
perro.nombre = "Rex";
perro.hablar(); // "Rex hace un sonido" — heredado, no copiado
```

## class, extends y super

```js
class Animal {
  constructor(nombre) { this.nombre = nombre; }
  hablar() { return `${this.nombre} hace un sonido`; }
}

class Perro extends Animal {
  hablar() { return `${super.hablar()} — ¡y ladra!`; }
}

new Perro("Rex").hablar(); // "Rex hace un sonido — ¡y ladra!"
```

## Getters, setters y campos privados

```js
class CuentaBancaria {
  #saldo = 0; // campo privado real: inaccesible fuera de la clase, ni con bracket notation

  depositar(monto) {
    if (monto <= 0) throw new Error("Monto inválido");
    this.#saldo += monto;
  }

  get saldo() { return this.#saldo; }
}

const cuenta = new CuentaBancaria();
cuenta.depositar(100);
cuenta.saldo; // 100
// cuenta.#saldo; // SyntaxError fuera de la clase
```

A diferencia de la convención `_saldo` (solo una señal visual), `#saldo` es encapsulación real impuesta por el motor de JavaScript.
