# Módulo 6: Persistencia local

## Sílabo

**Objetivo general**

Guardar datos localmente según la necesidad específica: `shared_preferences` para configuración simple, `sqflite` para datos relacionales, o Hive como base NoSQL ligera embebida, implementando una estrategia offline-first y entendiendo cuándo Firebase entra en juego como backend completo.

**Objetivos específicos**

1. Guardar una preferencia simple con `shared_preferences`.
2. Definir una tabla con `sqflite` y realizar operaciones CRUD.
3. Repetir el mismo modelo con Hive y comparar la ergonomía.
4. Implementar una estrategia offline-first simple.

**Contenido**

- `shared_preferences` para configuración simple.
- `sqflite` para datos relacionales.
- Hive como base NoSQL ligera embebida.
- Estrategia offline-first.
- Firebase: Authentication, Firestore, Cloud Functions y FCM.

**Evaluación**

App con caché local que funciona sin conexión a internet, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: shared_preferences

**Conceptos clave:** almacenamiento clave-valor simple, no apropiado para datos estructurados grandes.

```dart
final prefs = await SharedPreferences.getInstance();
await prefs.setBool('tema_oscuro', true);
final temaOscuro = prefs.getBool('tema_oscuro') ?? false;
```

`shared_preferences` provee una API simple de almacenamiento clave-valor persistente, ideal específicamente para configuración pequeña y de tipos primitivos (un booleano de tema oscuro, un string de idioma preferido, un entero de contador de sesiones); no es apropiado para guardar una lista grande de objetos estructurados (como una colección completa de tareas de usuario), dado que su modelo de almacenamiento no está diseñado para consultas eficientes sobre datos relacionales o estructurados en volumen, y forzar ese caso de uso hacia `shared_preferences` (por ejemplo, serializando manualmente una lista completa a un único string JSON gigante) sacrifica tanto el rendimiento como la capacidad de consultar o modificar elementos individuales de forma eficiente.

Esta distinción de "para qué sirve cada mecanismo de persistencia" es análoga a `UserDefaults` en iOS (el equivalente conceptual de `shared_preferences` en el ecosistema Apple, apropiado solo para configuración pequeña, nunca para datos estructurados en volumen) y a `SharedPreferences` de Android nativo (Módulo 6 de ese track, aunque en Android Room reemplaza ese rol para datos relacionales).

**Analogía:** `shared_preferences` es como una pequeña libreta de notas personales apropiada para anotar un par de preferencias simples (recordatorios cortos), pero completamente inadecuada para llevar el inventario completo de un almacén con miles de artículos individuales, para lo cual se necesita un sistema de registro estructurado apropiado.

**¿Por qué es importante?** `shared_preferences` NO es apropiado para guardar una lista grande de objetos estructurados, dado que su modelo de almacenamiento clave-valor simple no está diseñado para consultas eficientes sobre datos relacionales o en volumen, a diferencia de `sqflite` o Hive.

**Código del ejemplo:**

```dart
await prefs.setBool('tema_oscuro', true);   // apropiado: valor simple
// NO apropiado: prefs.setString('lista_tareas', jsonEncode(listaGrandeDeObjetos))
```

### Tema 2: sqflite vs Hive

**Conceptos clave:** SQL relacional con queries complejas frente a NoSQL embebido simple y directo.

```dart
final db = await openDatabase('app.db', version: 1, onCreate: (db, version) {
  db.execute('CREATE TABLE tarea(id TEXT PRIMARY KEY, titulo TEXT, completada INTEGER)');
});

await db.insert('tarea', {'id': '1', 'titulo': 'Comprar leche', 'completada': 0});
final tareas = await db.query('tarea');
```

```dart
@HiveType(typeId: 0)
class Tarea extends HiveObject {
  @HiveField(0) String titulo;
  @HiveField(1) bool completada;
}

final box = await Hive.openBox<Tarea>('tareas');
box.add(Tarea(titulo: 'Comprar leche', completada: false));
```

`sqflite` expone SQL real sobre SQLite, apropiado cuando la app necesita queries relacionales complejas, joins entre tablas, o agregaciones (`GROUP BY`, `COUNT`), capacidades del modelo relacional que Hive, como base NoSQL embebida más simple centrada en almacenar objetos directamente sin un motor de consultas relacional completo, no ofrece de la misma forma nativa; Hive es considerablemente más simple y directo para modelos de objetos sin relaciones complejas entre entidades (guardar y recuperar objetos completos por clave), con una API más cercana al modelo mental de "una colección de objetos Dart persistidos directamente", sin la capa intermedia de mapear entre filas SQL y objetos Dart que `sqflite` requiere.

Esta misma decisión de "SQL relacional tipado vs NoSQL embebido simple" se refleja en Room (SQL tipado, Módulo 6 del track de Android) frente a SwiftData (una capa más simple sobre Core Data, Módulo 6 del track de iOS), aunque cada ecosistema resuelve la elección con herramientas propias específicas de su plataforma.

**Analogía:** `sqflite` es como un sistema de archivo relacional completo con capacidad de generar reportes cruzados complejos entre distintas categorías de información; Hive es como un conjunto de cajas etiquetadas donde cada caja contiene directamente los objetos completos que se necesitan, ideal cuando no se requiere cruzar información entre cajas distintas de forma compleja.

