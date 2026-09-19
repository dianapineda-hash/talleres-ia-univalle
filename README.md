# Talleres autogestionables de IA para investigadores

Sitio: https://talleres-ia-univalle.onrender.com/

Cada taller tiene cinco unidades de aprendizaje y una pausa. Las duraciones de trabajo suman 240 minutos por taller, pero el participante puede detenerse y continuar otro día.

## Experiencia del participante

- Diez videos MP4 originales con láminas explicativas y narración sintética en español de Colombia. Cada video dura aproximadamente un minuto y medio.
- Diez audios MP3 con la misma explicación: son formatos alternativos, no contenidos que deban consumirse dos veces.
- Subtítulos WebVTT y transcripción completa.
- Lecturas científicas enlazadas por DOI, prácticas individuales y ejemplos orientadores.
- Cuaderno con guardado local, exportación Markdown y autoevaluación con retroalimentación por opción.
- Navegación anterior/siguiente y recuperación del avance. No se certifica aprendizaje ni se evalúa automáticamente la calidad de respuestas abiertas.

La guía de la versión presencial se conserva en facilitador-1.html y facilitador-2.html, fuera del recorrido principal.

## Archivos principales

`taller-1.html` y `taller-2.html` abren `learn.js`. El contenido pedagógico está en `lessons.json`. Los recursos multimedia están en `media/`. Los guiones son textos originales del taller, no lecturas integrales de los artículos. Los videos no son grabaciones de la interfaz de Acrobat.

`observatorio.html` conserva la aplicación con fuentes, instrucciones para Acrobat, revisión humana y exportación CSV/JSON. No hay API de IA ni conexión automática con Adobe. El HTML que descarga es un prototipo reducido para aprender a modificar código; no replica todas las funciones del observatorio.

## Fuentes y acceso

Los artículos tienen DOI y consultas preparadas para Web of Science. Los registros individuales en WoS requieren comprobación con acceso institucional; no se han atribuido números UT no verificados. Los libros son complementarios y no se afirma su indexación en BKCI. No se redistribuyen PDF editoriales.

Acrobat AI requiere acceso habilitado en la cuenta. La alternativa documental gratuita se documenta en la biblioteca, sujeta a límites del proveedor. Los ejercicios de lectura pueden continuar manualmente si no hay acceso a IA.

## Privacidad y almacenamiento

Las respuestas se guardan en localStorage de cada navegador. No hay analítica ni backend de participantes. Descargar el cuaderno antes de cambiar de equipo. El observatorio permite respaldos separados. Al recuperar datos externos, sus afirmaciones vuelven a pendiente de revisión.

## Desarrollo y publicación

Node 18 o superior. Sin dependencias de ejecución: `npm test` y `npm run build`. Servir `dist` mediante HTTP. Render ejecuta las pruebas y construye el sitio desde `main`.

Diez pruebas comprueban estructura, duración de recorridos, medios presentes, importaciones y manejo seguro de datos. La navegación y reproducción se comprueban adicionalmente en navegador.

Material para investigadores de la Universidad del Valle. No implica aval institucional. El logosímbolo se sirve sin modificación desde el portal oficial; conserva sus derechos institucionales. Se mantiene Arial y el rojo institucional en títulos principales.
