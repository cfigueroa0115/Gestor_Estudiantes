# Requirements Document

## Introduction

Portal de Gestión de Estudiantes para el programa de Ingeniería Industrial de la Universidad Cooperativa de Colombia (UCC). Aplicación web full-stack construida con Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, PostgreSQL (Neon), y Prisma ORM. El sistema permite a docentes, jefes y administrativos gestionar solicitudes estudiantiles, administrar usuarios y exportar datos en formato CSV. Desplegado en Vercel con repositorio en GitHub.

© Mgtr. Carlos Alberto Figueroa

## Glossary

- **Portal**: La aplicación web completa "Portal de Gestión de Estudiantes"
- **Landing_Page**: Página pública institucional con branding UCC y acceso al login
- **Auth_System**: Sistema de autenticación basado en cookies HTTP-only seguras
- **Dashboard**: Página privada principal con acceso a los módulos del sistema
- **Student_Request_Form**: Modal con formulario dinámico para registrar solicitudes estudiantiles
- **User_Admin**: Módulo de administración de usuarios (CRUD sin eliminación física)
- **Request_Viewer**: Tabla de visualización de solicitudes con filtros y paginación
- **CSV_Exporter**: Módulo de exportación de datos a formato CSV con codificación UTF-8 BOM
- **Session_Cookie**: Cookie HTTP-only segura utilizada para mantener la sesión del usuario
- **Neon_DB**: Base de datos PostgreSQL alojada en Neon
- **Prisma**: ORM utilizado para interactuar con la base de datos
- **Zod_Schema**: Esquema de validación definido con la librería Zod
- **User**: Registro en la tabla users con campos usuario, password_hash, cargo, estado
- **Student_Request**: Registro en la tabla student_requests con datos de la solicitud estudiantil
- **Cargo**: Rol del usuario en el sistema (Docente, Jefe, Administrativo)
- **Estado**: Estado del usuario (Activo, Inactivo)
- **Tipo_Solicitud**: Categoría de solicitud estudiantil (Académico, Financiero, Certificados)
- **Modalidad**: Modalidad del programa (Presencial, Virtual, Funza)

## Requirements

### Requirement 1: Landing Page Institucional

**User Story:** Como usuario visitante, quiero ver una página de inicio institucional moderna y animada con branding UCC, para identificar el sistema y acceder al login.

#### Acceptance Criteria

1. THE Landing_Page SHALL display institutional UCC branding with aguamarina, green, white, and gray color palette applied consistently to backgrounds, text, and UI components
2. WHEN the user clicks the "Ingresa aquí" button, THE Landing_Page SHALL open the login modal within 1 second, where the button is visible above the fold without scrolling on all supported viewports
3. THE Landing_Page SHALL display a footer containing the copyright text "© Mgtr. Carlos Alberto Figueroa"
4. THE Landing_Page SHALL render entry animations on page load using Framer Motion transitions with a duration no longer than 800 milliseconds per element, applied to cards and hero section content
5. THE Landing_Page SHALL display glassmorphism cards with gradient borders, where each card increases in scale or elevation on hover to provide visual feedback of interactivity
6. THE Landing_Page SHALL be responsive across mobile (viewport width ≤ 768px), tablet (769px–1024px), and desktop (≥ 1025px) viewports without horizontal overflow or content truncation
7. IF the login modal fails to load when the "Ingresa aquí" button is clicked, THEN THE Landing_Page SHALL display an error message indicating the action could not be completed and the button SHALL remain interactive for retry

### Requirement 2: Autenticación de Usuarios

**User Story:** Como usuario del sistema (Docente/Jefe/Administrativo), quiero autenticarme con mi usuario numérico, contraseña y cargo, para acceder a las funcionalidades privadas del portal.

#### Acceptance Criteria

1. WHEN the user clicks "Ingresa aquí", THE Auth_System SHALL display a login modal with fields: usuario (numeric input), contraseña (password with show/hide toggle), and cargo (dropdown with options Docente, Jefe, Administrativo)
2. WHEN credentials are submitted, THE Auth_System SHALL validate that the usuario exists, the password hash matches the stored hash, the cargo matches the record, and the estado is Activo, completing validation within 5 seconds
3. WHEN authentication succeeds, THE Auth_System SHALL create a Session_Cookie as an HTTP-only cookie with the secure flag enabled in production, with a maximum lifetime of 8 hours, after which the session is automatically invalidated
4. IF the user estado is Inactivo, THEN THE Auth_System SHALL reject the login attempt and display a generic authentication error message without revealing that the account is inactive
5. IF the usuario, contraseña, or cargo do not match any active record, THEN THE Auth_System SHALL display a generic authentication error message identical in wording and response time to the inactive-account error to prevent user enumeration
6. WHEN the user clicks logout, THE Auth_System SHALL invalidate the Session_Cookie and redirect to the Landing_Page
7. THE Auth_System SHALL hash passwords using bcryptjs with a minimum of 12 salt rounds
8. THE Auth_System SHALL store no plaintext passwords in the database or application logs
9. IF a user fails authentication 5 consecutive times for the same usuario, THEN THE Auth_System SHALL lock the account for 15 minutes and display a message indicating that the account has been temporarily locked
10. IF the Session_Cookie has expired or is invalid when accessing a private route, THEN THE Auth_System SHALL redirect the user to the Landing_Page and display the login modal

