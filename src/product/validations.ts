import { z } from "zod";

export const idProductParamsSchema = z.object({
  id: z.string({ required_error: "ID wajib ada." }),
});

export const listProductsQuerySchema = z.object({
  categoryId: z.string().optional(),
});

export const mutateProductBodySchema = z.object({
  name: z
    .string({ required_error: "Nama produk tidak boleh kosong." })
    .min(3, "Nama produk minimal 3 karakter."),
  price: z.number().nonnegative(),
  categoryId: z.string({ required_error: "ID wajib ada." }),
  description: z.string().optional().default(""),
});
