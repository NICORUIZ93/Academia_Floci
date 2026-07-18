# Módulo 10: Seguridad en Node

## Sílabo

**Objetivo general**

Identificar y prevenir sistemáticamente los errores de seguridad más comunes en APIs Node: cabeceras inseguras, ausencia de rate limiting, inyección SQL y XSS, aplicando el OWASP API Security Top 10 como marco de referencia.

**Objetivos específicos**

1. Configurar cabeceras HTTP seguras con `helmet`.
2. Implementar rate limiting para prevenir abuso y ataques de fuerza bruta.
3. Prevenir inyección SQL mediante consultas parametrizadas.
4. Sanitizar entrada de usuario para prevenir XSS almacenado.
5. Auditar dependencias en busca de vulnerabilidades conocidas.

**Contenido**

- OWASP API Security Top 10.
- `helmet` y cabeceras seguras.
- Rate limiting.
- Validación y sanitización de entrada.

**Evaluación**

Una API con rate limiting, cabeceras seguras y validación estricta de entrada, más tres ejercicios de evaluación.

---

## Aprende construyendo

### Tema 1: Cabeceras seguras con helmet

**Conceptos clave:** cabeceras HTTP de seguridad, mitigación de ataques comunes del navegador.

`helmet`, un middleware de Express (y también disponible para Fastify), establece automáticamente un conjunto de cabeceras HTTP que mitigan categorías conocidas de ataques del lado del navegador, con una única línea de configuración (`app.use(helmet())`) en vez de requerir que cada desarrollador configure manualmente cada cabecera individual conociendo exactamente su propósito específico. Entre las cabeceras que establece: `X-Content-Type-Options: nosniff` previene que el navegador intente adivinar el tipo de contenido de una respuesta de forma distinta a la declarada explícitamente en `Content-Type`, mitigando ciertos ataques que dependen de esa ambigüedad de interpretación; `Strict-Transport-Security` indica al navegador que solo debe comunicarse con el sitio mediante HTTPS en futuras visitas, incluso si el usuario intenta acceder explícitamente mediante HTTP, previniendo ataques de downgrade de protocolo.

Verificar con `curl -I` (que solicita solo las cabeceras de la respuesta, sin el cuerpo completo) qué cabeceras añade `helmet` a una aplicación específica es un ejercicio práctico revelador: cada cabecera añadida corresponde a una mitigación específica y bien documentada de un vector de ataque conocido, y entender el propósito individual de cada una (en vez de simplemente confiar ciegamente en que "helmet hace que la app sea segura") es importante para poder configurar excepciones puntuales cuando una cabecera específica interfiere con un requisito legítimo de la aplicación (por ejemplo, ajustar la Content Security Policy si la aplicación necesita cargar recursos de un dominio externo específico).

Adoptar `helmet` (o el equivalente para el framework elegido) desde el inicio de cualquier API de producción es una práctica de bajo costo y alto beneficio: la configuración por defecto cubre las mitigaciones más comunes y ampliamente aplicables sin requerir ningún conocimiento profundo previo de seguridad web por parte de cada desarrollador individual del equipo, delegando esa experiencia acumulada de la comunidad de seguridad hacia una biblioteca mantenida y actualizada colectivamente.

**Analogía:** `helmet` es como instalar automáticamente un conjunto estándar de cerraduras de seguridad probadas y recomendadas por expertos en un edificio nuevo, en vez de que cada propietario individual tenga que investigar y decidir por su cuenta, desde cero, qué tipo específico de cerradura instalar en cada puerta.

**¿Por qué es importante?** `helmet` mitiga con una única línea de configuración una categoría amplia de vulnerabilidades conocidas del lado del navegador, delegando experiencia de seguridad acumulada de la comunidad hacia una configuración por defecto sensata y ampliamente probada.

**Código del ejemplo:**

```js
import helmet from "helmet";
app.use(helmet()); // agrega X-Content-Type-Options, Strict-Transport-Security, etc.
// verificar: curl -I http://localhost:3000/tareas
```

### Tema 2: Rate limiting

**Conceptos clave:** límite de peticiones por ventana de tiempo, prevención de abuso y fuerza bruta.

