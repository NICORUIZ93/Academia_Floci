## package.json y semver

```json
{
  "name": "mi-api",
  "version": "1.4.2",
  "dependencies": { "express": "^4.19.0" },
  "devDependencies": { "vitest": "^2.0.0" }
}
```

`^4.19.0` acepta actualizaciones menores y de parche (`4.x.x` mientras `4 <= x`), pero nunca un cambio de versión mayor. `~4.19.0` solo acepta parches (`4.19.x`). Una versión exacta sin prefijo fija ese número exacto.

## Lockfiles

`package-lock.json` (o `pnpm-lock.yaml`) congela el árbol de dependencias EXACTO que se instaló, incluyendo sub-dependencias. Sin lockfile, dos instalaciones del mismo `package.json` en momentos distintos podrían traer versiones distintas de paquetes transitivos.

```bash
npm install   # respeta el lockfile si existe, lo actualiza si hace falta
npm ci        # instala EXACTAMENTE lo que dice el lockfile, falla si no coincide — ideal para CI
```

## Workspaces (monorepo)

```json
// package.json raíz
{ "workspaces": ["packages/*"] }
```

```bash
mi-monorepo/
  packages/
    core/      (paquete compartido)
    api/       (depende de core)
npm install   # enlaza packages/api → packages/core automáticamente, sin publicar a npm
```

## Scripts de ciclo de vida

```json
{ "scripts": { "postinstall": "echo 'Dependencias listas'" } }
```

npm ejecuta automáticamente scripts con nombres reservados (`preinstall`, `postinstall`, `prepare`, etc.) en los momentos correspondientes del ciclo de vida del paquete.
