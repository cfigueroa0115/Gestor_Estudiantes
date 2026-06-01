# Portal de Gestión de Estudiantes UCC

**Universidad Cooperativa de Colombia - Programa de Ingeniería Industrial**

Sistema web full-stack para la gestión integral de solicitudes estudiantiles, administración de usuarios, semaforización de tiempos y trazabilidad completa.

© Mgtr. Carlos Alberto Figueroa

---

## 🌐 URLs de Producción

| Recurso | URL |
|---------|-----|
| Portal Principal | https://gestor-estudiantes-ucc.vercel.app |
| Autogestión (QR) | https://gestor-estudiantes-ucc.vercel.app/autogestion |
| Dashboard Analítico | https://gestor-estudiantes-ucc.vercel.app/dashboard/analytics |
| GitHub (Privado) | https://github.com/cfigueroa0115/Gestor_Estudiantes |
| Vercel Dashboard | https://vercel.com/carlos-figueroas-projects-77a0a373/gestor-estudiantes-ucc |

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS + shadcn/ui |
| Animaciones | Framer Motion |
| Base de datos | PostgreSQL (Neon Serverless) |
| ORM | Prisma 7 + PrismaNeon Adapter |
| Validación | Zod + React Hook Form |
| Autenticación | JWT (jose) + HTTP-only Cookies + bcryptjs |
| Email | Resend API (dual keys) |
| Gráficos | Recharts |
| Despliegue | Vercel (auto-deploy desde GitHub) |
| Testing | Vitest + fast-check |

---

## 📋 Módulos Funcionales

### 1. Landing Page
- Branding institucional UCC (paleta aguamarina, verde, blanco, gris)
- Animaciones Framer Motion con soporte prefers-reduced-motion
- Glassmorphism cards con hover effects
- Botón "Ingresa aquí" → Login Modal
- Footer con copyright

### 2. Autenticación
- Login con usuario numérico, contraseña y cargo
- JWT en cookie HTTP-only (8h TTL)
- Bloqueo de cuenta tras 5 intentos fallidos (15 min)
- Prevención de enumeración de usuarios (respuestas genéricas)
- Middleware de protección de rutas privadas
- Control de roles (ROLE_RESTRICTIONS_ENABLED)

### 3. Dashboard Principal
- Título "Gestor de estudiantes - Programa de Ingeniería Industrial"
- 3 tarjetas de módulos:
  - **Radicar solicitud salas virtuales** (activa)
  - **Gestionar solicitudes creadas** (activa)
  - Gestión salas administrativas (próximamente)
- Botón "Administración de usuarios"
- Botón "Dashboard" (solo admins, con shimmer animado)
- Avatar de usuario con indicador online verde
- Nombre completo del usuario en header

### 4. Radicar Solicitudes Estudiantiles
- Formulario en 2 columnas responsive
- Campos condicionales (tipo solicitud → sub-tipo)
- Contador de caracteres en vivo (1200 max)
- Validación dual frontend + backend (Zod)
- Autocarga de datos del estudiante por ID
- Campos no editables cuando el estudiante existe en BD
- Número de radicado alfanumérico (RAD-YYYYMMDD-XXXXX)
- Popup de confirmación con número de radicado
- Escalamiento automático con envío de correo

### 5. Autogestión Estudiantil (QR)
- Acceso público sin autenticación
- Solo permite radicar solicitudes (sin ver otras)
- Misma funcionalidad de autocarga por ID
- Popup de radicado al registrar
- URL: /autogestion

### 6. Gestionar Solicitudes
- Tabla completa con todas las columnas
- Botón "Gestionar" con contador de gestiones (colores dinámicos)
- Modal de gestión con datos en solo lectura
- Cambio de estado: En progreso, Cerrada
- Campo observaciones obligatorio (1200 chars)
- Trazabilidad de fecha de gestión

### 7. Administración de Usuarios
- Tabla con columnas: Usuario, Nombre, Cargo, Organización, Estado, Creado, Último acceso
- Crear usuario (validación Zod)
- Editar cargo y contraseña
- Activar/Desactivar (soft delete)
- Filtros: búsqueda, cargo, estado
- Paginación: 10, 25, 50

### 8. Dashboard Analítico (Solo Admins)
- KPI Cards: Total, Radicadas, Escaladas, En progreso
- Semaforización: A tiempo, En riesgo, Vencidas (con glow animado)
- Gráfico Donut de semaforización con porcentajes
- Popup de detalle al hacer clic (navega a gestión)
- Gráfico de barras por tipo de solicitud
- Gráfico de barras por modalidad
- Donut de áreas de escalamiento
- Timeline de solicitudes (últimos 30 días)
- Solo visible para usuarios: 1129564302, 52317897

### 9. Exportación CSV
- UTF-8 BOM + delimitador semicolón
- Headers en español
- Incluye: Radicado, Semaforización, Días en estado, Alerta enviada
- Filtros activos aplicados
- Solo visible para admins