Sin ningún límite en la tasa de peticiones que un cliente puede realizar, un solo cliente (deliberadamente malicioso, o simplemente un bug de un cliente legítimo que reintenta sin control) puede saturar una API con volumen excesivo de peticiones, degradando el servicio para todos los demás usuarios legítimos, o realizar ataques de fuerza bruta contra un endpoint de login (probando sistemáticamente miles de combinaciones de contraseña por segundo contra la misma cuenta) sin ninguna fricción que lo dificulte. `express-rate-limit` (u otras bibliotecas equivalentes) limita el número de peticiones aceptadas desde una misma IP (u otro identificador de cliente) dentro de una ventana de tiempo configurable, respondiendo con `429` (Too Many Requests) una vez que ese límite se excede dentro de la ventana.

Configurar el límite apropiado (`{windowMs: 60_000, max: 100}`, por ejemplo, 100 peticiones por minuto) requiere equilibrar la protección real contra abuso con no penalizar injustamente a usuarios legítimos con patrones de uso normales pero de volumen relativamente alto; límites más estrictos son apropiados específicamente para endpoints sensibles como login (donde incluso un puñado de intentos fallidos en poco tiempo es sospechoso de un ataque de fuerza bruta) frente a límites más generosos para endpoints de consulta general de uso normal y esperado con mayor frecuencia legítima.

Rate limiting no es solo una medida "para verse profesional": resuelve un problema real y concreto de disponibilidad del servicio (protegiendo contra saturación, ya sea maliciosa o accidental) y de seguridad específica (dificultando significativamente ataques de fuerza bruta contra credenciales, que dependen fundamentalmente de poder probar un volumen muy alto de intentos en poco tiempo; limitar ese volumen posible reduce directamente la viabilidad práctica de ese tipo de ataque, sin necesidad de ninguna otra medida adicional específica contra fuerza bruta).

**Analogía:** rate limiting es como un torniquete de entrada que permite pasar solo un número limitado de personas por minuto, evitando tanto que una multitud descontrolada sature un espacio con capacidad limitada, como que alguien intente probar sistemáticamente y a alta velocidad miles de credenciales falsas contra un único punto de control de seguridad en poco tiempo.

**¿Por qué es importante?** Rate limiting protege tanto la disponibilidad del servicio ante saturación (maliciosa o accidental) como la seguridad de endpoints sensibles como login, dificultando significativamente ataques de fuerza bruta al limitar el volumen posible de intentos en un período de tiempo dado.

**Código del ejemplo:**

```js
import rateLimit from "express-rate-limit";
app.use(rateLimit({ windowMs: 60_000, max: 100 })); // máx 100 requests/minuto por IP
// tras excederlo: respuesta 429 Too Many Requests
```

### Tema 3: Inyección SQL y sanitización contra XSS

**Conceptos clave:** consultas parametrizadas, escape automático, sanitización de HTML.

La inyección SQL, mencionada ya en el Módulo 5 al estudiar el driver `pg`, ocurre cuando un valor de entrada del usuario se concatena directamente dentro de un string SQL sin ningún escape (`` `SELECT * FROM usuarios WHERE email = '${email}'` ``), permitiendo que un atacante que controla el valor de `email` inyecte fragmentos de SQL adicionales que alteran completamente la estructura y el significado de la consulta original ejecutada (por ejemplo, incluyendo una condición que siempre es verdadera, devolviendo todos los usuarios de la tabla en vez de uno específico, o peor, ejecutando comandos SQL destructivos adicionales). La solución, ya estudiada, es usar siempre consultas parametrizadas (`pool.query("... WHERE email = $1", [email])`), donde el driver escapa automáticamente el valor, neutralizando cualquier intento de inyección sin requerir ningún esfuerzo manual adicional del desarrollador en cada consulta individual.

Este mismo principio de "nunca concatenar directamente entrada no confiable" se extiende, con un mecanismo distinto pero un espíritu equivalente, al problema de XSS almacenado (Cross-Site Scripting): si contenido generado por un usuario (por ejemplo, un comentario en un formulario) se almacena y posteriormente se renderiza directamente como HTML en otra aplicación (típicamente un frontend, estudiado en los tracks de Angular y React) sin ningún escape o sanitización, un usuario malicioso podría incluir en su comentario un fragmento `<script>` que se ejecutaría en el navegador de cualquier otro usuario que visualice ese comentario después, potencialmente robando sus credenciales de sesión o realizando acciones no autorizadas en su nombre.

