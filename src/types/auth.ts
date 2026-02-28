export type UserRole = 'student' | 'staff' | 'class-advisor' | 'coordinator' | 'admin';

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
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}