### 10. Sistema de Correo Electrónico
- Proveedor: Resend API (dual keys)
- Correo de escalamiento (tema verde/aguamarina)
- Correo de alerta de vencimiento (tema rojo)
- Logo UCC en correos
- Destinatarios configurables por área
- No falla la solicitud si el correo falla

---

## 🚦 Sistema de Semaforización

| Estado | Tiempo máximo | En riesgo (🟡) | Vencida (🔴) |
|--------|--------------|----------------|--------------|
| Radicada | 1 día | - | >1 día |
| En progreso | 2 días | >1 día | >2 días |
| Escalada | 5 días | >3 días | >5 días |

- Badges animados con glow (rojo/amarillo)
- Columna "Semaforización" al inicio de tablas
- Endpoint de verificación: GET /api/student-requests/check-expired
- Correo automático de alerta al vencer

---

## 🔒 Seguridad

### Protección del código
- Repositorio GitHub **privado**
- Source maps deshabilitados en producción
- `poweredByHeader: false`

### Headers de seguridad
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HSTS)
- X-XSS-Protection
- X-Robots-Tag: noindex, nofollow, noarchive
- Referrer-Policy: strict-origin-when-cross-origin

### Protección anti-bots/RPA
- Detección de Selenium, Puppeteer, Playwright, PhantomJS
- Bloqueo de user-agents de scrapers
- Detección de webdriver flag

### Protección del cliente
- F12 / DevTools bloqueado
- Clic derecho deshabilitado
- Selección de texto bloqueada (excepto inputs)
- Copiar contenido bloqueado
- Ctrl+U / Ctrl+S bloqueado
- Arrastrar elementos bloqueado

### Protección de datos
- DELETE bloqueado en middleware
- No hay seed automático en deploys
- Soft delete para usuarios (nunca eliminación física)
- JWT con expiración 8h
- Cookies HTTP-only, Secure, SameSite

---

## 📊 Base de Datos

### Modelos
- **User** - Usuarios del sistema (11 registros)
- **StudentRequest** - Solicitudes estudiantiles
- **Estudiante** - Catálogo de estudiantes (171 registros)

### Campos de trazabilidad
- `created_at`, `updated_at` - Timestamps automáticos
- `created_by`, `updated_by` - Quién creó/modificó
- `estado_solicitud`, `estado_solicitud_fecha` - Estado y cuándo cambió
- `gestion_count` - Número de gestiones realizadas
- `observaciones` - Notas de gestión
- `alerta_vencimiento_enviada` - Si se envió alerta
- `numero_radicado` - Identificador único de solicitud

---

## 🔌 APIs

| Endpoint | Método | Descripción | Auth |
|----------|--------|-------------|------|
| /api/auth/login | POST | Autenticación | Público |
| /api/auth/logout | POST | Cerrar sesión | Público |
| /api/auth/me | GET | Info usuario actual | Privado |
| /api/users | GET | Listar usuarios | Privado |
| /api/users | POST | Crear usuario | Privado |
| /api/users/[id] | PATCH | Editar usuario | Privado |
| /api/users/[id]/status | PATCH | Activar/Desactivar | Privado |
| /api/student-requests | GET | Listar solicitudes | Privado |
| /api/student-requests | POST | Crear solicitud | Privado |
| /api/student-requests/export | GET | Exportar CSV | Privado |
| /api/student-requests/stats | GET | Estadísticas | Privado |
| /api/student-requests/check-expired | GET | Verificar vencidas | Privado |
| /api/student-requests/[id]/manage | PATCH | Gestionar solicitud | Privado |
| /api/estudiantes/[id] | GET | Buscar estudiante | Público |
| /api/autogestion | POST | Crear solicitud (QR) | Público |

---

## 🚀 Despliegue

El proyecto se despliega automáticamente en Vercel con cada push a `master`.

### Variables de entorno (Vercel)
```
DATABASE_URL
JWT_SECRET
ROLE_RESTRICTIONS_ENABLED
RESEND_API_KEY_SANDRA
RESEND_API_KEY_CARLOS
EMAIL_FROM
```

### Comandos de desarrollo
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run lint         # ESLint
npm test             # Vitest (240 tests)
```

---

## 👥 Usuarios del Sistema

### Administradores (pueden ver Dashboard y Exportar CSV)
- **1129564302** - Carlos Alberto Figueroa Martinez (Profesor)
- **52317897** - Sandra Patricia Rodriguez Acevedo (Jefe)

### Contraseña por defecto
`Lifl172023Cf` (bcrypt 12 rounds)

---

## 📱 Acceso por QR (Autogestión)

URL del QR: `https://gestor-estudiantes-ucc.vercel.app/autogestion`

Permite a estudiantes radicar solicitudes sin autenticación. Solo pueden diligenciar y radicar, sin acceso a ninguna otra funcionalidad.

---

## 📝 Licencia

Desarrollo propietario. © Mgtr. Carlos Alberto Figueroa - Universidad Cooperativa de Colombia.
Todos los derechos reservados. Prohibida su reproducción total o parcial.
