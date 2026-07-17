#!/usr/bin/env python3
"""Publica un atlas de temas derivado de documentación primaria."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
START, END = "<!-- OFFICIAL-TOPIC-ATLAS:START -->", "<!-- OFFICIAL-TOPIC-ATLAS:END -->"

DATA = {
"javascript": (13,"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",{
"Lenguaje":"gramática y tipos;coerción e igualdad;alcance y closures;prototipos;clases y campos privados;símbolos;Proxy y Reflect",
"Datos":"arrays inmutables;Map y Set;WeakMap y WeakSet;typed arrays;ArrayBuffer y DataView;Temporal;Intl y Unicode",
"Asincronía":"errores y causas;promesas;async/await;iteradores;generadores;iteradores asíncronos;AbortController",
"Módulos":"ES modules;import dinámico;top-level await;ciclos;import maps;using y await using;DisposableStack",
"Web":"DOM y eventos;formularios;Fetch y streams;WebSocket;workers;IndexedDB;service workers y PWA",
"Calidad":"testing;profiling;memoria y GC;accesibilidad;XSS y CSP;compatibilidad;supply chain"}),
"node": (13,"https://nodejs.org/api/",{
"Runtime":"event loop;timers;microtasks;EventEmitter;buffers;streams;backpressure;ESM y CommonJS",
"Sistema":"filesystem;paths y URLs;procesos;señales;child_process;worker_threads;cluster;permission model",
"Red":"HTTP/HTTPS;HTTP/2;DNS;TCP/UDP;TLS;proxies;timeouts;Web APIs compatibles",
"Datos":"SQLite;serialización;compresión;crypto;blobs;variables de entorno;configuración validada",
"Calidad":"node:test;mocks;coverage;benchmarks;diagnostics_channel;AsyncLocalStorage;inspector;heap snapshots",
"Producción":"TypeScript;package exports;semver;seguridad de dependencias;graceful shutdown;observabilidad;idempotencia"}),
"angular": (14,"https://angular.dev/overview",{
"Fundamentos":"standalone components;templates;bindings;directivas;pipes;servicios;inyección de dependencias",
"Reactividad":"signals;computed;effect;linkedSignal;resource;RxJS;interop signal-observable;estado derivado",
"Aplicación":"router;guards;resolvers;formularios reactivos;validación;HTTP;interceptores;errores",
"Renderizado":"SSR;SSG;hydration;incremental hydration;event replay;zoneless;deferred views;streaming",
"Arquitectura":"lazy loading;dominios;librerías;monorepos;configuración;i18n;microfrontends con criterio",
"Calidad":"testing;harnesses;accesibilidad;sanitización;CSP y Trusted Types;rendimiento;profiling;migraciones"}),
"react": (13,"https://react.dev/reference/react",{
"Modelo":"pureza;JSX;props;estado;keys;render y commit;eventos;estado como snapshot",
"Hooks":"useState;useReducer;useContext;useRef;useEffect;useLayoutEffect;useEffectEvent;hooks propios",
"UX":"formularios;Actions;useActionState;useOptimistic;useTransition;Suspense;use;error boundaries",
"Servidor":"SSR;streaming;hidratación;Server Components;Server Functions;use client/use server;serialización",
"Optimización":"React Compiler;reglas del compilador;memoización;profiler;code splitting;caché;virtualización",
"Ingeniería":"routing;testing;accesibilidad;seguridad RSC;estado remoto;arquitectura;migración"}),
"java": (14,"https://docs.oracle.com/en/java/javase/25/",{
"Lenguaje":"tipos y control;objetos;records;sealed types;pattern matching;genéricos;anotaciones;JPMS",
"Biblioteca":"colecciones;streams;Optional;fechas;i18n;regex;NIO.2;HTTP Client;serialización segura",
"Concurrencia":"Java Memory Model;locks;atomics;concurrent collections;CompletableFuture;virtual threads;scoped values;structured concurrency",
"JVM":"bytecode;class loading;JIT;memoria;garbage collectors;Flight Recorder;jcmd y jstack;heap dumps;CDS y AOT",
"Integración":"JDBC;transacciones;ServiceLoader;reflection;method handles;Foreign Function and Memory API;JNI",
"Calidad":"JUnit;property testing;JMH;profiling;secure coding;criptografía;jlink y jpackage;migración LTS"}),
"spring-boot": (13,"https://docs.spring.io/spring-boot/reference/",{
"Núcleo":"auto-configuration;starters;configuration properties;profiles;DI;lifecycle;logging;failure analyzers",
"Web":"MVC;WebFlux;validación;Problem Details;filtros;CORS;REST clients;GraphQL;WebSocket;gRPC",
"Datos":"JDBC;JPA;R2DBC;transacciones;migrations;MongoDB;Redis;cache;locking;Testcontainers",
"Seguridad":"Spring Security;OAuth2 y OIDC;resource server;method security;CSRF;headers;secretos;SAML",
"Integración":"Kafka;AMQP;JMS;scheduling;batch;mail;outbox;idempotencia;circuit breakers;contratos",
"Operación":"Actuator;Micrometer;OpenTelemetry;health groups;graceful shutdown;native images;Buildpacks;Kubernetes"}),
"kotlin-multiplatform": (12,"https://kotlinlang.org/docs/multiplatform/get-started.html",{
"Kotlin":"null safety;data classes;sealed types;genéricos;coroutines;Flow;serialization;time e IO",
"Estructura":"targets;source sets;commonMain y commonTest;expect/actual;Gradle;version catalogs;convention plugins",
"Datos":"HTTP client;almacenamiento;SQLDelight;repositorios;caché;offline-first;sincronización;errores tipados",
"UI":"Compose Multiplatform;estado;recursos;localización;navegación;deep links;accesibilidad;UI testing",
"Interop":"Swift export;Objective-C;UIKit y SwiftUI;Android;JVM;JS y Wasm;C interop;ownership",
"Entrega":"XCFramework;publicación;compatibilidad binaria;Hot Reload;benchmarks;CI multi-target;seguridad"}),
"android": (13,"https://developer.android.com/develop",{
"Plataforma":"componentes;lifecycle;configuration changes;intents;deep links;permisos;storage;procesos y memoria",
"Compose":"estado y recomposición;layout;Material 3;navegación;listas;animación;adaptive UI;semantics",
"Arquitectura":"UDF;ViewModel;coroutines y Flow;repositorios;dominio;modularización;DI;errores",
"Datos":"Room;DataStore;networking;paging;cache;offline-first;sync;WorkManager;conflictos",
"Dispositivo":"location;geofencing;maps;camera;scanning;sensors;Bluetooth;notifications;foreground services;batería",
"Producción":"testing;Macrobenchmark;Baseline Profiles;ANR;memoria;accesibilidad;seguridad;Play Integrity;rollout"}),
"ios": (13,"https://developer.apple.com/documentation/swiftui",{
"Swift":"value types;optionals;protocols;generics;errors;collections;ARC;ownership;Swift packages",
"SwiftUI":"View;identity;state;Observation;environment;layout;navigation;animations;gestures;localization",
"Concurrencia":"async/await;Task;task groups;actors;MainActor;Sendable;cancelación;AsyncSequence;Swift 6 isolation",
"Datos":"URLSession;Codable;SwiftData y Core Data;cache;offline-first;migrations;CloudKit;Keychain;files",
"Plataforma":"Core Location;MapKit;background tasks;push;camera;biometrics;widgets;App Intents;UIKit interop",
"Producción":"Swift Testing;XCTest;UI tests;Instruments;VoiceOver;energy;privacy;signing;TestFlight;crashes"}),
"flutter": (13,"https://docs.flutter.dev/",{
"Dart":"null safety;types;classes y mixins;collections;futures;streams;isolates;records;patterns;extensions",
"UI":"widget-element-render object;constraints;state;navigation;forms;Material y Cupertino;animation;gestures",
"Arquitectura":"views y view models;repositories;services;domain;DI;explicit states;error handling",
"Datos":"HTTP;serialization;SQLite;files;secure storage;cache;offline-first;outbox;sync;deep links",
"Plataforma":"platform channels;FFI;plugins;add-to-app;web y desktop;location;maps;background;notifications",
"Producción":"unit/widget/integration tests;golden tests;DevTools;performance;accessibility;l10n;security;flavors;stores"}),
"devops": (14,"https://kubernetes.io/docs/concepts/",{
"Sistemas":"Linux;processes;signals;permissions;systemd;networks;DNS;TLS;storage;troubleshooting;scripting",
"Contenedores":"OCI;image layers;BuildKit;rootless;Compose;registries;scanning;SBOM;signatures;runtime security",
"CI/CD":"pipelines;quality gates;immutable artifacts;environments;promotion;progressive delivery;rollback;GitOps",
"Kubernetes":"architecture;Pods;workloads;Services;Gateway API;storage;secrets;RBAC;policies;scheduling;autoscaling;operators",
"IaC":"Terraform language;modules;remote state y locking;providers;import;testing;policy as code;drift;secrets",
"Operación":"OpenTelemetry;logs metrics traces;SLI y SLO;burn-rate alerts;incidents;capacity;chaos;restore;FinOps;platform engineering"}),
"cloud": (32,"https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html",{
"Fundamentos":"IaaS PaaS SaaS;regions and zones;shared responsibility;identity;networks;compute;storage;databases",
"Arquitecturas":"Well-Architected;landing zones;multi-account;serverless;containers;event-driven;microservices;batch;edge",
"Datos":"relational;key-value;document;graph;time-series;object storage;lakehouse;streaming;governance;residency",
"Seguridad":"IAM and federation;zero trust;KMS;secrets;WAF and DDoS;posture;audit;threat detection;supply chain;compliance",
"Confiabilidad":"HA;quorum;retries;idempotency;queues;circuit breaker;autoscaling;multi-region;backup;restore;RPO RTO;chaos",
"Operación":"observability;SLO;IaC;policy;FinOps;sustainability;performance;migration;hybrid;AI ML governance;deprecations"})}

def block(track, source, groups):
    evidence={"javascript":"widget web","node":"API","angular":"consola","react":"portal","java":"tarifas","spring-boot":"entregas","kotlin-multiplatform":"sync","android":"app conductor","ios":"app conductor","flutter":"app conductor","devops":"plataforma","cloud":"arquitectura"}[track]
    rows=[]; total=0
    for area, raw in groups.items():
        topics=raw.split(";"); total += len(topics)
        rows.append(f"| {area} | " + " · ".join(f"`{x}`" for x in topics) + f" | {evidence} RutaFlow |")
    return f"""{START}