Escapar o sanitizar contenido generado por usuarios antes de renderizarlo como HTML (usando `textContent` en vez de `innerHTML` del lado del navegador, como se estudió en el Módulo 8 del track de JavaScript, o bibliotecas de sanitización específicas del lado del servidor si el contenido debe permitir cierto HTML controlado, como negritas o enlaces en un editor de texto enriquecido) es la defensa fundamental contra este vector. Auditar el flujo completo de cualquier dato que un usuario pueda controlar, desde su entrada inicial hasta cualquier punto donde eventualmente se renderiza o se usa en una consulta, identificando cada punto donde ese dato cruza un límite de confianza (de entrada de usuario hacia SQL, o de almacenamiento hacia renderizado HTML), es la disciplina sistemática que previene tanto inyección SQL como XSS de forma consistente.

**Analogía:** tanto la inyección SQL como el XSS son variantes del mismo problema fundamental: tratar datos de entrada no confiable como si fueran instrucciones confiables a ejecutar directamente, en vez de tratarlos siempre como datos puros a manejar con cuidado. Es como recibir una nota de un desconocido y, en vez de simplemente leer su contenido como texto, seguir literalmente cualquier instrucción que contenga como si viniera de una fuente autorizada y confiable.

**¿Por qué es importante?** Concatenar directamente entrada de usuario en SQL o renderizarla sin escape como HTML son las dos formas más comunes y con mayor impacto potencial de comprometer una aplicación, y ambas se previenen sistemáticamente con la misma disciplina: nunca tratar entrada no confiable como instrucciones ejecutables directas.

**Código del ejemplo:**

```js
// PELIGROSO: concatenación directa (inyección SQL)
const query = `SELECT * FROM usuarios WHERE email = '${email}'`;
// SEGURO: parámetros, el driver escapa automáticamente
const { rows } = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);

// XSS: nunca renderizar contenido de usuario como HTML sin sanitizar/escapar
```

### Tema 4: OWASP API Security Top 10 y auditoría de dependencias

**Conceptos clave:** marco de referencia de vulnerabilidades comunes de APIs, `npm audit`.

El OWASP API Security Top 10 es un marco de referencia ampliamente reconocido y mantenido por la comunidad de seguridad, que documenta las diez categorías de vulnerabilidades más comunes y de mayor impacto específicamente en APIs (distinto del OWASP Top 10 general, más orientado a aplicaciones web tradicionales), incluyendo categorías como autorización a nivel de objeto rota (un usuario puede acceder a datos de otro usuario simplemente cambiando un id en la URL, sin verificación adecuada de que el recurso solicitado realmente pertenece a quien lo solicita) y exposición excesiva de datos (una respuesta de API que incluye más campos de los que el cliente específico necesita, exponiendo información sensible innecesariamente).

Revisar los ítems más relevantes de este marco de referencia para una API específica y documentar explícitamente cómo cada uno se mitiga (o identificar honestamente cuáles aún no están mitigados) es un ejercicio de auditoría de seguridad estructurado y sistemático, considerablemente más riguroso que simplemente "pensar en seguridad" de forma no estructurada; el marco proporciona una checklist concreta y bien fundamentada (con el mismo espíritu de la checklist de producción estudiada en el Módulo 12 del track DevOps) que reduce la probabilidad de pasar por alto una categoría completa de vulnerabilidad simplemente por no haberla considerado explícitamente.

`npm audit` escanea automáticamente las dependencias instaladas de un proyecto contra una base de datos de vulnerabilidades conocidas, reportando cuáles de los paquetes usados (incluyendo dependencias transitivas profundamente anidadas que el desarrollador nunca instaló directamente ni quizás siquiera conoce que existen) tienen vulnerabilidades documentadas, con una clasificación de severidad; `npm audit fix` intenta aplicar automáticamente actualizaciones que resuelven las vulnerabilidades encontradas sin requerir cambios manuales, aunque algunas vulnerabilidades requieren una actualización de versión mayor que podría introducir cambios incompatibles, requiriendo entonces una decisión manual e informada sobre cómo proceder, en vez de una corrección puramente automática.

