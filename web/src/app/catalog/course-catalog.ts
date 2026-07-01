import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CloudCog, LucideAngularModule, LucideIconData } from 'lucide-angular';
import { TRACKS } from '../course-data';
import { TRACK_ICONS } from '../icon-registry';
import { ProgressService } from '../progress.service';

interface TrackCard {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  color: string;
  icon: LucideIconData;
  moduleCount: number;
  percent: number;
  totalHours: string;
  levels: string;
  modules: string[];
  outcome: string;
}

@Component({
  selector: 'app-course-catalog',
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './course-catalog.html',
  styleUrl: './course-catalog.scss',
})
export class CourseCatalogComponent {
  readonly brandIcon = CloudCog;
  readonly primaryRoute = [
    'Abre la consola y prepara tu equipo en Mac, Windows o Linux.',
    'Aprende programación base con JavaScript o Java según tu meta.',
    'Construye backend con Node.js o Spring Boot.',
    'Crea interfaz web con Angular o React.',
    'Crea móvil con Flutter, Android, iOS o Kotlin Multiplatform.',
    'Integra todo con Cloud local: AWS, Azure, GCP, Docker, pruebas y despliegue local.',
  ];
  readonly cloudLocalLevels = [
    {
      level: 'Básico',
      title: 'Fundamentos de Cloud local',
      what: 'Cloud computing, virtualización, escalabilidad, elasticidad, IaaS/PaaS/SaaS, nube pública, privada, híbrida y multi-cloud.',
      how: 'Instala Docker, levanta AWS local en el puerto 4566, Azure local en 4577 y GCP local en 4588. Verifica cada nube con su CLI apuntando a localhost.',
      why: 'Practicas cloud sin cuenta, sin token, sin cuotas y sin pagar. Aprendes el concepto antes de depender de una consola real.',
      problem: 'Levanta los tres emuladores, crea un recurso mínimo y documenta qué comando confirma que está funcionando.',
      master: 'Explica cuándo un emulador local sirve para desarrollo y pruebas, y cuándo debes validar contra la nube real.',
    },
    {
      level: 'Medio',
      title: 'Servicios core por proveedor',
      what: 'AWS, Azure y GCP nombran distinto servicios equivalentes: storage, colas, funciones, bases de datos, secretos, eventos y observabilidad.',
      how: 'AWS: S3, SQS, DynamoDB, Lambda, API Gateway, RDS, ECS/EKS, CloudWatch. Azure: Blob, Queue, Table, Cosmos DB, Functions, Key Vault, Event Hubs. GCP: Storage, Pub/Sub, Firestore, Datastore, Bigtable, Spanner, Cloud Functions.',
      why: 'El alumno aprende patrones transferibles: guardar archivos, desacoplar mensajes, ejecutar funciones, persistir datos y exponer APIs.',
      problem: 'Construye la misma mini API de tareas usando un servicio de storage, una cola y una base de datos en al menos dos proveedores.',
      master: 'Compara qué fue igual, qué cambió y qué abstracción NO deberías ocultar en una arquitectura multi-cloud.',
    },
    {
      level: 'Avanzado',
      title: 'Arquitectura, rendimiento y DevOps',
      what: 'Arranque rápido, bajo consumo, motores reales cuando importa la fidelidad, IaC, SDKs oficiales, CI/CD y Testcontainers.',
      how: 'Usa Terraform/OpenTofu, AWS CDK o CloudFormation contra cloud local. Prueba Lambda, RDS, Kafka/MSK, Redis/ElastiCache, EKS y builds con Docker.',
      why: 'No basta con mockear respuestas. cloud local permite validar comportamiento más cercano a producción usando motores reales.',
      problem: 'Crea un pipeline local que levante cloud local, despliegue infraestructura, ejecute pruebas de integración y destruya recursos.',
      master: 'Defiende qué pruebas pertenecen al entorno local, cuáles al CI y cuáles obligatoriamente a cloud real.',
    },
    {
      level: 'Master',
      title: 'Migración, contribución y límites',
      what: 'Migración desde emuladores separados, hoja de ruta, contribución open source, licencia MIT y límites de usar cloud local en producción.',
      how: 'Reutiliza endpoint 4566 para migrar desde LocalStack, centraliza Azure/GCP en endpoints únicos y revisa compatibilidad por servicio.',
      why: 'El objetivo no es “casarse” con una herramienta: es aprender cloud con fidelidad, costo cero y una ruta sostenible.',
      problem: 'Documenta una estrategia de migración para un equipo que hoy usa emuladores separados y quiere un laboratorio local único.',
      master: 'Explica limitaciones, riesgos, sostenibilidad del proyecto, licencia MIT y criterios para contribuir o extender servicios.',
    },
  ];
  readonly providerServices = [
    { provider: 'AWS local · 4566 · 65 servicios', groups: ['Storage: S3, S3 Vectors, EFS', 'Mensajería: SQS, SNS, EventBridge, Scheduler, Kinesis, MSK', 'Compute: Lambda, ECS, EKS, EC2, CodeBuild', 'Datos: DynamoDB, RDS, ElastiCache, OpenSearch, Glue, Athena', 'Seguridad: IAM, STS, KMS, Cognito, Secrets Manager, SSM'] },
    { provider: 'Azure local · 4577 · 19+ servicios', groups: ['Storage: Blob, Queue y Table Storage', 'Serverless: Azure Functions HTTP y Timer', 'Datos: Cosmos DB, Azure SQL, PostgreSQL, Cache for Redis', 'Mensajería: Event Hubs, Service Bus, Event Grid', 'Plataforma: Key Vault, App Configuration, AKS, API Management, Virtual Network, Container Registry, Azure Monitor'] },
    { provider: 'GCP local · 4588 · 17 servicios', groups: ['Storage: Cloud Storage', 'Mensajería: Pub/Sub, Cloud Tasks, Managed Kafka, Cloud Scheduler', 'Datos: Firestore, Datastore, Cloud SQL', 'Serverless: Cloud Run, Cloud Functions', 'Seguridad y ops: Secret Manager, IAM, KMS, Cloud Logging, Cloud Monitoring, GKE, Operations'] },
  ];
  readonly learningLayers = [
    { title: '1. El qué', goal: 'Entender el concepto', detail: 'Definición simple, analogía del mundo real, vocabulario mínimo y dibujo mental antes de escribir código.', time: '20%' },
    { title: '2. El cómo', goal: 'Verlo funcionando', detail: 'Comandos exactos, ejemplo pequeño, código escrito por el alumno y explicación línea por línea.', time: '30%' },
    { title: '3. El por qué', goal: 'Razonar decisiones', detail: 'Comparativas, ventajas, límites, cuándo usarlo, cuándo evitarlo y errores de diseño comunes.', time: '20%' },
    { title: '4. El problema', goal: 'Practicar sin copiar', detail: 'Reto guiado, código roto, caso real, pistas graduales y criterios claros para saber si quedó bien.', time: '20%' },
    { title: '5. El maestro', goal: 'Pensar como profesional', detail: 'Arquitectura, rendimiento, seguridad, entrevistas, trade-offs y explicación para enseñar a otra persona.', time: '10%' },
  ];
  readonly learnerProfiles = [
    { title: 'Principiante absoluto', detail: 'Empieza con analogías, consola desde cero, sesiones cortas y ejercicios pequeños que muestran resultado inmediato.' },
    { title: 'Adulto que cambia de carrera', detail: 'Aprende con problemas de negocio: APIs, bases de datos, frontends, despliegues y errores reales documentados.' },
    { title: 'Profesional', detail: 'Puede saltar fundamentos y entrar a arquitectura, rendimiento, seguridad, migraciones, testing y decisiones trade-off.' },
  ];
  readonly studyCycle = [
    'Ver: lee la explicación y el objetivo.',
    'Hacer: escribe el código tú mismo.',
    'Romper: cambia algo y observa el error.',
    'Explicar: describe con tus palabras qué pasó.',
    'Enseñar: deja una nota o mini-guía para tu yo futuro.',
  ];
  readonly chapterStructure = [
    { title: 'Introducción', detail: 'Contexto, historia corta, por qué importa y qué vas a poder hacer al terminar.' },
    { title: 'Objetivos', detail: 'Tres a cinco metas medibles para saber exactamente qué debes dominar.' },
    { title: 'Teoría esencial', detail: 'Analogía, diagrama mental, vocabulario y explicación técnica mínima.' },
    { title: 'Ejemplo guiado', detail: 'Código o comando paso a paso, con explicación de cada línea importante.' },
    { title: 'Profundización', detail: 'Comparativas, casos reales, decisiones de diseño, límites y alternativas.' },
    { title: 'Ejercicios', detail: 'Retos de dificultad creciente, errores comunes, pistas y criterios de éxito.' },
    { title: 'Desafío master', detail: 'Problema integrador sin solución copiada para demostrar criterio profesional.' },
  ];
  readonly studyPlans = [
    { title: 'Principiante: 6 meses', detail: '1 a 2 horas diarias. JavaScript, Node.js, frontend, Java/Spring, DevOps y proyecto final full-stack.' },
    { title: 'Profesional: 3 meses', detail: '2 a 3 horas diarias. Avanzado backend, Kubernetes, cloud local, frontend moderno, móvil y sistema cloud-native.' },
  ];
  readonly gamification = [
    { title: 'Insignias', detail: 'Explorador, Constructor, Arquitecto y Maestro según la capa completada.' },
    { title: 'XP', detail: 'Puntos por ejercicios, retos, módulos terminados y explicaciones escritas por el alumno.' },
    { title: 'Speedrun', detail: 'Retos cronometrados para medir fluidez cuando ya entiendes la base.' },
  ];
  readonly toolsByLevel = [
    { level: 'Principiante', tools: 'VS Code, terminal integrada, extensiones básicas, Docker Desktop y playgrounds.' },
    { level: 'Cambio de carrera', tools: 'GitHub, Postman, Docker Compose, bases de datos locales y documentación oficial.' },
    { level: 'Profesional', tools: 'JetBrains, Kubernetes local, Terraform/OpenTofu, Prometheus, Grafana y CI/CD.' },
  ];
  readonly setupGuides = [
    { os: 'Mac', steps: ['Abrir Terminal: Cmd + Espacio, escribe Terminal y Enter.', 'Instalar Homebrew si falta.', 'Instalar VS Code, Docker Desktop, Git y Node.js.', 'Usar Cmd + ` para cambiar entre ventanas del editor.'] },
    { os: 'Windows', steps: ['Abrir PowerShell: Win + X y elegir Terminal.', 'Instalar Git, Node.js LTS, VS Code y Docker Desktop.', 'Activar WSL2 para comandos Linux.', 'Usar Ctrl + ` para abrir la terminal dentro de VS Code.'] },
    { os: 'Linux', steps: ['Abrir terminal: Ctrl + Alt + T.', 'Instalar Git, curl, Node.js LTS y Docker Engine.', 'Agregar tu usuario al grupo docker si hace falta.', 'Usar VS Code o JetBrains según el lenguaje.'] },
  ];
  readonly evaluationLevels = [
    { level: 'Básico', question: '¿Puedes explicar qué hace cada línea?' },
    { level: 'Medio', question: '¿Puedes adaptarlo a otro caso?' },
    { level: 'Avanzado', question: '¿Puedes integrarlo, probarlo y optimizarlo?' },
    { level: 'Master', question: '¿Puedes diseñarlo desde cero y defender tus decisiones?' },
  ];
  readonly ecommercePath = [
    'Flutter: catálogo, detalle de producto, carrito, checkout, perfil y estado local.',
    'Spring Boot: API REST, productos, usuarios, órdenes, seguridad JWT y validaciones.',
    'Base de datos: PostgreSQL para órdenes, DynamoDB/NoSQL para eventos y cache cuando aplique.',
    'Cloud local: S3/Blob/Storage, SQS/Service Bus/Pub/Sub, secretos, logs y pruebas locales.',
    'DevOps: Docker, docker compose, CI/CD, pruebas automatizadas y despliegue reproducible.',
    'Nivel master: observabilidad, errores controlados, rendimiento, arquitectura y documentación técnica.',
  ];
  readonly languageChoices = [
    'JavaScript + Node.js',
    'Java + Spring Boot',
    'Angular',
    'React',
    'Flutter + Dart',
    'Android + Kotlin',
    'iOS + Swift',
    'Kotlin Multiplatform',
  ];

