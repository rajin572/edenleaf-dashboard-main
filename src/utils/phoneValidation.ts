import { z } from "zod";

/** Matches the backend's Bangladesh mobile regex exactly (see auth.validation.ts, staff.validation.ts, etc). */
export const BD_PHONE_REGEX = /^(?:\+?88)?01[3-9]\d{8}$/;

export const BD_PHONE_ERROR = "Use a valid Bangladesh mobile number (e.g. 017XXXXXXXX)";

/** Required BD phone field for react-hook-form + zodResolver forms. */
export const bdPhoneSchema = z.string().trim().regex(BD_PHONE_REGEX, BD_PHONE_ERROR);

/** Optional BD phone field — empty string passes, anything non-empty must match. */
export const bdPhoneOptionalSchema = z
  .union([z.literal(""), bdPhoneSchema])
  .optional();
