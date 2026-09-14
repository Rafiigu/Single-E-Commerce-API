import { z } from "zod";

export const listTransactionsQuerySchema = z.object({
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
    .enum(["requested", "in process", "cancelled", "delivered", "all"], {
      errorMap: () => {
        return {
          message:
            "Status harus antara requested atau in process atau cancelled atau delivered atau all.",
        };
      },
    })
    .default("all"),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const createTransactionBodySchema = z.object({
  total: z
    .number({
      required_error: "Total harga harus ada!",
    })
    .min(1000, {
      message: "Total harga harus lebih dari 1000!",
    }),
  receiverName: z.string({
    required_error: "Nama penerima wajib ada.",
  }),
  receiverPhoneNumber: z.string({
    required_error: "Nomor telepon penerima wajib ada.",
  }),
  receiverAddress: z.string({
    required_error: "Alamat penerima wajib ada.",
  }),
});

export const idTransactionParamsSchema = z.object({
  id: z.string({ required_error: "ID wajib ada." }),
});

export const cancelTransactionBodySchema = z.object({
  cancellationReason: z.string({
    required_error: "Alasan pembatalan wajib ada.",
  }),
});

export const deliverTransactionBodySchema = z.object({
  logisticVendorId: z.string({
    required_error: "Kode vendor logistik wajib ada.",
  }),
});
