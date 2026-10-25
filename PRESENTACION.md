# Presentar el medidor sin instalar OpenSCAD

## En el computador del profesor

1. Copia `medidor-presentacion.html` a un pendrive o envíalo por correo.
2. Abre el archivo con Edge, Chrome o Firefox actualizado. No hace falta
   OpenSCAD, Node.js, un servidor, instalar extensiones ni conexión a Internet.
3. Arrastra sobre el modelo para girarlo y usa la rueda para acercarlo.
4. Cambia entre **Ensamblado**, **Interior** y **Explosionado**.
5. Pulsa los nombres de los componentes para explicar su función.
6. Activa **Mostrar recorrido**: entrada derecha → F2 → F1 → sensor → salida izquierda.
7. Usa **Pantalla completa** para presentar y **↓ PNG** para guardar imágenes.

El navegador necesita WebGL habilitado. Las políticas del computador del
profesor pueden restringir archivos HTML locales o la aceleración gráfica;
comprueba el archivo en ese equipo antes de la presentación. Si hay una
restricción institucional, usa una publicación web autorizada o imágenes PNG
como respaldo. La versión se probó en Chromium sin conexión, ejecutando el HTML
completo y sin solicitudes de red; abrir rutas `file://` está bloqueado por la
política del navegador de esta máquina de desarrollo.

El modelo web reproduce la distribución y las dimensiones principales del
SCAD, mediante geometría de presentación. No es un conversor automático del
archivo SCAD ni un archivo para fabricar piezas. Cambios posteriores en SCAD
deben aplicarse también en `web/app.js`.

## Publicar para abrir con un enlace

La página está construida, pero este trabajo no la publica automáticamente.
`medidor-sitio-web.zip` contiene `index.html` en la raíz y la licencia de Three.js.
Se puede cargar el contenido de `dist/` en un alojamiento estático como GitHub
Pages o Netlify, desde una cuenta con autorización para publicar.

Para Netlify: inicia sesión, abre el despliegue manual, descomprime el ZIP y
arrastra la carpeta que contiene `index.html`. El servicio proporciona el enlace
público al finalizar. No se necesita servidor de aplicación ni variables secretas.
Conserva también el HTML local como respaldo si la conexión del aula falla.

## Desarrollo

```sh
cd /workspace/Prototipo-3D
npm --cache /tmp/rayo-npm-cache ci
npm run build
npm start
```

La salida es `dist/index.html`, con JavaScript y estilos incluidos. Las librerías
se empaquetan desde versiones fijadas en `package-lock.json`; no se usan CDN,
fuentes remotas, analítica, cuentas, bases de datos ni APIs externas.

Las pruebas de `npm test` usan Python Playwright y Chromium disponibles en el
entorno de desarrollo. En otra máquina de desarrollo se necesitan esos programas
para ejecutar las pruebas; no son necesarios para usar o publicar la página.

La animación del recorrido es ilustrativa; no simula hidráulica ni muestra
mediciones reales. El monitor y el prensaestopas son referencias provisionales.
Los filtros no tienen cartuchos comerciales seleccionados. El proyecto es una
maqueta seca sin validación para agua potable, presión ni estanqueidad.
