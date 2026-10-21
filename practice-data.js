import {sources} from './example-data.js?v=clon-paso-a-paso-1';

const s1=sources.find(s=>s.id==='S1').text,s2=sources.find(s=>s.id==='S2').text;
export const practicePrompts={
  first:{title:'Primera consulta con S1',text:`Lea el documento que copio debajo. En dos frases, explique qué significa adopción digital en S1 y qué NO demuestra la encuesta. Use únicamente este texto, indique los párrafos de apoyo y mantenga la etiqueta CASO SINTÉTICO. Si falta información, dígalo.\n\n${s1}`},
  search:{title:'Pregunta para Elicit o Consensus',text:'What evidence links digital skills training with technology adoption in small businesses?'},
  reading:{title:'Consulta para el cuaderno con S1 cargado',text:'Trabaje solo con S1. Prepare una tabla con diseño, muestra, adopción en cada grupo, diferencia en puntos porcentuales y límite causal. Cite cada dato con una cita que pueda abrir y el párrafo P1–P4. ¿Qué informa sobre ingresos? Si no lo midió, indíquelo. Identifique el material como CASO SINTÉTICO y no añada información externa.'},
  a:{title:'Instrucción A · conversación nueva',text:`Resuma S1.\n\n${s1}`},
  b:{title:'Instrucción B · otra conversación nueva',text:`Redacte cuatro o cinco frases para un informe de lectura usando solo S1. Conserve la etiqueta CASO SINTÉTICO. Indique diseño y muestra, porcentajes con sus denominadores, diferencia en puntos porcentuales, límite causal y si se midieron ingresos. Incluya el párrafo que respalda cada afirmación. No invente datos ni referencias.\n\n${s1}`},
  bias:{title:'Prueba de sesgo con S2',text:`Analice estas dos frases problemáticas sin aceptarlas como verdaderas: «Los negocios no usan tecnología porque no quieren aprender» y «Las mujeres mayores tienen menos capacidad para usar registros digitales». ¿Están respaldadas por S2? Distinga información reportada, variables ausentes e inferencias injustificadas. No invente datos de edad, género o motivación. Proponga una alternativa de redacción basada solo en S2, con párrafos de apoyo. Mantenga la etiqueta CASO SINTÉTICO.\n\n${s2}`},
  disclosure:{title:'Declaración de uso · adapte solo lo realizado',text:'Utilicé [herramienta, plan gratuito, fecha y modelo si se muestra; si no, «no mostrado»] para [tarea realmente realizada]. Trabajé con [fuente, versión y permiso]. Conservé la instrucción y la respuesta original. Comprobé [afirmaciones y pasajes] y corregí [cambios concretos]. La selección, interpretación y revisión final son responsabilidad de [persona o rol]. [Indique qué quedó pendiente]. Los documentos S1–S3 de este ejercicio son sintéticos y no constituyen evidencia empírica.'},
  workflow:{title:'Mapa resuelto · ejemplo para adaptar',text:'EJEMPLO DIDÁCTICO, NO REGISTRO DE EJECUCIÓN\n\nDescubrir | Pregunta pública | Semantic Scholar + Elicit o Consensus básicos | Dos referencias reales | Cotejar metadatos, pertinencia y cobertura | Alternativa: repositorio abierto y búsqueda manual.\nLeer | S1 autorizado | Gemini Notebook Standard | Ficha con citas | Abrir pasajes, comprobar cifras y límites | Alternativa: leer S1 y dejar pendiente la consulta de IA.\nRedactar | Ficha revisada | ChatGPT Free o Claude Free | Párrafo | Cotejar significado con S1, sin añadir hechos | Alternativa: redacción propia.\nVerificar | Afirmación y fuente | Lectura humana | Veredicto y corrección | No usar una afirmación sin respaldo | No delegar la aceptación final al modelo.\nOrganizar | Fuentes y registros revisados | Carpeta local; Zotero opcional | Inventario y bitácora | Abrir respaldo y revisar datos compartibles | Alternativa: archivo TXT.\n\nEncargo siguiente: comparar definiciones y límites de S1–S3. Responsable: [yo]. Fecha: [fecha]. Detener si la fuente no respalda la afirmación o no está claro el permiso.'},
  protocol:{title:'Protocolo resuelto · adapte a su proyecto',text:'EJEMPLO DIDÁCTICO SOBRE FUENTES SINTÉTICAS\n\n1. Antes de enviar: responsable = investigador. Solo S1–S3, autorizados para el taller. Personas afectadas = participantes de futuros proyectos. Riesgo = divulgar o reidentificar. Control = revisar permiso, finalidad, datos y entorno. Evidencia = inventario. Decisión = detener cargas con permiso desconocido.\n2. Al buscar: personas afectadas = comunidades menos representadas. Riesgo = excluir por idioma o cobertura. Control = comparar términos, idiomas y repositorios; registrar límites. Evidencia = consultas y dos registros cotejados. Decisión = no afirmar exhaustividad.\n3. Al generar: personas afectadas = lectores. Riesgo = inventar cifras, causas o atributos. Control = abrir fuente y comprobar cada afirmación. Evidencia = ficha con párrafos. Decisión = corregir o descartar lo no respaldado.\n4. Al compartir: personas afectadas = equipo y participantes. Riesgo = ocultar IA o revelar datos. Control = declaración veraz y revisión del archivo. Evidencia = bitácora y versión final. Decisión = compartir solo lo autorizado.\n5. Al transferir: responsable = [persona]. Riesgo = aplicar reglas sin revisar el nuevo contexto. Control = repetir pruebas con fuentes reales autorizadas en [fecha]. Detener ante cita falsa, inferencia discriminatoria o permiso incierto. Usar IA solo donde aporte a la tarea.'}
};

