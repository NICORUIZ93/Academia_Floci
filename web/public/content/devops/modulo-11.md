# Módulo 11: Seguridad DevSecOps

## Sílabo

**Objetivo general**

Integrar la seguridad en cada etapa del pipeline en vez de tratarla como un paso final, mediante escaneo automatizado de imágenes y dependencias, gestión adecuada de secretos, menor privilegio en credenciales de CI/CD, y trazabilidad de dependencias con SBOM.

**Objetivos específicos**

1. Escanear una imagen Docker propia con Trivy e interpretar el reporte de vulnerabilidades.
2. Integrar ese escaneo como un paso obligatorio del pipeline de CI que bloquee el merge ante vulnerabilidades críticas.
3. Configurar secretos de pipeline usando los mecanismos nativos de la plataforma de CI, nunca hardcodeados.
4. Aplicar el principio de menor privilegio a los tokens y permisos usados por un pipeline de CI/CD.
5. Generar y explicar el propósito de un SBOM.
6. Diferenciar SAST, DAST y SCA como categorías de análisis de seguridad.

**Contenido**

- Gestión de secretos (Vault, SOPS).
- Escaneo de imágenes y dependencias (Trivy, Snyk).
- Principio de menor privilegio en CI/CD.
- SBOM y supply chain security.
- SAST, DAST y SCA: diferencias y herramientas (OWASP ZAP, Burp Suite).

**Evaluación**

Un laboratorio que escanea una imagen propia, la integra al pipeline como gate obligatorio, y configura secretos correctamente; tres ejercicios de evaluación sobre interpretar un reporte de Trivy, diseñar permisos mínimos de un token de CI, y elegir entre SAST/DAST/SCA.

---

## Contenido teórico

### Tema 1: Escaneo de imágenes y dependencias (Trivy, Snyk)

**Conceptos clave:** CVE (vulnerabilidad conocida), escaneo de sistema operativo base, escaneo de dependencias de aplicación, severidad (crítica, alta, media, baja).

Una CVE (Common Vulnerabilities and Exposures) es una vulnerabilidad de seguridad conocida y catalogada públicamente, identificada por un código único, que afecta a una versión específica de un paquete de software. Herramientas como Trivy o Snyk escanean tanto el sistema operativo base de una imagen Docker (las librerías del sistema instaladas, heredadas de la imagen base que estudiaste en el Módulo 2 de este track) como las dependencias de aplicación empaquetadas dentro de ella (las librerías de tu gestor de paquetes específico: npm, pip, Maven), comparando cada versión instalada contra bases de datos actualizadas de vulnerabilidades conocidas, y reportando cualquier coincidencia encontrada junto con su nivel de severidad.

`trivy image mi-api:1.0` es el comando básico que escanea una imagen ya construida, produciendo un reporte que lista cada vulnerabilidad encontrada, el paquete específico afectado, la versión instalada frente a la versión donde se corrigió (si existe una corrección disponible), y su severidad clasificada (crítica, alta, media, baja), permitiendo priorizar qué vulnerabilidades atender primero según su impacto potencial real.

Este escaneo conecta directamente con la elección de imagen base que estudiaste en el Módulo 2: una imagen base completa, con muchas más librerías y utilidades instaladas de las estrictamente necesarias, presenta naturalmente una superficie mucho mayor de posibles vulnerabilidades detectables, mientras que una imagen Alpine o distroless minimalista, al contener drásticamente menos software instalado, reduce proporcionalmente cuántas vulnerabilidades potenciales existen para reportar en primer lugar; el escaneo de vulnerabilidades y la elección de imagen base minimalista son, en la práctica, dos estrategias de seguridad complementarias que se refuerzan mutuamente, no alternativas independientes entre sí.

Es importante entender que la existencia de una vulnerabilidad reportada no significa automáticamente que tu aplicación específica esté explotable a través de ella: una CVE en una librería que tu código nunca invoca de la forma vulnerable, o en un componente que no está expuesto a entrada de usuario no confiable, puede representar un riesgo real mucho menor que su severidad catalogada sugeriría de forma aislada. Esto no justifica ignorar sistemáticamente las alertas, pero sí requiere criterio humano al priorizar la respuesta, en vez de tratar cada CVE reportada como igualmente urgente sin ningún contexto adicional sobre cómo se usa realmente ese componente específico en tu aplicación.

