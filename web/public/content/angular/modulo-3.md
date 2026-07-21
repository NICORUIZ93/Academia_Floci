# Módulo 3: Servicios e inyección de dependencias


## Aprende construyendo

### Tema 1: @Injectable y providedIn: root

#### Paso 1 · Objetivo y preparación
Al finalizar podrás diseñar una dependencia Angular desde cero. Prerrequisitos: Node.js LTS, npm y Angular CLI. Verifica node --version y ng version.

#### Paso 2 · Contexto y caso real
En un caso real, un componente necesita un servicio de entregas y una implementación distinta en pruebas; el inyector debe resolverla de forma explícita.

#### Paso 3 · Teoría, modelo mental y analogía
@Injectable declara cómo construir un servicio; providedIn controla alcance; inject() y constructor expresan dependencias. La jerarquía permite overrides y tokens desacoplan interfaces de clases concretas. La analogía es una central de suministros: cada sucursal recibe el recurso correcto según su ámbito.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-angular-m3
cd ejemplo-angular-m3
npx -p @angular/cli ng new app --standalone --routing=false --style=css --skip-git
cd app
ng serve
```
Crea src/app/delivery.service.ts con @Injectable y un token DELIVERY_API; inyéctalo en un componente y muestra el valor.

#### Paso 5 · Práctica guiada
Pista: elimina deliberadamente el provider para provocar un fallo deliberado NullInjectorError; lee el diagnóstico y registra el token faltante. Resultado esperado: componente renderizado con provider válido.

#### Paso 6 · Práctica independiente
Define un mock para pruebas, un provider local de componente y una prueba que demuestre qué instancia se resuelve en cada nivel.

#### Paso 7 · Cierre y evidencia
Guarda árbol, código, error y captura; como siguiente paso estudia HttpClient. Errores comunes: servicios con estado global accidental, providers duplicados, tokens sin valor y depender del orden de bootstrap. Fuentes oficiales: https://angular.dev/guide/di y https://angular.dev/guide/di/dependency-injection-providers.
**¿Por qué es importante?** Porque una inyección explícita permite sustituir dependencias y probar componentes sin infraestructura real.
**Evidencia de aprendizaje:** entrega provider, token, error y prueba de override.
**Conceptos clave:** servicio singleton de aplicación, registro automático.

#### Qué significa `@` aquí: decoradores y metadatos de Angular

`@Injectable(...)` no es una llamada que se ejecute cada vez que se crea el servicio. Es un **decorador de clase**: adjunta metadatos a `TareasService` para que las herramientas de Angular sepan cómo incluirlo en el sistema de inyección. El compilador de Angular procesa esos metadatos durante la compilación y genera las definiciones que el inyector utilizará en ejecución. El objeto `{ providedIn: "root" }` es configuración del decorador; `root` indica en qué inyector debe registrarse la fábrica del servicio.

La misma sintaxis aparece en `@Component`, pero el consumidor y el contrato son distintos: allí Angular lee selector, plantilla, estilos, imports y providers para generar una definición de componente. Por eso no basta con memorizar «`@` crea algo»: hay que leer el nombre del decorador, sobre qué declaración está colocado y qué opciones admite. TypeScript valida la sintaxis; Angular interpreta el significado específico.

**Límite y diagnóstico:** decorar una clase no convierte cualquier método en inyectable ni permite llamar `inject()` desde cualquier función. `inject()` necesita un contexto de inyección activo; fuera de él Angular produce `NG0203`. Tampoco conviene registrar en `root` un estado que deba reiniciarse por ruta: en ese caso se usa un proveedor de ruta o componente y se acepta deliberadamente una instancia de menor alcance.

`@Injectable({providedIn: "root"})` es la forma estándar y recomendada de declarar un servicio en Angular moderno: registra automáticamente el servicio en el inyector raíz de la aplicación, garantizando que exista una única instancia compartida (un singleton) durante toda la vida de la aplicación, sin necesidad de declararlo explícitamente en ningún array de `providers` en ningún lugar adicional del código. Cualquier componente o servicio que inyecte ese mismo servicio recibirá exactamente la misma instancia, permitiendo compartir estado (típicamente modelado con signals, como en el `TareasService` con un signal de tareas compartido) entre cualquier número de componentes de la aplicación sin necesidad de pasar ese estado manualmente a través de inputs y outputs entre componentes intermedios que no lo necesitan directamente para sí mismos.

Esta forma de registro (`providedIn: "root"`) tiene una ventaja adicional de tree-shaking (recordando el concepto estudiado en el Módulo 7 del track de JavaScript): si un servicio registrado de esta forma nunca se inyecta realmente en ninguna parte de la aplicación, el bundler puede eliminarlo completamente del bundle final, algo que no sería posible con la forma anterior de registro explícito en un array `providers` de un módulo, que forzaba la inclusión del servicio en el bundle independientemente de si efectivamente se usaba o no en cualquier parte del código.

Un servicio con `providedIn: "root"` es el patrón por defecto y correcto para la gran mayoría de servicios de una aplicación: estado compartido de la aplicación, clientes HTTP hacia una API específica, servicios de utilidad usados ampliamente. Solo se necesita un patrón de registro distinto (Tema 3) cuando se requiere deliberadamente una instancia distinta del servicio para un subconjunto específico de la aplicación (por ejemplo, un servicio de estado que debería reiniciarse en cada navegación hacia una ruta específica, en vez de persistir durante toda la sesión de la aplicación).

**Analogía:** un servicio con `providedIn: "root"` es como el departamento central de recursos humanos de una empresa completa: existe una única instancia compartida por toda la organización, y cualquier departamento que necesite consultarlo accede exactamente al mismo departamento central, sin que cada departamento individual necesite mantener su propia copia independiente y potencialmente desincronizada de esa misma información.

**¿Por qué es importante?** `providedIn: "root"` es la forma estándar de registrar un servicio como singleton de aplicación con beneficios de tree-shaking, y es el patrón correcto por defecto para la gran mayoría de servicios que comparten estado o lógica entre múltiples partes de una aplicación.

**Código del ejemplo:**

```ts
@Injectable({ providedIn: 'root' }) // singleton de toda la app, tree-shakeable
export class TareasService {
  private tareas = signal<Tarea[]>([]);
  readonly lista = this.tareas.asReadonly();
  agregar(tarea: Tarea) { this.tareas.update(l => [...l, tarea]); }
}
```

### Tema 2: inject() frente a inyección por constructor

#### Paso 1 · Objetivo y preparación
Al finalizar podrás diseñar una dependencia Angular desde cero. Prerrequisitos: Node.js LTS, npm y Angular CLI. Verifica node --version y ng version.

#### Paso 2 · Contexto y caso real
En un caso real, un componente necesita un servicio de entregas y una implementación distinta en pruebas; el inyector debe resolverla de forma explícita.

#### Paso 3 · Teoría, modelo mental y analogía
@Injectable declara cómo construir un servicio; providedIn controla alcance; inject() y constructor expresan dependencias. La jerarquía permite overrides y tokens desacoplan interfaces de clases concretas. La analogía es una central de suministros: cada sucursal recibe el recurso correcto según su ámbito.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-angular-m3
cd ejemplo-angular-m3
npx -p @angular/cli ng new app --standalone --routing=false --style=css --skip-git
cd app
ng serve
```
Crea src/app/delivery.service.ts con @Injectable y un token DELIVERY_API; inyéctalo en un componente y muestra el valor.

