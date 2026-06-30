## go_router: rutas declarativas

```dart
final router = GoRouter(routes: [
  GoRoute(path: '/', builder: (context, state) => ListaTareasScreen()),
  GoRoute(
    path: '/tareas/:id',
    builder: (context, state) => DetalleTareaScreen(id: state.pathParameters['id']!),
  ),
]);
```

```dart
context.go('/tareas/42'); // navegación declarativa, la URL es la fuente de verdad
```

A diferencia del `Navigator.push()` imperativo (push/pop manual de páginas), go_router trata la navegación como una función de la URL actual — más natural para deep linking y para Flutter Web.

## Guards (redirect)

```dart
GoRoute(
  path: '/admin',
  redirect: (context, state) => estaAutenticado ? null : '/login',
  builder: (context, state) => AdminScreen(),
)
```

## Deep linking

Con go_router, un link externo (`miapp://tareas/42`) simplemente navega a la ruta correspondiente — el mismo mecanismo que la navegación interna, sin lógica especial adicional.

## Transiciones personalizadas

```dart
GoRoute(
  path: '/detalle',
  pageBuilder: (context, state) => CustomTransitionPage(
    child: DetalleScreen(),
    transitionsBuilder: (context, animation, _, child) => FadeTransition(opacity: animation, child: child),
  ),
)
```
