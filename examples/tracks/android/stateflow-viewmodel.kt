// Estado con StateFlow y Compose, y arquitectura MVVM (Módulo 4).
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class Tarea(val id: String, val titulo: String, val completada: Boolean)

class TareasViewModel : ViewModel() {
  // MutableStateFlow privado para escritura interna; se expone como StateFlow
  // de solo lectura — el mismo patrón de encapsulación que un getter sin setter.
  private val _tareas = MutableStateFlow<List<Tarea>>(emptyList())
  val tareas: StateFlow<List<Tarea>> = _tareas.asStateFlow()

  private val _cargando = MutableStateFlow(false)
  val cargando: StateFlow<Boolean> = _cargando.asStateFlow()

  fun cargarTareas() {
    // viewModelScope se cancela automáticamente cuando el ViewModel se destruye
    // (p. ej. al salir de la pantalla), evitando fugas de coroutines huérfanas.
    viewModelScope.launch {
      _cargando.value = true
      _tareas.value = listOf(Tarea("1", "Aprender StateFlow", false))
      _cargando.value = false
    }
  }
}

@Composable
fun TareasScreen(viewModel: TareasViewModel = viewModel()) {
  // collectAsStateWithLifecycle: recolecta el StateFlow solo mientras la UI está
  // visible (STARTED o superior), pausando la recolección en segundo plano —
  // más eficiente en batería que collectAsState() a secas.
  val tareas by viewModel.tareas.collectAsStateWithLifecycle()
  val cargando by viewModel.cargando.collectAsStateWithLifecycle()

  androidx.compose.runtime.LaunchedEffect(Unit) {
    viewModel.cargarTareas()
  }

  if (cargando) {
    androidx.compose.material3.Text("Cargando...")
  } else {
    androidx.compose.foundation.lazy.LazyColumn {
      items(tareas) { tarea -> androidx.compose.material3.Text(tarea.titulo) }
    }
  }
}