#### Paso 5 · Práctica guiada
Pista: elimina deliberadamente el provider para provocar un fallo deliberado NullInjectorError; lee el diagnóstico y registra el token faltante. Resultado esperado: componente renderizado con provider válido.

#### Paso 6 · Práctica independiente
Define un mock para pruebas, un provider local de componente y una prueba que demuestre qué instancia se resuelve en cada nivel.

#### Paso 7 · Cierre y evidencia
Guarda árbol, código, error y captura; como siguiente paso estudia HttpClient. Errores comunes: servicios con estado global accidental, providers duplicados, tokens sin valor y depender del orden de bootstrap. Fuentes oficiales: https://angular.dev/guide/di y https://angular.dev/guide/di/dependency-injection-providers.
**¿Por qué es importante?** Porque una inyección explícita permite sustituir dependencias y probar componentes sin infraestructura real.
**Evidencia de aprendizaje:** entrega provider, token, error y prueba de override.
**Conceptos clave:** función de inyección moderna, contexto de inyección.

`inject()`, invocada dentro del cuerpo de la clase de un componente o servicio (típicamente asignada directamente a una propiedad de clase: `private servicio = inject(TareasService);`), es la forma moderna y recomendada de obtener una instancia inyectada, reemplazando la inyección tradicional por parámetros del constructor (`constructor(private servicio: TareasService) {}`). Ambas formas producen exactamente el mismo resultado funcional (la misma instancia inyectada, según la misma jerarquía de inyectores del Tema 3), pero `inject()` ofrece ventajas prácticas de ergonomía: permite inyectar dependencias en cualquier punto donde exista un "contexto de inyección" válido (no solo en el constructor de una clase), incluyendo dentro de guards funcionales y interceptores funcionales (estudiados en los Módulos 4 y 7 respectivamente), que son simples funciones sin ninguna clase ni constructor donde colocar parámetros inyectados de la forma tradicional.

