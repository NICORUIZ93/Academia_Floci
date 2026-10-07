# Módulo 15: Flutter Master: calidad, arquitectura y despliegue

## Aprende construyendo

### Tema 1: flutter test y WidgetTester

#### Paso 1 · Objetivo y preparación
Al finalizar vas a escribir un widget test con `WidgetTester` que confirme que `ListaEnvios` muestra "Sin envíos" cuando la lista está vacía, sin levantar un emulador. **Prerrequisitos:** Flutter estable y Dart; confirma `flutter doctor`.

#### Paso 2 · Contexto y caso real
Un cambio de UI en la pantalla de lista de envíos rompió silenciosamente el estado vacío (el texto "Sin envíos" dejó de mostrarse), y nadie lo notó hasta que un usuario reportó una pantalla en blanco — nada en el pipeline de CI lo habría detectado sin un test que monte el widget real.

#### Paso 3 · Teoría, modelo mental y analogía
`WidgetTester` simula un usuario interactuando con el árbol de widgets en memoria, sin necesitar un dispositivo o emulador real; `pump()` avanza un frame, permitiendo verificar el estado exacto del árbol en cualquier punto. La analogía: un maniquí de pruebas que reacciona exactamente como un usuario real, pero en un entorno de laboratorio controlado y repetible.

#### Paso 4 · Demostración guiada
```dart
testWidgets('muestra "Sin envíos" cuando la lista está vacía', (tester) async {
  await tester.pumpWidget(const MaterialApp(home: ListaEnvios(envios: [])));
  expect(find.text('Sin envíos'), findsOneWidget);
});
```
```bash
flutter test
```
Resultado esperado: el test pasa en verde, confirmando que el texto "Sin envíos" aparece exactamente cuando la lista está vacía, sin necesidad de ningún emulador corriendo.

**Fallo deliberado:** cambia la aserción a `expect(find.text('Sin envíos'), findsNothing)` sin tocar el widget real. El test ahora falla porque SÍ encuentra el texto, confirmando que el test original estaba verificando correctamente lo que el widget realmente hace; restaura la aserción original antes de continuar.

#### Paso 5 · Práctica guiada
Pista: antes de corregir, lee el mensaje de fallo completo (`Expected: no matching nodes... Actual: ...`) — confirma que el framework te dice exactamente qué encontró, no solo que algo falló.

#### Paso 6 · Práctica independiente
Agrega un segundo test que confirme que, con al menos un envío en la lista, el texto "Sin envíos" NO aparece (`findsNothing`), cubriendo ambos estados del mismo widget.

#### Paso 7 · Cierre y evidencia
Entrega el test del estado vacío del Paso 4, la aserción invertida del Paso 5, y el segundo test del estado con datos del Paso 6; explica por qué `WidgetTester` permite verificar el árbol de widgets sin el costo de un emulador real. Como siguiente paso, usa `pumpAndSettle` para probar interacciones asíncronas e integration tests de extremo a extremo. Errores comunes: usar `tester.pump()` una sola vez para un widget con animaciones o datos asíncronos que necesitan varios frames; probar implementación interna (variables privadas) en vez del resultado visible para el usuario. Fuentes oficiales: https://docs.flutter.dev/testing/overview y https://api.flutter.dev/flutter/flutter_test/WidgetTester-class.html.

**¿Por qué es importante?** Un widget test confirma el comportamiento visible real del árbol de widgets sin el costo de un emulador, detectando regresiones de UI antes de que lleguen a producción.

**Evidencia de aprendizaje:** entrega el test del estado vacío, la aserción invertida reproducida, y el segundo test del estado con datos.

**Conceptos clave:** WidgetTester, pump(), árbol de widgets en memoria, testWidgets.

### Tema 2: pumpAndSettle, golden e integration tests

