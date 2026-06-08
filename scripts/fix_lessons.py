#!/usr/bin/env python3
"""
Corrige rutas hardcodeadas en las lecciones y añade una sección de Verificación
También intenta descargar cada lección desde el servidor de desarrollo en http://localhost:63031

Uso: python scripts/fix_lessons.py
"""
import argparse
import glob
import os
import shutil
import urllib.request

ROOT = os.path.dirname(os.path.dirname(__file__))
LESSONS_GLOB = os.path.join(ROOT, 'web', 'public', 'content', 'lecciones', 'modulo-*.md')
DEFAULT_BASE_URL = 'http://localhost:63031/content/lecciones/'

def fix_content(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    orig = content
    # Reemplazos comunes de rutas con usuario hardcodeado
    content = content.replace('/mnt/c/Users/nicol', '/mnt/c/Users/<TU_USUARIO>')
    content = content.replace('C:\\Users\\nicol', '/mnt/c/Users/<TU_USUARIO>')

    changed = content != orig

    if '## Verificación' not in content:
        filename = os.path.basename(path)
        ver = (
            '\n## Verificación\n'
            '- Descargar la lección desde la UI: `curl -fsS http://localhost:63031/content/lecciones/%s -o /dev/null`\n'
            '- Buscar bloques de código: `grep -n "```" %s || true`\n'
            '- Buscar rutas con usuario hardcodeado: `grep -n "nicol" %s || true`\n'
        ) % (filename, filename, filename)
        content = content.rstrip() + ver + "\n"
        changed = True

    if changed:
        bak = path + '.bak'
        shutil.copyfile(path, bak)
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
            if content != orig or '## Verificación' not in content:
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
