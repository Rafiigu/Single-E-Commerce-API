import { z } from "zod";

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