## Atlas completo de temas oficiales

Derivado de la [documentación oficial]({source}), sus referencias, migraciones y guías de operación. Inventariar no equivale a dominar: cada selección se demuestra con código, prueba, medición y explicación. **Cobertura: {total} temas.**

| Área | Temas que deben poder explicarse y aplicarse | Evidencia práctica |
|---|---|---|
{chr(10).join(rows)}

### Método de estudio y proyecto de ampliación

Para cada tema responde qué problema resuelve, cuál es su modelo mental, cómo falla, cómo se verifica y cuándo no conviene. Elige uno por área e intégralos en una vertical RutaFlow. Entrega diagrama, ADR, pruebas de éxito y fallo, una medición, una amenaza y el enlace oficial con versión y fecha. Una API preview se aísla en laboratorio y nunca se presenta como base estable.
{END}
""", total

inventory={"reviewedAt":"2026-07-17","method":"documentación primaria del mantenedor","tracks":[]}
for track,(module,source,groups) in DATA.items():
    path=ROOT/f"web/public/content/{track}/modulo-{module}.md"
    text=path.read_text(encoding="utf-8"); rendered,total=block(track,source,groups)
    if START in text:
        before,rest=text.split(START,1); _,after=rest.split(END,1); text=before.rstrip()+"\n\n"+rendered+after
    else: text=text.replace("## Resumen del módulo",rendered+"\n## Resumen del módulo")
    path.write_text(text,encoding="utf-8")
    inventory["tracks"].append({"id":track,"content":str(path.relative_to(ROOT)),"source":source,"topicCount":total,"areas":groups})
(ROOT/"docs/official-topic-atlas.json").write_text(json.dumps(inventory,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(f"Atlas oficial: {sum(x['topicCount'] for x in inventory['tracks'])} temas en {len(DATA)} tracks")