**Analogía:** escanear una imagen con Trivy es como hacer una inspección de seguridad exhaustiva de un edificio antes de habitarlo, revisando cada componente instalado (cerraduras, cableado eléctrico, materiales de construcción) contra una base de datos actualizada de defectos de fabricación conocidos reportados públicamente por sus fabricantes, y recibiendo un informe priorizado de qué defectos son más urgentes de corregir antes de mudarse, en vez de descubrirlos accidentalmente después de ocupar el edificio.

**¿Por qué es importante?** El software moderno depende de una cadena enorme de dependencias de terceros, cada una potencialmente introduciendo vulnerabilidades que el equipo de desarrollo nunca escribió directamente ni tiene forma de conocer sin una herramienta de escaneo dedicada; ignorar esta superficie de riesgo es una de las causas más comunes de brechas de seguridad reales en la industria, muchas de las cuales explotan vulnerabilidades ya conocidas y con corrección disponible, simplemente no aplicada a tiempo.

**Diagrama:**

```
docker build ──▶ Imagen mi-api:1.0
                        │
                   trivy image mi-api:1.0
                        │
             compara cada paquete instalado
             contra base de datos de CVEs conocidas
                        │
             ┌──────────┼──────────┐
             ▼                     ▼
       Sin vulnerabilidades    Vulnerabilidades encontradas
       críticas reportadas      (priorizadas por severidad)
```

### Tema 2: Integración en el pipeline

**Conceptos clave:** escaneo como gate obligatorio, `--exit-code`, bloqueo de merge por vulnerabilidad crítica.

Ejecutar un escaneo de vulnerabilidades manualmente y de forma esporádica tiene un valor limitado comparado con integrarlo como un paso automático y obligatorio dentro del pipeline de CI que ya construiste en el Módulo 4 de este track: `trivy image --exit-code 1 --severity CRITICAL mi-api:${{ github.sha }}` configura Trivy para que termine con un código de salida distinto de cero (fallando explícitamente el job de CI) si encuentra al menos una vulnerabilidad de severidad crítica, aplicando exactamente el mismo mecanismo de "un comando que falla detiene el pipeline" que ya usaste para tests y linting en el Módulo 4.

Esta integración convierte la seguridad en un gate obligatorio del proceso de entrega, no en una revisión opcional que alguien podría (u olvidaría) ejecutar manualmente de vez en cuando: siguiendo exactamente el mismo razonamiento que ya viste sobre por qué CI obligatorio a nivel técnico es más robusto que depender de la disciplina individual de cada persona (Módulo 4, Tema 4), hacer el escaneo de seguridad un paso técnicamente bloqueante del pipeline elimina la dependencia de que alguien recuerde ejecutarlo manualmente antes de cada despliegue.

La etiqueta de imagen usada en el ejemplo (`${{ github.sha }}`, el hash del commit específico que disparó el pipeline) es también una práctica deliberada: escanear y etiquetar la imagen exacta que corresponde a ese commit específico, en vez de reescanear repetidamente una etiqueta genérica como `latest` que podría representar contenido distinto en momentos distintos, asegura una trazabilidad exacta entre qué código específico generó qué imagen específica y qué resultado de escaneo corresponde exactamente a esa combinación.

Es importante calibrar el umbral de severidad que bloquea el pipeline (`--severity CRITICAL` en el ejemplo) con criterio: bloquear ante cualquier vulnerabilidad de cualquier severidad, incluyendo las de severidad baja o media que pueden ser extremadamente numerosas y de bajo riesgo real, puede generar la misma fatiga y fricción que ya estudiaste con alertas mal calibradas en el módulo de observabilidad de este mismo track, llevando a los equipos a buscar formas de saltarse o ignorar la validación en vez de tratarla como una señal confiable y accionable.

**Analogía:** ejecutar un escaneo de seguridad manualmente de vez en cuando es como hacer una revisión de seguridad de un edificio solo cuando alguien se acuerda de programarla, dejando ventanas de tiempo sin ninguna verificación reciente. Integrarlo como gate obligatorio del pipeline es como instalar un sistema de inspección automática que revisa cada nueva construcción antes de que se permita ocuparla, sin excepciones ni dependencia de que un inspector humano lo recuerde cada vez.

**¿Por qué es importante?** Igual que con CI obligatorio en general, convertir el escaneo de seguridad en una regla técnica del pipeline —no una práctica opcional dependiente de memoria individual— es lo que garantiza consistentemente que ninguna imagen con vulnerabilidades críticas conocidas llegue a producción sin que al menos alguien haya tenido la oportunidad explícita de revisarla y decidir conscientemente.

**Diagrama:**