### Requirement 3: Sesiones y Protección de Rutas

**User Story:** Como administrador del sistema, quiero que las rutas privadas y APIs estén protegidas, para que solo usuarios autenticados accedan a funcionalidades restringidas.

#### Acceptance Criteria

1. WHEN a request with a missing, expired, or invalid Session_Cookie accesses a private route, THE Portal SHALL redirect to the Landing_Page
2. WHEN a request with a missing, expired, or invalid Session_Cookie accesses a protected API endpoint, THE Portal SHALL respond with HTTP status 401 and a JSON body containing an error message indicating authentication is required
3. THE Auth_System SHALL expose a GET /api/auth/me endpoint that returns the authenticated user's id, usuario, cargo, and estado fields extracted from the Session_Cookie
4. IF a request to GET /api/auth/me has a missing, expired, or invalid Session_Cookie, THEN THE Auth_System SHALL respond with HTTP status 401
5. THE Auth_System SHALL expose a POST /api/auth/login endpoint that accepts usuario, contraseña, and cargo
6. THE Auth_System SHALL expose a POST /api/auth/logout endpoint that clears the Session_Cookie
7. THE Portal SHALL store all secrets (database URL, cookie secret) in environment variables
8. THE Auth_System SHALL set the Session_Cookie with a maximum lifetime of 8 hours, after which the cookie SHALL expire and the user must re-authenticate

### Requirement 4: Dashboard Principal

**User Story:** Como usuario autenticado, quiero ver un dashboard con acceso a los módulos disponibles, para navegar a las funcionalidades del sistema.

#### Acceptance Criteria

1. WHEN the user is authenticated, THE Dashboard SHALL display the title "Gestor de estudiantes" and the subtitle "Programa de Ingeniería Industrial"
2. THE Dashboard SHALL display three cards: "Gestión salas virtuales" (functional, clickable), "Gestión salas docentes" (disabled, non-clickable, visually distinct with a "Próximamente" indicator), and "Gestión salas administrativas" (disabled, non-clickable, visually distinct with a "Próximamente" indicator)
3. THE Dashboard SHALL display a header with the UCC logo, authenticated user information (usuario and cargo), and a logout button
4. THE Dashboard SHALL display an "Administración de usuarios" button
5. WHEN the user clicks "Administración de usuarios", THE Dashboard SHALL navigate to the User_Admin module
6. WHEN the user clicks "Gestión salas virtuales", THE Dashboard SHALL open the student request form modal
7. IF the user clicks a disabled card ("Gestión salas docentes" or "Gestión salas administrativas"), THEN THE Dashboard SHALL display a message indicating "Módulo en construcción" without navigating

### Requirement 5: Formulario de Solicitud Estudiantil

**User Story:** Como usuario autenticado, quiero registrar solicitudes estudiantiles mediante un formulario dinámico con validaciones, para gestionar las peticiones de los estudiantes de Ingeniería Industrial.

#### Acceptance Criteria

