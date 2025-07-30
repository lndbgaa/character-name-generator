import mongoose from "mongoose";

import config from "@/config/app.config.js";

import type { MongoDBConfig } from "@/types/config.js";

const { mongo }: { mongo: MongoDBConfig } = config;
const { uri, database } = mongo;

const connectMongo = async (): Promise<void> => {
  try {
    await mongoose.connect(uri, {
      dbName: database,
    });
    console.log("✅ MongoDB: Connection successful");
  } catch (err) {
    console.error("❌ MongoDB error:", err);
    throw new Error(`❌ Failed to connect to MongoDB: ${(err as Error).message}`);
  }
};

export default connectMongo;
