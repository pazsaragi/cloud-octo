import create from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "../auth/auth-store";
import { CreateBusinessInput, GetBusinessInput } from "./inputs";
import { businesService } from "./service";

type BusinessStore = {
  business: any | null;
  business_id: string | null;
  createBusiness: (data: CreateBusinessInput, token: string) => Promise<void>;
  getBusiness: (token: string) => Promise<any>;
};

export const useBusinessStore = create<BusinessStore>(
  persist(
    (set, get) => ({
      business: null,
      business_id: null,
      createBusiness: async (data, token) => {
        await businesService.createBusiness(data, token);
        set((state) => ({
          ...state,
          business_id: data.pk,
        }));
        return;
      },
      getBusiness: async (token) => {
        const pk = get().business_id;
        if (!pk) return;
        const response = await businesService.getBusiness({ pk }, token);
        set((state) => ({
          ...state,
          business: response,
        }));
        return response;
      },
    }),
    {
      name: "business-storage",
    }
  )
);
