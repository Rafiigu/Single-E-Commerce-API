import { z } from "zod";

export const loginBodySchema = z.object({
  email: z.string().trim().email("Format email tidak benar."),
  password: z.string(),
});
