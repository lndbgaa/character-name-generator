import ejs from "ejs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Renders an EJS email template with provided data.
 *
 * @param {string} template - Template file name.
 * @param {Record<string, unknown>} data - Variables passed to the template.
 * @returns {Promise<string>} Rendered HTML string.
 */
async function renderTemplate(template: string, data: Record<string, unknown>): Promise<string> {
  const templatePath = path.join(__dirname, "..", "templates", "emails", template);
  return await ejs.renderFile(templatePath, data);
}

export default renderTemplate;
