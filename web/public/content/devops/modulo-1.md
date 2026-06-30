## Trunk-based vs GitFlow

**Trunk-based**: todos integran a `main` frecuentemente (varias veces al día), con feature flags para ocultar trabajo incompleto. **GitFlow**: ramas de larga duración (`develop`, `release/*`, `hotfix/*`) con más ceremonia. Equipos pequeños y con CI/CD maduro suelen preferir trunk-based; proyectos con releases programados y poco automatizados se inclinan más a GitFlow.

## Rebase interactivo

```bash
git rebase -i HEAD~3
# pick, squash, reword, drop — reescribe el historial antes de compartirlo
```

Útil para limpiar commits de "WIP" antes de abrir un PR. **Nunca** reescribas el historial de una rama que otros ya tienen clonada/mergeada.

## git bisect

```bash
git bisect start
git bisect bad          # el commit actual tiene el bug
git bisect good v1.2.0   # esta versión anterior estaba bien
# git hace checkout automático al punto medio; marcas good/bad hasta encontrar el commit exacto
```

## Hooks

```bash
# .git/hooks/pre-commit
#!/bin/sh
npm run lint || exit 1
```

## Monorepo vs polyrepo

Un monorepo facilita cambios atómicos entre paquetes relacionados y comparte tooling; un polyrepo da límites más claros de ownership y despliegue independiente.
