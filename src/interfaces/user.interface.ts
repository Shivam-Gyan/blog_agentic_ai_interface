export interface User {
  id: string;
  email: string;
  name: string;
  profile_picture?: string;
  createdAt: string;
  isActive: boolean;
}

export interface UserState {
  user: User | null;
  jwtToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}