```
Pipeline de CI
├── Job "test" (lint, tests)
├── Job "build" (construye la imagen mi-api:sha123)
└── Job "escaneo-seguridad"
     └── trivy image --exit-code 1 --severity CRITICAL mi-api:sha123
          │
     ¿vulnerabilidad crítica encontrada?
          │
         Sí ──▶ el job falla ──▶ el PR queda bloqueado (CI obligatorio)
         No ──▶ el pipeline continúa hacia el despliegue
```

### Tema 3: Gestión de secretos (Vault, SOPS)

**Conceptos clave:** secreto hardcodeado (antipatrón), inyección en runtime, cifrado en reposo, auditoría de acceso.

Hardcodear un secreto directamente en el código fuente (`const apiKey = "sk-abc123";`) es uno de los antipatrones de seguridad más comunes y más fácilmente evitables: ese valor queda expuesto en el historial de control de versiones para siempre (recuperable incluso después de eliminarlo en un commit posterior, exactamente el mismo problema que estudiaste con `.env` filtrado en el Módulo 3 de este track), visible para cualquiera con acceso de lectura al repositorio, y sin ningún registro de auditoría de quién lo consultó o cuándo.

La alternativa correcta es inyectar secretos en tiempo de ejecución desde una fuente externa gestionada específicamente para ese propósito (`const apiKey = process.env.API_KEY;`, leyendo de una variable de entorno poblada externamente por el sistema de despliegue, no hardcodeada en el código), combinado con una herramienta dedicada de gestión de secretos que provee ese valor de forma segura al proceso en el momento exacto en que lo necesita. Vault (HashiCorp) es una de las herramientas de gestión de secretos más adoptadas: cifra los secretos en reposo, controla el acceso mediante políticas específicas (aplicando el mismo principio de mínimo privilegio que ya conoces de IAM en el track Cloud y de RBAC en Kubernetes), y mantiene un registro de auditoría detallado de exactamente quién o qué proceso accedió a cada secreto y cuándo.

SOPS (Secrets OPerationS) resuelve un problema relacionado pero distinto: permite cifrar archivos completos de configuración (que pueden contener una mezcla de valores sensibles y no sensibles) de forma que puedan versionarse de forma segura directamente en un repositorio Git —a diferencia de la práctica de excluir completamente `.env` del control de versiones que viste en el Módulo 3—, descifrándose automáticamente solo en el momento y lugar correctos (por ejemplo, durante el despliegue, usando una clave de descifrado gestionada de forma separada y más restringida). Esto habilita un flujo de "todo como código, incluso la configuración cifrada", manteniendo trazabilidad completa de cambios de configuración en el historial de Git sin exponer los valores reales en texto plano.

La elección entre depender exclusivamente de los secretos nativos de la plataforma (como los Secrets de Kubernetes, cuya limitación real de seguridad ya estudiaste en el módulo de Kubernetes de este track) y una herramienta dedicada como Vault o SOPS depende de cuán crítica sea la protección de esos secretos específicos: para la mayoría de los proyectos con requisitos de seguridad serios, complementar los mecanismos nativos de la plataforma con una herramienta dedicada de gestión de secretos, en vez de depender únicamente de la codificación base64 no cifrada de un Secret nativo de Kubernetes, es la práctica recomendada.

**Analogía:** hardcodear un secreto en el código es como escribir la combinación de tu caja fuerte directamente en un cartel pegado en la puerta de tu casa, visible para cualquiera que pase por ahí y quede registrado permanentemente en cualquier fotografía que alguien tome de esa puerta. Vault es como una caja fuerte profesional gestionada por una empresa de seguridad especializada, que registra exactamente quién solicitó acceso a qué contenido y cuándo, entregando la combinación solo a quienes están autorizados y solo en el momento exacto en que la necesitan.

**¿Por qué es importante?** Los secretos hardcodeados o mal gestionados son, de forma consistente, una de las causas más citadas de incidentes de seguridad reales en la industria del software; adoptar desde el principio de un proyecto la disciplina de nunca hardcodear secretos y de usar mecanismos de gestión adecuados es una de las prácticas de seguridad de menor coste de adopción temprana y de mayor coste de corrección tardía, después de que un secreto ya se haya filtrado.

**Diagrama:**

```
NUNCA:                                    SIEMPRE:
const apiKey = "sk-abc123";               const apiKey = process.env.API_KEY;
(hardcodeado, expuesto en el                     │
 historial de Git para siempre)            (inyectado en runtime desde
                                             Vault/SOPS/gestor de secretos,
                                             con cifrado y auditoría de acceso)
```

