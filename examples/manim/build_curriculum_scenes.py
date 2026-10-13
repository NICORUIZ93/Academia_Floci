"""Generate standalone Manim CE scenes for the integrated 69-topic route."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "scenes"

BLOCKS = [
    (
        "01_fundamentos_java",
        "Fundamentos de programación y Java",
        [
            ("fundamentos_programacion", "Fundamentos de programación", "Entrada", "Algoritmo", "Resultado"),
            ("introduccion_java", "Introducción a Java", "Código fuente", "Bytecode / JVM", "Ejecución"),
            ("poo_java", "POO en Java", "Contrato", "Tipo concreto", "Polimorfismo"),
            ("colecciones_estructuras", "Colecciones y estructuras de datos", "Elementos", "Estructura", "Operación"),
            ("excepciones_streams", "Excepciones, Streams, Optional y Date/Time", "Datos", "Pipeline seguro", "Resultado"),
            ("concurrencia_java", "Multithreading y concurrencia", "Tareas", "Coordinación", "Resultado"),
            ("generics_lambdas", "Generics, Lambdas y programación funcional", "Tipo / función", "Composición", "Resultado"),
            ("maven_lifecycle", "Maven: build lifecycle", "Fuentes", "Fases Maven", "Artefacto"),
            ("roadmap_java", "Roadmap Java completo", "Fundamentos", "Práctica", "Proyecto"),
        ],
    ),
    (
        "02_backend_spring",
        "Backend con Java y Spring",
        [
            ("spring_fundamentos", "Fundamentos de Spring y Spring Boot", "Configuración", "IoC / DI", "Aplicación"),
            ("spring_nueve_capas", "Spring Boot en nueve capas", "Fundamentos", "Capas", "Operación"),
            ("spring_rest", "APIs REST con Spring Boot", "HTTP", "Controller / DTO", "Respuesta"),
            ("spring_jpa", "Spring Data JPA e Hibernate", "Relación", "Fetch plan", "SQL"),
            ("spring_security", "Spring Security, JWT, OAuth2 y OIDC", "Credencial", "Filtros / políticas", "Acceso"),
            ("microservicios", "Arquitectura de microservicios", "Contextos", "Contratos / eventos", "Servicios"),
            ("kafka_spring", "Apache Kafka con Spring Boot", "Producer", "Topic / retry", "Consumer / DLT"),
            ("spring_batch", "Spring Batch", "Reader", "Chunk / processor", "Writer"),
        ],
    ),
    (
        "03_qa_automation",
        "QA Automation",
        [
            ("api_testing", "Introducción al API Testing", "Request", "Contrato", "Response"),
            ("postman", "Postman desde cero", "Request", "Collection / env", "Respuesta"),
            ("postman_automatizacion", "Automatización en Postman", "Datos", "pm.test / expect", "Assertions"),
            ("newman", "Newman", "Collection", "CLI / data", "Reporte"),
            ("jenkins_qa", "Jenkins para QA", "Commit", "Pipeline", "Artefacto"),
            ("proyecto_qa", "Proyecto final QA Automation", "Postman", "Newman / Jenkins", "Reporte"),
        ],
    ),
    (
        "04_bases_datos",
        "Bases de datos",
        [
            ("sql_relacional", "SQL y bases de datos relacionales", "Tablas", "JOIN / índice", "Consulta"),
            ("mysql_espacial", "Datos espaciales con MySQL", "Coordenadas", "ST_*", "Geometría"),
            ("postgresql", "PostgreSQL", "Esquema", "Backup / restore", "Datos íntegros"),
            ("nosql", "NoSQL con MongoDB", "Documento", "Patrón de acceso", "Colección"),
        ],
    ),
    (
        "05_devops_cloud",
        "DevOps y cloud",
        [
            ("docker", "Docker", "Dockerfile", "Capas / runtime", "Contenedor"),
            ("alternativas_docker", "Alternativas a Docker Desktop", "CLI", "Runtime local", "Contenedores"),
            ("cicd", "CI/CD", "Cambio", "Build / test / deploy", "Release"),
            ("kubernetes", "Kubernetes", "Deployment", "Pod / Service", "Tráfico"),
            ("terraform_opentofu", "Terraform y OpenTofu", "HCL", "Plan / state", "Recursos"),
            ("cloud_local", "Cloud local con LocalStack y Floci", "AWS CLI", "Endpoint local", "Servicio emulado"),
        ],
    ),
    (
        "06_frontend",
        "Frontend",
        [
            ("angular_moderno", "Angular moderno", "Evento", "Signal graph", "Vista"),
            ("angular22_http", "Angular 22: estado HTTP", "Request", "Estado reactivo", "UI"),
            ("angular22_onpush", "Angular 22: OnPush", "Cambio", "Referencia / signal", "Render"),
            ("angular_native", "Angular Native", "Angular", "Fabric / Expo", "Vista nativa"),
            ("react_next", "React y Next.js", "Props / estado", "Render", "UI / SSR"),
        ],
    ),
    (
        "07_movil",
        "Móvil",
        [
            ("android_compose", "Android con Kotlin y Jetpack Compose", "Estado", "Composición", "UI"),
            ("kotlin_multiplatform", "Kotlin Multiplatform", "Lógica común", "Expect / actual", "Apps"),
            ("ios_swiftui", "iOS con SwiftUI", "Estado", "Diff de vistas", "UI"),
            ("flutter", "Flutter", "Widgets", "Widget tree", "Render tree"),
        ],
    ),
    (
        "08_electronica",
        "Ingeniería electrónica",
        [
            ("matematicas_aplicadas", "Matemáticas aplicadas", "Modelo", "Transformación", "Solución"),
            ("circuitos_electricos", "Circuitos eléctricos", "Fuente", "Red / leyes", "Respuesta"),
            ("electronica_analogica", "Electrónica analógica", "Señal", "Componente", "Salida"),
            ("electronica_digital", "Electrónica digital", "Entradas", "Lógica / estado", "Salida"),
            ("microcontroladores", "Microcontroladores", "Sensor", "Firmware / GPIO", "Actuador"),
            ("comunicaciones", "Sistemas de comunicación", "Mensaje", "Canal / codificación", "Recepción"),
            ("senales_sistemas", "Señales y sistemas", "Señal", "Sistema LTI", "Respuesta"),
            ("procesamiento_senales", "Procesamiento de señales", "Muestreo", "Filtro DSP", "Señal útil"),
            ("instrumentacion_sensores", "Instrumentación y sensores", "Magnitud física", "Acondicionamiento", "Medición"),
            ("control_automatico", "Control automático", "Referencia", "Controlador PID", "Planta"),
            ("electronica_potencia", "Electrónica de potencia", "Entrada", "Conversor", "Carga"),
            ("diseno_pcb", "Diseño de PCB", "Esquemático", "Layout / ruteo", "Placa"),
            ("electromagnetismo", "Electromagnetismo", "Carga / corriente", "Campo", "Onda"),
            ("bajo_nivel", "Programación de bajo nivel", "Código", "Memoria / CPU", "Hardware"),
            ("gestion_habilidades", "Gestión y habilidades", "Objetivo", "Colaboración", "Entrega"),
        ],
    ),
    (
        "09_herramientas",
        "Herramientas y prácticas",
        [
            ("git", "Git y control de versiones", "Working tree", "Commit / branch", "Historial"),
            ("testing_software", "Testing de software", "Riesgo", "Test pyramid", "Evidencia"),
            ("postman_bruno", "Postman vs Bruno", "Colección", "Flujo local", "Prueba versionada"),
            ("patrones_solid", "Patrones de diseño y SOLID", "Responsabilidad", "Abstracción", "Cambio aislado"),
            ("algoritmos", "Algoritmos y estructuras de datos", "Grafo", "BFS / DFS / Dijkstra", "Ruta"),
            ("vscode", "Visual Studio Code", "Código", "Editor / extensiones", "Flujo"),
            ("winutil", "Windows: WinUtil", "Equipo", "Script revisado", "Configuración"),
            ("manim", "Manim y ManimGX", "Concepto", "Geometría / animación", "Explicación"),
        ],
    ),
    (
        "10_ia_estudio",
        "IA aplicada al estudio",
        [
            ("prompting_aprender", "Prompting para aprender", "Objetivo", "Descomposición", "Práctica"),
            ("roadmaps_30", "Prompting para roadmaps", "Meta", "Dependencias", "30 pasos"),
            ("humanizador_ia", "Humanizador de texto IA", "Borrador", "Edición ética", "Voz propia"),
            ("etica_prompting", "Riesgos éticos del prompting", "Solicitud", "Verificación / límites", "Trabajo honesto"),
        ],
    ),
]

INTEGRATORS = [
    ("integrador_01_fundamentos_java", "Integrador: fundamentos y Java", "Problema real", "Java / pruebas", "Aplicación CLI"),
    ("integrador_02_backend_spring", "Integrador: backend Spring", "Dominio", "API / datos / eventos", "Servicio"),
    ("integrador_03_qa_automation", "Integrador: QA Automation", "API", "Postman / Newman", "Pipeline Jenkins"),
    ("integrador_04_bases_datos", "Integrador: persistencia", "Modelo", "SQL / geoespacial", "Consultas"),
    ("integrador_05_devops_cloud", "Integrador: DevOps y cloud", "Código", "CI / IaC / runtime", "Despliegue"),
    ("integrador_06_frontend", "Integrador: frontend", "API", "Estado reactivo", "Experiencia web"),
    ("integrador_07_movil", "Integrador: móvil", "Backend", "Estado / ubicación", "App móvil"),
    ("integrador_08_electronica", "Integrador: electrónica e IoT", "Sensor", "Firmware / red", "Evento IoT"),
    ("integrador_09_herramientas", "Integrador: herramientas", "Cambio", "Git / test / automatización", "Entrega confiable"),
    ("integrador_10_ia_estudio", "Integrador: estudio ético con IA", "Pregunta", "Fuentes / práctica", "Aprendizaje verificable"),
    ("integrador_final", "Proyecto final: plataforma logística IoT", "Dispositivo / app", "Spring / Kafka / datos", "Plataforma observable"),
]


def scene_source(class_name: str, title: str, stages: tuple[str, str, str]) -> str:
    labels = ", ".join(repr(stage) for stage in stages)
    return f'''from manim import *


class {class_name}(Scene):
    def construct(self):
        # El título sitúa el concepto que representa esta escena.
        title = Text({title!r}, font_size=30)
        title.scale_to_fit_width(12.5)
        title.to_edge(UP, buff=0.55)
        self.play(Write(title))

        # Las tres tarjetas separan entrada, transformación y resultado.
        labels = [{labels}]
        colors = [BLUE, YELLOW, GREEN]
        cards = VGroup()
        for index, (label, color) in enumerate(zip(labels, colors)):
            card = RoundedRectangle(
                width=3.55, height=1.55, corner_radius=0.15,
                stroke_color=color, stroke_width=3,
                fill_color=color, fill_opacity=0.18,
            )
            card.move_to(RIGHT * (index - 1) * 4.25 + DOWN * 0.1)
            text = Text(label, font_size=22).scale_to_fit_width(3.15)
            text.move_to(card)
            cards.add(VGroup(card, text))

        # Las flechas hacen explícito el flujo causal entre las etapas.
        arrows = VGroup(*[
            Arrow(
                cards[index][0].get_right(),
                cards[index + 1][0].get_left(),
                buff=0.12, stroke_width=4, max_tip_length_to_length_ratio=0.18,
            )
            for index in range(2)
        ])
        self.play(FadeIn(cards[0], shift=UP * 0.2))
        self.play(GrowArrow(arrows[0]), FadeIn(cards[1], shift=UP * 0.2))
        self.play(GrowArrow(arrows[1]), FadeIn(cards[2], shift=UP * 0.2))

        # El marco destaca el sistema completo y permite leerlo de izquierda a derecha.
        frame = SurroundingRectangle(
            VGroup(cards, arrows), color=WHITE, buff=0.35, corner_radius=0.18,
        )
        self.play(Create(frame))
        self.wait(2)
'''


def build() -> int:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    specs: list[tuple[str, str, tuple[str, str, str]]] = []
    for _, _, topics in BLOCKS:
        for topic_id, topic_title, first, second, third in topics:
            specs.append((topic_id, topic_title, (first, second, third)))
    for scene_id, title, first, second, third in INTEGRATORS:
        specs.append((scene_id, title, (first, second, third)))

    for scene_id, title, stages in specs:
        class_name = "".join(part.capitalize() for part in scene_id.split("_")) + "Scene"
        filename = f"{scene_id}.py"
        (OUTPUT / filename).write_text(
            scene_source(class_name, title, stages),
            encoding="utf-8",
        )
    return len(specs)


if __name__ == "__main__":
    print(f"Generated {build()} standalone Manim CE scenes in {OUTPUT}")
