# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
"# DravZ-pal-ganado_front" 

## Prueba de la PWA

Vite genera `manifest.webmanifest` y `sw.js` al compilar. El worker precarga el HTML
y los recursos compilados de la aplicacion; las rutas de React Router reciben el
mismo `index.html`, por lo que no hace falta abrir cada pagina antes de probarlas.

### Probar desde un celular

1. Conecta la computadora y el celular a la misma red Wi-Fi.
2. Inicia Vite con `npm run dev -- --host 0.0.0.0` y abre en el celular
   `http://<IP-de-la-computadora>:5173`.
3. Para instalarla desde el celular, usa un origen HTTPS (por ejemplo, un tunel
   HTTPS de desarrollo). Los navegadores no permiten instalar service workers
   desde una IP local servida por HTTP. `localhost` es la excepcion, pero solo
   aplica en el dispositivo donde corre el servidor.
4. En Chrome/Android, usa **Instalar aplicacion** o **Agregar a pantalla principal**.

El service worker de desarrollo permite comprobar el registro y la navegacion SPA,
pero Vite sirve modulos de desarrollo y no representa la precarga offline final.
Para verificar que todas las paginas compiladas abren sin red, genera y sirve el
build con `npx vite build` y `npm run preview -- --host 0.0.0.0`, usando tambien
HTTPS desde el celular. `npx vite build` omite la verificacion de TypeScript:
actualmente `npm run build` se detiene por errores TypeScript preexistentes.
Instala/abre la aplicacion una vez con conexion y luego desactiva la red: la
interfaz y sus rutas estaticas estaran disponibles; los datos que dependan de una
API seguiran necesitando conectividad.
