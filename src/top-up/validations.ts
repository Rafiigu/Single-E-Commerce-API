import { z } from "zod";

export const listTopUpsQuerySchema = z.object({
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
  status: z
    .enum(
      ["requested", "transferred", "cancelled", "approved", "rejected", "all"],
      {
        errorMap: () => {
          return {
            message:
              "Status harus antara requested atau transferred atau cancelled atau approved atau rejected atau all.",
          };
        },
      },
    )
    .default("all"),
});

export const createTopUpBodySchema = z.object({
  nominal: z.coerce
    .number({ required_error: "Nominal harus ada!" })
    .min(1000, { message: "Nominal Minimal 1.000 Rupiah!" }),
  paymentAccountId: z.string({
    required_error: "ID dari tipe pembayaran harus ada!",
  }),
});

export const transferProofBodySchema = z.object({
  transferProofFileName: z.string({
    required_error: "Nama file bukti transfer harus ada!",
  }),
});

export const idTopUpParamsSchema = z.object({
  id: z.string({ required_error: "ID wajib ada." }),
});
