# Módulo 5: Formularios reactivos y template-driven

## Sílabo

**Objetivo general**

Validar entradas de usuario de forma predecible y testeable usando Reactive Forms, incluyendo validadores síncronos y asíncronos, formularios anidados y dinámicos, y entender cuándo template-driven forms sigue siendo una opción válida.

**Objetivos específicos**

1. Construir un `FormGroup` con `FormControl` y validadores síncronos.
2. Mostrar mensajes de error específicos según qué validador falló.
3. Implementar un validador asíncrono.
4. Construir un `FormArray` para campos dinámicos.
5. Explicar cuándo template-driven forms sigue siendo razonable frente a Reactive Forms.

**Contenido**

- Reactive Forms: `FormGroup`, `FormControl`, `FormArray`.
- Validadores síncronos y asíncronos.
- Formularios anidados y dinámicos.
- Template-driven forms: cuándo siguen siendo válidos.

**Evaluación**

Un formulario multi-paso con validación reactiva y mensajes de error claros, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Reactive Forms — FormGroup y FormControl

**Conceptos clave:** modelo de formulario explícito en TypeScript, validadores declarativos.

Reactive Forms modela la estructura completa de un formulario explícitamente en código TypeScript, mediante instancias de `FormGroup` (que agrupa múltiples controles relacionados) y `FormControl` (que representa un campo individual, con su valor actual y su estado de validación): `new FormGroup({nombre: new FormControl("", [Validators.required]), email: new FormControl("", [Validators.required, Validators.email])})` define un formulario con dos campos, cada uno con sus propios validadores declarados explícitamente como un array de funciones validadoras aplicadas en conjunto.

Esta definición explícita en TypeScript (en contraste con el enfoque template-driven del Tema 4, donde la estructura del formulario se infiere implícitamente a partir de directivas colocadas directamente en la plantilla HTML) es precisamente lo que hace a Reactive Forms más fácil de testear: el formulario completo, con su estado y sus validadores, existe como un objeto TypeScript normal, invocable y verificable directamente en una prueba unitaria sin necesidad de renderizar ningún template HTML real ni de simular interacción del usuario a través del DOM, exactamente el mismo tipo de ventaja de testabilidad que los guards funcionales del Módulo 4 obtienen por ser funciones simples en vez de clases con dependencias más complejas de simular.

El template HTML de un formulario reactivo simplemente enlaza cada elemento visual con su `FormControl` correspondiente mediante la directiva `[formControl]`, y consulta el estado de validación de ese control específico (`form.controls.email.errors?.["email"]`) para decidir qué mensaje de error mostrar, si acaso, según cuál validador específico falló exactamente. Mostrar mensajes de error específicos por tipo de validador fallido (en vez de un mensaje genérico único como "campo inválido") es una práctica de experiencia de usuario importante: un usuario que ve específicamente "el formato del email no es válido" puede corregir su error mucho más rápido que uno que solo ve "hay un error en este campo" sin ninguna indicación de cuál es el problema exacto.

**Analogía:** Reactive Forms es como diseñar el plano arquitectónico completo de un formulario antes de construirlo físicamente, especificando exactamente cada campo y cada regla de validación en un documento formal verificable independientemente de la construcción física real; template-driven forms es como construir directamente sobre la marcha, inferiendo la estructura a partir de las decisiones tomadas directamente en el sitio de construcción (la plantilla HTML), sin un plano formal separado y explícito previo.

**¿Por qué es importante?** La definición explícita de Reactive Forms en TypeScript es lo que permite testear formularios completos sin renderizar HTML real, y mostrar mensajes de error específicos según el validador exacto que falló mejora significativamente la experiencia de corrección del usuario.

**Diagrama:**

```ts
form = new FormGroup({
  nombre: new FormControl('', [Validators.required]),
  email: new FormControl('', [Validators.required, Validators.email]),
});
```
```html
<input [formControl]="form.controls.email" />
@if (form.controls.email.errors?.['email']) {
  <span class="error">Email inválido</span>
}
```

### Tema 2: Validadores asíncronos

