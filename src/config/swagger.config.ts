import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "A2SV E-commerce Platform Backend API",
      version: "1.0.0",
      description:
        "Comprehensive REST API for managing products, users, and orders, implemented for the CoreDev Interview 2025.",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local Development Server",
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
