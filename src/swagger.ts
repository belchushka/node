import { Options } from 'swagger-jsdoc';

/**
 * @openapi
 * components:
 *   entities:
 *      User:
 *          required:
 *            - id
 *            - role
 *            - created_at
 *          properties: 
 *            id:
 *                type: string
 *            email:
 *                type: string
 *            tg_id:
 *                type: string
 *            name:
 *                type: string
 *            avatar:
 *                type: string
 *            role:
 *                type: string
 *                enum: [ADMIN, USER]
 *            created_at:
 *                type: string
 *                format: date
 */


/**
 * @openapi
 * components:
 *   entities:
 *      Transaction:
 *          required:
 *            - id
 *            - provider
 *            - amount
 *            - currency
 *            - status
 *            - type
 *            - created_at
 *          properties: 
 *            id:
 *                type: string
 *            provider:
 *                type: string
 *                enum: [YOOMONEY, CRYPTO, SYSTEM]
 *            currency:
 *                type: string
 *                enum: [RUB, USD, EUR, SYSTEM_TOKEN]
 *            meta:
 *                type: object
 *            amount:
 *                type: number
 *            status:
 *                type: string
 *                enum: [FAILED, SUCCEDED, PENDING]
 *            type:
 *                type: string
 *                enum: [SUBSCRIPTION, WRITE_OFF, REPLENISH, WITHDRAW]
 *            plan_id:
 *                type: string
 *            user_id:
 *                type: string
 *            referral_id:
 *                type: string
 *            external_id:
 *                type: string
 *            created_at:
 *                type: string
 *                format: date
 */

export const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BIT API',
      version: '1.0.0',
    },
    servers: [{ url: '/api/v1' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
  },
  apis: ['./src/**/*.ts'],
};