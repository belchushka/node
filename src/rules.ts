import { query } from "express-validator";
import { validateSchema } from "./middlewares";

const listUsersRules = [
    query('page').optional().isNumeric(),
    query('search').optional().isString(),
    validateSchema
  ];
  
export {
    listUsersRules
}