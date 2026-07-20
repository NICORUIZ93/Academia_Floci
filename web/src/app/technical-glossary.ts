export interface TechnicalTerm {
  term: string;
  definition: string;
}

const SHARED: TechnicalTerm[] = [
  { term: 'API', definition: 'Contrato que permite a dos sistemas intercambiar solicitudes y respuestas sin conocer su implementación interna.' },
  { term: 'idempotencia', definition: 'Propiedad por la que repetir la misma operación produce el mismo efecto observable que ejecutarla una sola vez.' },
  { term: 'backpressure', definition: 'Mecanismo con el que un consumidor limita la velocidad del productor para no saturar memoria ni recursos.' },
  { term: 'inmutabilidad', definition: 'Decisión de no modificar un valor después de crearlo; los cambios producen un valor nuevo y trazable.' },
  { term: 'inyección de dependencias', definition: 'Técnica para recibir colaboraciones desde el exterior en lugar de construirlas dentro de la clase o función.' },
  { term: 'DTO', definition: 'Objeto diseñado para transportar datos a través de una frontera sin exponer directamente el modelo interno.' },
  { term: 'JWT', definition: 'Formato firmado para transportar afirmaciones; no cifra por defecto ni reemplaza la autorización.' },
  { term: 'WebSocket', definition: 'Conexión persistente y bidireccional entre cliente y servidor para intercambiar mensajes en tiempo real.' },
];

const BY_TRACK: Record<string, TechnicalTerm[]> = {
  angular: [
    { term: '@Component', definition: 'Decorador que aporta a Angular los metadatos necesarios para crear y renderizar un componente.' },
    { term: 'signal', definition: 'Contenedor reactivo que notifica a Angular cuando cambia un valor leído por la interfaz.' },
    { term: 'computed', definition: 'Valor derivado y memorizado que Angular recalcula cuando cambia alguna signal utilizada.' },
    { term: 'effect', definition: 'Efecto reactivo para sincronizar con sistemas externos; no debe usarse para duplicar estado derivable.' },
    { term: 'standalone', definition: 'Componente, directiva o pipe que declara sus dependencias directamente sin depender de un NgModule.' },
    { term: 'Observable', definition: 'Secuencia potencialmente asíncrona de cero o más valores que puede completarse o fallar.' },
  ],
  react: [
    { term: 'props', definition: 'Entradas de solo lectura que un componente recibe de su componente padre.' },
    { term: 'state', definition: 'Memoria local de un componente cuya actualización solicita un nuevo renderizado.' },
    { term: 'hook', definition: 'Función que conecta un componente funcional con estado, contexto, efectos u otras capacidades de React.' },
    { term: 'useEffect', definition: 'Hook para sincronizar el componente con un sistema externo después del renderizado.' },
    { term: 'useMemo', definition: 'Hook que reutiliza un cálculo entre renderizados cuando sus dependencias no cambian.' },
  ],
  java: [
    { term: '@Override', definition: 'Anotación que pide al compilador comprobar que el método redefine correctamente uno heredado.' },
    { term: 'interface', definition: 'Contrato de operaciones que separa lo que una capacidad ofrece de cómo está implementada.' },
    { term: 'record', definition: 'Tipo conciso para datos inmutables cuya identidad está determinada por sus componentes.' },
    { term: 'Optional', definition: 'Contenedor que expresa explícitamente que un resultado puede estar presente o ausente.' },
    { term: 'Stream', definition: 'Canal declarativo para transformar una secuencia de datos sin representar almacenamiento.' },
  ],
  'spring-boot': [
    { term: '@Component', definition: 'Registra una clase como bean administrado por el contenedor de Spring.' },
    { term: '@Service', definition: 'Especialización semántica de @Component para una clase que implementa lógica de aplicación o dominio.' },
    { term: '@Repository', definition: 'Marca un adaptador de persistencia y habilita la traducción de excepciones de acceso a datos.' },
    { term: '@Bean', definition: 'Declara que el valor retornado por un método debe ser administrado por el contenedor de Spring.' },
    { term: '@Transactional', definition: 'Define una frontera transaccional; Spring confirma el trabajo o lo revierte según el resultado y la configuración.' },
    { term: 'Mono', definition: 'Publicador reactivo de Reactor que emite como máximo un valor, una finalización vacía o un error.' },
    { term: 'Flux', definition: 'Publicador reactivo de Reactor que puede emitir de cero a muchos valores y respeta demanda.' },
  ],
  flutter: [
    { term: 'Widget', definition: 'Descripción inmutable de una parte de la interfaz; Flutter crea y actualiza elementos para materializarla.' },
    { term: 'Riverpod', definition: 'Sistema de estado e inyección de dependencias basado en providers observables y comprobables.' },
    { term: 'isolate', definition: 'Contexto de ejecución de Dart con memoria aislada que se comunica mediante mensajes.' },
    { term: 'BuildContext', definition: 'Referencia a la posición de un widget dentro del árbol, usada para consultar dependencias y navegación.' },
  ],
  android: [
    { term: 'Composable', definition: 'Función declarativa que describe interfaz en Jetpack Compose y puede recomponerse cuando cambia el estado leído.' },
    { term: 'ViewModel', definition: 'Contenedor de estado de pantalla que sobrevive cambios de configuración y separa UI de lógica.' },
    { term: 'Flow', definition: 'Flujo asíncrono de Kotlin que emite valores de forma secuencial y respeta cancelación.' },
    { term: 'coroutine', definition: 'Unidad cooperativa de trabajo suspendible que no necesita bloquear un hilo mientras espera.' },
  ],
  ios: [
    { term: 'View', definition: 'Descripción de interfaz en SwiftUI cuyo cuerpo se recalcula cuando cambian sus dependencias observadas.' },
    { term: '@State', definition: 'Almacenamiento local administrado por SwiftUI que invalida la vista cuando cambia.' },
    { term: 'actor', definition: 'Tipo de referencia que serializa el acceso a su estado mutable para evitar carreras de datos.' },
    { term: 'async/await', definition: 'Sintaxis de concurrencia estructurada para suspender una tarea sin bloquear el hilo.' },
  ],
  devops: [
    { term: 'Pod', definition: 'Unidad desplegable mínima de Kubernetes que agrupa uno o más contenedores con red y almacenamiento compartidos.' },
    { term: 'Ingress', definition: 'Reglas de entrada HTTP/HTTPS que un controlador traduce en enrutamiento hacia servicios del clúster.' },
    { term: 'reconciliation', definition: 'Bucle que compara estado deseado y real y ejecuta acciones para reducir la diferencia.' },
    { term: 'SLO', definition: 'Objetivo medible de confiabilidad acordado para un indicador y una ventana de tiempo.' },
  ],
  cloud: [
    { term: 'región', definition: 'Área geográfica independiente en la que un proveedor agrupa varias zonas de disponibilidad.' },
    { term: 'IAM', definition: 'Sistema de identidades, roles y políticas que determina quién puede ejecutar cada acción sobre cada recurso.' },
    { term: 'serverless', definition: 'Modelo administrado donde el equipo despliega código o configuración sin operar directamente los servidores subyacentes.' },
    { term: 'eventual consistency', definition: 'Modelo en el que las réplicas pueden diferir temporalmente, pero convergen si dejan de llegar actualizaciones.' },
  ],
};

export function glossaryFor(trackId: string): TechnicalTerm[] {
  return [...(BY_TRACK[trackId] ?? []), ...SHARED];
}
