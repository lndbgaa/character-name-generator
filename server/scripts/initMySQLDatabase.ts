import path from "path";
import { fileURLToPath } from "url";

import runSQLFile from "@/utils/run-sql-file.utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initDB = async (): Promise<void> => {
  const files = [
    path.resolve(__dirname, "../sql/init_schema.sql"),
    path.resolve(__dirname, "../sql/seeds/seed_roles.sql"),
    path.resolve(__dirname, "../sql/seeds/seed_universes.sql"),
    path.resolve(__dirname, "../sql/seeds/seed_types.sql"),
    path.resolve(__dirname, "../sql/seeds/seed_genders.sql"),
    path.resolve(__dirname, "../sql/seeds/seed_type_allowed_genders.sql"),
    path.resolve(__dirname, "../sql/seeds/seed_names.sql"),
  ];

  for (const file of files) {
    await runSQLFile(file);
  }

  console.log("✅ MySQL database initialized!");
};

initDB().catch((err) => {
  console.error("❌ Failed to initialized MySQL database! \n", err.message);
});