### Tema 4: Menor privilegio en CI/CD

**Conceptos clave:** token de pipeline, permisos acotados por tarea, radio de exposición ante filtración.

El token o las credenciales que un pipeline de CI/CD usa para realizar sus tareas —desplegar a un entorno, publicar una imagen a un registry, aplicar cambios de infraestructura con Terraform— son, en la práctica, uno de los activos más sensibles de todo el sistema de entrega de software, precisamente porque un pipeline automatizado se ejecuta con mucha frecuencia y, si sus credenciales se filtran (por un error de configuración, una dependencia comprometida, o una vulnerabilidad en la propia plataforma de CI), el daño potencial depende directamente de cuán amplios sean los permisos que ese token específico tiene concedidos.

Aplicar mínimo privilegio a estas credenciales de pipeline sigue exactamente el mismo principio que ya estudiaste en profundidad con IAM en el track Cloud y con RBAC en el módulo de Kubernetes de este track: un token usado específicamente para desplegar una aplicación no debería tener permisos de administrador sobre toda la infraestructura de la organización, sino únicamente los permisos exactos y mínimos necesarios para esa tarea específica y acotada (por ejemplo, permiso para actualizar el Deployment de una aplicación específica en un namespace específico, no permiso irrestricto sobre el clúster completo).

Un patrón cada vez más adoptado para reducir aún más este riesgo es evitar por completo credenciales de larga duración almacenadas como secretos del pipeline, en favor de identidades federadas de corta duración: la plataforma de CI se autentica ante el proveedor de nube usando un mecanismo de confianza federada (por ejemplo, OpenID Connect), obteniendo credenciales temporales válidas solo durante la ejecución específica de ese pipeline, sin necesidad de almacenar ninguna credencial de larga duración como secreto en la configuración de CI en absoluto; este enfoque elimina directamente el riesgo de que un secreto de larga duración almacenado en la plataforma de CI se filtre, porque simplemente no existe ninguna credencial permanente que filtrar.

Revisar periódicamente qué permisos tienen realmente concedidos los tokens y credenciales usados por cada pipeline, y retirar cualquier permiso concedido "por si acaso" que no se use realmente en la práctica, es la misma disciplina de auditoría periódica que ya estudiaste como buena práctica de IAM en el track Cloud, aplicada ahora específicamente al contexto de credenciales de automatización de CI/CD.

**Analogía:** el token de un pipeline de CI/CD es como la llave maestra que le das a un servicio de limpieza que entra a tu oficina todas las noches: si le das una llave que abre absolutamente todas las puertas del edificio completo, incluyendo la caja fuerte y los archivos confidenciales de otros departamentos, y esa llave se pierde o se copia sin autorización, el daño potencial es enorme. Si en cambio le das una llave que solo abre las puertas específicas que necesita limpiar, el riesgo de una llave perdida queda acotado exactamente a esas áreas específicas.

**¿Por qué es importante?** Los pipelines de CI/CD son, cada vez más, un objetivo atractivo de ataques dirigidos precisamente porque suelen tener acceso amplio y automatizado a infraestructura crítica; aplicar mínimo privilegio consistentemente a sus credenciales es una de las defensas más directas y efectivas contra el escenario en que un pipeline comprometido se convierte en la puerta de entrada a un compromiso mucho más amplio de toda la infraestructura de una organización.

**Diagrama:**

```
Token del pipeline CON permisos amplios     Token del pipeline CON mínimo privilegio
┌─────────────────────────┐              ┌─────────────────────────┐
│ Permisos de administrador     │              │ Solo: actualizar el          │
│ sobre TODA la infraestructura   │              │ Deployment "mi-api" en el     │
└─────────────────────────┘              │ namespace "produccion"          │
   Si se filtra: daño MÁXIMO                └─────────────────────────┘
                                              Si se filtra: daño ACOTADO
```

### Tema 5: SBOM y supply chain security

**Conceptos clave:** SBOM (Software Bill of Materials), cadena de suministro de software, respuesta rápida ante vulnerabilidades de terceros.

Un SBOM (Software Bill of Materials) es un inventario completo y estructurado de exactamente qué componentes de software —incluyendo cada dependencia directa e indirecta, con su versión exacta— forma parte de una aplicación específica en un momento dado. Generar un SBOM se ha convertido en una práctica cada vez más estándar (e incluso, en ciertos contextos regulados o gubernamentales, obligatoria contractualmente) precisamente porque el software moderno rara vez se construye desde cero: depende de una cadena extensa de librerías de terceros, cada una con sus propias dependencias adicionales, formando lo que se conoce como la cadena de suministro de software (software supply chain) de una aplicación.

