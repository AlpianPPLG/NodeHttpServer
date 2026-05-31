import { Router } from 'express';

import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { config } from '../config/env';

const router = Router();

// Configure swagger-jsdoc (JSDoc annotations live in routes/controllers)
const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Velocity HTTP Server API',
      version: '1.0.0',
      description: 'REST API documentation for Velocity',
    },
    servers: [
      {
        url:
          config.server.env === 'production'
            ? 'https://api.velocity.dev/api/v1'
            : 'http://localhost:3000/api/v1',
        description: config.server.env,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['src/routes/**/*.ts', 'src/controllers/**/*.ts'],
});

// Swagger UI
router.use(config.swagger.path, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Swagger JSON
router.get(`${config.swagger.path}.json`, (_req, res) => {
  res.status(200).json(swaggerSpec);
});

export { router as swaggerRoutes };
