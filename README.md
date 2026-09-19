# IA para investigadores · Universidad del Valle

Dos páginas de formación de cuatro horas cada una, biblioteca científica y Observatorio de evidencia. Material educativo preparado a solicitud de la facilitadora; no implica aval institucional.

## Páginas
- `taller-1.html`: conceptos, casos, lectura crítica en Acrobat y PDF Spaces.
- `taller-2.html`: construcción, personalización y pruebas de una aplicación.
- `biblioteca.html`: seis artículos con DOI y consultas WoS, dos libros complementarios.
- `observatorio.html`: configuración, fuentes, generador de instrucciones, importación JSON, revisión humana, exportación CSV/JSON y aplicación HTML descargable.

## Ejecución
Node 18 o superior, sin paquetes externos. `npm test`, `npm run build`. Servir `dist` mediante cualquier servidor estático. Los módulos requieren HTTP, no abrir las páginas del sitio con file://. El HTML autónomo descargado sí funciona directamente.

Render: nuevo Static Site, repositorio actual, build `npm run build`, publish directory `dist`. También se incluye `render.yaml`.

## Alcance y datos
No hay backend, API de IA, analítica ni integración automática con Adobe. La transferencia Acrobat → aplicación es manual. Los datos del observatorio permanecen en localStorage; exportar respaldo antes de cambiar de equipo. La recuperación de respaldos restablece estados a pendiente para evitar confiar en verificaciones de origen desconocido. El CSV neutraliza prefijos de fórmula. Datos introducidos se presentan como texto.

Los artículos están identificados mediante DOI y fuentes editoriales. No se afirma verificación individual autenticada en WoS; el material incluye protocolo y registro de consulta para completar UT, colección, fecha y revisor. Libros y documentación de producto se distinguen del corpus científico. No se redistribuyen PDF editoriales.

Identidad: Arial, fondo blanco, rojo institucional reservado al título principal y logo sin alterar servido desde https://www.univalle.edu.co/images/logo.jpg. Referencias: manual oficial y normas de diseño web enlazados en el pie del sitio. El logosímbolo conserva los derechos de la Universidad del Valle.

## Facilitación
20–24 personas, parejas con roles alternos. Comprobar acceso individual a Acrobat AI y WoS antes de impartir. Acrobat institucional no es gratuito universal. Alternativa documental gratuita: Gemini Notebook Standard (antes NotebookLM), sujeto a cuotas. Si no hay servicio de IA, usar lectura manual y demostración sintética.

## Validación
`npm test`: duración de sesiones, rechazo de fuente desconocida, revisión importada no confiable, texto hostil, respaldo, CSV y escape de configuración HTML. Comprobar además flujos en navegador y enlaces desplegados.
