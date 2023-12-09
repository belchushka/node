import {NextFunction, Response, Request} from 'express';
import {validationResult} from 'express-validator';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) =>{
  console.log(error)
  return res.status(500).json({
    status: 'error',
  })
}


export const validateSchema = (req: Request, res: Response, next: NextFunction)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({
      errors: errors.array()
    })
  }
  next()
}
