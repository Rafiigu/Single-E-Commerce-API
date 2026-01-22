import { z } from "zod";

export const mutateWishlistParamsSchema = z.object({
  productId: z.string({ required_error: "ID produk wajib ada." }),
});

export const listWishlistsQuerySchema = z.object({
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
    .default(1)
    .transform((v) => {
      if (v < 1) {
        return 1;
      }
      return v;
    }),
});
