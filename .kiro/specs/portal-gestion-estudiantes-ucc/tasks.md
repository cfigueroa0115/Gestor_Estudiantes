# Implementation Plan: Portal de Gestión de Estudiantes UCC

## Overview

Implementación incremental del portal full-stack con Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, PostgreSQL (Neon), y Prisma ORM. El plan sigue un enfoque bottom-up: primero la infraestructura y modelos de datos, luego autenticación, después los módulos funcionales, y finalmente integración y testing.

## Tasks

- [x] 1. Configuración del proyecto y estructura base
  - [x] 1.1 Inicializar proyecto Next.js 14 con TypeScript, Tailwind CSS, y configurar estructura de directorios
    - Crear proyecto con `create-next-app` usando App Router
    - Configurar `tailwind.config.ts` con la paleta institucional UCC (aguamarina, verde, blanco, gris)
    - Instalar dependencias: shadcn/ui, framer-motion, prisma, @prisma/client, zod, react-hook-form, @hookform/resolvers, bcryptjs, jose, fast-check
    - Crear estructura de carpetas: `src/app/`, `src/components/`, `src/lib/`, `src/types/`, `tests/`
    - Crear archivo `.env.example` con variables: DATABASE_URL, JWT_SECRET, ROLE_RESTRICTIONS_ENABLED
    - Configurar `.gitignore` para excluir `.env`
    - _Requirements: 11.5, 12.1_

  - [x] 1.2 Configurar Prisma schema con modelos User y StudentRequest
    - Crear `prisma/schema.prisma` con enums (Cargo, Estado, Modalidad, TipoSolicitud)
    - Definir modelo User con todos los campos: id, usuario, password_hash, cargo, estado, timestamps, failed_attempts, locked_until, relaciones self-referential
    - Definir modelo StudentRequest con todos los campos y relación a User (onDelete: Restrict)
    - Configurar unique constraint en usuario
    - _Requirements: 9.1, 9.2, 10.1, 10.2_

  - [x] 1.3 Crear seed de base de datos con usuario inicial
    - Crear `prisma/seed.ts` con usuario "1129564302", password hasheada con bcryptjs 12 rounds, cargo "Docente", estado "Activo"
    - Configurar script de seed en `package.json`
    - _Requirements: 9.3_

  - [x] 1.4 Configurar Prisma client singleton y tipos TypeScript
    - Crear `src/lib/prisma.ts` con singleton pattern para evitar múltiples instancias en desarrollo
    - Crear `src/types/index.ts` con interfaces: JWTPayload, LoginRequest, AuthResponse, PaginatedResponse, CreateUserRequest, UpdateUserRequest, CreateStudentRequestBody, StudentRequestsQueryParams, UsersQueryParams
    - _Requirements: 9.1, 10.1_

  - [x] 1.5 Configurar Vitest y fast-check para testing
    - Crear `vitest.config.ts` con environment node y globals true
    - Crear estructura de carpetas de tests: `tests/unit/`, `tests/properties/`, `tests/integration/`
    - Verificar que fast-check se ejecuta correctamente con un test trivial
    - _Requirements: (infraestructura de testing)_

