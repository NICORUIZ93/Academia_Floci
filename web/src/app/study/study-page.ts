import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  ClipboardCheck,
  Cloud,
  Code2,
  Download,
  GraduationCap,
  Layers,
  LucideAngularModule,
  Monitor,
  Moon,
  PlayCircle,
  Route,
  Search,
  Sun,
  Terminal,
  Trophy,
} from 'lucide-angular';
import { COURSE_MODULES, CourseModule, TRACKS } from '../course-data';

type Level = 'Básico' | 'Medio' | 'Avanzado' | 'Master';
type Tab = 'teoria' | 'ejemplo' | 'laboratorio' | 'ejercicio' | 'examen';

interface LabStep {
  title: string;
  command: string;
  verify: string;
}

interface Topic {
  id: string;
  moduleId: number;
  title: string;
  level: Level;
  minutes: number;
  intro: string[];
  objectives: string[];
  theory: { title: string; body: string; bullets?: string[] }[];
  comparison?: { left: string; right: string; leftDetail: string; rightDetail: string };
  diagram: string;
  code: string;
  labSteps: LabStep[];
  lineByLine: string[];
  exercise: string;
  expected: string[];
  hints: string[];
  commonErrors: string[];
  summary: string[];
  resources: { label: string; url: string }[];
  quiz: { question: string; answer: string }[];
}

interface StudyModule {
  id: string;
  title: string;
  description: string;
  source?: CourseModule;
  topics: Topic[];
}

interface TopicBlueprint {
  title: string;
  level: Level;
  minutes: number;
  focus: string;
  lab: string;
  objectives: string[];
  concepts: string[];
  cloud?: string;
}

interface Badge {
  name: string;
  description: string;
  unlocked: boolean;
}

interface CourseStep {
  id: number;
  module: string;
  title: string;
  explanation: string;
  analogy?: string;
  command?: string;
  breakdown: string[];
  expectedOutput: string;
  practice: string;
  question: string;
  expectedAnswer: string;
  keywords: string[];
}

interface LmsStat {
  value: string;
  label: string;
}

interface MethodLayer {
  number: string;
  title: string;
  goal: string;
  detail: string;
}

interface ProviderCard {
  name: string;
  port: string;
  services: string;
  focus: string;
}

interface SetupCard {
  os: string;
  shortcut: string;
  steps: string[];
}

interface LanguageLab {
  name: string;
  use: string;
  file: string;
}

interface StepSection {
  module: string;
  steps: CourseStep[];
}

const STORAGE_KEY = 'cloud-local-study-progress-v2';
const THEME_KEY = 'cloud-local-study-theme-v2';
const ANSWERS_KEY = 'cloud-local-study-answers-v2';
const EDITOR_KEY = 'cloud-local-study-editor-v1';
const LAB_KEY = 'cloud-local-study-labs-v1';
const STEP_KEY = 'cloud-local-guided-steps-v1';
const STEP_ANSWERS_KEY = 'cloud-local-guided-step-answers-v1';
const STEP_EDITORS_KEY = 'cloud-local-guided-step-editors-v1';

const resources = [
  { label: 'Docker', url: 'https://docs.docker.com/' },
  { label: 'AWS CLI', url: 'https://docs.aws.amazon.com/cli/' },
  { label: 'Azure CLI', url: 'https://learn.microsoft.com/cli/azure/' },
  { label: 'Google Cloud CLI', url: 'https://cloud.google.com/sdk/docs' },
];

const studyStandards = [
  'Ruta visible de 0 a 18 módulos con subtemas en el panel lateral.',
  'Cada tema tiene introducción, objetivos, teoría, ejemplo, ejercicio, errores, resumen y examen.',
  'Progreso global, progreso por módulo, respuestas guardadas en localStorage e insignias.',
  'Búsqueda por servicio, nube, nivel o concepto.',
  'Modo claro/oscuro, diseño responsive y textos largos con saltos seguros.',
  'Laboratorios con AWS, Azure y GCP; no solo AWS.',
  'Proyecto final obligatorio que integra almacenamiento, colas, NoSQL, secretos, funciones, API, eventos, observabilidad, RDS, contenedores, IaC, workflows, streams, auth, analytics e IA.',
  'Exportación del cuaderno de progreso para estudiar sin depender de la IA.',
];

const guidedStep = (
  id: number,
  module: string,
  title: string,
  explanation: string,
  command: string | undefined,
  breakdown: string[],
  expectedOutput: string,
  practice: string,
  question: string,
  expectedAnswer: string,
  keywords: string[],
  analogy?: string,
): CourseStep => ({ id, module, title, explanation, command, breakdown, expectedOutput, practice, question, expectedAnswer, keywords, analogy });