#### Paso 1 · Objetivo y preparación
Al finalizar vas a usar `pumpAndSettle()` para esperar a que una animación de carga termine antes de verificar el resultado, y vas a reproducir el fallo clásico de un test que verifica demasiado pronto. **Prerrequisitos:** Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real
Un test que verifica el resultado de una búsqueda de envíos justo después de disparar la búsqueda (sin esperar a que la animación de carga termine) falla intermitentemente: a veces el spinner todavía está en pantalla cuando el test ya está verificando el resultado final.

#### Paso 3 · Teoría, modelo mental y analogía
`pumpAndSettle()` avanza frames repetidamente hasta que no quede ninguna animación o frame pendiente, aproximando lo que un usuario real experimentaría esperando a que la pantalla "se asiente"; si algo mantiene la UI en animación perpetua, `pumpAndSettle()` nunca termina y el test falla por timeout. La analogía: esperar a que una escena termine de moverse antes de tomar la fotografía, en vez de disparar el obturador a mitad del movimiento.

#### Paso 4 · Demostración guiada
```dart
testWidgets('muestra el resultado tras la búsqueda', (tester) async {
  await tester.pumpWidget(const MaterialApp(home: BuscadorEnvios()));
  await tester.enterText(find.byType(TextField), 'RF-4471');
  await tester.tap(find.byIcon(Icons.search));
  await tester.pumpAndSettle();
  expect(find.text('Envío RF-4471'), findsOneWidget);
});
```
```bash
flutter test
```
Resultado esperado: `pumpAndSettle()` espera automáticamente a que el spinner de carga desaparezca antes de que la aserción se ejecute, evitando la falla intermitente de verificar mientras la animación todavía está en curso.

**Fallo deliberado:** reemplaza `await tester.pumpAndSettle();` por un único `await tester.pump();`. El test falla de forma intermitente (a veces pasa, a veces no) porque un solo `pump()` avanza exactamente un frame, que puede o no ser suficiente para que la búsqueda asíncrona termine; la intermitencia misma es la señal de que falta esperar explícitamente a que el estado se estabilice.

#### Paso 5 · Práctica guiada
Pista: corré el test del Paso 4 con `pump()` único varias veces seguidas (`flutter test --repeat` o manualmente) y contá cuántas de esas ejecuciones fallan — la intermitencia es la evidencia, no una suposición.

#### Paso 6 · Práctica independiente
Agrega un segundo caso donde el spinner de carga NUNCA desaparece (simulando una animación infinita real, como un indicador de "escuchando" permanente) confirmando que `pumpAndSettle()` falla por timeout en ese caso — documenta por qué esa es una limitación conocida, no un bug del framework.

#### Paso 7 · Cierre y evidencia
Entrega el test con `pumpAndSettle()` del Paso 4, la falla intermitente con `pump()` único del Paso 5, y el caso de animación infinita del Paso 6; explica por qué una falla intermitente en un test (no un fallo consistente) suele señalar una sincronización asíncrona faltante, no un bug aleatorio real. Como siguiente paso, mide el rendimiento de una lista con `RepaintBoundary` y Keys correctas. Errores comunes: usar un único `pump()` para estados asíncronos que necesitan varios frames; aplicar `pumpAndSettle()` a una pantalla con una animación intencionalmente infinita, sin un timeout explícito. Fuentes oficiales: https://docs.flutter.dev/cookbook/testing/widget/introduction y https://docs.flutter.dev/testing/integration-tests.

**¿Por qué es importante?** `pumpAndSettle()` evita fallas intermitentes esperando explícitamente a que la UI se estabilice, pero falla por timeout ante animaciones genuinamente infinitas — una limitación que hay que conocer, no un bug.

**Evidencia de aprendizaje:** entrega el test con pumpAndSettle funcionando, la falla intermitente con pump único reproducida, y el caso de animación infinita documentado.

**Conceptos clave:** pumpAndSettle(), estabilización de frames, falla intermitente como señal de sincronización faltante.

### Tema 3: Rendimiento, RepaintBoundary y Keys