- [x] 2. Módulo de autenticación
  - [x] 2.1 Implementar librería de autenticación (`src/lib/auth.ts`)
    - Implementar `signToken` usando jose para crear JWT con payload (id, usuario, cargo) y expiración 8h
    - Implementar `verifyToken` para validar y decodificar JWT
    - Implementar `setSessionCookie` para crear cookie HTTP-only, Secure en producción, maxAge 8h
    - Implementar `clearSessionCookie` para eliminar la cookie de sesión
    - Implementar `getSessionFromCookie` para extraer y verificar JWT de las cookies
    - Implementar `hashPassword` y `comparePassword` usando bcryptjs con 12 salt rounds
    - _Requirements: 2.3, 2.7, 2.8, 3.7, 3.8_

  - [x]* 2.2 Write property tests for authentication core (Properties 1-4)
    - **Property 1: Authentication requires all conditions to match**
    - **Property 2: User enumeration prevention via uniform error responses**
    - **Property 3: Passwords are never stored as plaintext**
    - **Property 4: Account lockout after consecutive failures**
    - **Validates: Requirements 2.2, 2.4, 2.5, 2.8, 2.9**

  - [x] 2.3 Implementar API POST /api/auth/login
    - Crear `src/app/api/auth/login/route.ts`
    - Validar request body con Zod schema (usuario, contrasena, cargo)
    - Buscar usuario en DB por campo "usuario"
    - Verificar: usuario existe, estado Activo, cargo coincide, password coincide
    - Implementar lógica de bloqueo: 5 intentos fallidos → locked_until = now + 15min
    - En éxito: resetear failed_attempts, actualizar last_login_at, generar JWT, setear cookie
    - En fallo: respuesta genérica idéntica para todos los casos (prevenir enumeración)
    - _Requirements: 2.2, 2.4, 2.5, 2.9, 3.5, 11.6_

  - [x] 2.4 Implementar API POST /api/auth/logout y GET /api/auth/me
    - Crear `src/app/api/auth/logout/route.ts`: limpiar cookie y retornar success
    - Crear `src/app/api/auth/me/route.ts`: extraer JWT de cookie, retornar id, usuario, cargo, estado
    - Retornar 401 si cookie inválida/expirada
    - _Requirements: 3.3, 3.4, 3.6_

  - [x]* 2.5 Write property tests for session and token validation (Properties 5-7)
    - **Property 5: Invalid tokens on private routes trigger redirect**
    - **Property 6: Invalid tokens on API routes return 401**
    - **Property 7: /me endpoint faithfully returns JWT payload**
    - **Validates: Requirements 2.10, 3.1, 3.2, 3.3, 3.4**

  - [x] 2.6 Implementar middleware de protección de rutas (`src/middleware.ts`)
    - Definir PRIVATE_ROUTES y PRIVATE_API_ROUTES
    - Extraer token de cookie, verificar con jose
    - Rutas de página: redirect a "/" si token inválido
    - Rutas API: retornar 401 JSON si token inválido
    - Implementar lógica de roles: leer ROLE_RESTRICTIONS_ENABLED, evaluar cargo contra permitted-roles por ruta
    - Si ROLE_RESTRICTIONS_ENABLED=false, permitir acceso a todos los autenticados
    - Si ROLE_RESTRICTIONS_ENABLED=true y cargo no permitido, retornar 403
    - _Requirements: 3.1, 3.2, 13.2, 13.3, 13.4, 13.5_

  - [x]* 2.7 Write property test for role-based access control (Property 27)
    - **Property 27: Role-based access control respects feature flag**
    - **Validates: Requirements 13.3, 13.5**

- [x] 3. Checkpoint - Verificar autenticación
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Esquemas de validación compartidos
  - [x] 4.1 Crear Zod schemas para autenticación y usuarios
    - Crear `src/lib/validations/auth.schema.ts` con loginSchema (usuario numérico, contrasena, cargo enum)
    - Crear `src/lib/validations/user.schema.ts` con createUserSchema (usuario numérico 5-20 chars, password min 8 chars, cargo enum) y updateUserSchema (cargo opcional, password opcional)
    - _Requirements: 6.3, 11.1_

  - [x] 4.2 Crear Zod schema para solicitudes estudiantiles
    - Crear `src/lib/validations/student-request.schema.ts`
    - Validar campos obligatorios: fecha_solicitud, id_estudiante (max 10 dígitos), nombres (max 100), apellidos (max 100), correo (email), celular (max 15 dígitos), programa, modalidad, tipo_solicitud, descripcion_solicitud (max 1200), requiere_escalar
    - Implementar validación condicional: solicitud_academica requerida si tipo=Académico, solicitud_financiera requerida si tipo=Financiero, area_escalar requerida si requiere_escalar=true
    - Campos condicionales no aplicables deben ser null
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.7, 5.8, 5.9, 5.10_

  - [x]* 4.3 Write property tests for validation schemas (Properties 8, 10, 12)
    - **Property 8: Conditional field visibility and persistence**
    - **Property 10: Frontend and backend validation schema consistency**
    - **Property 12: User creation validation with uniqueness enforcement**
    - **Validates: Requirements 5.3, 5.4, 5.5, 5.7, 5.8, 6.3, 6.8, 11.1**

