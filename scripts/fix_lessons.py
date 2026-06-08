#!/usr/bin/env python3
"""
Corrige rutas hardcodeadas en las lecciones y asegura una verificación educativa.

Uso: python scripts/fix_lessons.py
"""
import argparse
import glob
import os
import urllib.request

ROOT = os.path.dirname(os.path.dirname(__file__))
LESSONS_GLOB = os.path.join(ROOT, 'web', 'public', 'content', 'lecciones', 'modulo-*.md')
DEFAULT_BASE_URL = 'http://localhost:63031/content/lecciones/'
LEARNING_VERIFICATION = '''## Verificación del aprendizaje

Antes de marcar este módulo como completado, confirma esto con evidencia propia:

1. **Lo puedo explicar en una frase.** Escribe qué problema resuelve este módulo y para qué lo usarías en una aplicación real.
2. **Lo ejecuté, no solo lo leí.** Guarda el comando principal que corriste y una salida real de tu terminal.
3. **Lo puedo verificar.** Consulta el recurso con AWS CLI, Azure CLI, GCP CLI o StackPort cuando aplique. La evidencia debe mostrar nombre, estado o contenido del recurso.
4. **Entiendo un fallo común.** Provoca o identifica un error sencillo, copia el mensaje completo y explica cómo lo diagnosticaste.
5. **Sé cuándo avanzar.** Avanza solo si puedes repetir el laboratorio desde una carpeta limpia sin depender de copiar a ciegas.

Evidencia mínima sugerida:

```text
Comando ejecutado:
Salida obtenida:
Qué significa la salida:
Error o duda encontrada:
Cómo la resolví:
```
'''

def fix_content(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    orig = content
    # Reemplazos comunes de rutas con usuario hardcodeado
    content = content.replace('/mnt/c/Users/nicol', '/mnt/c/Users/<TU_USUARIO>')
    content = content.replace('C:\\Users\\nicol', '/mnt/c/Users/<TU_USUARIO>')

    changed = content != orig

    if '## Verificación del aprendizaje' not in content:
        content = content.rstrip() + '\n\n' + LEARNING_VERIFICATION + '\n'
        changed = True

    if changed:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def check_http(path, base_url=DEFAULT_BASE_URL):
    filename = os.path.basename(path)
    url = base_url + filename
    try:
        with urllib.request.urlopen(url, timeout=5) as r:
            code = r.getcode()
            size = int(r.getheader('Content-Length') or 0)
            return True, code, size
    except Exception as e:
        return False, str(e), 0

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true', help='No modifica archivos; solo informa qué cambiaría')
    parser.add_argument('--base-url', default=DEFAULT_BASE_URL, help='URL base para verificar entrega HTTP de lecciones')
    parser.add_argument('--skip-http', action='store_true', help='Omite la verificación HTTP; útil para CI sin servidor local')
    args = parser.parse_args()

    files = sorted(glob.glob(LESSONS_GLOB))
    if not files:
        print('No se encontraron lecciones en', LESSONS_GLOB)
        return 1

    modified = []
    print('Procesando %d lecciones...' % len(files))
    for p in files:
        if args.check:
            # En modo check, solo informaríamos sin escribir
            with open(p, 'r', encoding='utf-8') as f:
                content = f.read()
            orig = content
            content = content.replace('/mnt/c/Users/nicol', '/mnt/c/Users/<TU_USUARIO>')
            content = content.replace('C:\\Users\\nicol', '/mnt/c/Users/<TU_USUARIO>')
            if content != orig or '## Verificación del aprendizaje' not in content:
                modified.append(p)
                print('Would modify:', os.path.basename(p))
        else:
            if fix_content(p):
                modified.append(p)
                print('Modificado:', os.path.basename(p))

    ok_count = 0
    http_failed = 0
    if args.skip_http:
        print('\nVerificación HTTP omitida.')
    else:
        print('\nVerificando entrega HTTP de cada lección (%s)...' % args.base_url)
        for p in files:
            ok, info, size = check_http(p, args.base_url)
            if ok:
                ok_count += 1
                print('OK ', os.path.basename(p), 'status=200 size=%d' % size)
            else:
                http_failed += 1
                print('FAIL', os.path.basename(p), info)

    print('\nResumen:')
    print('Lecciones modificadas:', len(modified))
    if not args.skip_http:
        print('Lecciones servidas OK:', ok_count, '/', len(files))
    if args.check and modified:
        return 1
    if http_failed:
        return 1
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
