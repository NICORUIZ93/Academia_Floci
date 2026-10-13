import 'package:flutter/material.dart';
import 'l10n/generated/app_localizations.dart';
void main() => runApp(const Demo());
class Demo extends StatelessWidget {
  const Demo({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(
    localizationsDelegates: AppLocalizations.localizationsDelegates,
    supportedLocales: AppLocalizations.supportedLocales,
    home: Builder(builder: (context) => Scaffold(body: Text(AppLocalizations.of(context)!.estadoEnRuta))),
  );
}
