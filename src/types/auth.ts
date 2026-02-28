export type UserRole = 'admin' | 'chairman' | 'co_chairman' | 'ug_coordinator' | 'class_advisor' | 'teacher' | 'student';

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