El valor práctico de un SBOM se hace evidente cuando se reporta públicamente una vulnerabilidad crítica en una librería específica ampliamente usada en el ecosistema (un evento que ocurre con relativa frecuencia en la industria): sin un SBOM ya generado y actualizado, responder a la pregunta "¿usamos esa librería vulnerable en alguno de nuestros sistemas, y en qué versión específica?" puede requerir una auditoría manual que tome días, revisando manualmente las dependencias de cada proyecto de la organización. Con un SBOM generado automáticamente como parte del pipeline de CI/CD para cada build, esa misma pregunta se responde en minutos con una simple consulta sobre los SBOMs ya generados y almacenados, identificando exactamente qué sistemas están afectados y con qué urgencia deben actualizarse.

La seguridad de la cadena de suministro de software va más allá de solo mantener un inventario: incluye verificar la integridad y procedencia de cada componente que se incorpora a una aplicación (confirmando que una dependencia descargada no fue alterada maliciosamente en tránsito o en el propio repositorio de paquetes de origen), y ha ganado atención creciente en la industria tras varios incidentes de alto perfil donde atacantes comprometieron dependencias populares ampliamente utilizadas, afectando indirectamente a un número enorme de aplicaciones que las consumían sin saberlo, precisamente el tipo de riesgo que un inventario preciso (SBOM) y una verificación de integridad ayudan a mitigar y a responder rápidamente cuando ocurre.

Generar un SBOM automáticamente como parte del pipeline (muchas herramientas de escaneo, incluyendo Trivy y Snyk mencionadas en el Tema 1, pueden generar un SBOM como parte del mismo proceso de escaneo) y almacenarlo junto con cada versión desplegada de la aplicación es una práctica de bajo coste adicional (aprovechando herramientas que probablemente ya estás usando para el escaneo de vulnerabilidades) que proporciona un beneficio significativo de capacidad de respuesta rápida ante futuras vulnerabilidades reportadas en el ecosistema.

**Analogía:** un SBOM es como la lista completa y precisa de ingredientes de un producto alimenticio empaquetado, incluyendo no solo los ingredientes principales sino también los aditivos y componentes de los propios ingredientes compuestos. Si una autoridad sanitaria anuncia que un aditivo específico de un proveedor concreto está contaminado, un fabricante con listas de ingredientes precisas y actualizadas de todos sus productos puede responder en minutos exactamente qué productos suyos contienen ese aditivo específico, mientras que un fabricante sin ese registro preciso tendría que revisar manualmente las fórmulas de cada producto individual, un proceso mucho más lento.

**¿Por qué es importante?** A medida que la cadena de suministro de software se vuelve un vector de ataque cada vez más relevante en la industria, mantener un inventario preciso y actualizado de dependencias mediante SBOMs generados automáticamente es lo que permite a una organización responder con velocidad y precisión ante vulnerabilidades reportadas en el ecosistema más amplio, en vez de depender de auditorías manuales lentas exactamente en el momento en que la velocidad de respuesta más importa.

**Diagrama:**

```
Pipeline genera SBOM en cada build
┌─────────────────────────────────┐
│ mi-api v1.2.3                       │
│  ├── express@4.18.2                  │
│  ├── lodash@4.17.21                    │
│  └── (todas las dependencias, directas │
│       e indirectas, con versión exacta) │
└─────────────────────────────────┘
        │
   Se reporta una CVE crítica en lodash@4.17.21
        │
   Consulta rápida a los SBOMs almacenados
        │
   ──▶ "Sí, mi-api v1.2.3 usa esa versión exacta" (minutos, no días)
```

### Tema 6: SAST, DAST y SCA — diferencias y herramientas

**Conceptos clave:** SAST (análisis estático), DAST (análisis dinámico), SCA (análisis de composición de software), OWASP ZAP, Burp Suite.

SAST (Static Application Security Testing) analiza el código fuente de una aplicación sin ejecutarlo, buscando patrones de código potencialmente vulnerables (por ejemplo, construcción insegura de consultas SQL susceptibles a inyección, uso de funciones criptográficas débiles, o manejo inseguro de entrada de usuario) directamente a partir del texto del código, típicamente integrado como un paso más del pipeline de CI, de forma similar a como integraste el linting en el Módulo 4 de este track. Su ventaja principal es detectar problemas potenciales muy temprano en el ciclo de desarrollo, incluso antes de que el código se ejecute en ningún entorno; su limitación es que puede generar falsos positivos (patrones que parecen sospechosos pero no son realmente explotables en el contexto específico de esa aplicación) y no puede detectar vulnerabilidades que solo se manifiestan en el comportamiento real en tiempo de ejecución.