- [x] 5. Módulo de administración de usuarios
  - [x] 5.1 Implementar API GET /api/users (listado con paginación y filtros)
    - Crear `src/app/api/users/route.ts` con handler GET
    - Implementar paginación: page, pageSize (10, 25, 50), calcular totalPages y totalRecords
    - Implementar filtros: usuario (partial match con contains), cargo (exact), estado (exact)
    - Retornar PaginatedResponse con datos de usuarios (sin password_hash)
    - _Requirements: 6.1, 6.2, 6.9_

  - [x] 5.2 Implementar API POST /api/users (crear usuario)
    - Validar body con createUserSchema (Zod)
    - Verificar unicidad de usuario → 409 si existe
    - Hashear password con bcryptjs 12 rounds
    - Crear registro con created_by = authenticated user id
    - Retornar 201 con usuario creado (sin password_hash)
    - _Requirements: 6.3, 6.7, 6.8, 6.9_

  - [x] 5.3 Implementar API PATCH /api/users/[id] y PATCH /api/users/[id]/status
    - Crear `src/app/api/users/[id]/route.ts` para edición: actualizar cargo y/o password (si password vacío, preservar hash existente)
    - Crear `src/app/api/users/[id]/status/route.ts` para activar/desactivar
    - Desactivar: estado=Inactivo, disabled_at=now
    - Reactivar: estado=Activo, disabled_at=null
    - Registrar updated_by = authenticated user id en ambos casos
    - Retornar 404 si usuario no existe
    - _Requirements: 6.4, 6.5, 6.6, 6.7, 6.9, 6.10_

  - [x]* 5.4 Write property tests for user administration (Properties 11, 13-15)
    - **Property 11: User list filter correctness**
    - **Property 13: Empty password on edit preserves existing hash**
    - **Property 14: Disable then reactivate restores active state**
    - **Property 15: Audit fields recorded on every modification**
    - **Validates: Requirements 6.2, 6.4, 6.5, 6.6, 6.7**

- [x] 6. Módulo de solicitudes estudiantiles (API)
  - [x] 6.1 Implementar API POST /api/student-requests (crear solicitud)
    - Crear `src/app/api/student-requests/route.ts` con handler POST
    - Validar body con studentRequestSchema (Zod)
    - Si validación falla: retornar 400 con errores por campo
    - Si validación pasa: insertar en DB con created_by_user_id = authenticated user id
    - Retornar 201 con id del registro creado
    - _Requirements: 10.3, 10.4_

  - [x] 6.2 Implementar API GET /api/student-requests (listado con filtros y paginación)
    - Implementar paginación: page, pageSize (10, 25, 50)
    - Implementar filtros: search (partial match en nombres, apellidos, correo, id_estudiante, descripcion), fechaDesde/fechaHasta, idEstudiante (exact), tipoSolicitud, modalidad, areaEscalar
    - Implementar sorting: sortBy + sortOrder (default: created_at desc)
    - Incluir datos del usuario creador (usuario, cargo) via join
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x]* 6.3 Write property tests for student requests (Properties 16-18, 23-24)
    - **Property 16: Student request filter correctness**
    - **Property 17: Pagination correctness**
    - **Property 18: Sorting correctness**
    - **Property 23: Valid POST creates student request record**
    - **Property 24: Invalid POST returns 400 with field-level errors**
    - **Validates: Requirements 7.3, 7.4, 7.5, 10.3, 10.4**

  - [x] 6.4 Implementar API GET /api/student-requests/export (exportación CSV)
    - Crear `src/app/api/student-requests/export/route.ts`
    - Aplicar mismos filtros que el listado (sin paginación, todos los registros)
    - Generar CSV con UTF-8 BOM, delimitador semicolón (;)
    - Usar headers en español según especificación
    - Generar filename con patrón: gestion_estudiantes_salas_virtuales_YYYY-MM-DD_HH-mm.csv
    - Incluir usuario y cargo del creador en cada fila
    - Si no hay registros: retornar CSV con solo headers
    - Retornar Content-Type: text/csv; charset=utf-8 y Content-Disposition: attachment
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

  - [x]* 6.5 Write property tests for CSV export (Properties 20-22)
    - **Property 20: CSV format compliance (BOM and delimiter)**
    - **Property 21: CSV filename follows date pattern**
    - **Property 22: CSV rows include creator traceability data**
    - **Validates: Requirements 8.2, 8.3, 8.5, 8.6**

