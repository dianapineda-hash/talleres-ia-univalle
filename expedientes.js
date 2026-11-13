// Expedientes didácticos originales. Los datos y salidas no proceden de estudios reales.
export const expedientes = Object.fromEntries([
  [
    "v4-1-1",
    "La conclusión cambia al separar las sedes",
    "Una IA recomienda el protocolo B: «En el conjunto de informes, el 74 % de B y el 36 % de A superaron la revisión». La asignación a protocolos no fue aleatoria.",
    "Con estos datos, ¿qué firmaría?",
    [
      "B tuvo mejor resultado agregado.",
      "Cambiar a B aumenta la probabilidad de superar la revisión."
    ],
    0,
    "La primera frase describe; la segunda atribuye un efecto al cambio de protocolo.",
    "Los denominadores estaban en el anexo",
    "Sede Norte: A, 9/10; B, 72/90. Sede Sur: A, 27/90; B, 2/10. El tipo de informe difiere por sede.",
    "Calcule la tasa de cada protocolo si ambas sedes pesaran por igual. ¿Cuál queda por encima?",
    [
      "B: conserva su ventaja agregada.",
      "A: 60 % frente a 50 %."
    ],
    1,
    "Norte: 90 % frente a 80 %. Sur: 30 % frente a 20 %. Con pesos de ½, A alcanza 60 % y B 50 %. El agregado original sigue siendo correcto: cambió la pregunta al fijar la composición. Ni siquiera el contraste estandarizado identifica un efecto causal por sí solo.",
    "Busque en un artículo un promedio que mezcle contextos. Escriba la pregunta que responde ese promedio y la que respondería una comparación con pesos comunes."
  ],
  [
    "v4-1-3",
    "Dos referencias que parecen corroborarse",
    "Ficha A: una encuesta a 412 docentes relaciona horas de preparación y satisfacción. Ficha B: otro artículo, con autores parcialmente distintos, informa una asociación semejante en 286 docentes. Una síntesis cuenta dos corroboraciones independientes.",
    "¿Qué dato pediría antes de contar corroboraciones?",
    [
      "Identificadores de cohorte y ventanas de reclutamiento.",
      "Número de citas de cada artículo."
    ],
    0,
    "La independencia depende de cómo se obtuvieron los datos; el prestigio o la circulación de los artículos no resuelve esa cuestión.",
    "Una nota del suplemento",
    "B reanaliza a los 286 integrantes de la misma cohorte que contestaron el seguimiento. Incorpora una medida nueva de autonomía. No hay participantes nuevos.",
    "¿Qué puede aportar B?",
    [
      "Una replicación en una segunda muestra.",
      "Una observación adicional dentro de una cohorte parcialmente coincidente."
    ],
    1,
    "Hay dos publicaciones y una cohorte de origen. La nueva medida puede enriquecer la explicación, pero el seguimiento añade una posible selección por permanencia. El solapamiento no convierte a B en una publicación redundante.",
    "Pida a Acrobat que identifique el reclutamiento en dos artículos públicos afines. Abra las citas y documente qué evidencia establece independencia o qué dato sigue faltando."
  ],
  [
    "v4-1-4",
    "Una consulta que borra la voz disidente",
    "Extracto P1, acta: «Los asistentes aprobaron incorporar tutorías». Extracto P2, diario de campo: «Tres personas se retiraron antes de la votación; no registré sus razones». El asistente responde: «La comunidad respaldó las tutorías».",
    "¿Qué parte de la frase sometería a revisión?",
    [
      "El alcance de «la comunidad».",
      "La fecha de la votación como explicación del retiro."
    ],
    0,
    "El acta documenta una decisión de quienes participaron. El diario describe una salida y no atribuye intenciones.",
    "La instrucción también introduce sesgo",
    "Una segunda instrucción pide «rescatar las voces contrarias». El asistente clasifica los retiros como oposición. No existe testimonio adicional.",
    "¿Qué conservaría en el informe?",
    [
      "La oposición de tres participantes como hallazgo minoritario.",
      "El retiro como hecho y su sentido como cuestión abierta."
    ],
    1,
    "Una instrucción orientada a detectar disenso también puede fabricarlo. La ausencia de testimonio no autoriza a contar adhesiones ni rechazos. Una entrevista consentida podría aclarar el episodio; no puede sustituirse por una reconstrucción generada.",
    "Pegue únicamente P1 y P2 en su asistente. Compare «¿hubo consenso?» con «distinga decisión registrada e intención no documentada». Cite la palabra exacta que cambió el alcance."
  ],
  [
    "v4-2-3",
    "El clon frente a dos versiones del protocolo",
    "Documento S1, protocolo aprobado en marzo: «Seguimiento a seis meses». Documento S2, borrador de julio: «Proponemos seguimiento a doce meses». El clon responde doce meses y cita correctamente S2.",
    "¿Cuál es el fallo?",
    [
      "La cita existe, pero su fuente no tiene autoridad para fijar el protocolo vigente.",
      "La cita es inventada porque su conclusión es incorrecta."
    ],
    0,
    "La localización de una frase y la autoridad del documento son comprobaciones distintas.",
    "Llega una enmienda",
    "S3, enmienda aprobada en agosto: «El seguimiento a doce meses rige para altas desde el 1 de septiembre. Las altas anteriores conservan el calendario original».",
    "Para una persona dada de alta el 20 de agosto, ¿qué debe devolver el clon?",
    [
      "Doce meses, aplicando el documento más reciente.",
      "Seis meses, citando S1 y la disposición transitoria de S3."
    ],
    1,
    "La fecha de aprobación de la enmienda no basta. La regla depende de la fecha de alta. Si esta última se desconoce, corresponde pedirla o entregar una respuesta condicional.",
    "Cargue los tres fragmentos como fuentes separadas. Pruebe altas del 31 de agosto y del 1 de septiembre, y una consulta sin fecha. Conserve la regla revisada solo si distingue los tres casos."
  ],
  [
    "v4-2-6",
    "Una síntesis que sobrevive a la retirada de su fuente",
    "S1: «En 40 expedientes faltaba el anexo en 8». S2: «Se empleó una lista de comprobación para revisar la documentación». Con ambas fuentes, el clon afirma que faltaba el anexo en el 20 % de los expedientes.",
    "Antes del experimento, ¿qué cambio predice si se retira S1?",
    [
      "Debe desaparecer el porcentaje o quedar expresamente sin verificar.",
      "El porcentaje debe conservarse porque S2 describe el método."
    ],
    0,
    "El cálculo 8/40 pertenece a S1; S2 no contiene numerador ni denominador.",
    "Una prueba aparentemente correcta",
    "Al retirar S1, el clon mantiene el 20 %. El investigador advierte que hizo la segunda consulta en la misma conversación y la primera respuesta sigue visible.",
    "¿Cuál es la comparación más informativa?",
    [
      "Repetir en un cuaderno nuevo con S2 y la misma pregunta, sin mencionar la cifra.",
      "Preguntar en el mismo chat si está seguro del 20 %."
    ],
    0,
    "El historial conservaba la respuesta anterior: la retirada de un archivo no aisló su efecto. Un cuaderno nuevo reduce esa explicación rival. Si reaparece la cifra, el resultado aún no identifica su procedencia; sí impide presentarla como documentada por S2.",
    "Ejecute las dos condiciones en cuadernos separados de su herramienta gratuita o en PDF Spaces independientes. Guarde las salidas literales y el conjunto de fuentes de cada ejecución."
  ],
  [
    "v4-2-7",
    "El clon más preciso puede costar más",
    "En 20 consultas comparables, el clon A responde 18: acierta 16 y se equivoca en 2. B responde 10 y acierta las 10. Las abstenciones pasan a revisión manual. En este escenario ficticio, un error cuesta 5 unidades de trabajo y revisar una abstención cuesta 1.",
    "Calcule el costo total. ¿Qué versión elegiría con este criterio?",
    [
      "A: responde más consultas.",
      "B: cuesta 10 unidades frente a 12 de A."
    ],
    1,
    "Costo A = 2 × 5 + 2 × 1 = 12. Costo B = 0 × 5 + 10 × 1 = 10. Las respuestas correctas no añaden costo en este modelo simplificado.",
    "Cambia el uso, no el modelo",
    "Ahora el clon prepara borradores que siempre pasan por revisión editorial. El costo incremental de un error baja a 2; el de revisar una abstención sigue en 1. Las salidas son idénticas.",
    "¿Qué decisión cambia y en qué valor se igualan ambas opciones?",
    [
      "Ahora conviene A; hay empate cuando cada error cuesta 4.",
      "Sigue conviniendo B porque no tuvo errores observados."
    ],
    0,
    "Con costo de error c, A cuesta 2c + 2 y B cuesta 10. A cuesta 6 cuando c = 2. El umbral de indiferencia es c = 4. Cero errores en diez respuestas no demuestra riesgo poblacional cero.",
    "Elija un producto de su clon. Estime el costo relativo de corregir una atribución errónea frente a revisar una abstención. Indique quién asumiría cada costo y cuándo cambiaría su recomendación."
  ]
].map(([id,title,opening,q1,o1,k1,r1,turn,evidence,q2,o2,k2,r2,transfer])=>[id,{title,opening,q1,o1,k1,r1,turn,evidence,q2,o2,k2,r2,transfer}]));
