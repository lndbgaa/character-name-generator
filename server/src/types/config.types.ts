import type { Request } from "express";

export interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export interface MySQLConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface MongoDBConfig {
  uri: string;
  database: string;
}