**Conceptos clave:** `AsyncValidatorFn`, validación contra un servicio externo.

Un validador asíncrono verifica una condición que requiere consultar una fuente externa (típicamente el servidor, mediante una petición HTTP), como verificar si un email ya está registrado en el sistema antes de permitir continuar un formulario de registro, una validación que no puede resolverse instantáneamente y de forma síncrona como los validadores del Tema 1 (`Validators.required`, que puede evaluarse inmediatamente sin ninguna espera). Un `AsyncValidatorFn` recibe el control a validar y devuelve un Observable (o una Promesa) que eventualmente emite `null` (si la validación pasa) o un objeto de error (si falla), integrándose con el mismo mecanismo de reporte de errores que los validadores síncronos, de modo que la plantilla puede consultar `form.controls.email.errors?.["emailOcupado"]` exactamente con la misma sintaxis usada para errores de validadores síncronos.

Angular gestiona automáticamente el estado `pending` del control mientras el validador asíncrono está en curso (mientras espera la respuesta de la petición HTTP), permitiendo mostrar un indicador visual de "verificando..." mientras la validación asíncrona todavía no ha resuelto, y solo marcando el control como definitivamente válido o inválido una vez que la respuesta llega. Es importante que un validador asíncrono que dispara una petición HTTP incluya debounce (Módulo 6 del track de JavaScript, y RxJS en el Módulo 6 de este track) para no disparar una petición nueva en cada tecla presionada mientras el usuario aún está escribiendo el valor a validar, evitando saturar innecesariamente el servidor con peticiones de validación disparadas prematuramente antes de que el usuario termine de escribir.

Combinar validadores síncronos y asíncronos en el mismo control es común y natural: los validadores síncronos (como `Validators.required` y `Validators.email`) se evalúan primero y de forma inmediata; solo si todos los validadores síncronos pasan, Angular procede a evaluar los validadores asíncronos, evitando disparar innecesariamente una petición de red costosa para verificar la disponibilidad de un email que, de entrada, ni siquiera tiene un formato válido de email según los validadores síncronos más baratos de evaluar.

**Analogía:** un validador síncrono es como verificar instantáneamente si un formulario está completo y con el formato correcto simplemente mirándolo; un validador asíncrono es como tener que llamar por teléfono a una oficina externa para confirmar un dato específico antes de poder aprobar completamente el formulario, un proceso que naturalmente toma más tiempo y durante el cual el formulario permanece en un estado de "verificación pendiente".

**¿Por qué es importante?** Los validadores asíncronos permiten verificaciones contra fuentes externas (como disponibilidad de un email) integradas transparentemente con el mismo mecanismo de reporte de errores que los validadores síncronos, siempre que se combinen apropiadamente con debounce para evitar peticiones excesivas.

**Diagrama:**

```ts
function emailDisponibleValidator(servicio: UsuariosService): AsyncValidatorFn {
  return (control) => servicio.emailExiste(control.value).pipe(
    map(existe => existe ? { emailOcupado: true } : null)
  );
}
new FormControl('', { asyncValidators: [emailDisponibleValidator(servicio)] });
```

### Tema 3: FormArray para campos dinámicos

**Conceptos clave:** número variable de controles, agregar/quitar dinámicamente.

`FormArray` representa una lista de controles cuyo número puede cambiar dinámicamente en tiempo de ejecución, apropiado para casos como agregar múltiples números de teléfono de contacto a un formulario, donde el número exacto de campos necesarios no se conoce de antemano y el usuario debe poder agregar o quitar entradas según necesite. `new FormArray([new FormControl("")])` inicializa el array con un único control, y `(form.controls.telefonos as FormArray).push(new FormControl(""))` agrega dinámicamente un nuevo control vacío al final del array cada vez que el usuario solicita agregar otro campo, con la plantilla iterando sobre los controles del `FormArray` (usando `@for`, Módulo 1) para renderizar dinámicamente un input por cada control presente en el array en cualquier momento dado.