`inject()` también simplifica la herencia de clases: una clase base que necesita ciertas dependencias inyectadas ya no requiere que cada clase hija que la extienda declare y repase manualmente esos mismos parámetros en su propio constructor únicamente para pasarlos a `super()`, un patrón considerablemente más verboso con inyección por constructor tradicional. Con `inject()`, la clase base simplemente invoca `inject()` directamente donde lo necesita, sin ninguna necesidad de que las clases hijas se preocupen por replicar esa configuración de constructor.

La elección entre ambas formas, para el caso común de inyectar dependencias directamente en un componente o servicio normal (no en guards o interceptores funcionales, donde `inject()` es la única opción viable), es en gran medida una cuestión de estilo del equipo, aunque la tendencia clara del ecosistema Angular moderno favorece `inject()` de forma consistente, en parte precisamente porque es la única forma viable en los contextos funcionales que Angular moderno favorece cada vez más (guards, interceptores, resolvers funcionales).

**Analogía:** la inyección por constructor es como recibir todas tus herramientas de trabajo exclusivamente en el momento formal de tu contratación, empaquetadas todas juntas en un único punto de entrada; `inject()` es como poder solicitar cada herramienta específica exactamente en el momento y lugar donde la necesitas dentro de tu jornada laboral, sin estar limitado a recibirlas todas únicamente en ese único momento inicial formal.

**¿Por qué es importante?** `inject()` es más flexible que la inyección por constructor, siendo la única opción viable en contextos funcionales modernos (guards, interceptores) y simplificando la herencia de clases, razones por las que el ecosistema Angular moderno la favorece consistentemente.

**Código del ejemplo:**

```ts
@Component({ /* ... */ })
export class ListaTareas {
  private servicio = inject(TareasService); // más conciso, funciona en cualquier contexto de inyección
  tareas = this.servicio.lista;
}
```

### Tema 3: Jerarquía de inyectores

#### Paso 1 · Objetivo y preparación
Al finalizar podrás diseñar una dependencia Angular desde cero. Prerrequisitos: Node.js LTS, npm y Angular CLI. Verifica node --version y ng version.

#### Paso 2 · Contexto y caso real
En un caso real, un componente necesita un servicio de entregas y una implementación distinta en pruebas; el inyector debe resolverla de forma explícita.

