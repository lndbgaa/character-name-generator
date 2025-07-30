import chalk from "chalk";
import dayjs from "dayjs";

import config from "@/config/app.config.js";
import logger from "@/utils/logger.js";

import type { ErrorDetails } from "@/types/error.d.ts";

interface LogErrorArgs {
  statusCode: number;
  statusText: string;
  message: string;
  details?: ErrorDetails;
  code?: string;
  stack?: string | null;
}

interface DevLogArgs {
  statusCode: number;
  statusText: string;
  message: string;
  details?: ErrorDetails;
  code?: string;
  stack: string;
  timestamp: string;
}

const { env } = config;
const isDev = env === "development";

const buildDevLog = ({
  statusCode,
  statusText,
  message,
  details,
  code,
  stack,
  timestamp,
}: DevLogArgs): string => {
  const lines: string[] = [];

  lines.push(chalk.bgRed.white.bold(`❌ ${statusCode} ${statusText} `));
  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  lines.push(`${chalk!.red("→")} ${chalk.bold("Timestamp")}: ${chalk.gray(timestamp)}`);
  lines.push(`${chalk!.red("→")} ${chalk.bold("Message")} : ${chalk.white(message)}`);

  if (code) {
    lines.push(`${chalk!.red("→")} ${chalk!.bold("Code:")} ${chalk!.cyan(code)}`);
  }

  if (details && Object.keys(details).length > 0) {
    lines.push(`${chalk!.red("→")} ${chalk!.bold("Details:")}`);
    for (const [key, value] of Object.entries(details)) {
      lines.push(`   - ${chalk!.magenta(key)}: ${chalk!.white(String(value))}`);
    }
  }

  if (stack.length > 0) {
    lines.push("━━━━━━━━━━━ Stack Trace ━━━━━━━━━━━");
    lines.push(stack);
  }

  return lines.join("\n");
};

const logError = (args: LogErrorArgs): void => {
  const { statusCode, statusText, message, details, code, stack = null } = args;

  const timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss");

  const formattedStack = stack
    ? stack
        .split("\n")
        .slice(1)
        .filter((line) => !line.includes("node_modules"))
        .map((line) => `    ${line.trim()}`)
        .join("\n")
    : "";

  if (isDev) {
    const devArgs: DevLogArgs = {
      statusCode,
      statusText,
      message,
      details,
      code,
      stack: formattedStack,
      timestamp,
    };

    console.error(buildDevLog(devArgs));
  } else {
    logger.error(`${statusCode} ${statusText} - ${message}`, {
      timestamp,
      code,
      details,
      stack: formattedStack,
    });
  }
};

export default logError;