1. WHEN the user initiates a new request, THE Student_Request_Form SHALL display a modal with Section 1 fields: fecha_solicitud (auto-generated in YYYY-MM-DD format, readonly), id_estudiante (numeric, max 10 digits), nombres (text, max 100 chars), apellidos (text, max 100 chars), correo (email format validation), celular (numeric, max 15 digits)
2. WHEN the modal is displayed, THE Student_Request_Form SHALL display Section 2 fields: programa (fixed value "Ingeniería industrial", readonly), modalidad (dropdown: Presencial, Virtual, Funza), tipo_solicitud (dropdown: Académico, Financiero, Certificados)
3. WHEN tipo_solicitud is "Académico", THE Student_Request_Form SHALL display a solicitud_academica dropdown with options: Validación, Inscripción de cursos, Actualización de nota, Campus virtual, Calificación, Nota, Homologación
4. WHEN tipo_solicitud is "Financiero", THE Student_Request_Form SHALL display a solicitud_financiera dropdown with options: Descuento, Saldo, Pago total, Pago parcial
5. WHEN tipo_solicitud is "Certificados", THE Student_Request_Form SHALL hide the conditional sub-type fields (solicitud_academica and solicitud_financiera)
6. THE Student_Request_Form SHALL display a descripcion_solicitud textarea with a maximum of 1200 characters and a live character counter showing remaining characters
7. THE Student_Request_Form SHALL display a requiere_escalar field (Si/No) and WHEN "Si" is selected, SHALL display an area_escalar dropdown with options: Financiera, Registro, Tesorería
8. WHEN a conditional field is not applicable due to tipo_solicitud selection or requiere_escalar being "No", THE Student_Request_Form SHALL save its value as null in the database
9. THE Student_Request_Form SHALL require all fields as mandatory except the conditional sub-type fields (solicitud_academica, solicitud_financiera, area_escalar) which are mandatory only when their parent condition is active
10. THE Student_Request_Form SHALL validate all inputs on both frontend (React Hook Form + Zod) and backend (Zod_Schema) before persisting, and IF any field fails validation, THEN THE Student_Request_Form SHALL display an inline error message below the invalid field indicating the validation rule that failed
11. WHEN the form is submitted, THE Student_Request_Form SHALL display a loading indicator and disable the submit button to prevent double submission
12. WHEN the form is successfully saved, THE Student_Request_Form SHALL insert the record into Neon_DB with the created_by_user_id set to the authenticated user, close the modal, and display a success notification for 5 seconds
13. IF the form submission fails due to a network or server error, THEN THE Student_Request_Form SHALL re-enable the submit button, hide the loading indicator, and display an error notification indicating the submission could not be completed

### Requirement 6: Administración de Usuarios

**User Story:** Como usuario autenticado, quiero gestionar los usuarios del sistema (crear, editar, desactivar, reactivar), para controlar el acceso al portal.

#### Acceptance Criteria

1. THE User_Admin SHALL display a paginated list of all users with columns: usuario, cargo, estado, created_at, last_login_at, with a default page size of 10 and options of 10, 25, and 50 records per page
2. THE User_Admin SHALL provide filters by usuario (text search, partial match), cargo (dropdown: Docente, Jefe, Administrativo), and estado (dropdown: Activo, Inactivo)
3. WHEN creating a new user, THE User_Admin SHALL require fields: usuario (unique, numeric, between 5 and 20 characters), password (minimum 8 characters, hashed with bcryptjs 12 rounds before storage), cargo (Docente/Jefe/Administrativo), estado (defaults to Activo)
4. WHEN editing a user, THE User_Admin SHALL allow modification of cargo and password fields; IF the password field is left empty during edit, THEN THE User_Admin SHALL preserve the existing password_hash unchanged
5. WHEN disabling a user, THE User_Admin SHALL display a confirmation dialog and upon confirmation set estado to "Inactivo" and record disabled_at timestamp
6. WHEN reactivating a user, THE User_Admin SHALL set estado to "Activo" and clear the disabled_at field
7. THE User_Admin SHALL record audit fields: created_by (set to authenticated user's id), updated_by (set to authenticated user's id on each modification), created_at, updated_at for every modification
8. IF a user attempts to create a new user with a usuario that already exists, THEN THE User_Admin SHALL display a descriptive error message indicating the usuario is already taken without creating the record
9. THE User_Admin SHALL expose API endpoints: GET /api/users (list with pagination and filters), POST /api/users (create), PATCH /api/users/[id] (edit), PATCH /api/users/[id]/status (activate/deactivate)
10. IF an API request targets a user id that does not exist, THEN THE User_Admin SHALL respond with HTTP status 404 and an error message indicating the user was not found

### Requirement 7: Visualización de Solicitudes Estudiantiles

**User Story:** Como usuario autenticado, quiero visualizar todas las solicitudes estudiantiles en una tabla con filtros y paginación, para consultar y dar seguimiento a las peticiones.

#### Acceptance Criteria

