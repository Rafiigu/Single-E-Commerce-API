import { z } from "zod";

export const idProductParamsSchema = z.object({
  id: z.string({ required_error: "ID wajib ada." }),
});
