import { z } from "zod";

export const idCategoryParamsSchema = z.object({
  id: z.string({ required_error: "ID wajib ada." }),
});

export const mutateCategoryBodySchema = z.object({
  name: z.string({ required_error: "Nama kategori harus ada." }),
});
