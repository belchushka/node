import {NextFunction, Response, Request} from 'express';

export const createRouteHandler = (handler: any)=>{
  return async (req: Request, res: Response, next: NextFunction)=>{
    try {
      await handler(req, res)
    }catch (error) {
      return next(error)
    }
  }
}
