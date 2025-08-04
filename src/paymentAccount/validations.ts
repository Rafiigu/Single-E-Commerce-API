import { z } from "zod";

export const listPaymentAccountsQuerySchema = z.object({
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
  paymentTermId: z.string().optional().default("all"),
});

export const idPaymentAccountParamsSchema = z.object({
  id: z.string({ required_error: "ID wajib ada." }),
});

export const mutatePaymentAccountBodySchema = z.object({
  paymentTermId: z.string({ required_error: "ID wajib ada." }),
  accountHolderName: z.string({
    required_error: "Nama pemilik akun harus ada.",
  }),
  accountNumber: z.string({ required_error: "Nomor rekening wajib ada." }),
});