const GUIDED_STEPS: CourseStep[] = [
  guidedStep(1, 'Docker y Cloud local', 'Qué es Docker y por qué lo necesitas',
    'Docker permite ejecutar aplicaciones empaquetadas en contenedores. Lo necesitas porque el emulador de cloud local corre como un servicio aislado, con sus puertos y dependencias controladas.',
    undefined,
    ['Docker evita instalar dependencias sueltas en tu sistema.', 'Un contenedor es una ejecución viva de una imagen.', 'El emulador de cloud local usa contenedores para darte servicios cloud locales.'],
    'No hay salida esperada. Este paso es conceptual.',
    'Escribe con tus palabras qué problema resuelve Docker antes de instalar nada.',
    '¿Por qué usamos Docker para practicar con cloud local?',
    'Porque Docker ejecuta el laboratorio aislado en mi computador sin instalar servicios reales ni usar nube con costo.',
    ['docker', 'contenedor', 'aislado', 'cloud local'],
    'Docker es como una lonchera técnica: trae la app con todo lo que necesita para correr igual en otra máquina.'),
  guidedStep(2, 'Docker y Cloud local', 'Instalar Docker en Mac, Windows o Linux',
    'Antes de usar cloud local debes tener Docker encendido. En Mac y Windows normalmente instalas Docker Desktop; en Linux puedes usar el gestor de paquetes de tu distribución.',
    'sudo apt update && sudo apt install docker.io -y',
    ['sudo ejecuta el comando con permisos de administrador.', 'apt update actualiza el índice de paquetes.', 'apt install docker.io instala Docker desde los repositorios.', '-y acepta la instalación sin preguntar cada paso.'],
    'Reading package lists... Done\nSetting up docker.io ...\nDocker instalado correctamente.',
    'Si estás en Linux, escribe el comando. En Mac o Windows, escribe "Docker Desktop instalado" y verifica que la app esté abierta.',
    '¿Qué debes abrir en Mac o Windows después de instalar Docker?',
    'Debo abrir Docker Desktop y esperar a que indique que Docker está corriendo.',
    ['docker', 'desktop', 'instalado', 'corriendo']),
  guidedStep(3, 'Docker y Cloud local', 'Verificar Docker',
    'La instalación no se asume: se comprueba. Este paso confirma que el comando docker existe y responde desde tu terminal.',
    'docker --version',
    ['docker llama al programa principal.', '--version pide que muestre la versión instalada sin iniciar contenedores.'],
    'Docker version 24.0.7, build afdd53b',
    'Ejecuta el comando y pega la versión exacta que aparece en tu terminal.',
    '¿Qué versión de Docker tienes?',
    'Una respuesta correcta incluye la palabra Docker y un número de versión.',
    ['docker', 'version']),
  guidedStep(4, 'Docker y Cloud local', 'Levantar el emulador local',
    'Ahora ejecutas un emulador AWS local. El puerto 4566 queda disponible en tu computador para que herramientas como AWS CLI hablen con el laboratorio y no con AWS real.',
    'docker run -p 4566:4566 <imagen-emulador-aws-local>:latest',
    ['docker run ejecuta un contenedor.', '-p 4566:4566 conecta el puerto 4566 del contenedor con el puerto 4566 de tu máquina.', '<imagen-emulador-aws-local>:latest representa la imagen Docker del emulador que usarás en el laboratorio.'],
    'Starting local AWS emulator on port 4566...\nReady.',
    'Copia el comando, ejecútalo y confirma que ves una línea parecida a Ready.',
    '¿En qué puerto queda escuchando el emulador AWS local?',
    'El emulador AWS local queda escuchando en el puerto 4566.',
    ['4566', 'puerto', 'cloud local']),
  guidedStep(5, 'Docker y Cloud local', 'Verificar salud del emulador local',
    'No basta con levantar un contenedor: debes verificar que el servicio responde por HTTP en localhost.',
    'curl http://localhost:4566/_localstack/health',
    ['curl hace una petición HTTP desde la terminal.', 'localhost significa tu propio computador.', '4566 es el puerto donde escucha el emulador AWS local.', '/_localstack/health devuelve el estado de servicios disponibles.'],
    '{"services":{"s3":"available","sqs":"available","lambda":"available"}}',
    'Ejecuta el comando y pega al menos dos servicios que aparezcan como available.',
    '¿Qué servicios aparecen disponibles?',
    'Debe mencionar servicios como s3, sqs, lambda o dynamodb en estado available.',
    ['available', 's3', 'sqs', 'lambda']),
  guidedStep(6, 'Docker y Cloud local', 'Configurar AWS CLI para laboratorio local',
    'AWS CLI necesita credenciales aunque el laboratorio sea local. Usamos valores ficticios porque el emulador no cobra ni autentica contra AWS real.',
    'aws configure set aws_access_key_id test\naws configure set aws_secret_access_key test\naws configure set region us-east-1',
    ['aws configure set guarda una configuración local.', 'aws_access_key_id test define una clave falsa.', 'aws_secret_access_key test define un secreto falso.', 'region us-east-1 define una región estándar para los comandos.'],
    'Sin salida si la configuración se guarda correctamente.',
    'Ejecuta las tres líneas una por una. No pegues claves reales.',
    '¿Por qué usamos test como access key?',
    'Porque el emulador corre local y solo necesita credenciales ficticias para que AWS CLI forme las peticiones.',
    ['test', 'credenciales', 'local', 'cloud local']),
  guidedStep(7, 'Docker y Cloud local', 'Probar AWS CLI contra el emulador local',
    'Este paso confirma que AWS CLI está hablando con el endpoint local y no con AWS real.',
    'aws s3 ls --endpoint-url http://localhost:4566',
    ['aws s3 ls lista buckets de S3.', '--endpoint-url cambia el destino del comando.', 'http://localhost:4566 apunta al emulador local, no a AWS real.'],
    'Sin salida si todavía no existen buckets.',
    'Ejecuta el comando. Si no aparece nada, eso también es una respuesta válida al inicio.',
    '¿Qué deberías ver si no hay buckets creados?',
    'No debería ver buckets; la salida puede estar vacía.',
    ['sin salida', 'vacia', 'bucket']),
  guidedStep(8, 'S3 almacenamiento', 'Qué es S3',
    'S3 guarda objetos: archivos con nombre, contenido y metadata. En cloud local practicas buckets y objetos sin pagar almacenamiento real.',
    undefined,
    ['Bucket es el contenedor lógico.', 'Objeto es el archivo guardado.', 'Key es la ruta o nombre del objeto dentro del bucket.'],
    'No hay salida esperada. Este paso es conceptual.',
    'Escribe una analogía propia para bucket, objeto y key.',
    '¿Qué diferencia hay entre bucket y objeto?',
    'El bucket contiene objetos; el objeto es el archivo o dato almacenado.',
    ['bucket', 'objeto', 'archivo'],
    'S3 es como un almacén gigante: el bucket es una bodega y cada objeto es una caja con etiqueta.'),
  guidedStep(9, 'S3 almacenamiento', 'Crear un bucket',
    'Crear un bucket es el primer recurso real del laboratorio S3. Todo archivo que subas necesita vivir dentro de un bucket.',
    'aws s3 mb s3://mi-bucket --endpoint-url http://localhost:4566',
    ['aws s3 mb significa make bucket.', 's3://mi-bucket es el nombre del bucket.', '--endpoint-url evita tocar AWS real y usa el emulador local.'],
    'make_bucket: mi-bucket',
    'Crea un bucket. Puedes cambiar mi-bucket por un nombre propio corto.',
    '¿Qué nombre le pusiste a tu bucket?',
    'Debe indicar el nombre del bucket creado.',
    ['bucket', 'mi-bucket', 'make_bucket']),
  guidedStep(10, 'S3 almacenamiento', 'Crear y subir un archivo',
    'Vas a crear un archivo local y luego copiarlo al bucket. Así verificas el flujo completo: disco local -> S3 local.',
    'echo "Hola Mundo" > miarchivo.txt\naws s3 cp miarchivo.txt s3://mi-bucket/ --endpoint-url http://localhost:4566',
    ['echo crea texto en la terminal.', '> miarchivo.txt guarda el texto en un archivo.', 'aws s3 cp copia archivos.', 'miarchivo.txt es el origen local.', 's3://mi-bucket/ es el destino en S3.'],
    'upload: ./miarchivo.txt to s3://mi-bucket/miarchivo.txt',
    'Ejecuta ambas líneas y pega la salida upload.',
    '¿Qué comando usaste para subir el archivo?',
    'Debe incluir aws s3 cp y el destino s3://mi-bucket/.',
    ['aws', 's3', 'cp', 'upload']),
  guidedStep(11, 'S3 almacenamiento', 'Listar objetos en el bucket',
    'Después de subir, debes comprobar que el objeto existe. Listar es la forma más simple de obtener evidencia.',
    'aws s3 ls s3://mi-bucket/ --endpoint-url http://localhost:4566',
    ['aws s3 ls lista contenido.', 's3://mi-bucket/ limita la lista a ese bucket.', '--endpoint-url mantiene la consulta local.'],
    '2024-01-01 12:00:00         11 miarchivo.txt',
    'Lista tu bucket y pega el nombre del archivo que aparece.',
    '¿Qué archivos ves en tu bucket?',
    'Debe aparecer miarchivo.txt o el archivo que subiste.',
    ['miarchivo', 'txt', 'bucket']),
  guidedStep(12, 'S3 almacenamiento', 'Descargar un archivo',
    'Descargar comprueba que el objeto no solo fue listado, sino que puede recuperarse desde el almacenamiento.',
    'aws s3 cp s3://mi-bucket/miarchivo.txt ./ --endpoint-url http://localhost:4566',
    ['aws s3 cp también descarga.', 's3://mi-bucket/miarchivo.txt es el origen remoto.', './ significa carpeta actual como destino local.'],
    'download: s3://mi-bucket/miarchivo.txt to ./miarchivo.txt',
    'Descarga el archivo y verifica su contenido con cat miarchivo.txt.',
    '¿Qué comando usaste para descargar el archivo?',
    'Debe incluir aws s3 cp desde s3://mi-bucket/miarchivo.txt hacia ./.',
    ['download', 'aws', 's3', 'cp']),
  guidedStep(13, 'S3 almacenamiento', 'Eliminar un objeto',
    'Eliminar un objeto limpia el bucket y te prepara para borrar el bucket completo.',
    'aws s3 rm s3://mi-bucket/miarchivo.txt --endpoint-url http://localhost:4566',
    ['aws s3 rm elimina un objeto.', 's3://mi-bucket/miarchivo.txt identifica exactamente qué borrar.', '--endpoint-url usa el emulador de cloud local.'],
    'delete: s3://mi-bucket/miarchivo.txt',
    'Elimina el objeto y luego lista el bucket para confirmar que ya no aparece.',
    '¿Cómo verificas que el archivo fue eliminado?',
    'Listando el bucket con aws s3 ls y comprobando que el archivo ya no aparece.',
    ['delete', 's3', 'ls', 'no aparece']),
  guidedStep(14, 'S3 almacenamiento', 'Eliminar el bucket',
    'Un bucket normalmente debe estar vacío antes de borrarlo. Este paso enseña limpieza de recursos.',
    'aws s3 rb s3://mi-bucket --endpoint-url http://localhost:4566',
    ['aws s3 rb significa remove bucket.', 's3://mi-bucket identifica el bucket.', 'Si contiene objetos, primero debes eliminarlos.'],
    'remove_bucket: mi-bucket',
    'Borra el bucket y vuelve a listar buckets para comprobar que ya no está.',
    '¿Qué pasa si intentas eliminar un bucket que no está vacío?',
    'Falla o rechaza la operación hasta que elimines los objetos internos.',
    ['vacio', 'objetos', 'falla']),
  guidedStep(15, 'SQS colas', 'Qué es SQS',
    'SQS desacopla sistemas usando mensajes. Un productor deja trabajo en una cola y un consumidor lo procesa después.',
    undefined,
    ['Productor envía mensajes.', 'Cola guarda mensajes pendientes.', 'Consumidor recibe y procesa mensajes.', 'El mensaje puede llegar más de una vez, por eso importa la idempotencia.'],
    'No hay salida esperada. Este paso es conceptual.',
    'Describe un caso real donde conviene una cola.',
    '¿Para qué sirve una cola?',
    'Sirve para guardar trabajo pendiente y desacoplar productor y consumidor.',
    ['cola', 'mensaje', 'productor', 'consumidor'],
    'SQS es como un buzón: alguien deja cartas y otra persona las recoge cuando puede.'),
  guidedStep(16, 'SQS colas', 'Crear una cola',
    'Una cola necesita nombre y devuelve una URL. Esa URL se usa en los siguientes comandos.',
    'aws sqs create-queue --queue-name mi-cola --endpoint-url http://localhost:4566',
    ['aws sqs create-queue crea una cola.', '--queue-name mi-cola define el nombre.', '--endpoint-url apunta a el emulador de cloud local.'],
    '{"QueueUrl":"http://localhost:4566/000000000000/mi-cola"}',
    'Crea la cola y copia la QueueUrl.',
    '¿Cuál es la URL de tu cola?',
    'Debe incluir http://localhost:4566/000000000000/mi-cola.',
    ['queueurl', 'localhost', 'mi-cola']),
  guidedStep(17, 'SQS colas', 'Enviar un mensaje',
    'Enviar un mensaje pone una unidad de trabajo en la cola para que otro proceso la lea luego.',
    'aws sqs send-message --queue-url http://localhost:4566/000000000000/mi-cola --message-body "Hola desde SQS" --endpoint-url http://localhost:4566',
    ['send-message envía un mensaje.', '--queue-url indica a qué cola.', '--message-body contiene el texto del mensaje.'],
    '{"MD5OfMessageBody":"...","MessageId":"..."}',
    'Envía el mensaje y pega el MessageId.',
    '¿Qué ID de mensaje recibiste?',
    'Debe mencionar el MessageId devuelto por la CLI.',
    ['messageid', 'hola', 'sqs']),
  guidedStep(18, 'SQS colas', 'Recibir mensajes',
    'Recibir no elimina automáticamente. SQS entrega el mensaje y te da un ReceiptHandle para borrarlo después.',
    'aws sqs receive-message --queue-url http://localhost:4566/000000000000/mi-cola --endpoint-url http://localhost:4566',
    ['receive-message lee mensajes disponibles.', '--queue-url identifica la cola.', 'La respuesta incluye Body y ReceiptHandle.'],
    '{"Messages":[{"MessageId":"...","ReceiptHandle":"...","Body":"Hola desde SQS"}]}',
    'Recibe el mensaje y copia Body y ReceiptHandle.',
    '¿Qué mensaje recibiste?',
    'Debe aparecer Hola desde SQS.',
    ['messages', 'body', 'receipt', 'hola']),
  guidedStep(19, 'SQS colas', 'Eliminar un mensaje procesado',
    'Después de procesar un mensaje debes eliminarlo. Si no lo haces, puede volver a aparecer.',
    'aws sqs delete-message --queue-url http://localhost:4566/000000000000/mi-cola --receipt-handle <RECEIPT_HANDLE> --endpoint-url http://localhost:4566',
    ['delete-message borra el mensaje.', '--receipt-handle debe ser el valor recibido al leer.', 'No uses MessageId para borrar; se usa ReceiptHandle.'],
    'Sin salida si se elimina correctamente.',
    'Reemplaza <RECEIPT_HANDLE> por el valor real y elimina el mensaje.',
    '¿Qué pasa si no eliminas el mensaje?',
    'Puede reaparecer después del visibility timeout y procesarse de nuevo.',
    ['receipt', 'visibility', 'reaparecer']),
  guidedStep(20, 'SQS colas', 'Eliminar la cola',
    'Limpiar la cola evita dejar recursos de laboratorio vivos y cierra el ciclo de SQS.',
    'aws sqs delete-queue --queue-url http://localhost:4566/000000000000/mi-cola --endpoint-url http://localhost:4566',
    ['delete-queue elimina toda la cola.', '--queue-url identifica la cola exacta.', 'Después de eliminarla, enviar o recibir contra esa URL falla.'],
    'Sin salida si se elimina correctamente.',
    'Elimina la cola y prueba listar colas para confirmar.',
    '¿Cómo sabes que la cola ya no existe?',
    'Listando colas o intentando usar la URL y comprobando que ya no aparece.',
    ['delete-queue', 'cola', 'no existe']),
  guidedStep(21, 'DynamoDB NoSQL', 'Qué es DynamoDB',
    'DynamoDB guarda ítems en tablas NoSQL. Diseñas la tabla según las consultas, no como si fuera SQL tradicional.',
    undefined,
    ['Tabla contiene ítems.', 'Partition key agrupa datos.', 'Sort key ordena o diferencia ítems dentro de la partición.', 'Query es preferible a Scan.'],
    'No hay salida esperada. Este paso es conceptual.',
    'Escribe una consulta que tu app necesitaría responder.',
    '¿Por qué evitar Scan como primera opción?',
    'Porque Scan revisa toda la tabla y escala mal; Query usa la clave y es más eficiente.',
    ['scan', 'query', 'partition']),
  guidedStep(22, 'DynamoDB NoSQL', 'Crear una tabla',
    'Crearás una tabla de tareas con PK y SK para practicar un patrón común de single-table design.',
    'aws dynamodb create-table --table-name Tareas --attribute-definitions AttributeName=PK,AttributeType=S AttributeName=SK,AttributeType=S --key-schema AttributeName=PK,KeyType=HASH AttributeName=SK,KeyType=RANGE --billing-mode PAY_PER_REQUEST --endpoint-url http://localhost:4566',
    ['create-table crea la tabla.', '--attribute-definitions declara atributos clave.', '--key-schema define partition key y sort key.', 'PAY_PER_REQUEST evita configurar capacidad fija.'],
    '{"TableDescription":{"TableName":"Tareas","TableStatus":"ACTIVE"}}',
    'Crea la tabla y confirma que el estado sea ACTIVE.',
    '¿Qué atributos forman la clave primaria?',
    'PK es la partition key y SK es la sort key.',
    ['pk', 'sk', 'active']),
  guidedStep(23, 'DynamoDB NoSQL', 'Insertar un ítem',
    'Un ítem representa una tarea. Usamos USER#alice como partición para consultar todas sus tareas.',
    'aws dynamodb put-item --table-name Tareas --item \'{"PK":{"S":"USER#alice"},"SK":{"S":"TAREA#001"},"titulo":{"S":"Aprender el emulador de cloud local"},"estado":{"S":"pendiente"}}\' --endpoint-url http://localhost:4566',
    ['put-item inserta o reemplaza un ítem.', 'PK USER#alice agrupa datos de Alice.', 'SK TAREA#001 identifica la tarea.', 'estado permite luego filtrar o indexar.'],
    'Sin salida si se inserta correctamente.',
    'Inserta el ítem y luego prepárate para consultarlo.',
    '¿Qué representa USER#alice?',
    'Representa la partición donde se guardan los datos del usuario Alice.',
    ['user#alice', 'pk', 'item']),
  guidedStep(24, 'DynamoDB NoSQL', 'Consultar con Query',
    'Query recupera ítems por clave. Es la forma correcta de leer datos cuando conoces la partición.',
    'aws dynamodb query --table-name Tareas --key-condition-expression "PK = :pk" --expression-attribute-values \'{":pk":{"S":"USER#alice"}}\' --endpoint-url http://localhost:4566',
    ['query lee por clave.', '--key-condition-expression define la condición.', ':pk es una variable de expresión.', '--expression-attribute-values da valor a la variable.'],
    '{"Items":[{"PK":{"S":"USER#alice"},"SK":{"S":"TAREA#001"},"titulo":{"S":"Aprender el emulador de cloud local"}}]}',
    'Consulta la tabla y pega el título devuelto.',
    '¿Por qué Query es mejor que Scan aquí?',
    'Porque Query usa la partition key USER#alice y no revisa toda la tabla.',
    ['query', 'pk', 'user#alice']),
  guidedStep(25, 'DynamoDB NoSQL', 'Eliminar tabla de laboratorio',
    'Eliminar recursos también se aprende. Este paso cierra el laboratorio de DynamoDB.',
    'aws dynamodb delete-table --table-name Tareas --endpoint-url http://localhost:4566',
    ['delete-table elimina la tabla completa.', '--table-name Tareas identifica el recurso.', 'Después de borrarla, las consultas fallan.'],
    '{"TableDescription":{"TableName":"Tareas","TableStatus":"DELETING"}}',
    'Elimina la tabla y documenta por qué no harías esto en producción sin respaldo.',
    '¿Qué pierdes al eliminar una tabla?',
    'Pierdo todos los ítems de la tabla si no tengo respaldo o exportación.',
    ['delete', 'tabla', 'datos']),
  guidedStep(26, 'Lambda funciones', 'Qué es Lambda',
    'Lambda ejecuta funciones sin que administres servidores. En el emulador de cloud local practicas empaquetado, invocación y logs localmente.',
    undefined,
    ['Handler es la función de entrada.', 'Event contiene los datos de invocación.', 'Context trae metadata de ejecución.', 'La función debe ser pequeña y observable.'],
    'No hay salida esperada. Este paso es conceptual.',
    'Describe qué evento dispararía una Lambda en tu proyecto final.',
    '¿Qué recibe el parámetro event?',
    'Recibe los datos de entrada de la invocación, como HTTP, mensaje de cola o evento.',
    ['event', 'handler', 'lambda']),
  guidedStep(27, 'Lambda funciones', 'Crear handler.py',
    'Antes de desplegar, necesitas un archivo con la función handler que Lambda invocará.',
    'cat > handler.py <<\'PY\'\ndef handler(event, context):\n    return {"statusCode": 200, "body": "Hola el emulador de cloud local"}\nPY',
    ['cat > handler.py crea el archivo.', "<<'PY' abre un bloque heredoc.", 'def handler(event, context) define la función de entrada.', 'return devuelve una respuesta compatible con HTTP.'],
    'Se crea el archivo handler.py sin salida adicional.',
    'Crea el archivo y revisa su contenido con cat handler.py.',
    '¿Cómo se llama la función de entrada?',
    'La función de entrada se llama handler.',
    ['handler', 'event', 'context']),
  guidedStep(28, 'Lambda funciones', 'Empaquetar y crear Lambda',
    'Lambda necesita un paquete zip y una configuración que diga runtime, handler y rol.',
    'zip function.zip handler.py\naws lambda create-function --function-name mi-funcion --runtime python3.12 --handler handler.handler --role arn:aws:iam::000000000000:role/lambda-role --zip-file fileb://function.zip --endpoint-url http://localhost:4566',
    ['zip function.zip handler.py crea el paquete.', '--function-name define el nombre.', '--runtime python3.12 indica el lenguaje.', '--handler handler.handler apunta archivo.función.', '--zip-file sube el paquete local.'],
    '{"FunctionName":"mi-funcion","Runtime":"python3.12","State":"Active"}',
    'Empaqueta y crea la función. Si falla, revisa nombre de archivo y handler.',
    '¿Qué significa handler.handler?',
    'Significa archivo handler.py y función handler dentro de ese archivo.',
    ['handler.handler', 'zip', 'runtime']),
  guidedStep(29, 'Lambda funciones', 'Invocar Lambda',
    'Invocar ejecuta la función y guarda la respuesta en un archivo para inspeccionarla.',
    'aws lambda invoke --function-name mi-funcion output.json --endpoint-url http://localhost:4566 && cat output.json',
    ['lambda invoke ejecuta la función.', '--function-name indica cuál.', 'output.json guarda la respuesta.', 'cat output.json muestra el contenido.'],
    '{"statusCode":200,"body":"Hola el emulador de cloud local"}',
    'Invoca la función y pega el contenido de output.json.',
    '¿Qué body devolvió la función?',
    'Devolvió Hola el emulador de cloud local.',
    ['hola', 'cloud local', 'statuscode']),
  guidedStep(30, 'Lambda funciones', 'Leer logs de Lambda',
    'Los logs son la primera herramienta para entender fallos. No adivines: busca evidencia.',
    'aws logs filter-log-events --log-group-name /aws/lambda/mi-funcion --endpoint-url http://localhost:4566',
    ['logs filter-log-events consulta eventos.', '--log-group-name apunta al grupo de la Lambda.', '/aws/lambda/mi-funcion es la convención de nombre.'],
    '{"events":[{"message":"START RequestId ..."},{"message":"END RequestId ..."}]}',
    'Consulta logs después de invocar la función.',
    '¿Qué buscarías si la Lambda falla?',
    'Buscaría mensajes de error, stack trace, RequestId y logs escritos por mi código.',
    ['error', 'requestid', 'logs']),
  guidedStep(31, 'API Gateway', 'Qué es API Gateway',
    'API Gateway expone funciones como endpoints HTTP. Sirve para que un cliente llame tu backend con rutas como POST /tareas.',
    undefined,
    ['Recurso es una ruta.', 'Método es GET, POST, PUT o DELETE.', 'Stage es una versión desplegada.', 'Integración conecta la API con Lambda.'],
    'No hay salida esperada. Este paso es conceptual.',
    'Dibuja una ruta Cliente -> API Gateway -> Lambda.',
    '¿Qué problema resuelve API Gateway?',
    'Expone una interfaz HTTP controlada para invocar funciones o servicios backend.',
    ['http', 'lambda', 'ruta']),
  guidedStep(32, 'API Gateway', 'Crear API REST',
    'Crear el API es el contenedor de rutas y métodos. Luego agregarás recursos como /tareas.',
    'aws apigateway create-rest-api --name "API Tareas" --endpoint-url http://localhost:4566',
    ['create-rest-api crea una API REST.', '--name asigna un nombre legible.', '--endpoint-url mantiene todo local.'],
    '{"id":"abc123","name":"API Tareas"}',
    'Crea la API y copia el id devuelto.',
    '¿Para qué necesitas el id del API?',
    'Para crear recursos, métodos, integraciones y despliegues sobre esa API.',
    ['id', 'api', 'rest']),
  guidedStep(33, 'API Gateway', 'Crear recurso y método POST',
    'Un recurso representa la ruta /tareas y el método POST define qué operación acepta.',
    'aws apigateway create-resource --rest-api-id <API_ID> --parent-id <ROOT_ID> --path-part tareas --endpoint-url http://localhost:4566\naws apigateway put-method --rest-api-id <API_ID> --resource-id <RESOURCE_ID> --http-method POST --authorization-type NONE --endpoint-url http://localhost:4566',
    ['create-resource crea /tareas.', '--parent-id indica de qué ruta cuelga.', 'put-method agrega POST.', '--authorization-type NONE deja el método abierto para laboratorio.'],
    '{"id":"resource123","path":"/tareas"}\nSin salida relevante para put-method.',
    'Reemplaza los IDs reales y crea la ruta POST /tareas.',
    '¿Qué método HTTP aceptará /tareas?',
    'Aceptará POST.',
    ['post', 'tareas', 'resource']),
  guidedStep(34, 'API Gateway', 'Invocar API con curl',
    'La prueba final de API es enviar una petición HTTP y observar una respuesta.',
    'curl -X POST http://localhost:4566/restapis/<API_ID>/dev/_user_request_/tareas -d \'{"titulo":"Mi primera tarea"}\'',
    ['curl ejecuta la petición HTTP.', '-X POST define el método.', '-d envía el cuerpo JSON.', '_user_request_ es la ruta local de invocación en emuladores tipo LocalStack/el emulador de cloud local.'],
    '{"ok":true,"titulo":"Mi primera tarea"}',
    'Ejecuta curl y pega el JSON de respuesta o el error exacto.',
    '¿Qué envía el flag -d?',
    'Envía el cuerpo de la petición HTTP, en este caso un JSON con titulo.',
    ['curl', 'post', 'json']),
  guidedStep(35, 'Observabilidad', 'CloudWatch logs y métricas',
    'Observabilidad significa poder explicar qué pasó usando logs, métricas y alarmas. Sin eso solo estás adivinando.',
    'aws logs create-log-group --log-group-name /mi-app/backend --endpoint-url http://localhost:4566\naws logs filter-log-events --log-group-name /mi-app/backend --filter-pattern "ERROR" --endpoint-url http://localhost:4566',
    ['create-log-group crea un grupo de logs.', 'filter-log-events busca eventos.', '--filter-pattern "ERROR" filtra mensajes con esa palabra.'],
    '[] si no hay errores todavía, o eventos que contengan ERROR.',
    'Crea el log group y escribe qué filtro usarías para encontrar errores.',
    '¿Por qué no basta con decir "falló"?',
    'Porque necesito logs o métricas que demuestren dónde y por qué falló.',
    ['logs', 'error', 'metricas']),
  guidedStep(36, 'Secretos', 'Guardar secretos fuera del código',
    'Las contraseñas no deben vivir en el código. Secrets Manager permite guardarlas y leerlas en tiempo de ejecución.',
    'aws secretsmanager create-secret --name /app/db-password --secret-string "mi-password-segura" --endpoint-url http://localhost:4566\naws secretsmanager get-secret-value --secret-id /app/db-password --query SecretString --output text --endpoint-url http://localhost:4566',
    ['create-secret guarda un secreto.', '--name define una ruta lógica.', '--secret-string contiene el valor.', 'get-secret-value recupera el secreto.', '--query SecretString muestra solo el valor.'],
    'mi-password-segura',
    'Crea un secreto local y léelo sin ponerlo en el código de la app.',
    '¿Por qué no debes subir secretos a Git?',
    'Porque cualquiera con acceso al repo podría usarlos y comprometer sistemas.',
    ['secret', 'password', 'git']),
  guidedStep(37, 'RDS PostgreSQL', 'Crear base relacional local',
    'RDS se usa cuando necesitas SQL, relaciones, transacciones y consultas estructuradas.',
    'aws rds create-db-instance --db-instance-identifier mi-postgres --db-instance-class db.t3.micro --engine postgres --master-username admin --master-user-password admin123 --allocated-storage 20 --endpoint-url http://localhost:4566',
    ['create-db-instance crea la instancia.', '--engine postgres elige PostgreSQL.', '--master-username y --master-user-password definen credenciales de laboratorio.', '--allocated-storage define almacenamiento.'],
    '{"DBInstance":{"DBInstanceIdentifier":"mi-postgres","DBInstanceStatus":"creating"}}',
    'Crea la instancia y documenta cuándo usarías SQL en lugar de DynamoDB.',
    '¿Cuándo elegirías RDS sobre DynamoDB?',
    'Cuando necesito SQL, joins, transacciones o esquema relacional claro.',
    ['postgres', 'sql', 'relacional']),
  guidedStep(38, 'Contenedores', 'Construir y subir imagen a ECR',
    'ECR almacena imágenes Docker. ECS u otros servicios luego ejecutan esas imágenes.',
    'docker build -t mi-api:latest .\naws ecr create-repository --repository-name mi-api --endpoint-url http://localhost:4566\ndocker tag mi-api:latest localhost:4566/mi-api:latest\ndocker push localhost:4566/mi-api:latest',
    ['docker build crea la imagen.', 'create-repository crea el repositorio ECR.', 'docker tag asigna el destino local.', 'docker push sube la imagen.'],
    'Successfully tagged localhost:4566/mi-api:latest\nPushed mi-api:latest',
    'Escribe qué hace cada línea antes de ejecutarla.',
    '¿Qué diferencia hay entre imagen y contenedor?',
    'La imagen es la plantilla; el contenedor es una ejecución de esa imagen.',
    ['imagen', 'contenedor', 'ecr']),
  guidedStep(39, 'Infraestructura como código', 'Crear infraestructura reproducible',
    'IaC evita crear recursos a mano sin registro. Un archivo declara qué recursos existen y permite repetir el ambiente.',
    'aws cloudformation deploy --template-file template.yml --stack-name academia-cloud local --endpoint-url http://localhost:4566',
    ['cloudformation deploy aplica una plantilla.', '--template-file indica el archivo declarativo.', '--stack-name agrupa recursos.', '--endpoint-url usa el emulador de cloud local.'],
    'Successfully created/updated stack - academia-cloud local',
    'Crea una plantilla mínima con un bucket y una cola, luego despliega el stack.',
    '¿Qué ventaja tiene IaC frente a comandos manuales?',
    'Permite repetir, versionar y revisar infraestructura de forma controlada.',
    ['iac', 'template', 'stack']),
  guidedStep(40, 'Step Functions', 'Orquestar un workflow',
    'Step Functions coordina pasos con estado visible: éxito, error, reintento o decisión.',
    'aws stepfunctions create-state-machine --name flujo-tareas --definition file://state-machine.json --role-arn arn:aws:iam::000000000000:role/step-role --endpoint-url http://localhost:4566',
    ['create-state-machine crea el workflow.', '--definition carga el JSON de estados.', '--role-arn define el rol usado por la máquina.'],
    '{"stateMachineArn":"arn:aws:states:us-east-1:000000000000:stateMachine:flujo-tareas"}',
    'Crea una definición con StartAt, Task y End.',
    '¿Qué diferencia hay entre orquestación y eventos sueltos?',
    'La orquestación mantiene un flujo explícito con estado e historial de ejecución.',
    ['workflow', 'state', 'orquestacion']),
  guidedStep(41, 'Streams', 'Crear stream de eventos',
    'Un stream guarda eventos ordenados por partición durante un tiempo. Sirve para procesamiento continuo.',
    'aws kinesis create-stream --stream-name eventos-tareas --shard-count 1 --endpoint-url http://localhost:4566\naws kinesis put-record --stream-name eventos-tareas --partition-key tarea-1 --data "TareaCreada" --endpoint-url http://localhost:4566',
    ['create-stream crea el stream.', '--shard-count define capacidad/particiones.', 'put-record publica un evento.', '--partition-key controla orden dentro de una partición.'],
    '{"ShardId":"shardId-000000000000","SequenceNumber":"..."}',
    'Publica un evento y copia ShardId o SequenceNumber.',
    '¿Qué hace partition-key?',
    'Define en qué partición cae el evento y ayuda a mantener orden para la misma clave.',
    ['partition', 'stream', 'sequence']),
  guidedStep(42, 'Autenticación', 'Entender Cognito y JWT',
    'La autenticación prueba quién eres. Cognito emite tokens JWT que luego una API puede validar.',
    'aws cognito-idp create-user-pool --pool-name academia-users --endpoint-url http://localhost:4566',
    ['cognito-idp opera user pools.', 'create-user-pool crea el directorio de usuarios.', '--pool-name define el nombre.'],
    '{"UserPool":{"Id":"us-east-1_abc123","Name":"academia-users"}}',
    'Crea el user pool y escribe qué dato usaría una API para validar identidad.',
    '¿Qué contiene un JWT?',
    'Contiene claims como usuario, expiración, issuer y scopes/permisos.',
    ['jwt', 'claims', 'usuario']),
  guidedStep(43, 'Analytics', 'Consultar datos con Athena o BigQuery',
    'Analytics consulta archivos como tablas. No reemplaza una base transaccional; responde preguntas sobre datos acumulados.',
    'aws athena start-query-execution --query-string "SELECT estado, count(*) FROM tareas GROUP BY estado" --result-configuration OutputLocation=s3://mi-bucket/resultados/ --endpoint-url http://localhost:4566',
    ['start-query-execution inicia una consulta.', '--query-string contiene SQL.', 'OutputLocation define dónde guardar resultados.', 'En GCP, BigQuery resuelve el mismo tipo de análisis.'],
    '{"QueryExecutionId":"..."}',
    'Escribe una consulta que cuente tareas por estado.',
    '¿Qué diferencia hay entre analytics y transaccional?',
    'Analytics analiza conjuntos de datos; transaccional atiende operaciones de la app en tiempo real.',
    ['athena', 'bigquery', 'sql']),
  guidedStep(44, 'Azure y GCP', 'Comparar servicios equivalentes',
    'Aprender cloud por problema evita casarte con una marca. S3, Blob Storage y Cloud Storage resuelven almacenamiento de objetos con nombres distintos.',
    '<cli-emulador-azure> start\nexport STORAGE_EMULATOR_HOST=http://localhost:4588',
    ['<cli-emulador-azure> start representa el comando de arranque del emulador Azure que elijas.', 'STORAGE_EMULATOR_HOST apunta herramientas GCP al emulador local.', 'El objetivo es comparar patrón, endpoint y comando.'],
    'Azure local emulator ready\nGCP emulator listening on localhost:4588',
    'Haz una tabla de equivalencias: S3=Blob=Cloud Storage, SQS=Service Bus/Pub/Sub, Lambda=Functions/Cloud Functions.',
    '¿Por qué conviene aprender equivalencias entre nubes?',
    'Porque el patrón técnico se repite aunque cambien nombres y comandos.',
    ['azure', 'gcp', 'equivalencias']),
  guidedStep(45, 'Proyecto final', 'Construir gestor de tareas cloud local',
    'El proyecto final une todo: API, auth, almacenamiento, mensajes, base de datos, logs, secretos, contenedores e infraestructura.',
    'make demo-local',
    ['make ejecuta una receta del proyecto.', 'demo-local debe levantar servicios locales, crear recursos y correr pruebas.', 'Si no existe Makefile, documenta los comandos equivalentes en README.'],
    'Demo local OK\nAPI disponible\nPruebas completadas',
    'Entrega README, comandos, capturas, errores corregidos y exportación del progreso.',
    '¿Cómo demuestras que tu proyecto no depende de memoria ni suerte?',
    'Con comandos reproducibles, evidencias, pruebas y documentación para reconstruirlo desde cero.',
    ['proyecto', 'demo', 'readme', 'evidencia']),
];