#### Paso 3 · Teoría, modelo mental y analogía
@Injectable declara cómo construir un servicio; providedIn controla alcance; inject() y constructor expresan dependencias. La jerarquía permite overrides y tokens desacoplan interfaces de clases concretas. La analogía es una central de suministros: cada sucursal recibe el recurso correcto según su ámbito.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-angular-m3
cd ejemplo-angular-m3
npx -p @angular/cli ng new app --standalone --routing=false --style=css --skip-git
cd app
ng serve
```
Crea src/app/delivery.service.ts con @Injectable y un token DELIVERY_API; inyéctalo en un componente y muestra el valor.

#### Paso 5 · Práctica guiada
Pista: elimina deliberadamente el provider para provocar un fallo deliberado NullInjectorError; lee el diagnóstico y registra el token faltante. Resultado esperado: componente renderizado con provider válido.

#### Paso 6 · Práctica independiente
Define un mock para pruebas, un provider local de componente y una prueba que demuestre qué instancia se resuelve en cada nivel.

#### Paso 7 · Cierre y evidencia
Guarda árbol, código, error y captura; como siguiente paso estudia HttpClient. Errores comunes: servicios con estado global accidental, providers duplicados, tokens sin valor y depender del orden de bootstrap. Fuentes oficiales: https://angular.dev/guide/di y https://angular.dev/guide/di/dependency-injection-providers.
**¿Por qué es importante?** Porque una inyección explícita permite sustituir dependencias y probar componentes sin infraestructura real.
**Evidencia de aprendizaje:** entrega provider, token, error y prueba de override.
**Conceptos clave:** inyector raíz, inyector de ruta, inyector de componente, resolución jerárquica.

Angular organiza los inyectores en una jerarquía de tres niveles principales: el inyector raíz (root), compartido por toda la aplicación; inyectores a nivel de ruta (cuando una `Route` específica declara su propio array `providers`); e inyectores a nivel de componente (cuando un `@Component` específico declara su propio array `providers`). Cuando un componente o servicio solicita una dependencia mediante `inject()`, Angular busca esa dependencia comenzando por el inyector más cercano al punto de solicitud, subiendo progresivamente por la jerarquía hasta encontrar un proveedor registrado, o hasta llegar al inyector raíz sin encontrarlo (lo que produce un error si la dependencia era obligatoria).

Un servicio provisto únicamente en el inyector raíz (`providedIn: "root"`, Tema 1) es un único singleton verdadero para toda la aplicación completa; el mismo servicio provisto en cambio en el array `providers` de una `Route` específica crea una instancia nueva e independiente cada vez que se navega hacia esa ruta (y esa instancia se destruye al navegar fuera de ella), un patrón útil deliberadamente para estado que debería reiniciarse limpio en cada visita a esa ruta específica, en vez de persistir acumulando estado de visitas anteriores. Un servicio provisto en el array `providers` de un `@Component` específico crea una instancia nueva por cada instancia de ese componente en la aplicación (si el componente se renderiza múltiples veces simultáneamente, cada una tiene su propia instancia independiente del servicio).

Si el mismo servicio se provee simultáneamente en múltiples niveles de la jerarquía (por ejemplo, en `root` y también en un componente específico), el nivel más cercano al punto de solicitud "gana": un componente que provee su propia instancia de un servicio, aunque ese mismo servicio también esté registrado globalmente en `root`, recibirá su propia instancia local específica de ese componente, no la instancia global compartida, precisamente porque Angular resuelve la dependencia comenzando desde el inyector más cercano antes de subir hacia niveles superiores de la jerarquía.

**Analogía:** la jerarquía de inyectores es como una cadena de mando organizacional: una solicitud de recursos se dirige primero al supervisor directo más cercano (inyector de componente); si ese supervisor no puede resolverla, se escala al gerente de departamento (inyector de ruta); y si tampoco puede, finalmente a la dirección general de toda la organización (inyector raíz). Si el supervisor directo ya tiene autoridad para resolver la solicitud por sí mismo, la resuelve ahí mismo sin necesidad de escalarla más arriba en la jerarquía.

**¿Por qué es importante?** Entender la jerarquía de inyectores explica por qué un servicio provisto a nivel de ruta o componente produce instancias independientes en vez del singleton global esperado, un comportamiento que sorprende a quien no conoce esta jerarquía y espera siempre una única instancia compartida.

**Diagrama:**

```
Root (toda la app, providedIn: 'root')
 └─ Ruta (providers: [...] en una Route específica)
     └─ Componente (providers: [...] en @Component específico)

