// Enums (mirror Prisma enums for frontend use)
export type Cargo = 'Profesor' | 'Jefe' | 'Administrativo';
export type Estado = 'Activo' | 'Inactivo';
export type Modalidad = 'Presencial' | 'Virtual' | 'Funza';
export type TipoSolicitud = 'Académico' | 'Financiero' | 'Certificados';

export interface JWTPayload {
  id: string;
  usuario: string;
  cargo: Cargo;
  programa_id?: string;
  programa_codigo?: string;
  iat: number;
  exp: number;
}

export interface LoginRequest {
  usuario: string;
  contrasena: string;
  cargo: Cargo;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalRecords: number;
  };
}

export interface CreateUserRequest {
  usuario: string;
  password: string;
  cargo: Cargo;
  estado?: Estado;
}

export interface UpdateUserRequest {
  cargo?: Cargo;
  password?: string;
}

export interface CreateStudentRequestBody {
  fecha_solicitud: string;
  id_estudiante: string;
  nombres: string;
  apellidos: string;
  correo: string;
  celular: string;
  programa: string;
  modalidad: Modalidad;
  tipo_solicitud: TipoSolicitud;
  solicitud_academica?: string | null;
  solicitud_financiera?: string | null;
  descripcion_solicitud: string;
  requiere_escalar: boolean;
  area_escalar?: string | null;
}

export interface StudentRequestsQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  idEstudiante?: string;
  tipoSolicitud?: TipoSolicitud;
  modalidad?: Modalidad;
  areaEscalar?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UsersQueryParams {
  page?: number;
  pageSize?: number;
  usuario?: string;
  cargo?: Cargo;
  estado?: Estado;
}