#### Paso 1 · Objetivo y preparación
Al finalizar vas a medir con DevTools cuántos widgets se repintan al actualizar un ítem de una lista de envíos, y vas a reducirlo con `RepaintBoundary` y una `Key` correcta. **Prerrequisitos:** Tema 2 de este módulo.

#### Paso 2 · Contexto y caso real
Una lista de 100 envíos pierde frames notablemente al marcar uno solo como "entregado" — el ítem actualizado se repinta correctamente, pero el profiler muestra que TODA la lista se repintó también, sin ninguna razón visible para el usuario.

#### Paso 3 · Teoría, modelo mental y analogía
Sin `RepaintBoundary`, una región que cambia puede forzar el repintado de widgets vecinos que comparten la misma capa de pintura; sin una `Key` estable por ítem, Flutter puede confundir la identidad de los widgets al reordenar una lista, reconstruyendo más de lo necesario. La analogía: pintar una sola ventana de un edificio sin afectar a las demás (RepaintBoundary), frente a repintar todo el edificio porque no quedó claro cuál ventana específica cambió.

#### Paso 4 · Demostración guiada
```dart
ListView.builder(
  itemCount: envios.length,
  itemBuilder: (context, i) => RepaintBoundary(
    key: ValueKey(envios[i].id),
    child: TarjetaEnvio(envio: envios[i]),
  ),
)
```
Resultado esperado: el DevTools Performance overlay muestra, al marcar un envío como entregado, que solo el `RepaintBoundary` de ESE ítem se repinta (resaltado en el overlay de "repaint rainbow"), no la lista completa.

**Fallo deliberado:** quita `RepaintBoundary` y cambia `ValueKey(envios[i].id)` por `ValueKey(i)` (el índice, no el id real). Al marcar un envío como entregado (lo que puede reordenar la lista, moviendo los entregados al final), Flutter asocia el estado visual al ÍNDICE, no al envío real, y el checkbox de "entregado" aparece marcado en la fila equivocada tras el reordenamiento.

#### Paso 5 · Práctica guiada
Pista: medí con el profiler ANTES de aplicar cualquier corrección — sin una medición base, no podés confirmar después que la corrección realmente redujo el trabajo de repintado.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 restaurando `RepaintBoundary` y `ValueKey(envios[i].id)` (el id real, estable entre reordenamientos), y medí con el profiler de DevTools el conteo de widgets repintados antes y después, documentando la diferencia numérica.

#### Paso 7 · Cierre y evidencia
Entrega la lista con `RepaintBoundary`/`Key` correcta del Paso 4, el checkbox en la fila equivocada del Paso 5, y la medición comparada del Paso 6; explica por qué medir con el profiler antes de optimizar evita invertir esfuerzo en un problema que no es el cuello de botella real. Como siguiente paso, aislá el dominio de negocio con Clean Architecture. Errores comunes: usar el índice de una lista como Key en vez de un identificador estable del dato real; optimizar con RepaintBoundary sin medir primero cuál widget realmente se repinta de más. Fuentes oficiales: https://docs.flutter.dev/perf/best-practices y https://api.flutter.dev/flutter/widgets/RepaintBoundary-class.html.

**¿Por qué es importante?** Medir con el profiler antes de optimizar evita invertir esfuerzo en un problema que no es el cuello de botella real; una Key basada en índice en vez de identidad real produce bugs de estado visual asociado a la fila equivocada.

**Evidencia de aprendizaje:** entrega la lista optimizada del Paso 4, el bug de Key por índice reproducido, y la medición de repintado comparada.

**Conceptos clave:** RepaintBoundary, Key por identidad real vs índice, profiler antes de optimizar.

### Tema 4: Clean Architecture

#### Paso 1 · Objetivo y preparación
Al finalizar vas a estructurar el dominio de envíos en capas (`domain`, `application`, `data`) con dependencias que solo apuntan hacia adentro, y vas a reproducir el error de que `domain` dependa de un detalle de infraestructura. **Prerrequisitos:** Tema 3 de este módulo.

