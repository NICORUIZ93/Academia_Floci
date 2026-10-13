import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:academia_flutter_testing/buscador_envios.dart';
void main() {
  testWidgets('respuesta controlada después de mostrar carga', (tester) async {
    final respuesta = Completer<String>();
    await tester.pumpWidget(MaterialApp(home: BuscadorEnvios(buscar: (_) => respuesta.future)));
    await tester.enterText(find.byType(TextField), 'RF-4471');
    await tester.tap(find.byIcon(Icons.search));
    await tester.pump();
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    expect(find.text('Envío RF-4471'), findsNothing);
    respuesta.complete('Envío RF-4471');
    await tester.pump(); // Procesa el Future completado y el cambio de estado.
    await tester.pumpAndSettle(); // Ahora solo esperamos frames/animaciones pendientes.
    expect(find.byType(CircularProgressIndicator), findsNothing);
    expect(find.text('Envío RF-4471'), findsOneWidget);
  });
  testWidgets('error de consulta se muestra y permite reintentar', (tester) async {
    await tester.pumpWidget(MaterialApp(home: BuscadorEnvios(buscar: (_) async => throw StateError('sin red'))));
    await tester.tap(find.byIcon(Icons.search));
    await tester.pumpAndSettle();
    expect(find.text('No se pudo cargar'), findsOneWidget);
    expect(tester.widget<IconButton>(find.byType(IconButton)).onPressed, isNotNull);
  });
  testWidgets('lista vacía tiene texto visible', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: ListaEnvios(envios: [])));
    expect(find.text('Sin envíos'), findsOneWidget);
  });
}
