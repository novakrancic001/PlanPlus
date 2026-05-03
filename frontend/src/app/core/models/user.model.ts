export type Role = 'ADMIN' | 'PLANNER' | 'OPERATOR';

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  role: Role;
  active: boolean;
  createdAt: string;
}
