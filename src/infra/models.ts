export type UserRole = 'admin' | 'general';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  /** Só retornado pela API para admin; null quando ainda não foi cadastrado */
  value_hour?: number | null;
}

export interface CreateUserParameters {
  name: string;
  email: string;
  password: string;
}

export interface NamedResource {
  _id: string;
  name: string;
}

export type Service = NamedResource;
export type Company = NamedResource;

type Ref<T> = string | T;

export interface TimeEntry {
  _id: string;
  user: Ref<Pick<User, '_id' | 'name' | 'email' | 'value_hour'>>;
  company: Ref<NamedResource>;
  service: Ref<NamedResource>;
  /** "dd/MM/yyyy, HH:mm:ss" no fuso America/Sao_Paulo */
  clock_in: string;
  clock_out: string | null;
  /** "HH:MM" */
  total_hours: string | null;
  /** número serializado como string; só retornado pela API para admin */
  total_amount?: string | null;
  details: string | null;
  active: boolean;
}

export interface TimeEntryFilters {
  year: number;
  month: number;
  companyId?: string;
  /** Só aceito pela API para admin (usuários general); padrão: o próprio usuário */
  userId?: string;
}

export interface StartTimeEntryParameters {
  service: string;
  company: string;
  details?: string;
}
