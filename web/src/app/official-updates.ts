export interface OfficialUpdate {
  stack: string;
  baseline: string;
  url: string;
}

/** Resumen editorial; la CI comprueba vigencia y enlaces desde docs/official-sources.json. */
export const OFFICIAL_UPDATES: OfficialUpdate[] = [
  { stack: 'JavaScript', baseline: 'ECMAScript 2026 · propuestas TC39', url: 'https://tc39.es/ecma262/' },
  { stack: 'Node.js', baseline: 'Node.js 24 LTS · ciclo de versiones', url: 'https://nodejs.org/en/about/previous-releases' },
  { stack: 'Angular', baseline: 'Angular v22 · guía de actualización', url: 'https://angular.dev/update-guide' },
  { stack: 'React', baseline: 'React 19.2 · seguridad y notas', url: 'https://react.dev/blog' },
  { stack: 'Java', baseline: 'Java 25 LTS · JEP index', url: 'https://openjdk.org/jeps/0' },
  { stack: 'Spring Boot', baseline: 'Spring Boot 4.1 · release notes', url: 'https://spring.io/projects/spring-boot' },
  { stack: 'Kotlin', baseline: 'Kotlin 2.4 · Multiplatform', url: 'https://kotlinlang.org/docs/releases.html' },
  { stack: 'Android', baseline: 'Android 17 · API 37', url: 'https://developer.android.com/about/versions/17/summary' },
  { stack: 'iOS / Swift', baseline: 'Swift 6.2 · SwiftUI updates', url: 'https://developer.apple.com/documentation/updates' },
  { stack: 'Flutter', baseline: 'Flutter 3.44 · Dart 3.11', url: 'https://docs.flutter.dev/release' },
  { stack: 'DevOps', baseline: 'Kubernetes · OpenTelemetry · Terraform', url: 'https://kubernetes.io/releases/' },
  { stack: 'Cloud', baseline: 'AWS · Azure · Google Cloud · Floci', url: 'https://aws.amazon.com/new/' },
];