#### Paso 2 · Contexto y caso real
El equipo necesita cambiar el cliente HTTP (`Dio` por otro) sin tocar ninguna regla de negocio sobre cuándo un envío puede marcarse como entregado — si esa regla está mezclada con código de `Dio`, cambiar el cliente HTTP obliga a tocar y volver a probar la lógica de negocio también.

#### Paso 3 · Teoría, modelo mental y analogía
Clean Architecture organiza el código en capas concéntricas donde las dependencias solo pueden apuntar hacia el centro (`domain`): la capa de dominio no conoce ningún detalle de infraestructura (HTTP, base de datos, UI), mientras que las capas externas sí pueden depender del dominio. La analogía: cada capa es un puesto de aduana con un contrato — el centro nunca necesita saber cómo llegó la mercadería desde afuera.

#### Paso 4 · Demostración guiada
```dart
// lib/domain/envio.dart — SIN ningún import de Dio, http, ni UI
class Envio { final String id; final String estado; Envio(this.id, this.estado); }
abstract class EnvioRepository { Future<Envio> obtener(String id); }

// lib/application/marcar_entregado.dart
class MarcarEntregadoUseCase {
  final EnvioRepository repo;
  MarcarEntregadoUseCase(this.repo);
}
```
```bash
flutter test
```
Resultado esperado: `flutter test` pasa sin que el paquete `dio` (ni ningún plugin de plataforma) aparezca como dependencia de `lib/domain/`, confirmando que la regla de negocio es independiente de cómo se obtienen los datos.

**Fallo deliberado:** importa `package:dio/dio.dart` directamente dentro de `lib/domain/envio.dart` "para simplificar y hacer la petición ahí mismo". Ahora el dominio depende de un detalle de infraestructura específico, y cambiar `Dio` por otro cliente HTTP en el futuro obligaría a modificar y volver a probar la clase `Envio` también, exactamente el acoplamiento que Clean Architecture existe para evitar.

#### Paso 5 · Práctica guiada
Pista: ejecutá `flutter analyze` o buscá manualmente `import 'package:dio` dentro de `lib/domain/` — esa búsqueda por sí sola es una forma simple de verificar la regla de dependencias sin herramientas adicionales.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 quitando el import de `dio` del dominio, implementando `EnvioRepository` con `Dio` en una clase de la capa `data` (no `domain`), y agrega un test que instancie `MarcarEntregadoUseCase` con un repositorio falso (sin ningún HTTP real), confirmando que la lógica de negocio se prueba completamente aislada de la infraestructura.

#### Paso 7 · Cierre y evidencia
Entrega las capas separadas del Paso 4, la dependencia de `Dio` filtrada al dominio del Paso 5, y el test aislado con repositorio falso del Paso 6; explica por qué la dirección de las dependencias (siempre hacia el centro) es lo que realmente define Clean Architecture, no solo tener carpetas con esos nombres. Como siguiente paso, hacé que esos textos sean traducibles con internacionalización completa. Errores comunes: crear carpetas `domain`/`application`/`data` sin hacer cumplir realmente la dirección de dependencias; agregar capas ceremoniales a un proyecto tan simple que no las necesita. Fuentes oficiales: https://docs.flutter.dev/app-architecture/guide y https://docs.flutter.dev/app-architecture/case-study.

**¿Por qué es importante?** La dirección de las dependencias (siempre hacia el dominio, nunca al revés) es lo que permite cambiar infraestructura sin tocar ni volver a probar la lógica de negocio.

**Evidencia de aprendizaje:** entrega las capas separadas, la dependencia filtrada al dominio reproducida, y el test aislado con repositorio falso.

**Conceptos clave:** domain/application/data, dirección de dependencias, repositorio abstracto, aislamiento de infraestructura.

### Tema 5: Internacionalización completa

