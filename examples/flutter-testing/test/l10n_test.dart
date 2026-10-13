import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:academia_flutter_testing/l10n/generated/app_localizations.dart';
void main() {
  for (final item in <String, String>{'es': 'En ruta', 'en': 'In transit'}.entries) {
    testWidgets('traducción ${item.key}', (tester) async {
      await tester.pumpWidget(MaterialApp(locale: Locale(item.key),
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: Builder(builder: (context) => Text(AppLocalizations.of(context)!.estadoEnRuta))));
      await tester.pumpAndSettle();
      expect(find.text(item.value), findsOneWidget);
    });
  }
}
