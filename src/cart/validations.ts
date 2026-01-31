import { z } from "zod";

export const createCartBodySchema = z
  .object({
    productId: z.string({ required_error: "ID Produk wajib ada!" }),
    quantity: z.coerce
      .number()
      .min(1, { message: "Kuantitas minimal 1!" })
      .optional(),
    removeQuantity: z.coerce
      .number()
      .min(1, { message: "Kuantitas penghapusan minimal 1!" })
      .optional(),
  })
  .refine(
    (data) =>
      (data.quantity !== undefined && data.removeQuantity === undefined) ||
      (data.quantity === undefined && data.removeQuantity !== undefined),
    {
      message:
        "Harus mengirim quantity ATAU removeQuantity, tidak bisa keduanya atau tidak sama sekali",
      path: ["quantity"],
    },
  );

export const idCartParamsSchema = z.object({
  id: z.string({ required_error: "ID Cart Item wajib ada!" }),
});

export const listCartQuerySchema = z.object({
  mode: z
    .enum(["all", "pagination"], {
      errorMap: () => {
        return { message: "Mode list harus antara all dan pagination." };
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
});