Resolución: busca desde el más cercano al punto de inject(),
            sube por la jerarquía hasta encontrar un proveedor
```

### Tema 4: Tokens de inyección y decoradores de resolución

#### Paso 1 · Objetivo y preparación
Al finalizar podrás diseñar una dependencia Angular desde cero. Prerrequisitos: Node.js LTS, npm y Angular CLI. Verifica node --version y ng version.

#### Paso 2 · Contexto y caso real
En un caso real, un componente necesita un servicio de entregas y una implementación distinta en pruebas; el inyector debe resolverla de forma explícita.

#### Paso 3 · Teoría, modelo mental y analogía
@Injectable declara cómo construir un servicio; providedIn controla alcance; inject() y constructor expresan dependencias. La jerarquía permite overrides y tokens desacoplan interfaces de clases concretas. La analogía es una central de suministros: cada sucursal recibe el recurso correcto según su ámbito.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-angular-m3
cd ejemplo-angular-m3
npx -p @angular/cli ng new app --standalone --routing=false --style=css --skip-git
cd app
ng serve
```
Crea src/app/delivery.service.ts con @Injectable y un token DELIVERY_API; inyéctalo en un componente y muestra el valor.

#### Paso 5 · Práctica guiada
Pista: elimina deliberadamente el provider para provocar un fallo deliberado NullInjectorError; lee el diagnóstico y registra el token faltante. Resultado esperado: componente renderizado con provider válido.

#### Paso 6 · Práctica independiente
Define un mock para pruebas, un provider local de componente y una prueba que demuestre qué instancia se resuelve en cada nivel.

#### Paso 7 · Cierre y evidencia
Guarda árbol, código, error y captura; como siguiente paso estudia HttpClient. Errores comunes: servicios con estado global accidental, providers duplicados, tokens sin valor y depender del orden de bootstrap. Fuentes oficiales: https://angular.dev/guide/di y https://angular.dev/guide/di/dependency-injection-providers.
**¿Por qué es importante?** Porque una inyección explícita permite sustituir dependencias y probar componentes sin infraestructura real.
**Evidencia de aprendizaje:** entrega provider, token, error y prueba de override.
**Conceptos clave:** `InjectionToken`, `@Optional`, `@SkipSelf`, `@Self`, `@Host`.

Un `InjectionToken` permite inyectar valores que no son instancias de una clase (como un simple string de configuración, un objeto de configuración, o cualquier valor primitivo): `export const API_URL = new InjectionToken<string>("API_URL");` declara el token, y `{provide: API_URL, useValue: "https://api.miapp.com"}` en el array `providers` de la configuración de la aplicación (o de una ruta/componente específico) asocia un valor concreto a ese token, inyectable después con `inject(API_URL)` en cualquier punto donde se necesite ese valor de configuración, evitando hardcodear el valor directamente disperso en múltiples lugares del código, y facilitando sustituir ese valor por uno distinto en un contexto de pruebas (inyectando, por ejemplo, un valor simulado en vez del real durante tests).

