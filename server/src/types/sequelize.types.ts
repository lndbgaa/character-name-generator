import type { WhereOptions } from "sequelize";

/**
 * Extends Sequelize WhereOptions to allow operator symbols (e.g., Op.and, Op.or).
 */
export type FlexibleWhere<T> = WhereOptions<T> & { [key: symbol]: any };
