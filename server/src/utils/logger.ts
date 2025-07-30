import { createLogger, format, transports } from "winston";

const { combine, timestamp, label, printf, uncolorize } = format;

const logFormat = printf(({ level, message, label, timestamp, stack, code, details }) => {
  let base = `${timestamp} [${label}] ${level}: ${message}`;

  if (code) {
    base += ` | Code: ${code}`;
  }

  if (details && typeof details === "object" && Object.keys(details).length > 0) {
    base += ` | Details: ${JSON.stringify(details)}`;
  }

  if (stack) {
    base += `\n${stack}`;
  }

  return base;
});

const logger = createLogger({
  level: "info",
  format: combine(
    label({ label: "App" }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    uncolorize(),
    logFormat
  ),
  transports: [new transports.Console()],
});

export default logger;
