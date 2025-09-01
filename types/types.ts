export interface User {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  role_id?: string;
  project_id?: string;
  is_active?: boolean;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
  profile?: string;
  status?: string;
  roles?: {
    name: string;
  };
  projects?: {
    name: string;
  };
}

export enum UserRoles {
  ADMIN = "admin",
  MANAGER = "manager",
  USER = "user",
}
