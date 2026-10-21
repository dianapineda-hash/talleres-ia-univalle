# Talleres de IA para investigadores

Sitio: https://talleres-ia-univalle.onrender.com/

La edición principal ofrece dos recorridos de 240 minutos, cada uno con ocho unidades de trabajo y una pausa. El primero aborda posibilidades, herramientas y ética algorítmica. El segundo enseña a configurar y comprobar un clon de investigación con recursos gratuitos, sin experiencia previa en IA o programación.

## Taller 1 desde cero

`practica-herramientas.html` acompaña ocho actividades prácticas y una pausa. Comparte S1–S3 con el taller 2: primera consulta, búsquedas reales, lectura con citas, comparación A/B, prueba de sesgos, bitácora, mapa y protocolo. `practice-data.js` contiene instrucciones con fuentes completas y plantillas descargables. Los modelos didácticos están separados de las respuestas que el participante debe obtener y registrar.

`learning-core.js` conserva respuestas antiguas y valida solo presencia de registros, autoevaluación y declaración de ejecución. Cada actividad del taller 1 incorpora una decisión ética que se guarda y exporta. Las consultas pendientes no cuentan como ejecutadas; se puede avanzar por las unidades sin perder trabajo. Los registros antiguos no se borran, pero requieren los campos nuevos antes de volver a marcar la actividad. El taller 2 y la profundización mantienen sus requisitos anteriores. El Markdown exportado es legible, no un importador de progreso.

## Taller 2 desde cero

`ejemplo-clon.html` presenta un caso completo sobre formación y adopción digital: tres fuentes sintéticas con párrafos identificados, perfil, carga en Gemini Notebook Standard, consultas para copiar, matriz resuelta, informe de referencia, seis pruebas y transferencia a la investigación propia. S4 se usa únicamente para una prueba de instrucciones incrustadas.

`example-data.js` es la fuente común del caso y del perfil que carga el constructor. Las fuentes originales del caso autorizan su uso en el taller. Todos sus datos son ficticios; los productos resueltos son modelos didácticos, no resultados de una ejecución de IA. `example.js` muestra los materiales y permite copiarlos y descargarlos como TXT y CSV.

`clon.html` prepara instrucciones, registra pruebas y conserva los productos revisados. No ejecuta IA ni envía datos a Google. La configuración operativa se realiza en un cuaderno del proveedor. La ficha HTML es legible sin conexión; el JSON permite recuperar el expediente local, no la cuenta del proveedor ni sus documentos.

`clone-core.js` mantiene el formato de expediente v1 compatible con respaldos anteriores. Los productos son opcionales para importaciones antiguas. Las pruebas importadas vuelven a pendiente y modificar el perfil invalida estados previos. Cargar un ejemplo sobre trabajo existente requiere una acción explícita que descarga primero un respaldo. Los resultados y pruebas son registros humanos, no evaluaciones automáticas.

## Contenido y almacenamiento

`taller-1.html` y `taller-2.html` usan `learn.js` y `lessons.json`. El taller 2 enlaza cada unidad a su paso en el ejemplo; las lecturas complementarias están plegadas y no son necesarias para completar la práctica. Las guías de facilitación acompañan la edición principal.

El cuaderno de actividades se guarda en `autogestion-v4-*`; el constructor usa `iahub-clon-v1`. Descargue ambos respaldos antes de cambiar de equipo. No hay backend de participantes ni analítica. El avance y las pruebas no certifican competencia profesional.

`herramientas.html` presenta ocho herramientas y complementos con fuentes oficiales. La ruta principal no exige Acrobat, WoS, artículos de pago, suscripciones ni API. Las cuentas habilitadas y cuotas de los proveedores condicionan el acceso; el trabajo manual no se presenta como una consulta de IA ejecutada.

`avanzado-1.html` y `avanzado-2.html` conservan `lessons-avanzadas.json` y los audiovisuales anteriores como profundización opcional. El laboratorio y el observatorio mantienen sus funciones de registro y evaluación; no ejecutan modelos de IA.

## Desarrollo y publicación

Node 18 o superior, sin dependencias de ejecución. `npm test` comprueba estructura, duración, recursos, importación, exportación segura, persistencia del esquema y coherencia del caso. `npm run build` prepara `dist`. Render compila desde `main`. La navegación, copia, descarga y persistencia se verifican también en el navegador.

Se conserva la identidad visual existente. Material para investigadores de la Universidad del Valle; no implica aval institucional. Las condiciones del proveedor y las instrucciones de su interfaz están enlazadas a ayuda oficial, consultada el 21 de octubre de 2026.