const topicBlueprints: Record<number, TopicBlueprint[]> = {
  0: [
    {
      title: 'Preparar tu computador desde cero',
      level: 'Básico',
      minutes: 45,
      focus: 'Aprender a abrir una terminal, instalar herramientas y distinguir Docker, CLI, SDK, endpoint y variable de entorno.',
      lab: 'Instala Docker Desktop, abre Terminal en Mac/Linux o PowerShell en Windows, ejecuta docker version y luego revisa el estado del emulador local que elegiste.',
      objectives: ['Abrir una consola sin depender de un IDE.', 'Instalar Docker y verificar que esté encendido.', 'Entender qué comando solo valida y cuál modifica recursos.'],
      concepts: ['Terminal', 'Docker Desktop', 'PowerShell', 'Terminal macOS', 'Shell Linux', 'PATH', 'variable de entorno'],
    },
    {
      title: 'Cloud local con AWS, Azure y GCP',
      level: 'Básico',
      minutes: 50,
      focus: 'Levantar los tres emuladores y entender que el mismo patrón se repite: servicio local, endpoint local y credenciales falsas.',
      lab: 'Levanta un emulador AWS en 4566, un emulador Azure en 4577 y un emulador GCP en 4588; verifica cada estado antes de crear recursos.',
      objectives: ['Diferenciar AWS real de un emulador local.', 'Configurar endpoint y credenciales sin cuenta real.', 'Reconocer cuándo un laboratorio habla con localhost.'],
      concepts: ['puerto 4566', 'puerto 4577', 'puerto 4588', 'localhost', 'endpoint local', 'credenciales dummy'],
      cloud: 'AWS + Azure + GCP',
    },
  ],
  1: [
    {
      title: 'Objetos: bucket, container y blob',
      level: 'Básico',
      minutes: 40,
      focus: 'Comprender por qué S3 bucket, Azure container y GCP bucket resuelven el mismo problema: guardar archivos como objetos.',
      lab: 'Crea hola.txt, súbelo a S3, Azure Blob y GCP Cloud Storage, descárgalo y compara el contenido.',
      objectives: ['Explicar objeto, key, metadata y contenedor.', 'Subir y descargar archivos en tres proveedores.', 'Verificar integridad con el archivo descargado.'],
      concepts: ['S3 bucket', 'Azure Blob container', 'GCP Cloud Storage', 'object key', 'metadata'],
      cloud: 'S3 / Blob Storage / Cloud Storage',
    },
    {
      title: 'Versionado, lifecycle y evidencia',
      level: 'Medio',
      minutes: 45,
      focus: 'Aprender qué ocurre cuando subes dos veces el mismo archivo y cómo versionado evita pérdidas accidentales.',
      lab: 'Activa versionado en S3, sube dos versiones de hola.txt y lista versiones con aws s3api list-object-versions.',
      objectives: ['Detectar sobrescritura de objetos.', 'Leer versiones anteriores.', 'Crear evidencia clara para el cuaderno.'],
      concepts: ['versionado', 'lifecycle', 'sobrescritura', 'retención', 'evidencia'],
    },
  ],
  2: [
    {
      title: 'Colas, mensajes y consumidores',
      level: 'Básico',
      minutes: 45,
      focus: 'Separar productor y consumidor para que una app no dependa de que todo responda al mismo tiempo.',
      lab: 'Crea una cola SQS, envía un mensaje, recíbelo, observa el ReceiptHandle y elimínalo.',
      objectives: ['Diferenciar enviar, recibir y borrar.', 'Entender visibility timeout.', 'Explicar por qué una cola ayuda cuando un servicio falla.'],
      concepts: ['SQS', 'Service Bus', 'Pub/Sub subscription', 'producer', 'consumer', 'ReceiptHandle'],
      cloud: 'SQS / Service Bus / Pub/Sub',
    },
    {
      title: 'Idempotencia, FIFO y DLQ',
      level: 'Avanzado',
      minutes: 55,
      focus: 'Diseñar consumidores que no dañen datos aunque un mensaje llegue dos veces.',
      lab: 'Crea una cola FIFO y una DLQ; procesa el mismo mensaje dos veces sin duplicar el resultado.',
      objectives: ['Explicar at-least-once delivery.', 'Usar una DLQ para errores repetidos.', 'Crear una clave idempotente.'],
      concepts: ['FIFO', 'DLQ', 'idempotencia', 'MessageGroupId', 'MaxReceiveCount'],
    },
  ],
  3: [
    {
      title: 'Modelado NoSQL por patrones de acceso',
      level: 'Medio',
      minutes: 55,
      focus: 'Diseñar DynamoDB, Cosmos DB o Firestore pensando primero en las consultas que la app necesita responder.',
      lab: 'Crea tabla Tareas con PK/SK, inserta una tarea por usuario y consulta con Query, no con Scan.',
      objectives: ['Elegir partition key y sort key.', 'Evitar Scan como solución principal.', 'Crear datos con estructura consultable.'],
      concepts: ['DynamoDB', 'Cosmos DB', 'Firestore', 'partition key', 'sort key', 'Query vs Scan'],
      cloud: 'DynamoDB / Cosmos DB / Firestore',
    },
    {
      title: 'GSI, TTL y escrituras condicionales',
      level: 'Avanzado',
      minutes: 60,
      focus: 'Agregar índices y reglas para consultar por estado, evitar duplicados y expirar datos temporales.',
      lab: 'Agrega GSI por estado, escribe con condition-expression y configura TTL para tareas temporales.',
      objectives: ['Crear un GSI útil.', 'Evitar duplicados con condición.', 'Distinguir dato permanente de dato temporal.'],
      concepts: ['GSI', 'TTL', 'conditional expression', 'DynamoDB Streams'],
    },
  ],
  4: [
    {
      title: 'Secretos fuera del código',
      level: 'Básico',
      minutes: 45,
      focus: 'Mover passwords y tokens fuera del repositorio para que la app lea configuración segura en tiempo de ejecución.',
      lab: 'Crea un secreto en Secrets Manager, léelo por CLI y luego desde Python o Node.js.',
      objectives: ['Identificar qué es un secreto.', 'Leer secretos sin hardcodear valores.', 'Diferenciar secreto de configuración pública.'],
      concepts: ['Secrets Manager', 'Key Vault', 'Secret Manager', 'SSM Parameter Store', 'least privilege'],
      cloud: 'AWS Secrets / Azure Key Vault / GCP Secret Manager',
    },
    {
      title: 'KMS, rotación y permisos mínimos',
      level: 'Avanzado',
      minutes: 50,
      focus: 'Entender cifrado de sobre, rotación y permisos necesarios para leer solo el secreto correcto.',
      lab: 'Cifra un archivo pequeño con KMS, descífralo y documenta qué permiso sería necesario en producción.',
      objectives: ['Explicar envelope encryption.', 'Reconocer permisos excesivos.', 'Definir una política mínima de lectura.'],
      concepts: ['KMS', 'rotación', 'IAM policy', 'envelope encryption'],
    },
  ],
  5: [
    {
      title: 'Primera función serverless',
      level: 'Medio',
      minutes: 55,
      focus: 'Crear una función pequeña, empaquetarla, desplegarla e invocarla sin administrar servidores.',
      lab: 'Crea handler.py, genera function.zip, despliega Lambda e invócala guardando output.json.',
      objectives: ['Entender handler, event y context.', 'Empaquetar código mínimo.', 'Leer logs de ejecución.'],
      concepts: ['Lambda', 'Azure Functions', 'handler', 'event payload', 'context', 'CloudWatch Logs'],
      cloud: 'Lambda / Azure Functions',
    },
    {
      title: 'Variables, cold start y errores',
      level: 'Avanzado',
      minutes: 50,
      focus: 'Configurar ambiente, medir latencia inicial y diagnosticar errores con logs.',
      lab: 'Agrega una variable TABLA a Lambda, fuerza un error controlado y búscalo en logs.',
      objectives: ['Usar variables de entorno.', 'Explicar cold start.', 'Encontrar errores por log group.'],
      concepts: ['environment variables', 'cold start', 'reserved concurrency', 'log group'],
    },
  ],
  6: [
    {
      title: 'API REST conectada a Lambda',
      level: 'Medio',
      minutes: 60,
      focus: 'Exponer funciones como endpoints HTTP y entender recursos, métodos, stages y deployments.',
      lab: 'Crea API Gateway, recurso /tareas, método POST, integración proxy y prueba con curl.',
      objectives: ['Diferenciar recurso, método y stage.', 'Conectar API Gateway a Lambda.', 'Probar con curl desde terminal.'],
      concepts: ['API Gateway', 'REST API', 'HTTP API', 'stage', 'deployment', 'proxy integration'],
    },
    {
      title: 'CORS, authorizer y errores HTTP',
      level: 'Avanzado',
      minutes: 50,
      focus: 'Preparar la API para clientes reales con CORS, autorización y respuestas de error claras.',
      lab: 'Agrega CORS, valida un token simulado y devuelve errores 400/401/500 según el caso.',
      objectives: ['Explicar CORS sin memorizarlo.', 'Distinguir autenticación de autorización.', 'Responder errores con JSON útil.'],
      concepts: ['CORS', 'authorizer', 'status code', 'curl', 'JSON error'],
    },
  ],
  7: [
    {
      title: 'Fan-out con SNS y colas',
      level: 'Medio',
      minutes: 55,
      focus: 'Publicar un evento una vez y entregarlo a varios consumidores sin acoplarlos.',
      lab: 'Crea topic SNS, suscribe dos colas SQS, publica un mensaje y verifica que ambas reciben copia.',
      objectives: ['Diferenciar topic de cola.', 'Explicar fan-out.', 'Validar entrega múltiple.'],
      concepts: ['SNS', 'SQS subscription', 'fan-out', 'topic', 'subscriber'],
      cloud: 'SNS / EventBridge / Azure Event Hubs',
    },
    {
      title: 'EventBridge y ruteo por reglas',
      level: 'Avanzado',
      minutes: 60,
      focus: 'Enviar eventos con source/detailType y enrutar solo los que cumplen un patrón.',
      lab: 'Crea event bus, regla por source mi.app y publica TareaCreada con put-events.',
      objectives: ['Diseñar eventos con contrato.', 'Filtrar por patrón.', 'Comparar SNS y EventBridge.'],
      concepts: ['EventBridge', 'event bus', 'event pattern', 'scheduler', 'DetailType'],
    },
  ],
  8: [
    {
      title: 'Logs útiles y correlation ID',
      level: 'Medio',
      minutes: 45,
      focus: 'Registrar eventos que permitan encontrar una falla sin adivinar.',
      lab: 'Crea log group, envía logs con request_id y filtra solo ERROR.',
      objectives: ['Crear log group y stream.', 'Usar correlation ID.', 'Filtrar errores por patrón.'],
      concepts: ['CloudWatch Logs', 'log group', 'log stream', 'correlation ID', 'filter pattern'],
    },
    {
      title: 'Métricas, alarmas y dashboard',
      level: 'Avanzado',
      minutes: 55,
      focus: 'Convertir logs en señales accionables antes de que el usuario reporte el fallo.',
      lab: 'Crea metric filter de errores, alarma y dashboard simple.',
      objectives: ['Crear métrica desde logs.', 'Configurar alarma por umbral.', 'Definir qué mirar primero en un incidente.'],
      concepts: ['metric filter', 'alarm', 'dashboard', 'threshold', 'incident response'],
    },
  ],
  9: [
    {
      title: 'PostgreSQL real con RDS local',
      level: 'Medio',
      minutes: 60,
      focus: 'Crear una instancia relacional, conectarte con psql y ejecutar SQL básico.',
      lab: 'Crea RDS PostgreSQL, espera disponibilidad, toma endpoint y crea tabla tareas.',
      objectives: ['Conectarse con psql.', 'Crear tabla e insertar filas.', 'Diferenciar RDS de una base embebida.'],
      concepts: ['RDS', 'PostgreSQL', 'endpoint', 'psql', 'connection string', 'migration'],
    },
    {
      title: 'Snapshots, restore y elección SQL vs NoSQL',
      level: 'Avanzado',
      minutes: 55,
      focus: 'Practicar respaldo y recuperación mientras comparas relaciones SQL contra acceso NoSQL.',
      lab: 'Crea snapshot, restaura otra instancia y compara consulta SQL con consulta DynamoDB.',
      objectives: ['Crear y restaurar snapshot.', 'Explicar cuándo elegir SQL.', 'Documentar plan de respaldo.'],
      concepts: ['snapshot', 'restore', 'relaciones', 'transacciones', 'backup'],
    },
  ],
  10: [
    {
      title: 'Imagen Docker, ECR y task definition',
      level: 'Avanzado',
      minutes: 65,
      focus: 'Empaquetar una API, publicarla en registro local y describir cómo ECS la ejecuta.',
      lab: 'docker build, aws ecr create-repository, docker tag, docker push y task definition ECS.',
      objectives: ['Construir imagen OCI.', 'Subir imagen a ECR.', 'Definir CPU, memoria, puerto y variables.'],
      concepts: ['Dockerfile', 'OCI image', 'ECR', 'ECS task definition', 'container port'],
      cloud: 'ECR / ECS / Cloud Run',
    },
    {
      title: 'Servicio ECS y comparación con Cloud Run',
      level: 'Master',
      minutes: 55,
      focus: 'Ejecutar la app como servicio y comparar el modelo con Cloud Run de GCP.',
      lab: 'Crea cluster ECS, servicio deseado=1 y documenta qué cambiaría en Cloud Run.',
      objectives: ['Diferenciar task y service.', 'Entender desired count.', 'Comparar ECS, Fargate y Cloud Run.'],
      concepts: ['ECS cluster', 'service', 'desired count', 'Fargate', 'Cloud Run'],
    },
  ],
  11: [
    {
      title: 'Infraestructura como código sin magia',
      level: 'Avanzado',
      minutes: 60,
      focus: 'Definir recursos en archivo, aplicarlos y revisar diferencias antes de cambiar infraestructura.',
      lab: 'Crea template CloudFormation para S3 + SQS y aplícalo contra el emulador de cloud local.',
      objectives: ['Leer YAML de infraestructura.', 'Crear stack reproducible.', 'Entender create/update/delete.'],
      concepts: ['CloudFormation', 'Terraform', 'IaC', 'stack', 'drift', 'plan'],
    },
    {
      title: 'Parámetros, outputs y environments',
      level: 'Master',
      minutes: 55,
      focus: 'Separar dev/stage/prod con parámetros y exportar outputs consumibles por la app.',
      lab: 'Agrega parámetros BucketName y QueueName, outputs con ARN y endpoint.',
      objectives: ['Usar parámetros.', 'Leer outputs.', 'Evitar valores hardcodeados.'],
      concepts: ['parameters', 'outputs', 'environment', 'ARN', 'drift detection'],
    },
  ],
  12: [
    {
      title: 'Workflow con Step Functions',
      level: 'Avanzado',
      minutes: 60,
      focus: 'Orquestar varios pasos con estado visible en lugar de encadenar funciones a ciegas.',
      lab: 'Crea una state machine con Task, Choice y Fail; ejecuta un flujo exitoso y uno fallido.',
      objectives: ['Diferenciar orquestación de coreografía.', 'Leer historial de ejecución.', 'Modelar errores esperados.'],
      concepts: ['Step Functions', 'state machine', 'Task', 'Choice', 'Retry', 'Catch'],
    },
    {
      title: 'Retry, compensación y trazabilidad',
      level: 'Master',
      minutes: 55,
      focus: 'Diseñar reintentos controlados y pasos de compensación cuando una parte del proceso falla.',
      lab: 'Agrega Retry con backoff y una rama de compensación que escriba evento de fallo.',
      objectives: ['Configurar retry seguro.', 'Explicar compensación.', 'Documentar trazabilidad del flujo.'],
      concepts: ['backoff', 'compensation', 'execution history', 'timeout'],
    },
  ],
  13: [
    {
      title: 'Streams: eventos ordenados y retención',
      level: 'Avanzado',
      minutes: 60,
      focus: 'Procesar eventos como flujo continuo, no como cola simple.',
      lab: 'Crea stream Kinesis, publica registros con partition key y consume lotes.',
      objectives: ['Diferenciar cola y stream.', 'Usar partition key.', 'Entender retención y orden por shard.'],
      concepts: ['Kinesis', 'MSK', 'Kafka', 'shard', 'partition key', 'retention'],
      cloud: 'Kinesis / MSK / Kafka',
    },
    {
      title: 'Kafka/MSK y consumidores resilientes',
      level: 'Master',
      minutes: 60,
      focus: 'Comparar Kinesis con Kafka y diseñar consumidores que reanuden desde offsets.',
      lab: 'Documenta topic, partition, consumer group y offset; simula reprocesamiento de eventos.',
      objectives: ['Explicar consumer group.', 'Controlar reprocesamiento.', 'Comparar offset y sequence number.'],
      concepts: ['Kafka topic', 'partition', 'consumer group', 'offset', 'checkpoint'],
    },
  ],
  14: [
    {
      title: 'Autenticación con Cognito',
      level: 'Avanzado',
      minutes: 55,
      focus: 'Crear usuarios, iniciar sesión y proteger una API con token.',
      lab: 'Crea user pool, registra usuario, obtiene JWT y llama API Gateway con Authorization Bearer.',
      objectives: ['Diferenciar login y permisos.', 'Leer claims básicos de JWT.', 'Proteger endpoint.'],
      concepts: ['Cognito', 'user pool', 'JWT', 'claims', 'authorizer'],
    },
    {
      title: 'Roles, scopes y errores de seguridad',
      level: 'Master',
      minutes: 50,
      focus: 'Evitar endpoints abiertos por accidente y responder 401/403 correctamente.',
      lab: 'Crea rutas admin/user, valida scope simulado y prueba token ausente, inválido y válido.',
      objectives: ['Diferenciar 401 y 403.', 'Validar scopes.', 'Documentar amenaza básica.'],
      concepts: ['roles', 'scopes', 'least privilege', '401', '403'],
    },
  ],
  15: [
    {
      title: 'Analytics con Athena y BigQuery',
      level: 'Avanzado',
      minutes: 60,
      focus: 'Consultar archivos como tablas para responder preguntas de negocio sin montar una base transaccional.',
      lab: 'Sube CSV a S3/GCS, define tabla externa y ejecuta una consulta de conteo por estado.',
      objectives: ['Diferenciar dato transaccional y analítico.', 'Crear tabla externa.', 'Guardar consulta reproducible.'],
      concepts: ['Athena', 'BigQuery', 'DuckDB', 'external table', 'CSV', 'Parquet'],
      cloud: 'Athena / BigQuery',
    },
    {
      title: 'Particiones, formatos y costo mental',
      level: 'Master',
      minutes: 55,
      focus: 'Entender cómo particiones y formatos columnares reducen lectura y aceleran consultas.',
      lab: 'Divide datos por fecha, consulta una partición y compara CSV contra Parquet.',
      objectives: ['Crear partición por fecha.', 'Explicar Parquet.', 'Evitar consultas que lean todo.'],
      concepts: ['partition', 'Parquet', 'scan', 'query planning', 'dataset'],
    },
  ],
  16: [
    {
      title: 'IA generativa con Bedrock local',
      level: 'Master',
      minutes: 60,
      focus: 'Invocar un modelo, controlar prompt, entrada y salida, y registrar la decisión tomada.',
      lab: 'Crea una función que reciba una tarea y pida a Bedrock resumirla en formato JSON.',
      objectives: ['Separar prompt de código.', 'Validar salida JSON.', 'Registrar entrada/salida sin secretos.'],
      concepts: ['Bedrock', 'prompt', 'model invocation', 'JSON schema', 'guardrails'],
      cloud: 'Bedrock / Vertex AI / Azure AI',
    },
    {
      title: 'RAG pequeño y evaluación',
      level: 'Master',
      minutes: 60,
      focus: 'Usar documentos del proyecto como contexto y evaluar si la respuesta fue útil.',
      lab: 'Carga 3 fragmentos de documentación, pregunta por un error común y compara respuesta con fuente.',
      objectives: ['Explicar contexto.', 'Detectar alucinación.', 'Crear una prueba manual de calidad.'],
      concepts: ['RAG', 'embedding', 'context window', 'evaluation', 'hallucination'],
    },
  ],
  17: [
    {
      title: 'Proyecto final: gestor de tareas cloud local',
      level: 'Master',
      minutes: 90,
      focus: 'Construir una app pequeña pero completa que obligue a usar los servicios aprendidos.',
      lab: 'Implementa API de tareas con auth, Lambda/API Gateway, DynamoDB/RDS, S3, SQS/SNS, logs, IaC y contenedor.',
      objectives: ['Integrar servicios sin copiar ejemplos aislados.', 'Documentar arquitectura y evidencias.', 'Crear una demo reproducible desde cero.'],
      concepts: ['arquitectura', 'integración', 'evidencia', 'README', 'demo reproducible'],
    },
    {
      title: 'Rúbrica de experto y entrega',
      level: 'Master',
      minutes: 75,
      focus: 'Validar el proyecto con criterios claros: funciona, se entiende, se observa, se despliega y se puede reconstruir.',
      lab: 'Entrega README, comandos, capturas, exportación de progreso y lista de fallos corregidos.',
      objectives: ['Evaluar con rúbrica.', 'Explicar decisiones técnicas.', 'Preparar siguiente iteración profesional.'],
      concepts: ['rúbrica', 'arquitectura', 'observabilidad', 'seguridad', 'portabilidad'],
    },
  ],
  18: [
    {
      title: 'Mapa comparativo AWS, Azure y GCP',
      level: 'Básico',
      minutes: 55,
      focus: 'Ubicar equivalencias para no pensar que cada nube es un mundo separado.',
      lab: 'Crea una tabla: S3=Blob=Cloud Storage, SQS=Service Bus/PubSub, DynamoDB=Cosmos/Firestore, Lambda=Functions/Cloud Functions.',
      objectives: ['Nombrar equivalencias principales.', 'Evitar aprender solo AWS.', 'Elegir servicio por problema, no por marca.'],
      concepts: ['equivalencias cloud', 'Blob Storage', 'Cloud Storage', 'Service Bus', 'Pub/Sub', 'Cloud Functions'],
      cloud: 'AWS / Azure / GCP',
    },
    {
      title: 'Laboratorio multi-cloud obligatorio',
      level: 'Master',
      minutes: 75,
      focus: 'Repetir el mismo flujo en tres nubes locales: archivo, evento, función y evidencia.',
      lab: 'Sube archivo, publica evento y ejecuta una función equivalente en AWS local, Azure local y GCP local.',
      objectives: ['Comparar comandos reales.', 'Registrar diferencias de endpoint.', 'Construir criterio multi-cloud.'],
      concepts: ['multi-cloud', 'emulador Azure local', 'emulador GCP local', 'endpoint', 'SDK'],
      cloud: 'AWS + Azure + GCP',
    },
  ],
};

