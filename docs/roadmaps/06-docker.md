# Bloque 6: Docker y runtimes locales

Este bloque contiene 1 roadmaps independientes. Cada roadmap avanza en 30 pasos, desde cero hasta una evidencia de nivel avanzado; no presupone experiencia previa en el tema.

Los pasos 1–10 construyen fundamentos, 11–20 desarrollan práctica y diagnóstico, y 21–30 integran el tema en un resultado más cercano al trabajo profesional. Marca cada casilla solo cuando puedas mostrar la evidencia indicada.

## Tema 28: Docker y alternativas

**Meta:** stack reproducible con imagen no-root, entorno documentado y comparativa local-first

**Contexto de práctica:** empaquetar un backend multi-stage y ejecutar el mismo compose en runtimes compatibles

**Conocimientos que conecta:** CI/CD, Kubernetes, Floci y seguridad de artefactos

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «empaquetar un backend multi-stage y ejecutar el mismo compose en runtimes compatibles» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: stack reproducible con imagen no-root, entorno documentado y comparativa local-first.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar docker y alternativas.
- [ ] **Paso 4.** Define un glosario propio para las piezas de images/layers/Dockerfile/volumes/networks; env -e/.env/ENV; compose; multi-stage; .dockerignore; non-root; Dory/OrbStack/Podman.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de images/layers/Dockerfile/volumes/networks; env -e/.env/ENV; compose; multi-stage; .dockerignore; non-root; Dory/OrbStack/Podman antes de memorizar términos.
- [ ] **Paso 6.** Prepara Docker Engine/OrbStack y BuildKit, Podman u OrbStack según sistema; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en docs.docker.com/get-started/; podman.io/docs y documentación oficial del runtime elegido una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «empaquetar un backend multi-stage y ejecutar el mismo compose en runtimes compatibles» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «inspeccionar usuario y capas, montar persistencia y comparar un runtime alternativo» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «secretos embebidos en imagen o asumir paridad total de CLI/runtimes» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de images/layers/Dockerfile/volumes/networks; env -e/.env/ENV; compose; multi-stage; .dockerignore; non-root; Dory/OrbStack/Podman y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «empaquetar un backend multi-stage y ejecutar el mismo compose en runtimes compatibles» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de docker y alternativas.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a images/layers/Dockerfile/volumes/networks; env -e/.env/ENV; compose; multi-stage; .dockerignore; non-root; Dory/OrbStack/Podman.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «stack reproducible con imagen no-root, entorno documentado y comparativa local-first».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en docs.docker.com/get-started/; podman.io/docs y documentación oficial del runtime elegido.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «stack reproducible con imagen no-root, entorno documentado y comparativa local-first» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta docker y alternativas con CI/CD, Kubernetes, Floci y seguridad de artefactos; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «empaquetar un backend multi-stage y ejecutar el mismo compose en runtimes compatibles» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «stack reproducible con imagen no-root, entorno documentado y comparativa local-first».

**Criterio de salida:** entrega «stack reproducible con imagen no-root, entorno documentado y comparativa local-first», explica «secretos embebidos en imagen o asumir paridad total de CLI/runtimes» y demuestra cómo docker y alternativas se conecta con CI/CD, Kubernetes, Floci y seguridad de artefactos.

**Fuentes primarias para iniciar:** docs.docker.com/get-started/; podman.io/docs y documentación oficial del runtime elegido.