DAST (Dynamic Application Security Testing) analiza una aplicación ya en ejecución, típicamente enviándole peticiones automatizadas diseñadas específicamente para detectar comportamientos vulnerables observables desde fuera (intentos de inyección, manejo incorrecto de autenticación, exposición de información sensible en respuestas), de forma análoga a cómo un atacante real interactuaría con la aplicación. Herramientas como OWASP ZAP (de código abierto y gratuita) o Burp Suite (con una edición gratuita limitada y una versión profesional de pago mucho más completa) son las más adoptadas para este tipo de análisis. La ventaja de DAST es que detecta problemas reales observables en el comportamiento efectivo de la aplicación en ejecución, incluyendo interacciones complejas entre componentes que SAST, al analizar solo código estático aislado, no puede anticipar; su limitación es que solo puede probar lo que efectivamente se ejecuta y es alcanzable durante esa sesión de pruebas específica, y típicamente se ejecuta más tarde en el ciclo de desarrollo (contra un entorno de pruebas ya desplegado), no directamente sobre el código fuente antes de ejecutarlo.

SCA (Software Composition Analysis) es, en esencia, el mismo tipo de análisis que ya estudiaste con Trivy y Snyk en el Tema 1: analiza las dependencias de terceros de una aplicación (no el código propio escrito por el equipo) buscando vulnerabilidades conocidas en esas dependencias específicas y sus versiones exactas, siendo la categoría de análisis que directamente habilita también la generación de un SBOM (Tema 5), dado que ambos requieren el mismo inventario preciso de dependencias como base de su funcionamiento.

Estas tres categorías —SAST sobre código propio estático, DAST sobre comportamiento en ejecución, SCA sobre dependencias de terceros— son complementarias, no sustitutas entre sí: un programa de seguridad de aplicaciones maduro típicamente integra las tres en distintos puntos del ciclo de desarrollo (SAST y SCA tempranamente en CI, sobre cada pull request; DAST más tarde, contra un entorno de pruebas ya desplegado), reconociendo que cada una detecta un tipo de problema que las otras dos, por su propio diseño y alcance, no pueden detectar.

**Analogía:** SAST es como revisar los planos arquitectónicos de un edificio antes de construirlo, buscando errores de diseño estructural evidentes en el papel. DAST es como poner a prueba el edificio ya construido con inspectores que intentan activamente forzar puertas, probar la resistencia de ventanas, y buscar puntos débiles reales en la estructura terminada, algo que no se puede evaluar completamente solo mirando los planos. SCA es como verificar la procedencia y calidad certificada de cada material de construcción específico (ladrillos, cableado) comprado a proveedores externos, en vez de evaluar el diseño propio del edificio en sí.

**¿Por qué es importante?** Ninguna de las tres categorías por sí sola cubre todo el espectro de riesgos de seguridad de una aplicación moderna; entender qué detecta específicamente cada una permite diseñar un programa de seguridad de aplicaciones completo que combine las tres en los puntos correctos del ciclo de desarrollo, en vez de depender de una sola categoría de análisis y asumir erróneamente que eso cubre todos los riesgos relevantes.

**Diagrama:**

```
SAST                          DAST                         SCA
(código propio,                (aplicación en ejecución,     (dependencias de
 sin ejecutar,                  probada activamente            terceros, versiones
 temprano en CI)                 como un atacante real)          exactas conocidas)
     │                                │                              │
     ▼                                ▼                              ▼
Errores de código             Vulnerabilidades de           Vulnerabilidades
potencialmente inseguro         comportamiento real              conocidas en
                                                                   librerías externas
```

---

## Criterio transversal de calidad del código

Aplica estas decisiones en todos los ejemplos y en tu entrega:

- usa nombres que expresen intención, dominio y unidades; evita `data`, `temp`, `manager` o `process` cuando exista un término preciso;
- mantén funciones, componentes, clases, consultas y módulos cohesionados alrededor de una responsabilidad comprobable;
- haz visibles las dependencias y los efectos de red, tiempo, archivos, estado y base de datos;
- valida entradas en la frontera y representa errores con contexto, sin ocultar la causa ni registrar secretos;
- elimina duplicación de reglas, no toda repetición textual; una abstracción incorrecta cuesta más que dos líneas parecidas;
- escribe primero la solución más simple que satisface el requisito y refactoriza con pruebas verdes;
- aplica SOLID únicamente cuando exista una necesidad real de cambio, extensión, sustitución o aislamiento.

