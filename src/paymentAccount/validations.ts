import { z } from "zod";

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
