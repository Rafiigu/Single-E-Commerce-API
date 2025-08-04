import { z } from "zod";

export const idPaymentTermParamsSchema = z.object({
  id: z.string({ required_error: "ID wajib ada." }),
});

export const mutatePaymentTermBodySchema = z.object({
  name: z
    .string({
      required_error: "Nama ketentuan pembayaran tidak boleh kosong.",
    })
    .min(1, "Nama ketentuan pembayaran minimal 1 karakter"),
});

export const listPaymentTermsQuerySchema = z.object({
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
});