**Analogía:** el OWASP API Security Top 10 es como una checklist de inspección de seguridad estandarizada y ampliamente reconocida para un edificio, cubriendo sistemáticamente las categorías de riesgo más comunes documentadas por la experiencia colectiva de la industria; `npm audit` es como un servicio de verificación automática que revisa cada componente comprado de proveedores externos contra una base de datos de defectos conocidos reportados, alertando específicamente sobre cuáles de esos componentes instalados tienen problemas documentados.

**¿Por qué es importante?** El OWASP API Security Top 10 proporciona un marco sistemático y bien fundamentado para auditar la seguridad de una API, reduciendo la probabilidad de omitir categorías completas de riesgo; `npm audit` extiende esa vigilancia hacia las dependencias de terceros, una superficie de riesgo frecuentemente invisible sin una herramienta que la audite activamente.

**Prueba en terminal:**

```bash
npm audit          # lista vulnerabilidades conocidas en las dependencias instaladas
npm audit fix       # aplica actualizaciones automáticas seguras cuando es posible
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

**Objetivo del laboratorio:** asegurar la API construida en módulos anteriores con cabeceras seguras, rate limiting, prevención de inyección SQL/XSS y una auditoría estructurada según OWASP.

**Requisitos previos:** Módulos 0-9 completados.

| Paso | Acción | Comando/Código | Explicación |
|---|---|---|---|
| 1 | Instalar y verificar helmet | `app.use(helmet())`, `curl -I` | Verifica las cabeceras agregadas |
| 2 | Implementar rate limiting | Ver Tema 2 | Verifica que tras N requests responde 429 |
| 3 | Provocar y corregir una inyección SQL | Endpoint con concatenación directa, luego con parámetros | Verifica el ataque y su corrección |
| 4 | Sanitizar un campo de texto libre | Antes de renderizarlo en otra parte como HTML | Previene XSS almacenado |
| 5 | Revisar el OWASP API Security Top 10 | Documenta los 3 ítems más relevantes para tu API | Explica cómo cada uno se mitiga |
| 6 | Auditar dependencias | `npm audit`, corrige lo crítico encontrado | Verifica el reporte antes y después |

**Verificación:** el laboratorio se considera exitoso si el ataque de inyección SQL provocado deliberadamente en el paso 3 efectivamente altera el resultado antes de la corrección, y ya no lo hace después de aplicar consultas parametrizadas; y si `npm audit` no reporta ninguna vulnerabilidad crítica sin resolver al finalizar.

**Errores comunes y soluciones**

- **Confiar en que "nunca voy a tener atacantes reales" para justificar concatenación directa de SQL.** Esta suposición es incorrecta incluso para proyectos pequeños; usa siempre consultas parametrizadas por disciplina, no solo cuando "hace falta".
- **Configurar rate limiting con un límite tan estricto que afecta a usuarios legítimos normales.** Ajusta el límite según el patrón de uso real esperado, con límites más estrictos específicamente en endpoints sensibles como login.
- **Ignorar vulnerabilidades reportadas por `npm audit` por considerarlas "de bajo riesgo".** Revisa la severidad real reportada y prioriza las críticas y altas de forma consistente.

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

- OpenJS Foundation, *Node.js Documentation*.
- IETF, especificaciones HTTP Semantics, OAuth 2.0 y JSON.
- OWASP Foundation, *Application Security Verification Standard*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- `helmet` establece automáticamente cabeceras HTTP que mitigan categorías conocidas de ataques del navegador.
- Rate limiting protege tanto la disponibilidad del servicio como la resistencia contra ataques de fuerza bruta.
- La inyección SQL se previene con consultas siempre parametrizadas; el XSS almacenado se previene sanitizando o escapando contenido de usuario antes de renderizarlo.
- El OWASP API Security Top 10 es un marco sistemático de auditoría de seguridad específico de APIs; `npm audit` extiende esa vigilancia a las dependencias de terceros.

**Conceptos aprendidos**

- Cabeceras HTTP de seguridad con helmet.
- Rate limiting y su doble propósito de disponibilidad y seguridad.
- Prevención de inyección SQL y XSS almacenado.
- El OWASP API Security Top 10 y la auditoría de dependencias con `npm audit`.

**Próximos pasos**

En el Módulo 11 aprenderás a empaquetar y desplegar tu API Node de forma reproducible con Docker multi-stage, conectando directamente con el track DevOps.

**Recursos adicionales**

- OWASP API Security Top 10 (owasp.org).
- Documentación oficial de `helmet` y de `express-rate-limit`.