**SOLID con criterio:** responsabilidad única significa una razón coherente de cambio, no una clase por función. Abierto/cerrado justifica estrategias cuando hay variantes reales. Sustitución exige respetar contratos. Segregación evita obligar a consumidores a depender de operaciones que no usan. Inversión de dependencias protege el dominio frente a detalles externos; no exige crear interfaces para cada objeto.

**Comprobación antes de continuar:** ¿otra persona puede entender los nombres y el flujo?, ¿los casos de error son observables?, ¿una prueba demuestra la regla principal?, ¿cada abstracción aporta más claridad de la que cuesta? Registra una decisión de refactorización y una decisión consciente de *no abstraer*.

## Laboratorio práctico

**Objetivo del laboratorio:** escanear una imagen propia con Trivy, integrar ese escaneo como gate obligatorio en el pipeline de CI, configurar secretos correctamente usando los mecanismos nativos de la plataforma, y generar un SBOM.

**Requisitos previos:** una imagen Docker propia (del Módulo 2 de este track), el pipeline de CI del Módulo 4 ya configurado, Trivy instalado localmente para pruebas iniciales.

| Paso | Acción | Comando/Configuración | Explicación | Resultado esperado |
|---|---|---|---|---|
| 1 | Escanear la imagen localmente | `trivy image mi-api:1.0` | Revisa el reporte completo de vulnerabilidades antes de integrarlo al pipeline | Un reporte con vulnerabilidades clasificadas por severidad (o ninguna, si la imagen está limpia) |
| 2 | Revisar y priorizar el reporte | Identifica manualmente si hay vulnerabilidades críticas, y si existe una versión corregida disponible para el paquete afectado | Aplica el criterio del Tema 1 antes de bloquear nada automáticamente | Una lista priorizada de qué actualizar primero, si aplica |
| 3 | Integrar el escaneo al pipeline de CI | Añade un step al workflow del Módulo 4: `trivy image --exit-code 1 --severity CRITICAL mi-api:${{ github.sha }}` | Convierte el escaneo en un gate obligatorio | El step se añade correctamente al archivo de workflow |
| 4 | Provocar un fallo intencional (opcional, si tienes una imagen con vulnerabilidades conocidas de prueba) | Usa una imagen base intencionalmente desactualizada para verificar que el pipeline efectivamente bloquea el merge | Confirma que el gate funciona como se espera | El pipeline falla visiblemente si hay una vulnerabilidad crítica |
| 5 | Configurar un secreto en GitHub Actions | En la configuración del repositorio, añade un secreto (por ejemplo, un token de despliegue) usando la sección nativa de "Secrets" de GitHub, nunca escrito directamente en el archivo YAML del workflow | Aplica el Tema 3 usando el mecanismo nativo de la plataforma | El secreto aparece listado (sin mostrar su valor) en la configuración del repositorio |
| 6 | Revisar los permisos del token por defecto del pipeline | Revisa la configuración de permisos del `GITHUB_TOKEN` automático que usa tu workflow, y redúcelos explícitamente al mínimo necesario (por ejemplo, solo lectura de contenido si el workflow no necesita escribir nada) | Aplica el Tema 4 | La configuración de permisos queda explícitamente acotada, no usando los permisos amplios por defecto |
| 7 | Generar un SBOM | `trivy image --format cyclonedx --output sbom.json mi-api:1.0` (o la herramienta equivalente que prefieras) | Genera un inventario estructurado de dependencias | Se genera un archivo `sbom.json` con el listado completo de componentes y versiones |

**Verificación:** el laboratorio se considera exitoso si el pipeline de CI efectivamente bloquea el merge cuando se escanea una imagen con una vulnerabilidad crítica de prueba, si el secreto configurado en el paso 5 nunca aparece en texto plano en ningún archivo versionado del repositorio, y si el SBOM generado en el paso 7 lista correctamente las dependencias reales de tu imagen.

**Errores comunes y soluciones**

