export interface User {
  _id: string;
  fullName: string;
  dateOfBirth: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  status: string;
  data: {
    user: User;
    token: string;
  };
}

export interface RegisterResponse {
  status: string;
  data: {
    user: User;
    token: string;
  };
}

export interface UsersResponse {
  status: string;
  data: User[];
}

export interface UserResponse {
  status: string;
  data: User;
}