  constructor(private readonly progressService: ProgressService) {}

  readonly cards = computed<TrackCard[]>(() =>
    TRACKS.map(track => ({
      id: track.id,
      name: track.name,
      shortName: track.shortName,
      tagline: track.tagline,
      color: track.color,
      icon: TRACK_ICONS[track.icon],
      moduleCount: track.modules.length,
      percent: this.percentFor(track.id, track.modules.length),
      totalHours: this.totalHours(track.modules),
      levels: [...new Set(track.modules.map(module => module.level))].join(' → '),
      modules: track.modules.map(module => module.shortTitle),
      outcome: track.modules.at(-1)?.deliverable ?? 'Proyecto final de la ruta.',
    }))
  );

  readonly featuredTracks = computed(() => this.cards().filter(card => ['cloud', 'flutter', 'spring-boot', 'devops'].includes(card.id)));
  readonly foundationTracks = computed(() => this.cards().filter(card => ['javascript', 'java', 'node', 'angular', 'react'].includes(card.id)));
  readonly mobileTracks = computed(() => this.cards().filter(card => ['flutter', 'android', 'ios', 'kotlin-multiplatform'].includes(card.id)));

  trackGroups() {
    return [
      { title: 'Ruta recomendada para el proyecto e-commerce', description: 'Lo mínimo para construir una app real de punta a punta.', cards: this.featuredTracks() },
      { title: 'Bases y frontend/backend', description: 'Lenguajes y frameworks para entender el código antes de integrar cloud.', cards: this.foundationTracks() },
      { title: 'Móvil', description: 'Opciones populares para labs y ejemplos del tutorial hero.', cards: this.mobileTracks() },
    ];
  }

  /** El track 'cloud' guarda su progreso en su propia clave heredada de localStorage; los demás usan ProgressService. */
  private percentFor(trackId: string, totalModules: number): number {
    if (trackId === 'cloud') {
      try {
        const completed: number[] = JSON.parse(localStorage.getItem('cloud-local-academy-progress') || '{}').completedModules || [];
        return totalModules ? Math.round((completed.length / totalModules) * 100) : 0;
      } catch {
        return 0;
      }
    }
    return this.progressService.percentComplete(trackId, totalModules);
  }

  private totalHours(modules: { duration: string }[]): string {
    const total = modules.reduce((sum, module) => {
      const match = module.duration.match(/(\d+(?:[.,]\d+)?)/);
      return sum + (match ? Number(match[1].replace(',', '.')) : 0);
    }, 0);
    return `${Math.round(total)} h`;
  }
}
