export interface RegisterUserInput {
  password: string;
  roles: string[];
  email: string;
}

export interface LoginUserInput {
  password: string;
  email: string;
}