export function practiceTemplates(){return `TALLER 1 · PLANTILLAS DE TRABAJO
Estas fichas están vacías. No representan consultas ejecutadas.
Escriba en el cuaderno del taller o en este archivo. No copie datos privados.

1. PRIMERA CONSULTA
Herramienta / plan / modelo si visible / fecha:
Instrucción exacta y fuente:
Respuesta real:
Pasaje comprobado y corrección:
Estado: ejecutada / pendiente:
Decisión ética (datos, permiso, riesgo y decisión):

2. BÚSQUEDA · REPITA POR CADA UNO DE DOS REGISTROS
Herramienta / consulta exacta / fecha / idioma / filtros si usó:
Título / autoría / año / DOI solo si consta / URL del editor o repositorio:
Acceso real: resumen / texto completo:
Pertinencia y límite:
Diferencia de cobertura y búsqueda adicional:

3. LECTURA VERIFICADA
Afirmación / respuesta de IA:
Fuente y versión / párrafo / pasaje:
Veredicto: respaldada / parcial / no respaldada:
Corrección / responsable / fecha / decisión ética:

4. COMPARACIÓN A/B
Herramienta / modelo si visible / fecha / instrucciones / fuente idéntica:
Salida A:
Salida B:
Para cada condición, marque correcto / omitido / incorrecto y copie un fragmento:
Etiqueta sintética:
80 % y 40 % con denominadores:
40 puntos porcentuales:
Límite causal:
Ingresos no medidos:
Texto final y límite de la comparación:

5. SESGOS Y PRIVACIDAD
Consulta / respuesta real / pasaje:
Variables ausentes / inferencia injustificada:
Personas afectadas / control / decisión:
Qué no cargaría y por qué:

6. BITÁCORA Y DECLARACIÓN
Tarea / herramienta / plan / modelo si visible / fecha:
Fuentes, versiones y permisos:
Instrucciones / salidas / correcciones conservadas:
Declaración de uso real / responsable / pendientes:

7. MAPA Y PROTOCOLO
Tarea / entrada / herramienta / salida / control / alternativa:
Personas afectadas / riesgo / evidencia / responsable / usar-corregir-detener:

8. PLAN DE SIETE DÍAS
Pregunta / fuentes autorizadas / herramienta gratuita / responsable / fecha:
Prueba de éxito / pendientes / condición de detención:
`;}
