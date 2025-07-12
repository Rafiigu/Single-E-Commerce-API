import { z } from "zod";

export const createAdminBodySchema = z.object({
  name: z
    .string({ required_error: "Nama tidak boleh kosong." })
    .min(3, "Nama lengkap minimal 3 karakter."),
  email: z.string().trim().email("Format email tidak benar."),
  role: z.enum(["admin", "staff"]),
});

export const updateAdminParamsSchema = z.object({
  id: z.string().uuid("ID tidak valid."),
});

export const updateAdminBodySchema = z.object({
  name: z
    .string({ required_error: "Nama tidak boleh kosong." })
    .min(3, "Nama lengkap minimal 3 karakter."),
  email: z.string().trim().email("Format email tidak benar."),
  role: z.enum(["admin", "staff"]),
});
