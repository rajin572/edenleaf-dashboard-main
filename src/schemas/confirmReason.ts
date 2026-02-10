import z from "zod";

// Every backend note/reason field this feeds (order status notes, review
// moderation notes, blocked-contact reasons, finance notes) is validated
// server-side as `min(2).max(500)` — mirror that here so a too-short reason
// gets a clear inline error instead of passing client-side and bouncing off
// a raw backend Zod message later.
export const confirmReasonSchema = (label = "Reason", required = true) =>
    z.object({
        reason: required
            ? z.string().trim().min(2, `${label} must be at least 2 characters`).max(500, `${label} must be 500 characters or fewer`)
            : z.string().trim().max(500, `${label} must be 500 characters or fewer`).refine(
                (value) => value.length === 0 || value.length >= 2,
                { message: `${label} must be at least 2 characters, or left blank` }
            ).default(""),
    });

export type ConfirmReasonFormValues = z.infer<ReturnType<typeof confirmReasonSchema>>;