const levelFromCourse = (level: CourseModule['level']): Level => {
  if (level === 'Fundamentos') return 'Básico';
  if (level === 'Aplicación') return 'Medio';
  if (level === 'Integración') return 'Avanzado';
  return 'Master';
};

const commandFrom = (module: CourseModule): string =>
  module.challenges.find(challenge => challenge.includes('—'))?.split('—').pop()?.trim()
  ?? module.challenges[0]
  ?? 'cloud local status';

const commandOnly = (text: string): string => text.includes('—')
  ? text.split('—').pop()?.trim() || text
  : text;

const labStepsFor = (module: CourseModule, blueprint: TopicBlueprint): LabStep[] => {
  const primary = commandOnly(blueprint.lab);
  const fallbackCommand = commandFrom(module);
  const checks = module.challenges.map(commandOnly).filter(Boolean);

  return [
    {
      title: 'Preparar entorno',
      command: 'docker version',
      verify: 'Debe mostrar una versión de Docker. Después confirma manualmente que el emulador local elegido está encendido.',
    },
    {
      title: 'Ejecutar paso principal',
      command: primary || fallbackCommand,
      verify: 'Debe crear, consultar, invocar o modificar el recurso del tema. Copia la salida importante en tu respuesta.',
    },
    {
      title: 'Comprobar evidencia',
      command: checks[1] ?? checks[0] ?? fallbackCommand,
      verify: `La evidencia mínima es: ${module.deliverable}`,
    },
  ];
};