#### Paso 1 · Objetivo y preparación
Al finalizar vas a traducir la pantalla de estado de un envío al español y al inglés con archivos `.arb`, y vas a reproducir el error de una clave de traducción faltante en un idioma. **Prerrequisitos:** Tema 4 de este módulo.

#### Paso 2 · Contexto y caso real
RutaFlow planea operar en una región con usuarios que hablan español e inglés; el texto del estado de un envío ("En ruta", "Entregado") está hardcodeado directamente en los widgets, haciendo imposible mostrarlo en otro idioma sin tocar el código de cada pantalla.

#### Paso 3 · Teoría, modelo mental y analogía
Flutter genera clases de localización tipadas a partir de archivos `.arb` (uno por idioma), reemplazando strings hardcodeados por llamadas a `AppLocalizations.of(context)`; el formato de fechas, números y plurales también depende de la configuración regional (`Locale`), no solo de traducir palabra por palabra. La analogía: traducir un contrato no es reemplazar palabras una por una, sino adaptar el formato completo (fechas, moneda, pluralización) a las convenciones de cada idioma.

#### Paso 4 · Demostración guiada
```json
// lib/l10n/app_es.arb
{ "estadoEnRuta": "En ruta" }
```
```json
// lib/l10n/app_en.arb
{ "estadoEnRuta": "In transit" }
```
```dart
Text(AppLocalizations.of(context)!.estadoEnRuta)
```
```bash
flutter gen-l10n
```
Resultado esperado: `flutter gen-l10n` genera la clase `AppLocalizations`, y la app muestra "En ruta" o "In transit" automáticamente según el `Locale` del dispositivo, sin ningún `if` manual de idioma en el widget.

**Fallo deliberado:** agrega la clave `estadoEntregado` solo a `app_es.arb`, sin agregarla a `app_en.arb`. Al correr la app con el locale en inglés, Flutter no encuentra la clave `estadoEntregado` para ese idioma; según la configuración del proyecto, esto produce un error en tiempo de compilación de `flutter gen-l10n` o un texto de respaldo en tiempo de ejecución, nunca una traducción silenciosamente correcta.

#### Paso 5 · Práctica guiada
Pista: corré `flutter gen-l10n` inmediatamente después de agregar la clave a un solo archivo — el error (o la advertencia) aparece ahí mismo, antes de siquiera correr la app.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 agregando `estadoEntregado` también a `app_en.arb`, y agrega un test que recorra todas las claves de `app_es.arb` confirmando que cada una tiene su equivalente en `app_en.arb`, para detectar claves faltantes automáticamente en CI en vez de descubrirlas manualmente.

#### Paso 7 · Cierre y evidencia
Entrega las traducciones funcionando del Paso 4, la clave faltante en un idioma del Paso 5, y el test de paridad de claves del Paso 6; explica por qué verificar automáticamente que ambos archivos `.arb` tengan las mismas claves evita descubrir una traducción faltante recién en producción. Como siguiente paso, generá y firmá el artefacto de build final. Errores comunes: agregar una clave de traducción a un solo idioma sin verificar los demás; formatear fechas o números manualmente en vez de usar las utilidades de `intl` sensibles al `Locale`. Fuentes oficiales: https://docs.flutter.dev/ui/accessibility-and-internationalization/internationalization y https://pub.dev/packages/intl.

**¿Por qué es importante?** Una clave de traducción faltante en un idioma produce un error detectable (en build o en runtime), nunca una traducción silenciosamente incorrecta — pero solo si algo (un test de paridad) la busca activamente.

**Evidencia de aprendizaje:** entrega las traducciones funcionando, la clave faltante reproducida, y el test de paridad de claves agregado.

**Conceptos clave:** archivos .arb, AppLocalizations, Locale, paridad de claves entre idiomas.

### Tema 6: Builds, firma y despliegue

#### Paso 1 · Objetivo y preparación
Al finalizar vas a generar un build de release firmado para Android, y vas a reproducir el error de publicar un build firmado con una clave de desarrollo en vez de la clave de producción real. **Prerrequisitos:** Tema 5 de este módulo.

