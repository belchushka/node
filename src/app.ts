import { Currency, Prisma, PrismaClient, TransactionProvider, TransactionStatus, TransactionType } from "@prisma/client"
import Express, { Request, Response } from "express"
import cors from 'cors';
import { errorHandler } from "./middlewares";
import { createRouteHandler } from "./routeHandler";
import { listUsersRules } from "./rules";
import cron from 'node-cron';
import swaggerJSDoc from "swagger-jsdoc";
import { options } from "./swagger";
import swaggerUI from 'swagger-ui-express'

async function run() {
    const prisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL as string
          },
        },
    })

    const app = Express()

    app.use(cors())
    app.use(Express.json())

    const root = Express.Router()

    /**
     * @openapi
     * /user/list:
     *   get:
     *     tags: [User]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: page
     *         in: query
     *         type: number
     *       - name: search
     *         in: query
     *         type: string
     *       - name: orderBy
     *         schema:
     *          type: string
     *          enum: ['tokens:asc', 'tokens:desc']
     *         in: query
     *         type: string
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                    properties:
     *                        data: 
     *                          type: array
     *                          items:
     *                             $ref: '#/components/entities/User'
     *                        pages:
     *                          type: number
     */

    root.get('/user/list', listUsersRules, createRouteHandler(async (req: Request, res: Response)=>{
        const page = req.query.page as any as number
        const search  = req.query.search as any as string || ""
        let orderBy: string | null = null
        let sortDirection: Prisma.SortOrder | null = null

        if (typeof req.query.orderBy == "string") {
          const direction = req.query.orderBy.split(":")

          orderBy = direction[0]

          if (direction[1] === 'asc' || direction[1] === 'desc'){
            sortDirection = direction[1] === 'asc' ? Prisma.SortOrder.asc : Prisma.SortOrder.desc
          }
        }

        if (typeof page != 'undefined' && page < 1) {
          res.status(200).json({
            data: [],
            pages: 0
          })
          return
        }

          const query = {
            where: {
                OR: [
                    {
                      name: {
                        contains: search,
                        mode: Prisma.QueryMode.insensitive
                      }
                    },
                    {
                      email: {
                        contains: search,
                        mode: Prisma.QueryMode.insensitive
                      }
                    },
                    {
                      tg_id: {
                        contains: search,
                        mode: Prisma.QueryMode.insensitive
                      }
                    }
                  ]
            },
            orderBy:{
              ...(orderBy === 'tokens' && sortDirection != null && {
                subscription: {
                  tokens: sortDirection
                }
              })
            },
            include: {
              subscription: {
                include: {
                  plan: true
                }
              }
            }
          }

          const data = await prisma.user.findMany({
            ...query,
            ...(page && {skip: (page - 1) * 20}),
            ...(page && {take: 20})
          })
      
          const pages = page ? Math.ceil((await prisma.user.count({
            where: query.where
          })) / 20) : 1

          res.status(200).json({
            data,
            pages
          })

          return
    }))

    /**
     * @openapi
     * /user/{id}/transactions:
     *   get:
     *     tags: [Transaction]
     *     description: Last 24h transactions
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                           type: array
     *                           items:
     *                              $ref: '#/components/entities/Transaction'
     */

    root.get('/user/:id/transactions', createRouteHandler(async (req: Request, res: Response)=>{
      const now = new Date()

      const start = new Date(now.getTime() - (24 * 60 * 60 * 1000))

      const trans = await prisma.transaction.findMany({
        where: {
          user_id: req.params.id,
          created_at: {
            gte: start,
            lte: now
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      })

      res.status(200).json(trans)
      return
    }))

    const openapiSpecification = swaggerJSDoc(options);

    root.use('/swagger', swaggerUI.serve, swaggerUI.setup(openapiSpecification))

    root.use(errorHandler)

    app.use('/api/v1', root)

    app.listen(8000, '0.0.0.0')
}

run()