- **Trivy reporta un volumen abrumador de vulnerabilidades de severidad baja/media, dificultando identificar qué es realmente urgente.** Filtra el reporte inicial por severidad (`--severity CRITICAL,HIGH`) para enfocar la atención en lo más urgente primero, sin ignorar completamente el resto, pero sin dejar que el volumen total abrume la priorización inicial.
- **El pipeline falla en el step de escaneo pero el mensaje de error no indica claramente qué vulnerabilidad específica lo causó.** Revisa la salida completa del step de Trivy en los logs del pipeline (no solo el código de salida), que normalmente incluye el detalle completo de cada vulnerabilidad encontrada, incluyendo cuál específicamente cruzó el umbral de severidad configurado.
- **El secreto configurado en GitHub Actions no parece estar disponible dentro del workflow.** Verifica que estás referenciándolo correctamente con la sintaxis `${{ secrets.NOMBRE_DEL_SECRETO }}`, y que el nombre coincide exactamente (sensible a mayúsculas y minúsculas) con el configurado en la sección de Secrets del repositorio.
- **Reducir los permisos del `GITHUB_TOKEN` rompe un step que sí necesitaba un permiso específico.** Revisa cuidadosamente qué permisos usa realmente cada step de tu workflow (por ejemplo, si algún step necesita escribir comentarios en el PR, necesita permiso de escritura sobre pull requests específicamente) antes de reducir permisos de forma demasiado agresiva sin verificar el impacto real.

---


## Rúbrica del proyecto

Esta rúbrica evalúa el laboratorio y los ejercicios como evidencia de dominio, no la mera finalización de pasos.

| Criterio | Peso | Evidencia esperada |
|---|---:|---|
| Comprensión conceptual | 20% | Explica el mecanismo, sus límites y por qué la solución funciona. |
| Implementación funcional | 30% | El artefacto satisface requisitos normales, límite y de error. |
| Verificación | 20% | Incluye pruebas, mediciones o inspecciones reproducibles. |
| Diseño y calidad | 15% | Nombres, estructura, seguridad y mantenibilidad son deliberados. |
| Comunicación profesional | 15% | README, decisiones, comandos y resultados permiten repetir el trabajo. |

Se alcanza competencia con 70/100 y sin cero en implementación o verificación. El nivel experto exige comparar alternativas, justificar trade-offs y reconocer condiciones donde la solución dejaría de ser válida.

## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- CNCF, documentación oficial de Kubernetes, Prometheus y OpenTelemetry.
- HashiCorp, *Terraform Documentation*.
- Beyer et al., *Site Reliability Engineering*; Forsgren et al., *Accelerate*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.


## Resumen del módulo

**Puntos clave**

- El escaneo de imágenes y dependencias (Trivy, Snyk) detecta vulnerabilidades conocidas (CVEs) tanto en el sistema operativo base como en las dependencias de aplicación, priorizadas por severidad.
- Integrar ese escaneo como gate obligatorio del pipeline (con `--exit-code`) convierte la seguridad en una regla técnica, no una práctica opcional dependiente de memoria individual.
- Los secretos nunca deben hardcodearse en el código; deben inyectarse en runtime desde un gestor dedicado (Vault, SOPS) o los mecanismos nativos de secretos de la plataforma de CI.
- El mínimo privilegio aplicado a tokens de CI/CD acota el daño potencial ante una filtración, exactamente el mismo principio que IAM y RBAC aplican en otros contextos.
- Un SBOM inventaría con precisión las dependencias exactas de una aplicación, permitiendo responder rápidamente ante vulnerabilidades reportadas en el ecosistema más amplio.
- SAST, DAST y SCA son categorías complementarias de análisis de seguridad, cada una detectando un tipo de problema que las otras dos no pueden detectar por su propio diseño y alcance.

**Conceptos aprendidos**

- CVEs y el escaneo de imágenes/dependencias con Trivy y Snyk.
- Integración del escaneo de seguridad como gate obligatorio del pipeline de CI.
- Gestión de secretos con Vault y SOPS, frente al antipatrón de hardcodearlos.
- Mínimo privilegio aplicado a credenciales de CI/CD.
- SBOM y seguridad de la cadena de suministro de software.
- SAST, DAST y SCA como categorías complementarias de análisis de seguridad.

**Próximos pasos**

En el Módulo 12 vas a conectar todo lo aprendido en este track con el track Cloud Local, documentando cómo el mismo pipeline despliega a un proveedor cloud real, y aplicando GitOps y Platform Engineering como conceptos avanzados adicionales.

**Recursos adicionales**

- Documentación oficial de Trivy y de Snyk como herramientas de escaneo de imágenes y dependencias.
- Documentación oficial de HashiCorp Vault y del proyecto SOPS de Mozilla.
- Documentación oficial de OWASP ZAP y del proyecto OWASP en general como referencia de buenas prácticas de seguridad de aplicaciones.
- Especificación estándar de SBOM: CycloneDX y SPDX.