**¿Por qué es importante?** Elegir entre Hive y `sqflite` depende de si la app necesita queries relacionales complejas (joins, agregaciones, apropiado para `sqflite`) o simplemente persistir y recuperar objetos directos sin relaciones complejas (más simple con Hive).

**Diagrama:**

```
sqflite  → SQL relacional real, joins, agregaciones complejas
Hive     → NoSQL embebido simple, objetos directos sin relaciones complejas
```

### Tema 3: Offline-first y Firebase

**Conceptos clave:** la UI lee siempre de la caché local, sincronización en segundo plano.

```dart
Stream<List<Tarea>> get tareas => box.watch().map((_) => box.values.toList());

Future<void> sincronizar() async {
  final remotas = await api.obtenerTareas();
  for (final t in remotas) { box.put(t.id, t); }
}
```

Una estrategia offline-first en Flutter sigue exactamente el mismo principio ya estudiado en Room/Android (Módulo 6 de ese track) y SwiftData/iOS (Módulo 6 de ese track): la UI siempre lee de la caché local (aquí, un `Stream` reactivo sobre una caja de Hive que emite una nueva lista cada vez que los datos cambian), mientras un proceso de sincronización separado actualiza esa caché en segundo plano con datos frescos de la API remota, garantizando que la app permanezca funcional (mostrando al menos el último caché sincronizado) incluso sin conexión a internet.

Firebase (Authentication para gestión de usuarios, Firestore como base de datos NoSQL en la nube con sincronización en tiempo real incorporada, Cloud Functions para lógica de backend serverless, y FCM para notificaciones push) es una opción de backend-as-a-service extremadamente popular en el ecosistema Flutter específicamente porque ofrece integración oficial de primera clase con Flutter, permitiendo construir apps completas con backend funcional sin necesariamente escribir y mantener un servidor propio desde cero, aunque a costa de cierto acoplamiento a la plataforma y modelo de datos específicos de Firebase.

**Analogía:** offline-first con Hive/sqflite es como un noticiero local que siempre muestra las últimas noticias impresas disponibles mientras un equipo de reporteros recaba actualizaciones en segundo plano; Firebase es como contratar un servicio integral de infraestructura ya preconstruido (autenticación, base de datos, funciones de servidor, notificaciones) en vez de construir cada una de esas piezas de infraestructura por separado desde cero.

**¿Por qué es importante?** Offline-first mantiene la app funcional sin conexión leyendo siempre de la caché local sincronizada en background; Firebase ofrece un backend completo con integración oficial de primera clase en Flutter, apropiado para reducir el esfuerzo de construir infraestructura de servidor propia desde cero.

**Diagrama:**

```
UI ← siempre lee de → Hive/sqflite (caché local reactiva)
                          ↑
                   Sincronización en background
                          ↓
                        API remota / Firebase
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

**Objetivo del laboratorio:** construir una app con caché local que funciona sin conexión a internet.

**Requisitos previos:** Módulo 5 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Guardar una preferencia simple | Ver Tema 1 | `shared_preferences` |
| 2 | Definir una tabla con `sqflite` y CRUD básico | Ver Tema 2 | SQL relacional |
| 3 | Repetir el modelo con Hive | Ver Tema 2 | Compara ergonomía |
| 4 | Implementar offline-first simple | Ver Tema 3 | UI lee siempre de la caché local |

**Verificación:** el laboratorio se considera exitoso si la app muestra datos correctamente incluso en modo avión (usando el último caché sincronizado), y si la preferencia simple guardada con `shared_preferences` persiste correctamente entre reinicios de la app.

**Errores comunes y soluciones**

- **Guardar una lista grande de objetos estructurados en `shared_preferences`.** Usa `sqflite` o Hive para ese caso de uso.
- **Elegir Hive cuando la app necesita queries relacionales complejas con joins.** Prefiere `sqflite` para ese caso.
- **Hacer que la UI dependa directamente de la API en vez de la caché local.** Rompe offline-first; la UI debe leer siempre del caché.

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

- Google, *Flutter Documentation* y guías de arquitectura y rendimiento.
- Google, *Dart Language Documentation* y *Effective Dart*.
- OWASP Foundation, *Mobile Application Security Verification Standard*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- `shared_preferences` es apropiado solo para configuración pequeña, no para listas grandes de objetos estructurados.
- `sqflite` ofrece SQL relacional real; Hive es más simple para objetos directos sin relaciones complejas.
- Offline-first mantiene la UI leyendo siempre de la caché local, sincronizada en background con la API.
- Firebase ofrece un backend completo con integración de primera clase en Flutter, reduciendo el esfuerzo de construir infraestructura propia.

**Conceptos aprendidos**

- `shared_preferences`.
- `sqflite`.
- Hive.
- Estrategia offline-first.
- Firebase.

**Próximos pasos**

En el Módulo 7 aprenderás integración con plataformas nativas usando `MethodChannel` cuando un plugin existente no cubre tu necesidad.

**Recursos adicionales**

- Documentación oficial de persistencia de datos en Flutter (docs.flutter.dev/cookbook/persistence).
