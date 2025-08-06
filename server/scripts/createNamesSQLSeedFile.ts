import { readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuid } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, "../data/names");
const outputFile = path.join(__dirname, "../sql/seeds/seed_names.sql");

const typeMap = {
  elf: 1,
  human: 2,
  dragon: 3,
  orc: 4,
  fairy: 5,
  angel: 6,
  vampire: 7,
  demon: 8,
  wizard: 9,
  witch: 10,
  siren: 11,
  goblin: 12,
  harpy: 13,
  werewolf: 14,
  pirate: 15,
} as const;

const genderMap = {
  male: 1,
  female: 2,
  neutral: 3,
} as const;

type TypeKey = keyof typeof typeMap;
type GenreKey = keyof typeof genderMap;

// Recursively retrieves all .json file paths from a directory and its subdirectories
function getAllJsonFiles(dir: string): string[] {
  let files = [];

  for (const item of readdirSync(dir)) {
    const fullPath = path.join(dir, item);

    if (statSync(fullPath).isDirectory()) {
      files.push(...getAllJsonFiles(fullPath));
    } else if (item.endsWith(".json")) {
      files.push(fullPath);
    }
  }

  return files;
}

// Extracts the name type (e.g., "elf", "dragon") from the filename (e.g., "elf_names.json" → "elf")
function getTypeFromFileName(filePath: string) {
  const base = path.basename(filePath, ".json"); // ex: dragon_names
  const match = base.match(/^(.*?)_names$/); // extract "dragon"
  return match ? match[1].toLowerCase() : "unknown";
}

// Main function that reads all JSON files, transforms the data, and generates an SQL INSERT script
function generateSeedSQL() {
  const files = getAllJsonFiles(inputDir);

  let inserts = [`INSERT INTO names (id, label, type_id, gender_id, length) VALUES`];

  const validGenders = ["male", "female", "neutral"];

  for (const file of files) {
    const typeKey = getTypeFromFileName(file);

    if (typeKey === "unknown") continue;

    const typeId = typeMap[typeKey as TypeKey];

    if (!typeId) {
      console.warn(`⚠️ Type non reconnu : ${typeKey} pour le fichier ${file}`);
      continue;
    }

    const raw = readFileSync(file, "utf-8");
    const entries = JSON.parse(raw);

    for (const { name, gender } of entries) {
      if (typeof name !== "string" || typeof gender !== "string" || name.trim() === "" || gender.trim() === "") {
        continue;
      }

      const genderLower = gender.toLowerCase();
      if (!validGenders.includes(genderLower)) continue;

      const id = uuid();
      const safeLabel = name.replace(/'/g, "''");
      const genderId = genderMap[genderLower as GenreKey];
      const length = safeLabel.length >= 9 ? "long" : safeLabel.length >= 6 ? "medium" : "short";

      inserts.push(`  ('${id}', '${safeLabel}', ${typeId}, ${genderId}, '${length}'),`);
    }
  }

  // Replace the last comma with a semicolon to end the SQL statement
  inserts[inserts.length - 1] = inserts[inserts.length - 1].replace(/,$/, ";");

  writeFileSync(outputFile, inserts.join("\n"), "utf-8");
  console.log(`✅ Fichier SQL généré avec succès dans :\n${outputFile}`);
}

generateSeedSQL();