- [x] 7. Checkpoint - Verificar APIs completas
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Landing Page y componentes UI base
  - [x] 8.1 Implementar Landing Page con branding UCC y animaciones
    - Crear `src/app/page.tsx` como Server Component con client islands
    - Crear `src/components/landing/HeroSection.tsx` con animaciones Framer Motion (duración ≤ 800ms)
    - Crear `src/components/landing/GlassmorphismCards.tsx` con gradient borders y hover scale/elevation
    - Crear footer con copyright "© Mgtr. Carlos Alberto Figueroa"
    - Implementar botón "Ingresa aquí" que abre LoginModal
    - Implementar responsive: mobile (≤768px), tablet (769-1024px), desktop (≥1025px)
    - Respetar prefers-reduced-motion: deshabilitar animaciones si está activo
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 12.1, 12.3, 12.4, 12.7_

  - [x] 8.2 Implementar Login Modal con formulario de autenticación
    - Crear `src/components/auth/LoginModal.tsx`
    - Campos: usuario (input numérico), contraseña (password con toggle show/hide), cargo (dropdown: Docente, Jefe, Administrativo)
    - Validación con React Hook Form + Zod (loginSchema)
    - Submit: llamar POST /api/auth/login, mostrar loading, manejar errores genéricos
    - En éxito: redirect a /dashboard
    - Mostrar error si modal falla al cargar (Req 1.7)
    - _Requirements: 2.1, 2.2, 2.5, 12.5_

  - [x] 8.3 Implementar componentes compartidos (loading, error, empty states)
    - Crear `src/components/shared/LoadingSpinner.tsx` y `LoadingSkeleton.tsx`
    - Crear `src/components/shared/ErrorState.tsx` con mensaje y botón retry
    - Crear `src/components/shared/EmptyState.tsx` con mensaje configurable
    - Crear `src/components/shared/Toast.tsx` para notificaciones (success/error, 5s duration)
    - Crear `src/lib/utils.ts` con función de sanitización HTML (escapar <, >, &, ", ')
    - _Requirements: 12.6, 11.7_

  - [x]* 8.4 Write property tests for security utilities (Properties 25-26)
    - **Property 25: Error responses never expose internal details**
    - **Property 26: HTML entity sanitization**
    - **Validates: Requirements 11.4, 11.7**

- [x] 9. Dashboard y módulos de UI
  - [x] 9.1 Implementar Dashboard principal
    - Crear `src/app/dashboard/layout.tsx` con verificación de autenticación (client-side check via /api/auth/me)
    - Crear `src/app/dashboard/page.tsx` con título "Gestor de estudiantes" y subtítulo "Programa de Ingeniería Industrial"
    - Crear `src/components/dashboard/DashboardHeader.tsx` con logo UCC, info usuario (usuario, cargo), botón logout
    - Crear `src/components/dashboard/ModuleCards.tsx` con 3 cards: "Gestión salas virtuales" (activa), "Gestión salas docentes" (disabled, "Próximamente"), "Gestión salas administrativas" (disabled, "Próximamente")
    - Botón "Administración de usuarios" que navega a /dashboard/users
    - Click en card disabled muestra mensaje "Módulo en construcción"
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x] 9.2 Implementar módulo de administración de usuarios (UI)
    - Crear `src/app/dashboard/users/page.tsx`
    - Crear `src/components/users/UserTable.tsx` con tabla paginada (columnas: usuario, cargo, estado, created_at, last_login_at)
    - Crear `src/components/users/UserFilters.tsx` con filtros: búsqueda por usuario, dropdown cargo, dropdown estado
    - Crear `src/components/users/CreateUserModal.tsx` con formulario validado (React Hook Form + Zod)
    - Crear `src/components/users/EditUserModal.tsx` para editar cargo y password
    - Implementar confirmación de desactivación/reactivación con dialog modal
    - Paginación: default 10, opciones 10/25/50
    - Estados: loading skeleton, empty state, error con retry
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.8, 12.6_

  - [x] 9.3 Implementar formulario de solicitud estudiantil (UI)
    - Crear `src/components/requests/StudentRequestFormModal.tsx`
    - Sección 1: fecha_solicitud (readonly, auto YYYY-MM-DD), id_estudiante, nombres, apellidos, correo, celular
    - Sección 2: programa (readonly "Ingeniería industrial"), modalidad (dropdown), tipo_solicitud (dropdown)
    - Campos condicionales: solicitud_academica (si tipo=Académico), solicitud_financiera (si tipo=Financiero), ocultar ambos si tipo=Certificados
    - Textarea descripcion_solicitud con contador de caracteres en vivo (1200 - N restantes)
    - Campo requiere_escalar (Si/No) + area_escalar dropdown condicional
    - Validación con React Hook Form + Zod (studentRequestSchema)
    - Submit: loading indicator, botón deshabilitado, prevenir double-submit
    - Éxito: cerrar modal, toast success 5s
    - Error: re-habilitar botón, toast error
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 5.12, 5.13_

  - [x]* 9.4 Write property test for character counter (Property 9)
    - **Property 9: Character counter accuracy**
    - **Validates: Requirements 5.6**

  - [x] 9.5 Implementar visor de solicitudes estudiantiles (UI)
    - Crear `src/app/dashboard/requests/page.tsx`
    - Crear `src/components/requests/RequestTable.tsx` con todas las columnas especificadas
    - Crear `src/components/requests/RequestFilters.tsx` con filtros: búsqueda general, rango de fechas, id_estudiante, tipo_solicitud, modalidad, area_escalar
    - Implementar sorting por columnas (click en header, asc/desc)
    - Paginación: default 10, opciones 10/25/50, mostrar página actual, total páginas, total registros
    - Campos null (solicitud_academica, solicitud_financiera, area_escalar) mostrar como vacío (no "null"/"undefined")
    - Botón de exportar CSV que llama a GET /api/student-requests/export con filtros activos
    - Estados: loading skeleton, empty state "No se encontraron solicitudes", error con retry
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 8.7, 8.9_

  - [x]* 9.6 Write property test for null field rendering (Property 19)
    - **Property 19: Null conditional fields render as empty**
    - **Validates: Requirements 7.9**

