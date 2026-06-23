# Mados Hotel System — Frontend

Interfaz web del sistema de gestión hotelera **Mados**: reservaciones,
habitaciones, huéspedes, inventario, facturación fiscal, caja y reportes.
Es una SPA que consume la [API del backend](../mados-hotel-system).

> ⚙️ **Nota sobre la autoría:** el **frontend** de este proyecto fue desarrollado
> **con asistencia de herramientas de IA**. La lógica de negocio del backend, en
> cambio, fue desarrollada principalmente por mi persona Douglas Aguilera.

---

## Tabla de contenidos

1. [Tecnologías](#tecnologías)
2. [Funcionalidades principales](#funcionalidades-principales)
3. [Requisitos](#requisitos)
4. [Instalación](#instalación)
5. [Configuración](#configuración)
6. [Ejecución](#ejecución)
7. [Estructura del proyecto](#estructura-del-proyecto)
8. [Autenticación en el cliente](#autenticación-en-el-cliente)

---

## Tecnologías

| Área               | Tecnología                                           |
| ------------------ | ---------------------------------------------------- |
| Librería UI        | React 19                                             |
| Bundler / dev      | Vite                                                 |
| Routing            | React Router DOM 7                                   |
| Estado de servidor | TanStack Query (React Query)                         |
| Estado global      | Zustand                                              |
| Cliente HTTP       | Axios                                                |
| Formularios        | React Hook Form + Zod (`@hookform/resolvers`)        |
| Estilos            | Tailwind CSS 4                                       |
| Componentes base   | Radix UI / shadcn (solo como wrappers estructurales) |
| Gráficos           | Recharts                                             |
| Notificaciones     | Sonner (toasts)                                      |
| Iconos             | Lucide React                                         |

> **Convención de UI del proyecto:** se prefieren elementos HTML nativos
> (`<input>`, `<button>`, `<select>`) con clases de Tailwind en lugar de los
> componentes genéricos de formulario de shadcn. shadcn/Radix se usa solo como
> envoltura estructural (p. ej. `Dialog` para modales).

---

## Funcionalidades principales

- **Autenticación** con login y, para SUPERADMIN, selección de hotel.
- **Dashboard** con métricas y resúmenes del hotel.
- **Reservaciones**: crear, check-in, check-out, cargos a la estancia.
- **Habitaciones**: estado, tipos y gestión.
- **Huéspedes y empresas** (clientes a crédito).
- **Inventario**: productos, categorías, stock y movimientos.
- **Facturación**: punto de venta unificado (`/invoices/new`), emisión de
  facturas y consumidor final, notas de crédito y anulaciones.
- **Restaurante**: gestión del menú.
- **Caja**: turnos y recolección de efectivo.
- **Reportes**: incluidos los reportes para el SAR.
- **Usuarios**: administración de cuentas y roles.

> El **punto de venta es la propia factura**: los ítems de menú, productos y
> cargos de habitación se agregan directamente en `/invoices/new`.

---

## Requisitos

- **Node.js 20+**
- **pnpm**
- El **backend** corriendo y accesible (ver su README).

---

## Instalación

```bash
cd mados-hotel-frontend
pnpm install
```

---

## Configuración

Crea un archivo `.env` en `mados-hotel-frontend/` apuntando a la API:

```bash
VITE_API_URL=http://localhost:3000/api
```

> En producción, apunta `VITE_API_URL` a la URL pública del backend. Las
> variables de Vite deben empezar con el prefijo `VITE_` para exponerse al
> cliente. El cliente Axios central (`src/api/axios.api.js`) usa esta variable.

---

## Ejecución

```bash
pnpm dev       # servidor de desarrollo con HMR
pnpm build     # build de producción (genera /dist)
pnpm preview   # sirve el build de producción localmente
pnpm lint      # ESLint
```

---

## Estructura del proyecto

```
mados-hotel-frontend/
├── index.html
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── api/              # un archivo por recurso + axios.api.js (cliente central)
│   ├── store/           # estado global con Zustand (auth.store.js)
│   ├── routes/          # AppRouter.jsx (definición de rutas y guards)
│   ├── pages/           # vistas por dominio (dashboard, invoices, reservation, …)
│   ├── components/      # componentes agrupados por dominio + shared/ y layout/
│   ├── hooks/           # hooks de datos (TanStack Query) y lógica reutilizable
│   ├── utils/           # utilidades varias
│   └── assets/          # imágenes y estáticos
└── public/
```

**Patrón de datos:** cada recurso tiene su archivo en `src/api/` (llamadas
Axios) y un hook en `src/hooks/` que envuelve esas llamadas con TanStack Query
(cache, estados de carga, invalidación). Los componentes consumen los hooks, no
Axios directamente.

---

## Autenticación en el cliente

- Tras el login, el token JWT se guarda en el store de Zustand
  (`src/store/auth.store.js`) y se adjunta a cada petición mediante el
  interceptor de Axios (`Authorization: Bearer <token>`).
- Para **SUPERADMIN**, el login devuelve un token temporal y la lista de
  hoteles; tras elegir hotel se obtiene el token final.
- Las rutas protegidas se controlan en `src/routes/AppRouter.jsx`; el rol del
  usuario determina qué secciones del menú y qué páginas son visibles.

---

_Proyecto interno para gestión hotelera. El frontend fue construido con
asistencia de herramientas de IA._