const fallbackBlueprints = (module: CourseModule): TopicBlueprint[] => [
  {
    title: `Fundamentos de ${module.shortTitle}`,
    level: levelFromCourse(module.level),
    minutes: 35,
    focus: module.description,
    lab: module.challenges[0] ?? commandFrom(module),
    objectives: [
      `Explicar qué problema resuelve ${module.shortTitle}.`,
      `Ejecutar un paso verificable con ${module.services.join(', ') || 'el emulador de cloud local'}.`,
      'Registrar evidencia en tu cuaderno.',
    ],
    concepts: module.concepts.slice(0, 6),
  },
  {
    title: `Laboratorio guiado de ${module.shortTitle}`,
    level: module.level === 'Experto' ? 'Master' : 'Avanzado',
    minutes: 50,
    focus: `Aplicar ${module.shortTitle} dentro de un flujo real y comprobar que el resultado existe.`,
    lab: module.challenges[1] ?? module.challenges[0] ?? commandFrom(module),
    objectives: [
      'Ejecutar comandos en orden.',
      'Leer la salida antes de avanzar.',
      'Corregir al menos un error común.',
    ],
    concepts: module.concepts.slice(0, 6),
  },
];

const buildTopic = (module: CourseModule, blueprint: TopicBlueprint, index: number): Topic => {
  const id = `m${module.id}-tema-${index + 1}`;
  const command = blueprint.lab || commandFrom(module);
  const serviceList = blueprint.cloud ?? (module.services.join(' / ') || module.shortTitle);
  const code = [
    '# Antes de ejecutar',
    '# 1. Abre la terminal.',
    '# 2. Verifica que Docker y Cloud local estén encendidos.',
    '# 3. Copia un comando a la vez y lee la salida.',
    '',
    '# Laboratorio',
    command,
    '',
    '# Evidencia mínima esperada',
    module.deliverable,
  ].join('\n');

  return {
    id,
    moduleId: module.id,
    title: blueprint.title,
    level: blueprint.level,
    minutes: blueprint.minutes,
    intro: [
      blueprint.focus,
      'La regla de estudio es simple: lees lo esencial, ejecutas un paso pequeño, verificas con evidencia y escribes tu explicación con tus propias palabras.',
    ],
    objectives: blueprint.objectives,
    theory: [
      {
        title: 'Qué debes entender',
        body: `${module.shortTitle} pertenece al nivel ${module.level}. El punto no es memorizar nombres, sino reconocer el problema que resuelve y cómo se comprueba en local.`,
        bullets: blueprint.concepts,
      },
      {
        title: 'Cómo se aplica',
        body: `Este tema se practica con ${serviceList}. Primero haces que funcione en el emulador de cloud local; después comparas el mismo patrón con nube real sin gastar dinero ni tocar producción.`,
        bullets: [
          `Laboratorio: ${blueprint.lab}`,
          `Entrega: ${module.deliverable}`,
          ...module.questions.slice(0, 2).map(question => `Pregunta guía: ${question}`),
        ],
      },
    ],
    comparison: {
      left: blueprint.cloud ?? 'Nube real',
      right: 'el emulador de cloud local',
      leftDetail: 'Requiere cuenta, permisos, costo potencial y limpieza cuidadosa de recursos.',
      rightDetail: 'Permite practicar rápido en localhost, repetir errores y validar comandos sin costo mientras aprendes el patrón.',
    },
    diagram: `Alumno -> Terminal -> localhost -> ${serviceList} -> Evidencia -> Explicación propia`,
    code,
    labSteps: labStepsFor(module, blueprint),
    lineByLine: code.split('\n').slice(0, 6).map((line, index) => `Línea ${index + 1}: ${line || 'separador visual del ejemplo.'}`),
    exercise: `Haz el laboratorio: ${blueprint.lab}. Luego escribe qué comando ejecutaste, qué salida demuestra que funcionó y qué error corregirías si fallara.`,
    expected: [blueprint.lab, ...module.challenges.slice(0, 3)],
    hints: [
      'Si nunca abriste una consola: en Mac usa Spotlight y escribe Terminal; en Windows abre PowerShell; en Linux usa Ctrl+Alt+T.',
      'Ejecuta primero el comando más pequeño posible.',
      'Copia la salida importante, no toda la terminal.',
      'Si falla, lee el error completo antes de cambiar varios comandos a la vez.',
    ],
    commonErrors: [
      'No tener Docker corriendo antes de levantar el emulador de cloud local.',
      'Olvidar el endpoint local o las variables de entorno.',
      'Crear recursos y no verificar que existen.',
      'Copiar comandos sin entender qué parte es nombre, región o identificador.',
    ],
    summary: [
      `${blueprint.title} se aprende ejecutando y verificando.`,
      'La evidencia vale más que decir "me funcionó".',
      'El objetivo final es explicar la decisión técnica, no solo pasar el comando.',
    ],
    resources,
    quiz: (module.questions.length ? module.questions : ['¿Qué problema resuelve este módulo?', '¿Cómo validarías que funcionó?', '¿Qué error esperas encontrar?'])
      .slice(0, 5)
      .map(question => ({ question, answer: 'Debe responderse con evidencia del laboratorio y explicación propia.' })),
  };
};