- [x] 10. Integración final y wiring
  - [x] 10.1 Conectar flujo completo Landing → Login → Dashboard → Módulos
    - Verificar que el botón "Ingresa aquí" abre el modal de login
    - Verificar que login exitoso redirige a /dashboard
    - Verificar que "Gestión salas virtuales" abre el formulario de solicitud
    - Verificar que "Administración de usuarios" navega a /dashboard/users
    - Verificar que logout limpia cookie y redirige a Landing
    - Verificar que acceso a rutas privadas sin sesión redirige a Landing
    - _Requirements: 1.2, 2.3, 2.6, 4.5, 4.6_

  - [x] 10.2 Implementar manejo global de errores y estados HTTP
    - Crear error boundary global para errores no capturados
    - Verificar que errores 500 retornan mensaje genérico "Ha ocurrido un error interno. Intente nuevamente." sin detalles internos
    - Verificar códigos HTTP correctos: 400 (validación), 401 (no autenticado), 403 (no autorizado), 404 (no encontrado), 500 (error interno)
    - Verificar que todas las queries usan Prisma parameterized queries (prevención SQL injection)
    - _Requirements: 11.2, 11.3, 11.4_

- [x] tasak final - Verificar integración completa
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The project uses TypeScript throughout (frontend and backend)
- All Zod schemas are shared between frontend and backend for validation consistency
- Prisma parameterized queries are used exclusively to prevent SQL injection
- The seed user password "Lifl172023Cf" must be hashed with bcryptjs 12 rounds (never stored as plaintext)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.5"] },
    { "id": 2, "tasks": ["1.3", "1.4"] },
    { "id": 3, "tasks": ["2.1", "4.1", "4.2"] },
    { "id": 4, "tasks": ["2.2", "2.3", "4.3"] },
    { "id": 5, "tasks": ["2.4", "2.5", "2.6"] },
    { "id": 6, "tasks": ["2.7", "5.1", "5.2"] },
    { "id": 7, "tasks": ["5.3", "5.4", "6.1"] },
    { "id": 8, "tasks": ["6.2", "6.4"] },
    { "id": 9, "tasks": ["6.3", "6.5", "8.1"] },
    { "id": 10, "tasks": ["8.2", "8.3"] },
    { "id": 11, "tasks": ["8.4", "9.1"] },
    { "id": 12, "tasks": ["9.2", "9.3"] },
    { "id": 13, "tasks": ["9.4", "9.5"] },
    { "id": 14, "tasks": ["9.6", "10.1"] },
    { "id": 15, "tasks": ["10.2"] }
  ]
}
```
