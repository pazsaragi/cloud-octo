import fastify, { FastifyInstance } from "fastify";
import { createBusiness } from "../services";
import { getBodyFromRequest, ifErrorFoundThrowError, notSuccessfulResponse } from "../utils";

export const businessRoutes = async (app: FastifyInstance) => {
    app.register(async function(businessRoutes){
        
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
                    properties: {
                      message: { type: "string" },
                    },
                  },
                },
              },
            },
            async (request, reply) => {
              try {
                const data = getBodyFromRequest(request);

                const response = await createBusiness(data);
                ifErrorFoundThrowError(response)

                return { message: "Successfully created!" };
              } catch (error) {
                return notSuccessfulResponse(reply)(error);
              }
            }
          );
    }, {
        prefix: '/business'
    })
}