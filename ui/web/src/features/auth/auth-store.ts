import create from "zustand";
import { GenericError } from "../shared/errors";
import { GenericRegisterError } from "./errors";
import { persist } from "zustand/middleware";
import { LoginUserInput, RegisterUserInput } from "./inputs";
import { ErrorMessageType } from "../../../types/errors";
import { authService } from "./service";

type AuthStore = {
  user: any | null;
  token: string | null;
  register: (
    data: RegisterUserInput
  ) => Promise<[string | null, ErrorMessageType | null]>;
  login: (data: LoginUserInput) => Promise<ErrorMessageType | null>;
};

export const useAuthStore = create<AuthStore>(
  persist(
    (set) => ({
      user: null,
      token: null,
      register: async (data: RegisterUserInput) => {
        try {
          const user = await authService.register(data);

          set((state) => ({
            ...state,
            user,
          }));

          return [user, null];
        } catch (error) {
          console.error(error);
          return [null, GenericRegisterError];
        }
      },
      login: async (data: LoginUserInput) => {
        try {
          const response = await authService.login(data);

          set((state) => ({
            ...state,
            isAuthenticated: true,
            token: response.data.accessToken,
          }));

          return null;
        } catch (error: any) {
          console.error(error);

          set((state) => ({
            ...state,
            isAuthenticated: false,
            token: "",
          }));

          return error;
        }
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
