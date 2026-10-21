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

Diecisiete pruebas comprueban estructura, duración de recorridos, medios presentes, importaciones y manejo seguro de datos. La navegación y reproducción se comprueban adicionalmente en navegador.

Material para investigadores de la Universidad del Valle. No implica aval institucional. El logosímbolo se conserva localmente, sin modificación, desde el archivo del portal oficial; conserva sus derechos institucionales. Se mantiene Arial y el rojo institucional en títulos principales.

## Revisión avanzada

Dirigida a docentes con doctorado y posdoctorado. Diez unidades reescritas con decisiones de diseño, hipótesis rivales, contraste de novedad y evaluación de aplicaciones. Recursos R7–R10: fiabilidad, OpenScholar, BrainBench y TRIPOD-LLM (adaptación explícita fuera de salud).

`laboratorio.html` incorpora seis expedientes ficticios, puntuación de Brier y banco A/B con particiones de desarrollo/reserva. Calcula exactitud, cobertura y riesgo selectivo; distingue abstenciones y casos no ejecutados. Contratos versionados localmente, informe JSON y aplicación HTML portable. No ejecuta modelos, no protege el ocultamiento de la reserva y no permite inferir superioridad poblacional con los casos de demostración.

Las nuevas respuestas se guardan en autogestion-v3; las antiguas no se reinterpretan como respuestas al nuevo currículo. Identidad documentada en IDENTIDAD.md con páginas del manual.


## Ruta gratuita · 21 de octubre de 2026

La edición principal utiliza `lessons.json`: Taller 1, posibilidades, herramientas y ética algorítmica; Taller 2, construcción de un clon de investigación con un corpus autorizado. Ambos suman 240 minutos e incluyen pausa. `herramientas.html` presenta ocho herramientas y complementos con condiciones oficiales. `clon.html` genera instrucciones y un expediente local; no ejecuta IA ni envía datos a un proveedor. La configuración real se realiza en Gemini Notebook Standard.

`clone-core.js` define perfil, instrucciones, pruebas y ficha portable. El almacenamiento es local y la exportación JSON permite recuperación; las pruebas importadas vuelven a pendiente. Modificar el perfil invalida las decisiones previas. Los estados son registros humanos, no evaluación automática.

`avanzado-1.html` y `avanzado-2.html` conservan los recorridos y audiovisuales anteriores mediante `lessons-avanzadas.json`, como profundización opcional. Las guías de facilitación corresponden a los programas nuevos. La ruta principal no requiere Acrobat, WoS, suscripciones ni API de pago. Las lecturas científicas son complementarias.

Validación: `npm test` verifica contenido, seguridad de exportación, recuperación y métricas; `npm run build` prepara las páginas estáticas y conserva los recursos existentes.
