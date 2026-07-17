# Vela de luz de Amazon

Floci expone Amazon Lightsail a través del protocolo AWS JSON 1.1:

- Punto final: `POST /`
- Prefijo de destino: `Lightsail_20161128.*`
- Nombre de firma: `lightsail`

La implementación local mantiene el estado de Lightsail en el almacenamiento Floci y está diseñada para la compatibilidad con SDK y AWS CLI en flujos de trabajo de desarrollo comunes.

## Flujos de trabajo locales compatibles

- Instancias: crear, obtener, enumerar, iniciar, detener, reiniciar, eliminar, buscar estado y administrar puertos públicos
- Discos: crear, obtener, enumerar, adjuntar, desconectar y eliminar
- IP estáticas: asignar, obtener, enumerar, adjuntar, separar y liberar
- Pares de claves: cree, importe, obtenga, enumere, elimine y descargue el par de claves predeterminado
- Descubrimiento: regiones, planos, paquetes, nombres activos, operaciones y operaciones de recursos.
- Etiquetas: etiquetar y desetiquetar recursos locales de Lightsail

Operaciones de lista de solo lectura para familias de recursos de Lightsail del lado de la nube que no están implementadas localmente pero que devuelven listas vacías en forma de AWS. Los flujos de trabajo de aprovisionamiento solo en la nube, como servicios de contenedores, distribuciones, bases de datos administradas, balanceadores de carga, depósitos e instantáneas, se reconocen desde el modelo AWS Lightsail API y devuelven un error `UnsupportedOperation` explícito en lugar de un punto final personalizado o una forma de respuesta que no es AWS.

## Ejemplos

```bash
aws --endpoint-url http://localhost:4566 lightsail get-blueprints
```

```bash
aws --endpoint-url http://localhost:4566 lightsail create-instances \
  --instance-names web-a \
  --availability-zone us-east-1a \
  --blueprint-id ubuntu_22_04 \
  --bundle-id nano_3_0
```

```bash
aws --endpoint-url http://localhost:4566 lightsail allocate-static-ip \
  --static-ip-name web-ip

aws --endpoint-url http://localhost:4566 lightsail attach-static-ip \
  --static-ip-name web-ip \
  --instance-name web-a
```

## Persistencia

Los recursos de Lightsail utilizan `StorageFactory` y siguen el modo de almacenamiento global de forma predeterminada. Configura el servicio con:

```yaml
floci:
  services:
    lightsail:
      enabled: true
  storage:
    services:
      lightsail:
        flush-interval-ms: 5000
```
