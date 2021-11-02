import { HTTPService } from "../shared/httpService";
import { LoginUserInput, RegisterUserInput } from "./inputs";

class AuthService extends HTTPService {
  private _baseUrl: string;

  constructor() {
    super();
    this._baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}`;
  }

  async register(data: RegisterUserInput) {
    return await super.post(`${this._baseUrl}/register`, {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginUserInput) {
    return await super.post(`${this._baseUrl}/login`, {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }
}

export const authService = new AuthService();
