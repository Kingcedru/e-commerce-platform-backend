import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-commerce Platform Backend API",
      version: "1.0.0",
      description:
        "Comprehensive REST API for an e-commerce platform, enabling product management, user authentication, and order processing.",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter the JWT token obtained after successful login.",
        },
      },
      schemas: {
        BaseResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            object: { type: "object", nullable: true },
            errors: {
              type: "array",
              items: { type: "string" },
              nullable: true,
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
