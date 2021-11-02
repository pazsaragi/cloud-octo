import { HTTPService } from "../shared/httpService";
import { CreateBusinessInput, GetBusinessInput } from "./inputs";

class BusinessService extends HTTPService {
  private _baseUrl: string;

  constructor() {
    super();
    this._baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/business`;
  }

  async createBusiness(data: CreateBusinessInput, token: string) {
    return await super.post(`${this._baseUrl}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(data),
    });
  }

  async getBusiness(data: GetBusinessInput, token: string) {
    return await super.get(`${this._baseUrl}/${data.pk}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
  }
}

export const businesService = new BusinessService();
