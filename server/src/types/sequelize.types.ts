import type { WhereOptions } from "sequelize";

export type FlexibleWhere<T> = WhereOptions<T> & { [key: symbol]: any };