Cada control individual dentro de un `FormArray` puede tener sus propios validadores independientes, exactamente igual que cualquier `FormControl` normal, permitiendo validar cada teléfono agregado dinámicamente de forma independiente (por ejemplo, verificando que cada uno cumple un formato válido de número telefónico), y el `FormArray` en su conjunto también puede tener validadores propios que operen sobre el array completo (como verificar que al menos un teléfono fue proporcionado, no permitiendo un array completamente vacío).

Este patrón de formularios dinámicos con `FormArray` es un ejemplo concreto de un caso donde Reactive Forms ofrece una ventaja clara y difícil de replicar con la misma robustez usando template-driven forms: gestionar programáticamente un número variable de controles con sus propios estados de validación individuales es considerablemente más natural expresado como una estructura de datos TypeScript (un array de `FormControl`) que mediante directivas de plantilla intentando replicar la misma dinámica de forma declarativa en el HTML.

**Analogía:** un `FormArray` es como una lista de contactos de emergencia que un formulario permite expandir o contraer según sea necesario, donde cada contacto agregado tiene sus propios campos de validación independientes (nombre válido, teléfono con formato correcto), y la lista completa puede además tener su propia regla general (por ejemplo, requerir al menos un contacto).

**¿Por qué es importante?** `FormArray` es la herramienta correcta para campos de formulario cuyo número exacto no se conoce de antemano y debe poder crecer o reducirse dinámicamente según la interacción del usuario, con validación independiente por cada entrada y validación agregada sobre el conjunto completo.

**Diagrama:**

```ts
form = new FormGroup({ telefonos: new FormArray([new FormControl('')]) });
agregarTelefono() {
  (this.form.controls.telefonos as FormArray).push(new FormControl(''));
}
```

### Tema 4: Template-driven forms — cuándo siguen siendo válidos

**Conceptos clave:** `ngModel`, simplicidad para casos triviales, límites de escalabilidad.

Template-driven forms, basado en la directiva `ngModel` colocada directamente sobre elementos del template, infiere la estructura del formulario implícitamente a partir de las directivas presentes en el HTML, en vez de definirla explícitamente en TypeScript como Reactive Forms. Para un formulario extremadamente simple (un único campo de búsqueda, o un interruptor de encendido/apagado sin ninguna validación cruzada entre campos), `ngModel` puede escribirse más rápidamente, con menos código repetitivo que declarar explícitamente un `FormControl` completo para un caso tan trivial que apenas necesita gestión de estado o validación real.

Sin embargo, para cualquier formulario con requisitos más allá de lo más trivial —validación cruzada entre múltiples campos (como confirmar que dos campos de contraseña coinciden entre sí), arrays dinámicos de campos (Tema 3), o cualquier necesidad seria de testing automatizado del comportamiento del formulario sin depender de renderizar y manipular el DOM real— Reactive Forms es consistentemente la opción más predecible y mantenible, precisamente por tener su estructura completa definida explícitamente como un objeto TypeScript verificable e inspeccionable directamente, sin depender de inferir su comportamiento a partir de directivas dispersas en una plantilla HTML.

La recomendación práctica, y la que la mayoría de equipos de Angular experimentados adoptan consistentemente, es usar Reactive Forms como opción por defecto para prácticamente cualquier formulario de una aplicación real, reservando template-driven forms exclusivamente para los casos más triviales y aislados donde la sobrecarga adicional de definir un `FormGroup` completo genuinamente no se justifica frente a la simplicidad de un `ngModel` directo, una decisión que conviene tomar conscientemente caso por caso, no por defecto automático hacia uno u otro enfoque sin considerar los requisitos reales del formulario específico.

**Analogía:** template-driven forms es como escribir una nota rápida a mano para un recordatorio simple y de un solo propósito; Reactive Forms es como redactar un contrato formal completo con cláusulas explícitas y verificables independientemente, apropiado cuando las consecuencias de un error o la complejidad de las condiciones involucradas justifican la formalidad adicional del documento completo.

**¿Por qué es importante?** Elegir conscientemente entre Reactive Forms y template-driven forms según la complejidad real del formulario (no por hábito automático) equilibra la simplicidad de `ngModel` para casos triviales con la robustez y testabilidad de Reactive Forms para cualquier cosa más allá de lo más simple.

