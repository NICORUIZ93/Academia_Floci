// Navegación con Navigation Compose (Módulo 3): NavHost + rutas con argumentos.
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController

@Composable
fun AppNavigation() {
  // rememberNavController sobrevive a recomposiciones, igual que remember, pero
  // específicamente para el estado de navegación (back stack, ruta actual).
  val navController = rememberNavController()

  NavHost(navController = navController, startDestination = "lista") {
    composable("lista") {
      PantallaLista(onTareaClick = { id -> navController.navigate("detalle/$id") })
    }
    // "{id}" es un argumento de ruta — se extrae en PantallaDetalle vía
    // backStackEntry.arguments o, más idiomático, con un NavType tipado.
    composable("detalle/{id}") { backStackEntry ->
      val id = backStackEntry.arguments?.getString("id") ?: ""
      PantallaDetalle(id = id, onVolver = { navController.popBackStack() })
    }
  }
}

@Composable
fun PantallaLista(onTareaClick: (String) -> Unit) {
  Button(onClick = { onTareaClick("42") }) { Text("Abrir tarea 42") }
}

@Composable
fun PantallaDetalle(id: String, onVolver: () -> Unit) {
  Text("Detalle de la tarea $id")
  Button(onClick = onVolver) { Text("Volver") }
}
