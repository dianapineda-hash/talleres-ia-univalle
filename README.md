# Talleres de IA con acceso por usuario

Los dos talleres conservan sus nombres y un programa de 240 minutos cada uno. Las actividades pueden abrirse en cualquier orden. El estudiante no necesita aportar archivos.

## Publicación

El aula se sirve desde Node en el espacio Vicedecanatura de Render. El servidor comprueba la sesión antes de entregar las páginas y los módulos que contienen los casos. Las cuentas de IA Hub y del aula son independientes.

El sitio estático anterior distribuye páginas de acceso a la nueva dirección. Su construcción no incluye los módulos de contenido ni las aplicaciones antiguas. Los archivos anteriores permanecen en el repositorio para mantenimiento; no se sirven desde el aula.

Aula: https://aula-ia-univalle.onrender.com/aula/
Administración: https://aula-ia-univalle.onrender.com/aula/administracion.html
Rama desplegada del aula: codex/aula-con-acceso. El sitio estático conserva main y ejecuta build.mjs.

## Cuentas

La administradora crea participantes con nombre y usuario. El panel genera una contraseña temporal que debe cambiarse al ingresar. Permite restablecer contraseñas y desactivar cuentas. No hay registro abierto. Las contraseñas emplean scrypt con sal por cuenta. La cookie es HttpOnly, Secure en producción y SameSite=Strict. Las sesiones caducan y se invalidan al cambiar contraseña o desactivar la cuenta.

## Seguimiento

Se conserva por participante y apartado la consulta, última respuesta del ejercicio, apertura de la explicación y marca de realización. También se acumula una duración en segundos. Las tablas de cuentas y progreso no contienen fechas ni horarios.

No hay contador temporal visible al estudiante. Los pulsos requieren una pestaña visible, con foco e interacción durante los cinco minutos anteriores. El servidor calcula intervalos con reloj monotónico; el cliente no aporta segundos. Intervalos mayores de 45 segundos se descartan. Una persona no acumula tiempo simultáneo entre pestañas o talleres. Los relojes técnicos residen en memoria; no forman parte del historial de aprendizaje.

El registro no prueba atención o comprensión y no acredita lectura fuera de la página. El informe separa el tiempo en actividades del tiempo de pausa frente a los 225 y 15 minutos previstos. Las marcas de realización son declaraciones del estudiante. El informe permite revisar las respuestas y respaldar una solicitud de certificación; no emite certificados.

El panel permite imprimir, guardar PDF o exportar CSV. Para excluir los metadatos que añade el navegador al imprimir, desactive Encabezados y pies de página. Los proveedores de alojamiento pueden conservar registros técnicos ajenos a las tablas del aula.

## Datos y operación

Configure WORKSHOP_DATABASE_URL como secreto de Render, WORKSHOP_ORIGIN como origen autorizado y NODE_ENV=production. No se conservan avances en el disco del servidor ni en almacenamiento del navegador. La base pertenece al proyecto talleres-ia-univalle de Neon, con ramas separadas de producción y validación.

La migración está en migrations/001-workshops.sql. workshop-provision.mjs recibe configuración por entrada protegida para preparar el esquema, validar persistencia en una rama de prueba o crear la primera administradora. No ejecute pruebas con personas ficticias en producción. El archivo de credenciales generado se excluye de Git.

El proceso utiliza una instancia. Reiniciar exige ingresar de nuevo, pero conserva cuentas y progreso. Una caída de la base muestra error; no simula guardado. Cada estudiante consulta su propio progreso; el panel exige administración.

## Comprobaciones

npm test comprueba contenido y acceso. workshop-integration.mjs verifica el flujo HTTP con una base de prueba y reinicio del proceso. npm run build prepara la pasarela estática. npm start inicia el aula y requiere conexión. /healthz indica disponibilidad.

Las lecturas permanecen en las fuentes editoriales. Los DOI permiten buscarlas en Web of Science; el registro individual permanece pendiente de consulta institucional. Los vídeos se reproducen por elección del participante. Los casos de aprendizaje no representan hallazgos de las lecturas.
