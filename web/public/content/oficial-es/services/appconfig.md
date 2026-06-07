# AppConfig

Floci admite AWS, AppConfig y AppConfigData para la gestión de configuración local.

## Plano de gestión (AppConfig)

El plano de administración le permite crear y administrar aplicaciones, entornos, perfiles de configuración y versiones de configuración alojadas.

### Operaciones compatibles con

- `CreateApplication`
- `GetApplication`
- `ListApplications`
- `DeleteApplication`
- `CreateEnvironment`
- `GetEnvironment`
- `ListEnvironments`
- `CreateConfigurationProfile`
- `GetConfigurationProfile`
- `ListConfigurationProfiles`
- `CreateHostedConfigurationVersion`
- `GetHostedConfigurationVersion`
- `CreateDeploymentStrategy`
- `GetDeploymentStrategy`
- `StartDeployment`
- `GetDeployment`

## Plano de datos (AppConfigData) {#data-plane}

Las aplicaciones utilizan el plano de datos para recuperar la configuración activa de un entorno y perfil.

### Operaciones compatibles con

- `StartConfigurationSession`
- `GetLatestConfiguration`

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_APPCONFIG_ENABLED` | `true` | Habilite o deshabilite el plano de administración AppConfig |
| `FLOCI_SERVICES_APPCONFIGDATA_ENABLED` | `true` | Habilitar o deshabilitar el plano de recuperación AppConfigData |

## Ejemplo de uso de

### 1. Crear una aplicación y un entorno

```bash
# Create application
aws appconfig create-application --name my-app --endpoint-url http://localhost:4566

# Create environment
aws appconfig create-environment --application-id <app-id> --name dev --endpoint-url http://localhost:4566
```

### 2. Cree una configuración alojada

```bash
# Create configuration profile
aws appconfig create-configuration-profile \
  --application-id <app-id> \
  --name my-profile \
  --location-uri hosted \
  --type AWS.Freeform \
  --endpoint-url http://localhost:4566

# Create hosted configuration version
aws appconfig create-hosted-configuration-version \
  --application-id <app-id> \
  --configuration-profile-id <profile-id> \
  --content "{\"foo\": \"bar\"}" \
  --content-type application/json \
  --endpoint-url http://localhost:4566
```

### 3. Implementar la configuración

```bash
# Create immediate deployment strategy
aws appconfig create-deployment-strategy \
  --name immediate \
  --deployment-duration-in-minutes 0 \
  --growth-factor 100 \
  --final-bake-time-in-minutes 0 \
  --endpoint-url http://localhost:4566

# Start deployment
aws appconfig start-deployment \
  --application-id <app-id> \
  --environment-id <env-id> \
  --configuration-profile-id <profile-id> \
  --configuration-version 1 \
  --deployment-strategy-id <strategy-id> \
  --endpoint-url http://localhost:4566
```

### 4. Recuperar la configuración a través del plano de datos

```bash
# Start configuration session
TOKEN=$(aws appconfigdata start-configuration-session \
  --application-identifier <app-id> \
  --environment-identifier <env-id> \
  --configuration-profile-identifier <profile-id> \
  --query "InitialConfigurationToken" --output text \
  --endpoint-url http://localhost:4566)

# Get latest configuration
aws appconfigdata get-latest-configuration \
  --configuration-token $TOKEN \
  --endpoint-url http://localhost:4566
```
