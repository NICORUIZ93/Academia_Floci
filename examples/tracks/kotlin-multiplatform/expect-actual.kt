// expect/actual (Módulos 3-4): código específico de plataforma con una API común.
// Este patrón es el corazón de KMP: el módulo `commonMain` declara QUÉ existe,
// y cada plataforma (`androidMain`, `iosMain`) declara CÓMO se implementa.

// --- en src/commonMain/kotlin/Platform.kt ---
expect class Platform() {
  val nombre: String
}

expect fun idUnicoDispositivo(): String

// El código compartido usa la API común sin saber (ni necesitar saber) en qué
// plataforma corre realmente — esa decisión queda resuelta en tiempo de compilación.
fun saludo(): String {
  return "Corriendo en ${Platform().nombre}, dispositivo ${idUnicoDispositivo()}"
}

// --- en src/androidMain/kotlin/Platform.android.kt ---
// actual class Platform actual constructor() {
//   actual val nombre: String = "Android ${android.os.Build.VERSION.SDK_INT}"
// }
// actual fun idUnicoDispositivo(): String =
//   android.provider.Settings.Secure.ANDROID_ID

// --- en src/iosMain/kotlin/Platform.ios.kt ---
// actual class Platform actual constructor() {
//   actual val nombre: String = UIDevice.currentDevice.systemName() +
//     " " + UIDevice.currentDevice.systemVersion
// }
// actual fun idUnicoDispositivo(): String =
//   UIDevice.currentDevice.identifierForVendor?.UUIDString ?: "desconocido"