`@Optional()` marca una dependencia como no obligatoria: si Angular no encuentra ningún proveedor para esa dependencia en la jerarquía completa de inyectores, inyecta `null` en vez de lanzar un error, apropiado cuando un componente o servicio puede funcionar razonablemente incluso sin esa dependencia específica disponible. `@SkipSelf()` fuerza a Angular a omitir el inyector local más cercano y buscar la dependencia empezando desde el siguiente nivel superior de la jerarquía, útil en patrones específicos donde un componente necesita explícitamente la instancia del padre en vez de la que él mismo pudiera estar proveyendo localmente. `@Self()` hace lo contrario: exige que la dependencia se resuelva exclusivamente en el inyector local del propio componente, sin subir en absoluto por la jerarquía, lanzando un error si no está disponible ahí mismo. `@Host()` limita la búsqueda hasta el componente "anfitrión" de una directiva, sin subir más allá de ese límite específico en la jerarquía de componentes.

Estos decoradores de resolución son herramientas relativamente especializadas, usadas con mayor frecuencia al escribir bibliotecas de componentes reutilizables o directivas complejas que necesitan un control preciso sobre exactamente en qué nivel de la jerarquía se resuelve una dependencia específica, más que en el código de aplicación cotidiano, donde la resolución jerárquica por defecto (sin ningún decorador adicional) es apropiada en la gran mayoría de los casos.

**Analogía:** un `InjectionToken` es como una etiqueta de identificación única para un tipo específico de recurso de configuración que no tiene una "clase" propia asociada, permitiendo registrar y solicitar ese recurso de forma inequívoca. `@SkipSelf`/`@Self`/`@Host` son como instrucciones específicas y explícitas sobre en qué nivel exacto de la cadena de mando debe resolverse una solicitud particular, en vez de seguir el protocolo jerárquico por defecto.

**¿Por qué es importante?** Los tokens de inyección personalizados permiten inyectar configuración y valores no basados en clases de forma desacoplada y testeable; los decoradores de resolución dan control preciso sobre en qué nivel exacto de la jerarquía se resuelve una dependencia, relevante especialmente al construir bibliotecas de componentes reutilizables.

**Código del ejemplo:**

```ts
export const API_URL = new InjectionToken<string>('API_URL');
// en la configuración de la app:
providers: [{ provide: API_URL, useValue: 'https://api.miapp.com' }]
// en cualquier servicio/componente:
private apiUrl = inject(API_URL);
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir un servicio de estado compartido consumido por múltiples componentes, explorando la jerarquía de inyectores y un token de inyección personalizado.

**Requisitos previos:** Módulos 0-2 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear `TareasService` con `providedIn: root` | Ver Tema 1 | Un signal de tareas compartido |
| 2 | Consumir el servicio desde 3 componentes | Usa `inject()` en cada uno | Verifica que todos comparten el mismo estado |
| 3 | Proveer el mismo servicio a nivel de ruta | Ver Tema 3 | Verifica que cada navegación crea una instancia distinta |
| 4 | Crear un `InjectionToken` de configuración | Ver Tema 4 | Inyecta `API_URL` en vez de hardcodearlo |
| 5 | Documentar la jerarquía de inyectores | Diagrama propio: root → ruta → componente | Explica con tus propias palabras cómo se resuelve una dependencia |

**Verificación:** el laboratorio se considera exitoso si los tres componentes reflejan correctamente el mismo estado compartido del servicio raíz, y si el mismo servicio provisto a nivel de ruta demuestra tener una instancia claramente distinta en cada navegación (verificable, por ejemplo, comparando referencias o un identificador único generado al crear cada instancia).

**Errores comunes y soluciones**

- **Esperar una única instancia global de un servicio provisto a nivel de ruta o componente.** Recuerda que el nivel de registro determina el alcance de esa instancia específica; usa `providedIn: root` para un singleton verdadero de toda la aplicación.
- **Hardcodear valores de configuración directamente en múltiples servicios.** Usa un `InjectionToken` centralizado para esa configuración, facilitando su sustitución en pruebas.
- **Usar `inject()` fuera de un contexto de inyección válido.** `inject()` solo funciona dentro del constructor, la inicialización de campos de clase, o dentro de funciones ejecutadas explícitamente dentro de un contexto de inyección (como guards e interceptores funcionales).

---
