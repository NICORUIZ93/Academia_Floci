#!/usr/bin/env python3
"""Completa las secciones universales de los temas RutaFlow que aún no las exponen."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1] / 'web/public/content/rutaflow'
SOURCE = 'https://developer.mozilla.org/en-US/docs/Learn_web_development'

def blocks(text: str):
    matches = list(re.finditer(r'(?m)^### Tema \d+:.*$', text))
    for i, match in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        yield match.start(), end, text[match.start():end]

def topic_name(block: str) -> str:
    return re.search(r'(?m)^### (Tema \d+:.*?)$', block).group(1).strip()

def methodology(name: str) -> str:
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    return f'''\n#### Paso 1 · Objetivo y preparación\n\nAl finalizar podrás construir y verificar **{name}** dentro de RutaFlow, empezando desde una carpeta vacía y explicando qué decisión técnica resuelve. **Conocimiento previo:** terminal, Git y lectura de JSON.\n\n#### Paso 2 · Contexto y caso real\n\n**¿Por qué es importante?** En una plataforma de entregas, {name.lower()} afecta directamente la trazabilidad, la seguridad y la capacidad de recuperar un fallo. Separar la decisión del detalle de infraestructura permite probarla antes de desplegarla y evita que una pantalla o un proveedor externo se convierta en la única fuente de verdad.\n\n**Caso real:** una entrega puede repetirse, llegar fuera de orden o quedarse sin conexión. El diseño debe conservar una salida determinista y una evidencia que otra persona pueda revisar.\n\n#### Paso 3 · Teoría, conceptos y analogía\n\n**Conceptos clave:** contrato, estado, evidencia, idempotencia, observabilidad y límite de responsabilidad. Piensa en este tema como una estación de clasificación: recibe una entrada con formato conocido, aplica una regla explícita y entrega una salida que puede auditarse. Si una regla no se puede observar ni probar, todavía no es una parte confiable del sistema.\n\n**Analogía:** es como una guía de despacho: cada paquete tiene una etiqueta, una operación responsable y una marca que demuestra qué ocurrió.\n\n```mermaid\nflowchart LR\n  A[Entrada validada] --> B[Regla de {slug}]\n  B --> C[Resultado determinista]\n  C --> D[Evento y evidencia]\n  B --> E[Error diagnosticable]\n```\n\n#### Paso 4 · Demostración guiada desde cero\n\nCrea una carpeta independiente para comprobar el concepto antes de conectarlo al monorepo:\n\n```bash\nmkdir -p rutaflow-labs/{slug}\ncd rutaflow-labs/{slug}\nprintf '%s\\n' '{{"tema":"{name}","estado":"preparado"}}' > evidencia.json\ncat evidencia.json\n```\n\n```javascript\n// La entrada representa un contrato mínimo y verificable.\nconst entrada = {{ tema: '{name}', estado: 'preparado' }};\nconst salida = {{ ...entrada, evidencia: true }};\nconsole.log(JSON.stringify(salida));\n```\n\nEjecuta la comprobación desde `rutaflow-labs/{slug}/`:\n\n```bash\nnode -e "const fs=require('fs'); const x=JSON.parse(fs.readFileSync('evidencia.json','utf8')); if (!x.tema) throw new Error('Falta tema'); console.log('OK', x.tema);"\n```\n\n**Resultado esperado:** el comando imprime `OK` y el nombre del tema; `evidencia.json` conserva una entrada reproducible.\n\n**Fallo deliberado:** cambia `tema` por una cadena vacía y ejecuta de nuevo. El proceso debe fallar con `Falta tema`; diagnostica leyendo la primera causa, corrige solo ese dato y repite la prueba.\n\n#### Paso 5 · Práctica guiada\n\n1. Añade un campo `version` y rechaza valores menores que `1`.\n2. Registra una salida JSON de éxito y otra de error sin mezclar ambas.\n3. Pista: valida la entrada antes de ejecutar la regla y conserva el mensaje original del error.\n\n#### Paso 6 · Práctica independiente\n\nImplementa una función `procesarEntrada(entrada)` que devuelva una salida determinista, rechace entradas incompletas y pueda ejecutarse dos veces sin duplicar evidencia. No copies la solución del paso anterior; escribe primero el contrato y después el código.\n\n#### Paso 7 · Cierre, evidencia y proyecto\n\nEntrega el archivo `evidencia.json`, la salida `OK`, la salida del fallo deliberado y una breve explicación de la decisión. Conecta este incremento con el proyecto RutaFlow: **{name}** debe convertirse en una capacidad comprobable, observable y recuperable. **Fuente oficial:** [{SOURCE}]({SOURCE}).\n\n**Errores comunes:** ejecutar desde otra carpeta; validar después de mutar el estado; ocultar el mensaje original del error; no conservar evidencia; asumir que un proveedor externo siempre responde.\n'''

def main():
    changed = 0
    for path in sorted(ROOT.glob('modulo-*.md')):
        original = path.read_text(encoding='utf-8')
        pieces = []
        cursor = 0
        for start, end, block in blocks(original):
            pieces.append(original[cursor:start])
            if '#### Paso 1 · Objetivo y preparación' in block:
                pieces.append(block)
            else:
                pieces.append(block.rstrip() + '\n' + methodology(topic_name(block)))
            cursor = end
        pieces.append(original[cursor:])
        updated = ''.join(pieces)
        if updated != original:
            path.write_text(updated, encoding='utf-8')
            changed += 1
    print(f'RutaFlow actualizado: {changed} módulos')

if __name__ == '__main__':
    main()
