import { z } from "zod";

export const listAdminsQuerySchema = z.object({
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
});

export const mutateAdminBodySchema = z.object({
  name: z
    .string({ required_error: "Nama tidak boleh kosong." })
    .min(3, "Nama lengkap minimal 3 karakter."),
  email: z.string().trim().email("Format email tidak benar."),
  role: z.enum(["admin", "staff"], {
    errorMap: (issue) => {
      if (issue.code === "invalid_enum_value") {
        return {
          message: "Role harus antara admin atau staff.",
        };
      }
      return {
        message: "Role tidak boleh kosong.",
      };
    },
  }),
});

export const idAdminParamsSchema = z.object({
  id: z.string({
    required_error: "ID wajib ada.",
  }),
});
