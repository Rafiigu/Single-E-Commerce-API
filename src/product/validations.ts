import { z } from "zod";

export const listProductsQuerySchema = z.object({
  mode: z.enum(["all", "pagination"]).default("pagination"),
  page: z.coerce
    .number()
    .default(1)
    .transform((v) => {
      if (v < 1) {
        return 1;
      }

      return v;
    }),
  size: z.coerce
    .number()
    .default(10)
    .transform((v) => {
      if (v < 1) {
        return 1;
      }

      return v;
    }),
  search: z.string().optional(),
  status: z.enum(["active", "inactive", "all"]).default("all"),
  categoryId: z.string().optional().default("all"),
});

export const idProductParamsSchema = z.object({
  id: z.string({ required_error: "ID wajib ada." }),
});

export const imageProductParamsSchema = z.object({
  filename: z.string({ required_error: "Nama file wajib ada." }),
});

export const mutateProductBodySchema = z.object({
  name: z
    .string({ required_error: "Nama produk tidak boleh kosong." })
    .min(3, "Nama produk minimal 3 karakter."),
  price: z.number().nonnegative(),
  categoryId: z.string({ required_error: "ID wajib ada." }),
  description: z.string().optional().default(""),
  fileName: z.string({ required_error: "Gambar produk tidak boleh kosong." }),
});

// createProductStockMutationBodySchema
// { quantity, type, notes }
// quantity: wajib dan positive,
// type: 'in', 'out'
// notes: optional

export const createProductStockMutationBodySchema = z.object({
  quantity: z.number().nonnegative(),
  type: z.enum(["in", "out"]),
  notes: z.string().optional(),
});