#### Paso 2 · Contexto y caso real
Un build de Android subido a producción con la clave (`keystore`) de debug en vez de la de release no puede actualizarse después con un build correctamente firmado: Google Play rechaza la actualización porque la firma no coincide con la versión ya publicada, un error irreversible sin republicar la app con un nuevo ID.

#### Paso 3 · Teoría, modelo mental y analogía
Cada build de Android se firma con una clave criptográfica (`keystore`) que identifica al desarrollador ante el sistema operativo y las tiendas; una vez publicada una versión con una clave específica, TODAS las actualizaciones futuras deben firmarse con esa misma clave para que el sistema las acepte como del mismo origen. La analogía: sellar un paquete con un sello específico — una vez que el receptor registra ese sello como el del remitente oficial, un paquete futuro con un sello distinto se rechaza por no coincidir, aunque el contenido sea legítimo.

#### Paso 4 · Demostración guiada
```bash
keytool -genkey -v -keystore release.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias rutaflow
flutter build apk --release
```
Resultado esperado: el build genera `app-release.apk` firmado con `release.keystore` (no con la clave de debug por defecto), verificable con `jarsigner -verify -verbose app-release.apk`.

**Fallo deliberado:** ejecuta `flutter build apk --release` SIN configurar `key.properties` para que apunte a `release.keystore`, dejando que use la firma de debug por defecto. El build "funciona" y se instala sin problema en un dispositivo de prueba, pero subir ese artefacto a Google Play Console y luego intentar publicar una actualización futura firmada correctamente con `release.keystore` falla, porque las firmas no coinciden entre versiones.

#### Paso 5 · Práctica guiada
Pista: compará el resultado de `jarsigner -verify -verbose -certs app-release.apk` entre un build firmado con la clave de debug y uno firmado con `release.keystore` — el certificado reportado es distinto en cada caso.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 configurando `key.properties` para que `flutter build apk --release` use explícitamente `release.keystore`, y documentá en un `README` interno (nunca en el repositorio público) dónde se guarda esa clave y quién tiene acceso, dado que perderla hace imposible publicar actualizaciones futuras de la misma app.

#### Paso 7 · Cierre y evidencia
Entrega el build firmado correctamente del Paso 4, el error de firma inconsistente entre versiones del Paso 5, y la documentación de custodia de la clave del Paso 6; explica por qué perder o usar la clave equivocada en un build de producción es un error prácticamente irreversible, a diferencia de casi cualquier otro error de este track. Con esto cerrás el track completo de Flutter, listo para operar en producción real. Errores comunes: commitear `release.keystore` o `key.properties` con la contraseña real al control de versiones; usar la firma de debug para un build que se sube a una tienda de aplicaciones real. Fuentes oficiales: https://docs.flutter.dev/deployment/android y https://docs.flutter.dev/deployment/ios.

**¿Por qué es importante?** La clave de firma de un build de producción es prácticamente irremplazable una vez publicada la primera versión — perderla o usar la equivocada bloquea permanentemente las actualizaciones futuras de esa app.

**Evidencia de aprendizaje:** entrega el build firmado correctamente, el error de firma inconsistente reproducido, y la documentación de custodia de la clave.

**Conceptos clave:** keystore, firma de release vs debug, consistencia de firma entre actualizaciones, custodia de credenciales.

---

## Trazabilidad de la auditoría original

- **Pruebas en Flutter**: cubierto en los Temas 1 (WidgetTester) y 2 (pumpAndSettle, golden e integration tests) de este módulo.
- **Rendimiento en Flutter**: cubierto en el Tema 3 (RepaintBoundary y Keys) de este módulo.
- **Clean Architecture**: cubierto en el Tema 4 de este módulo.
- **Internacionalización**: cubierto en el Tema 5 de este módulo.
- **Despliegue**: cubierto en el Tema 6 (builds, firma y despliegue) de este módulo.
