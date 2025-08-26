import { GENDERS_DISPLAY, GENDERS_ID, GENDERS_LABEL } from "@/constants/gender.constants.js";

/* ===========================
 *    Constants-based Types
 * =========================== */

export type GenderId = (typeof GENDERS_ID)[keyof typeof GENDERS_ID];
export type GenderLabel = (typeof GENDERS_LABEL)[keyof typeof GENDERS_LABEL];
export type GenderDisplay = (typeof GENDERS_DISPLAY)[keyof typeof GENDERS_DISPLAY];
