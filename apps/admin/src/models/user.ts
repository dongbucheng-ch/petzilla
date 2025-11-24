export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  status: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  status?: number;
}
