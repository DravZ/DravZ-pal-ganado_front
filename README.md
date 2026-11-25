# Pa'la Vaca — Frontend

Aplicación web (SPA+PWA) para la gestión integral de un rancho: hato, salud, alimentación,
finanzas, administración y sincronización offline. Trabaja contra la API REST del repositorio
hermano `back/`.

> **Repositorio:** `pa-la-vaca_front/` · **Rama de trabajo actual:** `feature/gestion-lotes-potreros`
> (base: `audit/full-project-review`).

---

## Índice

- [Stack tecnológico](#stack-tecnológico)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Levantamiento](#levantamiento)
- [Calidad y build](#calidad-y-build)
- [Primer uso](#primer-uso)
- [Uso de la aplicación](#uso-de-la-aplicación)
- [Modo offline y PWA](#modo-offline-y-pwa)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Solución de problemas](#solución-de-problemas)

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| UI | React **19**, TypeScript **6**, Vite **8** |
| Enrutamiento | React Router **7** (`createBrowserRouter`) |
| Estilos | Bootstrap **5**, CSS Modules, iconos `lucide-react` |
| Datos offline | Dexie **4** / IndexedDB + `dexie-react-hooks` |
| PWA | `vite-plugin-pwa` (**2**), service worker con `registerType: autoUpdate` |
| Calidad | ESLint **10** (`typescript-eslint`, `react-hooks`, `react-refresh`) |
| Cliente HTTP | `src/services/apiClient.ts` (sesión + CSRF, `credentials: 'include'`) |

---

## Requisitos previos

1. **Node.js 20.19+ o 22+** (Vite 8 no funciona con versiones anteriores).
2. **npm** (incluido con Node).
3. El backend en `http://localhost:8080` y la base de datos creada (ver README de `back/`)
   para trabajar con datos reales.

```bash
node --version
npm --version
```

---

## Instalación

```bash
cd pa-la-vaca_front
npm ci
```

> `npm ci` usa `package-lock.json` y garantiza versiones reproducibles. Si no existe el lockfile,
> usa `npm install` una sola vez y commitea el archivo generado.

---

## Variables de entorno

El cliente calcula la URL base de la API en `src/services/apiClient.ts`:

| Variable | Entorno | Descripción |
|---|---|---|
| `VITE_BACKEND_PROXY_TARGET` | Producción | Origen del backend, p. ej. `https://api.turancho.mx`. Se arma `${valor}/api/v1`. |
| `VITE_API_BASE_URL` | Producción | Alternativa si no se define `VITE_BACKEND_PROXY_TARGET`; se usa tal cual. |

Comportamiento:

- **Desarrollo:** la API siempre se llama a `/api/v1` y Vite redirige `/api` a
  `http://localhost:8080` (ver `vite.config.ts`). No hace falta configurar nada.
- **Producción:** si hay `VITE_BACKEND_PROXY_TARGET` se usa `${target}/api/v1`; si no, se usa
  `VITE_API_BASE_URL`; si ninguna está definida, se usa `/api/v1` relativo.

Ejemplo (Windows PowerShell):

```powershell
$env:VITE_BACKEND_PROXY_TARGET = "https://tu-backend.vercel.app"
npm run build
```

> Para despliegues entre dominios, el backend debe permitir el origen exacto del frontend en
> `CORS_ALLOWED_ORIGINS` y mantener las cookies con `Secure; SameSite=None`. Todas las peticiones
> incluyen credenciales y el token CSRF cuando corresponda.

---

## Levantamiento

### Desarrollo

```bash
npm run dev
```

Abre `http://localhost:5173`. Para acceder desde el celular u otro dispositivo de la misma red:

```bash
npm run dev -- --host 0.0.0.0
```

Luego visita `http://<IP-de-la-computadora>:5173`.

### Producción local (build + preview)

```bash
npm run build
npm run preview
```

El build genera `dist/` (incluye `manifest.webmanifest` y el service worker).

---

## Calidad y build

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run lint` | ESLint sobre todo el proyecto (`eslint .`) |
| `npx eslint src` | ESLint solo sobre el código fuente |
| `npx tsc --noEmit` | Verificación de tipos sin generar archivos |
| `npm run build` | `tsc -b && vite build` (verificación de tipos + build de producción) |
| `npm run preview` | Sirve localmente el build de `dist/` |

---

## Primer uso

1. Levanta el backend y crea la base de datos según su README.
2. Abre `http://localhost:5173/register` y registra la organización, la finca y el usuario
   administrador (contraseña: 9–72 caracteres, con mayúscula, minúscula, número y carácter especial).
3. Inicia sesión en `http://localhost:5173/`.
4. Selecciona la finca activa con el selector **FINCA ACTUAL** (alcance en memoria por pestaña).
5. Crea potreros en **Gestión del rancho** (`/admin/estructura`), lotes en **Gestión de lotes**
   (`/admin/lotes`) y registra animales en `/hato/nuevo`.

---

## Uso de la aplicación

Las rutas están declaradas en `src/routes/AppRouter.tsx`. Las rutas privadas pasan por `AuthGuard`;
las de administración, además por `AdminGuard`.

| Módulo | Rutas | Funcionalidad |
|---|---|---|
| **Acceso** | `/`, `/login`, `/forgot-password`, `/reset-password`, `/register` | Login, recuperación y alta inicial |
| **Inicio** | `/dashboard` | Indicadores y resumen de la finca |
| **Hato** | `/hato/animales`, `/hato/nuevo`, `/hato/animales/:id`, `/hato/animales/:id/editar` | Directorio, alta, detalle y edición |
| **Hato** | `/hato/pesajes`, `/hato/reproduccion`, `/hato/traslados` | Pesos, reproducción, movimientos y ventas |
| **Salud** | `/salud/eventos`, `/salud/tratamientos`, `/salud/vacunacion` | Eventos clínicos, tratamientos y vacunas |
| **Alimentación** | `/alimentacion/diaria`, `/alimentacion/inventario` | Alimentación, producción, insumos y compras |
| **Finanzas** | `/finanzas/gastos` | Gastos, asignaciones de costo e inversión |
| **Administración** | `/admin/estructura`, `/admin/lotes` | Potreros (con detalle) y gestión de lotes |
| **Administración** | `/admin/configuracion`, `/organizacion/informacion`, `/organizacion/editar` | Datos de la organización |
| **Administración** | `/admin/usuarios`, `/usuarios/nuevo`, `/usuarios/:id`, `/usuarios/editar/:id` | Usuarios |
| **Administración** | `/admin/fincas`, `/fincas/nueva`, `/fincas/:id`, `/fincas/editar/:id` | Fincas |
| **Administración** | `/admin/alertas`, `/admin/sincronizacion` | Alertas y cola offline |
| **Perfil** | `/perfil`, `/perfil/editar` | Datos del usuario autenticado |

### Jerarquía finca → potrero → lote → animal

- En **Gestión del rancho** (`/admin/estructura`), cada potrero muestra superficie, capacidad
  máxima, ocupación, disponible y porcentaje; el detalle lista sus lotes y permite navegar a
  `/admin/lotes?potrero=<id>` o al directorio filtrado.
- En **Gestión de lotes** (`/admin/lotes`) puedes crear, editar, ver animales, consultar el
  historial y trasladar lotes completos entre potreros de la finca (con validación de capacidad).
- En el formulario de animal (paso 3), la ubicación sigue el flujo **potrero → lote**: al elegir
  potrero se filtran sus lotes y puedes crear uno nuevo en línea; se asigna al potrero elegido
  y queda seleccionado.
- El directorio acepta `?lote=<id>` y `?potrero=<id>` para llegar con el filtro preseleccionado.

El contrato de pantallas y recursos está documentado en `API_BACKEND_MAP.md`.

---

## Modo offline y PWA

Vite genera `manifest.webmanifest` y `sw.js` al compilar. El service worker precarga el HTML y los
recursos compilados; las rutas de React Router reciben el mismo `index.html`, por lo que no hace
falta abrir cada página antes de probarlas. El registro es automático (`registerType: autoUpdate`).

### Datos locales

Los recursos se consultan con `useHatoCollection` sobre IndexedDB (`palaganado-offline`) y las
escrituras se encolan con `queueHatoWrite`. Al recuperar conexión, la cola se sincroniza con
`POST /api/v1/sync-queue/batch`. El estado de la cola se revisa en `/admin/sincronizacion`.

### Probar desde un celular

1. Conecta la computadora y el celular a la misma red Wi-Fi.
2. Inicia Vite con `npm run dev -- --host 0.0.0.0` y abre en el celular
   `http://<IP-de-la-computadora>:5173`.
3. Para instalarla desde el celular, usa un origen HTTPS (por ejemplo, un túnel HTTPS de
   desarrollo). Los navegadores no permiten instalar service workers desde una IP local servida
   por HTTP. `localhost` es la excepción, pero solo aplica en el dispositivo donde corre el servidor.
4. En Chrome/Android, usa **Instalar aplicación** o **Agregar a pantalla principal**.

El service worker de desarrollo permite comprobar el registro y la navegación SPA, pero Vite
sirve módulos de desarrollo y no representa la precarga offline final. Para verificar que todas
las páginas compiladas abren sin red:

```bash
npm run build
npm run preview -- --host 0.0.0.0
```

Instala/abre la aplicación una vez con conexión y luego desactiva la red: la interfaz y sus rutas
estáticas estarán disponibles; los datos que dependen de la API seguirán necesitando conectividad.

> `dev-dist/sw.js` es un artefacto generado en desarrollo y no se versiona.

---

## Estructura del proyecto

```
pa-la-vaca_front/
├── index.html
├── package.json / package-lock.json
├── vite.config.ts                Proxy /api y configuración PWA
├── eslint.config.js
├── tsconfig*.json
└── src/
    ├── assets/
    ├── components/               auth/, shared/ (dialogs, guards, tablas, etc.)
    ├── context/                  Auth, FarmScope, Notification, FormExitGuard
    ├── hooks/
    ├── layouts/                  SuperLayout, MainLayout
    ├── pages/
    │   ├── auth/                 Login, Registro, Recuperación
    │   ├── dashboard/
    │   ├── HatoModule/           Directorio, registro, detalle, edición
    │   ├── HealthModule/
    │   ├── FoodSuppliesModule/
    │   ├── FinancesModule/
    │   ├── AdministrationModule/ Potreros, lotes, usuarios, fincas, alertas, sync
    │   └── ProfileModule/
    ├── routes/AppRouter.tsx      Todas las rutas de la aplicación
    ├── services/                 apiClient, authService, hatoDataService, offlineDatabase, …
    ├── types/database.types.ts   Contratos de datos (Paddock, Lot, LotMovement, Animal, …)
    └── utils/
```

---

## Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| `401` en el desarrollo, pero funciona llamando directo a `:8080` | Cookie/CSRF regionada por el proxy de Vite | Verificar `CORS_ALLOWED_ORIGINS` en el backend y el header `X-XSRF-TOKEN`; comprobar la cookie `PALAVACA_SESSION` |
| "Sin fincas disponibles" al registrar un animal | `FarmScope` se carga de forma asíncrona, o no hay fincas | Esperar un momento o registrar una finca desde `/admin/fincas` |
| Los cambios no se reflejan sin conexión | Registro pendiente en la cola | Revisar `/admin/sincronizacion` y la conexión con el backend |
| El service worker no se instala en el celular | Origen HTTP que no es `localhost` | Servir por HTTPS (túnel de desarrollo) |
| El build falla por artefactos PWA | `dev-dist/sw.js` generado localmente | No versionarlo; regenerar con `npm run build` |
| Error de tipos en `npm run build` | Cambios sin tipar | Ejecutar `npx tsc --noEmit` y corregir antes de compilar |

---

## Relación con el backend

- API base en desarrollo: `http://localhost:8080/api/v1` (proxy `/api` en `vite.config.ts`).
- Convenciones: JSON `snake_case`, UUID, fechas ISO 8601, sesión HTTP + CSRF.
- Consulta `API_BACKEND_MAP.md` para el mapa pantalla → endpoint y los ejemplos de payload.