const diagnosticTopic = (module: CourseModule): Topic => ({
  ...buildTopic(module, fallbackBlueprints(module)[0], 0),
  id: 'm0-diagnostico',
  title: 'Diagnóstico inicial',
  minutes: 35,
  objectives: [
    'Diferenciar endpoint local y endpoint real.',
    'Explicar imagen Docker vs contenedor corriendo.',
    'Reconocer access key, secret key y ARN.',
    'Diferenciar cola, topic, stream y event bus.',
    'Distinguir persistencia en disco de memoria temporal.',
  ],
  exercise: 'Responde las 5 preguntas de diagnóstico antes de iniciar el laboratorio. No busques la respuesta: escribe tu hipótesis.',
  quiz: [
    { question: '¿Qué diferencia hay entre un endpoint local y AWS real?', answer: 'El endpoint local apunta a un emulador en localhost; AWS real apunta a servicios administrados con cuenta, permisos y costo.' },
    { question: '¿Qué diferencia hay entre imagen Docker y contenedor?', answer: 'La imagen es la plantilla; el contenedor es una ejecución viva de esa plantilla.' },
    { question: '¿Para qué sirven access key, secret key y ARN?', answer: 'Las keys autentican llamadas; el ARN identifica recursos en formato estándar.' },
    { question: '¿Cuándo usar cola, topic, stream o event bus?', answer: 'Cola para trabajo pendiente, topic para fan-out, stream para eventos ordenados/retención, event bus para ruteo por reglas.' },
    { question: '¿Qué diferencia hay entre persistencia y memoria?', answer: 'Persistencia sobrevive reinicios; memoria desaparece al detener el proceso/contenedor.' },
  ],
});

const moduleToStudy = (module: CourseModule): StudyModule => ({
  id: `modulo-${module.id}`,
  title: `${module.id}. ${module.shortTitle}`,
  description: module.description,
  source: module,
  topics: module.id === 0
    ? [diagnosticTopic(module), ...(topicBlueprints[module.id] ?? fallbackBlueprints(module)).map((blueprint, index) => buildTopic(module, blueprint, index + 1))]
    : (topicBlueprints[module.id] ?? fallbackBlueprints(module)).map((blueprint, index) => buildTopic(module, blueprint, index)),
});

const azureGcpSource: CourseModule = {
  id: 18,
  title: 'Azure y GCP con el emulador de cloud local',
  shortTitle: 'Azure y GCP',
  level: 'Integración',
  duration: '2 h',
  color: '#2563eb',
  description: 'Módulo dedicado a cerrar la brecha multi-cloud: equivalencias, comandos y laboratorios comparables entre AWS, Azure y GCP usando el emulador de cloud local.',
  concepts: ['equivalencias cloud', 'emulador Azure local', 'emulador GCP local', 'Blob Storage', 'Cloud Storage', 'Service Bus', 'Pub/Sub', 'Cosmos DB', 'Firestore'],
  challenges: [
    'Compara servicios — crea una tabla local de equivalencias AWS/Azure/GCP',
    'Ejecuta flujo multi-cloud — sube archivo, publica evento y registra evidencia',
  ],
  questions: [
    '¿Qué servicio de Azure equivale a S3?',
    '¿Qué servicio de GCP usarías para pub/sub?',
    '¿Por qué aprender el patrón antes que la marca?',
  ],
  services: ['Azure Blob Storage', 'Azure Service Bus', 'GCP Cloud Storage', 'GCP Pub/Sub', 'Firestore'],
  deliverable: 'Tabla comparativa AWS/Azure/GCP y laboratorio multi-cloud con evidencia.',
  clouds: ['aws', 'azure', 'gcp'],
};

@Component({
  selector: 'app-study-page',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './study-page.html',
  styleUrl: './study-page.scss',
})
export class StudyPageComponent implements OnInit {
  readonly icons = {
    BookOpen,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Circle,
    ClipboardCheck,
    Cloud,
    Code2,
    Download,
    GraduationCap,
    Layers,
    Monitor,
    Moon,
    PlayCircle,
    Route,
    Search,
    Sun,
    Terminal,
    Trophy,
  };
  readonly standards = studyStandards;
  readonly modules: StudyModule[] = [...COURSE_MODULES, azureGcpSource].map(moduleToStudy);
  readonly guidedSteps = GUIDED_STEPS;
  readonly tracks = TRACKS;
  readonly lmsStats: LmsStat[] = [
    { value: '45', label: 'pasos guiados' },
    { value: '19', label: 'módulos cloud' },
    { value: '3', label: 'nubes locales' },
    { value: '12', label: 'rutas completas' },
  ];
  readonly methodLayers: MethodLayer[] = [
    { number: '01', title: 'El qué', goal: 'Entender el concepto', detail: 'Definición clara, analogía y vocabulario mínimo antes de tocar comandos.' },
    { number: '02', title: 'El cómo', goal: 'Verlo funcionando', detail: 'Comando o código pequeño, escrito por el alumno y explicado línea por línea.' },
    { number: '03', title: 'El por qué', goal: 'Tomar decisiones', detail: 'Cuándo conviene, cuándo no, límites, costo, seguridad y alternativas.' },
    { number: '04', title: 'El problema', goal: 'Practicar sin copiar', detail: 'Reto guiado, errores comunes, evidencia y explicación propia.' },
    { number: '05', title: 'El maestro', goal: 'Pensar profesionalmente', detail: 'Diseño, trade-offs, entrevistas, arquitectura y enseñanza a otra persona.' },
  ];
  readonly providerCards: ProviderCard[] = [
    { name: 'AWS local', port: '4566', services: 'S3, SQS, DynamoDB, Lambda, API Gateway, RDS, ECS/EKS, CloudWatch', focus: 'Base principal para entender servicios cloud y endpoint local.' },
    { name: 'Azure local', port: '4577', services: 'Blob, Queue, Table Storage, Cosmos DB, Functions, Key Vault, Event Hubs', focus: 'Comparar nombres y patrones con Azure sin pagar recursos reales.' },
    { name: 'GCP local', port: '4588', services: 'Cloud Storage, Pub/Sub, Firestore, Datastore, Cloud Functions', focus: 'Repetir los mismos problemas en Google Cloud con CLI y SDK.' },
  ];
  readonly setupCards: SetupCard[] = [
    { os: 'Mac', shortcut: 'Cmd + Espacio → Terminal', steps: ['Instala Docker Desktop.', 'Instala VS Code y Node.js LTS.', 'Usa zsh y ejecuta un comando a la vez.'] },
    { os: 'Windows', shortcut: 'Win + X → Terminal', steps: ['Instala Docker Desktop con WSL2.', 'Usa PowerShell para comandos Windows.', 'Usa WSL cuando necesites comandos Linux.'] },
    { os: 'Linux', shortcut: 'Ctrl + Alt + T', steps: ['Instala Docker Engine.', 'Agrega tu usuario al grupo docker si hace falta.', 'Usa tu gestor de paquetes para CLI y Git.'] },
  ];
  readonly languageLabs: LanguageLab[] = [
    { name: 'JavaScript / Node.js', use: 'SDKs cloud, APIs, colas y funciones.', file: 'app.mjs' },
    { name: 'Python', use: 'Automatización, boto3, datos y scripts claros.', file: 'demo.py' },
    { name: 'Java / Spring Boot', use: 'Backend empresarial, APIs y microservicios.', file: 'Application.java' },
    { name: 'TypeScript / Angular', use: 'Frontend, dashboards y clientes web.', file: 'app.ts' },
    { name: 'Dart / Flutter', use: 'App móvil para consumir la API final.', file: 'main.dart' },
    { name: 'Kotlin / Android', use: 'Cliente Android y bases sólidas móviles.', file: 'MainActivity.kt' },
  ];
  readonly projectMilestones = [
    'M1-M3: archivos, colas y NoSQL para crear tareas y eventos.',
    'M4-M8: secretos, funciones, API, eventos y observabilidad.',
    'M9-M12: RDS, contenedores, IaC y workflows reproducibles.',
    'M13-M17: streams, auth, analytics, IA y proyecto multi-nube.',
  ];

