# Bloque 9: Infraestructura como código

Este bloque contiene 1 roadmaps independientes. Cada roadmap avanza en 30 pasos, desde cero hasta una evidencia de nivel avanzado; no presupone experiencia previa en el tema.

Los pasos 1–10 construyen fundamentos, 11–20 desarrollan práctica y diagnóstico, y 21–30 integran el tema en un resultado más cercano al trabajo profesional. Marca cada casilla solo cuando puedas mostrar la evidencia indicada.

## Tema 31: Terraform y OpenTofu

**Meta:** módulo pequeño con backend documentado y plan revisado

**Contexto de práctica:** provisionar infraestructura local/cloud de forma revisable

**Conocimientos que conecta:** cloud local, CI/CD, secretos y control de cambios

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «provisionar infraestructura local/cloud de forma revisable» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: módulo pequeño con backend documentado y plan revisado.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar terraform y opentofu.
- [ ] **Paso 4.** Define un glosario propio para las piezas de HCL, providers, variables, outputs, state, backend remoto, módulos y lifecycle.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de HCL, providers, variables, outputs, state, backend remoto, módulos y lifecycle antes de memorizar términos.
- [ ] **Paso 6.** Prepara Terraform u OpenTofu en laboratorio; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en developer.hashicorp.com/terraform/docs y opentofu.org/docs una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «provisionar infraestructura local/cloud de forma revisable» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «ejecutar fmt/validate/plan y destruir únicamente recursos de sandbox» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «editar state manualmente o ejecutar apply sin revisar el plan» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de HCL, providers, variables, outputs, state, backend remoto, módulos y lifecycle y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «provisionar infraestructura local/cloud de forma revisable» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de terraform y opentofu.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a HCL, providers, variables, outputs, state, backend remoto, módulos y lifecycle.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «módulo pequeño con backend documentado y plan revisado».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en developer.hashicorp.com/terraform/docs y opentofu.org/docs.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «módulo pequeño con backend documentado y plan revisado» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta terraform y opentofu con cloud local, CI/CD, secretos y control de cambios; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «provisionar infraestructura local/cloud de forma revisable» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «módulo pequeño con backend documentado y plan revisado».

**Criterio de salida:** entrega «módulo pequeño con backend documentado y plan revisado», explica «editar state manualmente o ejecutar apply sin revisar el plan» y demuestra cómo terraform y opentofu se conecta con cloud local, CI/CD, secretos y control de cambios.

**Fuentes primarias para iniciar:** developer.hashicorp.com/terraform/docs y opentofu.org/docs.
