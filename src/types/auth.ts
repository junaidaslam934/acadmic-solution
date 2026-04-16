export type UserRole = 'student' | 'teacher' | 'class-advisor' | 'admin';

export interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  employeeId?: string;
  studentId?: string;
  section?: string;
  semester?: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}