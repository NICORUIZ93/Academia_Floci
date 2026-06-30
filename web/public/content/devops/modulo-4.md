## Pipeline como código

```yaml
# .github/workflows/ci.yml
name: CI
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '${{ matrix.node-version }}', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --coverage
      - uses: actions/upload-artifact@v4
        with: { name: coverage, path: coverage/ }
```

## Matriz de build

`strategy.matrix` ejecuta el mismo job una vez por cada combinación — aquí, una vez con Node 20 y otra con Node 22, en paralelo.

## Cache de dependencias

`cache: 'npm'` en `setup-node` reutiliza `node_modules` entre ejecuciones cuando el lockfile no cambió, reduciendo significativamente el tiempo del pipeline.

## Artifacts

Los artifacts (reportes de cobertura, binarios compilados) quedan descargables desde la página de la ejecución del workflow, sin necesidad de publicarlos en otro lugar.

## CI obligatorio en PRs

Configurar el repositorio para que un PR no pueda mergearse si el CI falla convierte "no romper main" de una norma social a una regla técnica imposible de saltarse.
