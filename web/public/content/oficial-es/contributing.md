# Contribuyendo

Floci tiene licencia del MIT y agradece contribuciones de todo tipo.

## Formas de ayudar 

- **Informes de error**: abre un [problema GitHub](https://github.com/floci-io/floci/issues/new?template=bug_report.md) con una reproducción mínima
- **Faltan acciones de API**: abra una [solicitud de función](https://github.com/floci-io/floci/issues/new?template=feature_request.md)
- **Solicitudes de extracción**: nuevas acciones de servicio, correcciones de errores, mejoras en la documentación

## Configuración de desarrollo

```bash
# Clone
git clone https://github.com/floci-io/floci.git
cd floci

# Run in dev mode (hot reload, port 4566)
mvn quarkus:dev

# Run all tests
mvn test

# Run a specific test
mvn test -Dtest=SsmIntegrationTest
mvn test -Dtest=SsmIntegrationTest#putParameter
```

## Formato de mensaje de confirmación

Este proyecto utiliza [Commits convencionales] (https://www.conventionalcommits.org/), necesario para que la versión semántica genere el registro de cambios y los cambios de versión automáticamente.

> **El título de PR es validado automáticamente por CI** y debe seguir este formato, ya que se convierte en el mensaje de confirmación de squash-merge que lee la liberación semántica.

### Formato

```
<type>[optional scope]: <description>
```

| Tipo | Efecto |
|---|---|
| `feat` | Nueva característica → aumento de versión menor |
| `fix` | Corrección de errores → aumento de versión del parche |
| `perf` | Mejora del rendimiento → parche |
| `revert` | Revierte una confirmación anterior → parche |
| `docs` | Sólo documentación → sin aumento de versión |
| `style` | Formateo, espacios en blanco → sin aumento de versión |
| `chore` | Compilación/CI/limpieza → sin aumento de versión |
| `refactor` | Reestructuración de código → sin aumento de versión |
| `test` | Agregar/actualizar pruebas → sin aumento de versión |
| `build` | Cambios en el sistema de compilación → sin aumento de versión |
| `ci` | Cambios en el flujo de trabajo de CI → sin aumento de versión |
| `feat!:` o `BREAKING CHANGE:` | Cambio radical → golpe importante |

### Ejemplos válidos ✅

```
feat(dynamodb): add PartiQL ExecuteStatement support
fix(s3): make us-east-1 bucket creation idempotent
chore: release 1.5.16
feat!: remove legacy v1 endpoint
ci: add conventional commits lint workflow
```

### Ejemplos no válidos ❌

```
Add PartiQL support              # missing type
Feature: add something           # not a valid type
feat : space before colon        # space before colon
FIX(s3): uppercase type          # type must be lowercase
feat(my scope): spaces in scope  # scope cannot contain spaces
wip: still working on this      # not a recognised type
```

## Agregar un nuevo servicio AWS

Consulte [AGENTS.md](https://github.com/floci-io/floci/blob/main/AGENTS.md) para obtener la guía de arquitectura completa. `AGENTS.md` es el archivo de instrucciones del agente canónico para este repositorio, siguiendo el [estándar AGENTS.md](https://agents.md/). Si su agente de codificación espera un nombre de archivo diferente, cree un enlace simbólico local a `AGENTS.md` en lugar de copiarlo.

```bash
ln -s AGENTS.md CLAUDE.md
ln -s AGENTS.md GEMINI.md
ln -s AGENTS.md COPILOT.md
```

Resumen rápido:

1. Cree `src/main/java/.../services/<service>/` con un controlador, servicio y paquete `model/`
2. Elija el protocolo correcto (consulte la tabla de protocolos en `AGENTS.md`)
3. Registre el servicio en `ServiceRegistry`
4. Agregue configuración en `EmulatorConfig.java` y `application.yml`
5. Agregar pruebas `*IntegrationTest.java`

## Lista de verificación de solicitud de extracción de

- [] Pases `mvn test`
- [] Prueba de integración nueva o actualizada agregada
- [] Los mensajes de confirmación siguen las confirmaciones convencionales

## Informe de problemas de seguridad

**No** abra problemas públicos en busca de vulnerabilidades de seguridad. Utilice [informes privados de vulnerabilidad GitHub](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability) en su lugar.
