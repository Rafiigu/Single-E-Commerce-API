import { stat } from "fs";
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
