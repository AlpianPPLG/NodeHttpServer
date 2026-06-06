/**
 * Swagger/API documentation routes
 */

import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swagger';
import { config } from '../config/env';

const router = Router();

if (config.swagger.enabled) {
  // Interactive Swagger UI
  router.use(
    config.swagger.path,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Velocity API Docs',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
      },
    })
  );

  // Raw OpenAPI JSON
  router.get(`${config.swagger.path}.json`, (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(swaggerSpec);
  });
}

export { router as swaggerRoutes };