**Diagrama:**

```html
<!-- template-driven: apropiado solo para casos muy simples -->
<input [(ngModel)]="busqueda" />
```
```
Reactive Forms: estructura explícita en TypeScript, testeable sin DOM,
                 apropiado para validación cruzada, arrays dinámicos, testing serio
```

---

## Criterio transversal de calidad del código

Aplica estas decisiones en todos los ejemplos y en tu entrega:

- usa nombres que expresen intención, dominio y unidades; evita `data`, `temp`, `manager` o `process` cuando exista un término preciso;
- mantén funciones, componentes, clases, consultas y módulos cohesionados alrededor de una responsabilidad comprobable;
- haz visibles las dependencias y los efectos de red, tiempo, archivos, estado y base de datos;
- valida entradas en la frontera y representa errores con contexto, sin ocultar la causa ni registrar secretos;
- elimina duplicación de reglas, no toda repetición textual; una abstracción incorrecta cuesta más que dos líneas parecidas;
- escribe primero la solución más simple que satisface el requisito y refactoriza con pruebas verdes;
- aplica SOLID únicamente cuando exista una necesidad real de cambio, extensión, sustitución o aislamiento.

**SOLID con criterio:** responsabilidad única significa una razón coherente de cambio, no una clase por función. Abierto/cerrado justifica estrategias cuando hay variantes reales. Sustitución exige respetar contratos. Segregación evita obligar a consumidores a depender de operaciones que no usan. Inversión de dependencias protege el dominio frente a detalles externos; no exige crear interfaces para cada objeto.

**Comprobación antes de continuar:** ¿otra persona puede entender los nombres y el flujo?, ¿los casos de error son observables?, ¿una prueba demuestra la regla principal?, ¿cada abstracción aporta más claridad de la que cuesta? Registra una decisión de refactorización y una decisión consciente de *no abstraer*.

## Laboratorio práctico

**Objetivo del laboratorio:** construir un formulario multi-paso con validación reactiva completa, incluyendo un validador asíncrono y un `FormArray` dinámico.

**Requisitos previos:** Módulos 0-4 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear el FormGroup base | Ver Tema 1: nombre, email, contraseña con validadores | Verifica cada validador individualmente |
| 2 | Mostrar mensajes de error específicos | Según qué validador falló | required vs email vs minlength distintos |
| 3 | Agregar un validador asíncrono | Ver Tema 2, simulado con delay | Verifica el estado `pending` mientras resuelve |
| 4 | Construir un FormArray de teléfonos | Ver Tema 3 | Agrega y quita dinámicamente |
| 5 | Implementar el mismo formulario simple con ngModel | Ver Tema 4 | Documenta cuándo seguirías esa opción |

**Verificación:** el laboratorio se considera exitoso si cada validador muestra su mensaje de error específico correspondiente, si el validador asíncrono correctamente marca el control como `pending` mientras verifica, y si el `FormArray` permite agregar y quitar teléfonos dinámicamente sin errores.

**Errores comunes y soluciones**

- **Mostrar un único mensaje de error genérico en vez de uno específico por validador.** Verifica el objeto `errors` específico de cada control para identificar exactamente cuál validador falló.
- **Disparar un validador asíncrono sin debounce.** Combina con `debounceTime` (Módulo 6) para no saturar el servidor con verificaciones en cada tecla presionada.
- **Usar template-driven forms para un formulario con validación cruzada compleja.** Migra a Reactive Forms para cualquier cosa más allá de lo más simple.

---

## Ejercicios de evaluación

### Ejercicio 1: Por qué Reactive Forms es más testeable

**Enunciado:** explica por qué Reactive Forms es más fácil de testear que template-driven forms.

**Solución esperada:** Reactive Forms define la estructura completa del formulario (controles, validadores) explícitamente como un objeto TypeScript, invocable y verificable directamente en una prueba unitaria sin necesidad de renderizar ningún HTML real; template-driven forms infiere su estructura a partir de directivas en la plantilla, requiriendo renderizar y manipular el DOM real para probar su comportamiento completo.