1. THE Request_Viewer SHALL display a table with columns: fecha_solicitud, id_estudiante, nombres, apellidos, correo, celular, programa, modalidad, tipo_solicitud, solicitud_academica, solicitud_financiera, descripcion_solicitud, requiere_escalar, area_escalar, usuario creador, cargo creador, created_at
2. THE Request_Viewer SHALL query data from Neon_DB via GET /api/student-requests on each page load and filter change without client-side caching
3. THE Request_Viewer SHALL provide filters: general text search (matching against nombres, apellidos, correo, id_estudiante, and descripcion_solicitud), date range (fecha_solicitud with start and end date selectors), id_estudiante (exact match), tipo_solicitud (dropdown), modalidad (dropdown), and area_escalar (dropdown)
4. THE Request_Viewer SHALL implement pagination with a default page size of 10 records and configurable options of 10, 25, and 50 records per page, displaying the current page number, total pages, and total record count
5. THE Request_Viewer SHALL implement column sorting (ascending and descending) with a default sort of created_at descending
6. WHEN no records match the applied filters, THE Request_Viewer SHALL display an empty state message indicating that no requests were found for the current filter criteria
7. WHILE data is loading, THE Request_Viewer SHALL display a loading skeleton or spinner
8. IF the GET /api/student-requests request fails, THEN THE Request_Viewer SHALL display an error message indicating that data could not be loaded and provide a retry option
9. WHEN a record has null values in conditional fields (solicitud_academica, solicitud_financiera, area_escalar), THE Request_Viewer SHALL display those cells as empty (blank) rather than showing "null" or "undefined" text

### Requirement 8: Exportación CSV

**User Story:** Como usuario autenticado, quiero exportar las solicitudes estudiantiles a un archivo CSV compatible con Excel, para analizar los datos externamente.

#### Acceptance Criteria

1. WHEN the user triggers the export, THE CSV_Exporter SHALL query all matching records in real-time from Neon_DB via GET /api/student-requests/export without using cached data
2. THE CSV_Exporter SHALL encode the file in UTF-8 with BOM (Byte Order Mark) for correct Excel rendering of special characters
3. THE CSV_Exporter SHALL use semicolon (;) as the field delimiter for compatibility with Excel regional settings that use comma as decimal separator
4. THE CSV_Exporter SHALL use Spanish column headers: ID registro, Fecha solicitud, ID estudiante, Nombres, Apellidos, Correo, Celular, Programa, Modalidad, Tipo solicitud, Solicitud académica, Solicitud financiera, Descripción solicitud, Requiere escalar, Área a escalar, Usuario creador, Cargo creador, Fecha creación, Fecha actualización
5. THE CSV_Exporter SHALL name the file following the pattern: gestion_estudiantes_salas_virtuales_YYYY-MM-DD_HH-mm.csv using the local time of the server
6. THE CSV_Exporter SHALL include the authenticated user data (usuario, cargo) of the creator for each record to guarantee traceability
7. THE CSV_Exporter SHALL apply the same filters active in the Request_Viewer at the time of export
8. IF no records match the current filters, THEN THE CSV_Exporter SHALL generate a CSV file containing only the header row
9. IF the export request fails due to a server or database error, THEN THE CSV_Exporter SHALL display an error notification to the user without downloading a file

### Requirement 9: Modelo de Datos - Users

**User Story:** Como desarrollador, quiero un modelo de datos robusto para usuarios con auditoría completa, para garantizar trazabilidad y seguridad.

#### Acceptance Criteria

1. THE Prisma SHALL define the users table with fields: id (UUID, primary key, auto-generated), usuario (unique string, max 20 characters), password_hash (string), cargo (enum: Docente, Jefe, Administrativo), estado (enum: Activo, Inactivo), created_at (timestamp, defaults to current time), updated_at (timestamp, auto-updated on modification), disabled_at (nullable timestamp), last_login_at (nullable timestamp), created_by (nullable UUID, self-referential foreign key to users.id), updated_by (nullable UUID, self-referential foreign key to users.id)
2. THE Neon_DB SHALL enforce a unique constraint on the usuario field
3. THE Portal SHALL seed an initial user with usuario "1129564302", password hashed from "Lifl172023Cf" using bcryptjs 12 rounds, cargo "Docente", estado "Activo", with created_by set to null (system-generated)
4. THE Portal SHALL perform no physical deletion of user records (soft delete via estado field only)

### Requirement 10: Modelo de Datos - Student Requests

**User Story:** Como desarrollador, quiero un modelo de datos completo para solicitudes estudiantiles con relación al usuario creador, para mantener integridad referencial y trazabilidad.

#### Acceptance Criteria

