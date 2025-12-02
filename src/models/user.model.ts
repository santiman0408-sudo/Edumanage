export enum UserRole {
  Admin = 'admin',
  Professor = 'professor',
  Student = 'student'
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface DecodedToken {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}
