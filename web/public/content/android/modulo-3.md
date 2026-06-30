## NavHost y rutas

```kotlin
NavHost(navController, startDestination = "lista") {
    composable("lista") { ListaTareasScreen(onTareaClick = { id -> navController.navigate("detalle/$id") }) }
    composable("detalle/{id}") { backStackEntry ->
        val id = backStackEntry.arguments?.getString("id")
        DetalleTareaScreen(id)
    }
}
```

## Argumentos tipados

```kotlin
composable(
    "detalle/{id}",
    arguments = listOf(navArgument("id") { type = NavType.StringType })
) { /* ... */ }
```

## Deep links

```kotlin
composable(
    "detalle/{id}",
    deepLinks = listOf(navDeepLink { uriPattern = "miapp://tarea/{id}" })
) { /* ... */ }
```

Un link externo (notificación, web) puede abrir directamente esa pantalla con el argumento ya resuelto.

## Bottom navigation con stacks independientes

```kotlin
Scaffold(bottomBar = {
    NavigationBar {
        items.forEach { item -> NavigationBarItem(onClick = { navController.navigate(item.ruta) }, /* ... */) }
    }
}) { padding ->
    NavHost(navController, startDestination = "inicio", Modifier.padding(padding)) { /* ... */ }
}
```

Cada sección (Inicio, Tareas, Perfil) suele mantener su propio historial de navegación, para que volver atrás dentro de una sección no salte a otra.
