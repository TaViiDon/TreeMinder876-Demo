import z from "zod";

export const createMapSchema = z.object({
    name: z.string()
        .min(5, "Five (5) characters minimum")
        .max(32, "Thirty-two (32) characters maximum")
})