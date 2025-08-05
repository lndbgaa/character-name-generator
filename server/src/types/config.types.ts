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
