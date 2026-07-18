const STORAGE_KEY = "academia-master-paso-actual";

const METHOD = [
  "Objetivo claro antes de estudiar.",
  "Teoria breve con analogias del mundo real.",
  "Practica ejecutable o mini ejercicio.",
  "Profundizacion para entender por que funciona.",
  "Errores comunes y como diagnosticarlos.",
  "Reto final para consolidar.",
  "Recursos para seguir profundizando.",
];

const GAMIFICATION = {
  xpPerLesson: 10,
  xpPerModule: 50,
  levels: [
    { name: "Básico", minXp: 0 },
    { name: "Intermedio", minXp: 300 },
    { name: "Avanzado", minXp: 900 },
    { name: "Master", minXp: 1800 },
  ],
  badges: [
    { id: "explorer", name: "Explorador", icon: "🧭", requirement: 1, description: "Completa tu primer módulo." },
    { id: "builder", name: "Constructor", icon: "🛠️", requirement: 3, description: "Completa tres módulos." },
    { id: "architect", name: "Arquitecto", icon: "🏛️", requirement: 6, description: "Completa seis módulos." },
    { id: "master", name: "Maestro", icon: "🏆", requirement: 8, description: "Completa toda la ruta." },
  ],
};

const COURSE_BLUEPRINTS = [
  {
    "id": "javascript",
    "title": "JavaScript",
    "description": "Lenguaje, navegador, rendimiento, seguridad web y arquitectura",
    "project": "Juego Adivina el numero con interfaz grafica",
    "code": "01",
    "levels": [
      {
        "title": "Fundamentos",
        "tone": "Los Cimientos",
        "topics": [
          {
            "title": "Historia y Filosofia",
            "subtopics": [
              "Nacimiento de JavaScript (1995, Brendan Eich, 10 dias)",
              "ECMAScript: estandares y evolucion (ES1 a ES2025)",
              "El ecosistema: navegadores, Node.js, Deno, Bun",
              "\u00bfPor que JavaScript domina el mundo?"
            ]
          },
          {
            "title": "Sintaxis y Tipos de Datos",
            "subtopics": [
              "Variables: var, let, const (scope, hoisting, TDZ)",
              "Tipos primitivos: string, number, boolean, null, undefined, symbol, bigint",
              "Objetos: literales, constructores, Object.create()",
              "Type coercion: implicita y explicita (truthy/falsy)",
              "Operadores: aritmeticos, asignacion, comparacion (== vs ===), logicos, ternarios, ?? (nullish coalescing), ?. (optional chaining)"
            ]
          },
          {
            "title": "Estructuras de Control",
            "subtopics": [
              "Condicionales: if/else, switch, match (propuesto)",
              "Bucles: for (clasico), for...in, for...of, while, do...while",
              "break, continue, label"
            ]
          },
          {
            "title": "Funciones",
            "subtopics": [
              "Declaracion vs expresion vs arrow functions",
              "Parametros: por defecto, rest parameters, destructuring",
              "El objeto arguments",
              "IIFE (Immediately Invoked Function Expression)",
              "Funciones de orden superior"
            ]
          },
          {
            "title": "Ambito y Closures",
            "subtopics": [
              "Global scope, function scope, block scope",
              "Lexical scoping y scope chain",
              "Hoisting: variables y funciones",
              "Closures: definicion, usos practicos (currying, module pattern, memorizacion)",
              "El module pattern y la revelacion"
            ]
          },
          {
            "title": "Arrays y Objetos",
            "subtopics": [
              "Arrays: metodos esenciales (push, pop, shift, unshift, slice, splice, concat, join, indexOf, includes, find, findIndex, some, every, map, filter, reduce, reduceRight, forEach, sort, reverse, flat, flatMap, toSorted, toReversed, toSpliced, with)",
              "Objetos: propiedades computadas, getters/setters, Object.keys(), Object.values(), Object.entries(), Object.fromEntries(), Object.assign(), Object.freeze(), Object.seal(), destructuring",
              "Map, Set, WeakMap, WeakSet"
            ]
          },
          {
            "title": "DOM y Eventos",
            "subtopics": [
              "Seleccionar elementos: getElementById, querySelector, querySelectorAll",
              "Manipular el DOM: createElement, appendChild, removeChild, textContent, innerHTML",
              "Eventos: addEventListener, removeEventListener, event object, propagation (burbujeo vs captura), delegacion de eventos",
              "event.preventDefault(), event.stopPropagation()"
            ]
          }
        ]
      },
      {
        "title": "Intermedio",
        "tone": "El Arte de la Programacion",
        "topics": [
          {
            "title": "Programacion Asincrona",
            "subtopics": [
              "Callbacks: callback hell, error-first callbacks",
              "Promises: new Promise(), Promise.resolve(), Promise.reject(), Promise.all(), Promise.allSettled(), Promise.race(), Promise.any(), Promise.withResolvers()",
              "Async/Await: async functions, await, manejo de errores con try/catch",
              "await using (Explicit Resource Management - ES2025)"
            ]
          },
          {
            "title": "Programacion Funcional",
            "subtopics": [
              "Funciones puras e inmutabilidad",
              "Composicion de funciones",
              "Currying y partial application",
              "Memoizacion",
              "Transducers"
            ]
          },
          {
            "title": "Manejo de Errores",
            "subtopics": [
              "try/catch/finally",
              "throw y errores personalizados",
              "Error object: name, message, stack",
              "assert y console.assert",
              "Promise.catch() vs try/catch en async/await"
            ]
          },
          {
            "title": "Modulos y Bundlers",
            "subtopics": [
              "CommonJS (require, module.exports)",
              "ES Modules (import, export)",
              "import() dinamico, import.meta, import defer, import attributes",
              "Bundlers: Webpack, Vite, Rollup, esbuild, Parcel",
              "Tree shaking y code splitting"
            ]
          },
          {
            "title": "Regular Expressions (Avanzado)",
            "subtopics": [
              "Sintaxis: caracteres, cuantificadores, grupos, lookaheads, lookbehinds",
              "RegExp flags: g, i, m, s, u, y, v (ES2025)",
              "String methods: match, replace, search, split",
              "RegExp methods: test, exec"
            ]
          },
          {
            "title": "Fechas y Tiempo",
            "subtopics": [
              "Date object: creacion, metodos, formateo",
              "Intl.DateTimeFormat, Intl.NumberFormat, Intl.RelativeTimeFormat",
              "Temporal proposal (fecha/hora moderna)"
            ]
          },
          {
            "title": "JSON y Serializacion",
            "subtopics": [
              "JSON.parse(), JSON.stringify()",
              "replacer y reviver functions",
              "toJSON() method"
            ]
          }
        ]
      },
      {
        "title": "Avanzado",
        "tone": "El Motor y la Memoria",
        "topics": [
          {
            "title": "El Motor de JavaScript (V8, SpiderMonkey, JavaScriptCore)",
            "subtopics": [
              "Compilacion JIT (Just-In-Time): Ignition (interpreter), TurboFan (compiler)",
              "AST (Abstract Syntax Tree) y parsing",
              "Optimizacion: hidden classes, inline caching"
            ]
          },
          {
            "title": "Modelo de Ejecucion",
            "subtopics": [
              "Execution Context: Global, Function, Eval",
              "Call Stack y stack overflow",
              "Scope Chain y Lexical Environment",
              "Variable Environment y hoisting"
            ]
          },
          {
            "title": "El Event Loop",
            "subtopics": [
              "Call Stack, Web APIs (o C++ APIs en Node), Task Queue (Macrotask Queue), Microtask Queue",
              "Fases del Event Loop en Node.js: timers, pending callbacks, idle/prepare, poll, check, close callbacks",
              "setTimeout, setInterval, setImmediate, process.nextTick(), queueMicrotask()",
              "requestAnimationFrame, requestIdleCallback"
            ]
          },
          {
            "title": "Memoria y Garbage Collection",
            "subtopics": [
              "Stack vs Heap",
              "Garbage Collection: Mark and Sweep, Generational GC, Incremental GC, Concurrent GC",
              "Memory leaks: causas y prevencion",
              "WeakMap, WeakSet, WeakRef, FinalizationRegistry"
            ]
          },
          {
            "title": "Prototypes y Herencia",
            "subtopics": [
              "__proto__, prototype, constructor",
              "Prototype chain",
              "Object.create(), Object.setPrototypeOf(), Object.getPrototypeOf()",
              "Herencia prototipica vs herencia clasica",
              "class syntax (syntactic sugar)"
            ]
          },
          {
            "title": "Programacion Orientada a Objetos en JS",
            "subtopics": [
              "Classes: constructor, extends, super, static, private (#), public",
              "Mixins y composicion",
              "instanceof, isPrototypeOf"
            ]
          },
          {
            "title": "Proxies y Reflect",
            "subtopics": [
              "new Proxy(target, handler): traps (get, set, has, deleteProperty, apply, construct, ownKeys, getPrototypeOf, setPrototypeOf, defineProperty, preventExtensions, isExtensible)",
              "Reflect API",
              "Casos de uso: validacion, logging, reactive programming"
            ]
          },
          {
            "title": "Generadores e Iteradores",
            "subtopics": [
              "function* y yield",
              "yield* (delegacion)",
              "next(), return(), throw()",
              "Symbol.iterator, Symbol.asyncIterator",
              "Iterables e iteradores personalizados",
              "for...of y for await...of"
            ]
          },
          {
            "title": "Simbolos (Symbols)",
            "subtopics": [
              "Symbol() y Symbol.for()",
              "Built-in symbols: Symbol.iterator, Symbol.asyncIterator, Symbol.hasInstance, Symbol.toStringTag, Symbol.toPrimitive, Symbol.species, Symbol.match, Symbol.replace, Symbol.search, Symbol.split"
            ]
          },
          {
            "title": "Tipado y Meta-programacion",
            "subtopics": [
              "typeof, instanceof, Array.isArray()",
              "Object.prototype.toString.call()",
              "Symbol.hasInstance, Symbol.toPrimitive, Symbol.toStringTag"
            ]
          },
          {
            "title": "ES2024/ES2025 (Novedades)",
            "subtopics": [
              "Promise.withResolvers(), Promise.try()",
              "Object.groupBy(), Map.groupBy()",
              "Atomics.pause()",
              "RegExp flag /v (set notation)",
              "using/await using (Explicit Resource Management)",
              "Decorators (stage 3)",
              "Iterator helpers (map, filter, take, drop, flatMap)",
              "Array.fromAsync()",
              "Float16Array"
            ]
          }
        ]
      },
      {
        "title": "Master",
        "tone": "Pensando como un Hacker",
        "topics": [
          {
            "title": "Performance y Optimizacion",
            "subtopics": [
              "Debouncing, throttling, raf",
              "Lazy loading, code splitting, preload, prefetch, preconnect",
              "Critical Rendering Path: DOM, CSSOM, Render Tree, Layout, Paint, Composite",
              "Core Web Vitals: LCP, FID, CLS, INP (Interaction to Next Paint)",
              "scheduler.yield(), scheduler.postTask()",
              "Web Workers, SharedWorkers, Service Workers",
              "OffscreenCanvas, WebGL, WebGPU",
              "performance.now(), PerformanceObserver, Performance API"
            ]
          },
          {
            "title": "Seguridad Ofensiva y Defensiva",
            "subtopics": [
              "XSS (Cross-Site Scripting): reflejado, almacenado, DOM-based",
              "CSRF (Cross-Site Request Forgery)",
              "Clickjacking, UI redressing",
              "Content Security Policy (CSP)",
              "CORS (Cross-Origin Resource Sharing)",
              "Cookies: HttpOnly, Secure, SameSite",
              "localStorage vs sessionStorage vs cookies",
              "OWASP Top 10 (aplicado a JavaScript)"
            ]
          },
          {
            "title": "Patrones de Diseno en JavaScript",
            "subtopics": [
              "Creacionales: Singleton, Factory, Abstract Factory, Builder, Prototype",
              "Estructurales: Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy",
              "De Comportamiento: Chain of Responsibility, Command, Interpreter, Iterator, Mediator, Memento, Observer, State, Strategy, Template Method, Visitor"
            ]
          },
          {
            "title": "Arquitectura de Software",
            "subtopics": [
              "MVC (Model-View-Controller), MVP, MVVM",
              "Clean Architecture, Hexagonal Architecture (Ports & Adapters)",
              "Event-Driven Architecture, CQRS, Event Sourcing",
              "Microservices vs Monolith"
            ]
          },
          {
            "title": "WebAssembly (WASM)",
            "subtopics": [
              "\u00bfQue es WebAssembly?",
              "Compilar C/C++, Rust, Go a WASM",
              "Interoperabilidad entre JS y WASM",
              "Casos de uso: juegos, edicion de video, machine learning en el navegador"
            ]
          },
          {
            "title": "WebRTC y Comunicacion en Tiempo Real",
            "subtopics": [
              "RTCPeerConnection, RTCDataChannel, getUserMedia()",
              "Signaling: ofertas, respuestas, ICE candidates",
              "STUN, TURN servers"
            ]
          },
          {
            "title": "Web3 y Blockchain con JavaScript",
            "subtopics": [
              "ethers.js, web3.js",
              "Smart contracts, transacciones, wallets",
              "IPFS y almacenamiento descentralizado"
            ]
          },
          {
            "title": "Machine Learning en el Navegador",
            "subtopics": [
              "TensorFlow.js: modelos pre-entrenados, transfer learning",
              "ONNX.js",
              "WebNN API (propuesta)"
            ]
          },
          {
            "title": "Accessibility (a11y)",
            "subtopics": [
              "ARIA attributes: roles, states, properties",
              "Navegacion por teclado: tabIndex, focus management",
              "prefers-reduced-motion, prefers-color-scheme",
              "aria-label, aria-labelledby, aria-describedby"
            ]
          },
          {
            "title": "Internationalization (i18n)",
            "subtopics": [
              "Intl API: DateTimeFormat, NumberFormat, RelativeTimeFormat, ListFormat, DisplayNames, Locale",
              "Intl.Collator, Intl.PluralRules",
              "Intl.Segmenter (segmentacion de texto)"
            ]
          },
          {
            "title": "Herramientas del Hacker",
            "subtopics": [
              "npm, yarn, pnpm: diferencias y casos de uso",
              "Vite, Webpack, Rollup, esbuild: comparativa",
              "ESLint, Prettier, Biome",
              "Husky, lint-staged, commitlint",
              "Jest, Vitest, Mocha, Chai, Sinon",
              "Cypress, Playwright, Puppeteer",
              "Chrome DevTools, Firefox Developer Tools",
              "Node.js inspector, ndb"
            ]
          },
          {
            "title": "Contribuir a Open Source",
            "subtopics": [
              "Como leer y entender codigo ajeno",
              "Como encontrar issues para contribuir",
              "Como hacer un PR (Pull Request) correcto",
              "Codigo de conducta y buenas practicas"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "node",
    "title": "Node.js",
    "description": "Backend, APIs, datos, observabilidad y produccion",
    "project": "API REST de tareas con autenticacion JWT",
    "code": "02",
    "levels": [
      {
        "title": "Fundamentos",
        "tone": "El Servidor",
        "topics": [
          {
            "title": "\u00bfQue es Node.js?",
            "subtopics": [
              "El motor V8 en el servidor",
              "Event-Driven Architecture, non-blocking I/O",
              "Single-threaded con event loop",
              "Node.js vs Deno vs Bun"
            ]
          },
          {
            "title": "Instalacion y Configuracion",
            "subtopics": [
              "nvm (Node Version Manager), fnm",
              "package.json: campos esenciales (name, version, scripts, dependencies, devDependencies)",
              "npm vs yarn vs pnpm"
            ]
          },
          {
            "title": "Modulos Core",
            "subtopics": [
              "fs: readFile, writeFile, readdir, stat, watch, createReadStream, createWriteStream",
              "path: join, resolve, dirname, basename, extname, parse, format",
              "http/https: createServer, request, get",
              "events: EventEmitter, on, emit, once, removeListener",
              "os: cpus, memory, platform, hostname, networkInterfaces",
              "buffer: Buffer.from, Buffer.alloc, Buffer.concat, toString, toJSON",
              "crypto: createHash, createHmac, randomBytes, createCipheriv, createDecipheriv, generateKeyPair, sign, verify",
              "util: promisify, callbackify, inspect, types, parseArgs",
              "child_process: spawn, exec, execFile, fork",
              "cluster: cluster.fork, cluster.isMaster, cluster.on('exit')",
              "worker_threads: Worker, parentPort, workerData, SharedArrayBuffer"
            ]
          },
          {
            "title": "El Event Loop en Node.js",
            "subtopics": [
              "Fases: timers, pending callbacks, idle/prepare, poll, check, close callbacks",
              "setTimeout, setInterval, setImmediate",
              "process.nextTick() vs setImmediate() vs setTimeout(0)",
              "process.on('beforeExit'), process.on('exit')"
            ]
          },
          {
            "title": "Streams",
            "subtopics": [
              "Readable: read, pipe, on('data'), on('end'), on('error')",
              "Writable: write, end, on('finish'), on('drain')",
              "Duplex: Readable + Writable",
              "Transform: modificar datos en transito",
              "Backpressure: readable.read(), writable.write() returns false",
              "stream.pipeline(), stream.finished(), stream.promises"
            ]
          },
          {
            "title": "Buffers y TypedArrays",
            "subtopics": [
              "Buffer.alloc, Buffer.from, Buffer.isBuffer",
              "Uint8Array, Int8Array, Float32Array, DataView"
            ]
          }
        ]
      },
      {
        "title": "Intermedio",
        "tone": "APIs y Bases de Datos",
        "topics": [
          {
            "title": "Express.js",
            "subtopics": [
              "express(): creacion de la app",
              "Routing: app.get(), app.post(), app.put(), app.delete(), app.patch(), app.all(), app.use(), app.route(), express.Router()",
              "Middlewares: application-level, router-level, error-handling, built-in (express.json(), express.urlencoded(), express.static())",
              "next() y ciclo de vida de una peticion",
              "req.params, req.query, req.body, req.headers, req.cookies, req.signedCookies",
              "res.status(), res.json(), res.send(), res.sendFile(), res.redirect(), res.cookie(), res.clearCookie()"
            ]
          },
          {
            "title": "Fastify (alternativa a Express)",
            "subtopics": [
              "fastify(): creacion de la app",
              "fastify.get(), fastify.post(), fastify.register(), fastify.decorate()",
              "Validacion con JSON Schema",
              "Hooks: onRequest, preParsing, preValidation, preHandler, preSerialization, onSend, onResponse",
              "Diferencias y cuando usar Fastify vs Express"
            ]
          },
          {
            "title": "Bases de Datos SQL",
            "subtopics": [
              "PostgreSQL, MySQL, SQLite",
              "Prisma ORM: schema, migrations, queries, relaciones, findMany, findUnique, create, update, delete, transaction",
              "Sequelize: Models, Associations (One-to-One, One-to-Many, Many-to-Many), Hooks, Transactions, Migrations",
              "TypeORM: Entities, Repositories, Relations, Migrations",
              "Knex.js: query builder, migrations, seeds",
              "Connection pooling (HikariCP, pg-pool)"
            ]
          },
          {
            "title": "Bases de Datos NoSQL",
            "subtopics": [
              "MongoDB: documentos, colecciones, bases de datos",
              "Mongoose: Schemas, Models, Queries, Population, Middleware (pre/post hooks), Virtuals, Plugins, Validation",
              "Native MongoDB driver: MongoClient, db.collection(), find(), aggregate(), insertOne(), updateOne(), deleteOne(), bulkWrite()",
              "Redis: caching, sessions, rate limiting, pub/sub",
              "Elasticsearch: indexing, searching, aggregations"
            ]
          },
          {
            "title": "Autenticacion y Seguridad",
            "subtopics": [
              "JWT: jsonwebtoken (sign, verify, decode), Access Tokens, Refresh Tokens, Token rotation",
              "bcrypt: hashing de contrasenas, salt, comparacion",
              "OAuth2: flujo de autorizacion, passport (strategies: Google, GitHub, Facebook)",
              "Passport.js: passport.initialize(), passport.session(), passport.authenticate(), serializar/deserializar usuario",
              "Session: express-session, store (memory, Redis, MongoDB)",
              "Helmet: security headers",
              "CORS: cors() middleware",
              "Rate Limiting: express-rate-limit",
              "Validacion: express-validator, Joi, Zod"
            ]
          },
          {
            "title": "Caching",
            "subtopics": [
              "Redis: redis client, ioredis, node-redis",
              "node-cache, memory-cache",
              "Cache-Control headers: Cache-Control, ETag, Last-Modified"
            ]
          },
          {
            "title": "Logging",
            "subtopics": [
              "Winston: transports (console, file, HTTP), levels, formatters, splunk",
              "Pino: ultra-rapido, pino-pretty, pino-http",
              "Morgan: logging de requests HTTP",
              "Bunyan"
            ]
          }
        ]
      },
      {
        "title": "Avanzado",
        "tone": "Escalabilidad y Buenas Practicas",
        "topics": [
          {
            "title": "Pruebas (Testing)",
            "subtopics": [
              "Jest: describe, it, expect, toBe, toEqual, toMatch, toContain, toThrow, async/await, done",
              "Mocha + Chai: describe, it, assert, expect, should",
              "Sinon: spies, stubs, mocks, sinon.stub(), sinon.spy(), sinon.mock(), sinon.useFakeTimers()",
              "Supertest: pruebas de APIs HTTP",
              "Test coverage: nyc (Istanbul), jest --coverage",
              "TDD (Test-Driven Development) y BDD (Behavior-Driven Development)"
            ]
          },
          {
            "title": "Depuracion (Debugging)",
            "subtopics": [
              "console.log(), console.error(), console.warn(), console.table(), console.time(), console.timeEnd(), console.trace()",
              "Node.js inspector: node --inspect, node --inspect-brk",
              "Chrome DevTools: chrome://inspect",
              "VS Code debugger: launch.json, \"type\": \"node\"",
              "ndb (Node Debugger)",
              "debug modulo: const debug = require('debug')('app')"
            ]
          },
          {
            "title": "Rendimiento y Escalabilidad",
            "subtopics": [
              "Clustering: cluster modulo, pm2 (cluster mode), node --max-old-space-size",
              "Worker Threads: worker_threads para tareas CPU-intensivas",
              "child_process: fork, spawn, exec para procesos paralelos",
              "PM2: process management, logs, monitoring, pm2 start, pm2 stop, pm2 restart, pm2 logs, pm2 monit",
              "Heap snapshots: node --heapsnapshot, heapdump modulo",
              "CPU profiling: node --cpu-prof, --heap-prof",
              "Memory leaks: clinic, 0x, node-memwatch"
            ]
          },
          {
            "title": "Manejo de Errores",
            "subtopics": [
              "try/catch en codigo sincrono",
              "async/await con try/catch",
              "Promise.catch()",
              "process.on('uncaughtException'), process.on('unhandledRejection')",
              "domain (obsoleto)",
              "Graceful shutdown: process.on('SIGTERM'), process.on('SIGINT'), server.close()"
            ]
          },
          {
            "title": "Diseno de APIs",
            "subtopics": [
              "RESTful: recursos, metodos HTTP, status codes, HATEOAS",
              "GraphQL: Apollo Server, resolvers, schemas, subscriptions, directives, DataLoader",
              "gRPC: Protocol Buffers, @grpc/grpc-js, @grpc/proto-loader",
              "WebSockets: Socket.io, ws",
              "Server-Sent Events (SSE): EventSource"
            ]
          },
          {
            "title": "Validacion Avanzada",
            "subtopics": [
              "Joi: schemas, validacion de objetos, custom validators",
              "Zod: schemas, inferencia de tipos, validacion asincrona",
              "Ajv: JSON Schema validator",
              "express-validator: body(), param(), query(), validationResult()"
            ]
          },
          {
            "title": "Documentacion de APIs",
            "subtopics": [
              "Swagger/OpenAPI: swagger-jsdoc, swagger-ui-express",
              "API Blueprint",
              "Postman: collections, environments, tests"
            ]
          }
        ]
      },
      {
        "title": "Master",
        "tone": "Arquitectura y Produccion",
        "topics": [
          {
            "title": "Arquitectura de Microservicios",
            "subtopics": [
              "Diseno de microservicios: bounded contexts, domain-driven design",
              "Comunicacion sincrona: REST, gRPC",
              "Comunicacion asincrona: message queues, event-driven",
              "API Gateway: routing, rate limiting, authentication",
              "Service Discovery: Consul, Eureka, etcd",
              "Circuit Breaker: retry, timeout, fallback",
              "Distributed Tracing: Jaeger, Zipkin, OpenTelemetry"
            ]
          },
          {
            "title": "Message Queues y Event-Driven",
            "subtopics": [
              "Kafka: producers, consumers, topics, partitions, kafkajs",
              "RabbitMQ: exchanges, queues, bindings, amqplib",
              "AWS SQS: @aws-sdk/client-sqs",
              "Redis Pub/Sub: publish, subscribe",
              "NATS: nats client",
              "Event Sourcing: eventos como fuente de verdad, event stores",
              "CQRS: Command Query Responsibility Segregation"
            ]
          },
          {
            "title": "Observabilidad",
            "subtopics": [
              "Logging: Winston, Pino, Morgan (logs estructurados, niveles, transporte)",
              "Metricas: Prometheus (prom-client), @opentelemetry/metrics",
              "Tracing: Jaeger, Zipkin, OpenTelemetry (@opentelemetry/api, @opentelemetry/instrumentation-http, @opentelemetry/instrumentation-express)",
              "Health checks: /health, /ready, /live",
              "Profiling: clinic, 0x, v8-profiler"
            ]
          },
          {
            "title": "GraphQL Avanzado",
            "subtopics": [
              "Apollo Federation: federacion de schemas, @key, @extends",
              "Schema Stitching: combinar schemas",
              "Directives: @deprecated, @include, @skip, custom directives",
              "DataLoader: batching y caching de requests",
              "Subscriptions: SubscriptionServer, graphql-ws",
              "Persistencia: persisted queries, automatic persisted queries (APQ)",
              "Caching: @cacheControl, Redis"
            ]
          },
          {
            "title": "TypeScript en Node.js",
            "subtopics": [
              "ts-node, tsx (ejecucion en tiempo real)",
              "tsc: compilacion, tsconfig.json (compilerOptions: target, module, outDir, rootDir, strict, esModuleInterop, skipLibCheck)",
              "@types para modulos de Node.js",
              "Tipado de Express: Request, Response, NextFunction",
              "type vs interface",
              "await using (explicit resource management)",
              "as const, satisfies"
            ]
          },
          {
            "title": "Serverless",
            "subtopics": [
              "AWS Lambda: funciones, eventos, @aws-sdk/client-lambda",
              "Azure Functions: @azure/functions",
              "Google Cloud Functions: @google-cloud/functions",
              "Serverless Framework: serverless.yml, plugins, deployment",
              "Cold start: optimizacion, provisioned concurrency"
            ]
          },
          {
            "title": "Despliegue (Deployment)",
            "subtopics": [
              "PM2: process management, logs, monitoring",
              "Docker: Dockerfile, multi-stage builds, docker-compose",
              "Nginx: reverse proxy, load balancing, SSL termination",
              "Kubernetes: Deployments, Services, Ingress, ConfigMaps, Secrets",
              "AWS: EC2, ECS, EKS, Elastic Beanstalk, Lambda",
              "Heroku, Vercel, Netlify, Render"
            ]
          },
          {
            "title": "Seguridad Avanzada",
            "subtopics": [
              "OWASP Top 10 aplicado a Node.js",
              "Helmet: security headers (XSS, clickjacking, MIME sniffing)",
              "CORS: configuracion segura (origenes permitidos, metodos, headers)",
              "Rate Limiting: proteccion contra DDoS",
              "SQL Injection: ORM/ODM previenen, pero hay que conocer",
              "XSS: sanitizacion de entrada, DOMPurify",
              "CSRF: csurf (obsoleto), tokens CSRF",
              "JWT: firma, validacion, expiracion, refresh tokens, revocacion",
              "bcrypt: cost factor, comparacion segura",
              "mTLS: autenticacion mutua con certificados"
            ]
          },
          {
            "title": "Escalado y Performance",
            "subtopics": [
              "Horizontal scaling: multiples instancias, load balancer",
              "Vertical scaling: aumentar recursos de la maquina",
              "Caching: Redis, CDN, Cache-Control",
              "Database optimization: indices, consultas optimizadas, conexiones pooling",
              "Streaming: pipeline para procesar grandes volumenes de datos",
              "Worker Threads: tareas CPU-intensivas fuera del event loop",
              "Clustering: uso de todos los cores de la CPU"
            ]
          },
          {
            "title": "Contribuir a Node.js Core",
            "subtopics": [
              "Como leer el codigo fuente de Node.js",
              "Como reportar issues",
              "Como hacer un PR a Node.js core",
              "Como contribuir a la documentacion"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "angular",
    "title": "Angular",
    "description": "TypeScript, Signals, arquitectura, testing y produccion",
    "project": "Panel de administracion con Signals state",
    "code": "03",
    "levels": [
      {
        "title": "Fundamentos",
        "tone": "Los Cimientos",
        "topics": [
          {
            "title": "TypeScript a Fondo",
            "subtopics": [
              "Tipos: string, number, boolean, any, unknown, never, void, null, undefined, object, tuple, enum, literal, union, intersection",
              "Interfaces: interface, extends, implements",
              "Classes: class, constructor, extends, super, abstract, readonly, private, protected, public, static",
              "Generics: <T>, <T extends>, <T, U>",
              "Decorators: @Component, @Injectable, @Input, @Output, @ViewChild, @ContentChild, @HostListener, @HostBinding",
              "Utility types: Partial<T>, Pick<T, K>, Omit<T, K>, Record<K, T>, Exclude<T, U>, Extract<T, U>, NonNullable<T>, ReturnType<T>, Parameters<T>, Awaited<T>",
              "as const, satisfies, keyof, typeof, infer"
            ]
          },
          {
            "title": "Angular CLI",
            "subtopics": [
              "ng new: creacion de proyectos, opciones (--standalone, --routing, --style)",
              "ng generate: component, service, directive, pipe, class, guard, interceptor, module, resolver, interface, enum",
              "ng serve: servidor de desarrollo, --open, --port, --host, --hmr",
              "ng build: produccion, --configuration production, --aot, --source-map, --optimization, --stats-json",
              "ng test: pruebas unitarias, --code-coverage, --watch",
              "ng lint, ng e2e, ng add"
            ]
          },
          {
            "title": "Arquitectura de Angular",
            "subtopics": [
              "Modulos vs Standalone Components",
              "Arbol de inyeccion (Injection Tree)",
              "Compilador AOT (Ahead-of-Time) vs JIT (Just-in-Time)"
            ]
          },
          {
            "title": "Componentes",
            "subtopics": [
              "@Component: selector, template, templateUrl, styles, styleUrls, standalone: true, imports",
              "Ciclo de vida: ngOnChanges, ngOnInit, ngDoCheck, ngAfterContentInit, ngAfterContentChecked, ngAfterViewInit, ngAfterViewChecked, ngOnDestroy",
              "ChangeDetectionStrategy: Default vs OnPush",
              "ChangeDetectorRef: detectChanges(), markForCheck(), reattach(), detach()"
            ]
          },
          {
            "title": "Plantillas y Data Binding",
            "subtopics": [
              "Interpolacion: {{ expression }}",
              "Property binding: [property]=\"expression\"",
              "Event binding: (event)=\"handler()\"",
              "Two-way binding: [(ngModel)]=\"property\"",
              "ngModel y FormsModule"
            ]
          },
          {
            "title": "Nuevo Control de Flujo (Angular 17+)",
            "subtopics": [
              "@if, @else, @else if",
              "@for con track",
              "@empty (cuando la coleccion esta vacia)",
              "@switch, @case, @default"
            ]
          },
          {
            "title": "Pipes",
            "subtopics": [
              "Pipes integrados: Date, Currency, Decimal, Percent, Json, Async, UpperCase, LowerCase, TitleCase, Slice, KeyValue",
              "Pipes personalizados: @Pipe({ name: 'myPipe', standalone: true }), transform(value, ...args)",
              "Pipes puros e impuros: pure: true/false"
            ]
          },
          {
            "title": "Directivas",
            "subtopics": [
              "Directivas estructurales: *ngIf, *ngFor, *ngSwitch",
              "Directivas de atributo: ngClass, ngStyle, ngModel",
              "Directivas personalizadas: @Directive({ selector: '[myDirective]' })"
            ]
          }
        ]
      },
      {
        "title": "Intermedio",
        "tone": "Servicios y Reactividad",
        "topics": [
          {
            "title": "Servicios e Inyeccion de Dependencias",
            "subtopics": []
          }
        ]
      },
      {
        "title": "De Aplicacion",
        "tone": "Ruta de aprendizaje",
        "topics": [
          {
            "title": "Signals (Angular 16+)",
            "subtopics": [
              "signal(): WritableSignal, set(), update(), mutate(), asReadonly()",
              "computed(): ComputedSignal, dependencias reactivas",
              "effect(): efectos secundarios, effect(() => {...})",
              "linkedSignal: derivado de otra signal",
              "input(): InputSignal",
              "output(): OutputSignal",
              "model(): ModelSignal (two-way binding con signals)",
              "viewChild(), contentChild()",
              "resource(): para fetching de datos"
            ]
          },
          {
            "title": "RxJS",
            "subtopics": [
              "Observables: Observable<T>, new Observable(subscriber => {...})",
              "Subjects: Subject, BehaviorSubject, ReplaySubject, AsyncSubject",
              "Operadores: map, filter, switchMap, mergeMap, concatMap, exhaustMap, debounceTime, distinctUntilChanged, take, takeUntil, shareReplay, catchError, retry, retryWhen, delay, throttleTime, sampleTime, combineLatest, forkJoin, zip, withLatestFrom",
              "async pipe: suscripcion automatica en plantillas"
            ]
          },
          {
            "title": "HTTP Client",
            "subtopics": [
              "HttpClient: get(), post(), put(), delete(), patch(), head(), options(), request()",
              "HttpParams, HttpHeaders, HttpResponse, HttpErrorResponse",
              "observe: 'response', responseType: 'json' | 'text' | 'blob' | 'arraybuffer'"
            ]
          },
          {
            "title": "Interceptores",
            "subtopics": [
              "HttpInterceptorFn: intercept(req, next) => next.handle(req)",
              "Orden de ejecucion de interceptores",
              "Casos de uso: autenticacion (JWT), logging, manejo global de errores, retry logic, transformacion de respuestas"
            ]
          },
          {
            "title": "Enrutamiento (Routing)",
            "subtopics": [
              "RouterModule, RouterOutlet, RouterLink, RouterLinkActive",
              "Router service: navigate(), navigateByUrl(), events",
              "ActivatedRoute: params, queryParams, fragment, data, snapshot",
              "ActivatedRouteSnapshot, RouterStateSnapshot"
            ]
          },
          {
            "title": "Lazy Loading y Rutas Hijas",
            "subtopics": [
              "loadChildren: () => import('./module').then(m => m.Module)",
              "loadComponent: () => import('./component').then(c => c.Component)",
              "children: [] (rutas anidadas)",
              "canMatch"
            ]
          },
          {
            "title": "Guards y Resolvers",
            "subtopics": [
              "CanActivateFn, CanDeactivateFn, CanLoadFn, CanMatchFn, ResolveFn",
              "canActivateChild",
              "Guards como funciones: canActivate: [() => inject(AuthService).isLoggedIn()]"
            ]
          }
        ]
      },
      {
        "title": "Avanzado",
        "tone": "Performance y Optimizacion",
        "topics": [
          {
            "title": "Optimizacion de Rendimiento",
            "subtopics": [
              "ChangeDetectionStrategy.OnPush: minimizar deteccion de cambios",
              "ChangeDetectorRef.detectChanges(), markForCheck()",
              "Signals vs Zone.js: por que Signals reducen la deteccion de cambios",
              "NgZone: runOutsideAngular(), run()",
              "@angular/core \u0275 APIs (uso avanzado)"
            ]
          },
          {
            "title": "Deferrable Views",
            "subtopics": [
              "@defer, @placeholder, @loading, @error",
              "Triggers: on viewport, on interaction, on hover, on immediate, on timer, on idle, when",
              "@defer con prefetch"
            ]
          },
          {
            "title": "AOT Compilation y Optimizacion",
            "subtopics": [
              "aot: true, buildOptimizer: true, preserveSymlinks: false",
              "sourceMap: false (produccion)",
              "vendorChunk: true, commonChunk: true",
              "ng build --stats-json + webpack-bundle-analyzer"
            ]
          },
          {
            "title": "Tree Shaking y Code Splitting",
            "subtopics": [
              "Lazy loading de rutas y componentes",
              "Dynamic imports en componentes",
              "@defer para carga bajo demanda"
            ]
          },
          {
            "title": "SSR e Hidratacion",
            "subtopics": [
              "Angular Universal: @angular/ssr, @angular/platform-server",
              "TransferState: TransferState service, makeStateKey()",
              "Hidratacion: provideClientHydration(), provideServerRendering()",
              "Incremental Hydration (experimental)"
            ]
          },
          {
            "title": "Zoneless Angular",
            "subtopics": [
              "provideZoneChangeDetection({ zone: false })",
              "Signals como alternativa a Zone.js",
              "Deteccion de cambios sin Zone.js"
            ]
          },
          {
            "title": "Pruebas Unitarias y de Integracion",
            "subtopics": [
              "Jasmine: describe, it, expect, beforeEach, afterEach",
              "TestBed: TestBed.configureTestingModule(), TestBed.inject(), TestBed.createComponent()",
              "ComponentFixture: componentInstance, detectChanges(), whenStable()",
              "DebugElement: query(), queryAll(), nativeElement, triggerEventHandler()",
              "By.css(), By.directive()",
              "Pruebas de Signals: fakeAsync, tick, flush",
              "Pruebas de interceptores"
            ]
          }
        ]
      },
      {
        "title": "Master",
        "tone": "Arquitectura y Experto",
        "topics": [
          {
            "title": "State Management Avanzado",
            "subtopics": [
              "NgRx: Store, Actions, Reducers, Effects, Selectors, Entities, DevTools",
              "Akita: Entity Store, Query, UI Store",
              "Elf: Entity, UI, Cache",
              "NGXS: Store, Actions, State, Select",
              "Signals vs NgRx: cuando usar cada uno"
            ]
          },
          {
            "title": "Micro Frontends",
            "subtopics": [
              "Module Federation: @angular-architects/module-federation",
              "Integracion con Angular standalone",
              "Comunicacion entre micro frontends: events, shared state"
            ]
          },
          {
            "title": "Arquitectura en Capas",
            "subtopics": [
              "Domain-Driven Design (DDD): entidades, value objects, agregados, repositorios, servicios de dominio",
              "Clean Architecture: capas de presentacion, aplicacion, dominio, infraestructura",
              "Separacion de responsabilidades: UI, logica de negocio, acceso a datos"
            ]
          },
          {
            "title": "Custom Elements / Web Components",
            "subtopics": [
              "@angular/elements: createCustomElement()",
              "Integracion con otros frameworks (React, Vue, Svelte)",
              "NgElement, NgElementStrategy"
            ]
          },
          {
            "title": "Internals de Angular",
            "subtopics": [
              "El compilador (ngc): como convierte plantillas en codigo JavaScript",
              "El runtime: como funciona la deteccion de cambios",
              "Ivy renderer: la arquitectura moderna de Angular",
              "View Engine vs Ivy: diferencias y por que Ivy es mejor",
              "Injection Tree: como funciona la inyeccion de dependencias por debajo",
              "Component Factory: como se crean los componentes"
            ]
          },
          {
            "title": "Estrategias de Migracion",
            "subtopics": [
              "Migracion de NgModules a Standalone: ng generate @angular/core:standalone",
              "Actualizacion de versiones: ng update @angular/core @angular/cli",
              "Breaking changes entre versiones (16->17->18->19->20)"
            ]
          },
          {
            "title": "Pruebas E2E (End-to-End)",
            "subtopics": [
              "Cypress: cy.visit(), cy.get(), cy.contains(), cy.click(), cy.type(), cy.intercept()",
              "Playwright: page.goto(), page.locator(), page.click(), page.fill(), page.waitForSelector()"
            ]
          },
          {
            "title": "Dockerizacion y CI/CD",
            "subtopics": [
              "Docker: Dockerfile para Angular, multi-stage builds, Nginx",
              "docker-compose: servicios para Angular + API + DB",
              "CI/CD: GitHub Actions, Jenkins, GitLab CI, Azure DevOps"
            ]
          },
          {
            "title": "Seguridad en Angular",
            "subtopics": [
              "XSS: sanitizacion automatica de Angular, DomSanitizer, bypassSecurityTrustHtml",
              "CSRF: tokens CSRF, HttpClientXsrfModule",
              "Content Security Policy (CSP): ng build --csp",
              "JWT: almacenamiento seguro, refresh tokens, interceptors"
            ]
          },
          {
            "title": "Accesibilidad (a11y)",
            "subtopics": [
              "ARIA attributes: role, aria-label, aria-labelledby, aria-describedby, aria-expanded, aria-controls",
              "Navegacion por teclado: tabindex, @HostListener('keydown')",
              "cdk (Angular CDK): A11yModule, FocusTrap, FocusMonitor"
            ]
          },
          {
            "title": "Internacionalizacion (i18n)",
            "subtopics": [
              "@angular/localize: $localize, ng xi18n",
              "i18n attributes en plantillas",
              "@angular/localize/tools: extraccion y compilacion de traducciones",
              "Pluralizacion y seleccion: {count, plural, =0 {...} =1 {...} other {...}}"
            ]
          },
          {
            "title": "Animaciones",
            "subtopics": [
              "@angular/animations: trigger, transition, style, animate, keyframes",
              "query(), stagger(), group(), sequence()",
              "useAnimation() para reutilizar animaciones"
            ]
          },
          {
            "title": "Contribuir a Angular",
            "subtopics": [
              "Como leer el codigo fuente de Angular",
              "Como reportar issues en GitHub",
              "Como hacer un PR a Angular",
              "Como contribuir a la documentacion"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "react",
    "title": "React",
    "description": "UI moderna, hooks, Next.js, testing y accesibilidad",
    "project": "E-commerce con carrito de compras y Next.js",
    "code": "04",
    "levels": [
      {
        "title": "Fundamentos",
        "tone": "Los Cimientos",
        "topics": [
          {
            "title": "JSX",
            "subtopics": [
              "Sintaxis: const element = <h1>Hello, {name}</h1>",
              "Expresiones en JSX: {expression}",
              "Atributos: className, htmlFor, style={{...}}",
              "Children: props.children",
              "Fragments: <>...</>, <React.Fragment>...</React.Fragment>"
            ]
          },
          {
            "title": "Componentes",
            "subtopics": [
              "Functional Components: function Component(props) { return <div>...</div> }",
              "Class Components (obsoleto): class Component extends React.Component { render() {...} }",
              "export default Component",
              "props: inmutables, props.children"
            ]
          },
          {
            "title": "Estado",
            "subtopics": [
              "useState: const [state, setState] = useState(initialValue)",
              "setState con funcion: setState(prev => prev + 1)",
              "Inmutabilidad del estado: setState({ ...prev, key: newValue })"
            ]
          },
          {
            "title": "Efectos",
            "subtopics": [
              "useEffect: useEffect(() => {...}, [dependencies])",
              "Efecto sin dependencias: se ejecuta en cada render",
              "Efecto con dependencias vacias: se ejecuta una vez (montaje)",
              "Efecto con cleanup: useEffect(() => { ... return () => {...} }, [deps])",
              "useLayoutEffect: se ejecuta despues del DOM pero antes del paint"
            ]
          },
          {
            "title": "Eventos",
            "subtopics": [
              "Eventos sinteticos: onClick, onChange, onSubmit, onKeyDown, onMouseEnter, onFocus, onBlur",
              "event.preventDefault(), event.stopPropagation()",
              "event.target.value, event.target.checked"
            ]
          },
          {
            "title": "Listas y Keys",
            "subtopics": [
              "map(): items.map(item => <li key={item.id}>{item.name}</li>)",
              "key prop: identificador unico para cada elemento en la lista",
              "Indices vs IDs: cuando usar cada uno"
            ]
          },
          {
            "title": "Estilos",
            "subtopics": [
              "CSS Modules: import styles from './Component.module.css' -> className={styles.className}",
              "Styled Components: `const StyledDiv = styled.div``",
              "Emotion: css prop, styled",
              "Tailwind CSS: className=\"bg-blue-500 text-white p-4\"",
              "Inline styles: style={{ backgroundColor: 'blue', color: 'white' }}"
            ]
          },
          {
            "title": "Formularios",
            "subtopics": [
              "Controlled components: value={value} onChange={handleChange}",
              "Uncontrolled components: defaultValue, ref",
              "useRef: const inputRef = useRef(null), inputRef.current.value"
            ]
          }
        ]
      },
      {
        "title": "Intermedio",
        "tone": "Hooks y Gestion de Estado",
        "topics": [
          {
            "title": "Hooks Avanzados",
            "subtopics": [
              "useReducer: const [state, dispatch] = useReducer(reducer, initialState), action types, payload",
              "useCallback: const memoizedCallback = useCallback(() => {...}, [deps])",
              "useMemo: const memoizedValue = useMemo(() => computeValue(), [deps])",
              "useRef: const ref = useRef(initialValue), para DOM refs y valores mutables",
              "useImperativeHandle: useImperativeHandle(ref, () => ({ focus: () => {...} }))",
              "useDebugValue: useDebugValue(value, formatter)"
            ]
          },
          {
            "title": "Custom Hooks",
            "subtopics": [
              "Creacion: function useCustomHook() { ... return ... }",
              "Ejemplos: useFetch, useLocalStorage, useDebounce, useToggle, usePrevious"
            ]
          },
          {
            "title": "Context API",
            "subtopics": [
              "React.createContext(): const MyContext = React.createContext(defaultValue)",
              "Provider: <MyContext.Provider value={value}>...</MyContext.Provider>",
              "useContext: const value = useContext(MyContext)"
            ]
          },
          {
            "title": "State Management",
            "subtopics": [
              "Redux Toolkit: configureStore, createSlice, createAsyncThunk, useSelector, useDispatch",
              "Zustand: create, set, get, subscribe, middleware",
              "Jotai: atoms, useAtom, useSetAtom, useAtomValue",
              "Recoil: atoms, selectors, useRecoilState, useRecoilValue, useSetRecoilState"
            ]
          },
          {
            "title": "Data Fetching",
            "subtopics": [
              "fetch(): fetch(url).then(res => res.json())",
              "axios: axios.get(url), axios.post(url, data), interceptors",
              "React Query (TanStack Query) : useQuery, useMutation, QueryClient, QueryClientProvider, caching, invalidation, optimistic updates, useInfiniteQuery",
              "SWR: useSWR, useSWRMutation, SWRConfig"
            ]
          },
          {
            "title": "Enrutamiento",
            "subtopics": [
              "React Router DOM: BrowserRouter, Routes, Route, Link, NavLink, useNavigate, useParams, useLocation, useMatch, Outlet",
              "Nested routes: <Outlet />",
              "Route protection: Navigate, custom guards"
            ]
          }
        ]
      },
      {
        "title": "Avanced",
        "tone": "Rendimiento y Arquitectura",
        "topics": [
          {
            "title": "Rendimiento",
            "subtopics": [
              "React.memo(): memoizacion de componentes",
              "useMemo y useCallback: memoizacion de valores y funciones",
              "useTransition: startTransition, isPending",
              "useDeferredValue: const deferredValue = useDeferredValue(value)",
              "React.lazy() + Suspense: code splitting",
              "React.Profiler: medicion de rendimiento",
              "why-did-you-render: deteccion de renders innecesarios"
            ]
          },
          {
            "title": "Server Components",
            "subtopics": [
              "'use client': componentes cliente",
              "'use server': server actions",
              "Server Components vs Client Components",
              "Streaming SSR: Suspense, streaming",
              "Next.js App Router: page.js, layout.js, loading.js, error.js, not-found.js"
            ]
          },
          {
            "title": "Frameworks Full-Stack",
            "subtopics": [
              "Next.js: App Router, metadata, generateStaticParams, getStaticProps, getServerSideProps, getStaticPaths, ISR (Incremental Static Regeneration)",
              "Remix: loader, action, useLoaderData, useActionData, MetaFunction, LinksFunction",
              "Gatsby: gatsby-config.js, gatsby-node.js, createPages, graphql"
            ]
          },
          {
            "title": "Testing",
            "subtopics": [
              "React Testing Library: render, screen, fireEvent, userEvent, waitFor, act",
              "Jest: describe, it, expect, toBe, toHaveTextContent, toHaveAttribute",
              "Vitest: alternativa a Jest, mas rapida",
              "Cypress: E2E testing",
              "Playwright: E2E testing"
            ]
          },
          {
            "title": "Arquitectura",
            "subtopics": [
              "Component Composition: composicion de componentes",
              "Render Props: {children({...})}",
              "Higher-Order Components (HOCs) : withAuth(Component)",
              "Compound Components: Tabs, TabList, Tab, TabPanels, TabPanel",
              "Provider Pattern: Context API",
              "Presentational/Container Components: separacion de logica y UI"
            ]
          }
        ]
      },
      {
        "title": "Master",
        "tone": "Internals y Experto",
        "topics": [
          {
            "title": "Internals de React",
            "subtopics": [
              "Virtual DOM: como funciona el diffing",
              "Reconciliation: algoritmo de reconciliacion (diffing)",
              "Fiber architecture: la nueva arquitectura de React (16+)",
              "Concurrent Mode: renderizado interrumpible, createRoot, hydrateRoot",
              "React 19: nuevas caracteristicas, Server Components, Actions"
            ]
          },
          {
            "title": "State Management Avanzado",
            "subtopics": [
              "RTK Query: createApi, fetchBaseQuery, useQuery, useMutation",
              "Zustand con middleware: devtools, persist, immer",
              "Jotai atoms avanzados: atomWithStorage, atomWithImmer, atomWithReset",
              "XState: state machines, createMachine, useMachine, useSelector"
            ]
          },
          {
            "title": "Formularios Avanzados",
            "subtopics": [
              "React Hook Form: useForm, register, handleSubmit, watch, setValue, Controller, useFieldArray, useWatch",
              "Formik: useFormik, Formik component, Field, ErrorMessage, useField",
              "Zod: z.object(), z.string(), z.number(), z.enum(), z.array()",
              "Yup: yup.object().shape({...})"
            ]
          },
          {
            "title": "Internacionalizacion (i18n)",
            "subtopics": [
              "react-i18next: useTranslation, t(), Trans, i18n.changeLanguage",
              "next-i18next: serverSideTranslations, useTranslation, appWithTranslation"
            ]
          },
          {
            "title": "Accesibilidad (a11y)",
            "subtopics": [
              "ARIA attributes: role, aria-label, aria-labelledby, aria-describedby, aria-expanded, aria-controls",
              "tabIndex, navegacion por teclado",
              "useA11y: hooks de accesibilidad",
              "@testing-library/jest-dom: toHaveAccessibleName(), toBeVisible()"
            ]
          },
          {
            "title": "Micro Frontends",
            "subtopics": [
              "Module Federation: @module-federation/nextjs-mf, @originjs/vite-plugin-federation",
              "Comunicacion entre micro frontends"
            ]
          },
          {
            "title": "Server Actions",
            "subtopics": [
              "'use server': funciones que se ejecutan en el servidor",
              "useActionState(), useFormStatus(), useOptimistic()"
            ]
          },
          {
            "title": "Next.js Avanzado",
            "subtopics": [
              "use, cache (React)",
              "next/dynamic: dynamic(() => import('./Component'))",
              "next/image: <Image />, next/font: <Font />, next/script: <Script />, next/head: <Head />"
            ]
          },
          {
            "title": "Contribuir a React",
            "subtopics": [
              "Como leer el codigo fuente de React",
              "Como reportar issues en GitHub",
              "Como hacer un PR a React",
              "Como contribuir a la documentacion"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "java",
    "title": "Java",
    "description": "OOP, concurrencia, JVM, performance y testing",
    "project": "Sistema de gestion de biblioteca con consola",
    "code": "05",
    "levels": [
      {
        "title": "Fundamentos",
        "tone": "Los Cimientos",
        "topics": [
          {
            "title": "Sintaxis Basica",
            "subtopics": [
              "Variables: int, double, boolean, char, String",
              "Tipos primitivos vs objetos: int vs Integer",
              "Operadores: aritmeticos, relacionales, logicos, bit a bit, ternario",
              "Estructuras de control: if/else, switch, for, while, do/while"
            ]
          },
          {
            "title": "Programacion Orientada a Objetos",
            "subtopics": [
              "Clases: class, new, this",
              "Constructores: public ClassName(), sobrecarga de constructores",
              "Metodos: public void method(), return",
              "static: variables y metodos estaticos",
              "final: constantes, metodos no sobrescribibles, clases no heredables",
              "abstract: clases y metodos abstractos",
              "interface: interface, implements, metodos default y static",
              "Herencia: extends, super, @Override",
              "Polimorfismo: overloading y overriding",
              "Encapsulamiento: private, protected, public, default (package-private)"
            ]
          },
          {
            "title": "Manejo de Excepciones",
            "subtopics": [
              "try, catch, finally",
              "throw, throws",
              "try-with-resources (AutoCloseable)",
              "@Override en metodos",
              "Custom exceptions: class MyException extends Exception",
              "Checked vs unchecked exceptions"
            ]
          }
        ]
      },
      {
        "title": "Intermedio",
        "tone": "Colecciones y Programacion Funcional",
        "topics": [
          {
            "title": "Java Collections Framework",
            "subtopics": [
              "List: ArrayList, LinkedList, Vector, CopyOnWriteArrayList",
              "Set: HashSet, TreeSet, LinkedHashSet, CopyOnWriteArraySet",
              "Map: HashMap, TreeMap, LinkedHashMap, ConcurrentHashMap, EnumMap, WeakHashMap",
              "Queue: PriorityQueue, ArrayDeque, LinkedList",
              "Deque: ArrayDeque, LinkedList",
              "Iterator, ListIterator, Iterable",
              "Comparable, Comparator"
            ]
          },
          {
            "title": "Generics",
            "subtopics": [
              "Type parameters: <T>, <T extends Number>, <T, U>",
              "? wildcard: unbounded (?), upper bounded (? extends T), lower bounded (? super T)",
              "Type erasure: como funciona en tiempo de compilacion",
              "@SafeVarargs"
            ]
          },
          {
            "title": "Streams API",
            "subtopics": [
              "stream(), parallelStream()",
              "Operaciones intermedias: filter, map, flatMap, peek, distinct, sorted, limit, skip",
              "Operaciones terminales: forEach, collect, reduce, count, anyMatch, allMatch, noneMatch, findFirst, findAny, toArray",
              "Collectors: toList, toSet, toMap, groupingBy, partitioningBy, joining, summarizingInt"
            ]
          },
          {
            "title": "Optional",
            "subtopics": [
              "Optional.of(), Optional.ofNullable(), Optional.empty()",
              "isPresent(), ifPresent(), orElse(), orElseGet(), orElseThrow()",
              "map(), flatMap(), filter()"
            ]
          },
          {
            "title": "Novedades Java 8 a 21",
            "subtopics": [
              "Lambdas: (param) -> expression, (param) -> { statements }",
              "Method references: System.out::println, String::toUpperCase",
              "@FunctionalInterface",
              "Records: record Person(String name, int age) {}",
              "Pattern Matching: instanceof con pattern, if (obj instanceof String s)",
              "Switch Expressions: ->, yield",
              "Text Blocks: \"\"\" ... \"\"\"",
              "Sealed Classes: sealed, permits, non-sealed",
              "Virtual Threads (Project Loom): Thread.startVirtualThread(), Executors.newVirtualThreadPerTaskExecutor()",
              "Pattern Matching for switch (Java 21)"
            ]
          }
        ]
      },
      {
        "title": "Avanzado",
        "tone": "Concurrencia y JVM",
        "topics": [
          {
            "title": "Hilos y Concurrencia",
            "subtopics": [
              "Thread: new Thread(() -> {...}).start()",
              "Runnable: Runnable task = () -> {...}",
              "Callable: Callable<T> task = () -> {...}",
              "Future: Future<T> future = executor.submit(task)",
              "synchronized: metodos y bloques sincronizados",
              "wait(), notify(), notifyAll()",
              "volatile: visibilidad entre hilos",
              "AtomicXXX: AtomicInteger, AtomicLong, AtomicBoolean, AtomicReference",
              "ReentrantLock, Condition",
              "Semaphore, CountDownLatch, CyclicBarrier",
              "CompletableFuture: supplyAsync, thenApply, thenCompose, thenCombine, allOf, anyOf"
            ]
          },
          {
            "title": "Executor Framework",
            "subtopics": [
              "ExecutorService: Executors.newFixedThreadPool(), newCachedThreadPool(), newSingleThreadExecutor(), newScheduledThreadPool()",
              "ScheduledExecutorService: schedule(), scheduleAtFixedRate(), scheduleWithFixedDelay()",
              "submit(), invokeAll(), shutdown(), shutdownNow()"
            ]
          },
          {
            "title": "Virtual Threads (Project Loom)",
            "subtopics": [
              "Thread.startVirtualThread()",
              "Executors.newVirtualThreadPerTaskExecutor()",
              "Thread.Builder: Thread.ofVirtual().start(() -> {...})",
              "Structured Concurrency (JEP 428)"
            ]
          },
          {
            "title": "JVM (Java Virtual Machine)",
            "subtopics": [
              "Modelo de memoria: Heap, Stack, Metaspace, Program Counter Register",
              "Garbage Collectors: Serial, Parallel, CMS, G1, ZGC, Shenandoah",
              "JVM tuning: -Xmx, -Xms, -XX:+UseG1GC, -XX:MaxGCPauseMillis, -XX:+UseZGC",
              "jconsole, jvisualvm, jstat, jmap, jstack, jcmd"
            ]
          }
        ]
      },
      {
        "title": "Master",
        "tone": "Performance y Arquitectura",
        "topics": [
          {
            "title": "Internals de Java",
            "subtopics": [
              "Class Loader: Bootstrap, Extension, Application, custom class loaders",
              "Bytecode: javac, javap, bytecode instructions",
              "JIT Compiler: C1, C2, Graal JIT",
              "Java Modules (Project Jigsaw): module-info.java, exports, requires, opens"
            ]
          },
          {
            "title": "Performance Optimization",
            "subtopics": [
              "Profiling: JProfiler, YourKit, VisualVM, Java Flight Recorder (JFR)",
              "Memory leak detection: heap dumps, jmap, jhat, Eclipse MAT",
              "WeakReference, SoftReference, PhantomReference, ReferenceQueue",
              "String pooling: String.intern()",
              "Object pooling: PooledObject, ObjectPool"
            ]
          },
          {
            "title": "Patrones de Diseno",
            "subtopics": [
              "Creacionales: Singleton, Factory, Abstract Factory, Builder, Prototype",
              "Estructurales: Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy",
              "De Comportamiento: Chain of Responsibility, Command, Interpreter, Iterator, Mediator, Memento, Observer, State, Strategy, Template Method, Visitor"
            ]
          },
          {
            "title": "Clean Code y SOLID",
            "subtopics": [
              "SOLID: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion",
              "Clean Code: nombres significativos, funciones pequenas, comentarios, formato",
              "Code Smells: duplicacion, clases grandes, metodos largos"
            ]
          },
          {
            "title": "Testing",
            "subtopics": [
              "JUnit 5: @Test, @BeforeEach, @AfterEach, @BeforeAll, @AfterAll, @ParameterizedTest, @CsvSource, @ValueSource, @MethodSource, @TestFactory",
              "Mockito: @Mock, @InjectMocks, when(), verify(), ArgumentCaptor, @Spy, @Captor",
              "AssertJ: assertThat(), isEqualTo(), isTrue(), contains()",
              "Hamcrest: assertThat(), is(), equalTo(), hasSize()"
            ]
          },
          {
            "title": "Contribuir a Java",
            "subtopics": [
              "Como leer el codigo fuente de OpenJDK",
              "Como reportar issues en bugs.java.com",
              "Como hacer un PR a OpenJDK"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "spring",
    "title": "Spring Boot",
    "description": "APIs robustas, seguridad, microservicios y arquitectura",
    "project": "API de reservas con seguridad y documentacion",
    "code": "06",
    "levels": [
      {
        "title": "Fundamentos",
        "tone": "Los Cimientos",
        "topics": [
          {
            "title": "Spring Framework Core",
            "subtopics": [
              "IoC (Inversion of Control): Spring Container, ApplicationContext, BeanFactory",
              "DI (Dependency Injection): @Autowired, @Inject, constructor injection, setter injection, field injection",
              "Beans: @Component, @Service, @Repository, @Controller, @RestController",
              "Bean Scopes: singleton, prototype, request, session, application, websocket",
              "Bean Lifecycle: @PostConstruct, @PreDestroy, InitializingBean, DisposableBean"
            ]
          },
          {
            "title": "Spring Boot",
            "subtopics": [
              "Spring Initializr: start.spring.io",
              "Starters: spring-boot-starter-web, spring-boot-starter-data-jpa, spring-boot-starter-security, spring-boot-starter-test, spring-boot-starter-validation, spring-boot-starter-actuator",
              "Auto-configuration: @EnableAutoConfiguration, spring.factories",
              "@SpringBootApplication: @Configuration + @EnableAutoConfiguration + @ComponentScan",
              "@ConfigurationProperties, @EnableConfigurationProperties",
              "application.properties / application.yml",
              "Profiles: @Profile, application-{profile}.properties, spring.profiles.active"
            ]
          },
          {
            "title": "Maven / Gradle",
            "subtopics": [
              "Maven: pom.xml, <dependencies>, <plugins>, <parent>, <properties>, fases (compile, test, package, install, deploy)",
              "Gradle: build.gradle, dependencies, plugins, tasks",
              "Build lifecycle: clean, compile, test, package, install, deploy"
            ]
          },
          {
            "title": "Anotaciones REST",
            "subtopics": [
              "@RestController, @Controller",
              "@GetMapping, @PostMapping, @PutMapping, @DeleteMapping, @PatchMapping",
              "@RequestMapping: @RequestMapping(value = \"/api\", method = RequestMethod.GET)",
              "@PathVariable, @RequestParam, @RequestBody, @RequestHeader, @CookieValue, @RequestPart"
            ]
          },
          {
            "title": "JPA Basico",
            "subtopics": [
              "@Entity, @Table, @Id, @GeneratedValue (strategy = GenerationType.IDENTITY), @Column, @Transient, @Temporal, @Enumerated",
              "JpaRepository<T, ID>, CrudRepository<T, ID>, PagingAndSortingRepository<T, ID>",
              "H2 (in-memory), MySQL, PostgreSQL, connection pooling (HikariCP)"
            ]
          }
        ]
      },
      {
        "title": "Intermedio",
        "tone": "APIs, Persistencia y Seguridad",
        "topics": [
          {
            "title": "JPA/Hibernate Avanzado",
            "subtopics": [
              "Relaciones: @OneToOne, @OneToMany, @ManyToOne, @ManyToMany",
              "@JoinColumn, @JoinTable, mappedBy",
              "cascade: CascadeType.ALL, PERSIST, MERGE, REMOVE, REFRESH, DETACH",
              "fetch: FetchType.LAZY, FetchType.EAGER",
              "@MappedSuperclass: herencia en JPA",
              "@Embeddable, @Embedded: composicion",
              "@Converter: conversion de tipos",
              "@PrePersist, @PreUpdate, @PreRemove, @PostLoad"
            ]
          },
          {
            "title": "Consultas",
            "subtopics": [
              "JPQL: @Query(\"SELECT u FROM User u WHERE u.email = :email\")",
              "Native Queries: @Query(value = \"SELECT * FROM users\", nativeQuery = true)",
              "Criteria API: CriteriaBuilder, CriteriaQuery, Root",
              "QueryDSL: QUser, JPAQuery",
              "Paginacion: Pageable, Page<T>, Sort",
              "@Param: @Query(\"SELECT u FROM User u WHERE u.name = :name\")"
            ]
          },
          {
            "title": "Manejo de Excepciones",
            "subtopics": [
              "@ControllerAdvice: manejo global de excepciones",
              "@ExceptionHandler: @ExceptionHandler(Exception.class)",
              "@ResponseStatus: @ResponseStatus(HttpStatus.NOT_FOUND)",
              "ResponseEntityExceptionHandler: handleException",
              "Custom exception classes: class ResourceNotFoundException extends RuntimeException",
              "Validacion: @Valid, @Validated, @NotNull, @Size, @Email, @Pattern, @Min, @Max, @Past, @Future"
            ]
          },
          {
            "title": "Spring Security",
            "subtopics": [
              "spring-boot-starter-security",
              "SecurityFilterChain: @Bean public SecurityFilterChain filterChain(HttpSecurity http)",
              "@EnableWebSecurity, @EnableMethodSecurity",
              "UserDetailsService: loadUserByUsername()",
              "PasswordEncoder: BCryptPasswordEncoder, NoOpPasswordEncoder",
              "AuthenticationManager, AuthenticationProvider",
              "SecurityContextHolder: SecurityContextHolder.getContext().getAuthentication()",
              "@PreAuthorize, @PostAuthorize, @RolesAllowed, @Secured",
              "hasRole(), hasAuthority(), permitAll(), authenticated()"
            ]
          },
          {
            "title": "JWT (JSON Web Tokens)",
            "subtopics": [
              "jjwt, java-jwt, nimbus-jose-jwt",
              "JwtTokenProvider: generateToken(), validateToken(), getUsernameFromToken()",
              "JwtAuthenticationFilter: OncePerRequestFilter, doFilterInternal()",
              "JwtAuthenticationEntryPoint: manejo de autenticacion fallida",
              "Access Tokens, Refresh Tokens, Token rotation"
            ]
          },
          {
            "title": "Versionado de APIs",
            "subtopics": [
              "URI versioning: /api/v1/users, /api/v2/users",
              "Parameter versioning: ?version=1",
              "Header versioning: X-API-Version: 1",
              "Content negotiation: Accept: application/vnd.myapp.v1+json"
            ]
          },
          {
            "title": "Pruebas",
            "subtopics": [
              "@SpringBootTest: pruebas de integracion",
              "@DataJpaTest: pruebas de repositorios JPA",
              "@WebMvcTest: pruebas de controladores MVC",
              "@MockBean, @SpyBean: mocks y spies en contexto Spring",
              "MockMvc: mockMvc.perform(get(\"/api/users\"))",
              "TestRestTemplate, RestAssured",
              "@Test, @BeforeEach, @AfterEach",
              "JUnit 5, AssertJ, Mockito"
            ]
          }
        ]
      },
      {
        "title": "Avanzado",
        "tone": "Microservicios y Ecosistema",
        "topics": [
          {
            "title": "Spring Cloud",
            "subtopics": [
              "Service Discovery: spring-cloud-starter-netflix-eureka-client, @EnableEurekaClient, @EnableDiscoveryClient, Eureka Server",
              "API Gateway: Spring Cloud Gateway, @EnableGateway, RouteLocator, RouteDefinition, GatewayFilter, Predicate, GlobalFilter",
              "Config Server: Spring Cloud Config Server, @EnableConfigServer, {application}-{profile}.yml, @RefreshScope",
              "Spring Cloud Bus: propagacion de cambios de configuracion"
            ]
          },
          {
            "title": "Resilience4j",
            "subtopics": [
              "@Retry: reintentos automaticos",
              "@CircuitBreaker: proteccion contra fallos",
              "@RateLimiter: limitacion de peticiones",
              "@Bulkhead: aislamiento de recursos",
              "@TimeLimiter: timeout",
              "@Fallback: metodo alternativo",
              "RetryConfig, CircuitBreakerConfig, RateLimiterConfig"
            ]
          },
          {
            "title": "Mensajeria Asincrona",
            "subtopics": [
              "Spring Cloud Stream: abstraccion para message brokers",
              "Apache Kafka: @KafkaListener, @EnableKafka, KafkaTemplate, ProducerFactory, ConsumerFactory",
              "RabbitMQ: @RabbitListener, RabbitTemplate, @EnableRabbit"
            ]
          },
          {
            "title": "Observabilidad",
            "subtopics": [
              "Spring Boot Actuator: /actuator, /health, /info, /metrics, /prometheus, /loggers, /env",
              "Micrometer: MeterRegistry, Counter, Timer, Gauge, DistributionSummary",
              "Prometheus: spring-boot-starter-actuator, micrometer-registry-prometheus",
              "Grafana: dashboards, alertas",
              "@Timed: anotacion para medicion de tiempo"
            ]
          }
        ]
      },
      {
        "title": "Master",
        "tone": "Arquitectura y Tendencias",
        "topics": [
          {
            "title": "Arquitectura Hexagonal (Ports & Adapters)",
            "subtopics": [
              "Capas: Domain, Application, Infrastructure",
              "@DomainService, @ApplicationService",
              "@Port: interfaces que definen la interaccion con el mundo exterior",
              "@Adapter: implementaciones de los ports (repositorios, servicios externos)",
              "Dependency Inversion: las capas internas no dependen de las externas"
            ]
          },
          {
            "title": "Arquitectura de Microservicios Avanzada",
            "subtopics": [
              "Sagas: orquestacion vs coreografia, @Saga, compensacion",
              "Event Sourcing: eventos como fuente de verdad, event stores",
              "CQRS: Command Query Responsibility Segregation",
              "Distributed Transactions: Two-Phase Commit, SAGA",
              "Outbox Pattern: publicacion confiable de eventos",
              "Eventual Consistency: consistencia eventual en sistemas distribuidos"
            ]
          },
          {
            "title": "Spring WebFlux (Reactive)",
            "subtopics": [
              "WebClient: cliente HTTP reactivo",
              "@RestController reactivo: Mono<T>, Flux<T>",
              "Reactor: Mono, Flux, operadores (map, flatMap, filter, zip, merge)",
              "ServerSentEvent: streaming de eventos",
              "@EnableWebFlux: configuracion reactiva",
              "Netty vs Tomcat: servidores reactivos vs servlet"
            ]
          },
          {
            "title": "Testing Avanzado",
            "subtopics": [
              "Integration Tests: @TestContainers (bases de datos en contenedores)",
              "@EmbeddedKafka: pruebas con Kafka",
              "@MockBean, @SpyBean para mocks",
              "@WebFluxTest: pruebas de controladores reactivos",
              "@JsonTest: pruebas de serializacion JSON",
              "@DataRedisTest: pruebas con Redis",
              "BDD (Behavior-Driven Development) con Cucumber"
            ]
          },
          {
            "title": "Internals de Spring Boot",
            "subtopics": [
              "SpringApplication.run(): como arranca Spring Boot",
              "ApplicationContext: AnnotationConfigApplicationContext, ClassPathXmlApplicationContext",
              "BeanPostProcessor: postProcessBeforeInitialization(), postProcessAfterInitialization()",
              "BeanFactoryPostProcessor: postProcessBeanFactory()",
              "ApplicationListener: @EventListener, onApplicationEvent()",
              "Auto-configuration mechanism: spring.factories, @Conditional, @ConditionalOnClass, @ConditionalOnMissingBean, @ConditionalOnProperty, @ConditionalOnWebApplication"
            ]
          },
          {
            "title": "Performance Tuning",
            "subtopics": [
              "JVM tuning: -Xmx, -Xms, -XX:+UseG1GC, -XX:MaxGCPauseMillis",
              "Connection pooling optimization: HikariCP configuration",
              "Query optimization: N+1 problem, @EntityGraph, @NamedQuery, @NamedEntityGraph",
              "Caching: @Cacheable, @CacheEvict, @CachePut, Redis, EhCache"
            ]
          },
          {
            "title": "Seguridad Avanzada",
            "subtopics": [
              "OAuth2, OIDC, Keycloak",
              "@EnableResourceServer, @EnableAuthorizationServer",
              "JWT con RS256 (asymmetric keys)",
              "SAML, LDAP, mTLS"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "devops",
    "title": "DevOps",
    "description": "Linux, CI/CD, contenedores, Kubernetes, IaC y GitOps",
    "project": "Pipeline CI/CD con despliegue en Kubernetes",
    "code": "07",
    "levels": [
      {
        "title": "Fundamentos",
        "tone": "Los Cimientos",
        "topics": [
          {
            "title": "DevOps Cultura",
            "subtopics": [
              "Historia y principios: CALMS (Culture, Automation, Lean, Measurement, Sharing)",
              "Ciclo de vida: Plan -> Code -> Build -> Test -> Release -> Deploy -> Operate -> Monitor",
              "Beneficios: velocidad, confiabilidad, escalabilidad, colaboracion"
            ]
          },
          {
            "title": "Agile y Scrum",
            "subtopics": [
              "Metodologia agil, Scrum framework, sprints, user stories, daily standups, retrospectives, product backlog",
              "Kanban, Lean, SAFe"
            ]
          },
          {
            "title": "Linux",
            "subtopics": [
              "Comandos esenciales: ls, cd, pwd, mkdir, rm, cp, mv, chmod, chown, ps, kill, top, grep, sed, awk, find, xargs",
              "Sistema de archivos: /, /etc, /var, /home, /usr, /tmp",
              "Gestion de usuarios: useradd, usermod, passwd, groupadd",
              "Procesos y systemd: systemctl, journalctl, service"
            ]
          },
          {
            "title": "Shell Scripting",
            "subtopics": [
              "Bash scripting: shebang (#!/bin/bash), variables, condicionales (if, case), bucles (for, while), funciones",
              "cron jobs: crontab -e, 0 2 * * * /script.sh",
              "Automatizacion de tareas"
            ]
          },
          {
            "title": "Redes",
            "subtopics": [
              "OSI Model: capas fisica, enlace, red, transporte, sesion, presentacion, aplicacion",
              "TCP/IP, DNS, HTTP/HTTPS, WebSockets, gRPC",
              "Load Balancers: HAProxy, Nginx, AWS ALB"
            ]
          }
        ]
      },
      {
        "title": "Intermedio",
        "tone": "CI/CD y Contenedores",
        "topics": [
          {
            "title": "Git y GitHub",
            "subtopics": [
              "git init, add, commit, push, pull, branch, merge, rebase, cherry-pick, stash, reset, revert",
              "Estrategias de branching: GitFlow, trunk-based development, GitHub Flow",
              "Pull requests, code reviews, git hooks"
            ]
          },
          {
            "title": "CI/CD Pipelines",
            "subtopics": [
              "Jenkins: Declarative Pipeline, Scripted Pipeline, Jenkinsfile, stages, steps, agents, environment variables, credentials, plugins",
              "GitHub Actions: workflows, jobs, steps, actions, runners, secrets, matrix strategy",
              "GitLab CI: .gitlab-ci.yml, stages, jobs, runners",
              "Azure Pipelines: azure-pipelines.yml, stages, jobs, steps",
              "CircleCI: .circleci/config.yml"
            ]
          },
          {
            "title": "Docker",
            "subtopics": [
              "Instalacion: docker --version",
              "docker build, docker run, docker ps, docker stop, docker rm, docker images, docker pull, docker push",
              "Dockerfile: FROM, RUN, COPY, ADD, CMD, ENTRYPOINT, ENV, EXPOSE, WORKDIR, USER, LABEL, ARG",
              "Multi-stage builds: FROM ... AS builder, COPY --from=builder",
              "Redes: bridge, host, overlay",
              "Volumenes: bind mounts, volumes, docker volume",
              "docker-compose: servicios, redes, volumenes, docker-compose up, down"
            ]
          },
          {
            "title": "Docker Registries",
            "subtopics": [
              "Docker Hub: docker login, docker tag, docker push",
              "AWS ECR, Azure Container Registry, GCR, Harbor"
            ]
          }
        ]
      },
      {
        "title": "Avanzado",
        "tone": "Kubernetes y Orquestacion",
        "topics": [
          {
            "title": "Kubernetes",
            "subtopics": [
              "Arquitectura: Control Plane (API Server, Scheduler, Controller Manager, etcd), Worker Nodes (kubelet, kube-proxy, container runtime)",
              "Pods: la unidad mas pequena, kubectl get pods",
              "Deployments: kubectl create deployment, kubectl rollout status, kubectl rollout undo",
              "ReplicaSets: asegura un numero de replicas",
              "StatefulSets: para aplicaciones con estado",
              "DaemonSets: un pod por nodo",
              "Jobs, CronJobs"
            ]
          },
          {
            "title": "Services",
            "subtopics": [
              "ClusterIP: interno al cluster",
              "NodePort: expone en un puerto del nodo",
              "LoadBalancer: integracion con cloud provider",
              "ExternalName: mapeo a DNS externo"
            ]
          },
          {
            "title": "Ingress",
            "subtopics": [
              "Ingress Controller: NGINX, Traefik, AWS ALB Ingress Controller",
              "Ingress Rules: routing basado en host y path",
              "TLS/SSL: tls section, certificates"
            ]
          },
          {
            "title": "Configuracion",
            "subtopics": [
              "ConfigMaps: kubectl create configmap, envFrom, volumeMounts",
              "Secrets: kubectl create secret, envFrom, volumeMounts",
              "Environment Variables: env, valueFrom",
              "downwardAPI: exponer informacion del pod al contenedor"
            ]
          },
          {
            "title": "Almacenamiento",
            "subtopics": []
          }
        ]
      },
      {
        "title": "De Cluster",
        "tone": "Ruta de aprendizaje",
        "topics": [
          {
            "title": "Operaciones",
            "subtopics": [
              "Health probes: livenessProbe, readinessProbe, startupProbe",
              "Estrategias de rollout: RollingUpdate, Recreate, Blue/Green, Canary",
              "Auto-scaling: HPA (Horizontal Pod Autoscaler), VPA (Vertical Pod Autoscaler), Cluster Autoscaler",
              "kubectl commands: get, describe, logs, exec, port-forward, delete, apply, rollout"
            ]
          },
          {
            "title": "Helm",
            "subtopics": [
              "Charts: estructura de directorios, Chart.yaml, values.yaml, templates/",
              "Templates: Go templates, {{ .Values.key }}, {{ .Release.Name }}",
              "Values: helm install --set key=value",
              "Repositories: helm repo add, helm repo update",
              "helm install, helm upgrade, helm rollback, helm uninstall"
            ]
          },
          {
            "title": "Service Mesh",
            "subtopics": [
              "Istio: Envoy proxy, traffic management, security (mTLS), observability",
              "Linkerd: lightweight service mesh",
              "mTLS: autenticacion mutua entre servicios",
              "Traffic management: canary releases, circuit breaking, fault injection"
            ]
          }
        ]
      },
      {
        "title": "Master",
        "tone": "IaC y Observabilidad",
        "topics": [
          {
            "title": "Infraestructura como Codigo (IaC)",
            "subtopics": [
              "Terraform: HCL, terraform init, plan, apply, destroy, state, state backends (S3, Azure Storage), remote state, modules, data sources, providers, variables, outputs",
              "AWS CloudFormation: YAML/JSON, stacks, change sets, drift detection",
              "Pulumi: multi-language IaC, pulumi up, pulumi destroy",
              "Ansible: playbooks, roles, inventory, modules, tasks, handlers, variables, templates, vault"
            ]
          },
          {
            "title": "Monitorizacion y Observabilidad",
            "subtopics": [
              "Prometheus: metrics, exporters, alerts, prometheus.yml, promql",
              "Grafana: dashboards, panels, data sources, alerts, grafana.ini",
              "ELK Stack: Elasticsearch (indexacion), Logstash (procesamiento), Kibana (visualizacion)",
              "Loki: log aggregation",
              "Fluentd, Fluent Bit: log collection",
              "Datadog, New Relic, OpenTelemetry"
            ]
          },
          {
            "title": "DevSecOps",
            "subtopics": [
              "Secrets Management: HashiCorp Vault, AWS Secrets Manager, Azure Key Vault",
              "SAST (Static Application Security Testing): SonarQube, Checkmarx",
              "DAST (Dynamic Application Security Testing): OWASP ZAP, Burp Suite",
              "SCA (Software Composition Analysis): Snyk, Dependabot",
              "Container scanning: Trivy, Clair, Anchore",
              "Compliance: SOC2, GDPR, HIPAA"
            ]
          },
          {
            "title": "GitOps",
            "subtopics": [
              "ArgoCD: Applications, Projects, Sync policies, auto-sync, rollback, UI",
              "FluxCD: GitRepository, Kustomization, HelmRelease",
              "Declarative deployments: el estado deseado esta en Git"
            ]
          },
          {
            "title": "Cloud",
            "subtopics": [
              "AWS, Azure, GCP fundamentals: IAM, VPC, EC2, S3, RDS, Lambda",
              "Cloud migration strategies: 6 R's (Rehost, Replatform, Repurchase, Refactor, Retire, Retain)",
              "Cloud security: shared responsibility model, compliance"
            ]
          },
          {
            "title": "Metricas DevOps (DORA)",
            "subtopics": [
              "Lead Time: tiempo desde el commit hasta el deploy",
              "Deployment Frequency: frecuencia de despliegues",
              "Mean Time to Recovery (MTTR) : tiempo medio de recuperacion",
              "Change Failure Rate: porcentaje de despliegues que fallan"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "cloud",
    "title": "Cloud",
    "description": "AWS, Azure, GCP, Floci, seguridad, datos y automatizacion",
    "project": "Sistema completo desplegado en Floci",
    "code": "08",
    "levels": [
      {
        "title": "Fundamentos",
        "tone": "Los Cimientos",
        "topics": [
          {
            "title": "Conceptos de Cloud Computing",
            "subtopics": [
              "Virtualizacion, escalabilidad (vertical vs horizontal), elasticidad, on-demand, pay-as-you-go",
              "Modelos de servicio: IaaS, PaaS, SaaS",
              "Modelos de despliegue: Publica, Privada, Hibrida, Multi-cloud"
            ]
          },
          {
            "title": "Infraestructura Global",
            "subtopics": [
              "Regiones, Zonas de Disponibilidad (AZs), Edge Locations, Local Zones, Wavelength Zones"
            ]
          },
          {
            "title": "Floci",
            "subtopics": [
              "\u00bfQue es Floci?: emulador local gratuito, sin cuenta ni token",
              "Instalacion: docker run -p 4566:4566 floci/floci:latest",
              "Verificacion: curl http://localhost:4566/_localstack/health",
              "Ecosistema: floci-az (Azure), floci-gcp (GCP)"
            ]
          }
        ]
      },
      {
        "title": "Intermedio",
        "tone": "Servicios Core",
        "topics": [
          {
            "title": "AWS (con Floci)",
            "subtopics": [
              "Compute: EC2, ECS (Docker), EKS (Kubernetes), Lambda",
              "Storage: S3 (buckets, versionado, lifecycle), EBS (volumenes), EFS (archivos)",
              "Networking: VPC, subredes, grupos de seguridad, NAT Gateway, Load Balancers (ALB, NLB), Route 53",
              "Bases de datos: RDS (Aurora, PostgreSQL, MySQL), DynamoDB, ElastiCache (Redis), DocumentDB",
              "Serverless: Lambda, API Gateway",
              "Messaging: SQS, SNS, EventBridge, Step Functions, Kinesis, MSK"
            ]
          },
          {
            "title": "Azure (con floci-az)",
            "subtopics": [
              "Compute: Virtual Machines, Functions",
              "Storage: Blob Storage, Queue Storage, Table Storage",
              "Bases de datos: Cosmos DB",
              "Messaging: Event Hubs"
            ]
          },
          {
            "title": "GCP (con floci-gcp)",
            "subtopics": [
              "Compute: Compute Engine, Cloud Functions",
              "Storage: Cloud Storage",
              "Bases de datos: Firestore, Datastore, Bigtable, Spanner",
              "Messaging: Pub/Sub"
            ]
          }
        ]
      },
      {
        "title": "Avanzado",
        "tone": "Arquitectura y Seguridad",
        "topics": [
          {
            "title": "IAM (Identity and Access Management)",
            "subtopics": [
              "AWS IAM: Users, Groups, Roles, Policies, aws iam CLI",
              "Azure Entra ID (Azure Active Directory)",
              "GCP Service Accounts",
              "Identity federation, SSO"
            ]
          },
          {
            "title": "Arquitectura de Alto Rendimiento",
            "subtopics": [
              "Multi-AZ, Multi-Region, Auto Scaling",
              "Disaster Recovery, RTO/RPO, Backup & Restore",
              "CDN: CloudFront, Azure CDN, Cloud CDN"
            ]
          },
          {
            "title": "Seguridad",
            "subtopics": [
              "Modelo de responsabilidad compartida",
              "KMS (Key Management Service), Secrets Manager, Parameter Store",
              "WAF, Shield, GuardDuty, Security Hub",
              "Compliance: SOC2, ISO 27001, GDPR, HIPAA",
              "Encryption at rest / in transit"
            ]
          },
          {
            "title": "Well-Architected Framework",
            "subtopics": [
              "Excelencia Operativa, Seguridad, Fiabilidad, Eficiencia de Rendimiento, Optimizacion de Costes"
            ]
          },
          {
            "title": "Gobernanza",
            "subtopics": [
              "AWS Organizations, SCPs (Service Control Policies)",
              "Azure Management Groups",
              "GCP Resource Hierarchy",
              "Tagging, cost allocation, budgets, cost explorer",
              "AWS Trusted Advisor"
            ]
          }
        ]
      },
      {
        "title": "Master",
        "tone": "DevOps, Automatizacion y Tendencias",
        "topics": [
          {
            "title": "Infraestructura como Codigo",
            "subtopics": [
              "Terraform, AWS CloudFormation, AWS CDK, Azure Resource Manager (ARM), GCP Deployment Manager"
            ]
          },
          {
            "title": "CI/CD",
            "subtopics": [
              "AWS CodePipeline, CodeBuild, CodeDeploy",
              "Azure DevOps, Google Cloud Build",
              "GitHub Actions"
            ]
          },
          {
            "title": "Contenedores y Orquestacion",
            "subtopics": [
              "Amazon ECS, EKS, Azure AKS, GCP GKE",
              "Docker, Helm, Service Mesh (Istio)"
            ]
          },
          {
            "title": "Observabilidad",
            "subtopics": [
              "CloudWatch (Metrics, Logs, Alarms, Events), AWS X-Ray",
              "Azure Monitor, Application Insights",
              "GCP Cloud Monitoring, Cloud Logging, Cloud Trace",
              "OpenTelemetry"
            ]
          },
          {
            "title": "AI/ML en la Nube",
            "subtopics": [
              "AWS SageMaker, Bedrock, Rekognition, Polly",
              "Azure Machine Learning, Cognitive Services",
              "GCP Vertex AI, AutoML, BigQuery ML"
            ]
          },
          {
            "title": "Data & Analytics",
            "subtopics": [
              "AWS Redshift, EMR, Glue, Kinesis",
              "Azure Synapse, Data Factory",
              "GCP BigQuery, Dataflow, Pub/Sub"
            ]
          },
          {
            "title": "Migracion y Modernizacion",
            "subtopics": [
              "AWS Migration Hub, AWS Snowball/Snowmobile",
              "Azure Migrate, Google Transfer Appliance",
              "6 R's: Rehost, Replatform, Repurchase, Refactor, Retire, Retain"
            ]
          }
        ]
      }
    ]
  }
];

const courses = COURSE_BLUEPRINTS.map((course, index) => {
  const total = course.levels.reduce((sum, level) => sum + level.topics.length, 0);
  const start = COURSE_BLUEPRINTS.slice(0, index).reduce(
    (sum, item) => sum + item.levels.reduce((levelSum, level) => levelSum + level.topics.length, 0),
    1,
  );

  return {
    id: course.id,
    code: course.code,
    title: course.title,
    description: course.description,
    project: course.project,
    start,
    end: start + total - 1,
  };
});

const fallbackSteps = COURSE_BLUEPRINTS.flatMap((course, courseIndex) => {
  let offset = courses[courseIndex].start;
  return course.levels.flatMap((levelBlock) =>
    levelBlock.topics.map((topic) => {
      const number = offset;
      offset += 1;
      return step(number, course, levelBlock, topic);
    }),
  );
});

function step(number, course, level, topic) {
  const subtopics = topic.subtopics.length ? topic.subtopics : ["Idea principal, vocabulario clave y uso en proyecto real"];
  const normalizedLevel = normalizeLevel(level.title);
  const connection = number === 1
    ? "Este primer paso crea el mapa mental base para avanzar sin memorizar a ciegas."
    : "Se conecta con lo anterior porque convierte el fundamento previo en una decision practica dentro del proyecto.";
  return {
    number,
    title: `${course.title}: ${topic.title}`,
    explanation: `¿Por que es importante esto? Porque ${topic.title} aparece cuando construyes, depuras o defiendes una solucion real. ¿Como se conecta con lo que ya aprendiste? ${connection} ${normalizedLevel} (${level.tone}). ${subtopics[0]}.`,
    objective: `Dominar ${topic.title} dentro de ${course.title} y conectarlo con el proyecto final.`,
    theory: `Teoria: ${topic.title} se estudia identificando proposito, entradas, salidas, errores comunes y limites. Primero entiende que problema resuelve; despues observa donde aparece en ${course.project}. Tema base extraido de la guia completa: ${subtopics[0]}. La meta no es repetir definiciones, sino poder explicar cuando usarlo, cuando evitarlo y como validarlo con una prueba pequena.`,
    command: `Practica: crea una nota, ejemplo o mini ejercicio sobre "${topic.title}" dentro del proyecto final: ${course.project}.`,
    // Cambio P2: cada leccion generada recibe nivel y tiempo para badges visuales.
    difficulty: normalizedLevel,
    estimatedTime: normalizedLevel === "Principiante" ? "10 min" : normalizedLevel === "Intermedio" ? "15 min" : normalizedLevel === "Avanzado" ? "20 min" : "25 min",
    deepDive: `Profundiza revisando sus limites, costos, tradeoffs y relacion con otros temas del modulo ${course.title}.`,
    commonErrors: [
      "Memorizar nombres sin construir un ejemplo minimo.",
      "Copiar codigo sin explicar entradas, salidas y fallos.",
      "Saltar a herramientas avanzadas sin validar el fundamento.",
    ],
    challenge: `Reto: aplica ${topic.title} en una pieza pequena del proyecto "${course.project}" y documenta la decision tecnica.`,
    resources: [
      officialResourceForCourse(course.id),
      "Roadmap del modulo y ejemplos del proyecto.",
      "Pruebas, logs o mediciones que demuestren que funciona.",
    ],
    breakdown: [
      `Modulo: ${course.title}`,
      `Nivel: ${normalizedLevel}`,
      `Proyecto final: ${course.project}`,
      `Desglose de practica: define el objetivo, crea el ejemplo minimo, ejecuta la prueba, compara la salida esperada y escribe una conclusion.`,
      `Opciones y flags: si el comando usa --endpoint-url, -p, --region u otra opcion, explica que valor cambia, por que existe y que fallaria al quitarla.`,
      ...subtopics,
    ],
    output: `Resultado esperado: puedes explicar ${topic.title}, aplicar sus subtemas, detectar errores comunes y defender una solucion practica.`,
    curiosity: `¿Sabías que? ${topic.title} deja de ser teoría cuando puedes predecir un fallo, reproducirlo y explicar por qué la solución lo corrige.`,
    exercise: {
      prompt: `Explica cómo aplicarías ${topic.title} en ${course.project}. Incluye una decisión, un posible fallo y una forma concreta de verificarla.`,
      minLength: 100,
      keywords: [topic.title, course.title, "prueba", "error", "verificar"],
      hint: `Menciona ${topic.title}, describe una entrada y una salida, y propone una prueba observable.`,
    },
    quiz: [
      {
        question: `¿Cuál es el objetivo principal de esta lección sobre ${topic.title}?`,
        options: [
          `Aplicarlo y verificarlo dentro de ${course.project}`,
          "Memorizar todos los nombres sin ejecutar nada",
          "Instalar dependencias sin comprender el problema",
          "Evitar documentar decisiones técnicas",
        ],
        correct: 0,
        explanation: `Correcto: la meta es aplicar ${topic.title} y demostrar el resultado con evidencia.`,
        hint: "Busca la opción que combina práctica y verificación.",
      },
      {
        question: `¿Qué evidencia demuestra mejor que comprendiste ${topic.title}?`,
        options: [
          "Una captura sin contexto",
          "Código copiado que no puedes explicar",
          "Una prueba reproducible, su resultado y una explicación propia",
          "Una lista de términos aislados",
        ],
        correct: 2,
        explanation: "Correcto: una evidencia profesional debe ser reproducible y explicable.",
        hint: "La evidencia debe permitir que otra persona repita la comprobación.",
      },
      {
        question: "¿Qué debes hacer cuando el ejemplo falla?",
        options: [
          "Ocultar el error y avanzar",
          "Cambiar muchas cosas al mismo tiempo",
          "Copiar otra solución sin comparar",
          "Aislar la causa, formular una hipótesis y conservar una prueba de regresión",
        ],
        correct: 3,
        explanation: "Correcto: diagnosticar de forma controlada convierte el error en aprendizaje.",
        hint: "Piensa en el método científico aplicado al código.",
      },
    ],
  };
}

function normalizeLevel(title) {
  if (title === "Fundamentos") return "Principiante";
  if (title === "Intermedio") return "Intermedio";
  if (title === "Avanzado") return "Avanzado";
  return "Master";
}

function officialResourceForCourse(courseId) {
  const resources = {
    javascript: "Documentacion oficial: MDN JavaScript - https://developer.mozilla.org/docs/Web/JavaScript",
    node: "Documentacion oficial: Node.js - https://nodejs.org/docs/latest/api/",
    htmlcss: "Documentacion oficial: MDN HTML/CSS - https://developer.mozilla.org/docs/Learn",
    angular: "Documentacion oficial: Angular - https://angular.dev/overview",
    react: "Documentacion oficial: React - https://react.dev/learn",
    java: "Documentacion oficial: Java - https://docs.oracle.com/en/java/",
    spring: "Documentacion oficial: Spring Boot - https://docs.spring.io/spring-boot/",
    devops: "Documentacion oficial: Docker, Kubernetes y Terraform - https://docs.docker.com/ | https://kubernetes.io/docs/ | https://developer.hashicorp.com/terraform/docs",
    cloud: "Documentacion oficial: AWS, Azure y GCP - https://docs.aws.amazon.com/ | https://learn.microsoft.com/azure/ | https://cloud.google.com/docs",
    mobile: "Documentacion oficial: Android, iOS y React Native - https://developer.android.com/docs | https://developer.apple.com/documentation/ | https://reactnative.dev/docs/getting-started",
  };
  return resources[courseId] || "Documentacion oficial de la tecnologia principal.";
}
