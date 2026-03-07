export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface UserState {
  user: User | null;
  jwtToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}
