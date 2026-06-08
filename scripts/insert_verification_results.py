#!/usr/bin/env python3
"""
Inserta resultados de verificación HTTP en cada lección bajo la sección '## Verificación'.

Uso: py scripts/insert_verification_results.py
"""
import glob
import os
import urllib.request

ROOT = os.path.dirname(os.path.dirname(__file__))
LESSONS_GLOB = os.path.join(ROOT, 'web', 'public', 'content', 'lecciones', 'modulo-*.md')
BASE_URL = 'http://localhost:63031/content/lecciones/'

def fetch_info(filename):
    url = BASE_URL + filename
    try:
        with urllib.request.urlopen(url, timeout=5) as r:
            status = r.getcode()
            size = int(r.getheader('Content-Length') or 0)
            return True, status, size
    except Exception as e:
        return False, str(e), 0

def insert_result(path, ok, status_or_err, size):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    marker = '## Verificación'
    idx = content.find(marker)
    if idx == -1:
        content = content.rstrip() + '\n\n' + marker + '\n\n'
        idx = content.find(marker)

    # Build result block
    filename = os.path.basename(path)
    if ok:
        result = f"\n### Resultado de entrega automática\n- URL: {BASE_URL}{filename}\n- Estado: 200 OK\n- Tamaño: {size} bytes\n\n"
    else:
        result = f"\n### Resultado de entrega automática\n- URL: {BASE_URL}{filename}\n- Error: {status_or_err}\n\n"

    # If there's already a 'Resultado de entrega automática' section, replace it
    start = content.find('### Resultado de entrega automática', idx)
    if start != -1:
        # find next H2 or H3 after start
        rest = content[start:]
        # try to find next '### ' or '## ' after this
        next_h2 = rest.find('\n## ')
        next_h3 = rest.find('\n### ', 1)
        cut = None
        if next_h3 != -1:
            cut = start + next_h3
        elif next_h2 != -1:
            cut = start + next_h2
        else:
            cut = len(content)
        content = content[:start] + result + content[cut:]
    else:
        # append result after marker
        insert_pos = idx + len(marker)
        content = content[:insert_pos] + '\n' + result + content[insert_pos:]

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    files = sorted(glob.glob(LESSONS_GLOB))
    if not files:
        print('No se encontraron lecciones')
        return 1

    for p in files:
        filename = os.path.basename(p)
        ok, status_or_err, size = fetch_info(filename)
        insert_result(p, ok, status_or_err, size)
        if ok:
            print('Insertado:', filename, 'OK size=', size)
        else:
            print('Insertado:', filename, 'ERROR', status_or_err)

    return 0

if __name__ == '__main__':
    raise SystemExit(main())
