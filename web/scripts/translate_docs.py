#!/usr/bin/env python3
"""Traduce Markdown de Floci preservando codigo, URLs e identificadores inline."""

from __future__ import annotations

import hashlib
import json
import re
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "scripts/source-docs-en"
TARGET = ROOT / "public/content/oficial-es"
CACHE_PATH = ROOT / "scripts/.translation-cache.json"
API = "https://translate.googleapis.com/translate_a/single"

PROTECTED = re.compile(
    r"(^#{1,6}|`[^`\n]+`|https?://[^\s)>]+|<[^>]+>|\{#[^}]+\}|\$\{[^}]+\}|"
    r"\b[\w.-]+\.(?:yml|yaml|json|xml|md|sh|py|js|mjs|ts|java|go|txt|csv|parquet)\b|"
    r"\b(?:FLOCI|AWS|LOCALSTACK)_[A-Z0-9_]+\b|"
    r"\b[A-Z][a-z0-9]+(?:[A-Z][A-Za-z0-9]*)+\b|"
    r"\b(?:AWS|Floci|S3 Select|S3|SQS|SNS|SSM|SES|IAM|STS|KMS|ECR|ECS|EKS|EC2|RDS|MSK|ACM|"
    r"CORS|API|CLI|SDK|JWT|ARN|HTTP|HTTPS|REST|TCP|TLS|JSON|XML|CSV|SQL|Parquet|DuckDB|JVM|"
    r"DynamoDB|Lambda|CloudFormation|CloudWatch|EventBridge|AppConfig|AppSync|"
    r"OpenSearch|ElastiCache|Neptune|Athena|Glue|Kinesis|Firehose|Textract|"
    r"Transcribe|Bedrock|Route53|CloudFront|Testcontainers|Docker|Kafka|Redis|Valkey|"
    r"Java|JavaScript|Node\.js|TypeScript|Python|Go|boto3|GraphQL|WebSocket|OAuth|OCI|SMTP|"
    r"MIME|JUnit|Jest|Vitest|pytest|UFW|IMDS|SELECT|WHERE|LIKE|BETWEEN|IN|NULL|AND|OR|NOT|LIMIT)\b|"
    r"\bfloci-[a-z0-9-]+\b)",
    re.MULTILINE,
)


def load_cache() -> dict[str, str]:
    if CACHE_PATH.exists():
        return json.loads(CACHE_PATH.read_text(encoding="utf-8"))
    return {}


CACHE = load_cache()


def protect(text: str) -> tuple[str, list[str]]:
    values: list[str] = []

    def replace(match: re.Match[str]) -> str:
        values.append(match.group(0))
        return f"ZXQPROTECT{len(values) - 1}QXZ"

    return PROTECTED.sub(replace, text), values


def restore(text: str, values: list[str]) -> str:
    for index, value in enumerate(values):
        text = text.replace(f"ZXQPROTECT{index}QXZ", value)
        text = text.replace(f"ZXQPROTECT {index} QXZ", value)
    return text


def request_translation(text: str) -> str:
    key = hashlib.sha256(text.encode()).hexdigest()
    if key in CACHE:
        return CACHE[key]

    payload = urllib.parse.urlencode(
        {"client": "gtx", "sl": "en", "tl": "es", "dt": "t", "q": text}
    )
    url = f"{API}?{payload}"
    last_error: Exception | None = None
    for attempt in range(5):
        try:
            with urllib.request.urlopen(url, timeout=45) as response:
                data = json.loads(response.read().decode("utf-8"))
            translated = "".join(item[0] for item in data[0] if item[0])
            CACHE[key] = translated
            time.sleep(0.08)
            return translated
        except Exception as error:  # noqa: BLE001
            last_error = error
            time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"No fue posible traducir un bloque: {last_error}")


def chunks(text: str, limit: int = 3000) -> list[str]:
    paragraphs = re.split(r"(\n\s*\n)", text)
    output: list[str] = []
    current = ""
    for paragraph in paragraphs:
        if len(current) + len(paragraph) > limit and current:
            output.append(current)
            current = ""
        if len(paragraph) > limit:
            lines = paragraph.splitlines(keepends=True)
            for line in lines:
                if len(current) + len(line) > limit and current:
                    output.append(current)
                    current = ""
                current += line
        else:
            current += paragraph
    if current:
        output.append(current)
    return output


def translate_prose(text: str) -> str:
    if not re.search(r"[A-Za-z]", text):
        return text
    translated_parts: list[str] = []
    for chunk in chunks(text):
        if not chunk.strip() or not re.search(r"[A-Za-z]", chunk):
            translated_parts.append(chunk)
            continue
        leading = re.match(r"^\s*", chunk).group(0)
        trailing = re.search(r"\s*$", chunk).group(0)
        core_end = len(chunk) - len(trailing) if trailing else len(chunk)
        core = chunk[len(leading):core_end]
        safe, values = protect(core)
        translated_parts.append(leading + restore(request_translation(safe), values) + trailing)
    return "".join(translated_parts)


def translate_markdown(text: str) -> str:
    parts = re.split(r"(```[\s\S]*?```|~~~[\s\S]*?~~~)", text)
    translated = "".join(part if part.startswith(("```", "~~~")) else translate_prose(part) for part in parts)
    translated = re.sub(r"(?m)^(#{1,6})(?=\S)", r"\1 ", translated)
    return normalize_headings(translated)


def normalize_headings(text: str) -> str:
    """Repara marcadores de titulo que el traductor mueve dentro de la linea."""
    output: list[str] = []
    in_fence = False
    for line in text.splitlines(keepends=True):
        stripped = line.lstrip()
        if stripped.startswith(("```", "~~~")):
            in_fence = not in_fence
            output.append(line)
            continue
        if in_fence:
            output.append(line)
            continue

        ending = "\n" if line.endswith("\n") else ""
        body = line[:-1] if ending else line

        combined = re.match(r"^(\s*)(#{1,5})\s+#\s*(.+)$", body)
        if combined:
            indent, hashes, title = combined.groups()
            body = f"{indent}{'#' * (len(hashes) + 1)} {title}"
        else:
            trailing = re.match(r"^(\s*)(.+?)\s+(#{1,6})\s*$", body)
            embedded = re.match(r"^(\s*)(.+?)\s+(#{1,6})\s+(.+)$", body)
            if trailing:
                indent, title, hashes = trailing.groups()
                body = f"{indent}{hashes} {title}"
            elif embedded:
                indent, before, hashes, after = embedded.groups()
                body = f"{indent}{hashes} {before} {after}"

        heading_cleanup = {
            "## Operaciones compatibles con": "## Operaciones compatibles",
            "## Configuración de": "## Configuración",
            "## Ejemplos de": "## Ejemplos",
            "### Ejemplo de": "### Ejemplo",
        }
        body = heading_cleanup.get(body, body)

        output.append(body + ending)
    return "".join(output)


def main() -> None:
    files = sorted(SOURCE.rglob("*.md"))

    def translate_file(source: Path) -> Path:
        relative = source.relative_to(SOURCE)
        target = TARGET / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(translate_markdown(source.read_text(encoding="utf-8")), encoding="utf-8")
        return relative

    with ThreadPoolExecutor(max_workers=6) as executor:
        futures = [executor.submit(translate_file, source) for source in files]
        for index, future in enumerate(as_completed(futures), start=1):
            print(f"[{index:02d}/{len(files)}] {future.result()}", flush=True)
    CACHE_PATH.write_text(json.dumps(CACHE, ensure_ascii=False), encoding="utf-8")


if __name__ == "__main__":
    main()
