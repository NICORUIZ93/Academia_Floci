#!/usr/bin/env python3
"""
Corrige rutas hardcodeadas en las lecciones y asegura una verificación educativa.

Uso: python scripts/fix_lessons.py
"""
import argparse
import glob
import os
import re
import urllib.request

ROOT = os.path.dirname(os.path.dirname(__file__))
LESSONS_GLOB = os.path.join(ROOT, 'web', 'public', 'content', 'lecciones', 'modulo-*.md')
DEFAULT_BASE_URL = 'http://localhost:63031/content/lecciones/'
TEXT_CHECK_GLOBS = [
    os.path.join(ROOT, 'README.md'),
    os.path.join(ROOT, 'install.sh'),
    os.path.join(ROOT, 'scripts', '*.py'),
    os.path.join(ROOT, 'web', 'src', 'app', '*.*'),
    os.path.join(ROOT, 'web', 'e2e', '*.*'),
    os.path.join(ROOT, 'web', 'public', 'content', 'lecciones', 'modulo-*.md'),
    os.path.join(ROOT, 'web', 'public', 'content', 'es', 'guia-completa.md'),
]

LEARNING_VERIFICATION_HEADING = '## Verificación del aprendizaje'
MOJIBAKE_MARKERS = ['\u00c3', '\u00c2', '\ufffd', '\u00e2\u20ac', '\u00e2\u20ac\u0153', '\u00e2\u20ac\ufffd', '\u00e2\u20ac\u201d']
MOJIBAKE_RE = re.compile('|'.join(re.escape(marker) for marker in MOJIBAKE_MARKERS))
QUESTION_IN_WORD_RE = re.compile(r'[A-Za-zÁÉÍÓÚáéíóúñÑ]\?[A-Za-zÁÉÍÓÚáéíóúñÑ]')
QUERY_STRING_RE = re.compile(r'[/\w.-]+\?[A-Za-z_][A-Za-z0-9_-]*=')
SUSPICIOUS_WORDS = [
    'idiom\u00e1s',
    'Problem\u00e1s',
    'SQS\u00e9',
    'simple\u00ed',
    'correpsond',
    'operatico',
    'prpyecto',
    'selccionar',
    'emepzar',
    'funcioonar',
]
SUSPICIOUS_WORD_RE = re.compile('|'.join(re.escape(word) for word in SUSPICIOUS_WORDS), re.IGNORECASE)
SUSPICIOUS_ACRONYM_RE = re.compile(r'\b[A-Z]{2,}\u00e9\b')

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


def safe_print(value):
    print(str(value).encode('ascii', errors='backslashreplace').decode('ascii'))


def iter_text_check_files():
    files = []
    for pattern in TEXT_CHECK_GLOBS:
        files.extend(glob.glob(pattern))
    return sorted(set(files))


def find_text_quality_issues():
    issues = []
    for path in iter_text_check_files():
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError as exc:
            issues.append((path, 0, f'No es UTF-8 válido: {exc}'))
            continue

        for number, line in enumerate(content.splitlines(), 1):
            if os.path.basename(path) == 'fix_lessons.py' and 30 <= number <= 45:
                continue
            if MOJIBAKE_RE.search(line):
                issues.append((path, number, 'Texto mojibake: ' + line[:180]))
            if QUESTION_IN_WORD_RE.search(line) and not QUERY_STRING_RE.search(line):
                issues.append((path, number, 'Signo ? dentro de palabra: ' + line[:180]))
            if SUSPICIOUS_WORD_RE.search(line):
                issues.append((path, number, 'Palabra sospechosa: ' + line[:180]))
            if SUSPICIOUS_ACRONYM_RE.search(line):
                issues.append((path, number, 'Acrónimo con tilde sospechosa: ' + line[:180]))
    return issues


def normalized_content(content):
    return (
        content
        .replace('/mnt/c/Users/nicol', '/mnt/c/Users/<TU_USUARIO>')
        .replace('C:\\Users\\nicol', '/mnt/c/Users/<TU_USUARIO>')
    )


def fix_content(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    orig = content
    content = normalized_content(content)

    changed = content != orig

    if LEARNING_VERIFICATION_HEADING not in content:
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
        with urllib.request.urlopen(url, timeout=5) as response:
            code = response.getcode()
            size = int(response.getheader('Content-Length') or 0)
            return True, code, size
    except Exception as exc:
        return False, str(exc), 0


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
    for path in files:
        if args.check:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            would_change = normalized_content(content) != content or LEARNING_VERIFICATION_HEADING not in content
            if would_change:
                modified.append(path)
                print('Would modify:', os.path.basename(path))
        else:
            if fix_content(path):
                modified.append(path)
                print('Modificado:', os.path.basename(path))

    ok_count = 0
    http_failed = 0
    if args.skip_http:
        print('\nVerificación HTTP omitida.')
    else:
        print('\nVerificando entrega HTTP de cada lección (%s)...' % args.base_url)
        for path in files:
            ok, info, size = check_http(path, args.base_url)
            if ok:
                ok_count += 1
                print('OK ', os.path.basename(path), 'status=200 size=%d' % size)
            else:
                http_failed += 1
                print('FAIL', os.path.basename(path), info)

    text_issues = find_text_quality_issues()

    print('\nResumen:')
    print('Lecciones modificadas:', len(modified))
    print('Problemas de texto detectados:', len(text_issues))
    for path, line, message in text_issues[:80]:
        rel = os.path.relpath(path, ROOT)
        safe_print(f'{rel}:{line}: {message}')
    if not args.skip_http:
        print('Lecciones servidas OK:', ok_count, '/', len(files))

    if args.check and modified:
        return 1
    if http_failed or text_issues:
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
