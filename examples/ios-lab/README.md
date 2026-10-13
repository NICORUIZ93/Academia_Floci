# Laboratorio iOS

Desde esta carpeta: `swift test` en macOS con Swift 6 y `swift build`. Las pruebas de cancelación controlan el inicio y la respuesta sin sleeps ni red. El paquete requiere macOS 14 / iOS 17 y se añade a una app iOS mediante File → Add Package Dependencies → Add Local en Xcode; importa `RutaFlowLab` y monta `ListaEnvios(vm: EnviosViewModel())`.

`EnviosViewModel` estudia carga/cancelación, no implementa persistencia SwiftData. `EnvioLocal` es el modelo inicial para el ejercicio de migraciones; el plan de migración se construye en ese tema. `MotorSincronizacion` es una cola EN MEMORIA: no promete persistir tras cerrar la aplicación. `SesionVault` guarda/actualiza secretos pequeños y propaga errores de Keychain.

Mapa y cámara compilan solo para iOS. La app anfitriona debe declarar NSCameraUsageDescription y NSPhotoLibraryUsageDescription con su motivo real, presentar SelectorFotoEntrega como sheet y comprobar permisos en un dispositivo. El fallback del simulador usa galería. Una compilación no prueba acceso real a cámara, Keychain ni migraciones.
