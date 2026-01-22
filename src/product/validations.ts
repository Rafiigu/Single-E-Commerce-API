import { z } from "zod";

export const listProductsQuerySchema = z.object({
  mode: z
    .enum(["all", "pagination"], {
      errorMap: () => {
        return {
          message: "Mode harus antara all atau pagination",
        };
      },
    })
    .default("pagination"),
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
  status: z
    .enum(["active", "inactive", "all"], {
      errorMap: () => {
        return {
          message: "Status harus antara active atau inactive atau all.",
        };
      },
    })
    .default("all"),
  categoryId: z.string().optional().default("all"),
});

export const idProductParamsSchema = z.object({
  id: z.string({ required_error: "ID wajib ada." }),
});

export const imageProductParamsSchema = z.object({
  filename: z.string({ required_error: "Nama file wajib ada." }),
});

export const imagesProductDeleteBodySchema = z.object({
  fileNames: z.array(z.string()).optional(),
});

export const mutateProductBodySchema = z.object({
  name: z
    .string({ required_error: "Nama produk tidak boleh kosong." })
    .min(3, "Nama produk minimal 3 karakter."),
  price: z
    .number({ required_error: "Harga tidak boleh kosong." })
    .positive("Harga harus lebih besar dari 0."),
  categoryId: z
    .string({ required_error: "ID wajib ada." })
    .min(1, "Kategori tidak boleh kosong."),
  description: z.string().optional().default(""),
  fileNames: z
    .array(
      z.object({
        imageFileName: z
          .string()
          .min(1, "Nama file gambar tidak boleh kosong."),
      })
    )
    .optional(),
});

export const createProductBodySchema = mutateProductBodySchema;

export const updateProductBodySchema = mutateProductBodySchema.extend({
  deletedFileNames: z.array(z.string()).optional(),
});

// createProductStockMutationBodySchema
// { quantity, type, notes }
// quantity: wajib dan positive,
// type: 'in', 'out'
// notes: optional

export const createProductStockMutationBodySchema = z.object({
  quantity: z.number().nonnegative(),
  type: z.enum(["in", "out"], {
    errorMap: (issue) => {
      if (issue.code === "invalid_enum_value") {
        return {
          message: "Type harus antara in atau out.",
        };
      }
      return {
        message: "Type tidak boleh kosong.",
      };
    },
  }),
  notes: z.string().optional(),
});