1. THE Prisma SHALL define the student_requests table with fields: id (UUID, primary key), fecha_solicitud (date), id_estudiante (string, max 10), nombres (string, max 100), apellidos (string, max 100), correo (string, max 100), celular (string, max 15), programa (string, max 50), modalidad (enum: Presencial, Virtual, Funza), tipo_solicitud (enum: Académico, Financiero, Certificados), solicitud_academica (nullable string, max 100), solicitud_financiera (nullable string, max 100), descripcion_solicitud (string, max 1200), requiere_escalar (boolean), area_escalar (nullable string, max 50), created_by_user_id (UUID, foreign key to users.id), created_at (timestamp, defaults to current time), updated_at (timestamp, auto-updated on modification), updated_by (nullable UUID, set to the authenticated user's id when the record is modified after creation)
2. THE Neon_DB SHALL enforce a foreign key constraint from student_requests.created_by_user_id to users.id with ON DELETE RESTRICT to prevent removal of users who have created requests
3. WHEN a valid POST request is received at /api/student-requests from an authenticated user, THE Portal SHALL validate the request body against the Zod_Schema, insert the record into Neon_DB with created_by_user_id set to the authenticated user's id, and return HTTP status 201 with the created record's id
4. IF the POST /api/student-requests request body fails Zod_Schema validation, THEN THE Portal SHALL return HTTP status 400 with an error message indicating which fields failed validation without persisting any data

### Requirement 11: Validación y Seguridad

**User Story:** Como administrador del sistema, quiero que todas las entradas sean validadas y que el sistema sea seguro contra ataques comunes, para proteger los datos de los estudiantes.

#### Acceptance Criteria

1. THE Portal SHALL validate all user inputs on both frontend (React Hook Form + Zod) and backend (Zod_Schema) before processing; IF frontend validation fails, THEN THE Portal SHALL display inline error messages below the invalid fields and prevent form submission
2. THE Portal SHALL use Prisma parameterized queries to prevent SQL injection attacks
3. THE Portal SHALL return appropriate HTTP status codes: 400 for validation errors (with field-level error details), 401 for unauthenticated requests, 403 for unauthorized access, 500 for server errors
4. IF a server error occurs, THEN THE Portal SHALL return a JSON response with a generic error message "Ha ocurrido un error interno. Intente nuevamente." without exposing internal stack traces, database details, or query information
5. THE Portal SHALL store all sensitive configuration (DATABASE_URL, JWT_SECRET) in environment variables listed in .env.example and excluded from version control via .gitignore
6. WHEN authentication succeeds, THE Auth_System SHALL update the last_login_at field in the users table to the current timestamp
7. THE Portal SHALL sanitize all user-provided string inputs by escaping HTML entities before rendering to prevent cross-site scripting (XSS) attacks

### Requirement 12: Diseño Visual e Interfaz

**User Story:** Como usuario del sistema, quiero una interfaz moderna con calidad premium y diseño institucional UCC, para tener una experiencia visual agradable y profesional.

#### Acceptance Criteria

1. THE Portal SHALL use the institutional UCC color palette: aguamarina, green, white, and gray as primary colors
2. THE Portal SHALL implement glassmorphism card styles with gradient borders and hover effects using Tailwind CSS
3. THE Portal SHALL animate page transitions and interactive elements using Framer Motion with durations between 150ms and 500ms
4. THE Portal SHALL be fully responsive with layouts for mobile (< 768px), tablet (768px-1024px), and desktop (> 1024px) viewports, ensuring no horizontal scrolling and all interactive elements remain reachable without content clipping at each breakpoint
5. THE Portal SHALL use shadcn/ui components as the base component library for consistent design patterns
6. THE Portal SHALL display a loading indicator for any asynchronous operation that exceeds 300ms, an empty state message when no data is available, and an error state with a description of the failure and a retry option when an operation fails
7. IF the user has enabled the prefers-reduced-motion accessibility setting, THEN THE Portal SHALL disable or replace animations with instant state changes while preserving all functionality

### Requirement 13: Arquitectura de Roles (Preparación)

**User Story:** Como desarrollador, quiero que la arquitectura de roles esté preparada para restricciones futuras, para facilitar la implementación de permisos granulares sin refactorización mayor.

#### Acceptance Criteria

1. THE Portal SHALL store the cargo field (Docente, Jefe, Administrativo) for each user in the database
2. THE Portal SHALL include the cargo value in the Session_Cookie payload for route-level access decisions
3. WHILE the environment variable ROLE_RESTRICTIONS_ENABLED is set to "false", THE Portal SHALL grant all authenticated users access to all modules regardless of cargo
4. THE Portal SHALL structure middleware that reads the cargo from the Session_Cookie and evaluates it against a permitted-roles list configured per route
5. IF ROLE_RESTRICTIONS_ENABLED is set to "true" and the user's cargo is not in the permitted-roles list for the requested route, THEN THE Portal SHALL respond with HTTP status 403 and a JSON body indicating insufficient permissions
