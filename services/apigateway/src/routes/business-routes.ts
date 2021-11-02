import fastify, { FastifyInstance } from "fastify";
import { createBusiness, getBusiness } from "../services";
import {
  getBodyFromRequest,
  getParamsFromRequest,
  ifErrorFoundThrowError,
  notSuccessfulResponse,
} from "../utils";

export const businessRoutes = async (app: FastifyInstance) => {
  app.register(
    async function (businessRoutes) {
      businessRoutes.post(
        "/",
        {
          schema: {
            body: {
              type: "object",
              required: ["pk"],
              properties: {
                pk: { type: "string" },
              },
            },
            response: {
              200: {
                type: "object",
              },
            },
          },
        },
        async (request, reply) => {
          try {
            const data = getBodyFromRequest(request);

            const response = await createBusiness(data);
            ifErrorFoundThrowError(response);

            return { message: "Successfully created!" };
          } catch (error) {
            return notSuccessfulResponse(reply)(error);
          }
        }
      );

      businessRoutes.get("/:business_id", {}, async (request, reply) => {
        try {
          const data = getParamsFromRequest(request);
          const response = await getBusiness(data.business_id);
          ifErrorFoundThrowError(response);

          return { data: response };
        } catch (error) {
          return notSuccessfulResponse(reply)(error);
        }
      });
    },
    {
      prefix: "/business",
    }
  );
};
