import { z } from "zod";

export const listUsersQuerySchema = z.object({
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
    .enum(["blocked", "verified", "not-verified" ,"all"], {
      errorMap: () => {
        return {
          message: "Status harus antara blocked, verified, not-verified atau all.",
        };
      },
    })
    .default("all"),
});

export const idUserParamsSchema = z.object({
  id: z.string({
    required_error: "ID wajib ada.",
  }),
});