  selectedModuleId = this.modules[0].id;
  selectedTopicId = this.modules[0].topics[0].id;
  selectedStepIndex = 0;
  tab: Tab = 'teoria';
  query = '';
  dark = false;
  examMode = false;
  examStartedAt: number | null = null;
  mobileSidebar = false;
  completed = new Set<string>();
  verifiedLabSteps = new Set<string>();
  completedGuidedSteps = new Set<number>();
  answers: Record<string, string> = {};
  editorDrafts: Record<string, string> = {};
  guidedAnswers: Record<number, string> = {};
  guidedEditors: Record<number, string> = {};
  answer = '';
  editorCode = '';
  guidedAnswer = '';
  guidedEditor = '';
  output = '';
  guidedOutput = '';

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.completed = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
    this.verifiedLabSteps = new Set(JSON.parse(localStorage.getItem(LAB_KEY) || '[]'));
    this.completedGuidedSteps = new Set(JSON.parse(localStorage.getItem(STEP_KEY) || '[]'));
    this.answers = JSON.parse(localStorage.getItem(ANSWERS_KEY) || '{}');
    this.editorDrafts = JSON.parse(localStorage.getItem(EDITOR_KEY) || '{}');
    this.guidedAnswers = JSON.parse(localStorage.getItem(STEP_ANSWERS_KEY) || '{}');
    this.guidedEditors = JSON.parse(localStorage.getItem(STEP_EDITORS_KEY) || '{}');
    this.dark = localStorage.getItem(THEME_KEY) === 'dark';
    this.answer = this.answers[this.selectedTopicId] ?? '';
    this.editorCode = this.editorDrafts[this.selectedTopicId] ?? this.selectedTopic.code;
    const firstPendingIndex = this.guidedSteps.findIndex(step => !this.completedGuidedSteps.has(step.id));
    this.selectedStepIndex = firstPendingIndex >= 0 ? firstPendingIndex : 0;
    this.loadGuidedStepState();
  }

  get selectedModule(): StudyModule {
    return this.modules.find(module => module.id === this.selectedModuleId) ?? this.modules[0];
  }

  get selectedTopic(): Topic {
    return this.selectedModule.topics.find(topic => topic.id === this.selectedTopicId) ?? this.selectedModule.topics[0];
  }

  get currentStep(): CourseStep {
    return this.guidedSteps[this.selectedStepIndex] ?? this.guidedSteps[0];
  }

  get guidedStepProgress(): number {
    return Math.round((this.completedGuidedSteps.size / this.guidedSteps.length) * 100);
  }

  get guidedCompletionText(): string {
    return `${this.completedGuidedSteps.size}/${this.guidedSteps.length}`;
  }

  currentStepPercent(): number {
    return Math.round(((this.selectedStepIndex + 1) / this.guidedSteps.length) * 100);
  }

  stepSections(): StepSection[] {
    return this.guidedSteps.reduce<StepSection[]>((sections, step) => {
      const current = sections.at(-1);
      if (current?.module === step.module) {
        current.steps.push(step);
      } else {
        sections.push({ module: step.module, steps: [step] });
      }
      return sections;
    }, []);
  }

  featuredModules(): StudyModule[] {
    return this.modules.slice(0, 8);
  }

  courseDuration(): string {
    const hours = COURSE_MODULES.reduce((sum, module) => {
      const match = module.duration.match(/(\d+(?:[.,]\d+)?)/);
      return sum + (match ? Number(match[1].replace(',', '.')) : 0);
    }, 0);
    return `${Math.round(hours)} h`;
  }

  currentStepStatus(stepId: number): string {
    if (this.completedGuidedSteps.has(stepId)) return 'Completado';
    if (this.currentStep.id === stepId) return 'Actual';
    return 'Pendiente';
  }

  visibleGuidedSteps(): { step: CourseStep; index: number }[] {
    const windowSize = 5;
    const maxStart = Math.max(0, this.guidedSteps.length - windowSize);
    const start = Math.min(Math.max(0, this.selectedStepIndex - 2), maxStart);
    return this.guidedSteps
      .slice(start, start + windowSize)
      .map((step, offset) => ({ step, index: start + offset }));
  }

  guidedLevelLabel(): string {
    const completed = this.completedGuidedSteps.size;
    if (completed >= this.guidedSteps.length) return 'Curso completo';
    if (completed >= 30) return 'Nivel avanzado';
    if (completed >= 15) return 'Nivel intermedio';
    if (completed >= 5) return 'En marcha';
    return 'Inicio';
  }

  stepDeepNotes(): string[] {
    const command = this.currentStep.command ?? '';
    const notes = [
      `Qué estás construyendo: ${this.currentStep.explanation}`,
      'Qué debes poder explicar después: qué problema resuelve el paso, qué comando lo ejecuta y qué evidencia demuestra que funcionó.',
      `Cómo conectarlo con el curso: este paso pertenece a ${this.currentStep.module}; no es teoría aislada, prepara una pieza que usarás en los pasos siguientes.`,
      this.currentStep.command
        ? 'Qué no debes hacer: no ejecutes el comando como ritual. Identifica primero herramienta, recurso, nombre, endpoint y salida esperada.'
        : 'Qué no debes hacer: no memorices la definición. Construye una explicación propia y relaciónala con un caso real.',
      `Pregunta de control: si alguien te pide probar que entendiste, debes poder responder: "${this.currentStep.question}" sin mirar la solución.`,
    ];
    if (command.includes('--endpoint-url')) {
      notes.push('Punto crítico: --endpoint-url obliga a la herramienta a hablar con el emulador de cloud local. Sin eso puedes terminar apuntando a nube real.');
    }
    if (command.includes('docker')) {
      notes.push('Docker no es el objetivo final: es el motor que permite levantar servicios locales repetibles sin ensuciar tu sistema.');
    }
    if (command.includes('aws s3')) {
      notes.push('En S3 siempre piensa en tres piezas: bucket, objeto y key. Si no sabes cuál es cuál, el comando se vuelve memorización vacía.');
    }
    if (command.includes('sqs')) {
      notes.push('En colas importa el ciclo completo: crear cola, enviar mensaje, recibirlo, procesarlo y eliminarlo para que no reaparezca.');
    }
    if (command.includes('dynamodb')) {
      notes.push('En DynamoDB primero decides cómo vas a consultar. La clave no es un detalle: define si tu tabla será fácil o dolorosa de usar.');
    }
    if (command.includes('lambda')) {
      notes.push('En Lambda siempre revisa handler, runtime, paquete zip y logs. La mayoría de errores nacen de uno de esos cuatro puntos.');
    }
    return notes;
  }

  stepChecklist(): string[] {
    if (!this.currentStep.command) {
      return [
        'Puedes explicar el concepto sin repetir palabras al azar.',
        'Puedes dar una analogía propia.',
        'Puedes decir en qué parte del proyecto final usarías este concepto.',
      ];
    }
    return [
      'Copiaste o escribiste el comando completo.',
      'Ejecutaste el comando en una terminal real cuando corresponde.',
      'Comparaste tu salida con la salida esperada.',
      'Pegaste evidencia o explicación en el campo de práctica.',
    ];
  }

  stepCommonMistakes(): string[] {
    const command = this.currentStep.command ?? '';
    const mistakes = [
      'Copiar el comando sin leer qué parte es nombre, puerto, ruta o endpoint.',
      'Cambiar varias cosas a la vez cuando aparece un error.',
    ];
    if (command.includes('localhost')) mistakes.push('Olvidar que localhost significa tu propia máquina, no internet ni AWS real.');
    if (command.includes('4566')) mistakes.push('Tener otro proceso usando el puerto 4566 o no haber levantado el emulador de cloud local antes.');
    if (command.includes('<')) mistakes.push('No reemplazar valores como <API_ID> o <RECEIPT_HANDLE> por el valor real que te dio la terminal.');
    if (command.includes('aws ')) mistakes.push('Olvidar --endpoint-url y ejecutar contra la configuración normal de AWS CLI.');
    return mistakes;
  }

  get filteredModules(): StudyModule[] {
    const query = this.query.trim().toLowerCase();
    if (!query) return this.modules;
    const tokens = query.split(/\s+/).filter(Boolean);
    return this.modules
      .map(module => ({
        ...module,
        topics: module.topics.filter(topic => {
          const haystack = [
            module.title,
            module.description,
            module.source?.concepts.join(' '),
            module.source?.services.join(' '),
            module.source?.clouds?.join(' '),
            topic.title,
            topic.level,
            topic.intro.join(' '),
            topic.objectives.join(' '),
            topic.theory.map(section => `${section.title} ${section.body} ${section.bullets?.join(' ') ?? ''}`).join(' '),
            topic.exercise,
            topic.expected.join(' '),
          ].join(' ').toLowerCase();
          return tokens.every(token => haystack.includes(token));
        }),
      }))
      .filter(module => module.topics.length);
  }

  levelsFor(module: StudyModule): Level[] {
    return ['Básico', 'Medio', 'Avanzado', 'Master'].filter(level => module.topics.some(topic => topic.level === level)) as Level[];
  }

  topicsByLevel(module: StudyModule, level: Level): Topic[] {
    return module.topics.filter(topic => topic.level === level);
  }

  selectTopic(module: StudyModule, topicItem: Topic): void {
    this.saveCurrentAnswer();
    this.saveEditorDraft();
    this.selectedModuleId = module.id;
    this.selectedTopicId = topicItem.id;
    this.tab = 'teoria';
    this.answer = this.answers[topicItem.id] ?? '';
    this.editorCode = this.editorDrafts[topicItem.id] ?? topicItem.code;
    this.output = '';
    this.mobileSidebar = false;
  }

  selectTab(nextTab: Tab): void {
    this.tab = nextTab;
    this.output = '';
    if (nextTab === 'ejemplo') {
      this.editorCode = this.editorDrafts[this.selectedTopicId] ?? this.selectedTopic.code;
    }
  }

  selectGuidedStep(index: number): void {
    this.saveGuidedStepState();
    this.selectedStepIndex = Math.max(0, Math.min(index, this.guidedSteps.length - 1));
    this.loadGuidedStepState();
    this.guidedOutput = '';
    this.mobileSidebar = false;
    this.cdr.detectChanges();
  }

  previousGuidedStep(): void {
    this.selectGuidedStep(this.selectedStepIndex - 1);
  }

  nextGuidedStep(): void {
    this.selectGuidedStep(this.selectedStepIndex + 1);
  }

  isGuidedStepCompleted(stepId: number): boolean {
    return this.completedGuidedSteps.has(stepId);
  }

  toggleGuidedStepComplete(): void {
    if (this.completedGuidedSteps.has(this.currentStep.id)) {
      this.completedGuidedSteps.delete(this.currentStep.id);
    } else {
      this.completedGuidedSteps.add(this.currentStep.id);
    }
    localStorage.setItem(STEP_KEY, JSON.stringify([...this.completedGuidedSteps]));
    this.cdr.detectChanges();
  }

  saveGuidedStepState(): void {
    this.guidedAnswers[this.currentStep.id] = this.guidedAnswer;
    this.guidedEditors[this.currentStep.id] = this.guidedEditor;
    localStorage.setItem(STEP_ANSWERS_KEY, JSON.stringify(this.guidedAnswers));
    localStorage.setItem(STEP_EDITORS_KEY, JSON.stringify(this.guidedEditors));
  }

  loadGuidedStepState(): void {
    this.guidedAnswer = this.guidedAnswers[this.currentStep.id] ?? '';
    this.guidedEditor = this.guidedEditors[this.currentStep.id] ?? this.currentStep.command ?? '';
  }

  runGuidedStep(): void {
    this.saveGuidedStepState();
    if (!this.currentStep.command) {
      this.guidedOutput = [
        'Este paso es conceptual.',
        'La práctica aquí es escribir tu explicación y responder la pregunta.',
      ].join('\n');
      this.cdr.detectChanges();
      return;
    }
    const lines = this.guidedEditor
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));
    const tools = lines.flatMap(line => line.match(/\b(aws|az|gcloud|docker|cloud local|curl|terraform|kubectl|psql|zip|make|cat|echo)\b/g) ?? []);
    this.guidedOutput = [
      'Simulación educativa completada.',
      `Paso ${this.currentStep.id}/${this.guidedSteps.length}: ${this.currentStep.title}.`,
      `Comandos detectados: ${lines.length}.`,
      `Herramientas detectadas: ${[...new Set(tools)].join(', ') || 'ninguna'}.`,
      '',
      'Salida esperada de referencia:',
      this.currentStep.expectedOutput,
    ].join('\n');
    this.cdr.detectChanges();
  }

  verifyGuidedAnswer(): void {
    this.saveGuidedStepState();
    const normalized = this.normalize(this.guidedAnswer);
    const matches = this.currentStep.keywords.filter(keyword => normalized.includes(this.normalize(keyword)));
    if (matches.length >= Math.min(2, this.currentStep.keywords.length)) {
      this.guidedOutput = [
        'Correcto: tu respuesta toca los conceptos clave.',
        `Coincidencias: ${matches.join(', ')}.`,
        `Respuesta esperada: ${this.currentStep.expectedAnswer}`,
      ].join('\n');
      this.cdr.detectChanges();
      return;
    }
    this.guidedOutput = [
      'Todavía falta precisión.',
      `Incluye en tu respuesta ideas como: ${this.currentStep.keywords.slice(0, 5).join(', ')}.`,
      `Guía: ${this.currentStep.expectedAnswer}`,
    ].join('\n');
    this.cdr.detectChanges();
  }

  async copyGuidedCommand(): Promise<void> {
    if (!this.currentStep.command) {
      this.guidedOutput = 'Este paso no tiene comando para copiar.';
      return;
    }
    try {
      await navigator.clipboard?.writeText(this.currentStep.command);
      this.guidedOutput = 'Comando copiado. Pégalo en tu terminal local y compara con la salida esperada.';
    } catch {
      this.guidedOutput = 'No se pudo copiar automáticamente. Selecciona el comando y cópialo manualmente.';
    }
    this.cdr.detectChanges();
  }

  isCompleted(topicId: string): boolean {
    return this.completed.has(topicId);
  }

  moduleProgress(module: StudyModule): number {
    return Math.round((module.topics.filter(topic => this.completed.has(topic.id)).length / module.topics.length) * 100);
  }

  globalProgress(): number {
    const total = this.modules.reduce((sum, module) => sum + module.topics.length, 0);
    return Math.round((this.completed.size / total) * 100);
  }

  currentModuleProgress(): number {
    return this.moduleProgress(this.selectedModule);
  }

  completedModulesCount(): number {
    return this.modules.filter(module => this.moduleProgress(module) === 100).length;
  }

  badgeCatalog(): Badge[] {
    const doneModules = this.completedModulesCount();
    const allModules = this.modules.length;
    return [
      { name: 'Explorador', description: 'Completa 1 módulo completo.', unlocked: doneModules >= 1 },
      { name: 'Constructor', description: 'Completa 5 módulos completos.', unlocked: doneModules >= 5 },
      { name: 'Arquitecto', description: 'Completa 10 módulos completos.', unlocked: doneModules >= 10 },
      { name: 'Maestro', description: `Completa los ${allModules} módulos.`, unlocked: doneModules >= allModules },
    ];
  }

  earnedBadges(): string[] {
    return this.badgeCatalog().filter(badge => badge.unlocked).map(badge => badge.name);
  }

  toggleComplete(): void {
    if (this.completed.has(this.selectedTopic.id)) {
      this.completed.delete(this.selectedTopic.id);
    } else {
      this.completed.add(this.selectedTopic.id);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.completed]));
  }

  toggleTheme(): void {
    this.dark = !this.dark;
    localStorage.setItem(THEME_KEY, this.dark ? 'dark' : 'light');
  }

  toggleExam(): void {
    this.examMode = !this.examMode;
    this.examStartedAt = this.examMode ? Date.now() : null;
    this.tab = 'examen';
  }

  examElapsed(): string {
    if (!this.examStartedAt) return '00:00';
    const seconds = Math.floor((Date.now() - this.examStartedAt) / 1000);
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }

  saveEditorDraft(): void {
    this.editorDrafts[this.selectedTopicId] = this.editorCode;
    localStorage.setItem(EDITOR_KEY, JSON.stringify(this.editorDrafts));
  }

  resetEditor(): void {
    this.editorCode = this.selectedTopic.code;
    this.saveEditorDraft();
    this.output = 'Editor restaurado al ejemplo base del tema.';
  }

  editorLanguage(): string {
    const code = this.editorCode.toLowerCase();
    if (/console\.log|const |let |function |=>/.test(code)) return 'JavaScript';
    if (/def |print\(|import boto3|python/.test(code)) return 'Python';
    if (/aws |az |gcloud |docker |cloud local |curl |terraform |kubectl/.test(code)) return 'Terminal';
    return 'Texto';
  }

  isLabStepVerified(index: number): boolean {
    return this.verifiedLabSteps.has(this.labStepKey(index));
  }

  verifyLabStep(index: number): void {
    const step = this.selectedTopic.labSteps[index];
    if (!step) return;
    const command = step.command.toLowerCase();
    const hasTool = /aws|az |gcloud|docker|cloud local|curl|terraform|kubectl|psql|zip/.test(command);
    if (!hasTool && command.split(/\s+/).length < 3) {
      this.output = 'Este paso necesita un comando más concreto antes de marcarlo como verificado.';
      return;
    }
    this.verifiedLabSteps.add(this.labStepKey(index));
    localStorage.setItem(LAB_KEY, JSON.stringify([...this.verifiedLabSteps]));
    this.output = `Paso verificado: ${step.title}\n${step.verify}`;
  }

  verifyAnswer(): void {
    this.saveCurrentAnswer();
    const analysis = this.answerQuality(this.answer, this.selectedTopic.expected);
    if (analysis.ok) {
      this.output = `Correcto: tu respuesta incluye evidencia compatible.\nCoincidencias: ${analysis.matches.join(', ') || 'razonamiento suficiente'}.`;
      return;
    }
    this.output = [
      'Incorrecto o incompleto: falta evidencia verificable.',
      `Pista: agrega alguno de estos elementos: ${analysis.missing.slice(0, 5).join(', ') || 'comando ejecutado, salida esperada y explicación propia'}.`,
      'Formato sugerido: comando -> salida importante -> explicación en tus palabras.',
    ].join('\n');
  }

  validateCommand(): void {
    const analysis = this.answerQuality(this.answer, this.selectedTopic.expected);
    this.output = analysis.ok
      ? `Comando/evidencia compatible. Tokens detectados: ${analysis.matches.join(', ')}.`
      : `No coincide todavía. Busca en tu respuesta alguno de estos tokens del laboratorio: ${analysis.missing.slice(0, 6).join(', ')}.`;
  }

  async runCode(): Promise<void> {
    this.saveEditorDraft();
    const language = this.editorLanguage();
    if (language === 'JavaScript') {
      this.output = await this.runJavaScriptInSandbox(this.editorCode);
      this.cdr.detectChanges();
      return;
    }
    if (language === 'Terminal') {
      const commandLines = this.editorCode
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));
      const tools = commandLines
        .flatMap(line => line.match(/\b(aws|az|gcloud|docker|cloud local|curl|terraform|kubectl|psql|zip)\b/g) ?? []);
      this.output = [
        'Simulación de terminal completada.',
        `Comandos detectados: ${commandLines.length}.`,
        `Herramientas detectadas: ${[...new Set(tools)].join(', ') || 'ninguna'}.`,
        'Para ejecutar de verdad, copia un comando a tu consola local y pega la salida en el ejercicio.',
      ].join('\n');
      return;
    }
    this.output = 'Editor listo. Para Python o CLI, esta página valida estructura y evidencia; la ejecución real se hace en tu terminal local.';
  }

  exportMarkdown(): void {
    this.saveCurrentAnswer();
    this.saveEditorDraft();
    const lines = [
      '# Cuaderno de progreso Academia Cloud Local',
      '',
      `Progreso global: ${this.globalProgress()}%`,
      `Progreso ruta guiada: ${this.completedGuidedSteps.size}/${this.guidedSteps.length} pasos`,
      `Insignias: ${this.earnedBadges().join(', ') || 'Sin insignias todavía'}`,
      '',
      '## Ruta guiada de 45 pasos',
      ...this.guidedSteps.map(step => [
        `- [${this.completedGuidedSteps.has(step.id) ? 'x' : ' '}] Paso ${step.id}: ${step.title}`,
        `  - Respuesta: ${this.guidedAnswers[step.id] || 'Sin respuesta escrita.'}`,
      ].join('\n')),
      '',
      ...this.modules.flatMap(module => [
        `## ${module.title} (${this.moduleProgress(module)}%)`,
        ...module.topics.map(topic => `- [${this.completed.has(topic.id) ? 'x' : ' '}] ${topic.title}: ${this.answers[topic.id] || 'Sin evidencia escrita.'}`),
        '',
      ]),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cuaderno-progreso-cloud local.md';
    link.click();
    URL.revokeObjectURL(url);
  }

  private answerQuality(answer: string, expected: string[]): { ok: boolean; matches: string[]; missing: string[] } {
    const normalizedAnswer = this.normalize(answer);
    const expectedTokens = [...new Set(
      expected
        .join(' ')
        .split(/[^a-zA-Z0-9#:/_.-]+/)
        .map(token => token.toLowerCase())
        .filter(token => token.length > 3)
        .filter(token => !['para', 'este', 'esta', 'debe', 'crear', 'ejecuta', 'verifica', 'laboratorio'].includes(token))
    )];
    const matches = expectedTokens.filter(token => normalizedAnswer.includes(token)).slice(0, 10);
    const missing = expectedTokens.filter(token => !normalizedAnswer.includes(token));
    const hasCommandSignal = /\b(aws|cloud local|docker|gcloud|az|curl|terraform|kubectl|psql|zip)\b/.test(normalizedAnswer);
    const hasEvidenceSignal = /\b(output|json|arn|http|localhost|status|created|ok|error|id|bucket|queue|tabla|log)\b/.test(normalizedAnswer);
    const enoughExplanation = normalizedAnswer.split(/\s+/).filter(Boolean).length >= 24;
    return {
      ok: (matches.length >= Math.min(3, expectedTokens.length) && (hasCommandSignal || hasEvidenceSignal)) || (hasCommandSignal && enoughExplanation),
      matches,
      missing,
    };
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private labStepKey(index: number): string {
    return `${this.selectedTopicId}:paso-${index + 1}`;
  }

  private runJavaScriptInSandbox(code: string): Promise<string> {
    if (code.length > 4000) {
      return Promise.resolve('El bloque es demasiado largo para el sandbox del navegador. Reduce el ejemplo a menos de 4000 caracteres.');
    }
    if (/\b(while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)|document\.cookie|localStorage|sessionStorage|fetch|XMLHttpRequest)\b/.test(code)) {
      return Promise.resolve('El sandbox bloqueó APIs o bucles peligrosos. Usa ejemplos pequeños con console.log y lógica pura.');
    }

    const id = `cloud local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const iframe = document.createElement('iframe');
    iframe.sandbox.add('allow-scripts');
    iframe.style.display = 'none';

    return new Promise(resolve => {
      const finish = (message: string): void => {
        window.removeEventListener('message', onMessage);
        iframe.remove();
        resolve(message);
      };
      const timeout = window.setTimeout(() => finish('El sandbox tardó demasiado. Revisa si tu código tiene un ciclo infinito.'), 1200);
      const onMessage = (event: MessageEvent): void => {
        if (!event.data || event.data.source !== 'cloud local-sandbox' || event.data.id !== id) return;
        window.clearTimeout(timeout);
        const lines = event.data.error
          ? [`Error: ${event.data.error}`]
          : ['Salida del sandbox:', ...(event.data.logs.length ? event.data.logs : ['Sin salida. Usa console.log para ver resultados.'])];
        finish(lines.join('\n'));
      };
      window.addEventListener('message', onMessage);
      iframe.srcdoc = `
        <script>
          const logs = [];
          const safeConsole = {
            log: (...args) => logs.push(args.map(value => typeof value === 'object' ? JSON.stringify(value) : String(value)).join(' ')),
            error: (...args) => logs.push('ERROR ' + args.map(String).join(' '))
          };
          try {
            const result = Function('console', ${JSON.stringify(`"use strict";\n${code}`)})(safeConsole);
            if (result !== undefined) logs.push(String(result));
            parent.postMessage({ source: 'cloud local-sandbox', id: ${JSON.stringify(id)}, logs }, '*');
          } catch (error) {
            parent.postMessage({ source: 'cloud local-sandbox', id: ${JSON.stringify(id)}, error: error.message }, '*');
          }
        <\/script>
      `;
      document.body.appendChild(iframe);
    });
  }

  private saveCurrentAnswer(): void {
    this.answers[this.selectedTopicId] = this.answer;
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(this.answers));
  }
}