**Criterios de éxito:**
- Explica correctamente que la estructura explícita en TypeScript es lo que permite testing sin renderizar HTML.

### Ejercicio 2: Cuándo usar template-driven hoy

**Enunciado:** describe un escenario concreto donde seguirías usando template-driven forms hoy, y justifica por qué Reactive Forms sería exceso de ingeniería en ese caso.

**Solución esperada:** un ejemplo razonable: un único campo de búsqueda con `[(ngModel)]="textoBusqueda"`, sin ninguna validación real más allá de existir o no; declarar un `FormGroup` completo con un único `FormControl` para este caso sería una sobrecarga innecesaria de código repetitivo frente a la simplicidad directa de `ngModel` para un caso tan trivial.

**Criterios de éxito:**
- Da un escenario genuinamente trivial y justifica correctamente por qué Reactive Forms sería sobrecarga innecesaria ahí.

### Ejercicio 3: Diseñar un validador de confirmación de contraseña

**Enunciado:** diseña un validador (a nivel de `FormGroup`, no de un control individual) que verifique que los campos `contraseña` y `confirmarContraseña` de un formulario coinciden.

**Solución esperada:**
```ts
function contraseñasCoincidenValidator(grupo: AbstractControl): ValidationErrors | null {
  const contraseña = grupo.get('contraseña')?.value;
  const confirmar = grupo.get('confirmarContraseña')?.value;
  return contraseña === confirmar ? null : { contraseñasNoCoinciden: true };
}
// aplicado como segundo argumento del FormGroup: new FormGroup({...}, { validators: contraseñasCoincidenValidator })
```

**Criterios de éxito:**
- El validador se aplica a nivel de grupo (no de un control individual), porque necesita comparar dos campos entre sí.
- Devuelve `null` si coinciden, o un objeto de error específico si no.

---

## Rúbrica del proyecto

Esta rúbrica evalúa el laboratorio y los ejercicios como evidencia de dominio, no la mera finalización de pasos.

| Criterio | Peso | Evidencia esperada |
|---|---:|---|
| Comprensión conceptual | 20% | Explica el mecanismo, sus límites y por qué la solución funciona. |
| Implementación funcional | 30% | El artefacto satisface requisitos normales, límite y de error. |
| Verificación | 20% | Incluye pruebas, mediciones o inspecciones reproducibles. |
| Diseño y calidad | 15% | Nombres, estructura, seguridad y mantenibilidad son deliberados. |
| Comunicación profesional | 15% | README, decisiones, comandos y resultados permiten repetir el trabajo. |

Se alcanza competencia con 70/100 y sin cero en implementación o verificación. El nivel experto exige comparar alternativas, justificar trade-offs y reconocer condiciones donde la solución dejaría de ser válida.

## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- Google, *Angular Documentation* y guías oficiales de accesibilidad, seguridad y rendimiento.
- ReactiveX, *RxJS Documentation*.
- W3C, *Web Content Accessibility Guidelines (WCAG)*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Reactive Forms define la estructura completa del formulario explícitamente en TypeScript, haciéndolo más testeable que template-driven forms.
- Los validadores asíncronos verifican condiciones contra fuentes externas, integrándose con el mismo mecanismo de errores que los validadores síncronos.
- `FormArray` gestiona un número variable de controles dinámicos, cada uno con su propia validación independiente.
- Template-driven forms sigue siendo razonable para formularios genuinamente triviales sin validación cruzada ni necesidad seria de testing.

**Conceptos aprendidos**

- Construcción de formularios con `FormGroup` y `FormControl`.
- Validadores síncronos y asíncronos, y mensajes de error específicos.
- `FormArray` para campos dinámicos.
- Cuándo elegir template-driven forms frente a Reactive Forms.

**Próximos pasos**

En el Módulo 6 aprenderás RxJS esencial para Angular: operadores clave, manejo correcto de suscripciones, y el puente entre Observables y signals.

**Recursos adicionales**

- Documentación oficial de Angular: "Reactive forms" y "Form validation".
